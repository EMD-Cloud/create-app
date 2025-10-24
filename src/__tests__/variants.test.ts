import { describe, it, expect } from 'vitest'
import {
  getStyleVariant,
  getStateManagementVariant,
  getTemplateVariants,
} from '../variants.js'
import type { UserInputs } from '../prompts.js'

describe('variants.ts', () => {
  describe('getStyleVariant', () => {
    it('should return null for vanilla CSS', () => {
      expect(getStyleVariant('vanilla', false)).toBeNull()
      expect(getStyleVariant('vanilla', true)).toBeNull()
    })

    it('should return SCSS variant with correct dependencies', () => {
      const variant = getStyleVariant('scss', false)

      expect(variant).not.toBeNull()
      expect(variant?.name).toBe('scss')
      expect(variant?.devDependencies).toHaveProperty('sass', '^1.69.5')
    })

    it('should return Tailwind variant with correct dependencies', () => {
      const variant = getStyleVariant('tailwind', false)

      expect(variant).not.toBeNull()
      expect(variant?.name).toBe('tailwind')
      expect(variant?.dependencies).toHaveProperty('tailwindcss', '^3.3.6')
      expect(variant?.devDependencies).toHaveProperty('postcss', '^8.4.31')
      expect(variant?.devDependencies).toHaveProperty('autoprefixer', '^10.4.16')
    })

    it('should return shadcn variant for TypeScript projects', () => {
      const variant = getStyleVariant('shadcn', true)

      expect(variant).not.toBeNull()
      expect(variant?.name).toBe('shadcn')
      expect(variant?.dependencies).toHaveProperty('class-variance-authority', '^0.7.0')
      expect(variant?.dependencies).toHaveProperty('clsx', '^2.0.0')
      expect(variant?.dependencies).toHaveProperty('tailwind-merge', '^2.0.0')
      expect(variant?.dependencies).toHaveProperty('lucide-react', '^0.294.0')
      expect(variant?.devDependencies).toHaveProperty('tailwindcss', '^3.3.6')
      expect(variant?.devDependencies).toHaveProperty('postcss', '^8.4.31')
      expect(variant?.devDependencies).toHaveProperty('autoprefixer', '^10.4.16')
    })

    it('should return null for shadcn with JavaScript projects', () => {
      const variant = getStyleVariant('shadcn', false)

      expect(variant).toBeNull()
    })

    it('should return null for unknown style', () => {
      expect(getStyleVariant('unknown', false)).toBeNull()
      expect(getStyleVariant('unknown', true)).toBeNull()
    })
  })

  describe('getStateManagementVariant', () => {
    describe('React framework', () => {
      it('should return null for "none" option', () => {
        expect(getStateManagementVariant('none', 'react')).toBeNull()
      })

      it('should return Redux variant with correct dependencies', () => {
        const variant = getStateManagementVariant('redux', 'react')

        expect(variant).not.toBeNull()
        expect(variant?.name).toBe('redux')
        expect(variant?.dependencies).toHaveProperty('@reduxjs/toolkit', '^1.9.7')
        expect(variant?.dependencies).toHaveProperty('react-redux', '^8.1.3')
      })

      it('should return Effector variant with correct dependencies', () => {
        const variant = getStateManagementVariant('effector', 'react')

        expect(variant).not.toBeNull()
        expect(variant?.name).toBe('effector')
        expect(variant?.dependencies).toHaveProperty('effector', '^23.2.0')
        expect(variant?.dependencies).toHaveProperty('effector-react', '^23.2.0')
      })

      it('should return TanStack Query variant with correct dependencies', () => {
        const variant = getStateManagementVariant('tanstack-query', 'react')

        expect(variant).not.toBeNull()
        expect(variant?.name).toBe('tanstack-query')
        expect(variant?.dependencies).toHaveProperty('@tanstack/react-query', '^5.28.0')
      })
    })

    describe('Next.js framework', () => {
      it('should return Redux variant for Next.js', () => {
        const variant = getStateManagementVariant('redux', 'nextjs')

        expect(variant).not.toBeNull()
        expect(variant?.name).toBe('redux')
      })

      it('should return Effector variant for Next.js', () => {
        const variant = getStateManagementVariant('effector', 'nextjs')

        expect(variant).not.toBeNull()
        expect(variant?.name).toBe('effector')
      })

      it('should return TanStack Query variant for Next.js', () => {
        const variant = getStateManagementVariant('tanstack-query', 'nextjs')

        expect(variant).not.toBeNull()
        expect(variant?.name).toBe('tanstack-query')
      })
    })

    describe('Other frameworks', () => {
      it('should return null for Vue framework', () => {
        expect(getStateManagementVariant('redux', 'vue')).toBeNull()
        expect(getStateManagementVariant('effector', 'vue')).toBeNull()
        expect(getStateManagementVariant('tanstack-query', 'vue')).toBeNull()
      })

      it('should return null for Svelte framework', () => {
        expect(getStateManagementVariant('redux', 'svelte')).toBeNull()
      })

      it('should return null for unknown framework', () => {
        expect(getStateManagementVariant('redux', 'unknown')).toBeNull()
      })
    })

    it('should return null for unknown state management option', () => {
      expect(getStateManagementVariant('unknown', 'react')).toBeNull()
      expect(getStateManagementVariant('unknown', 'nextjs')).toBeNull()
    })
  })

  describe('getTemplateVariants', () => {
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

    it('should return empty array for vanilla CSS and no state management', () => {
      const inputs = createMockInputs({
        style: 'vanilla',
        stateManagement: 'none',
      })

      const variants = getTemplateVariants(inputs)
      expect(variants).toHaveLength(0)
    })

    it('should return single variant for SCSS only', () => {
      const inputs = createMockInputs({
        style: 'scss',
        stateManagement: 'none',
      })

      const variants = getTemplateVariants(inputs)
      expect(variants).toHaveLength(1)
      expect(variants[0].name).toBe('scss')
    })

    it('should return single variant for Redux only', () => {
      const inputs = createMockInputs({
        style: 'vanilla',
        stateManagement: 'redux',
      })

      const variants = getTemplateVariants(inputs)
      expect(variants).toHaveLength(1)
      expect(variants[0].name).toBe('redux')
    })

    it('should return two variants for SCSS + Redux', () => {
      const inputs = createMockInputs({
        style: 'scss',
        stateManagement: 'redux',
      })

      const variants = getTemplateVariants(inputs)
      expect(variants).toHaveLength(2)
      expect(variants.map(v => v.name)).toContain('scss')
      expect(variants.map(v => v.name)).toContain('redux')
    })

    it('should return two variants for Tailwind + TanStack Query', () => {
      const inputs = createMockInputs({
        style: 'tailwind',
        stateManagement: 'tanstack-query',
      })

      const variants = getTemplateVariants(inputs)
      expect(variants).toHaveLength(2)
      expect(variants.map(v => v.name)).toContain('tailwind')
      expect(variants.map(v => v.name)).toContain('tanstack-query')
    })

    it('should work with TypeScript variants', () => {
      const inputs = createMockInputs({
        variant: 'react-ts',
        style: 'shadcn',
        stateManagement: 'redux',
      })

      const variants = getTemplateVariants(inputs)
      expect(variants).toHaveLength(2)
      expect(variants.map(v => v.name)).toContain('shadcn')
      expect(variants.map(v => v.name)).toContain('redux')
    })

    it('should work with SWC variants', () => {
      const inputs = createMockInputs({
        variant: 'react-swc-ts',
        style: 'tailwind',
        stateManagement: 'effector',
      })

      const variants = getTemplateVariants(inputs)
      expect(variants).toHaveLength(2)
      expect(variants.map(v => v.name)).toContain('tailwind')
      expect(variants.map(v => v.name)).toContain('effector')
    })

    it('should NOT include shadcn for JavaScript variants', () => {
      const inputs = createMockInputs({
        variant: 'react',
        style: 'shadcn',
        stateManagement: 'none',
      })

      const variants = getTemplateVariants(inputs)
      expect(variants).toHaveLength(0) // shadcn returns null for non-TS
    })

    it('should NOT include state management for Vue framework', () => {
      const inputs = createMockInputs({
        framework: 'vue',
        variant: 'vue-ts',
        style: 'tailwind',
        stateManagement: 'redux',
      })

      const variants = getTemplateVariants(inputs)
      expect(variants).toHaveLength(1) // Only tailwind, no redux for Vue
      expect(variants[0].name).toBe('tailwind')
    })

    it('should merge dependencies from multiple variants', () => {
      const inputs = createMockInputs({
        style: 'scss',
        stateManagement: 'redux',
      })

      const variants = getTemplateVariants(inputs)

      const scssVariant = variants.find(v => v.name === 'scss')
      const reduxVariant = variants.find(v => v.name === 'redux')

      expect(scssVariant?.devDependencies).toHaveProperty('sass')
      expect(reduxVariant?.dependencies).toHaveProperty('@reduxjs/toolkit')
      expect(reduxVariant?.dependencies).toHaveProperty('react-redux')
    })
  })
})
