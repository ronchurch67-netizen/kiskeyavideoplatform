// Luma Dream Machine. Menm patèn ak Veo: lanse yon jenerasyon, tcheke
// estati l tanzantan jiskaske li fini, epi telechaje videyo a.
//
// Pou image-to-video, Luma mande yon URL piblik pou foto a (pa yon fichye
// anbake dirèkteman) — sa ap mache tout bon lè nou gen vrè Storage an liy.

const BASE_URL = 'https://api.lumalabs.ai/dream-machine/v1'

function getApiKey() {
  const apiKey = process.env.LUMA_API_KEY
  if (!apiKey) {
    throw new Error('LUMA_API_KEY pa konfigire nan .env')
  }
  return apiKey
}

export async function startVideoGeneration({ prompt, imageUrl, resolution = '720p', duration = '5s' }) {
  const apiKey = getApiKey()
  const model = process.env.LUMA_MODEL || 'ray-2'

  const body = { prompt, model, resolution, duration }
  if (imageUrl) {
    body.keyframes = { frame0: { type: 'image', url: imageUrl } }
  }

  const response = await fetch(`${BASE_URL}/generations`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Luma erè (${response.status}): ${errorBody.slice(0, 300)}`)
  }

  const data = await response.json()
  return data.id
}

export async function checkGeneration(id) {
  const apiKey = getApiKey()

  const response = await fetch(`${BASE_URL}/generations/${id}`, {
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${apiKey}`,
    },
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Luma erè (${response.status}): ${errorBody.slice(0, 300)}`)
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
  const pollIntervalMs = config.pollIntervalMs || 6000
  const timeoutMs = config.timeoutMs || 180000

  const id = await startVideoGeneration(options)
  const startedAt = Date.now()

  while (Date.now() - startedAt < timeoutMs) {
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs))
    const generation = await checkGeneration(id)

    if (generation.state === 'completed') {
      return downloadVideo(generation.assets.video)
    }

    if (generation.state === 'failed') {
      throw new Error(`Luma jenerasyon echwe: ${generation.failure_reason || 'rezon enkoni'}`)
    }
  }

  throw new Error('Luma pran twòp tan pou fini (timeout).')
}
