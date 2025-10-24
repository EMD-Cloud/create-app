# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Does

**@emd-cloud/create-app** is a CLI scaffolder tool inspired by `create-vite` architecture. It guides users through interactive prompts to create EMD Cloud projects with customizable frameworks, variants (JS/TS/SWC), styling (vanilla CSS, SCSS, Tailwind, shadcn), and state management. Features a template overlay system for modular configuration.

**Published as:** `@emd-cloud/create-app` on npm
**Entry:** `npm create @emd-cloud/app@latest`
**Requires:** Node.js >=18.0.0
**Type:** ESM (ES modules)

## Development Commands

```bash
# Test CLI interactively (uses tsx to run TypeScript directly)
npm run dev

# Build TypeScript to JavaScript (outputs to dist/ with shebang)
npm run build

# Run tests
npm test

# Local npm link testing (after build)
npm link
create-emd-app  # Test the CLI globally

# Cleanup link
npm unlink -g @emd-cloud/create-app
```

## Codebase Architecture

### Execution Flow

1. **CLI Entry** (`src/index.ts`)
   - Displays welcome message
   - Calls `getUserInputs()` for interactive prompts
   - Calls `scaffoldProject()` with user choices
   - Shows next steps with appropriate package manager commands

2. **Prompt System** (`src/prompts.ts`)
   - **Framework/Variant Architecture:** Uses hierarchical structure inspired by create-vite
     - `Framework[]` contains multiple `FrameworkVariant[]` with color-coded display
     - Variants encode both framework and language: 'react-ts', 'react-swc', 'nextjs-ts'
   - `getStyleOptions()` filters available styles based on framework/variant
     - shadcn only available for TypeScript variants in React/Next.js
   - Uses `prompts` library for interactive CLI with color-coded choices (kolorist)
   - Auto-detects package manager from `npm_config_user_agent` env var
   - Generates `installCommand` and `devCommand` strings based on selected PM

3. **Scaffolding** (`src/scaffolder.ts`)
   - **Phase 1 (Copy):** Copies base template from `templates/template-{variant}/` to target directory
   - **Phase 2 (Merge):** Calls `getPackageJsonConfig()` to build dependency list
   - **Phase 3 (Update):**
     - Merges deps into package.json using `deepMerge()`
     - Renames underscore-prefixed files (_gitignore → .gitignore) recursively
     - Updates project name in HTML/JSX files
   - **Phase 4 (Overlay):** Applies style variant overlays from `templates/variants/{style}/`
     - Copies configuration files (tailwind.config, postcss.config, etc.)
     - Overwrites existing files with variant-specific versions
   - **Phase 5 (Post-process):** Runs style-specific setup functions
     - `setupShadcnPaths()` - Adds TypeScript path aliases and Vite resolve config
   - **Phase 6 (Config):** Generates ESLint and Prettier configs if selected
   - **Phase 7 (Git):** Runs git init/add/commit if requested (fails silently)

4. **Variants** (`src/variants.ts`)
   - Pure functions that return `TemplateVariant` objects
   - `getStyleVariant()` - Returns dependencies for CSS/SCSS/Tailwind/shadcn
   - `getStateManagementVariant()` - Returns dependencies for Redux/Effector/TanStack Query
   - Variants are read but not actively used in current version (code prepared for future expansion)

### Template System

**Architecture:** Template overlay system inspired by create-vite

**Base Templates** (`templates/template-{variant}/`):
- `template-react/` - Vite + React, JavaScript
- `template-react-ts/` - Vite + React, TypeScript
- `template-react-swc/` - Vite + React + SWC, JavaScript
- `template-react-swc-ts/` - Vite + React + SWC, TypeScript
- `template-nextjs/` - Next.js, JavaScript
- `template-nextjs-ts/` - Next.js, TypeScript

**Variant Overlays** (`templates/variants/{style}/`):
- `variants/tailwind/` - Tailwind CSS config, PostCSS, @tailwind directives
- `variants/shadcn/` - shadcn/ui components, utils, theme CSS variables
- `variants/scss/` - SCSS variables, mixins, nested styles

**How it works:**
1. Base template copied to target directory
2. Variant overlay files copied over base (overwrites existing)
3. Post-processing functions adjust configs (tsconfig paths, vite aliases)

**Each template must include:**
- `package.json` (base deps only, variants add more)
- Framework config file (vite.config.js/ts, next.config.js, tsconfig.json for TS)
- Entry files (src/main.jsx/tsx for Vite, app/layout/page.jsx/tsx for Next)
- `_gitignore` (underscore prefix gets renamed to .gitignore)
- Basic styling files

**Template path resolution:**
```typescript
const templateName = framework === 'nextjs'
  ? `template-nextjs${language === 'ts' ? '-ts' : ''}`
  : `template-react${language === 'ts' ? '-ts' : ''}`
```

### Key Technical Details

**Package.json Merging**
- Base template has minimal deps
- `getPackageJsonConfig()` builds full dependency list from variants
- `deepMerge()` recursively combines objects (for nested objects like scripts)
- Handles dependencies, devDependencies, and scripts

**File Naming Convention**
- Templates use `_gitignore` instead of `.gitignore` (git doesn't track .gitignore templates properly)
- `updateTemplateFiles()` recursively renames `_*` files to `.*`
- Also handles nested directories via `walkDir()` function

**Package Manager Detection**
- Read from `npm_config_user_agent` environment variable
- Fallback order: bun → yarn → pnpm → npm
- Used to pre-select default in prompts
- Generates correct commands: `npm run dev` vs `yarn dev` vs `pnpm dev` vs `bun run dev`

**ESLint Configuration**
- Generated dynamically in `createEslintConfig()`
- Extends differ by preset: "eslint:recommended" (standard) vs airbnb vs none
- TypeScript projects include `plugin:@typescript-eslint/recommended`
- Preset dependencies added to devDependencies automatically

**Prettier Configuration**
- Same config for all projects
- 100 char line width, 2 space tabs, single quotes, trailing commas

## Extension Guide

### Adding a New Framework

1. Create template directories:
   ```bash
   mkdir templates/template-{name}
   mkdir templates/template-{name}-ts
   ```

2. Add framework to `FRAMEWORKS` array in `src/prompts.ts`:
   ```typescript
   { name: 'Framework Name', value: 'frameworkkey', color: cyan }
   ```

3. Update `getTemplatePath()` in `src/scaffolder.ts` to handle the new framework

4. Add framework-specific file processing to `updateTemplateFiles()` if needed

5. Create templates with required files (see "Each template must include" above)

### Adding a Styling Option

1. Add to `STYLES` array in `src/prompts.ts`

2. Update the style filter function if adding conditional visibility:
   ```typescript
   choices: (prev: string) => {
     // prev contains the language value
     // Return filtered STYLES array
   }
   ```

3. Add variant in `src/variants.ts` `getStyleVariant()` function with dependencies

### Adding a State Management Option

1. Add to `STATE_MANAGEMENT` array in `src/prompts.ts`

2. Add variant in `src/variants.ts` `getStateManagementVariant()` function with dependencies

3. If framework-specific, add logic like:
   ```typescript
   if (framework !== 'react' && framework !== 'nextjs') return null
   ```

## Important Implementation Notes

- **ESM imports with .js extension:** TypeScript files import other TypeScript modules with `.js` extension (`import { ... } from './file.js'`). This is required for ESM modules.
- **Templates included in npm package:** Both `dist/` and `templates/` directories are in `files` array of package.json
- **Shebang handling:** tsup automatically adds `#!/usr/bin/env node` to dist/index.js when using `--shebang` flag
- **No separate variant merging:** While `variants.ts` exists for future expansion, variants aren't actively merged in current code—all dependencies are added in `getPackageJsonConfig()`
- **Silent failures:** Git initialization and file operations catch and ignore errors to avoid blocking project creation

## All Templates Pre-configure @emd-cloud/react-components

Every generated project includes `@emd-cloud/react-components` (v1.13.6+) in dependencies. This library provides:
- ApplicationProvider for SDK initialization
- React hooks: useAuth, useDatabase, useWebhook, useUploader
- TypeScript types from @emd-cloud/sdk

**@emd-cloud/sdk is a peer dependency** and gets installed automatically.

### Template Integration

**React templates (Vite):**
```javascript
import { ApplicationProvider, useAuth } from '@emd-cloud/react-components'

function App() {
  return (
    <ApplicationProvider
      app={import.meta.env.VITE_EMD_APP_ID || 'your-app-id'}
      apiUrl="https://api.emd.one"
    >
      <AppContent />
    </ApplicationProvider>
  )
}
```

**Next.js templates:**
```javascript
// app/layout.jsx/tsx
import { ApplicationProvider } from '@emd-cloud/react-components'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ApplicationProvider app={process.env.NEXT_PUBLIC_EMD_APP_ID}>
          {children}
        </ApplicationProvider>
      </body>
    </html>
  )
}
```

Users can immediately use hooks like `useAuth()` in any child component.

## Testing the CLI

After changes, test the complete flow:

```bash
npm run build
npm run dev

# In prompts:
# 1. Project name: test-app
# 2. Framework: react or nextjs
# 3. Language: js or ts
# 4. Style: vanilla, scss, tailwind, shadcn (shadcn only for TS)
# 5. State: redux, effector, tanstack-query, none
# 6. Package manager: auto-detected or selected
# 7. Git: yes or no
# 8. ESLint: standard, airbnb, or none

# Verify generated project:
cd test-app
npm install
npm run dev  # Should start without errors
```
