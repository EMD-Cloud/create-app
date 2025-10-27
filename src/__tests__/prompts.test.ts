import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  isValidProjectName,
  getStyleOptions,
  getPackageManagerCommand,
  detectPackageManager,
} from '../prompts.js'

describe('prompts.ts', () => {
  describe('isValidProjectName', () => {
    it('should accept valid simple project names', () => {
      expect(isValidProjectName('myapp')).toBe(true)
      expect(isValidProjectName('my-app')).toBe(true)
      expect(isValidProjectName('my-app-123')).toBe(true)
      expect(isValidProjectName('app123')).toBe(true)
    })

    it('should accept valid scoped package names', () => {
      expect(isValidProjectName('@scope/myapp')).toBe(true)
      expect(isValidProjectName('@my-scope/my-app')).toBe(true)
      expect(isValidProjectName('@org123/app-456')).toBe(true)
    })

    it('should reject invalid project names', () => {
      // Uppercase letters
      expect(isValidProjectName('MyApp')).toBe(false)
      expect(isValidProjectName('MY-APP')).toBe(false)

      // Special characters
      expect(isValidProjectName('my_app')).toBe(false)
      expect(isValidProjectName('my.app')).toBe(false)
      expect(isValidProjectName('my app')).toBe(false)
      expect(isValidProjectName('my@app')).toBe(false)

      // Starting with hyphen
      expect(isValidProjectName('-myapp')).toBe(false)

      // Ending with hyphen
      expect(isValidProjectName('myapp-')).toBe(false)

      // Empty string
      expect(isValidProjectName('')).toBe(false)
    })

    it('should reject invalid scoped package names', () => {
      expect(isValidProjectName('@/myapp')).toBe(false)
      expect(isValidProjectName('@MyScope/myapp')).toBe(false)
      expect(isValidProjectName('@scope/')).toBe(false)
      expect(isValidProjectName('@scope')).toBe(false)
    })
  })

  describe('getStyleOptions', () => {
    it('should return base options for non-TypeScript React variants', () => {
      const options = getStyleOptions('react', 'react')

      expect(options).toHaveLength(4)
      expect(options.map(o => o.value)).toEqual(['vanilla', 'scss', 'tailwind', 'shadcn'])
    })

    it('should return base options for non-TypeScript Next.js variants', () => {
      const options = getStyleOptions('nextjs', 'nextjs')

      expect(options).toHaveLength(4)
      expect(options.map(o => o.value)).toEqual(['vanilla', 'scss', 'tailwind', 'shadcn'])
    })

    it('should include shadcn for TypeScript React variants', () => {
      const options = getStyleOptions('react', 'react-ts')

      expect(options).toHaveLength(4)
      expect(options.map(o => o.value)).toEqual(['vanilla', 'scss', 'tailwind', 'shadcn'])
    })

    it('should include shadcn for TypeScript + SWC React variants', () => {
      const options = getStyleOptions('react', 'react-swc-ts')

      expect(options).toHaveLength(4)
      expect(options.map(o => o.value)).toContain('shadcn')
    })

    it('should include shadcn for TypeScript Next.js variants', () => {
      const options = getStyleOptions('nextjs', 'nextjs-ts')

      expect(options).toHaveLength(4)
      expect(options.map(o => o.value)).toEqual(['vanilla', 'scss', 'tailwind', 'shadcn'])
    })

    it('should include shadcn for SWC (JavaScript support)', () => {
      const options = getStyleOptions('react', 'react-swc')

      expect(options).toHaveLength(4)
      expect(options.map(o => o.value)).toContain('shadcn')
    })

    it('should return base options for non-React/Next.js frameworks', () => {
      const options = getStyleOptions('vue', 'vue-ts')

      expect(options).toHaveLength(3)
      expect(options.map(o => o.value)).toEqual(['vanilla', 'scss', 'tailwind'])
    })

    it('should return options with correct structure', () => {
      const options = getStyleOptions('react', 'react-ts')

      options.forEach(option => {
        expect(option).toHaveProperty('title')
        expect(option).toHaveProperty('value')
        expect(typeof option.title).toBe('string')
        expect(typeof option.value).toBe('string')
      })
    })
  })

  describe('getPackageManagerCommand', () => {
    describe('install commands', () => {
      it('should return correct command for npm', () => {
        expect(getPackageManagerCommand('npm', 'install')).toBe('npm install')
      })

      it('should return correct command for yarn', () => {
        expect(getPackageManagerCommand('yarn', 'install')).toBe('yarn')
      })

      it('should return correct command for pnpm', () => {
        expect(getPackageManagerCommand('pnpm', 'install')).toBe('pnpm install')
      })

      it('should return correct command for bun', () => {
        expect(getPackageManagerCommand('bun', 'install')).toBe('bun install')
      })

      it('should default to npm for unknown package manager', () => {
        expect(getPackageManagerCommand('unknown', 'install')).toBe('npm install')
      })
    })

    describe('dev commands', () => {
      it('should return correct command for npm', () => {
        expect(getPackageManagerCommand('npm', 'dev')).toBe('npm run dev')
      })

      it('should return correct command for yarn', () => {
        expect(getPackageManagerCommand('yarn', 'dev')).toBe('yarn dev')
      })

      it('should return correct command for pnpm', () => {
        expect(getPackageManagerCommand('pnpm', 'dev')).toBe('pnpm dev')
      })

      it('should return correct command for bun', () => {
        expect(getPackageManagerCommand('bun', 'dev')).toBe('bun run dev')
      })

      it('should default to npm for unknown package manager', () => {
        expect(getPackageManagerCommand('unknown', 'dev')).toBe('npm run dev')
      })
    })
  })

  describe('detectPackageManager', () => {
    let originalEnv: string | undefined

    beforeEach(() => {
      originalEnv = process.env.npm_config_user_agent
    })

    afterEach(() => {
      if (originalEnv !== undefined) {
        process.env.npm_config_user_agent = originalEnv
      } else {
        delete process.env.npm_config_user_agent
      }
    })

    it('should detect bun from user agent', () => {
      process.env.npm_config_user_agent = 'bun/1.0.0'
      expect(detectPackageManager()).toBe('bun')
    })

    it('should detect yarn from user agent', () => {
      process.env.npm_config_user_agent = 'yarn/1.22.0'
      expect(detectPackageManager()).toBe('yarn')
    })

    it('should detect pnpm from user agent', () => {
      process.env.npm_config_user_agent = 'pnpm/8.0.0'
      expect(detectPackageManager()).toBe('pnpm')
    })

    it('should default to npm when user agent is not set', () => {
      delete process.env.npm_config_user_agent
      expect(detectPackageManager()).toBe('npm')
    })

    it('should default to npm when user agent is empty', () => {
      process.env.npm_config_user_agent = ''
      expect(detectPackageManager()).toBe('npm')
    })

    it('should default to npm for unknown user agent', () => {
      process.env.npm_config_user_agent = 'unknown-pm/1.0.0'
      expect(detectPackageManager()).toBe('npm')
    })

    it('should prioritize bun over yarn when both are in user agent', () => {
      process.env.npm_config_user_agent = 'bun/1.0.0 yarn/1.22.0'
      expect(detectPackageManager()).toBe('bun')
    })

    it('should prioritize yarn over pnpm when both are in user agent', () => {
      process.env.npm_config_user_agent = 'yarn/1.22.0 pnpm/8.0.0'
      expect(detectPackageManager()).toBe('yarn')
    })
  })
})
