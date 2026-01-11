# Contributing to ResolvAI

First off, thank you for considering contributing to ResolvAI! It's people like you that make ResolvAI such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps to reproduce the problem**
* **Provide specific examples**
* **Describe the behavior you observed and what you expected**
* **Include screenshots if possible**
* **Include your environment details** (OS, Node version, browser, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title**
* **Provide a detailed description of the suggested enhancement**
* **Explain why this enhancement would be useful**
* **List any alternatives you've considered**

### Pull Requests

* Fork the repo and create your branch from `main`
* If you've added code that should be tested, add tests
* Ensure the test suite passes
* Make sure your code follows the existing style
* Write a clear commit message
* Update documentation as needed

## Development Process

1. **Fork and Clone**
```bash
git clone https://github.com/giraseasatish/resolvai.git
cd resolvai
```

2. **Create a Branch**
```bash
git checkout -b feature/amazing-feature
```

3. **Make Your Changes**
- Write clean, readable code
- Follow existing patterns
- Add comments where necessary

4. **Test Your Changes**
```bash
# Backend
cd server
npm test

# Frontend
cd client
npm test
```

5. **Commit Your Changes**
```bash
git commit -m "Add amazing feature"
```

6. **Push to Your Fork**
```bash
git push origin feature/amazing-feature
```

7. **Open a Pull Request**

## Style Guidelines

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line

### TypeScript Style Guide

* Use TypeScript for all new code
* Use meaningful variable names
* Add type annotations where helpful
* Follow existing patterns in the codebase

### Code Formatting

* Use 2 spaces for indentation
* Use semicolons
* Use single quotes for strings
* Add trailing commas in multi-line objects/arrays

## Project Structure

```
resolvai/
├── client/          # Frontend React app
├── server/          # Backend Node.js app
└── README.md
```

## Questions?

Feel free to open an issue with your question or contact the maintainer directly.

Thank you for contributing! 🎉
