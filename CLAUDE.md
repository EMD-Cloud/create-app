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
   - **Phase 4 (Overlay):** Applies language and framework-specific style variant overlays
     - Determines language (js or ts) from variant name
     - Determines framework type (react vs nextjs)
     - For React: checks if SWC-specific variant exists (tailwind/shadcn have react-swc variants)
     - Copies from `templates/variants/{style}/{language}/{framework}/` to project directory
     - Overwrites existing files with variant-specific versions (CSS, configs, components)
   - **Phase 5 (Config):** Generates ESLint and Prettier configs if selected
   - **Phase 6 (Git):** Runs git init/add/commit if requested (fails silently)

4. **Variants** (`src/variants.ts`)
   - Pure functions that return `TemplateVariant` objects
   - `getStyleVariant()` - Returns dependencies for CSS/SCSS/Tailwind/shadcn
   - `getStateManagementVariant()` - Returns dependencies for Redux/Effector/TanStack Query
   - Variants are read but not actively used in current version (code prepared for future expansion)

### Template System

**Architecture:** Template overlay system with framework-specific style variants

**Base Templates** (`templates/template-{variant}/`):
- `template-react/` - Vite + React, JavaScript (NO CSS files)
- `template-react-ts/` - Vite + React, TypeScript (NO CSS files)
- `template-react-swc/` - Vite + React + SWC, JavaScript (NO CSS files)
- `template-react-swc-ts/` - Vite + React + SWC, TypeScript (NO CSS files)
- `template-nextjs/` - Next.js, JavaScript (NO CSS files)
- `template-nextjs-ts/` - Next.js, TypeScript (NO CSS files)

**Style Variant Overlays** (`templates/variants/{style}/{language}/{framework}/`):
All styling is provided by language and framework-specific variants:

- `variants/vanilla/js/react/` - Plain CSS for React/Vite JS templates
- `variants/vanilla/js/nextjs/` - Plain CSS for Next.js JS templates
- `variants/vanilla/ts/react/` - Plain CSS for React/Vite TS templates
- `variants/vanilla/ts/nextjs/` - Plain CSS for Next.js TS templates
- `variants/scss/js/react/` - SCSS for React JS (includes App.jsx with .scss imports)
- `variants/scss/js/nextjs/` - SCSS for Next.js JS (includes layout.js with .scss import)
- `variants/scss/ts/react/` - SCSS for React TS (includes App.tsx with .scss imports)
- `variants/scss/ts/nextjs/` - SCSS for Next.js TS (includes layout.tsx with .scss import)
- `variants/tailwind/js/react/` - Tailwind for React JS (vite.config.js with plugin)
- `variants/tailwind/js/react-swc/` - Tailwind for React SWC JS (vite.config.js)
- `variants/tailwind/js/nextjs/` - Tailwind for Next.js JS (postcss.config.mjs)
- `variants/tailwind/ts/react/` - Tailwind for React TS (vite.config.ts with plugin)
- `variants/tailwind/ts/react-swc/` - Tailwind for React SWC TS (vite.config.ts)
- `variants/tailwind/ts/nextjs/` - Tailwind for Next.js TS (postcss.config.mjs)
- `variants/shadcn/js/react/` - shadcn/ui for React JS (vite.config.js + .jsx components)
- `variants/shadcn/js/react-swc/` - shadcn/ui for React SWC JS (vite.config.js + .jsx)
- `variants/shadcn/js/nextjs/` - shadcn/ui for Next.js JS (postcss + .jsx components)
- `variants/shadcn/ts/react/` - shadcn/ui for React TS (vite.config.ts + .tsx components)
- `variants/shadcn/ts/react-swc/` - shadcn/ui for React SWC TS (vite.config.ts + .tsx)
- `variants/shadcn/ts/nextjs/` - shadcn/ui for Next.js TS (postcss + .tsx components)

**How it works:**
1. Base template copied to target directory (no styling files)
2. Language determined from variant name (contains '-ts' → TypeScript, else JavaScript)
3. Language and framework-specific variant overlay copied over base (provides all styling)
4. Variant includes CSS/SCSS files, config files (.js or .ts), and code files (.jsx or .tsx)
5. All configs are static files in variants (no dynamic generation)

**Each base template must include:**
- `package.json` (base deps only, variants add more)
- Framework config file (minimal vite.config, next.config, tsconfig)
- Entry files with CSS imports (src/main.jsx/tsx, app/layout.js/tsx)
- `_gitignore` (underscore prefix gets renamed to .gitignore)
- NO CSS files (variants provide them)

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
- Generated dynamically in `createEslintConfig()` using ESLint 9 flat config format
- **Standard preset**: Uses `neostandard` package (successor to eslint-config-standard for ESLint 9)
  - Built-in TypeScript support via `ts: true` option
- **Airbnb preset**: Uses `eslint-config-airbnb-extended` package (ESLint 9 compatible)
  - Built-in React and TypeScript support
- **Recommended preset**: Uses `@eslint/js` with `eslint-plugin-react` and `eslint-plugin-react-hooks`
  - TypeScript support via `@typescript-eslint/eslint-plugin` and `@typescript-eslint/parser`
- Both neostandard and airbnb-extended bundle all necessary plugins

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

4. Create language and framework-specific variant directories:
   ```bash
   mkdir -p templates/variants/{style-name}/js/react
   mkdir -p templates/variants/{style-name}/js/nextjs
   mkdir -p templates/variants/{style-name}/ts/react
   mkdir -p templates/variants/{style-name}/ts/nextjs
   # If needed for SWC:
   mkdir -p templates/variants/{style-name}/js/react-swc
   mkdir -p templates/variants/{style-name}/ts/react-swc
   ```

5. Add all necessary files to each variant directory:
   - CSS/SCSS files (src/App.css, src/index.css for React; src/app/globals.css for Next.js)
   - Config files with correct extension (vite.config.js for JS, vite.config.ts for TS)
   - Code files with correct extension (.jsx/.js for JS variants, .tsx/.ts for TS variants)
   - App/main/layout files if imports need to change (e.g., .scss instead of .css)
   - Components (for shadcn) or utility files as needed

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
- **All styling through variants:** Base templates contain NO CSS files. All styling (including vanilla CSS) comes from language and framework-specific variant overlays.
- **Language-based variant selection:** Scaffolder determines language (js/ts) from variant name and selects appropriate variant subdirectory.
- **Framework-specific variants:** Scaffolder automatically selects the correct variant subdirectory (react/nextjs/react-swc) based on user selections.
- **No file pollution:** JS projects only get .jsx/.js files, TS projects only get .tsx/.ts files.
- **Static config files:** All configuration files (vite.config.js/ts, postcss.config, etc.) are static files in variants, not dynamically generated.
- **Path aliases pre-configured:** TypeScript templates already include path aliases (`@/*` → `./src/*`) in tsconfig, no dynamic modification needed.
- **shadcn supports JavaScript:** shadcn/ui is now available for both JavaScript and TypeScript projects.
- **Silent failures:** Git initialization and file operations catch and ignore errors to avoid blocking project creation

## All Templates Pre-configure @emd-cloud/react-components

Every generated project includes `@emd-cloud/react-components` (v1.14.0+) in dependencies. This library provides:
- ApplicationProvider for SDK initialization
- React hooks: useAuth, useDatabase, useWebhook, useUploader
- TypeScript types from @emd-cloud/sdk

**All EMD dependencies are explicitly installed:**
- `@emd-cloud/react-components`: ^1.14.0
- `@emd-cloud/sdk`: ^1.11.0 (peer dependency)
- `tus-js-client`: ^4.3.1 (peer dependency)
- `uuid`: ^13.0.0 (peer dependency)

Explicitly installing peer dependencies ensures consistent versions across all package managers.

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
