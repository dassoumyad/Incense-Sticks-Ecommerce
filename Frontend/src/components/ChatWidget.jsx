import { useEffect, useRef, useState } from 'react'
import { request } from '../services/api.js'

const greeting = { role: 'model', text: 'Hello! I can help with our incense, products, and general shopping questions. What would you like to know?' }

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([greeting])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ behavior: 'smooth' })
  }, [messages, open])

  const send = async (event) => {
    event.preventDefault()
    const text = draft.trim()
    if (!text || busy) return
    const nextMessages = [...messages, { role: 'user', text }]
    setMessages(nextMessages)
    setDraft('')
    setBusy(true)
    setError('')
    try {
      const result = await request('/chat/message', {
        method: 'POST',
        body: JSON.stringify({ messages: nextMessages.slice(-8).map(({ role, text: content }) => ({ role, text: content })) }),
      })
      setMessages((current) => [...current, { role: 'model', text: result.answer }])
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return <>
    {open && <section className="store-chat" aria-label="Serein customer chat">
      <header className="store-chat-head"><div><strong>A little help</strong><small>SEREIN SHOPPING ASSISTANT</small></div><button type="button" onClick={() => setOpen(false)} aria-label="Close chat">×</button></header>
      <div className="store-chat-messages" aria-live="polite">
        {messages.map((message, index) => <p key={`${index}-${message.role}`} className={`store-chat-message ${message.role === 'user' ? 'from-customer' : 'from-assistant'}`}>{message.text}</p>)}
        {busy && <p className="store-chat-message from-assistant chat-typing">Thinking…</p>}
        {error && <p className="store-chat-error">{error}</p>}
        <div ref={endRef} />
      </div>
      <form className="store-chat-form" onSubmit={send}>
        <label className="sr-only" htmlFor="store-chat-input">Your question</label>
        <input id="store-chat-input" maxLength="1200" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ask us anything…" disabled={busy} />
        <button type="submit" disabled={busy || !draft.trim()} aria-label="Send message">↗</button>
      </form>
      <small className="store-chat-foot">Gemini AI may make mistakes. Messages go to Google; don’t include personal, order, or payment details.</small>
    </section>}
    <button className={`store-chat-toggle ${open ? 'is-open' : ''}`} type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? 'Close help chat' : 'Open help chat'}>{open ? '×' : <><span>✳</span> Ask us</>}</button>
  </>
}
