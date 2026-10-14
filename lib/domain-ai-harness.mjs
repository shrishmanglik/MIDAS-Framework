const MAX_FACTSHEET_UTF8_BYTES = 3000;

const FORBIDDEN_ENTERPRISE_JARGON = Object.freeze([
  'enterprise-grade',
  'enterprise scale',
  'fortune 500',
  'b2b enterprise',
  'synergy',
  'synergistic',
  'leverage',
  'unlock',
  'ai-powered',
  'seamless',
  'seamlessly',
  'game-changing',
  'revolutionary',
  'cutting-edge',
  'next-gen',
  'paradigm shift',
  'stakeholder alignment',
  'digital transformation',
  'mission-critical enterprise'
]);

function normalizeCitationEntry(entry) {
  if (typeof entry === 'string') {
    const trimmed = entry.trim();
    return { id: trimmed, label: trimmed };
  }
  if (entry && typeof entry === 'object') {
    const id = String(entry.id || entry.source || entry.label || '').trim();
    const label = String(entry.label || entry.source || entry.id || '').trim();
    return { id, label };
  }
  return { id: '', label: '' };
}

function collectAllowedNumbers(value, set = new Set()) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    set.add(String(value));
    return set;
  }
  if (typeof value === 'string') {
    const matches = value.match(/\b\d+(?:\.\d+)?\b/g) || [];
    for (const m of matches) set.add(m);
    return set;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectAllowedNumbers(item, set);
    return set;
  }
  if (value && typeof value === 'object') {
    for (const v of Object.values(value)) collectAllowedNumbers(v, set);
    return set;
  }
  return set;
}

export function verifyFactSheetSize(factSheet, { maxBytes = MAX_FACTSHEET_UTF8_BYTES } = {}) {
  const failures = [];
  let parsed = factSheet;
  let serialized = '';

  if (typeof factSheet === 'string') {
    serialized = factSheet;
    try {
      parsed = JSON.parse(factSheet);
    } catch {
      failures.push({
        code: 'FACTSHEET_INVALID_JSON',
        message: 'FactSheet string is not valid JSON.'
      });
    }
  } else if (factSheet && typeof factSheet === 'object' && !Array.isArray(factSheet)) {
    serialized = JSON.stringify(factSheet);
  } else {
    failures.push({
      code: 'FACTSHEET_INVALID_TYPE',
      message: 'FactSheet must be a plain object or JSON string.'
    });
  }

  const byteLength = Buffer.byteLength(serialized, 'utf8');

  if (byteLength === 0) {
    failures.push({
      code: 'FACTSHEET_EMPTY',
      message: 'FactSheet payload cannot be empty.'
    });
  }

  if (byteLength >= maxBytes) {
    failures.push({
      code: 'FACTSHEET_BYTE_LIMIT_EXCEEDED',
      message: `FactSheet UTF-8 size (${byteLength} bytes) must be strictly under ${maxBytes} bytes.`
    });
  }

  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    if (typeof parsed.engine !== 'string' || parsed.engine.trim().length === 0) {
      failures.push({
        code: 'FACTSHEET_MISSING_ENGINE',
        message: 'FactSheet must declare a deterministic calculation engine identifier.'
      });
    }
    if (!parsed.facts || typeof parsed.facts !== 'object' || Object.keys(parsed.facts).length === 0) {
      failures.push({
        code: 'FACTSHEET_MISSING_FACTS',
        message: 'FactSheet must include non-empty deterministic facts.'
      });
    }
    if (!Array.isArray(parsed.citations) || parsed.citations.length === 0) {
      failures.push({
        code: 'FACTSHEET_MISSING_CITATIONS',
        message: 'FactSheet must include at least one canonical source citation.'
      });
    }
  }

  return {
    valid: failures.length === 0,
    byteLength,
    maxBytes,
    failures
  };
}

export function verifyZeroEmDash(text) {
  const input = String(text ?? '');
  const failures = [];
  const emDashMatches = input.match(/\u2014|&mdash;|&#8212;|&#x2014;/gi) || [];

  if (emDashMatches.length > 0) {
    failures.push({
      code: 'HUMAN_TASTE_EM_DASH_FORBIDDEN',
      message: `Output contains ${emDashMatches.length} forbidden em-dash occurrence(s).`
    });
  }

  return {
    valid: failures.length === 0,
    count: emDashMatches.length,
    failures
  };
}

export function verifyZeroEnterpriseJargon(text, { customForbidden = [] } = {}) {
  const input = String(text ?? '');
  const dictionary = [...FORBIDDEN_ENTERPRISE_JARGON, ...customForbidden];
  const matchedTerms = [];

  for (const term of dictionary) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(input)) {
      matchedTerms.push(term);
    }
  }

  const failures = matchedTerms.map((term) => ({
    code: 'HUMAN_TASTE_ENTERPRISE_JARGON',
    term,
    message: `Output contains forbidden enterprise/AI-slop jargon: "${term}".`
  }));

  return {
    valid: failures.length === 0,
    matchedTerms,
    failures
  };
}

export function verifyCitationGroundedOutput(
  text,
  factSheet,
  { strictNumericGrounding = true } = {}
) {
  const input = String(text ?? '');
  const failures = [];
  const parsed =
    typeof factSheet === 'string'
      ? (() => {
          try {
            return JSON.parse(factSheet);
          } catch {
            return {};
          }
        })()
      : factSheet || {};

  const citations = Array.isArray(parsed.citations)
    ? parsed.citations.map(normalizeCitationEntry).filter((c) => c.id || c.label)
    : [];

  const citedSources = [];
  for (const c of citations) {
    if (
      (c.id && input.toLowerCase().includes(c.id.toLowerCase())) ||
      (c.label && input.toLowerCase().includes(c.label.toLowerCase()))
    ) {
      citedSources.push(c.label || c.id);
    }
  }

  if (citations.length === 0 || citedSources.length === 0) {
    failures.push({
      code: 'OUTPUT_MISSING_GROUNDED_CITATION',
      message: 'Output must cite at least one canonical source from factSheet.citations.'
    });
  }

  const bracketedRefs = [...input.matchAll(/\[cite:\s*([^\]]+)\]/gi)].map((m) => m[1].trim());
  const ungroundedCitations = [];
  for (const ref of bracketedRefs) {
    const grounded = citations.some(
      (c) =>
        c.id.toLowerCase() === ref.toLowerCase() ||
        c.label.toLowerCase() === ref.toLowerCase() ||
        c.label.toLowerCase().includes(ref.toLowerCase())
    );
    if (!grounded) {
      ungroundedCitations.push(ref);
      failures.push({
        code: 'OUTPUT_UNGROUNDED_CITATION',
        citation: ref,
        message: `Output cites "[cite: ${ref}]" which does not exist in factSheet.citations.`
      });
    }
  }

  const ungroundedNumbers = [];
  if (strictNumericGrounding) {
    const allowedNumbers = collectAllowedNumbers(parsed.facts);
    collectAllowedNumbers(parsed.citations, allowedNumbers);
    collectAllowedNumbers(parsed.engine, allowedNumbers);

    const outputNumbers = input.match(/\b\d+(?:\.\d+)?\b/g) || [];
    for (const num of outputNumbers) {
      if (!allowedNumbers.has(num)) {
        ungroundedNumbers.push(num);
      }
    }

    if (ungroundedNumbers.length > 0) {
      failures.push({
        code: 'OUTPUT_UNGROUNDED_NUMBERS',
        numbers: ungroundedNumbers,
        message: `Output invented numeric figure(s) not present in deterministic FactSheet: ${ungroundedNumbers.join(', ')}.`
      });
    }
  }

  return {
    valid: failures.length === 0,
    citedSources,
    ungroundedCitations,
    ungroundedNumbers,
    failures
  };
}

export function evaluateDomainAiGuard({
  factSheet,
  output,
  maxBytes = MAX_FACTSHEET_UTF8_BYTES,
  strictNumericGrounding = true,
  customForbiddenJargon = []
} = {}) {
  const factSheetSize = verifyFactSheetSize(factSheet, { maxBytes });
  const zeroEmDash = verifyZeroEmDash(output);
  const zeroEnterpriseJargon = verifyZeroEnterpriseJargon(output, {
    customForbidden: customForbiddenJargon
  });
  const citationGrounded = verifyCitationGroundedOutput(output, factSheet, {
    strictNumericGrounding
  });

  const failures = [
    ...factSheetSize.failures,
    ...zeroEmDash.failures,
    ...zeroEnterpriseJargon.failures,
    ...citationGrounded.failures
  ];

  return {
    status: failures.length === 0 ? 'pass' : 'fail',
    byteLength: factSheetSize.byteLength,
    maxBytes,
    checks: {
      factSheetSize,
      zeroEmDash,
      zeroEnterpriseJargon,
      citationGrounded
    },
    failures
  };
}

export { FORBIDDEN_ENTERPRISE_JARGON, MAX_FACTSHEET_UTF8_BYTES };
