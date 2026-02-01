# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of Createconomy seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to:

📧 **security@createconomy.com**

### What to Include

Please include the following information in your report:

1. **Type of vulnerability** (e.g., XSS, SQL injection, authentication bypass)
2. **Location** of the affected source code (tag/branch/commit or direct URL)
3. **Step-by-step instructions** to reproduce the issue
4. **Proof-of-concept or exploit code** (if possible)
5. **Impact** of the vulnerability, including how an attacker might exploit it
6. **Any potential mitigations** you've identified

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 5 business days
- **Resolution Target**: Within 90 days (depending on complexity)

### What to Expect

1. **Acknowledgment**: We will acknowledge receipt of your vulnerability report within 48 hours.

2. **Communication**: We will keep you informed of the progress towards a fix and full announcement.

3. **Credit**: We will credit you in the security advisory if you wish (please let us know your preference).

4. **Disclosure**: We ask that you give us reasonable time to address the vulnerability before any public disclosure.

## Security Measures

### Authentication & Authorization

- OAuth 2.0 with Google and GitHub providers
- JWT-based session management
- Role-based access control (RBAC)
- Cross-domain session sharing with secure cookies

### Data Protection

- All data encrypted in transit (TLS 1.3)
- Sensitive data encrypted at rest
- PCI DSS compliance for payment data (via Stripe)
- Regular security audits

### Application Security

- CSRF protection on all forms
- Rate limiting on API endpoints
- Input validation and sanitization
- Content Security Policy (CSP) headers
- XSS protection headers

### Infrastructure Security

- Vercel edge network with DDoS protection
- Convex cloud with automatic security updates
- Environment variable encryption
- Secure CI/CD pipeline

## Security Best Practices for Contributors

When contributing to Createconomy, please follow these security guidelines:

### Code Security

1. **Never commit secrets** - Use environment variables
2. **Validate all inputs** - Use Zod schemas for validation
3. **Sanitize outputs** - Prevent XSS attacks
4. **Use parameterized queries** - Prevent injection attacks
5. **Implement proper error handling** - Don't expose stack traces

### Authentication

1. **Always verify authentication** - Check user identity on protected routes
2. **Implement authorization** - Verify user permissions
3. **Use secure session management** - HTTP-only, secure cookies
4. **Implement rate limiting** - Prevent brute force attacks

### Data Handling

1. **Minimize data collection** - Only collect what's necessary
2. **Encrypt sensitive data** - Use appropriate encryption
3. **Implement proper logging** - Don't log sensitive information
4. **Handle PII carefully** - Follow data protection regulations

## Security Updates

Security updates are released as soon as possible after a vulnerability is confirmed. We recommend:

1. **Enable automatic updates** for dependencies
2. **Subscribe to security advisories** via GitHub
3. **Monitor the CHANGELOG** for security-related updates
4. **Keep your deployment up to date**

## Bug Bounty Program

We currently do not have a formal bug bounty program, but we deeply appreciate security researchers who help us keep Createconomy secure.

Depending on the severity and impact of the vulnerability, we may offer:

- Public acknowledgment
- Createconomy swag
- Gift cards

## Contact

For security-related inquiries:

- **Email**: security@createconomy.com
- **PGP Key**: Available upon request

For general security questions, please use [GitHub Discussions](https://github.com/createconomy/createconomy/discussions).

---

Thank you for helping keep Createconomy and our users safe! 🔒
