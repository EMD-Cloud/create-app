import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'
import { UserInputs } from './prompts.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TEMPLATES_DIR = path.resolve(__dirname, '../templates')
const VARIANTS_DIR = path.resolve(__dirname, '../templates/variants')

interface TemplateConfig {
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
  scripts?: Record<string, string>
}

export function getTemplatePath(variant: string): string {
  // Variant names map directly to template directories
  // e.g., 'react-ts' -> 'template-react-ts', 'nextjs' -> 'template-nextjs'
  const templateName = `template-${variant}`
  return path.join(TEMPLATES_DIR, templateName)
}

export function deepMerge(
  target: Record<string, any>,
  source: Record<string, any>
): Record<string, any> {
  const result = { ...target }

  for (const key in source) {
    if (key in source) {
      const sourceValue = source[key]
      const targetValue = result[key]

      // Check if source is an object (but not array or null)
      const isSourceObject =
        typeof sourceValue === 'object' &&
        sourceValue !== null &&
        !Array.isArray(sourceValue)

      // Check if target is also an object (but not array or null)
      const isTargetObject =
        typeof targetValue === 'object' &&
        targetValue !== null &&
        !Array.isArray(targetValue)

      // Only deep merge if both are proper objects
      if (isSourceObject && isTargetObject) {
        result[key] = deepMerge(targetValue, sourceValue)
      } else {
        // Otherwise, replace with source value
        result[key] = sourceValue
      }
    }
  }

  return result
}

export async function getPackageJsonConfig(inputs: UserInputs): Promise<TemplateConfig> {
  const config: TemplateConfig = {
    dependencies: {},
    devDependencies: {},
  }

  // @emd-cloud/sdk is a peer dependency of @emd-cloud/react-components
  // It will be installed automatically by package managers

  // Add style dependencies
  if (inputs.style === 'scss') {
    config.devDependencies['sass'] = '^1.69.5'
  } else if (inputs.style === 'tailwind') {
    config.dependencies['tailwindcss'] = '^3.3.6'
    config.devDependencies['postcss'] = '^8.4.31'
    config.devDependencies['autoprefixer'] = '^10.4.16'
  } else if (inputs.style === 'shadcn') {
    config.dependencies['tailwindcss'] = '^3.3.6'
    config.dependencies['class-variance-authority'] = '^0.7.0'
    config.dependencies['clsx'] = '^2.0.0'
    config.dependencies['tailwind-merge'] = '^2.0.0'
    config.dependencies['lucide-react'] = '^0.294.0'
    config.devDependencies['postcss'] = '^8.4.31'
    config.devDependencies['autoprefixer'] = '^10.4.16'
  }

  // Add state management dependencies
  if (inputs.stateManagement === 'redux') {
    config.dependencies['@reduxjs/toolkit'] = '^1.9.7'
    config.dependencies['react-redux'] = '^8.1.3'
  } else if (inputs.stateManagement === 'effector') {
    config.dependencies['effector'] = '^23.2.0'
    config.dependencies['effector-react'] = '^23.2.0'
  } else if (inputs.stateManagement === 'tanstack-query') {
    config.dependencies['@tanstack/react-query'] = '^5.28.0'
  }

  // Add ESLint dependencies
  if (inputs.eslintPreset !== 'none') {
    config.devDependencies['eslint'] = '^8.55.0'
    config.devDependencies['eslint-plugin-react'] = '^7.33.2'
    config.devDependencies['eslint-plugin-react-hooks'] = '^4.6.0'

    if (inputs.eslintPreset === 'airbnb') {
      config.devDependencies['eslint-config-airbnb'] = '^19.0.4'
      config.devDependencies['eslint-plugin-import'] = '^2.29.0'
      config.devDependencies['eslint-plugin-jsx-a11y'] = '^6.8.0'
    } else if (inputs.eslintPreset === 'standard') {
      config.devDependencies['eslint-config-standard'] = '^17.1.0'
      config.devDependencies['eslint-plugin-import'] = '^2.29.0'
      config.devDependencies['eslint-plugin-n'] = '^16.6.2'
      config.devDependencies['eslint-plugin-promise'] = '^6.1.1'
    }
  }

  // Add prettier
  config.devDependencies['prettier'] = '^3.1.1'

  return config
}

export async function updatePackageJson(
  projectDir: string,
  inputs: UserInputs,
  templateConfig: TemplateConfig
): Promise<void> {
  const packageJsonPath = path.join(projectDir, 'package.json')
  const packageJson = await fs.readJson(packageJsonPath)

  // Update project name
  packageJson.name = inputs.projectName

  // Merge dependencies
  packageJson.dependencies = deepMerge(
    packageJson.dependencies || {},
    templateConfig.dependencies
  )

  packageJson.devDependencies = deepMerge(
    packageJson.devDependencies || {},
    templateConfig.devDependencies
  )

  // Add type checking script for TypeScript projects
  const isTypeScript = inputs.variant.includes('-ts')
  if (isTypeScript) {
    packageJson.scripts = {
      ...packageJson.scripts,
      'type-check': 'tsc --noEmit',
    }
  }

  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 })
}

export async function updateTemplateFiles(
  projectDir: string,
  inputs: UserInputs
): Promise<void> {
  // Update index.html with project name
  const htmlPath = path.join(projectDir, 'index.html')
  if (await fs.pathExists(htmlPath)) {
    let html = await fs.readFile(htmlPath, 'utf-8')
    html = html.replace(/<title>.*?<\/title>/, `<title>${inputs.projectName}</title>`)
    await fs.writeFile(htmlPath, html, 'utf-8')
  }

  // Rename files with underscore prefix (like _gitignore -> .gitignore)
  const files = await fs.readdir(projectDir)
  for (const file of files) {
    if (file.startsWith('_')) {
      const oldPath = path.join(projectDir, file)
      const newPath = path.join(projectDir, '.' + file.slice(1))
      await fs.rename(oldPath, newPath)
    }
  }

  // Handle nested directories
  const walkDir = async (dir: string) => {
    const items = await fs.readdir(dir)
    for (const item of items) {
      const itemPath = path.join(dir, item)
      const stat = await fs.stat(itemPath)
      if (stat.isDirectory()) {
        await walkDir(itemPath)
      } else if (item.startsWith('_')) {
        const newPath = path.join(dir, '.' + item.slice(1))
        await fs.rename(itemPath, newPath)
      }
    }
  }

  await walkDir(projectDir)
}

export async function applyVariantOverlay(
  projectDir: string,
  variantName: string
): Promise<void> {
  const variantPath = path.join(VARIANTS_DIR, variantName)

  if (!(await fs.pathExists(variantPath))) {
    // Variant directory doesn't exist, skip
    return
  }

  // Copy all files from variant directory to project directory
  // This will overwrite existing files with the same name
  await fs.copy(variantPath, projectDir, { overwrite: true })
}

export async function setupShadcnPaths(projectDir: string): Promise<void> {
  // Update tsconfig.json to add path aliases for shadcn
  const tsconfigPath = path.join(projectDir, 'tsconfig.json')

  if (!(await fs.pathExists(tsconfigPath))) {
    return
  }

  // Read as text to preserve comments and formatting
  let tsconfigText = await fs.readFile(tsconfigPath, 'utf-8')

  // Parse JSON (strip comments for parsing, but we'll modify the original text)
  const tsconfigContent = tsconfigText.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '')
  const tsconfig = JSON.parse(tsconfigContent)

  // Check if we need to add baseUrl and paths
  const needsBaseUrl = !tsconfig.compilerOptions?.baseUrl
  const needsPaths = !tsconfig.compilerOptions?.paths

  if (needsBaseUrl || needsPaths) {
    // Find the compilerOptions closing brace
    const compilerOptionsMatch = tsconfigText.match(/"compilerOptions":\s*{/)
    if (compilerOptionsMatch) {
      // Find the end of compilerOptions
      let braceCount = 0
      let startIndex = compilerOptionsMatch.index! + compilerOptionsMatch[0].length
      let endIndex = startIndex

      for (let i = startIndex; i < tsconfigText.length; i++) {
        if (tsconfigText[i] === '{') braceCount++
        if (tsconfigText[i] === '}') {
          if (braceCount === 0) {
            endIndex = i
            break
          }
          braceCount--
        }
      }

      // Add baseUrl and paths before the closing brace
      const pathsConfig = `,\n    "baseUrl": ".",\n    "paths": {\n      "@/*": ["./src/*"]\n    }`
      tsconfigText = tsconfigText.slice(0, endIndex) + pathsConfig + tsconfigText.slice(endIndex)
    }

    await fs.writeFile(tsconfigPath, tsconfigText, 'utf-8')
  }

  // Update vite.config.ts to add path resolution
  const viteConfigPath = path.join(projectDir, 'vite.config.ts')

  if (await fs.pathExists(viteConfigPath)) {
    let viteConfig = await fs.readFile(viteConfigPath, 'utf-8')

    // Add path import if not present
    if (!viteConfig.includes('import path from')) {
      viteConfig = viteConfig.replace(
        "import { defineConfig } from 'vite'",
        "import { defineConfig } from 'vite'\nimport path from 'path'"
      )
    }

    // Add resolve.alias if not present
    if (!viteConfig.includes('resolve:')) {
      viteConfig = viteConfig.replace(
        'plugins: [react()],',
        `plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },`
      )
    }

    await fs.writeFile(viteConfigPath, viteConfig, 'utf-8')
  }
}

export function initializeGit(projectDir: string): void {
  try {
    execSync('git init', { cwd: projectDir, stdio: 'pipe' })
    execSync('git add .', { cwd: projectDir, stdio: 'pipe' })
    execSync('git commit -m "Initial commit"', { cwd: projectDir, stdio: 'pipe' })
  } catch (error) {
    // Git not available or init failed, silently continue
  }
}

export async function scaffoldProject(inputs: UserInputs): Promise<void> {
  const targetDir = path.join(process.cwd(), inputs.projectName)

  // Check if directory already exists
  if (await fs.pathExists(targetDir)) {
    throw new Error(`Directory ${inputs.projectName} already exists`)
  }

  // Get template path
  const templatePath = getTemplatePath(inputs.variant)

  if (!(await fs.pathExists(templatePath))) {
    throw new Error(`Template not found: ${templatePath}`)
  }

  // Copy template
  await fs.copy(templatePath, targetDir)

  // Get package.json configuration
  const packageConfig = await getPackageJsonConfig(inputs)

  // Update package.json
  await updatePackageJson(targetDir, inputs, packageConfig)

  // Update template files (rename, replace placeholders)
  await updateTemplateFiles(targetDir, inputs)

  // Apply style variant overlays
  if (inputs.style && inputs.style !== 'vanilla') {
    await applyVariantOverlay(targetDir, inputs.style)

    // Post-processing for specific styles
    if (inputs.style === 'shadcn') {
      await setupShadcnPaths(targetDir)
    }
  }

  // Add ESLint and Prettier configs if needed
  if (inputs.eslintPreset !== 'none') {
    await createEslintConfig(targetDir, inputs)
  }

  await createPrettierConfig(targetDir)

  // Initialize git if requested
  if (inputs.initGit) {
    initializeGit(targetDir)
  }
}

export async function createEslintConfig(
  projectDir: string,
  inputs: UserInputs
): Promise<void> {
  const isTypeScript = inputs.variant.includes('-ts')

  const eslintConfig = {
    env: {
      browser: true,
      es2021: true,
    },
    extends: [
      'eslint:recommended',
      ...(inputs.eslintPreset === 'airbnb'
        ? ['airbnb', 'airbnb/hooks']
        : inputs.eslintPreset === 'standard'
          ? ['standard']
          : []),
      ...(isTypeScript ? ['plugin:@typescript-eslint/recommended'] : []),
    ],
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      ...(isTypeScript ? { parser: '@typescript-eslint/parser' } : {}),
    },
    rules: {},
  }

  await fs.writeJson(path.join(projectDir, '.eslintrc.json'), eslintConfig, {
    spaces: 2,
  })
}

export async function createPrettierConfig(projectDir: string): Promise<void> {
  const prettierConfig = {
    semi: false,
    singleQuote: true,
    trailingComma: 'es5',
    printWidth: 100,
    tabWidth: 2,
  }

  await fs.writeJson(path.join(projectDir, '.prettierrc.json'), prettierConfig, {
    spaces: 2,
  })
}
