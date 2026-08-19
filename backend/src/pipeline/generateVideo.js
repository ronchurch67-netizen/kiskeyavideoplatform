import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import ffmpegPath from 'ffmpeg-static'
import { synthesizeSpeech } from '../../../services/voice-provider/elevenLabsProvider.js'
import { generateVideoAndWait } from '../../../services/video-provider/klingProvider.js'
import { storagePath } from '../config/env.js'

const execFileAsync = promisify(execFile)

const TMP_DIR = storagePath('tmp')
const VIDEO_DIR = storagePath('videos')

// Video Generation Pipeline: pou chak scene, jenere vwa ak videyo an
// paralèl posib, mare yo ansanm, epi konkatene tout scenes yo an yon sèl
// videyo final.
export async function runVideoPipeline(project) {
  if (!project.scenes || project.scenes.length === 0) {
    throw new Error('Pwojè a pa gen scenes — jenere script anvan (POST .../script).')
  }

  await mkdir(TMP_DIR, { recursive: true })
  await mkdir(VIDEO_DIR, { recursive: true })

  const sceneClipPaths = []

  for (const scene of project.scenes) {
    const audioBuffer = await synthesizeSpeech(scene.narrationText)
    const audioPath = path.join(TMP_DIR, `p${project.id}-s${scene.sceneNumber}-audio.mp3`)
    await writeFile(audioPath, audioBuffer)

    const videoBuffer = await generateVideoAndWait({
      prompt: scene.visualPrompt,
      duration: Math.max(3, Math.round(scene.durationSeconds)),
    })
    const rawVideoPath = path.join(TMP_DIR, `p${project.id}-s${scene.sceneNumber}-raw.mp4`)
    await writeFile(rawVideoPath, videoBuffer)

    const scenePath = path.join(TMP_DIR, `p${project.id}-s${scene.sceneNumber}.mp4`)
    await execFileAsync(ffmpegPath, [
      '-y',
      '-i', rawVideoPath,
      '-i', audioPath,
      '-c:v', 'copy',
      '-c:a', 'aac',
      '-shortest',
      scenePath,
    ])

    sceneClipPaths.push(scenePath)
  }

  const listPath = path.join(TMP_DIR, `p${project.id}-list.txt`)
  const listContent = sceneClipPaths
    .map((clipPath) => `file '${clipPath.replace(/\\/g, '/').replace(/'/g, "'\\''")}'`)
    .join('\n')
  await writeFile(listPath, listContent)

  const fileName = `project-${project.id}-${Date.now()}.mp4`
  const finalPath = path.join(VIDEO_DIR, fileName)

  await execFileAsync(ffmpegPath, [
    '-y',
    '-f', 'concat',
    '-safe', '0',
    '-i', listPath,
    '-c', 'copy',
    finalPath,
  ])

  return { fileName }
}
