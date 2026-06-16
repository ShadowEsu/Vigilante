# Security Policy

## Supported versions

| Version | Supported |
| ------- | --------- |
| 0.1.x   | Yes       |

## Reporting a vulnerability

If you discover a security issue in Vigilante, please report it responsibly:

**Email:** security@vigilant.app

Please include:

- Description of the vulnerability
- Steps to reproduce
- Impact assessment
- Any proof-of-concept (avoid accessing other users' data)

We aim to acknowledge reports within **3 business days** and provide a remediation timeline when confirmed.

## Scope

**In scope**

- The Vigilante web application (https://shadowesu.github.io/Vigilante/)
- Supabase-backed waitlist and authentication flows
- Public API routes in this repository

**Out of scope**

- Third-party services (Supabase, Anthropic, GitHub)
- Social engineering or physical attacks
- Denial-of-service against production infrastructure

## Security measures

- Row-level security (RLS) on Supabase tables
- HTTPS enforced on all deployments
- Security headers (CSP, X-Frame-Options, HSTS in production)
- Dependency auditing via GitHub Actions and Dependabot
- Secrets stored in environment variables — never committed to git

## Safe harbor

We support good-faith security research. Do not exploit vulnerabilities beyond what is needed to demonstrate the issue, and do not access, modify, or delete data belonging to others.
