import prompts from 'prompts'
import { cyan, yellow, blue } from 'kolorist'

export type ColorFunc = (str: string | number) => string

export interface FrameworkVariant {
  name: string
  display: string
  color: ColorFunc
}

export interface Framework {
  name: string
  display: string
  color: ColorFunc
  variants: FrameworkVariant[]
}

export interface UserInputs {
  projectName: string
  framework: string
  variant: string
  style: 'vanilla' | 'scss' | 'tailwind' | 'shadcn'
  stateManagement: 'none' | 'redux' | 'effector' | 'tanstack-query'
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun'
  initGit: boolean
  eslintPreset: 'standard' | 'airbnb' | 'none'
  installCommand: string
  devCommand: string
}

const FRAMEWORKS: Framework[] = [
  {
    name: 'react',
    display: 'React + Vite',
    color: cyan,
    variants: [
      {
        name: 'react',
        display: 'JavaScript',
        color: yellow,
      },
      {
        name: 'react-ts',
        display: 'TypeScript',
        color: blue,
      },
      {
        name: 'react-swc',
        display: 'JavaScript + SWC',
        color: yellow,
      },
      {
        name: 'react-swc-ts',
        display: 'TypeScript + SWC',
        color: blue,
      },
    ],
  },
  {
    name: 'nextjs',
    display: 'Next.js 16',
    color: cyan,
    variants: [
      {
        name: 'nextjs',
        display: 'JavaScript',
        color: yellow,
      },
      {
        name: 'nextjs-ts',
        display: 'TypeScript',
        color: blue,
      },
    ],
  },
]

const STYLES = [
  {
    title: 'Vanilla CSS',
    value: 'vanilla',
  },
  {
    title: 'SCSS',
    value: 'scss',
  },
  {
    title: 'Tailwind CSS',
    value: 'tailwind',
  },
  {
    title: 'Tailwind CSS + shadcn/ui',
    value: 'shadcn',
  },
]

const STATE_MANAGEMENT = [
  {
    title: 'None',
    value: 'none',
  },
  {
    title: 'Redux',
    value: 'redux',
  },
  {
    title: 'Effector',
    value: 'effector',
  },
  {
    title: 'TanStack Query',
    value: 'tanstack-query',
  },
]

const PACKAGE_MANAGERS = [
  {
    title: 'npm',
    value: 'npm' as const,
  },
  {
    title: 'yarn',
    value: 'yarn' as const,
  },
  {
    title: 'pnpm',
    value: 'pnpm' as const,
  },
  {
    title: 'bun',
    value: 'bun' as const,
  },
]

const ESLINT_PRESETS = [
  {
    title: 'Standard',
    value: 'standard',
  },
  {
    title: 'Airbnb',
    value: 'airbnb',
  },
  {
    title: 'None',
    value: 'none',
  },
]

export function isValidProjectName(name: string): boolean {
  return /^(?:@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\/)?[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(
    name
  )
}

export function getStyleOptions(framework: string, variant: string): typeof STYLES {
  const baseOptions = [
    { title: 'Vanilla CSS', value: 'vanilla' },
    { title: 'SCSS', value: 'scss' },
    { title: 'Tailwind CSS', value: 'tailwind' },
  ]

  // shadcn is available for both JS and TS in React and Next.js
  const isReactOrNext = framework === 'react' || framework === 'nextjs'

  if (isReactOrNext) {
    return [...baseOptions, { title: 'Tailwind CSS + shadcn/ui', value: 'shadcn' }]
  }

  return baseOptions
}

export function getPackageManagerCommand(
  pm: string,
  command: 'install' | 'dev'
): string {
  switch (pm) {
    case 'yarn':
      return command === 'dev' ? 'yarn dev' : 'yarn'
    case 'pnpm':
      return command === 'dev' ? 'pnpm dev' : 'pnpm install'
    case 'bun':
      return command === 'dev' ? 'bun run dev' : 'bun install'
    case 'npm':
    default:
      return command === 'dev' ? 'npm run dev' : 'npm install'
  }
}

export function detectPackageManager(): 'npm' | 'yarn' | 'pnpm' | 'bun' {
  const userAgent = process.env.npm_config_user_agent || ''

  if (userAgent.includes('bun')) return 'bun'
  if (userAgent.includes('yarn')) return 'yarn'
  if (userAgent.includes('pnpm')) return 'pnpm'
  return 'npm'
}

export async function getUserInputs(): Promise<UserInputs> {
  const defaultProjectName = 'emd-app'

  const response = await prompts(
    [
      {
        type: 'text',
        name: 'projectName',
        message: 'Project name:',
        initial: defaultProjectName,
        validate: (name) => {
          if (!name) return 'Project name is required'
          if (!isValidProjectName(name)) {
            return 'Invalid project name. Use only lowercase letters, numbers, and hyphens'
          }
          return true
        },
      },
      {
        type: 'select',
        name: 'framework',
        message: 'Select a framework:',
        choices: FRAMEWORKS.map((framework) => ({
          title: framework.color(framework.display),
          value: framework.name,
        })),
      },
      {
        type: 'select',
        name: 'variant',
        message: 'Select a variant:',
        choices: (frameworkName: string) => {
          const framework = FRAMEWORKS.find((f) => f.name === frameworkName)
          if (!framework) return []

          return framework.variants.map((variant) => ({
            title: variant.color(variant.display),
            value: variant.name,
          }))
        },
      },
      {
        type: 'select',
        name: 'style',
        message: 'Select a styling approach:',
        choices: (variant: string, values: any) => {
          return getStyleOptions(values.framework, variant)
        },
      },
      {
        type: 'select',
        name: 'stateManagement',
        message: 'Select a state management solution:',
        choices: STATE_MANAGEMENT,
      },
      {
        type: 'select',
        name: 'packageManager',
        message: 'Select a package manager:',
        choices: PACKAGE_MANAGERS,
        initial: PACKAGE_MANAGERS.findIndex(
          (pm) => pm.value === detectPackageManager()
        ),
      },
      {
        type: 'toggle',
        name: 'initGit',
        message: 'Initialize a git repository?',
        initial: true,
        active: 'yes',
        inactive: 'no',
      },
      {
        type: 'select',
        name: 'eslintPreset',
        message: 'Select an ESLint preset:',
        choices: ESLINT_PRESETS,
      },
    ],
    {
      onCancel: () => {
        throw new Error('User cancelled')
      },
    }
  )

  const installCommand = getPackageManagerCommand(
    response.packageManager,
    'install'
  )
  const devCommand = getPackageManagerCommand(response.packageManager, 'dev')

  return {
    ...response,
    installCommand,
    devCommand,
  }
}
