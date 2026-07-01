const OpenAI = require('openai')

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// AI Summary Generate karo
const generateSummary = async (req, res) => {
  try {
    const { transcript } = req.body

    if (!transcript || !transcript.trim()) {
      return res.status(400).json({ message: 'Transcript required hai!' })
    }

    const response = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an expert meeting assistant. Analyze the meeting transcript and provide:
1. A concise summary (2-3 sentences)
2. Key decisions made
3. Action items with assignees
Return response in this exact JSON format:
{
  "summary": "...",
  "keyDecisions": ["decision1", "decision2"],
  "actionItems": [
    { "task": "...", "assignee": "...", "done": false }
  ]
}`
        },
        {
          role: 'user',
          content: `Meeting Transcript:\n${transcript}`
        }
      ],
      temperature: 0.3,
      max_tokens: 1000,
    })

    const content = response.choices[0].message.content
    
    // Parse JSON response
    const clean = content.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    res.json({
      message: 'AI Summary generated! ✅',
      summary: parsed.summary,
      keyDecisions: parsed.keyDecisions || [],
      actionItems: parsed.actionItems || [],
    })

  } catch (error) {
    console.error('OpenAI Error:', error)
    res.status(500).json({ message: 'AI generation failed: ' + error.message })
  }
}

module.exports = { generateSummary }