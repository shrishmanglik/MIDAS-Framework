# Contributing to MIDAS

Thanks for helping improve MIDAS.

## Development Setup

```bash
npm install
npm test
npm run validate
```

The alpha package has no runtime dependencies. Keep new dependencies minimal and explain why they are needed.

## Contribution Rules

- Keep public contributions source-neutral and license-clean.
- Do not include secrets, credentials, `.env` values, private keys, customer data, private operating notes, or proprietary prompt packs.
- Do not copy code, prompts, templates, examples, or docs from another project unless the license and attribution are clearly approved.
- Add or update tests for behavior changes.
- Keep generated `.midas/` workspaces, temporary outputs, and scored-evaluation artifacts out of source control.

## Pull Request Checklist

- `npm test` passes.
- `npm run validate` passes.
- `npm pack --dry-run --json` contains only intended package files.
- Public docs do not make unsupported security, production, adoption, revenue, or scored-evaluation claims.
