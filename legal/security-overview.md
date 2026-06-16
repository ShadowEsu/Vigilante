# Security Overview

**Last updated:** June 15, 2026

This Security Overview describes technical and organizational measures **Vigilant, Inc.** uses to protect the Vigilant Service. It is for informational purposes and does not modify the [Terms of Service](/legal/terms) or [DPA](/legal/dpa).

Report vulnerabilities or incidents to **security@vigilant.io**.

---

## 1. Architecture

- Multi-tenant SaaS with **PostgreSQL** and **Row Level Security (RLS)** so users access only their own watches, snapshots, signals, and briefs.
- Server-side agent run loop holds privileged keys; mobile and web clients use user-scoped authentication.
- Public web content is fetched server-side; LLM API keys are never exposed to clients.

---

## 2. Authentication and Access

- **Magic-link email authentication** via Supabase Auth.
- Session tokens stored in secure, HTTP-only cookies on web; secure storage on mobile.
- Service-role credentials restricted to server-side API routes only.
- Principle of least privilege for internal administrative access.

---

## 3. Encryption

- **In transit:** TLS 1.2+ for all client and API connections.
- **At rest:** Encryption provided by cloud infrastructure (Supabase/AWS).
- Secrets and API keys stored as environment variables, not in source control.

---

## 4. Application Security

- Input validation on API routes.
- Content hashing to detect changes without unnecessary re-processing.
- Budget caps and pause controls to limit runaway AI spend.
- Dependency updates and vulnerability monitoring (recommended practice for deployments).

---

## 5. Data Isolation and Retention

- Per-user data isolation enforced at the database policy layer.
- Snapshots store fetched public page text associated with a user's watch.
- Deletion of watches and accounts removes associated records per retention policy in the [Privacy Policy](/legal/privacy).

---

## 6. Monitoring and Incident Response

- Application and infrastructure logging for errors, auth events, and usage.
- Incident response procedure: triage, containment, customer notification where required, post-incident review.
- Contact **security@vigilant.io** for suspected breaches.

---

## 7. Vendor Management

- Subprocessors assessed for security posture; list at [/legal/subprocessors](/legal/subprocessors).
- Data processing agreements with vendors where appropriate.

---

## 8. Responsible Disclosure

We appreciate responsible disclosure of security vulnerabilities. Email **security@vigilant.io** with:

- description and reproduction steps;
- affected URLs or components;
- your contact information.

Please do not access data belonging to other customers. We aim to acknowledge reports within **5 business days**.

---

## 9. Compliance Roadmap

Formal certifications (SOC 2, ISO 27001) may be pursued as the product matures. Contact **legal@vigilant.io** for enterprise security questionnaires.

---

## 10. Contact

**security@vigilant.io**
