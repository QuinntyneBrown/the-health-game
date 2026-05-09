# Security Policy

Security reports are taken seriously. Please do not disclose vulnerabilities in
public issues, pull requests, discussions, or chat channels.

## Supported Versions

This project is in MVP development. Security fixes are applied to the default
branch unless a maintained release branch is explicitly documented.

| Version | Supported |
| ------- | --------- |
| `main`  | Yes       |

## Reporting a Vulnerability

If this repository is hosted on GitHub and private vulnerability reporting is
enabled, use that feature.

If private vulnerability reporting is not available, contact a maintainer through
a private channel and include:

- A description of the issue.
- Steps to reproduce the issue.
- The affected component, route, dependency, or configuration.
- Any proof of concept, logs, screenshots, or request samples.
- Your assessment of impact and exploitability.

Do not include real user data, credentials, tokens, or secrets in reports.

## Response Expectations

Maintainers should acknowledge valid reports as soon as practical, investigate
the issue, and coordinate a fix before public disclosure. Timelines depend on
severity, exploitability, and maintainer availability.

## Security Expectations

Contributions should preserve the project's security requirements:

- Validate input at trust boundaries.
- Enforce ownership and role checks on backend endpoints.
- Avoid logging credentials, tokens, code verifiers, passwords, or sensitive
  personal data.
- Store secrets outside source control.
- Use parameterized data access through EF Core.
- Keep authentication and authorization checks on the server, even when the UI
  hides restricted actions.
