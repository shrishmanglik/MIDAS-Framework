# Security Policy

## Supported Versions

MIDAS is currently an alpha framework. Security fixes target the latest alpha branch unless a maintainer states otherwise.

## Reporting a Vulnerability

Please report suspected vulnerabilities privately to the project maintainers. Do not open a public issue with exploit details, secrets, private data, or working attack steps.

Include:

- affected version or commit,
- affected command or generated file,
- clear reproduction steps,
- expected impact,
- whether secrets, credentials, customer data, or external actions are involved.

## Scope

In scope:

- CLI validation bypasses,
- unsafe generated workspace files,
- secret-like content written by MIDAS itself,
- command execution safety issues in MIDAS project checks,
- package contents that accidentally include private or temporary files.

Out of scope:

- vulnerabilities in third-party agents or model providers,
- misuse of generated guidance after manual edits,
- claims that require external account access or secret values to verify.

