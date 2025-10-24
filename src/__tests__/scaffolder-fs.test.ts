import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { UserInputs } from '../prompts.js'
import {
  updatePackageJson,
  createEslintConfig,
  createPrettierConfig,
  updateTemplateFiles,
  applyVariantOverlay,
  initializeGit,
} from '../scaffolder.js'

// Mock fs-extra
vi.mock('fs-extra', () => ({
  default: {
    readJson: vi.fn<any, Promise<any>>(),
    writeJson: vi.fn<any, Promise<void>>(),
    pathExists: vi.fn<any, Promise<boolean>>(),
    readFile: vi.fn<any, Promise<string>>(),
    writeFile: vi.fn<any, Promise<void>>(),
    readdir: vi.fn<any, Promise<string[]>>(),
    rename: vi.fn<any, Promise<void>>(),
    stat: vi.fn<any, Promise<any>>(),
    copy: vi.fn<any, Promise<void>>(),
  },
}))

// Mock child_process
vi.mock('child_process', () => ({
  execSync: vi.fn<any, Buffer>(),
}))

// Import mocked modules
import fs from 'fs-extra'
import { execSync } from 'child_process'

describe('scaffolder file system operations', () => {
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

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('updatePackageJson', () => {
    it('should update project name in package.json', async () => {
      const mockPackageJson = {
        name: 'old-name',
        version: '1.0.0',
        dependencies: {},
        devDependencies: {},
      }

      vi.mocked(fs.readJson).mockResolvedValue(mockPackageJson)
      vi.mocked(fs.writeJson).mockResolvedValue(undefined)

      const inputs = createMockInputs({ projectName: 'new-project-name' })
      const templateConfig = {
        dependencies: {},
        devDependencies: {},
      }

      await updatePackageJson('/test/dir', inputs, templateConfig)

      expect(fs.writeJson).toHaveBeenCalledWith(
        '/test/dir/package.json',
        expect.objectContaining({
          name: 'new-project-name',
          version: '1.0.0',
        }),
        { spaces: 2 }
      )
    })

    it('should merge dependencies correctly', async () => {
      const mockPackageJson = {
        name: 'test-app',
        dependencies: {
          react: '^18.0.0',
        },
        devDependencies: {
          vite: '^5.0.0',
        },
      }

      vi.mocked(fs.readJson).mockResolvedValue(mockPackageJson)
      vi.mocked(fs.writeJson).mockResolvedValue(undefined)

      const inputs = createMockInputs({})
      const templateConfig = {
        dependencies: {
          '@reduxjs/toolkit': '^1.9.7',
        },
        devDependencies: {
          eslint: '^8.55.0',
        },
      }

      await updatePackageJson('/test/dir', inputs, templateConfig)

      const writtenPackageJson = vi.mocked(fs.writeJson).mock.calls[0][1] as any

      expect(writtenPackageJson.dependencies).toHaveProperty('react')
      expect(writtenPackageJson.dependencies).toHaveProperty('@reduxjs/toolkit')
      expect(writtenPackageJson.devDependencies).toHaveProperty('vite')
      expect(writtenPackageJson.devDependencies).toHaveProperty('eslint')
    })

    it('should add type-check script for TypeScript variants', async () => {
      const mockPackageJson = {
        name: 'test-app',
        scripts: {
          dev: 'vite',
          build: 'vite build',
        },
        dependencies: {},
        devDependencies: {},
      }

      vi.mocked(fs.readJson).mockResolvedValue(mockPackageJson)
      vi.mocked(fs.writeJson).mockResolvedValue(undefined)

      const inputs = createMockInputs({ variant: 'react-ts' })
      const templateConfig = { dependencies: {}, devDependencies: {} }

      await updatePackageJson('/test/dir', inputs, templateConfig)

      const writtenPackageJson = vi.mocked(fs.writeJson).mock.calls[0][1] as any

      expect(writtenPackageJson.scripts).toHaveProperty('type-check', 'tsc --noEmit')
      expect(writtenPackageJson.scripts).toHaveProperty('dev', 'vite')
    })

    it('should NOT add type-check script for JavaScript variants', async () => {
      const mockPackageJson = {
        name: 'test-app',
        scripts: {
          dev: 'vite',
        },
        dependencies: {},
        devDependencies: {},
      }

      vi.mocked(fs.readJson).mockResolvedValue(mockPackageJson)
      vi.mocked(fs.writeJson).mockResolvedValue(undefined)

      const inputs = createMockInputs({ variant: 'react' })
      const templateConfig = { dependencies: {}, devDependencies: {} }

      await updatePackageJson('/test/dir', inputs, templateConfig)

      const writtenPackageJson = vi.mocked(fs.writeJson).mock.calls[0][1] as any

      expect(writtenPackageJson.scripts).not.toHaveProperty('type-check')
    })

    it('should handle missing dependencies gracefully', async () => {
      const mockPackageJson = {
        name: 'test-app',
      }

      vi.mocked(fs.readJson).mockResolvedValue(mockPackageJson)
      vi.mocked(fs.writeJson).mockResolvedValue(undefined)

      const inputs = createMockInputs({})
      const templateConfig = {
        dependencies: { react: '^18.0.0' },
        devDependencies: { vite: '^5.0.0' },
      }

      await updatePackageJson('/test/dir', inputs, templateConfig)

      const writtenPackageJson = vi.mocked(fs.writeJson).mock.calls[0][1] as any

      expect(writtenPackageJson.dependencies).toHaveProperty('react')
      expect(writtenPackageJson.devDependencies).toHaveProperty('vite')
    })
  })

  describe('createEslintConfig', () => {
    it('should create Standard ESLint config', async () => {
      vi.mocked(fs.writeJson).mockResolvedValue(undefined)

      const inputs = createMockInputs({ eslintPreset: 'standard', variant: 'react' })

      await createEslintConfig('/test/dir', inputs)

      expect(fs.writeJson).toHaveBeenCalledWith(
        '/test/dir/.eslintrc.json',
        expect.objectContaining({
          env: {
            browser: true,
            es2021: true,
          },
          extends: expect.arrayContaining(['eslint:recommended', 'standard']),
        }),
        { spaces: 2 }
      )
    })

    it('should create Airbnb ESLint config', async () => {
      vi.mocked(fs.writeJson).mockResolvedValue(undefined)

      const inputs = createMockInputs({ eslintPreset: 'airbnb', variant: 'react' })

      await createEslintConfig('/test/dir', inputs)

      expect(fs.writeJson).toHaveBeenCalledWith(
        '/test/dir/.eslintrc.json',
        expect.objectContaining({
          extends: expect.arrayContaining(['eslint:recommended', 'airbnb', 'airbnb/hooks']),
        }),
        { spaces: 2 }
      )
    })

    it('should include TypeScript parser for TS variants', async () => {
      vi.mocked(fs.writeJson).mockResolvedValue(undefined)

      const inputs = createMockInputs({ eslintPreset: 'standard', variant: 'react-ts' })

      await createEslintConfig('/test/dir', inputs)

      const config = vi.mocked(fs.writeJson).mock.calls[0][1] as any

      expect(config.extends).toContain('plugin:@typescript-eslint/recommended')
      expect(config.parserOptions.parser).toBe('@typescript-eslint/parser')
    })

    it('should NOT include TypeScript parser for JS variants', async () => {
      vi.mocked(fs.writeJson).mockResolvedValue(undefined)

      const inputs = createMockInputs({ eslintPreset: 'standard', variant: 'react' })

      await createEslintConfig('/test/dir', inputs)

      const config = vi.mocked(fs.writeJson).mock.calls[0][1] as any

      expect(config.extends).not.toContain('plugin:@typescript-eslint/recommended')
      expect(config.parserOptions).not.toHaveProperty('parser')
    })

    it('should create minimal config for none preset', async () => {
      vi.mocked(fs.writeJson).mockResolvedValue(undefined)

      const inputs = createMockInputs({ eslintPreset: 'none', variant: 'react' })

      await createEslintConfig('/test/dir', inputs)

      const config = vi.mocked(fs.writeJson).mock.calls[0][1] as any

      expect(config.extends).toEqual(['eslint:recommended'])
    })
  })

  describe('createPrettierConfig', () => {
    it('should create Prettier config with correct defaults', async () => {
      vi.mocked(fs.writeJson).mockResolvedValue(undefined)

      await createPrettierConfig('/test/dir')

      expect(fs.writeJson).toHaveBeenCalledWith(
        '/test/dir/.prettierrc.json',
        {
          semi: false,
          singleQuote: true,
          trailingComma: 'es5',
          printWidth: 100,
          tabWidth: 2,
        },
        { spaces: 2 }
      )
    })

    it('should write to correct path', async () => {
      vi.mocked(fs.writeJson).mockResolvedValue(undefined)

      await createPrettierConfig('/custom/path')

      expect(fs.writeJson).toHaveBeenCalledWith(
        '/custom/path/.prettierrc.json',
        expect.any(Object),
        { spaces: 2 }
      )
    })
  })

  describe('updateTemplateFiles', () => {
    it('should update HTML title with project name', async () => {
      const mockHtml = '<html><head><title>Old Title</title></head></html>'
      vi.mocked(fs.pathExists).mockResolvedValue(true as any)
      vi.mocked(fs.readFile).mockResolvedValue(mockHtml as any)
      vi.mocked(fs.writeFile).mockResolvedValue(undefined as any)
      vi.mocked(fs.readdir).mockResolvedValue([] as any)

      const inputs = createMockInputs({ projectName: 'my-awesome-app' })

      await updateTemplateFiles('/test/dir', inputs)

      expect(fs.writeFile).toHaveBeenCalledWith(
        '/test/dir/index.html',
        expect.stringContaining('<title>my-awesome-app</title>'),
        'utf-8'
      )
    })

    it('should handle missing HTML file gracefully', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(false as any)
      vi.mocked(fs.readdir).mockResolvedValue([] as any)

      const inputs = createMockInputs({})

      await expect(updateTemplateFiles('/test/dir', inputs)).resolves.not.toThrow()
      expect(fs.readFile).not.toHaveBeenCalled()
    })

    it('should rename _gitignore to .gitignore', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(false as any)
      vi.mocked(fs.readdir).mockResolvedValueOnce(['_gitignore', 'package.json'] as any)
      vi.mocked(fs.readdir).mockResolvedValueOnce([] as any)
      vi.mocked(fs.rename).mockResolvedValue(undefined)

      const inputs = createMockInputs({})

      await updateTemplateFiles('/test/dir', inputs)

      expect(fs.rename).toHaveBeenCalledWith(
        '/test/dir/_gitignore',
        '/test/dir/.gitignore'
      )
    })

    it('should NOT rename files without underscore prefix', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(false as any)
      vi.mocked(fs.readdir).mockResolvedValueOnce(['package.json', 'index.html'] as any)
      vi.mocked(fs.readdir).mockResolvedValueOnce([] as any)

      const inputs = createMockInputs({})

      await updateTemplateFiles('/test/dir', inputs)

      expect(fs.rename).not.toHaveBeenCalled()
    })

    it('should call readdir to process directories', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(false as any)
      vi.mocked(fs.readdir).mockResolvedValue([] as any)
      vi.mocked(fs.rename).mockResolvedValue(undefined)

      const inputs = createMockInputs({})

      await updateTemplateFiles('/test/dir', inputs)

      // Should call readdir at least once for the root directory
      expect(fs.readdir).toHaveBeenCalledWith('/test/dir')
      // And then recursively for the walkDir function
      expect(fs.readdir).toHaveBeenCalledTimes(2) // Once for root level, once for walkDir
    })
  })

  describe('applyVariantOverlay', () => {
    it('should copy variant files when directory exists', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(true as any)
      vi.mocked(fs.copy).mockResolvedValue(undefined)

      await applyVariantOverlay('/test/project', 'tailwind')

      expect(fs.pathExists).toHaveBeenCalled()
      expect(fs.copy).toHaveBeenCalledWith(
        expect.stringContaining('variants/tailwind'),
        '/test/project',
        { overwrite: true }
      )
    })

    it('should skip when variant directory does not exist', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(false as any)
      vi.mocked(fs.copy).mockResolvedValue(undefined)

      await applyVariantOverlay('/test/project', 'nonexistent')

      expect(fs.pathExists).toHaveBeenCalled()
      expect(fs.copy).not.toHaveBeenCalled()
    })

    it('should use correct variant path for shadcn', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(true as any)
      vi.mocked(fs.copy).mockResolvedValue(undefined)

      await applyVariantOverlay('/test/project', 'shadcn')

      expect(fs.copy).toHaveBeenCalledWith(
        expect.stringContaining('variants/shadcn'),
        '/test/project',
        { overwrite: true }
      )
    })

    it('should overwrite existing files', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(true as any)
      vi.mocked(fs.copy).mockResolvedValue(undefined)

      await applyVariantOverlay('/test/project', 'scss')

      const copyCall = vi.mocked(fs.copy).mock.calls[0]
      expect(copyCall[2]).toEqual({ overwrite: true })
    })
  })

  describe('initializeGit', () => {
    it('should run git init, add, and commit', () => {
      vi.mocked(execSync).mockReturnValue(Buffer.from(''))

      initializeGit('/test/project')

      expect(execSync).toHaveBeenCalledWith('git init', {
        cwd: '/test/project',
        stdio: 'pipe',
      })
      expect(execSync).toHaveBeenCalledWith('git add .', {
        cwd: '/test/project',
        stdio: 'pipe',
      })
      expect(execSync).toHaveBeenCalledWith('git commit -m "Initial commit"', {
        cwd: '/test/project',
        stdio: 'pipe',
      })
    })

    it('should use correct working directory', () => {
      vi.mocked(execSync).mockReturnValue(Buffer.from(''))

      initializeGit('/custom/path/project')

      expect(execSync).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ cwd: '/custom/path/project' })
      )
    })

    it('should fail silently if git is not available', () => {
      vi.mocked(execSync).mockImplementation(() => {
        throw new Error('git not found')
      })

      expect(() => initializeGit('/test/project')).not.toThrow()
    })

    it('should fail silently if git init fails', () => {
      vi.mocked(execSync)
        .mockImplementationOnce(() => {
          throw new Error('permission denied')
        })

      expect(() => initializeGit('/test/project')).not.toThrow()
    })
  })
})
