import * as core from '@actions/core'
import * as github from '@actions/github'
import { glob } from 'glob'
import { promises as fsPromises } from 'fs'

export async function run(): Promise<void> {
  try {
    const fileEnv: string = core.getInput('env_path', { required: true }).trim()
    const github_token = core.getInput('GITHUB_TOKEN')
    let configCheck: boolean = false

    // Check in parallel
    const files = await glob(fileEnv)

    if (files.length > 0) {
      files.forEach(async file => {
        const contents = await fsPromises.readFile(file, 'utf-8')

        const result = contents.includes('CODEPUSH_KEY_PRD')
        configCheck = !result
      })
    }
    const context = github.context
    if (context.payload.pull_request == null) {
      core.setFailed('No pull request found.')
      return
    }
    const pull_request_number = context.payload.pull_request.number
    const octokit = github.getOctokit(github_token)

    if (!configCheck) {
      core.info(`O codepush não está configurado`)
      core.setOutput('is_configured', 'false')
      await octokit.rest.issues.createComment({
        ...context.repo,
        issue_number: pull_request_number as number,
        body: 'O codepush não está configurado'
      })
    } else {
      await octokit.rest.issues.createComment({
        ...context.repo,
        issue_number: pull_request_number as number,
        body: '🎉 Codepush está configurado'
      })
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
