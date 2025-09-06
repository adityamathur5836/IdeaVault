/**
 * OpenAI Configuration
 * 
 * Purpose: AI services for embeddings, idea generation, and analysis
 * Features: Text embeddings, GPT completions, idea validation
 */

import OpenAI from 'openai'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!

if (!OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API key')
}

export const openai = new OpenAI({
  apiKey: OPENAI_API_KEY
})

// Embedding configuration
export const EMBEDDING_MODEL = 'text-embedding-3-small'
export const EMBEDDING_DIMENSIONS = 1536

/**
 * Generate embedding for text using OpenAI
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text.replace(/\n/g, ' ').trim()
    })
    
    return response.data[0].embedding
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw new Error('Failed to generate embedding')
  }
}

/**
 * Generate embeddings for multiple texts
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: texts.map(text => text.replace(/\n/g, ' ').trim())
    })
    
    return response.data.map(item => item.embedding)
  } catch (error) {
    console.error('Error generating embeddings:', error)
    throw new Error('Failed to generate embeddings')
  }
}

/**
 * Calculate cosine similarity between two embeddings
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Embeddings must have the same length')
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

/**
 * Generate idea suggestions using GPT
 */
export async function generateIdeaSuggestions(
  userIdea: string,
  category?: string
): Promise<string[]> {
  try {
    const prompt = `Based on this business idea: "${userIdea}"${category ? ` in the ${category} category` : ''}, suggest 3 related business ideas that could be complementary or alternative approaches. Keep each suggestion to 1-2 sentences.`

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.7
    })

    const content = response.choices[0]?.message?.content || ''
    return content.split('\n').filter(line => line.trim().length > 0)
  } catch (error) {
    console.error('Error generating idea suggestions:', error)
    throw new Error('Failed to generate idea suggestions')
  }
}

/**
 * Validate and score a business idea
 */
export async function validateIdea(idea: string): Promise<{
  score: number
  feedback: string
  strengths: string[]
  weaknesses: string[]
}> {
  try {
    const prompt = `Analyze this business idea and provide a score from 1-10 and detailed feedback:

"${idea}"

Please respond in this JSON format:
{
  "score": 7,
  "feedback": "Overall assessment...",
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"]
}`

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.3
    })

    const content = response.choices[0]?.message?.content || ''
    return JSON.parse(content)
  } catch (error) {
    console.error('Error validating idea:', error)
    return {
      score: 5,
      feedback: 'Unable to analyze idea at this time.',
      strengths: [],
      weaknesses: []
    }
  }
}
