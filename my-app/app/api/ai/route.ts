import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'

const SYSTEM_PROMPT = `You are a quantum computing tutor embedded in QubitLab, an interactive single-qubit Bloch sphere visualizer. Your role is to help users understand what they are seeing and learning.

Context you may receive:
- The current qubit state: amplitudes alpha and beta, Bloch sphere angles theta and phi, applied gate sequence, and probabilities.

Guidelines:
- Be concise. Keep answers to 2-4 short paragraphs unless the user asks for more detail.
- Use a friendly but professional tone. No emojis. No m-dashes.
- When math is needed, use LaTeX notation wrapped in dollar signs for inline ($...$) and double dollar signs for display ($$...$$).
- Focus on single-qubit quantum mechanics: superposition, measurement probabilities, Bloch sphere geometry, and standard gates (X, Y, Z, H, S, T, and rotation gates Rx, Ry, Rz).
- Explain what gates do both mathematically (matrix form) and intuitively (rotation on the Bloch sphere).
- If the user provides their current qubit state, reference it directly in your explanation.
- Do not discuss multi-qubit systems, entanglement, or quantum algorithms beyond single-qubit scope unless briefly clarifying why they are out of scope.
- Do not make up information. If you are unsure, say so.
- Do not discuss topics unrelated to quantum computing or the QubitLab application.`

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

export async function POST(request: NextRequest) {
  if (!openai) {
    return NextResponse.json(
      { error: 'AI assistant is not configured. The OPENAI_API_KEY environment variable is missing.' },
      { status: 503 }
    )
  }

  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const body = await request.json()
  const { messages, qubitContext } = body as {
    messages: { role: 'user' | 'assistant'; content: string }[]
    qubitContext?: string
  }

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'Messages required' }, { status: 400 })
  }

  // Build the message array for OpenAI
  const systemContent = qubitContext
    ? `${SYSTEM_PROMPT}\n\nCurrent qubit state:\n${qubitContext}`
    : SYSTEM_PROMPT

  const openaiMessages: OpenAI.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemContent },
    ...messages.slice(-10).map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  ]

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: openaiMessages,
      max_tokens: 500,
      temperature: 0.7,
    })

    const reply = completion.choices[0]?.message?.content ?? 'No response generated.'

    return NextResponse.json({ reply })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'OpenAI request failed'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
