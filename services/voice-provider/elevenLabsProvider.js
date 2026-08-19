// Node genyen fetch entegre — pa gen bezwen ajoute yon SDK/depandans anplis
// pou rele ElevenLabs, API REST li a senp ase.

export async function synthesizeSpeech(text, options = {}) {
  const apiKey = process.env.ELEVENLABS_API_KEY
  const voiceId = options.voiceId || process.env.ELEVENLABS_VOICE_ID
  const modelId = options.modelId || 'eleven_multilingual_v2'

  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY pa konfigire nan .env')
  }
  if (!voiceId) {
    throw new Error('ELEVENLABS_VOICE_ID pa konfigire nan .env')
  }

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({ text, model_id: modelId }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`ElevenLabs erè (${response.status}): ${errorBody.slice(0, 300)}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}
