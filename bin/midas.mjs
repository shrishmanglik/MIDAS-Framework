#!/usr/bin/env node

import path from 'node:path';
import { pollAutorun } from '../lib/autorun.mjs';
import { resolveCustomize } from '../lib/customize.mjs';
import { runCli } from '../lib/cli.mjs';

function parseArgs(args) {
  const parsed = { _: [] };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith('--')) {
      parsed._.push(arg);
      continue;
    }
    const key = arg.slice(2);
    const next = args[index + 1];
    if (!next || next.startsWith('--')) {
      parsed[key] = true;
      continue;
    }
    parsed[key] = next;
    index += 1;
  }
  return parsed;
}

/**
 * bin-level workflow subcommands:
 *
 * midas next [workorder]   With a work-order file argument (positional or
 *                          --work-order), polls the midas.autorun.v1 state
 *                          machine on that file and prints current state plus
 *                          the next-action contract as JSON — the external-
 *                          orchestrator poll surface. Without a work-order
 *                          argument it falls through to the existing
 *                          workspace-level `next` recommendation.
 * midas customize <skill>  Prints the resolved 3-layer customize config
 *                          (skill default -> team -> user) with a per-key
 *                          provenance map.
 */
async function dispatch(argv) {
  const command = argv[0];
  const parsed = parseArgs(argv.slice(1));

  if (command === 'next') {
    const workOrder = parsed['work-order'] ?? parsed.workOrder ?? parsed._[0];
    if (typeof workOrder === 'string' && workOrder.trim() !== '') {
      const directory = typeof parsed.directory === 'string' ? parsed.directory : '.';
      const file = path.isAbsolute(workOrder) ? workOrder : path.resolve(directory, workOrder);
      const result = await pollAutorun({ file });
      console.log(JSON.stringify(result, null, 2));
      if (result.status === 'halted') process.exitCode = 2;
      return;
    }
    // No work-order argument: preserve the existing workspace-level `next`.
  }

  if (command === 'customize') {
    const skill = parsed._[0] ?? (typeof parsed.skill === 'string' ? parsed.skill : undefined);
    if (!skill) throw new Error('customize requires a skill name: midas customize <skill> [--directory <dir>]');
    const result = await resolveCustomize({
      directory: typeof parsed.directory === 'string' ? parsed.directory : '.',
      skill
    });
    console.log(JSON.stringify(result, null, 2));
    if (result.status === 'fail') process.exitCode = 1;
    return;
  }

  await runCli(argv);
}

dispatch(process.argv.slice(2)).catch((error) => {
  console.error(`MIDAS_ERROR: ${error.message}`);
  process.exitCode = 1;
});
