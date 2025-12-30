import { describe, it, expect } from 'vitest'
import { getPackageJsonConfig, deepMerge } from '../../scaffolder.js'
import { getTemplateVariants } from '../../variants.js'
import type { UserInputs } from '../../prompts.js'

describe('scaffolder integration', () => {
  const createMockInputs = (overrides: Partial<UserInputs>): UserInputs => ({
    projectName: 'test-app',
    framework: 'react',
    variant: 'react-ts',
    style: 'vanilla',
    stateManagement: 'none',
    packageManager: 'npm',
    initGit: false,
    eslintPreset: 'none',
    installCommand: 'npm install',
    devCommand: 'npm run dev',
    ...overrides,
  })

  describe('Full dependency resolution flow', () => {
    it('should correctly resolve all dependencies for React + Tailwind + Redux + ESLint', async () => {
      const inputs = createMockInputs({
        variant: 'react-ts',
        style: 'tailwind',
        stateManagement: 'redux',
        eslintPreset: 'standard',
      })

      // Get the package.json configuration
      const config = await getPackageJsonConfig(inputs)

      // Verify Tailwind CSS dependencies
      expect(config.dependencies).toHaveProperty('tailwindcss')
      expect(config.devDependencies).toHaveProperty('@tailwindcss/vite')

      // Verify Redux dependencies
      expect(config.dependencies).toHaveProperty('@reduxjs/toolkit')
      expect(config.dependencies).toHaveProperty('react-redux')

      // Verify ESLint dependencies (neostandard bundles all plugins)
      expect(config.devDependencies).toHaveProperty('eslint')
      expect(config.devDependencies).toHaveProperty('neostandard')

      // Verify Prettier is always included
      expect(config.devDependencies).toHaveProperty('prettier')
    })

    it('should correctly resolve all dependencies for React + shadcn + TanStack Query + Airbnb ESLint', async () => {
      const inputs = createMockInputs({
        variant: 'react-ts',
        style: 'shadcn',
        stateManagement: 'tanstack-query',
        eslintPreset: 'airbnb',
      })

      const config = await getPackageJsonConfig(inputs)

      // Verify shadcn dependencies (includes Tailwind)
      expect(config.dependencies).toHaveProperty('tailwindcss')
      expect(config.dependencies).toHaveProperty('class-variance-authority')
      expect(config.dependencies).toHaveProperty('clsx')
      expect(config.dependencies).toHaveProperty('tailwind-merge')
      expect(config.dependencies).toHaveProperty('lucide-react')

      // Verify TanStack Query
      expect(config.dependencies).toHaveProperty('@tanstack/react-query')

      // Verify Airbnb ESLint (eslint-config-airbnb-extended bundles all plugins)
      expect(config.devDependencies).toHaveProperty('eslint-config-airbnb-extended')
    })

    it('should correctly resolve dependencies for Next.js + SCSS + Effector', async () => {
      const inputs = createMockInputs({
        framework: 'nextjs',
        variant: 'nextjs-ts',
        style: 'scss',
        stateManagement: 'effector',
        eslintPreset: 'standard',
      })

      const config = await getPackageJsonConfig(inputs)

      // Verify SCSS
      expect(config.devDependencies).toHaveProperty('sass')

      // Verify Effector
      expect(config.dependencies).toHaveProperty('effector')
      expect(config.dependencies).toHaveProperty('effector-react')

      // Verify ESLint
      expect(config.devDependencies).toHaveProperty('eslint')
    })

    it('should use PostCSS for Next.js + Tailwind (not Vite plugin)', async () => {
      const inputs = createMockInputs({
        framework: 'nextjs',
        variant: 'nextjs-ts',
        style: 'tailwind',
        stateManagement: 'none',
        eslintPreset: 'none',
      })

      const config = await getPackageJsonConfig(inputs)

      // Next.js should use PostCSS approach
      expect(config.dependencies).toHaveProperty('tailwindcss', '^4.1.16')
      expect(config.devDependencies).toHaveProperty('@tailwindcss/postcss', '^4.1.16')
      expect(config.devDependencies).toHaveProperty('postcss', '^8.4.51')
      // Should NOT have Vite plugin
      expect(config.devDependencies).not.toHaveProperty('@tailwindcss/vite')
    })

    it('should use PostCSS for Next.js + shadcn (not Vite plugin)', async () => {
      const inputs = createMockInputs({
        framework: 'nextjs',
        variant: 'nextjs-ts',
        style: 'shadcn',
        stateManagement: 'none',
        eslintPreset: 'none',
      })

      const config = await getPackageJsonConfig(inputs)

      // Next.js should use PostCSS approach
      expect(config.dependencies).toHaveProperty('tailwindcss', '^4.1.16')
      expect(config.dependencies).toHaveProperty('tw-animate-css', '^1.0.5')
      expect(config.devDependencies).toHaveProperty('@tailwindcss/postcss', '^4.1.16')
      expect(config.devDependencies).toHaveProperty('postcss', '^8.4.51')
      // Should NOT have Vite plugin
      expect(config.devDependencies).not.toHaveProperty('@tailwindcss/vite')
    })
  })

  describe('Variant resolution flow', () => {
    it('should get correct variants for style and state management', () => {
      const inputs = createMockInputs({
        variant: 'react-ts',
        style: 'scss',
        stateManagement: 'redux',
      })

      const variants = getTemplateVariants(inputs)

      expect(variants).toHaveLength(2)
      expect(variants.map(v => v.name)).toContain('scss')
      expect(variants.map(v => v.name)).toContain('redux')
    })

    it('should exclude shadcn for JavaScript variants', () => {
      const inputs = createMockInputs({
        variant: 'react', // JavaScript
        style: 'shadcn',
        stateManagement: 'none',
      })

      const variants = getTemplateVariants(inputs)

      // shadcn should not be included for JavaScript
      expect(variants.map(v => v.name)).not.toContain('shadcn')
    })

    it('should exclude state management for non-React/Next.js frameworks', () => {
      const inputs = createMockInputs({
        framework: 'vue',
        variant: 'vue-ts',
        style: 'vanilla',
        stateManagement: 'redux',
      })

      const variants = getTemplateVariants(inputs)

      // Redux should not be included for Vue
      expect(variants.map(v => v.name)).not.toContain('redux')
    })
  })

  describe('Package.json merging flow', () => {
    it('should deep merge base package.json with variant dependencies', () => {
      const basePackageJson = {
        name: 'test-app',
        version: '0.0.1',
        dependencies: {
          react: '^18.2.0',
          'react-dom': '^18.2.0',
        },
        devDependencies: {
          vite: '^5.0.8',
        },
      }

      const variantDeps = {
        dependencies: {
          tailwindcss: '^3.3.6',
        },
        devDependencies: {
          postcss: '^8.4.31',
          autoprefixer: '^10.4.16',
        },
      }

      const merged = deepMerge(basePackageJson, variantDeps)

      // Base props should remain
      expect(merged.name).toBe('test-app')
      expect(merged.version).toBe('0.0.1')

      // Dependencies should be merged
      expect(merged.dependencies).toHaveProperty('react')
      expect(merged.dependencies).toHaveProperty('react-dom')
      expect(merged.dependencies).toHaveProperty('tailwindcss')

      // DevDependencies should be merged
      expect(merged.devDependencies).toHaveProperty('vite')
      expect(merged.devDependencies).toHaveProperty('postcss')
      expect(merged.devDependencies).toHaveProperty('autoprefixer')
    })

    it('should handle multiple variant dependency merges', () => {
      let packageJson: Record<string, any> = {
        dependencies: {},
        devDependencies: {},
      }

      // Add style variant
      packageJson = deepMerge(packageJson, {
        dependencies: { tailwindcss: '^3.3.6' },
        devDependencies: { postcss: '^8.4.31' },
      })

      // Add state management variant
      packageJson = deepMerge(packageJson, {
        dependencies: {
          '@reduxjs/toolkit': '^1.9.7',
          'react-redux': '^8.1.3',
        },
      })

      // Add ESLint
      packageJson = deepMerge(packageJson, {
        devDependencies: {
          eslint: '^8.55.0',
          'eslint-plugin-react': '^7.33.2',
        },
      })

      expect(packageJson.dependencies).toHaveProperty('tailwindcss')
      expect(packageJson.dependencies).toHaveProperty('@reduxjs/toolkit')
      expect(packageJson.dependencies).toHaveProperty('react-redux')
      expect(packageJson.devDependencies).toHaveProperty('postcss')
      expect(packageJson.devDependencies).toHaveProperty('eslint')
      expect(packageJson.devDependencies).toHaveProperty('eslint-plugin-react')
    })
  })

  describe('Complex scenarios', () => {
    it('should handle maximum complexity: React SWC + shadcn + TanStack Query + Airbnb', async () => {
      const inputs = createMockInputs({
        variant: 'react-swc-ts',
        style: 'shadcn',
        stateManagement: 'tanstack-query',
        eslintPreset: 'airbnb',
      })

      const config = await getPackageJsonConfig(inputs)
      const variants = getTemplateVariants(inputs)

      // Variants should include shadcn and tanstack-query
      expect(variants.map(v => v.name)).toContain('shadcn')
      expect(variants.map(v => v.name)).toContain('tanstack-query')

      // Config should have all dependencies
      expect(config.dependencies).toHaveProperty('tailwindcss')
      expect(config.dependencies).toHaveProperty('class-variance-authority')
      expect(config.dependencies).toHaveProperty('@tanstack/react-query')
      expect(config.devDependencies).toHaveProperty('eslint-config-airbnb-extended')
      expect(config.devDependencies).toHaveProperty('prettier')
    })

    it('should handle minimal complexity: React JS + vanilla + no state + no ESLint', async () => {
      const inputs = createMockInputs({
        variant: 'react',
        style: 'vanilla',
        stateManagement: 'none',
        eslintPreset: 'none',
      })

      const config = await getPackageJsonConfig(inputs)
      const variants = getTemplateVariants(inputs)

      // Should have no variants
      expect(variants).toHaveLength(0)

      // Should only have prettier
      expect(config.dependencies).toEqual({})
      expect(config.devDependencies).toHaveProperty('prettier')
      expect(config.devDependencies).not.toHaveProperty('eslint')
    })
  })
})
