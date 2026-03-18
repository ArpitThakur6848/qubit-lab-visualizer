'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Loader2 } from 'lucide-react'
import type { QubitStatus } from './info-panel'
import type { GateEntry } from './control-panel'
import katex from 'katex'
import 'katex/dist/katex.min.css'

interface AiChatPanelProps {
  status: QubitStatus
  gates: GateEntry[]
}

type Message = {
  role: 'user' | 'assistant'
  content: string
}

function formatComplex(c: { real: number; imag: number }): string {
  const r = c.real.toFixed(3)
  const i = c.imag.toFixed(3)
  if (c.imag === 0) return r
  if (c.real === 0) return `${i}i`
  const sign = c.imag >= 0 ? '+' : ''
  return `${r} ${sign} ${i}i`
}

function buildQubitContext(status: QubitStatus, gates: GateEntry[]): string {
  const lines = [
    `Alpha: ${formatComplex(status.alpha)}`,
    `Beta: ${formatComplex(status.beta)}`,
    `Theta: ${status.theta.toFixed(1)} degrees`,
    `Phi: ${status.phi.toFixed(1)} degrees`,
    `Phase: ${status.phase.toFixed(3)}`,
    `Normalization: ${status.n.toFixed(4)}`,
    `P(|0>): ${(Math.pow(Math.sqrt(status.alpha.real ** 2 + status.alpha.imag ** 2), 2) * 100).toFixed(1)}%`,
    `P(|1>): ${(Math.pow(Math.sqrt(status.beta.real ** 2 + status.beta.imag ** 2), 2) * 100).toFixed(1)}%`,
  ]
  if (gates.length > 0) {
    lines.push(`Applied gates: ${gates.map((g) => g.name).join(' -> ')}`)
  } else {
    lines.push('No gates applied yet.')
  }
  return lines.join('\n')
}

function renderMath(text: string): string {
  // Replace display math $$...$$ first, then inline $...$
  let result = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: true, throwOnError: false })
    } catch {
      return `$$${math}$$`
    }
  })
  result = result.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false })
    } catch {
      return `$${math}$`
    }
  })
  return result
}

export function AiChatPanel({ status, gates }: AiChatPanelProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMessage: Message = { role: 'user', content: text }
    const updated = [...messages, userMessage]
    setMessages(updated)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updated,
          qubitContext: buildQubitContext(status, gates),
        }),
      })
      const data = await res.json()
      if (data.error) {
        setMessages([...updated, { role: 'assistant', content: `Error: ${data.error}` }])
      } else {
        setMessages([...updated, { role: 'assistant', content: data.reply }])
      }
    } catch {
      setMessages([...updated, { role: 'assistant', content: 'Failed to reach the AI service.' }])
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-sky-600 text-white shadow-lg shadow-sky-600/20 transition-transform hover:scale-105 hover:bg-sky-500"
        aria-label="Open AI assistant"
      >
        <MessageCircle className="h-5 w-5" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex h-[28rem] w-80 flex-col rounded-2xl border border-zinc-800/50 bg-zinc-900/95 shadow-2xl shadow-black/40 backdrop-blur-md">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-zinc-800/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-sky-400" />
          <span className="text-sm font-medium text-zinc-200">AI Assistant</span>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {messages.length === 0 && (
          <p className="text-center text-xs text-zinc-500">
            Ask me anything about your qubit state, gates, or quantum concepts.
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-sky-600/80 text-white'
                  : 'bg-zinc-800/60 text-zinc-200'
              }`}
              {...(msg.role === 'assistant'
                ? { dangerouslySetInnerHTML: { __html: renderMath(msg.content).replace(/\n/g, '<br/>') } }
                : { children: msg.content })}
            />
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-xl bg-zinc-800/60 px-3 py-2 text-sm text-zinc-400">
              <Loader2 className="h-3 w-3 animate-spin" />
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-zinc-800/50 p-3">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about your qubit..."
            className="flex-1 rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 text-white hover:bg-sky-500 disabled:opacity-40 disabled:pointer-events-none"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
