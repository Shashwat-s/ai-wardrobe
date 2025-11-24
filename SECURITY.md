# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please follow these steps:

1. **Do NOT** create a public GitHub issue
2. Email security@aiwardrobe.com with:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

3. Allow up to 48 hours for initial response
4. Work with maintainers to resolve the issue

## Security Best Practices

### For Users

- Never share Firebase credentials
- Use strong passwords
- Enable two-factor authentication
- Keep dependencies updated
- Review Firebase security rules

### For Developers

- Keep dependencies updated
- Use environment variables for secrets
- Implement proper input validation
- Follow OWASP security guidelines
- Use HTTPS in production
- Implement rate limiting
- Sanitize user inputs
- Use Firebase security rules

## Known Security Considerations

### Firebase Security
- Ensure proper security rules are configured
- Limit file upload sizes
- Validate file types
- Use authentication for all sensitive operations

### API Security
- Implement rate limiting
- Validate all inputs
- Use HTTPS only
- Set proper CORS policies
- Sanitize image URLs

### Data Privacy
- User data is stored in their Firebase account
- Images are stored in Firebase Storage
- No data is shared with third parties
- Users can delete their data anytime

## Disclosure Policy

- Security issues will be fixed promptly
- Users will be notified of critical issues
- Credits given to researchers who responsibly disclose

Thank you for helping keep AI Wardrobe secure!
