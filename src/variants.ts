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
  const styleVariant = getStyleVariant(inputs.style, isTypeScript, inputs.framework)
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
  isTypeScript: boolean,
  framework: string = 'react'
): TemplateVariant | null {
  switch (style) {
    case 'scss':
      return {
        name: 'scss',
        devDependencies: {
          sass: '^1.87.0',
        },
      }

    case 'tailwind':
      return {
        name: 'tailwind',
        dependencies: {
          'tailwindcss': '^4.1.16',
        },
        devDependencies: framework === 'nextjs'
          ? {
              '@tailwindcss/postcss': '^4.1.16',
              'postcss': '^8.4.51',
            }
          : {
              '@tailwindcss/vite': '^4.1.16',
            },
      }

    case 'shadcn':
      if (!isTypeScript) {
        return null
      }
      return {
        name: 'shadcn',
        dependencies: {
          'tailwindcss': '^4.1.16',
          'class-variance-authority': '^0.7.1',
          'clsx': '^2.1.1',
          'tailwind-merge': '^3.3.1',
          'lucide-react': '^0.468.0',
          'tw-animate-css': '^1.0.5',
        },
        devDependencies: framework === 'nextjs'
          ? {
              '@tailwindcss/postcss': '^4.1.16',
              'postcss': '^8.4.51',
            }
          : {
              '@tailwindcss/vite': '^4.1.16',
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
          '@reduxjs/toolkit': '^2.9.2',
          'react-redux': '^9.2.0',
        },
      }

    case 'effector':
      return {
        name: 'effector',
        dependencies: {
          'effector': '^24.0.0',
          'effector-react': '^24.0.0',
        },
      }

    case 'tanstack-query':
      return {
        name: 'tanstack-query',
        dependencies: {
          '@tanstack/react-query': '^5.90.5',
        },
      }

    default:
      return null
  }
}
