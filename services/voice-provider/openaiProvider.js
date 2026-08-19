// Menm fòm ak elevenLabsProvider.js: yon sèl fonksyon synthesizeSpeech(text).
// Backend lan pa bezwen konnen ki founisè li ye anba a.

export async function synthesizeSpeech(text, options = {}) {
  const apiKey = process.env.OPENAI_API_KEY
  const voice = options.voice || process.env.OPENAI_TTS_VOICE || 'alloy'
  const model = options.model || 'gpt-4o-mini-tts'

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY pa konfigire nan .env')
  }

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, voice, input: text }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`OpenAI TTS erè (${response.status}): ${errorBody.slice(0, 300)}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}
