import { UserInputs } from './prompts.js'

export interface TemplateVariant {
  name: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  configFiles?: Record<string, string>
}

export function getTemplateVariants(inputs: UserInputs): TemplateVariant[] {
  const variants: TemplateVariant[] = []

  // Derive language from variant (e.g., 'react-ts' includes 'ts')
  const isTypeScript = inputs.variant.includes('-ts')

  // Style variants
  const styleVariant = getStyleVariant(inputs.style, isTypeScript)
  if (styleVariant) {
    variants.push(styleVariant)
  }

  // State management variants
  const stateVariant = getStateManagementVariant(inputs.stateManagement, inputs.framework)
  if (stateVariant) {
    variants.push(stateVariant)
  }

  return variants
}

export function getStyleVariant(
  style: string,
  isTypeScript: boolean
): TemplateVariant | null {
  switch (style) {
    case 'scss':
      return {
        name: 'scss',
        devDependencies: {
          sass: '^1.69.5',
        },
      }

    case 'tailwind':
      return {
        name: 'tailwind',
        dependencies: {
          'tailwindcss': '^3.3.6',
        },
        devDependencies: {
          'postcss': '^8.4.31',
          'autoprefixer': '^10.4.16',
        },
      }

    case 'shadcn':
      if (!isTypeScript) {
        return null
      }
      return {
        name: 'shadcn',
        dependencies: {
          'class-variance-authority': '^0.7.0',
          'clsx': '^2.0.0',
          'tailwind-merge': '^2.0.0',
          'lucide-react': '^0.294.0',
        },
        devDependencies: {
          'tailwindcss': '^3.3.6',
          'postcss': '^8.4.31',
          'autoprefixer': '^10.4.16',
        },
      }

    default:
      return null
  }
}

export function getStateManagementVariant(
  stateManagement: string,
  framework: string
): TemplateVariant | null {
  // State management is only relevant for React and Next.js
  if (framework !== 'react' && framework !== 'nextjs') {
    return null
  }

  switch (stateManagement) {
    case 'redux':
      return {
        name: 'redux',
        dependencies: {
          '@reduxjs/toolkit': '^1.9.7',
          'react-redux': '^8.1.3',
        },
      }

    case 'effector':
      return {
        name: 'effector',
        dependencies: {
          'effector': '^23.2.0',
          'effector-react': '^23.2.0',
        },
      }

    case 'tanstack-query':
      return {
        name: 'tanstack-query',
        dependencies: {
          '@tanstack/react-query': '^5.28.0',
        },
      }

    default:
      return null
  }
}
