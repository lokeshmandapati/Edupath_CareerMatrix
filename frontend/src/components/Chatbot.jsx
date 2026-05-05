import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { postChat } from '../services/aiApi'
import ChatMessage from './ChatMessage'
import FloatingChatButton from './FloatingChatButton'
import { ENGINEERING_BRANCHES } from '../data/assessmentOptions'
import { AFTER12_LAST_PREDICTION_KEY, CLASS10_LAST_PREDICTION_KEY } from '../constants/storageKeys'

const STORAGE_KEY = 'careermatrix_chat_history'
const MAX_STORED = 16

function loadStoredMessages() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-MAX_STORED)
  } catch {
    return []
  }
}

function saveStoredMessages(messages) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_STORED)))
  } catch {
    /* ignore quota */
  }
}

function readChatContext() {
  let branch = null
  let branchLabel = null
  let skills = []
  let interests = []
  let topCareer = null
  let assessmentType = 'ENGINEERING'
  try {
    branch = localStorage.getItem('careermatrix_branch')
    branchLabel = localStorage.getItem('careermatrix_branch_label')
    const rawPred = localStorage.getItem('careermatrix_last_prediction')
    if (rawPred) {
      const p = JSON.parse(rawPred)
      topCareer = p.topCareer || null
    }
    const raw10 = localStorage.getItem(CLASS10_LAST_PREDICTION_KEY)
    const raw12 = localStorage.getItem(AFTER12_LAST_PREDICTION_KEY)
    // Prefer the most recent non-engineering context if present.
    if (raw12) {
      const p12 = JSON.parse(raw12)
      if (p12?.topCareer) {
        assessmentType = 'AFTER12'
        topCareer = p12.topCareer
      }
    } else if (raw10) {
      const p10 = JSON.parse(raw10)
      if (p10?.topCareer) {
        assessmentType = 'CLASS10'
        topCareer = p10.topCareer
      }
    }
    const sk = localStorage.getItem('careermatrix_last_skills')
    const ins = localStorage.getItem('careermatrix_last_interests')
    if (sk) skills = JSON.parse(sk)
    if (ins) interests = JSON.parse(ins)
  } catch {
    /* ignore */
  }
  return { assessmentType, branch, branchLabel, skills, interests, topCareer }
}

const WELCOME =
  "Hi! I'm your CareerMatrix assistant. Ask about careers, skills, technologies, resumes, or learning resources — I'll tailor hints to your engineering branch when you've set one (e.g. after an assessment)."

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState(() => {
    const stored = loadStoredMessages()
    if (stored.length > 0) return stored
    return [{ role: 'assistant', content: WELCOME }]
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [branchHint, setBranchHint] = useState(() => {
    const { branch, branchLabel } = readChatContext()
    return branchLabel || (branch && ENGINEERING_BRANCHES.find((b) => b.id === branch)?.label) || null
  })
  const [modeHint, setModeHint] = useState(() => {
    const { assessmentType } = readChatContext()
    return assessmentType || 'ENGINEERING'
  })
  const endRef = useRef(null)

  useEffect(() => {
    saveStoredMessages(messages)
  }, [messages])

  useEffect(() => {
    const { branchLabel, branch, assessmentType } = readChatContext()
    setBranchHint(branchLabel || (branch && ENGINEERING_BRANCHES.find((b) => b.id === branch)?.label) || null)
    setModeHint(assessmentType || 'ENGINEERING')
  }, [open])

  const scrollToEnd = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToEnd()
  }, [messages, open, scrollToEnd])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setError('')

    const priorHistory = messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.content }))

    const ctx = readChatContext()

    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setLoading(true)

    try {
      const data = await postChat({
        message: text,
        history: priorHistory,
        assessmentType: ctx.assessmentType,
        branch: ctx.branch || ctx.branchLabel || undefined,
        skills: Array.isArray(ctx.skills) ? ctx.skills : [],
        interests: Array.isArray(ctx.interests) ? ctx.interests : [],
        topCareer: ctx.topCareer || undefined,
      })
      const reply = data?.reply ?? 'Sorry, I could not generate a reply.'
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } catch (e) {
      const msg =
        e.response?.data?.error ||
        e.message ||
        'Something went wrong. Please check that the API is running and try again.'
      setError(typeof msg === 'string' ? msg : 'Request failed.')
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I could not reach the server. Please try again in a moment.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <>
      <FloatingChatButton open={open} onClick={() => setOpen((o) => !o)} disabled={false} />

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="fixed bottom-24 right-6 z-[99] flex w-[min(100vw-2rem,400px)] flex-col overflow-hidden rounded-2xl border border-borderline bg-surface shadow-card sm:bottom-28 sm:right-8 sm:w-[420px]"
            role="dialog"
            aria-label="Career assistant chat"
          >
            <div className="border-b border-borderline bg-gradient-to-br from-primary to-primary/80 px-4 py-3 text-white shadow-[0_0_22px_rgba(var(--glow))]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display text-sm font-semibold">Career Assistant</p>
                  <p className="text-xs text-white/90">Branch-aware skills, tools & career guidance</p>
                </div>
                <span className="shrink-0 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white ring-1 ring-white/25">
                  Mode:{' '}
                  {modeHint === 'CLASS10' ? 'Class 10' : modeHint === 'AFTER12' ? 'After 12th' : 'Engineering'}
                </span>
              </div>
              {branchHint ? (
                <p className="mt-2 rounded-lg bg-white/15 px-2 py-1.5 text-[11px] leading-snug text-white">
                  You are asking as a <span className="font-semibold">{branchHint}</span> student
                  {readChatContext().topCareer ? (
                    <>
                      {' '}
                      · Top match: <span className="font-semibold">{readChatContext().topCareer}</span>
                    </>
                  ) : null}
                </p>
              ) : (
                <p className="mt-2 text-[11px] text-white/85">
                  Set your branch via assessment or profile for more targeted answers.
                </p>
              )}
            </div>

            <div className="max-h-[min(55vh,420px)] space-y-3 overflow-y-auto bg-page/60 p-3">
              {messages.map((m, i) => (
                <ChatMessage key={`${i}-${m.role}-${m.content?.slice(0, 24)}`} role={m.role} content={m.content} />
              ))}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="rounded-2xl rounded-bl-md border border-borderline bg-surface px-4 py-3 text-sm text-muted shadow-sm">
                    <span className="inline-flex gap-1">
                      <span className="animate-bounce">●</span>
                      <span className="animate-bounce [animation-delay:120ms]">●</span>
                      <span className="animate-bounce [animation-delay:240ms]">●</span>
                    </span>
                  </div>
                </motion.div>
              )}
              <div ref={endRef} />
            </div>

            {error && (
              <p className="border-t border-primary/20 bg-primary/10 px-3 py-2 text-xs text-accent">{error}</p>
            )}

            <div className="border-t border-borderline bg-surface p-3">
              <div className="flex gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Ask a career question…"
                  rows={2}
                  className="min-h-[44px] flex-1 resize-none rounded-xl border border-borderline bg-page/40 px-3 py-2 text-sm text-accent placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:shadow-[0_0_20px_rgba(var(--glow))]"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={send}
                  disabled={loading || !input.trim()}
                  className="self-end rounded-xl bg-gradient-to-br from-primary to-primary/80 px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:brightness-110 hover:shadow-[0_0_26px_rgba(var(--glow))] disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
