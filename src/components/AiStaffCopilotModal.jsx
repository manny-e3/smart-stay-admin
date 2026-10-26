import React, { useState } from 'react'
import {
  Sparkles,
  Bot,
  Send,
  Copy,
  Check,
  FileText,
  UserCheck,
  Clock,
  RefreshCw,
  X,
  MessageSquare,
} from 'lucide-react'
import aiService from '../services/aiService'

export default function AiStaffCopilotModal({ isOpen, onClose }) {
  const [activeTask, setActiveTask] = useState('shift_handover_summary')
  const [customPrompt, setCustomPrompt] = useState('')
  const [copilotResponse, setCopilotResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const handleRunTask = async (taskName) => {
    setActiveTask(taskName)
    setLoading(true)
    setCopied(false)
    try {
      const res = await aiService.askCopilot({
        task: taskName,
        context: {},
      })
      setCopilotResponse(res?.response || 'Operational summary generated.')
    } catch (err) {
      setCopilotResponse('AI Copilot request encountered a communication fault. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSendCustomPrompt = async () => {
    if (!customPrompt.trim()) return
    setLoading(true)
    setCopied(false)
    try {
      const res = await aiService.askCopilot({
        task: 'general_query',
        prompt: customPrompt,
      })
      setCopilotResponse(res?.response || 'Copilot synthesis complete.')
      setCustomPrompt('')
    } catch (err) {
      setCopilotResponse('Failed to fetch response.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(copilotResponse)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="hotel-card w-full max-w-2xl p-6 space-y-5 bg-white animate-fade-in max-h-[90vh] flex flex-col justify-between">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FED255] to-[#C9A227] flex items-center justify-center shadow-xs">
                <Bot className="w-4 h-4 text-[#0B1F3A]" />
              </div>
              <div>
                <h3 className="font-headline font-bold text-base text-[#0B1F3A] flex items-center gap-2">
                  <span>SmartStay Staff AI Copilot</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF3C7] text-[#D97706]">
                    Gemini 2.0 Engine
                  </span>
                </h3>
                <p className="text-xs text-[#64748B]">
                  Operational intelligence, shift digests, guest dossiers, and policy grounding.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#64748B] hover:bg-[#F4F4F2]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Task Shortcuts */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <button
              onClick={() => handleRunTask('shift_handover_summary')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                activeTask === 'shift_handover_summary'
                  ? 'border-[#C9A227] bg-[#FFFBEB]'
                  : 'border-[#E5E7EB] hover:border-[#94A3B8]'
              }`}
            >
              <Clock className="w-4 h-4 text-[#C9A227] mb-1" />
              <div className="font-bold text-xs text-[#0B1F3A]">Shift Handover</div>
              <div className="text-[10px] text-[#64748B] mt-0.5">Digest of open issues</div>
            </button>

            <button
              onClick={() => handleRunTask('guest_dossier_brief')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                activeTask === 'guest_dossier_brief'
                  ? 'border-[#C9A227] bg-[#FFFBEB]'
                  : 'border-[#E5E7EB] hover:border-[#94A3B8]'
              }`}
            >
              <UserCheck className="w-4 h-4 text-[#2563EB] mb-1" />
              <div className="font-bold text-xs text-[#0B1F3A]">VIP Guest Brief</div>
              <div className="text-[10px] text-[#64748B] mt-0.5">Preferences & history</div>
            </button>

            <button
              onClick={() => handleRunTask('draft_feedback_reply')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                activeTask === 'draft_feedback_reply'
                  ? 'border-[#C9A227] bg-[#FFFBEB]'
                  : 'border-[#E5E7EB] hover:border-[#94A3B8]'
              }`}
            >
              <FileText className="w-4 h-4 text-[#059669] mb-1" />
              <div className="font-bold text-xs text-[#0B1F3A]">Draft GM Reply</div>
              <div className="text-[10px] text-[#64748B] mt-0.5">Luxury response draft</div>
            </button>
          </div>
        </div>

        {/* AI Output Card */}
        <div className="flex-1 min-h-[220px] max-h-[320px] overflow-y-auto p-4 rounded-xl bg-[#F7F7F5] border border-[#E5E7EB] font-sans text-xs text-[#1A1C1B] whitespace-pre-line leading-relaxed relative">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-[#64748B] py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-[#C9A227] mb-2" />
              <span className="font-semibold">Synthesizing property telemetry with Gemini AI...</span>
            </div>
          ) : copilotResponse ? (
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E5E7EB]">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
                  <span>Synthesized Operational Insight</span>
                </span>
                <button
                  onClick={handleCopy}
                  className="px-2 py-1 rounded bg-white border border-[#E5E7EB] text-[#64748B] hover:text-[#0B1F3A] flex items-center gap-1 text-[10px] font-bold"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-[#059669]" />
                      <span className="text-[#059669]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <div className="text-[#0B1F3A]">{copilotResponse}</div>
            </div>
          ) : (
            <div className="text-center py-12 text-[#94A3B8]">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>Select a quick task shortcut above or ask a custom question below.</p>
            </div>
          )}
        </div>

        {/* Custom Prompt Box */}
        <div className="pt-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask Copilot (e.g., 'Summarize highest energy consuming suites' or 'Find spare linens')..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendCustomPrompt()}
              className="flex-1 bg-[#F7F7F5] border border-[#E5E7EB] rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#C9A227]"
            />
            <button
              onClick={handleSendCustomPrompt}
              disabled={loading || !customPrompt.trim()}
              className="p-2.5 rounded-xl bg-[#0B1F3A] text-white hover:bg-[#183153] transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4 text-[#FED255]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
