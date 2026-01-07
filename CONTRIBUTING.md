# Contributing to DevTools Collection

Thank you for your interest in contributing to DevTools Collection! This guide will help you get started with contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Adding a New Tool](#adding-a-new-tool)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Areas to Contribute](#areas-to-contribute)

## Code of Conduct

This project follows a simple code of conduct:

- **Be respectful**: Treat everyone with respect and kindness
- **Be constructive**: Provide helpful feedback and suggestions
- **Be patient**: Remember that contributors have varying levels of experience
- **Be collaborative**: Work together to improve the project

## Getting Started

### Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Comes with Node.js
- **Git**: For version control
- Basic knowledge of:
  - TypeScript/JavaScript
  - React/Preact
  - Astro (helpful but not required)
  - Tailwind CSS

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/devtools.git
   cd devtools
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/bberka/devtools.git
   ```

## Development Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:4321`

3. **Build for production** (to test):
   ```bash
   npm run build
   ```

4. **Preview production build**:
   ```bash
   npm run preview
   ```

## Project Structure

```
/devtools
├── src/
│   ├── components/
│   │   ├── preact/           # Preact components
│   │   │   ├── tools/        # Tool implementations (24 tools)
│   │   │   ├── ui/           # shadcn/ui components
│   │   │   ├── hooks/        # Custom React hooks
│   │   │   ├── SearchBar.tsx
│   │   │   ├── CategoryFilter.tsx
│   │   │   ├── FavoriteButton.tsx
│   │   │   ├── ThemeToggle.tsx
│   │   │   └── HomeContent.tsx
│   │   └── ToolCard.astro   # Tool card component
│   ├── layouts/
│   │   └── Layout.astro     # Main layout
│   ├── lib/
│   │   ├── types.ts         # TypeScript types
│   │   └── utils/
│   │       ├── cn.ts        # Utility functions
│   │       ├── storage.ts   # LocalStorage utilities
│   │       └── tools-config.ts  # Tool metadata
│   ├── pages/
│   │   ├── index.astro      # Home page
│   │   └── tools/
│   │       └── [slug].astro # Dynamic tool pages
│   └── styles/
│       └── globals.css      # Global styles
├── docs/
│   └── DEV-PLAN.md         # Development roadmap
├── public/                  # Static assets
├── README.md
├── CONTRIBUTING.md
└── package.json
```

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

Use descriptive branch names:
- `feature/add-bcrypt-tool` - For new features
- `fix/base64-encoding-bug` - For bug fixes
- `docs/update-readme` - For documentation
- `refactor/improve-storage` - For refactoring

### 2. Make Your Changes

- Write clean, readable code
- Follow the existing code style
- Add comments for complex logic
- Test your changes locally

### 3. Commit Your Changes

Write clear, descriptive commit messages:

```bash
git add .
git commit -m "feat: add bcrypt hash generator tool"
```

**Commit message format**:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Adding tests
- `chore:` - Maintenance tasks

### 4. Keep Your Fork Updated

```bash
git fetch upstream
git rebase upstream/master
```

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Create a Pull Request

- Go to your fork on GitHub
- Click "New Pull Request"
- Select your feature branch
- Fill out the PR template with:
  - **What** changes you made
  - **Why** you made them
  - **How** to test them
  - Screenshots (if UI changes)

## Coding Standards

### TypeScript/JavaScript

- **Use TypeScript**: All new code should use TypeScript
- **Type safety**: Avoid `any` types when possible
- **Naming conventions**:
  - Components: `PascalCase` (e.g., `Base64Converter`)
  - Functions: `camelCase` (e.g., `handleConvert`)
  - Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_LENGTH`)
  - Files: Match component names (e.g., `Base64Converter.tsx`)

### Preact/React

- **Functional components**: Use function components with hooks
- **Hooks**: Use `preact/hooks` instead of `react` hooks
- **State management**: Use `useState` and `useEffect`
- **Props**: Always define prop types with TypeScript interfaces

Example:
```tsx
import { useState, useEffect } from 'preact/hooks';

interface MyComponentProps {
  title: string;
  onSave?: (value: string) => void;
}

export function MyComponent({ title, onSave }: MyComponentProps) {
  const [value, setValue] = useState('');

  return (
    <div>
      <h2>{title}</h2>
      <input value={value} onInput={(e) => setValue(e.currentTarget.value)} />
    </div>
  );
}
```

### Styling

- **Tailwind CSS**: Use Tailwind utility classes
- **Component classes**: Use `className` prop
- **Responsive design**: Mobile-first approach
- **Dark mode**: Use Tailwind's dark mode classes

### Real-time Processing Rule

**CRITICAL**: All tools that convert input to output MUST process in real-time as the user types. NO "Convert" or "Generate" buttons unless:

- The operation is computationally expensive (image processing, PDF generation)
- It requires explicit user confirmation
- It involves file uploads

**Examples**:
- ✅ Base64 encoder updates output as user types
- ✅ JSON formatter auto-formats on input change
- ✅ Hash generator shows all hashes instantly
- ❌ Image converter needs explicit "Convert" (file upload + processing)
- ❌ PDF generation needs explicit "Generate" (heavy operation)

**Implementation**:
```tsx
useEffect(() => {
  handleConvert();
}, [input, mode]); // Re-run conversion when input or mode changes

const handleConvert = () => {
  if (!input.trim()) {
    setOutput('');
    return;
  }
  // Conversion logic here
};
```

### SSR Compatibility

All components must work with Astro's Server-Side Rendering:

- ❌ **Avoid browser-only APIs** in component initialization:
  - `window`, `document`, `localStorage`, `navigator`
  - `DOMParser`, `atob()`, `btoa()` (during SSR)

- ✅ **Use browser APIs safely**:
  ```tsx
  useEffect(() => {
    // Safe: runs only in browser after hydration
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem('key');
    }
  }, []);
  ```

- ✅ **Use pure JavaScript implementations** for encoding/decoding when possible
- ✅ **Use `client:load`** directive in Astro pages for components with browser APIs

## Adding a New Tool

### Step 1: Add Tool Metadata

Edit `src/lib/utils/tools-config.ts`:

```typescript
{
  id: 'bcrypt-hasher',
  name: 'Bcrypt Hasher',
  description: 'Generate and verify bcrypt hashes',
  category: 'generators', // or 'converters', 'encoders-decoders', etc.
  icon: 'Shield', // Lucide icon name
  keywords: ['bcrypt', 'hash', 'password', 'security'],
  featured: false, // Set to true for featured tools
}
```

### Step 2: Create Tool Component

Create `src/components/preact/tools/BcryptHasher.tsx`:

```tsx
import { useState, useEffect } from 'preact/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Copy, Shield, Trash2 } from 'lucide-preact';

export function BcryptHasher() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  // Real-time conversion (if applicable)
  useEffect(() => {
    handleHash();
  }, [input]);

  const handleHash = () => {
    if (!input.trim()) {
      setOutput('');
      setError('');
      return;
    }

    try {
      // Implement hashing logic
      // const hashed = bcrypt.hashSync(input, 10);
      // setOutput(hashed);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hash failed');
      setOutput('');
    }
  };

  const handleCopy = async () => {
    if (output) {
      await navigator.clipboard.writeText(output);
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Input
          </CardTitle>
          <CardDescription>Enter text to hash</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={input}
            onInput={(e) => setInput((e.target as HTMLTextAreaElement).value)}
            placeholder="Enter text here..."
            rows={4}
            className="font-mono"
          />
        </CardContent>
      </Card>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Output</CardTitle>
          <CardDescription>
            {output ? `${output.length} characters` : 'Hash will appear here'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <pre className="w-full min-h-[100px] p-3 rounded-md bg-muted font-mono text-sm overflow-x-auto whitespace-pre-wrap break-all border border-input">
              {output || 'Output will appear here...'}
            </pre>
            <div className="flex gap-2">
              <Button onClick={handleCopy} disabled={!output} size="sm">
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button onClick={handleClear} variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Step 3: Register Tool in Routing

Edit `src/pages/tools/[slug].astro`:

1. **Import the component**:
   ```astro
   import { BcryptHasher } from '@/components/preact/tools/BcryptHasher';
   ```

2. **Add to implementedTools array**:
   ```typescript
   const implementedTools = [
     // ... existing tools
     'bcrypt-hasher',
   ];
   ```

3. **Add routing condition**:
   ```astro
   {tool.id === 'bcrypt-hasher' && <BcryptHasher client:load />}
   ```

### Step 4: Test Your Tool

1. Run `npm run dev`
2. Navigate to `/tools/bcrypt-hasher`
3. Test all functionality:
   - Input handling
   - Real-time conversion (if applicable)
   - Copy button
   - Clear button
   - Error handling
   - Dark mode
   - Mobile responsiveness

4. Build and test:
   ```bash
   npm run build
   npm run preview
   ```

### Step 5: Update Documentation

- Update `README.md` to include your tool in the "Available Tools" section
- Update `docs/DEV-PLAN.md` to mark your tool as completed

## Testing

While we don't have automated tests yet, manually test:

1. **Functionality**: All features work as expected
2. **Responsiveness**: Test on mobile, tablet, and desktop sizes
3. **Dark mode**: Switch between light and dark themes
4. **Error handling**: Test with invalid inputs
5. **Performance**: No lag or freezing with large inputs
6. **SSR**: Run `npm run build` to ensure no SSR errors
7. **Cross-browser**: Test in Chrome, Firefox, Safari (if possible)

## Submitting Changes

### Pull Request Guidelines

**Before submitting**:
- [ ] Code builds without errors (`npm run build`)
- [ ] All features work as expected
- [ ] Code follows project style guide
- [ ] No console errors or warnings
- [ ] Documentation updated (if needed)
- [ ] Tested in dev and production builds

**PR Description should include**:
- **Summary**: Brief description of changes
- **Motivation**: Why this change is needed
- **Changes**: List of specific changes made
- **Testing**: How you tested the changes
- **Screenshots**: If UI changes (light + dark mode)
- **Breaking changes**: If any

**Example PR description**:
```markdown
## Summary
Added Bcrypt Hasher tool for generating and verifying bcrypt password hashes.

## Motivation
Requested feature for password hashing with industry-standard bcrypt algorithm.

## Changes
- Added BcryptHasher component
- Added bcrypt-hasher to tools config
- Updated routing in [slug].astro
- Added bcryptjs dependency

## Testing
- Tested hash generation with various inputs
- Verified hash verification works correctly
- Tested on mobile and desktop
- Tested in light and dark modes
- Build succeeds with no errors

## Screenshots
[Include screenshots here]
```

### Review Process

1. Maintainers will review your PR
2. Address any feedback or requested changes
3. Once approved, your PR will be merged
4. Celebrate your contribution! 🎉

## Areas to Contribute

### 1. New Tools (High Priority)

See `docs/DEV-PLAN.md` for planned tools. Popular requests:

**Security Tools**:
- RSA Key Pair Generator
- AES Encryption/Decryption
- Bcrypt/Argon2 Hasher

**CSS Tools**:
- Glassmorphism Generator
- Box Shadow Visualizer
- Clamp() Calculator

**Networking Tools**:
- IP Address Lookup
- DNS Records Lookup
- Subnet Calculator

### 2. Bug Fixes (Medium Priority)

- Browse [open issues](https://github.com/bberka/devtools/issues)
- Look for bugs labeled `bug` or `help wanted`
- Test edge cases in existing tools

### 3. UI/UX Improvements (Medium Priority)

- Improve mobile responsiveness
- Enhance dark mode consistency
- Add keyboard shortcuts
- Improve accessibility (ARIA labels, focus states)

### 4. Performance Optimizations (Low Priority)

- Reduce bundle sizes
- Optimize re-renders
- Implement code splitting
- Add lazy loading

### 5. Documentation (Low Priority)

- Improve README
- Add code comments
- Create usage examples
- Write tutorials

### 6. Advanced Features (Future)

- Command Palette (Ctrl+K)
- PWA support
- Drag-and-drop file support
- Export/import settings

## Questions?

- **General questions**: Open a [GitHub Discussion](https://github.com/bberka/devtools/discussions)
- **Bug reports**: Open an [Issue](https://github.com/bberka/devtools/issues)
- **Feature requests**: Open an [Issue](https://github.com/bberka/devtools/issues) with `enhancement` label

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to DevTools Collection! 🚀
