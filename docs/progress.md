Co# @emd-cloud/create-app - Progress Tracking

> **Last Updated:** 2025-10-24
> **Version:** 0.1.0 (v1.0.0 features integrated)

## 📋 Overview

This document tracks the evolution of `@emd-cloud/create-app` from a basic scaffolder to a comprehensive, create-vite-inspired project generator with framework-specific options, variant support, and proper template overlay system.

---

## 🎯 Project Goals

### Primary Objectives
- [x] Create CLI scaffolder for EMD Cloud projects
- [x] Support React (Vite) and Next.js frameworks
- [x] Integrate @emd-cloud/react-components by default
- [x] Implement create-vite-style architecture
- [x] Add framework-specific styling options
- [x] Support template variants (SWC, different configs)
- [x] Create proper template overlay system

### Secondary Objectives
- [ ] Add Vue, Svelte, Solid framework support
- [ ] Create marketplace for custom templates
- [ ] Add CI/CD template options
- [ ] Support Docker/deployment configurations

---

## 📊 Current Status

### Completed Features ✅

#### Core Infrastructure
- [x] Basic CLI with interactive prompts
- [x] Project name validation
- [x] Framework selection (React, Next.js)
- [x] Language selection (JS, TS)
- [x] Styling options (Vanilla CSS, SCSS, Tailwind, shadcn)
- [x] State management selection (Redux, Effector, TanStack Query)
- [x] Package manager detection (npm, yarn, pnpm, bun)
- [x] Git initialization support
- [x] ESLint/Prettier configuration

#### Templates
- [x] `template-react/` - Vite + React (JS)
- [x] `template-react-ts/` - Vite + React (TS)
- [x] `template-react-swc/` - Vite + React + SWC (JS)
- [x] `template-react-swc-ts/` - Vite + React + SWC (TS)
- [x] `template-nextjs/` - Next.js 15 (JS)
- [x] `template-nextjs-ts/` - Next.js 15 (TS)

#### Template Variants (Overlay System)
- [x] `variants/tailwind/` - Tailwind CSS configuration
- [x] `variants/shadcn/` - shadcn/ui with components
- [x] `variants/scss/` - SCSS with variables and mixins

#### Integration
- [x] @emd-cloud/react-components pre-configured
- [x] ApplicationProvider setup in all templates
- [x] Example hook usage (useAuth)
- [x] Semantic-release configuration
- [x] Build system with rimraf + tsup

#### Documentation
- [x] README.md with usage guide
- [x] CLAUDE.md for AI assistant context
- [x] DEVELOPMENT.md for contributors
- [x] IMPLEMENTATION_SUMMARY.md

---

## ✅ Completed

### Phase 1: Architecture Refactoring (Based on create-vite)

#### 1.1 Framework/Variant Structure
**Status:** ✅ Completed
**Priority:** HIGH

**Current Structure:**
```typescript
// Flat selection
Framework: 'react' | 'nextjs'
Language: 'js' | 'ts'
```

**Target Structure:**
```typescript
interface Framework {
  name: string
  display: string
  color: ColorFunc
  variants: FrameworkVariant[]
}

interface FrameworkVariant {
  name: string          // 'react', 'react-ts', 'react-swc', 'react-swc-ts'
  display: string       // 'JavaScript', 'TypeScript', 'JavaScript + SWC'
  color: ColorFunc
  customCommand?: string
}
```

**Benefits:**
- Cleaner code organization
- Easier to add new frameworks
- Framework-specific variant options
- Better terminal UX with colors

**Files to Update:**
- `src/prompts.ts` - Restructure FRAMEWORKS constant
- `src/scaffolder.ts` - Update template resolution logic
- `src/index.ts` - Update flow to handle variants

---

#### 1.2 React SWC Support
**Status:** 📝 Planned
**Priority:** HIGH
**Dependencies:** Framework/Variant structure

**What is SWC?**
- Rust-based JavaScript/TypeScript compiler
- 20x faster than Babel
- Used by Next.js, Vercel, and modern tooling
- Recommended for large React projects

**Variants to Add:**
- `react-swc` (JavaScript + SWC)
- `react-swc-ts` (TypeScript + SWC)

**Implementation Tasks:**
- [ ] Create `template-react-swc/` directory
- [ ] Create `template-react-swc-ts/` directory
- [ ] Implement `setupReactSwc()` post-processing function
- [ ] Replace `@vitejs/plugin-react` with `@vitejs/plugin-react-swc` in package.json
- [ ] Update vite.config to use SWC plugin
- [ ] Test HMR and production builds

**Post-Processing Function:**
```typescript
async function setupReactSwc(projectDir: string): Promise<void> {
  const packageJsonPath = path.join(projectDir, 'package.json')
  const packageJson = await fs.readJson(packageJsonPath)

  // Replace plugin
  delete packageJson.devDependencies['@vitejs/plugin-react']
  packageJson.devDependencies['@vitejs/plugin-react-swc'] = '^4.2.1'

  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 })

  // Update vite.config
  const viteConfigPath = path.join(projectDir, 'vite.config.js')
  let config = await fs.readFile(viteConfigPath, 'utf-8')
  config = config.replace(
    "from '@vitejs/plugin-react'",
    "from '@vitejs/plugin-react-swc'"
  )
  await fs.writeFile(viteConfigPath, config)
}
```

---

#### 1.3 Framework-Specific Styling Options
**Status:** 📝 Planned
**Priority:** MEDIUM
**Dependencies:** None

**Problem:**
Currently, ALL styling options show for ALL frameworks. Some options are React-specific (like shadcn/ui).

**Solution:**
Filter styling options based on selected framework + variant.

**Styling Matrix:**

| Framework | Vanilla CSS | SCSS | Tailwind | shadcn | Future Options |
|-----------|------------|------|----------|--------|---------------|
| React (JS) | ✅ | ✅ | ✅ | ❌ | CSS Modules, Emotion, styled-components |
| React (TS) | ✅ | ✅ | ✅ | ✅ | CSS Modules, Emotion, styled-components |
| Next.js (JS) | ✅ | ✅ | ✅ | ❌ | CSS Modules |
| Next.js (TS) | ✅ | ✅ | ✅ | ✅ | CSS Modules |
| Vue | ✅ | ✅ | ✅ | ❌ | Vue Scoped CSS, UnoCSS |
| Svelte | ✅ | ✅ | ✅ | ❌ | Svelte Scoped CSS |

**Implementation:**
```typescript
function getStyleOptions(framework: string, language: string) {
  const baseOptions = ['vanilla', 'scss', 'tailwind']

  if ((framework === 'react' || framework === 'nextjs') && language === 'ts') {
    return [...baseOptions, 'shadcn']
  }

  return baseOptions
}
```

---

### Phase 2: Template System Improvements

#### 2.1 Template Overlay Architecture
**Status:** 🔄 Design Phase
**Priority:** HIGH
**Blocking:** Proper variant support

**Current Approach:**
- Single monolithic template per framework-language combo
- Dependencies added via `getPackageJsonConfig()`
- No actual config files for styling options

**Problems:**
1. Selecting "Tailwind" doesn't create `tailwind.config.js`
2. Selecting "shadcn" doesn't create `components.json` or UI components
3. Selecting "SCSS" doesn't create example `.scss` files
4. Duplicated code across templates

**Target Architecture:**
```
templates/
├── react/
│   ├── base/                    # Shared base for all React variants
│   │   ├── package.json
│   │   ├── vite.config.js
│   │   ├── index.html
│   │   ├── src/
│   │   │   ├── main.jsx
│   │   │   └── App.jsx
│   │   └── _gitignore
│   ├── base-ts/                 # TypeScript base
│   │   ├── tsconfig.json
│   │   ├── tsconfig.node.json
│   │   ├── vite.config.ts
│   │   └── src/
│   │       ├── main.tsx
│   │       └── App.tsx
│   ├── swc/                     # SWC variant (overlay)
│   │   ├── package.json         # SWC-specific deps
│   │   └── vite.config.js       # SWC plugin config
│   ├── swc-ts/
│   │   ├── package.json
│   │   └── vite.config.ts
│   └── styling/
│       ├── tailwind/
│       │   ├── tailwind.config.js
│       │   ├── postcss.config.js
│       │   └── src/
│       │       └── index.css    # With Tailwind directives
│       ├── shadcn/
│       │   ├── components.json
│       │   ├── tailwind.config.ts
│       │   ├── lib/
│       │   │   └── utils.ts
│       │   └── components/
│       │       └── ui/
│       │           ├── button.tsx
│       │           └── card.tsx
│       └── scss/
│           └── src/
│               ├── styles/
│               │   ├── _variables.scss
│               │   └── _mixins.scss
│               └── App.scss
└── nextjs/
    ├── base/
    ├── base-ts/
    └── styling/
        └── (same structure as React)
```

**Merging Strategy:**
1. Copy base template (`react/base/` or `react/base-ts/`)
2. If variant (like SWC): overlay variant files, deep-merge package.json
3. If styling option: overlay styling files, add dependencies
4. Run post-processing functions
5. Rename special files (`_gitignore` → `.gitignore`)

**Example Flow for "React TS + SWC + Tailwind + Redux":**
```
1. Copy react/base-ts/ → target/
2. Overlay react/swc-ts/ → target/ (merge package.json, replace vite.config.ts)
3. Overlay react/styling/tailwind/ → target/ (merge configs)
4. Add Redux deps via getStateManagementConfig()
5. Run setupReactSwc(target)
6. Run setupTailwind(target, true)
7. Rename files
```

---

#### 2.2 Tailwind Configuration Templates
**Status:** 📝 Planned
**Priority:** HIGH
**Dependencies:** Template overlay system

**Current State:**
- Tailwind selected → deps added to package.json
- ❌ No `tailwind.config.js` created
- ❌ No `postcss.config.js` created
- ❌ No Tailwind directives in CSS
- ❌ No example Tailwind utility usage

**Required Files:**

**`tailwind.config.js` (JavaScript):**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**`tailwind.config.ts` (TypeScript):**
```typescript
import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config
```

**`postcss.config.js`:**
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**`src/index.css` (with Tailwind directives):**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom styles here */
```

**Implementation:**
- [ ] Create `templates/react/styling/tailwind/` directory
- [ ] Add all required config files
- [ ] Create example component using Tailwind
- [ ] Update App.jsx/tsx to use Tailwind utilities
- [ ] Test `npm run dev` and `npm run build`

---

#### 2.3 shadcn/ui Integration Templates
**Status:** 📝 Planned
**Priority:** HIGH
**Dependencies:** Tailwind templates

**Current State:**
- shadcn selected → deps added (class-variance-authority, clsx, lucide-react)
- ❌ No `components.json` created
- ❌ No `lib/utils.ts` helper
- ❌ No example UI components
- ❌ No shadcn-specific Tailwind config

**Required Files:**

**`components.json`:**
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

**`lib/utils.ts`:**
```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**`tailwind.config.ts` (shadcn-specific):**
```typescript
import type { Config } from 'tailwindcss'

export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // ... rest of shadcn color system
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config
```

**Example UI Components:**
- `components/ui/button.tsx`
- `components/ui/card.tsx`
- `components/ui/input.tsx`

**Implementation:**
- [ ] Create `templates/react/styling/shadcn/` directory
- [ ] Add components.json
- [ ] Add lib/utils.ts
- [ ] Add shadcn-specific Tailwind config
- [ ] Add example UI components
- [ ] Update App.tsx to use shadcn components
- [ ] Add `tailwindcss-animate` to dependencies
- [ ] Update tsconfig paths for `@/` alias

---

#### 2.4 SCSS Template Files
**Status:** 📝 Planned
**Priority:** MEDIUM
**Dependencies:** Template overlay system

**Current State:**
- SCSS selected → `sass` added to devDependencies
- ❌ No example `.scss` files
- ❌ No SCSS imports in components
- ❌ No SCSS variables/mixins examples

**Required Files:**

**`src/styles/_variables.scss`:**
```scss
// Colors
$primary-color: #667eea;
$secondary-color: #764ba2;
$text-color: #333;
$background-color: #ffffff;

// Spacing
$spacing-unit: 8px;

// Breakpoints
$breakpoint-mobile: 768px;
$breakpoint-tablet: 1024px;
```

**`src/styles/_mixins.scss`:**
```scss
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

@mixin responsive($breakpoint) {
  @media (max-width: $breakpoint) {
    @content;
  }
}
```

**`src/App.scss`:**
```scss
@import './styles/variables';
@import './styles/mixins';

.App {
  @include flex-center;
  min-height: 100vh;
  background: linear-gradient(135deg, $primary-color 0%, $secondary-color 100%);

  &-header {
    color: white;
    padding: $spacing-unit * 3;
  }
}
```

**Implementation:**
- [ ] Create `templates/react/styling/scss/` directory
- [ ] Add example SCSS files
- [ ] Update App.jsx/tsx to import `.scss`
- [ ] Remove vanilla CSS imports
- [ ] Test SCSS compilation

---

### Phase 3: Advanced Features

#### 3.1 Post-Processing Pipeline
**Status:** 📝 Planned
**Priority:** MEDIUM
**Dependencies:** Template overlay system

**Post-Processing Functions Needed:**

```typescript
// SWC setup
async function setupReactSwc(projectDir: string): Promise<void>

// Tailwind setup
async function setupTailwind(projectDir: string, isTS: boolean): Promise<void>

// shadcn setup
async function setupShadcn(projectDir: string): Promise<void>

// SCSS setup
async function setupScss(projectDir: string): Promise<void>

// State management setup
async function setupRedux(projectDir: string, isTS: boolean): Promise<void>
async function setupEffector(projectDir: string, isTS: boolean): Promise<void>
async function setupTanStackQuery(projectDir: string, isTS: boolean): Promise<void>
```

**Pipeline Execution:**
```typescript
async function scaffoldProject(inputs: UserInputs): Promise<void> {
  // 1. Copy base template
  await copyBaseTemplate(inputs)

  // 2. Overlay variant (if applicable)
  if (inputs.variant === 'swc') {
    await overlayVariant(inputs)
    await setupReactSwc(targetDir)
  }

  // 3. Overlay styling
  switch (inputs.style) {
    case 'tailwind':
      await overlayStyle('tailwind', inputs)
      await setupTailwind(targetDir, inputs.language === 'ts')
      break
    case 'shadcn':
      await overlayStyle('shadcn', inputs)
      await setupShadcn(targetDir)
      break
    case 'scss':
      await overlayStyle('scss', inputs)
      await setupScss(targetDir)
      break
  }

  // 4. Setup state management
  if (inputs.stateManagement !== 'none') {
    await setupStateManagement(inputs)
  }

  // 5. Finalize
  await updateTemplateFiles(targetDir, inputs)
  await createEslintConfig(targetDir, inputs)
  await createPrettierConfig(targetDir)
  if (inputs.initGit) initializeGit(targetDir)
}
```

---

#### 3.2 Color-Coded Terminal Output
**Status:** 📝 Planned
**Priority:** LOW
**Dependencies:** Framework/Variant structure

**Current:** Plain text prompts
**Target:** Color-coded framework and variant options (like create-vite)

**Implementation:**
```typescript
import { cyan, green, yellow, blue, magenta } from 'kolorist'

const FRAMEWORKS: Framework[] = [
  {
    name: 'react',
    display: 'React + Vite',
    color: cyan,
    variants: [
      { name: 'react', display: 'JavaScript', color: yellow },
      { name: 'react-ts', display: 'TypeScript', color: blue },
      { name: 'react-swc', display: 'JavaScript + SWC', color: yellow },
      { name: 'react-swc-ts', display: 'TypeScript + SWC', color: blue },
    ]
  },
  {
    name: 'nextjs',
    display: 'Next.js 15',
    color: cyan,
    variants: [
      { name: 'nextjs', display: 'JavaScript', color: yellow },
      { name: 'nextjs-ts', display: 'TypeScript', color: blue },
    ]
  }
]
```

**Prompt Display:**
```
? Choose a framework: › - Use arrow-keys. Return to submit.
❯   React + Vite     (cyan)
    Next.js 15       (cyan)

? Select a variant: › - Use arrow-keys. Return to submit.
    JavaScript       (yellow)
❯   TypeScript       (blue)
    JavaScript + SWC (yellow)
    TypeScript + SWC (blue)
```

---

## 🔮 Future Framework Support

### Vue 3 Support
**Status:** 📝 Planned
**Priority:** MEDIUM

**Variants:**
- Vue 3 (JS)
- Vue 3 (TS)
- Vue 3 + Composition API
- Vue 3 + Composition API (TS)

**Styling Options:**
- Vanilla CSS
- SCSS
- Tailwind CSS
- Vue Scoped CSS
- UnoCSS

---

### Svelte Support
**Status:** 📝 Planned
**Priority:** MEDIUM

**Variants:**
- Svelte (JS)
- Svelte (TS)
- SvelteKit (JS)
- SvelteKit (TS)

**Styling Options:**
- Vanilla CSS
- SCSS
- Tailwind CSS
- Svelte Scoped CSS

---

### Solid.js Support
**Status:** 📝 Planned
**Priority:** LOW

**Variants:**
- Solid (JS)
- Solid (TS)
- SolidStart (TS)

---

## 📝 Technical Debt & Known Issues

### High Priority
- [ ] **Issue #1:** Styling templates don't create actual config files
  - **Impact:** Users manually create `tailwind.config.js`, etc.
  - **Solution:** Template overlay system + post-processing

- [ ] **Issue #2:** No React SWC support
  - **Impact:** Missing modern, fast compiler option
  - **Solution:** Add SWC variants and post-processing

- [ ] **Issue #3:** shadcn selected but no UI components created
  - **Impact:** Users expect shadcn components, get empty project
  - **Solution:** Add shadcn variant with example components

### Medium Priority
- [ ] **Issue #4:** All styling options show for all frameworks
  - **Impact:** Confusing UX, shows irrelevant options
  - **Solution:** Framework-specific filtering

- [ ] **Issue #5:** Template duplication across JS/TS variants
  - **Impact:** Hard to maintain, bugs in one miss the other
  - **Solution:** Template overlay architecture

### Low Priority
- [ ] **Issue #6:** No custom command support
  - **Impact:** Can't delegate to external scaffolders
  - **Solution:** Add customCommand to variants

---

## 📚 Architecture Decisions

### ADR-001: Template Overlay vs. Monolithic Templates
**Date:** 2025-10-24
**Status:** Accepted

**Context:**
Current approach: Each framework-language-styling combo = separate template directory.
Problem: Massive duplication, hard to maintain.

**Decision:**
Adopt template overlay system inspired by create-vite:
- Base templates for each framework-language
- Variant overlays (SWC, styling, etc.)
- Deep merge strategy for configs
- Post-processing for complex transformations

**Consequences:**
- ✅ Easier to maintain
- ✅ Add new options without full template duplication
- ✅ More flexible and extensible
- ⚠️ More complex scaffolder logic
- ⚠️ Requires thorough testing

---

### ADR-002: Framework-Specific vs. Universal Options
**Date:** 2025-10-24
**Status:** Accepted

**Context:**
Some styling options (shadcn) are React ecosystem-specific.
Question: Show all options for all frameworks, or filter by framework?

**Decision:**
Filter options based on selected framework + variant.

**Rationale:**
- Better UX - users only see relevant options
- Prevents confusion
- Easier to add framework-specific features
- Matches create-vite approach

**Consequences:**
- ✅ Cleaner UX
- ✅ Framework-appropriate defaults
- ⚠️ More complex prompt logic
- ⚠️ Need to maintain option matrices

---

### ADR-003: @emd-cloud/sdk as Direct vs. Peer Dependency
**Date:** 2025-10-24
**Status:** Accepted

**Context:**
Templates use @emd-cloud/react-components which has @emd-cloud/sdk as peer dependency.

**Decision:**
Remove @emd-cloud/sdk as direct dependency from templates.
Let package managers install it as peer dependency.

**Rationale:**
- Avoids version conflicts
- Follows npm best practices
- Reduces bundle duplication
- Matches @emd-cloud/react-components architecture

---

## 🎨 Design Principles

1. **Progressive Enhancement:** Start simple, add complexity as needed
2. **Framework Parity:** Each framework should have equivalent feature support
3. **Configuration Over Code:** Prefer config files over code generation where possible
4. **Sensible Defaults:** Every option should have a good default value
5. **Documentation First:** Document features before implementing
6. **Test Everything:** Every template combination must be tested

---

## 🧪 Testing Strategy

### Manual Testing Checklist
Before each release, test all combinations:

**React:**
- [ ] React + JS + Vanilla CSS + No State
- [ ] React + JS + SCSS + Redux
- [ ] React + JS + Tailwind + TanStack Query
- [ ] React + TS + Vanilla CSS + No State
- [ ] React + TS + SCSS + Effector
- [ ] React + TS + Tailwind + Redux
- [ ] React + TS + shadcn + TanStack Query
- [ ] React + SWC + JS + Tailwind
- [ ] React + SWC + TS + shadcn

**Next.js:**
- [ ] Next.js + JS + Vanilla CSS
- [ ] Next.js + JS + SCSS
- [ ] Next.js + JS + Tailwind
- [ ] Next.js + TS + Vanilla CSS
- [ ] Next.js + TS + SCSS
- [ ] Next.js + TS + Tailwind
- [ ] Next.js + TS + shadcn

### Automated Testing
- [ ] Unit tests for prompt validation
- [ ] Unit tests for template resolution
- [ ] Unit tests for file merging
- [ ] Integration tests for template generation
- [ ] E2E tests: Generate project → npm install → npm run dev

---

## 📦 Release Plan

### v0.1.0 (Current)
- ✅ Basic scaffolder
- ✅ React and Next.js support
- ✅ @emd-cloud/react-components integration

### v0.2.0 (Next - Template Improvements)
- [ ] Template overlay system
- [ ] Tailwind config files
- [ ] shadcn config files + components
- [ ] SCSS example files

### v0.3.0 (SWC Support)
- [ ] React SWC variants
- [ ] Post-processing pipeline
- [ ] Framework/Variant structure

### v0.4.0 (UX Improvements)
- [ ] Color-coded terminal output
- [ ] Framework-specific option filtering
- [ ] Better error messages

### v1.0.0 (Stable Release)
- [ ] All template combinations tested
- [ ] Comprehensive documentation
- [ ] CI/CD automated testing
- [ ] Performance optimizations

### v1.x.0 (Future Frameworks)
- [ ] Vue 3 support
- [ ] Svelte support
- [ ] Solid.js support

---

## 🤝 Contributing Guidelines

### Adding a New Framework
1. Create `templates/{framework}/base/` and `templates/{framework}/base-ts/`
2. Add framework to `FRAMEWORKS` array in `src/prompts.ts`
3. Update `getTemplatePath()` in `src/scaffolder.ts`
4. Add framework-specific styling options
5. Create tests for all combinations
6. Update documentation

### Adding a New Styling Option
1. Create `templates/{framework}/styling/{option}/` directory
2. Add all required config files
3. Update style filtering logic in `src/prompts.ts`
4. Add post-processing function if needed
5. Test with both JS and TS variants

### Adding a New Variant
1. Create `templates/{framework}/{variant}/` directory
2. Add variant to framework's `variants` array
3. Implement post-processing function if needed
4. Update template resolution logic
5. Test integration with all styling options

---

## 📞 Support & Questions

For questions about this progress document or implementation details:
- Create GitHub issue: https://github.com/EMD-Cloud/create-app/issues
- Check CLAUDE.md for AI assistant guidance
- Review DEVELOPMENT.md for development setup

---

**Last Updated:** 2025-10-24
**Maintainer:** Vladislav Pavlik <vpavlik@emd.one>
