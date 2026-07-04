# MIDAS Public Boundary

Status: alpha policy

MIDAS may publish generic framework components, CLI code, templates, validators, module manifests, and examples.

MIDAS must not publish:

- credentials, tokens, private keys, or `.env` values,
- client-specific artifacts,
- product-specific operating playbooks,
- private operating-memory ledgers,
- proprietary prompt packs,
- private/internal material,
- internal approval or revenue systems,
- generated bitmap/image assets,
- unsupported claims about adoption, revenue, security, or production readiness.

Skill-pack validation is deterministic structure and tool-safety hygiene. Advisory suspicious-body warnings are review cues only; they do not prove author intent, prevent prompt injection, or replace human/security review.

Flow-component validation is deterministic contract hygiene. It checks typed ports, permission classes, approval gates, evidence, rollback, and tool-exposure metadata; it does not prove runtime safety, approve external actions, or replace security review.

The public-boundary scanner blocks hardcoded literal secret assignments such as quoted API keys, secret keys, private keys, access tokens, and refresh tokens. It should not block ordinary auth schema fields, typed DTOs, or env-var plumbing such as `access_token: string`, `refresh_token: str`, or `api_key=settings.PROVIDER_API_KEY`; those still require normal security review before release.

Before public release, run:

```bash
npm test
npm run validate
npm pack --dry-run --json
```

Also run a public-boundary leak scan, review the package contents, and perform a fresh packaged install smoke before any public repository push or package publish.
