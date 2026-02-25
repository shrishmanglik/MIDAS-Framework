---
name: "open-source-licenses"
studio: "legal-studio"
---

# Open Source License Compliance Guide

## License Categories

### Permissive (Low Risk)
| License | Requirements | Can Use In Proprietary? |
|---------|-------------|----------------------|
| MIT | Include copyright notice | Yes |
| BSD 2/3-Clause | Include copyright notice | Yes |
| Apache 2.0 | Notice, state changes, patent grant | Yes |
| ISC | Include copyright notice | Yes |

### Copyleft (Higher Risk)
| License | Requirements | Can Use In Proprietary? |
|---------|-------------|----------------------|
| GPL v2/v3 | Derivative works must be GPL | No (if distributed) |
| LGPL | Dynamic linking OK, static requires source | Conditionally |
| AGPL | Network use triggers copyleft | No (even for SaaS) |
| MPL 2.0 | File-level copyleft | Conditionally |

## Compliance Best Practices
1. Maintain a software bill of materials (SBOM)
2. Scan dependencies regularly for license changes
3. Keep copyleft code in separate modules
4. Include all required notices in distribution
5. Train developers on license implications

