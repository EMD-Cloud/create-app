# Development Guide for @emd-cloud/create-app

This guide explains how to develop, build, and test the scaffold tool.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the project:**
   ```bash
   npm run build
   ```

3. **Test locally:**
   ```bash
   npm run dev -- --project-name test-app
   ```

## Project Structure

```
emd-project-bootstrap/
├── src/
│   ├── index.ts              # CLI entry point
│   ├── prompts.ts            # Interactive prompts
│   ├── scaffolder.ts         # Project scaffolding logic
│   └── variants.ts           # Style & state management variants
├── templates/
│   ├── template-react/       # Vite + React (JS)
│   ├── template-react-ts/    # Vite + React (TS)
│   ├── template-nextjs/      # Next.js (JS)
│   └── template-nextjs-ts/   # Next.js (TS)
├── dist/                     # Compiled JavaScript (after build)
├── package.json
├── tsconfig.json
└── README.md
```

## Development Scripts

### `npm run dev`
Runs the CLI tool using tsx (TypeScript directly without compilation):
```bash
npm run dev
```

This will prompt you through the interactive CLI.

### `npm run build`
Compiles TypeScript to JavaScript using tsup:
```bash
npm run build
```

Output goes to the `dist/` directory with proper shebang for CLI usage.

### `npm run test`
Runs tests using vitest:
```bash
npm run test
```

## Manual Testing

### Test locally before publishing:

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Test with npm link (for local testing):**
   ```bash
   npm link
   create-emd-app  # Test the CLI globally
   ```

3. **Or test the dist directly:**
   ```bash
   node dist/index.js
   ```

4. **Clean up after testing:**
   ```bash
   npm unlink -g @emd-cloud/create-app
   ```

## Testing Checklist

When testing the CLI, verify:

- [ ] **Project Creation**
  - [ ] React + Vite + JS
  - [ ] React + Vite + TS
  - [ ] Next.js + JS
  - [ ] Next.js + TS

- **Language Selection**
  - [ ] JavaScript templates generated correctly
  - [ ] TypeScript templates with proper tsconfig

- **Styling Options**
  - [ ] Vanilla CSS (all frameworks)
  - [ ] SCSS (all frameworks)
  - [ ] Tailwind (all frameworks)
  - [ ] shadcn (TypeScript only, shows error for JS)

- **State Management**
  - [ ] None option
  - [ ] Redux installation and setup
  - [ ] Effector installation and setup
  - [ ] TanStack Query installation and setup

- **Developer Tools**
  - [ ] ESLint configs (Standard, Airbnb, None)
  - [ ] Prettier config generation
  - [ ] .gitignore file renaming (_gitignore → .gitignore)
  - [ ] Git initialization (if selected)

- **Package Managers**
  - [ ] npm detection and commands
  - [ ] yarn detection and commands
  - [ ] pnpm detection and commands
  - [ ] bun detection and commands

- **Generated Projects**
  - [ ] package.json has correct dependencies
  - [ ] Entry files exist (main.jsx/tsx for React, layout/page for Next.js)
  - [ ] CSS files present with correct approach
  - [ ] Can run `npm install` in generated project
  - [ ] Can run `npm run dev` in generated project

## Adding New Templates

1. **Create template directory:**
   ```bash
   mkdir templates/template-svelte
   ```

2. **Add essential files:**
   - `package.json` (base dependencies)
   - Framework-specific config files
   - `src/` or `app/` structure
   - `_gitignore` (will be renamed to `.gitignore`)

3. **Update `src/prompts.ts`:**
   - Add framework to `FRAMEWORKS` array
   - Update prompt logic if needed

4. **Update `src/scaffolder.ts`:**
   - Update `getTemplatePath()` to handle new template
   - Add any framework-specific file processing

5. **Update `src/variants.ts`:**
   - Add variant configurations specific to the new framework

## Adding New Style Options

1. **Update `src/prompts.ts`:**
   - Add style option to `STYLES` array
   - Update prompt filters if needed

2. **Update `src/variants.ts`:**
   - Add style variant configuration with dependencies

3. **Update `src/scaffolder.ts`:**
   - Add config file generation for the style (if needed)

## Adding New State Management Options

1. **Update `src/prompts.ts`:**
   - Add option to `STATE_MANAGEMENT` array

2. **Update `src/variants.ts`:**
   - Add state management variant with dependencies and config

3. **Update templates:**
   - Add example store/state setup files to templates (optional)

## Publishing

### To publish to npm:

1. **Update version in package.json:**
   ```json
   "version": "0.2.0"
   ```

2. **Build the project:**
   ```bash
   npm run build
   ```

3. **Test locally:**
   ```bash
   npm link
   create-emd-app
   ```

4. **Publish to npm:**
   ```bash
   npm publish
   ```

### For scoped packages (@emd-cloud/create-app):

Ensure `publishConfig` in package.json allows public access:
```json
"publishConfig": {
  "access": "public"
}
```

## Troubleshooting

### CLI not running
- Ensure shebang is present: `#!/usr/bin/env node` at the start of dist/index.js
- Check file permissions: `chmod +x dist/index.js`

### Templates not found
- Verify template directories exist in the correct location
- Check that `TEMPLATES_DIR` path resolves correctly in scaffolder.ts

### Git initialization failing
- Git may not be installed or not in PATH
- This is non-critical and silently continues

### TypeScript compilation errors
- Run `npm run build` to check for errors
- Review the error messages and fix source files in `src/`

## Performance Considerations

- Templates are copied using `fs-extra` for cross-platform compatibility
- Large templates may take time to copy on slow disks
- Consider lazy-loading template directories if performance becomes an issue

## Future Improvements

- [ ] Add template validation before scaffolding
- [ ] Implement template download from remote source
- [ ] Add custom template support
- [ ] Implement incremental template updates
- [ ] Add post-install hook system
- [ ] Create template marketplace
