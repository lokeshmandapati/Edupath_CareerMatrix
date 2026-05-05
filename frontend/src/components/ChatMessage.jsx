import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'

/**
 * Single chat bubble — user (sky) vs assistant (neutral).
 */
export default function ChatMessage({ role, content }) {
  const isUser = role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[92%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed shadow-sm sm:max-w-[85%] ${
          isUser
            ? 'rounded-br-md bg-gradient-to-br from-primary to-primary/80 text-white shadow-glow'
            : 'rounded-bl-md border border-borderline bg-surface text-accent'
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap break-words">{content}</p>
        ) : (
          <div className="prose-chat break-words [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:mb-2 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:mb-1 [&_strong]:font-bold [&_h3]:mt-2 [&_h3]:font-semibold [&_h3]:text-primary">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  )
}
