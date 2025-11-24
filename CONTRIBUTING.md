# Contributing to AI Wardrobe

Thank you for your interest in contributing to AI Wardrobe! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in Issues
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, browser, etc.)

### Suggesting Features

1. Check if the feature has been suggested
2. Create a new issue with:
   - Clear description of the feature
   - Use cases and benefits
   - Potential implementation approach

### Pull Requests

1. Fork the repository
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. Make your changes:
   - Follow existing code style
   - Add comments where necessary
   - Update documentation
   - Add tests if applicable

4. Commit with clear messages:
   ```bash
   git commit -m "Add: brief description of changes"
   ```

5. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

6. Create a Pull Request with:
   - Description of changes
   - Related issue numbers
   - Screenshots if UI changes

## Development Setup

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

## Code Style

### Frontend (JavaScript/React)
- Use functional components with hooks
- Follow ESLint rules
- Use meaningful variable names
- Keep components small and focused
- Use TailwindCSS for styling

### Backend (Python)
- Follow PEP 8 style guide
- Use type hints
- Add docstrings to functions
- Keep functions focused and testable
- Handle errors gracefully

## Testing

### Frontend
```bash
npm run lint
```

### Backend
```bash
pytest
```

## Documentation

- Update README.md for major changes
- Add JSDoc comments for complex functions
- Update API documentation for endpoint changes
- Include inline comments for complex logic

## Git Workflow

1. Keep commits atomic and focused
2. Write clear commit messages:
   - `Add:` for new features
   - `Fix:` for bug fixes
   - `Update:` for improvements
   - `Remove:` for deletions
   - `Refactor:` for code restructuring

3. Rebase before submitting PR:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

## Review Process

1. Maintainers will review your PR
2. Address feedback and requested changes
3. Once approved, your PR will be merged

## Questions?

Feel free to:
- Open an issue for clarification
- Join discussions in existing issues
- Reach out to maintainers

Thank you for contributing! 🎉
