// Google Veo (Gemini API). Menm jan ak lòt provider yo, itilize fetch
// entegre Node a, san SDK anplis.
//
// Video generation se yon operasyon "long-running": nou lanse l, epi nou
// tcheke estati l tanzantan jiskaske li fini.

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta'

function getApiKey() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY pa konfigire nan .env')
  }
  return apiKey
}

export async function startVideoGeneration({
  prompt,
  imageBase64,
  mimeType = 'image/png',
  aspectRatio = '16:9',
  resolution = '720p',
}) {
  const apiKey = getApiKey()
  const model = process.env.VEO_MODEL || 'veo-3.1-fast-generate-preview'

  const instance = { prompt }
  if (imageBase64) {
    instance.image = { inlineData: { mimeType, data: imageBase64 } }
  }

  const response = await fetch(`${BASE_URL}/models/${model}:predictLongRunning`, {
    method: 'POST',
    headers: {
      'x-goog-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      instances: [instance],
      parameters: { aspectRatio, resolution },
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Veo erè (${response.status}): ${errorBody.slice(0, 300)}`)
  }

  const data = await response.json()
  return data.name
}

export async function checkVideoOperation(operationName) {
  const apiKey = getApiKey()

  const response = await fetch(`${BASE_URL}/${operationName}`, {
    headers: { 'x-goog-api-key': apiKey },
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Veo erè (${response.status}): ${errorBody.slice(0, 300)}`)
  }

  return response.json()
}

export async function downloadVideo(uri) {
  const apiKey = getApiKey()

  const response = await fetch(uri, {
    headers: { 'x-goog-api-key': apiKey },
  })

  if (!response.ok) {
    throw new Error(`Pa ka telechaje videyo a (${response.status})`)
  }

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

export async function generateVideoAndWait(options, config = {}) {
  const pollIntervalMs = config.pollIntervalMs || 10000
  const timeoutMs = config.timeoutMs || 180000

  const operationName = await startVideoGeneration(options)
  const startedAt = Date.now()

  while (Date.now() - startedAt < timeoutMs) {
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs))
    const operation = await checkVideoOperation(operationName)

    if (operation.done) {
      if (operation.error) {
        throw new Error(`Veo erè jenerasyon: ${operation.error.message}`)
      }

      const videoUri = operation.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri
      if (!videoUri) {
        throw new Error('Veo fini san retounen yon videyo.')
      }

      return downloadVideo(videoUri)
    }
  }

  throw new Error('Veo pran twòp tan pou fini (timeout).')
}
