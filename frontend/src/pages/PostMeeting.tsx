import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, CheckCircle, Circle, ArrowLeft,
  Download, Share2, Copy, Check, Clock,
  Users, FileText, Target, Zap, ChevronDown,
  ChevronUp, Plus, X, Save
} from 'lucide-react'

import { API_URL } from "../config";


const F = '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
const C = {
  bg: '#06060a',
  surface: 'rgba(255,255,255,0.04)',
  surfaceAlt: 'rgba(255,255,255,0.07)',
  border: 'rgba(255,255,255,0.07)',
  borderAccent: 'rgba(94,106,210,0.3)',
  accent: '#5E6AD2',
  accentLight: '#818cf8',
  accentGlow: 'rgba(94,106,210,0.18)',
  purple: '#a855f7',
  purpleGlow: 'rgba(168,85,247,0.18)',
  green: '#10b981',
  red: '#ef4444',
  amber: '#f59e0b',
  text: '#f8fafc',
  sub: '#94a3b8',
  muted: 'rgba(255,255,255,0.28)',
}

// ── Animated Counter ──────────────────────────────────────────────────────────
const Counter = ({ value, suffix = '' }: any) => {
  const [n, setN] = useState(0)
  useEffect(() => {
    let i = 0
    const step = value / 40
    const t = setInterval(() => {
      i += step
      if (i >= value) { setN(value); clearInterval(t) }
      else setN(Math.floor(i))
    }, 20)
    return () => clearInterval(t)
  }, [value])
  return <>{n}{suffix}</>
}

// ── Section Card ──────────────────────────────────────────────────────────────
const SCard = ({ children, style, glow }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    style={{
      background: C.surface,
      border: `1px solid ${glow ? C.borderAccent : C.border}`,
      borderRadius: 16, overflow: 'hidden',
      backdropFilter: 'blur(24px)',
      boxShadow: glow ? `0 0 32px ${C.accentGlow}` : '0 2px 20px rgba(0,0,0,0.2)',
      ...style,
    }}
  >{children}</motion.div>
)

// ── Section Header ────────────────────────────────────────────────────────────
const SHeader = ({ icon: Icon, title, sub, color = C.accentLight, badge }: any) => (
  <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 32, height: 32, borderRadius: 9, background: color + '15', border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={15} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: F }}>{title}</div>
        {sub && <div style={{ fontSize: 10, color: C.muted, marginTop: 1, fontFamily: F }}>{sub}</div>}
      </div>
    </div>
    {badge && (
      <span style={{ padding: '3px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: color + '15', border: `1px solid ${color}25`, color }}>{badge}</span>
    )}
  </div>
)

export default function PostMeeting() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const meetingId = searchParams.get('meetingId')

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  const [transcript, setTranscript] = useState('')
  const [aiSummary, setAiSummary] = useState('')
  const [actionItems, setActionItems] = useState<any[]>([])
  const [newTask, setNewTask] = useState('')
  const [newAssignee, setNewAssignee] = useState('')
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showTranscript, setShowTranscript] = useState(true)
  const [meeting, setMeeting] = useState<any>(null)
  const [step, setStep] = useState<'transcript' | 'summary' | 'actions' | 'done'>('transcript')

  // Fetch meeting data if ID provided
  useEffect(() => {
    if (!meetingId) return
    axios.get(`${API_URL}/api/meetings/${meetingId}`, { headers })
      .then(res => {
        const m = res.data.meeting
        setMeeting(m)
        if (m.transcript) { setTranscript(m.transcript); setStep('summary') }
        if (m.aiSummary) { setAiSummary(m.aiSummary); setStep('actions') }
        if (m.actionItems?.length) { setActionItems(m.actionItems); setStep('done') }
      })
      .catch(console.error)
  }, [meetingId])

  const generateAI = () => {
    if (!transcript.trim()) return
    setGenerating(true)
    // Simulate AI — in production connect OpenAI Whisper here
    setTimeout(() => {
      const sentences = transcript.split('.').filter(s => s.trim())
      const summary = sentences.length > 2
        ? `Meeting covered: ${sentences.slice(0, 3).join('. ')}.`
        : transcript.slice(0, 200) + (transcript.length > 200 ? '...' : '')
      setAiSummary(summary || 'AI summary generated from transcript.')
      setGenerating(false)
      setStep('actions')
    }, 2200)
  }

  const addAction = () => {
    if (!newTask.trim()) return
    setActionItems(p => [...p, { task: newTask, assignee: newAssignee || 'Unassigned', done: false }])
    setNewTask(''); setNewAssignee('')
  }

  const toggleDone = (i: number) => {
    setActionItems(p => p.map((a, idx) => idx === i ? { ...a, done: !a.done } : a))
  }

  const removeAction = (i: number) => {
    setActionItems(p => p.filter((_, idx) => idx !== i))
  }

  const saveSummary = async () => {
    if (!meetingId) { setSaved(true); return }
    setSaving(true)
    try {
      await axios.put(`${API_URL}/api/meetings/${meetingId}/summary`,
        { transcript, aiSummary, actionItems },
        { headers }
      )
      setSaved(true)
      setStep('done')
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }

  const copySummary = () => {
    const text = `Meeting Summary\n\n${aiSummary}\n\nAction Items:\n${actionItems.map((a, i) => `${i + 1}. ${a.task} — ${a.assignee}`).join('\n')}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const steps = [
    { id: 'transcript', label: 'Transcript', num: 1 },
    { id: 'summary', label: 'AI Summary', num: 2 },
    { id: 'actions', label: 'Action Items', num: 3 },
    { id: 'done', label: 'Done', num: 4 },
  ]
  const stepIdx = steps.findIndex(s => s.id === step)

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: F, color: C.text }}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.07); border-radius: 2px; }
        textarea::placeholder, input::placeholder { color: rgba(255,255,255,0.2); }
        textarea { resize: none; }
      `}</style>

      {/* BG */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '10%', left: '20%', width: 500, height: 300, background: `radial-gradient(ellipse, ${C.accentGlow} 0%, transparent 70%)`, filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '15%', right: '15%', width: 350, height: 250, background: `radial-gradient(ellipse, ${C.purpleGlow} 0%, transparent 70%)`, filter: 'blur(70px)' }} />
        {[...Array(20)].map((_, i) => (
          <div key={i} style={{ position: 'absolute', left: `${(i * 51) % 100}%`, top: `${(i * 37) % 100}%`, width: i % 5 === 0 ? 2 : 1.2, height: i % 5 === 0 ? 2 : 1.2, borderRadius: '50%', background: '#fff', opacity: 0.04 + (i % 4) * 0.03 }} />
        ))}
      </div>

      {/* Topbar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(6,6,10,0.88)', backdropFilter: 'blur(32px)', borderBottom: `1px solid ${C.border}`, padding: '0 24px', height: 54, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <motion.button
            whileHover={{ scale: 1.05, x: -2 }} whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '5px 12px', color: C.muted, fontSize: 11, cursor: 'pointer', fontFamily: F }}
          >
            <ArrowLeft size={12} /> Dashboard
          </motion.button>
          <div style={{ width: 1, height: 16, background: C.border }} />
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
            {meeting?.title || 'AI Meeting Summary'}
          </div>
          {meeting && (
            <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: C.accentGlow, border: `1px solid ${C.borderAccent}`, color: C.accentLight }}>
              {new Date(meeting.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {aiSummary && (
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={copySummary}
              style={{ display: 'flex', alignItems: 'center', gap: 5, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '5px 12px', color: C.muted, fontSize: 11, cursor: 'pointer', fontFamily: F }}
            >
              {copied ? <Check size={11} color={C.green} /> : <Copy size={11} />}
              {copied ? 'Copied!' : 'Copy'}
            </motion.button>
          )}
          {aiSummary && (
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={saveSummary}
              disabled={saving || saved}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: saved ? 'rgba(16,185,129,0.12)' : `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
                border: saved ? '1px solid rgba(16,185,129,0.25)' : 'none',
                borderRadius: 8, padding: '5px 14px',
                color: saved ? C.green : '#fff', fontSize: 11, fontWeight: 700,
                cursor: saving || saved ? 'not-allowed' : 'pointer', fontFamily: F,
                boxShadow: saved ? 'none' : `0 4px 12px ${C.accentGlow}`,
              }}
            >
              {saving ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  style={{ width: 12, height: 12, border: `2px solid rgba(255,255,255,0.3)`, borderTopColor: '#fff', borderRadius: '50%' }} />
              ) : saved ? <><Check size={11} /> Saved!</> : <><Save size={11} /> Save</>}
            </motion.button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 24px 60px', position: 'relative', zIndex: 1 }}>

        {/* Progress Steps */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 28 }}>
          {steps.map((s, i) => {
            const isDone = i < stepIdx
            const isActive = i === stepIdx
            return (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                  <motion.div
                    animate={{ scale: isActive ? 1.15 : 1 }}
                    style={{
                      width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isDone ? C.green : isActive ? `linear-gradient(135deg, ${C.accent}, ${C.purple})` : C.surface,
                      border: `1.5px solid ${isDone ? C.green : isActive ? C.accentLight : C.border}`,
                      fontSize: 11, fontWeight: 700, color: isDone || isActive ? '#fff' : C.muted,
                      boxShadow: isActive ? `0 0 14px ${C.accentGlow}` : 'none',
                    }}
                  >
                    {isDone ? <Check size={13} /> : s.num}
                  </motion.div>
                  <span style={{ fontSize: 9, color: isActive ? C.accentLight : isDone ? C.green : C.muted, fontWeight: isActive ? 700 : 400, fontFamily: F, whiteSpace: 'nowrap' }}>
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div style={{ flex: 1, height: 1.5, background: i < stepIdx ? C.green : C.border, margin: '0 6px', marginBottom: 16, transition: 'background 0.4s' }} />
                )}
              </div>
            )
          })}
        </div>

        {/* Stats Row — shown when meeting loaded */}
        {meeting && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 18 }}>
            {[
              { label: 'Meeting', value: meeting.title, icon: FileText, color: C.accentLight },
              { label: 'Status', value: meeting.status, icon: Target, color: meeting.status === 'live' ? C.red : C.green },
              { label: 'Action Items', value: actionItems.length, icon: CheckCircle, color: C.amber, isNum: true },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}
              >
                <div style={{ width: 30, height: 30, borderRadius: 8, background: s.color + '15', border: `1px solid ${s.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <s.icon size={13} color={s.color} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: F }}>{s.label}</div>
                  <div style={{ fontSize: s.isNum ? 18 : 12, fontWeight: 700, color: C.text, fontFamily: F, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>
                    {s.isNum ? <Counter value={s.value as number} /> : s.value}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* ── Step 1: Transcript ─────────────────────────────────────── */}
          <SCard glow={step === 'transcript'}>
            <SHeader icon={FileText} title="Meeting Transcript" sub="Paste or type what was discussed" color={C.accentLight}
              badge={transcript ? `${transcript.split(' ').filter(Boolean).length} words` : undefined}
            />
            <div style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 10, color: C.muted, fontFamily: F }}>
                  {transcript ? 'Transcript ready for AI processing' : 'Enter transcript to generate AI summary'}
                </span>
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setShowTranscript(p => !p)}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 10, fontFamily: F }}
                >
                  {showTranscript ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  {showTranscript ? 'Collapse' : 'Expand'}
                </motion.button>
              </div>

              <AnimatePresence>
                {showTranscript && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <textarea
                      value={transcript}
                      onChange={e => { setTranscript(e.target.value); if (step === 'transcript' && e.target.value.trim()) setStep('summary') }}
                      placeholder="Paste meeting transcript here... (e.g., 'John: We need to finalize the Q3 roadmap. Sarah: I agree, let's set a deadline for Friday.')"
                      rows={6}
                      style={{
                        width: '100%', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`,
                        borderRadius: 10, padding: '12px 14px', color: C.text, fontSize: 12,
                        outline: 'none', fontFamily: F, lineHeight: 1.6,
                        transition: 'border-color 0.2s',
                      }}
                      onFocus={e => e.target.style.borderColor = C.accentLight + '50'}
                      onBlur={e => e.target.style.borderColor = C.border}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {transcript && (
                <motion.button
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={generateAI}
                  disabled={generating}
                  style={{
                    marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, width: '100%',
                    background: generating ? C.surface : `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
                    border: generating ? `1px solid ${C.border}` : 'none',
                    borderRadius: 10, padding: '11px', color: generating ? C.muted : '#fff',
                    fontSize: 12, fontWeight: 700, cursor: generating ? 'not-allowed' : 'pointer', fontFamily: F,
                    boxShadow: generating ? 'none' : `0 4px 16px ${C.accentGlow}`,
                  }}
                >
                  {generating ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                        style={{ width: 14, height: 14, border: `2px solid ${C.muted}`, borderTopColor: C.text, borderRadius: '50%' }} />
                      AI is generating summary...
                    </>
                  ) : (
                    <><Sparkles size={13} /> Generate AI Summary</>
                  )}
                </motion.button>
              )}
            </div>
          </SCard>

          {/* ── Step 2: AI Summary ─────────────────────────────────────── */}
          <AnimatePresence>
            {(aiSummary || generating) && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <SCard glow={step === 'summary' || step === 'actions'}>
                  <SHeader icon={Sparkles} title="AI Summary" sub="Generated from transcript" color={C.purple}
                    badge={aiSummary ? 'Generated' : 'Processing...'}
                  />
                  <div style={{ padding: '16px 20px' }}>
                    {generating ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {[100, 85, 70, 55].map((w, i) => (
                          <motion.div
                            key={i}
                            animate={{ opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
                            style={{ height: 12, width: `${w}%`, borderRadius: 6, background: C.surface }}
                          />
                        ))}
                      </div>
                    ) : (
                      <>
                        {/* Summary Text */}
                        <div style={{
                          padding: '14px 16px',
                          background: 'rgba(168,85,247,0.06)',
                          border: '1px solid rgba(168,85,247,0.15)',
                          borderRadius: 12, marginBottom: 14,
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                            <Sparkles size={11} color={C.purple} />
                            <span style={{ fontSize: 10, fontWeight: 700, color: C.purple, fontFamily: F }}>AI Generated Summary</span>
                          </div>
                          <textarea
                            value={aiSummary}
                            onChange={e => setAiSummary(e.target.value)}
                            rows={4}
                            style={{
                              width: '100%', background: 'transparent', border: 'none',
                              color: C.sub, fontSize: 12, outline: 'none',
                              fontFamily: F, lineHeight: 1.7,
                            }}
                          />
                        </div>

                        {/* Sentiment */}
                        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                          {[
                            { label: 'Sentiment', value: 'Positive', color: C.green },
                            { label: 'Clarity', value: 'High', color: C.accentLight },
                            { label: 'AI Confidence', value: '92%', color: C.purple },
                          ].map((s, i) => (
                            <div key={i} style={{ flex: 1, padding: '8px 10px', background: s.color + '0e', border: `1px solid ${s.color}20`, borderRadius: 8, textAlign: 'center' }}>
                              <div style={{ fontSize: 9, color: C.muted, fontFamily: F, marginBottom: 3 }}>{s.label}</div>
                              <div style={{ fontSize: 12, fontWeight: 700, color: s.color, fontFamily: F }}>{s.value}</div>
                            </div>
                          ))}
                        </div>

                        {!actionItems.length && (
                          <motion.button
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                            onClick={() => setStep('actions')}
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%',
                              background: C.surface, border: `1px solid ${C.border}`,
                              borderRadius: 10, padding: '10px', color: C.muted, fontSize: 12, fontWeight: 600,
                              cursor: 'pointer', fontFamily: F,
                            }}
                          >
                            <Target size={12} /> Add Action Items →
                          </motion.button>
                        )}
                      </>
                    )}
                  </div>
                </SCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Step 3: Action Items ───────────────────────────────────── */}
          <AnimatePresence>
            {(step === 'actions' || step === 'done' || actionItems.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <SCard glow={step === 'actions'}>
                  <SHeader icon={Target} title="Action Items"
                    sub={`${actionItems.filter(a => a.done).length}/${actionItems.length} completed`}
                    color={C.amber}
                    badge={actionItems.length > 0 ? `${actionItems.length} items` : undefined}
                  />
                  <div style={{ padding: '16px 20px' }}>

                    {/* Add form */}
                    <div style={{ display: 'flex', gap: 7, marginBottom: 14 }}>
                      <input
                        placeholder="Add action item..."
                        value={newTask}
                        onChange={e => setNewTask(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addAction()}
                        style={{
                          flex: 2, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`,
                          borderRadius: 9, padding: '8px 12px', color: C.text, fontSize: 12,
                          outline: 'none', fontFamily: F,
                        }}
                        onFocus={e => e.target.style.borderColor = C.amber + '50'}
                        onBlur={e => e.target.style.borderColor = C.border}
                      />
                      <input
                        placeholder="Assignee"
                        value={newAssignee}
                        onChange={e => setNewAssignee(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addAction()}
                        style={{
                          flex: 1, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`,
                          borderRadius: 9, padding: '8px 12px', color: C.text, fontSize: 12,
                          outline: 'none', fontFamily: F,
                        }}
                        onFocus={e => e.target.style.borderColor = C.amber + '50'}
                        onBlur={e => e.target.style.borderColor = C.border}
                      />
                      <motion.button
                        whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.93 }}
                        onClick={addAction}
                        style={{
                          width: 36, height: 36, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: `linear-gradient(135deg, ${C.amber}, #d97706)`,
                          border: 'none', cursor: 'pointer', flexShrink: 0,
                        }}
                      ><Plus size={14} color="#fff" /></motion.button>
                    </div>

                    {/* Items */}
                    {actionItems.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '24px 0', color: C.muted, fontSize: 12, fontFamily: F }}>
                        No action items yet — add one above
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                        {actionItems.map((a, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 10,
                              padding: '10px 12px', borderRadius: 10,
                              background: a.done ? 'rgba(16,185,129,0.06)' : C.surface,
                              border: `1px solid ${a.done ? 'rgba(16,185,129,0.18)' : C.border}`,
                              transition: 'all 0.2s',
                            }}
                          >
                            <motion.button
                              whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }}
                              onClick={() => toggleDone(i)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, color: a.done ? C.green : C.muted, padding: 0 }}
                            >
                              {a.done ? <CheckCircle size={16} color={C.green} /> : <Circle size={16} />}
                            </motion.button>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <span style={{
                                fontSize: 12, fontWeight: 500, color: a.done ? C.muted : C.text, fontFamily: F,
                                textDecoration: a.done ? 'line-through' : 'none',
                              }}>{a.task}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                <div style={{ width: 18, height: 18, borderRadius: '50%', background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                                  {a.assignee?.[0]?.toUpperCase()}
                                </div>
                                <span style={{ fontSize: 10, color: C.muted, fontFamily: F, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.assignee}</span>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                onClick={() => removeAction(i)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 2, display: 'flex' }}
                                className="hover:text-red-400"
                              ><X size={12} /></motion.button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </SCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Done State ─────────────────────────────────────────────── */}
          <AnimatePresence>
            {saved && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                style={{
                  background: 'rgba(16,185,129,0.08)',
                  border: '1px solid rgba(16,185,129,0.22)',
                  borderRadius: 16, padding: '24px 20px', textAlign: 'center',
                  boxShadow: '0 0 32px rgba(16,185,129,0.1)',
                }}
              >
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
                  style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}
                >
                  <Check size={22} color={C.green} />
                </motion.div>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 6, fontFamily: F }}>Summary Saved!</div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 18, fontFamily: F }}>
                  AI summary and {actionItems.length} action item{actionItems.length !== 1 ? 's' : ''} saved to your meeting.
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                  <motion.button
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={copySummary}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 9, padding: '8px 16px', color: C.text, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: F }}
                  >
                    {copied ? <Check size={12} color={C.green} /> : <Copy size={12} />}
                    {copied ? 'Copied!' : 'Copy Summary'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => navigate('/dashboard')}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`, border: 'none', borderRadius: 9, padding: '8px 20px', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: F, boxShadow: `0 4px 12px ${C.accentGlow}` }}
                  >
                    Back to Dashboard →
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Save Button (floating) ─────────────────────────────────── */}
          {aiSummary && !saved && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', gap: 10 }}
            >
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/dashboard')}
                style={{ flex: 1, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px', color: C.muted, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: F }}
              >
                Skip & Go to Dashboard
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: `0 8px 28px ${C.accentGlow}` }}
                whileTap={{ scale: 0.97 }}
                onClick={saveSummary}
                disabled={saving}
                style={{
                  flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
                  border: 'none', borderRadius: 12, padding: '12px', color: '#fff',
                  fontSize: 12, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
                  fontFamily: F, boxShadow: `0 4px 16px ${C.accentGlow}`,
                }}
              >
                {saving ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
                ) : <><Save size={13} /> Save AI Summary & Action Items</>}
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}