import { describe, it, expect } from 'vitest'
import path from 'path'
import {
  deepMerge,
  getTemplatePath,
  getPackageJsonConfig,
} from '../scaffolder.js'
import type { UserInputs } from '../prompts.js'

describe('scaffolder.ts', () => {
  describe('deepMerge', () => {
    it('should merge two simple objects', () => {
      const target = { a: 1, b: 2 }
      const source = { c: 3 }

      const result = deepMerge(target, source)

      expect(result).toEqual({ a: 1, b: 2, c: 3 })
    })

    it('should override target properties with source properties', () => {
      const target = { a: 1, b: 2 }
      const source = { b: 3, c: 4 }

      const result = deepMerge(target, source)

      expect(result).toEqual({ a: 1, b: 3, c: 4 })
    })

    it('should deep merge nested objects', () => {
      const target = {
        a: 1,
        nested: {
          x: 10,
          y: 20,
        },
      }
      const source = {
        nested: {
          y: 30,
          z: 40,
        },
      }

      const result = deepMerge(target, source)

      expect(result).toEqual({
        a: 1,
        nested: {
          x: 10,
          y: 30,
          z: 40,
        },
      })
    })

    it('should handle multiple levels of nesting', () => {
      const target = {
        level1: {
          level2: {
            a: 1,
            b: 2,
          },
        },
      }
      const source = {
        level1: {
          level2: {
            b: 3,
            c: 4,
          },
          level2b: {
            x: 10,
          },
        },
      }

      const result = deepMerge(target, source)

      expect(result).toEqual({
        level1: {
          level2: {
            a: 1,
            b: 3,
            c: 4,
          },
          level2b: {
            x: 10,
          },
        },
      })
    })

    it('should not merge arrays (should replace)', () => {
      const target = { arr: [1, 2, 3] }
      const source = { arr: [4, 5] }

      const result = deepMerge(target, source)

      expect(result).toEqual({ arr: [4, 5] })
    })

    it('should replace nested object with primitive', () => {
      const target = { a: { b: 1 } }
      const source = { a: 'string' }

      const result = deepMerge(target, source)

      expect(result).toEqual({ a: 'string' })
    })

    it('should replace primitive with nested object', () => {
      const target = { a: 'string' }
      const source = { a: { b: 1 } }

      const result = deepMerge(target, source)

      expect(result).toEqual({ a: { b: 1 } })
    })

    it('should handle null values', () => {
      const target = { a: 1, b: null }
      const source = { b: 2, c: null }

      const result = deepMerge(target, source)

      expect(result).toEqual({ a: 1, b: 2, c: null })
    })

    it('should not mutate the target object', () => {
      const target = { a: 1, nested: { x: 10 } }
      const source = { nested: { y: 20 } }

      deepMerge(target, source)

      expect(target).toEqual({ a: 1, nested: { x: 10 } })
    })

    it('should handle empty objects', () => {
      expect(deepMerge({}, {})).toEqual({})
      expect(deepMerge({ a: 1 }, {})).toEqual({ a: 1 })
      expect(deepMerge({}, { b: 2 })).toEqual({ b: 2 })
    })
  })

  describe('getTemplatePath', () => {
    it('should return correct path for react template', () => {
      const result = getTemplatePath('react')
      expect(result).toContain('template-react')
      expect(result.endsWith(path.join('templates', 'template-react'))).toBe(true)
    })

    it('should return correct path for react-ts template', () => {
      const result = getTemplatePath('react-ts')
      expect(result).toContain('template-react-ts')
      expect(result.endsWith(path.join('templates', 'template-react-ts'))).toBe(true)
    })

    it('should return correct path for react-swc template', () => {
      const result = getTemplatePath('react-swc')
      expect(result).toContain('template-react-swc')
      expect(result.endsWith(path.join('templates', 'template-react-swc'))).toBe(true)
    })

    it('should return correct path for react-swc-ts template', () => {
      const result = getTemplatePath('react-swc-ts')
      expect(result).toContain('template-react-swc-ts')
      expect(result.endsWith(path.join('templates', 'template-react-swc-ts'))).toBe(true)
    })

    it('should return correct path for nextjs template', () => {
      const result = getTemplatePath('nextjs')
      expect(result).toContain('template-nextjs')
      expect(result.endsWith(path.join('templates', 'template-nextjs'))).toBe(true)
    })

    it('should return correct path for nextjs-ts template', () => {
      const result = getTemplatePath('nextjs-ts')
      expect(result).toContain('template-nextjs-ts')
      expect(result.endsWith(path.join('templates', 'template-nextjs-ts'))).toBe(true)
    })

    it('should prefix variant with "template-"', () => {
      const result = getTemplatePath('custom-variant')
      expect(result).toContain('template-custom-variant')
    })

    it('should return absolute path', () => {
      const result = getTemplatePath('react')
      expect(path.isAbsolute(result)).toBe(true)
    })
  })

  describe('getPackageJsonConfig', () => {
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

    it('should return empty dependencies for vanilla CSS and no state management', async () => {
      const inputs = createMockInputs({
        style: 'vanilla',
        stateManagement: 'none',
        eslintPreset: 'none',
      })

      const config = await getPackageJsonConfig(inputs)

      expect(config.dependencies).toEqual({})
      expect(config.devDependencies).toHaveProperty('prettier')
    })

    it('should include SCSS dependencies', async () => {
      const inputs = createMockInputs({
        style: 'scss',
        stateManagement: 'none',
        eslintPreset: 'none',
      })

      const config = await getPackageJsonConfig(inputs)

      expect(config.devDependencies).toHaveProperty('sass', '^1.87.0')
    })

    it('should include Tailwind dependencies', async () => {
      const inputs = createMockInputs({
        style: 'tailwind',
        stateManagement: 'none',
        eslintPreset: 'none',
      })

      const config = await getPackageJsonConfig(inputs)

      expect(config.dependencies).toHaveProperty('tailwindcss', '^4.1.16')
      expect(config.devDependencies).toHaveProperty('@tailwindcss/vite', '^4.1.16')
    })

    it('should include shadcn dependencies', async () => {
      const inputs = createMockInputs({
        variant: 'react-ts',
        style: 'shadcn',
        stateManagement: 'none',
        eslintPreset: 'none',
      })

      const config = await getPackageJsonConfig(inputs)

      expect(config.dependencies).toHaveProperty('tailwindcss', '^4.1.16')
      expect(config.dependencies).toHaveProperty('class-variance-authority', '^0.7.1')
      expect(config.dependencies).toHaveProperty('clsx', '^2.1.1')
      expect(config.dependencies).toHaveProperty('tailwind-merge', '^3.3.1')
      expect(config.dependencies).toHaveProperty('lucide-react', '^0.468.0')
      expect(config.dependencies).toHaveProperty('tw-animate-css', '^1.0.5')
      expect(config.devDependencies).toHaveProperty('@tailwindcss/vite', '^4.1.16')
    })

    it('should include Redux dependencies', async () => {
      const inputs = createMockInputs({
        style: 'vanilla',
        stateManagement: 'redux',
        eslintPreset: 'none',
      })

      const config = await getPackageJsonConfig(inputs)

      expect(config.dependencies).toHaveProperty('@reduxjs/toolkit', '^2.9.2')
      expect(config.dependencies).toHaveProperty('react-redux', '^9.2.0')
    })

    it('should include Effector dependencies', async () => {
      const inputs = createMockInputs({
        style: 'vanilla',
        stateManagement: 'effector',
        eslintPreset: 'none',
      })

      const config = await getPackageJsonConfig(inputs)

      expect(config.dependencies).toHaveProperty('effector', '^24.0.0')
      expect(config.dependencies).toHaveProperty('effector-react', '^24.0.0')
    })

    it('should include TanStack Query dependencies', async () => {
      const inputs = createMockInputs({
        style: 'vanilla',
        stateManagement: 'tanstack-query',
        eslintPreset: 'none',
      })

      const config = await getPackageJsonConfig(inputs)

      expect(config.dependencies).toHaveProperty('@tanstack/react-query', '^5.90.5')
    })

    it('should include ESLint Standard dependencies', async () => {
      const inputs = createMockInputs({
        style: 'vanilla',
        stateManagement: 'none',
        eslintPreset: 'standard',
      })

      const config = await getPackageJsonConfig(inputs)

      expect(config.devDependencies).toHaveProperty('eslint')
      expect(config.devDependencies).toHaveProperty('eslint-config-standard')
      expect(config.devDependencies).toHaveProperty('eslint-plugin-react')
      expect(config.devDependencies).toHaveProperty('eslint-plugin-react-hooks')
    })

    it('should include ESLint Airbnb dependencies', async () => {
      const inputs = createMockInputs({
        style: 'vanilla',
        stateManagement: 'none',
        eslintPreset: 'airbnb',
      })

      const config = await getPackageJsonConfig(inputs)

      expect(config.devDependencies).toHaveProperty('eslint')
      expect(config.devDependencies).toHaveProperty('eslint-config-airbnb')
      expect(config.devDependencies).toHaveProperty('eslint-plugin-jsx-a11y')
    })

    it('should always include Prettier', async () => {
      const inputs = createMockInputs({
        style: 'vanilla',
        stateManagement: 'none',
        eslintPreset: 'none',
      })

      const config = await getPackageJsonConfig(inputs)

      expect(config.devDependencies).toHaveProperty('prettier')
    })

    it('should combine multiple dependencies correctly', async () => {
      const inputs = createMockInputs({
        style: 'tailwind',
        stateManagement: 'redux',
        eslintPreset: 'standard',
      })

      const config = await getPackageJsonConfig(inputs)

      // Tailwind
      expect(config.dependencies).toHaveProperty('tailwindcss')
      // Redux
      expect(config.dependencies).toHaveProperty('@reduxjs/toolkit')
      // ESLint
      expect(config.devDependencies).toHaveProperty('eslint')
      // Prettier (always)
      expect(config.devDependencies).toHaveProperty('prettier')
    })
  })
})
