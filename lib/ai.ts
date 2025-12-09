import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface CompatibilitySignals {
  values: string[]
  personalityTraits: string[]
  communicationStyle: string
  relationshipGoals: string[]
  interests: string[]
  dealbreakers: string[]
  emotionalTone: string
  authenticity: number // 0-10 score
  insights: string[]
}

export async function analyzeProfile(bio: string): Promise<CompatibilitySignals> {
  const prompt = `Analyze this dating profile bio and extract deep compatibility signals. Be insightful and read between the lines.

Bio:
"""
${bio}
"""

Extract the following in JSON format:
{
  "values": ["list of core values expressed or implied"],
  "personalityTraits": ["key personality traits"],
  "communicationStyle": "description of how they communicate",
  "relationshipGoals": ["what they're looking for in relationships"],
  "interests": ["hobbies, passions, lifestyle interests"],
  "dealbreakers": ["things they clearly wouldn't be compatible with"],
  "emotionalTone": "overall emotional tone of the writing",
  "authenticity": number 0-10 (how genuine and thoughtful is this),
  "insights": ["deeper insights about this person's compatibility needs"]
}

Be thorough. Read between the lines. Extract implicit signals, not just explicit statements.`

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type')
  }

  // Extract JSON from response
  const jsonMatch = content.text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Could not parse AI response')
  }

  return JSON.parse(jsonMatch[0])
}

export async function generateEmbedding(text: string): Promise<number[]> {
  // For embeddings, we'll use Claude to create a semantic representation
  // In production, you might use a dedicated embedding model
  const prompt = `Convert this profile analysis into a semantic embedding representation. Output 1536 numbers between -1 and 1 that capture the semantic meaning, separated by commas.

Content: ${text}

Output format: comma-separated numbers only, no other text.`

  const message = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022', // Cheaper model for embeddings
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type')
  }

  // Parse the embedding
  const numbers = content.text.trim().split(',').map(n => parseFloat(n.trim()))

  // Pad or truncate to 1536 dimensions
  while (numbers.length < 1536) {
    numbers.push(0)
  }

  return numbers.slice(0, 1536)
}

export async function generateCompatibilityExplanation(
  user1Analysis: CompatibilitySignals,
  user2Analysis: CompatibilitySignals,
  score: number
): Promise<string> {
  const prompt = `Two people have been matched on a dating app. Generate a thoughtful, warm explanation of their compatibility.

Person 1 Analysis:
${JSON.stringify(user1Analysis, null, 2)}

Person 2 Analysis:
${JSON.stringify(user2Analysis, null, 2)}

Compatibility Score: ${score}/100

Write a 3-4 paragraph explanation that:
1. Highlights the most interesting compatibility signals
2. Explains WHY these signals matter for relationship potential
3. Points out complementary differences that could work well
4. Is warm, encouraging, but honest

Write in second person ("You both..."). Be insightful and genuine.`

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type')
  }

  return content.text.trim()
}
