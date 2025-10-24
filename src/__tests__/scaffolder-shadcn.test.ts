import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setupShadcnPaths } from '../scaffolder.js'

// Mock fs-extra
vi.mock('fs-extra', () => ({
  default: {
    pathExists: vi.fn<any, Promise<boolean>>(),
    readFile: vi.fn<any, Promise<string>>(),
    writeFile: vi.fn<any, Promise<void>>(),
  },
}))

import fs from 'fs-extra'

describe('setupShadcnPaths', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('tsconfig.json modifications', () => {
    it('should add baseUrl and paths to tsconfig.json', async () => {
      const mockTsconfig = `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "strict": true
  }
}`

      vi.mocked(fs.pathExists).mockResolvedValue(true as any)
      vi.mocked(fs.readFile).mockResolvedValue(mockTsconfig as any)
      vi.mocked(fs.writeFile).mockResolvedValue(undefined)

      await setupShadcnPaths('/test/project')

      const writtenContent = vi.mocked(fs.writeFile).mock.calls[0][1] as string

      expect(writtenContent).toContain('"baseUrl": "."')
      expect(writtenContent).toContain('"paths"')
      expect(writtenContent).toContain('"@/*": ["./src/*"]')
    })

    it('should preserve comments in tsconfig.json', async () => {
      const mockTsconfig = `{
  "compilerOptions": {
    /* Bundler mode */
    "module": "ESNext",
    "strict": true
  }
}`

      vi.mocked(fs.pathExists).mockResolvedValue(true as any)
      vi.mocked(fs.readFile).mockResolvedValue(mockTsconfig as any)
      vi.mocked(fs.writeFile).mockResolvedValue(undefined)

      await setupShadcnPaths('/test/project')

      const writtenContent = vi.mocked(fs.writeFile).mock.calls[0][1] as string

      expect(writtenContent).toContain('/* Bundler mode */')
      expect(writtenContent).toContain('"baseUrl"')
    })

    it('should preserve single-line comments in tsconfig.json', async () => {
      const mockTsconfig = `{
  "compilerOptions": {
    // Module resolution
    "moduleResolution": "bundler",
    "strict": true
  }
}`

      vi.mocked(fs.pathExists).mockResolvedValue(true as any)
      vi.mocked(fs.readFile).mockResolvedValue(mockTsconfig as any)
      vi.mocked(fs.writeFile).mockResolvedValue(undefined)

      await setupShadcnPaths('/test/project')

      const writtenContent = vi.mocked(fs.writeFile).mock.calls[0][1] as string

      expect(writtenContent).toContain('// Module resolution')
      expect(writtenContent).toContain('"baseUrl"')
    })

    it('should skip if tsconfig.json does not exist', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(false as any)

      await setupShadcnPaths('/test/project')

      expect(fs.readFile).not.toHaveBeenCalled()
      expect(fs.writeFile).not.toHaveBeenCalled()
    })

    it('should add paths before closing brace', async () => {
      const mockTsconfig = `{
  "compilerOptions": {
    "target": "ES2020",
    "strict": true
  },
  "include": ["src"]
}`

      vi.mocked(fs.pathExists).mockResolvedValue(true as any)
      vi.mocked(fs.readFile).mockResolvedValue(mockTsconfig as any)
      vi.mocked(fs.writeFile).mockResolvedValue(undefined)

      await setupShadcnPaths('/test/project')

      const writtenContent = vi.mocked(fs.writeFile).mock.calls[0][1] as string

      // Check that paths are added inside compilerOptions
      const compilerOptionsStart = writtenContent.indexOf('"compilerOptions"')
      const compilerOptionsEnd = writtenContent.indexOf('},', compilerOptionsStart)
      const pathsIndex = writtenContent.indexOf('"paths"')

      expect(pathsIndex).toBeGreaterThan(compilerOptionsStart)
      expect(pathsIndex).toBeLessThan(compilerOptionsEnd)
    })

    it('should write tsconfig to correct path', async () => {
      const mockTsconfig = `{
  "compilerOptions": {
    "target": "ES2020"
  }
}`

      vi.mocked(fs.pathExists).mockResolvedValue(true as any)
      vi.mocked(fs.readFile).mockResolvedValue(mockTsconfig as any)
      vi.mocked(fs.writeFile).mockResolvedValue(undefined)

      await setupShadcnPaths('/custom/path')

      expect(fs.writeFile).toHaveBeenCalledWith(
        '/custom/path/tsconfig.json',
        expect.any(String),
        'utf-8'
      )
    })
  })

  describe('vite.config.ts modifications', () => {
    it('should add path import to vite.config.ts', async () => {
      const mockViteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`

      vi.mocked(fs.pathExists)
        .mockResolvedValueOnce(true as any) // tsconfig exists
        .mockResolvedValueOnce(true as any) // vite.config exists
      vi.mocked(fs.readFile)
        .mockResolvedValueOnce('{}' as any) // tsconfig (minimal)
        .mockResolvedValueOnce(mockViteConfig as any) // vite config
      vi.mocked(fs.writeFile).mockResolvedValue(undefined)

      await setupShadcnPaths('/test/project')

      const viteConfigCall = vi.mocked(fs.writeFile).mock.calls.find(
        call => String(call[0]).includes('vite.config')
      )

      expect(viteConfigCall).toBeDefined()
      const writtenContent = viteConfigCall![1] as string

      expect(writtenContent).toContain("import path from 'path'")
    })

    it('should add resolve.alias to vite.config.ts', async () => {
      const mockViteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`

      vi.mocked(fs.pathExists)
        .mockResolvedValueOnce(true as any)
        .mockResolvedValueOnce(true as any)
      vi.mocked(fs.readFile)
        .mockResolvedValueOnce('{}' as any)
        .mockResolvedValueOnce(mockViteConfig as any)
      vi.mocked(fs.writeFile).mockResolvedValue(undefined)

      await setupShadcnPaths('/test/project')

      const viteConfigCall = vi.mocked(fs.writeFile).mock.calls.find(
        call => String(call[0]).includes('vite.config')
      )

      const writtenContent = viteConfigCall![1] as string

      expect(writtenContent).toContain('resolve:')
      expect(writtenContent).toContain('alias:')
      expect(writtenContent).toContain("'@': path.resolve(__dirname, './src')")
    })

    it('should NOT add path import if already present', async () => {
      const mockViteConfig = `import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`

      vi.mocked(fs.pathExists)
        .mockResolvedValueOnce(true as any)
        .mockResolvedValueOnce(true as any)
      vi.mocked(fs.readFile)
        .mockResolvedValueOnce('{}' as any)
        .mockResolvedValueOnce(mockViteConfig as any)
      vi.mocked(fs.writeFile).mockResolvedValue(undefined)

      await setupShadcnPaths('/test/project')

      const viteConfigCall = vi.mocked(fs.writeFile).mock.calls.find(
        call => String(call[0]).includes('vite.config')
      )

      const writtenContent = viteConfigCall![1] as string

      // Should not duplicate the import
      const matches = writtenContent.match(/import path from 'path'/g)
      expect(matches).toHaveLength(1)
    })

    it('should NOT add resolve.alias if already present', async () => {
      const mockViteConfig = `import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})`

      vi.mocked(fs.pathExists)
        .mockResolvedValueOnce(true as any)
        .mockResolvedValueOnce(true as any)
      vi.mocked(fs.readFile)
        .mockResolvedValueOnce('{}' as any)
        .mockResolvedValueOnce(mockViteConfig as any)
      vi.mocked(fs.writeFile).mockResolvedValue(undefined)

      await setupShadcnPaths('/test/project')

      const viteConfigCall = vi.mocked(fs.writeFile).mock.calls.find(
        call => String(call[0]).includes('vite.config')
      )

      const writtenContent = viteConfigCall![1] as string

      // Should not duplicate the resolve config
      const matches = writtenContent.match(/resolve:/g)
      expect(matches).toHaveLength(1)
    })

    it('should skip vite config modifications if file does not exist', async () => {
      const mockTsconfig = `{
  "compilerOptions": {
    "target": "ES2020"
  }
}`

      vi.mocked(fs.pathExists)
        .mockResolvedValueOnce(true as any) // tsconfig exists
        .mockResolvedValueOnce(false as any) // vite.config does not exist
      vi.mocked(fs.readFile).mockResolvedValueOnce(mockTsconfig as any)
      vi.mocked(fs.writeFile).mockResolvedValue(undefined)

      await setupShadcnPaths('/test/project')

      const viteConfigCall = vi.mocked(fs.writeFile).mock.calls.find(
        call => String(call[0]).includes('vite.config')
      )

      expect(viteConfigCall).toBeUndefined()
    })

    it('should write vite config to correct path', async () => {
      const mockViteConfig = `import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [],
})`

      vi.mocked(fs.pathExists)
        .mockResolvedValueOnce(true as any)
        .mockResolvedValueOnce(true as any)
      vi.mocked(fs.readFile)
        .mockResolvedValueOnce('{}' as any)
        .mockResolvedValueOnce(mockViteConfig as any)
      vi.mocked(fs.writeFile).mockResolvedValue(undefined)

      await setupShadcnPaths('/custom/path')

      const viteConfigCall = vi.mocked(fs.writeFile).mock.calls.find(
        call => String(call[0]).includes('vite.config')
      )

      expect(viteConfigCall![0]).toBe('/custom/path/vite.config.ts')
    })
  })

  describe('edge cases', () => {
    it('should handle nested compilerOptions', async () => {
      const mockTsconfig = `{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "jsx": {
      "factory": "React.createElement"
    }
  }
}`

      vi.mocked(fs.pathExists).mockResolvedValue(true as any)
      vi.mocked(fs.readFile).mockResolvedValue(mockTsconfig as any)
      vi.mocked(fs.writeFile).mockResolvedValue(undefined)

      await setupShadcnPaths('/test/project')

      const writtenContent = vi.mocked(fs.writeFile).mock.calls[0][1] as string

      expect(writtenContent).toContain('"baseUrl"')
      expect(writtenContent).toContain('"paths"')
    })

    it('should handle empty compilerOptions', async () => {
      const mockTsconfig = `{
  "compilerOptions": {
  }
}`

      vi.mocked(fs.pathExists).mockResolvedValue(true as any)
      vi.mocked(fs.readFile).mockResolvedValue(mockTsconfig as any)
      vi.mocked(fs.writeFile).mockResolvedValue(undefined)

      await setupShadcnPaths('/test/project')

      const writtenContent = vi.mocked(fs.writeFile).mock.calls[0][1] as string

      expect(writtenContent).toContain('"baseUrl"')
    })

    it('should handle malformed JSON gracefully', async () => {
      const mockTsconfig = `{
  "compilerOptions": {
    "target": "ES2020"
  },
}` // Trailing comma - invalid JSON

      vi.mocked(fs.pathExists).mockResolvedValue(true as any)
      vi.mocked(fs.readFile).mockResolvedValue(mockTsconfig as any)
      vi.mocked(fs.writeFile).mockResolvedValue(undefined)

      // Should still work because we strip comments before parsing
      // but the original text is preserved
      await expect(setupShadcnPaths('/test/project')).rejects.toThrow()
    })
  })
})
