import * as core from '@actions/core'
import { glob } from 'glob'
import { promises as fsPromises } from 'fs'

export async function run(): Promise<void> {
  try {
    const fileEnv: string = core.getInput('env_path', { required: true }).trim()

    let configCheck: boolean = false

    // Check in parallel
    const files = await glob(fileEnv)

    if (files.length > 0) {
      files.forEach(async file => {
        const contents = await fsPromises.readFile(file, 'utf-8')

        const result = contents.includes('CODEPUSH_KEY_PRD')
        configCheck = !result
        // fs.readFile(file, function (err, data) {
        //   if (err) {
        //     core.error(`Error: ${err.message}`)
        //   } else {
        //     configCheck = data.toString()
        //     // forFile(data.toString(), file);
        //   }
        // })
      })
    }

    if (!configCheck) {
      core.info(`O codepush não está configurado`)
      core.setOutput('is_configured', 'false')
    } else {
      core.info('🎉 Codepush está configurado')
      core.setOutput('is_configured', 'true')
    }
  } catch (error) {
    if (!(error instanceof Error)) {
      throw error
    }
    core.setFailed(error.message)
  }
}
