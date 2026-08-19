import Anthropic from '@anthropic-ai/sdk'

let client

function getClient() {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY pa konfigire nan .env')
    }
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return client
}

export async function generateText(prompt, options = {}) {
  const anthropic = getClient()

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: options.maxTokens || 1024,
    system: options.system,
    messages: [{ role: 'user', content: prompt }],
  })

  return message.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('')
}

const LANGUAGE_NAMES = {
  ht: 'Kreyòl Ayisyen',
  en: 'English',
  fr: 'Français',
  es: 'Español',
}

export async function generateScript({ ideaText, contentLanguage, durationSeconds, style }) {
  const languageName = LANGUAGE_NAMES[contentLanguage] || contentLanguage

  const system = `Ou se AI Brain yon platfòm kreyasyon videyo. Travay ou se pran yon lide videyo epi kreye yon script konplè, separe an scenes, ak yon storyboard pou chak scene.

Reponn SÈLMAN ak yon JSON valid, san okenn tèks anvan oswa apre li, san blòk kòd markdown.

Fòma JSON la dwe egzakteman konsa:
{
  "title": string,
  "scenes": [
    {
      "sceneNumber": number,
      "narrationText": string,
      "storyboardDescription": string,
      "visualPrompt": string,
      "durationSeconds": number
    }
  ]
}

Règ:
- Ekri "title", "narrationText", ak "storyboardDescription" nan lang sa a: ${languageName}.
- Ekri "visualPrompt" an Anglè, paske se lang video-generation API yo konprann pi byen.
- Total tout "durationSeconds" nan "scenes" yo dwe egal ${durationSeconds}.
- Kreye ant 2 ak 6 scenes, selon sa ki fè sans pou dire total la.
- Style videyo a se: ${style}.`

  const raw = await generateText(ideaText, { system, maxTokens: 2048 })

  try {
    return JSON.parse(raw)
  } catch (error) {
    throw new Error(`Claude pa retounen yon JSON valid: ${raw.slice(0, 200)}`)
  }
}
