# Contributing to ChurnSentry

Thanks for your interest in contributing! This document provides guidelines and instructions for contributing to the ChurnSentry project.

---

## 🤝 How to Contribute

### Reporting Bugs

Before reporting a bug, please:
1. Check the **Issues** page to see if it's already reported
2. Search through closed issues too

**To report a bug, include:**
- Clear, descriptive title
- Steps to reproduce
- Expected behavior vs. actual behavior
- Screenshots if applicable
- Environment (OS, Node version, browser)
- Error messages or logs

### Suggesting Features

Have an idea? We'd love to hear it!

1. Check if feature is already suggested in **Issues**
2. Create a new issue with:
   - Clear title starting with `[Feature Request]`
   - Detailed description of the feature
   - Why you think it's valuable
   - Possible implementation approach (optional)

### Code Contributions

Want to code? Follow these steps:

#### 1. Fork & Clone

```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/YOUR_USERNAME/customer-churn-predictor.git
cd customer-churn-predictor
```

#### 2. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
# or for bugs:
git checkout -b fix/bug-description
```

#### 3. Make Your Changes

- Follow the existing code style
- Add comments for complex logic
- Keep changes focused and minimal
- Test your changes locally

#### 4. Commit Changes

```bash
git add .
git commit -m "Clear, descriptive commit message"
# Good: "Add CSV export feature to history panel"
# Bad: "updates"
```

#### 5. Push & Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then:
1. Go to GitHub repository
2. Click "Compare & pull request"
3. Fill in PR description:
   - What does this PR do?
   - Why is it needed?
   - Related issues (if any)
   - Testing notes

---

## 💻 Development Setup

### Prerequisites

- Node.js 18+
- npm/yarn
- Git

### Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run linting
npm run lint

# Build for production
npm run build
```

---

## 📝 Code Style Guidelines

### TypeScript

- Use explicit type annotations where helpful
- Avoid `any` type (use `unknown` if necessary)
- Use interfaces for object shapes
- Prefix private members with `_` (or use `private` keyword)

```typescript
// Good
interface UserProfile {
  id: string;
  email: string;
  fullName: string;
}

const user: UserProfile = {
  id: "123",
  email: "user@example.com",
  fullName: "John Doe"
};

// Avoid
const user: any = { ... };
```

### React Components

- Use functional components with hooks
- Keep components focused and single-purpose
- Extract complex logic into custom hooks
- Use meaningful names for props and state

```typescript
// Good
interface DashboardProps {
  stats: DashboardStats | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export default function Dashboard({ stats, isLoading, onRefresh }: DashboardProps) {
  // Implementation
}

// Avoid
export default function Dashboard(props: any) {
  // Implementation
}
```

### Styling

- Use Tailwind CSS classes
- Create reusable style classes in `index.css`
- Follow the existing design system (colors, spacing, etc.)
- Ensure mobile responsiveness

```typescript
// Good
<div className="glass-panel p-6 rounded-2xl">
  <h1 className="text-2xl font-bold text-white">Title</h1>
</div>

// Avoid
<div style={{ padding: '24px', borderRadius: '16px' }}>
  <h1 style={{ fontSize: '24px' }}>Title</h1>
</div>
```

### Comments & Documentation

- Comment complex algorithms (like ML model training)
- Explain why, not what (code shows what)
- Use JSDoc for exported functions

```typescript
/**
 * Calculates churn probability using logistic regression
 * @param features Customer features for prediction
 * @param model Trained ML model state
 * @returns Churn probability (0-100%)
 */
function runModelInference(features: PredictorFeatures, model: ModelState): number {
  // Implementation...
}
```

---

## 🧪 Testing

### Manual Testing Checklist

Before submitting a PR, test:

- [ ] Feature works in development mode
- [ ] Feature works in production build
- [ ] No console errors
- [ ] Responsive on mobile (375px - 1920px widths)
- [ ] Dark mode and light mode both work
- [ ] Authentication flow works
- [ ] Loading states appear correctly
- [ ] Error handling shows appropriate messages

### Adding Tests (Future)

When test infrastructure is added:
- Write unit tests for utility functions
- Write integration tests for API endpoints
- Aim for >80% code coverage

---

## 📁 Project Structure

Know where to make changes:

```
src/
├── components/          # React components (UI)
├── App.tsx             # Main app router
├── types.ts            # TypeScript interfaces
└── index.css           # Global styles

server/
├── db.ts               # Database operations
├── ml.ts               # Machine learning logic
└── gemini.ts           # AI integration

server.ts              # Express API server
vite.config.ts         # Build configuration
tsconfig.json          # TypeScript config
```

---

## 🔄 Pull Request Process

1. **Update documentation** if you change behavior
2. **Test thoroughly** before submitting
3. **Keep PR focused** - one feature per PR
4. **Be responsive** to review feedback
5. **Squash commits** if requested by maintainers

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement

## Related Issues
Closes #(issue number)

## How to Test
Steps to verify the changes

## Checklist
- [ ] Code follows style guidelines
- [ ] No console errors/warnings
- [ ] Mobile responsive
- [ ] Documentation updated
- [ ] Tested in dev and production builds
```

---

## 🐛 Common Issues

### Setup Issues

**Q: `npm install` fails**
- A: Try `npm cache clean --force` then reinstall

**Q: Vite dev server crashes**
- A: Check port 3000 isn't in use. Run `npm run dev` again.

**Q: TypeScript errors after changes**
- A: Run `npm run lint` to see full errors. Fix types with `satisfies` or explicit annotations.

### Development Issues

**Q: Changes don't reflect after save**
- A: Ensure dev server is running. Check terminal for errors.

**Q: API returns 401**
- A: Clear localStorage and login again. Check JWT_SECRET is correct.

---

## 📚 Learning Resources

### For This Project

- [README.md](README.md) - Full project documentation
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment instructions
- [types.ts](src/types.ts) - Data models and interfaces

### General Resources

- [React Docs](https://react.dev) - React 19 documentation
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - TypeScript guide
- [Tailwind CSS Docs](https://tailwindcss.com/docs) - CSS framework
- [Express.js Guide](https://expressjs.com/) - Backend framework
- [Logistic Regression](https://en.wikipedia.org/wiki/Logistic_regression) - ML algorithm

---

## 🚀 Development Workflow Example

```bash
# 1. Create feature branch
git checkout -b feature/dark-mode-persistence

# 2. Make changes
# Edit src/App.tsx to persist dark mode preference

# 3. Test locally
npm run dev
# Test in browser, verify functionality

# 4. Run linting
npm run lint
# Fix any TypeScript errors

# 5. Commit changes
git add src/App.tsx
git commit -m "Persist dark mode preference to localStorage"

# 6. Push to your fork
git push origin feature/dark-mode-persistence

# 7. Create PR on GitHub
# Go to repo, click "Compare & pull request"
# Fill in title and description
# Submit PR

# 8. Address review feedback
# Make requested changes, commit, and push
# Maintainers merge when approved
```

---

## 📧 Contact & Questions

- **Issues:** Ask on GitHub Issues
- **Discussions:** Use GitHub Discussions (if enabled)
- **Email:** [Add contact email here]

---

## 📄 License

By contributing, you agree your contributions will be licensed under the MIT License (see [LICENSE](LICENSE) file).

---

## 🎉 Thank You!

Your contributions make ChurnSentry better for everyone. Whether it's code, documentation, bug reports, or feature suggestions - we appreciate your involvement!

---
