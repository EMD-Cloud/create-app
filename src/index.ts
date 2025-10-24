#!/usr/bin/env node

import { cyan, green, red, yellow } from 'kolorist'
import { getUserInputs } from './prompts.js'
import { scaffoldProject } from './scaffolder.js'

async function main() {
  console.log(`\n${cyan('✨ Creating a new EMD Cloud project...')}\n`)

  try {
    const inputs = await getUserInputs()

    console.log(`\n${cyan('Setting up your project...')}\n`)

    await scaffoldProject(inputs)

    console.log(
      `\n${green('✓ Project created successfully!')}\n` +
        `${yellow('Next steps:')}\n` +
        `  cd ${inputs.projectName}\n` +
        `  ${inputs.installCommand}\n` +
        `  ${inputs.devCommand}\n`
    )
  } catch (error) {
    if ((error as any).isTtyError) {
      console.log(
        red(
          '✗ Prompt couldn\'t be rendered in the current environment'
        )
      )
    } else if (error instanceof Error && error.message !== 'User cancelled') {
      console.log(red(`✗ Error: ${error.message}`))
    }
    process.exit(1)
  }
}

main()
