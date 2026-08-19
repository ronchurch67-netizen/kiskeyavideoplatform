// Kling, atravè WaveSpeedAI (yon revande ki bay aksè inifye a plizyè
// modèl video-generation, ansanm ak Kling). Menm patèn job+polling ak
// lòt provider yo.

const BASE_URL = 'https://api.wavespeed.ai/api/v3'

function getApiKey() {
  const apiKey = process.env.WAVESPEED_API_KEY
  if (!apiKey) {
    throw new Error('WAVESPEED_API_KEY pa konfigire nan .env')
  }
  return apiKey
}

export async function startVideoGeneration({ prompt, imageUrl, duration = 5 }) {
  const apiKey = getApiKey()
  const endpoint = imageUrl
    ? `${BASE_URL}/kwaivgi/kling-v3.0-std/image-to-video`
    : `${BASE_URL}/kwaivgi/kling-v3.0-std/text-to-video`

  const body = { prompt, duration }
  if (imageUrl) {
    body.image = imageUrl
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Kling erè (${response.status}): ${errorBody.slice(0, 300)}`)
  }

  const data = await response.json()
  return data.data?.id || data.id
}

export async function checkPrediction(id) {
  const apiKey = getApiKey()

  const response = await fetch(`${BASE_URL}/predictions/${id}/result`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Kling erè (${response.status}): ${errorBody.slice(0, 300)}`)
  }

  return response.json()
}

export async function downloadVideo(url) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Pa ka telechaje videyo a (${response.status})`)
  }

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

export async function generateVideoAndWait(options, config = {}) {
  const pollIntervalMs = config.pollIntervalMs || 5000
  const timeoutMs = config.timeoutMs || 180000

  const id = await startVideoGeneration(options)
  const startedAt = Date.now()

  while (Date.now() - startedAt < timeoutMs) {
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs))
    const result = await checkPrediction(id)
    const status = result.data?.status || result.status

    if (status === 'completed') {
      const outputs = result.data?.outputs || result.outputs
      const videoUrl = outputs?.[0]
      if (!videoUrl) {
        throw new Error(`Kling fini san retounen yon videyo: ${JSON.stringify(result).slice(0, 300)}`)
      }
      return downloadVideo(videoUrl)
    }

    if (['failed', 'cancelled', 'timeout'].includes(status)) {
      throw new Error(`Kling jenerasyon echwe (${status}): ${JSON.stringify(result).slice(0, 300)}`)
    }
  }

  throw new Error('Kling pran twòp tan pou fini (timeout).')
}
