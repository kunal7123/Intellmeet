import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Search, Bell, Command, ChevronLeft, ChevronRight,
  Video, Calendar, MessageSquare, Users, Sparkles,
  FileText, BarChart2, LayoutDashboard, Plus, LogOut,
  Settings, Play, Zap, ArrowUpRight, TrendingUp,
  Clock, CheckCircle, Circle, MoreHorizontal, X,
  Mic, MicOff, Camera, CameraOff, Shield, Globe,
  Star, Activity, Target, Award, Hash, Send
} from 'lucide-react';

import { API_URL } from "../config";

import { Edit, Save, Check } from 'lucide-react';


import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, BarChart, Bar, Cell
} from 'recharts';



// ── Utils ─────────────────────────────────────────────────────────────────────
const cn = (...classes: (string | undefined | false | null)[]) =>
  classes.filter(Boolean).join(' ');

// ── Theme tokens ──────────────────────────────────────────────────────────────
// ── Themes ────────────────────────────────────────────────────────────────────


const THEMES: Record<string, any> = {
  violet: {
    bg: '#06060a',
    surface: 'rgba(255,255,255,0.032)',
    surfaceHover: 'rgba(255,255,255,0.06)',
    border: 'rgba(255,255,255,0.07)',
    borderAccent: 'rgba(94,106,210,0.35)',
    accent: '#5E6AD2',
    accentLight: '#818cf8',
    accentGlow: 'rgba(94,106,210,0.2)',
    purple: '#a855f7',
    purpleGlow: 'rgba(168,85,247,0.2)',
    green: '#10b981',
    red: '#ef4444',
    amber: '#f59e0b',
    text: '#f8fafc',
    sub: '#94a3b8',
    muted: 'rgba(255,255,255,0.28)',
    F: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
    label: 'Violet',
    preview: ['#5E6AD2', '#a855f7'],
    dark: true,
  },
  emerald: {
    bg: '#030a06',
    surface: 'rgba(255,255,255,0.032)',
    surfaceHover: 'rgba(255,255,255,0.06)',
    border: 'rgba(255,255,255,0.07)',
    borderAccent: 'rgba(16,185,129,0.35)',
    accent: '#10b981',
    accentLight: '#34d399',
    accentGlow: 'rgba(16,185,129,0.2)',
    purple: '#06b6d4',
    purpleGlow: 'rgba(6,182,212,0.2)',
    green: '#10b981',
    red: '#ef4444',
    amber: '#f59e0b',
    text: '#f8fafc',
    sub: '#94a3b8',
    muted: 'rgba(255,255,255,0.28)',
    F: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
    label: 'Emerald',
    preview: ['#10b981', '#06b6d4'],
    dark: true,
  },
  rose: {
    bg: '#0a0506',
    surface: 'rgba(255,255,255,0.032)',
    surfaceHover: 'rgba(255,255,255,0.06)',
    border: 'rgba(255,255,255,0.07)',
    borderAccent: 'rgba(244,63,94,0.35)',
    accent: '#f43f5e',
    accentLight: '#fb7185',
    accentGlow: 'rgba(244,63,94,0.2)',
    purple: '#e879f9',
    purpleGlow: 'rgba(232,121,249,0.2)',
    green: '#10b981',
    red: '#ef4444',
    amber: '#f59e0b',
    text: '#f8fafc',
    sub: '#94a3b8',
    muted: 'rgba(255,255,255,0.28)',
    F: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
    label: 'Rose',
    preview: ['#f43f5e', '#e879f9'],
    dark: true,
  },
  amber: {
    bg: '#08060a',
    surface: 'rgba(255,255,255,0.032)',
    surfaceHover: 'rgba(255,255,255,0.06)',
    border: 'rgba(255,255,255,0.07)',
    borderAccent: 'rgba(245,158,11,0.35)',
    accent: '#f59e0b',
    accentLight: '#fbbf24',
    accentGlow: 'rgba(245,158,11,0.2)',
    purple: '#f97316',
    purpleGlow: 'rgba(249,115,22,0.2)',
    green: '#10b981',
    red: '#ef4444',
    amber: '#f59e0b',
    text: '#f8fafc',
    sub: '#94a3b8',
    muted: 'rgba(255,255,255,0.28)',
    F: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
    label: 'Amber',
    preview: ['#f59e0b', '#f97316'],
    dark: true,
  },
  indigo: {
    bg: '#080a0f',
    surface: 'rgba(255,255,255,0.032)',
    surfaceHover: 'rgba(255,255,255,0.06)',
    border: 'rgba(255,255,255,0.07)',
    borderAccent: 'rgba(99,102,241,0.35)',
    accent: '#6366f1',
    accentLight: '#818cf8',
    accentGlow: 'rgba(99,102,241,0.2)',
    purple: '#8b5cf6',
    purpleGlow: 'rgba(139,92,246,0.2)',
    green: '#10b981',
    red: '#ef4444',
    amber: '#f59e0b',
    text: '#f8fafc',
    sub: '#94a3b8',
    muted: 'rgba(255,255,255,0.28)',
    F: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
    label: 'Indigo',
    preview: ['#6366f1', '#8b5cf6'],
    dark: true,
  },
light: {
  bg: '#f0f2f5',
  surface: 'rgba(0,0,0,0.04)',
  surfaceHover: 'rgba(0,0,0,0.07)',
  border: 'rgba(0,0,0,0.08)',
  borderAccent: 'rgba(94,106,210,0.25)',
  accent: '#5E6AD2',
  accentLight: '#4f46e5',
  accentGlow: 'rgba(94,106,210,0.1)',
  purple: '#7c3aed',
  purpleGlow: 'rgba(124,58,237,0.1)',
  green: '#059669',
  red: '#dc2626',
  amber: '#d97706',
  text: '#1e293b',
  sub: '#475569',
  muted: 'rgba(0,0,0,0.35)',
  F: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
  label: '☀️ Light',
  preview: ['#5E6AD2', '#7c3aed'],
  dark: false,
},
}





// ── Animated counter ──────────────────────────────────────────────────────────
const Counter = ({ value, duration = 1.2 }: { value: number; duration?: number }) => {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let start = 0
    const step = value / (duration * 60)
    const t = setInterval(() => {
      start += step
      if (start >= value) { setDisplay(value); clearInterval(t) }
      else setDisplay(Math.floor(start))
    }, 1000 / 60)
    return () => clearInterval(t)
  }, [value])
  return <>{display}</>
}

// ── Magnetic button ───────────────────────────────────────────────────────────
const MagneticBtn = ({ children, onClick, className, style }: any) => {
  const ref = useRef<HTMLButtonElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 300, damping: 20 })
  const sy = useSpring(y, { stiffness: 300, damping: 20 })

  const handleMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    x.set((e.clientX - rect.left - rect.width / 2) * 0.25)
    y.set((e.clientY - rect.top - rect.height / 2) * 0.25)
  }

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={() => { x.set(0); y.set(0) }}
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      style={{ x: sx, y: sy, ...style }}
      className={className}
    >{children}</motion.button>
  )
}

// ── Pill badge ────────────────────────────────────────────────────────────────
const Badge = ({ children, color = C.accent }: any) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '2px 8px', borderRadius: 20,
    fontSize: 10, fontWeight: 600,
    background: color + '18',
    border: `1px solid ${color}30`,
    color,
  }}>{children}</span>
)

// ── Glass card ────────────────────────────────────────────────────────────────
const GCard = ({ children, style, className, onClick, hover = true }: any) => (
  <motion.div
    whileHover={hover ? { borderColor: C.borderAccent, y: -1 } : {}}
    onClick={onClick}
    style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 16,
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      transition: 'border-color 0.2s',
      ...style,
    }}
    className={className}
  >{children}</motion.div>
)


// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color, trend, sub }: any) => (
  <GCard style={{ padding: '18px 20px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
      <div style={{
        width: 34, height: 34, borderRadius: 9,
        background: color + '15', border: `1px solid ${color}25`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}><Icon size={15} color={color} /></div>
      {trend !== undefined && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 3,
          padding: '3px 7px', borderRadius: 6, fontSize: 10, fontWeight: 700,
          background: 'rgba(16,185,129,0.12)', color: C.green,
        }}>
          <TrendingUp size={9} />{Math.abs(trend)}%
        </div>
      )}
    </div>
    <div style={{ fontSize: 26, fontWeight: 800, color: C.text, letterSpacing: '-1px', fontFamily: C.F }}>
      <Counter value={value} />
    </div>
    <div style={{ fontSize: 11, color: C.muted, marginTop: 3, fontFamily: C.F }}>{label}</div>
    {sub && <div style={{ fontSize: 10, color, marginTop: 4, fontWeight: 600 }}>{sub}</div>}
  </GCard>
)



// ── Sidebar ───────────────────────────────────────────────────────────────────
const NAV = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'meetings', label: 'Meetings', icon: Video },
  { id: 'ai', label: 'AI Summaries', icon: Sparkles, accent: true },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'profile', label: 'Profile', icon: Shield },
  { id: 'settings', label: 'Settings', icon: Settings },
]

const Sidebar = ({ collapsed, setCollapsed, active, setActive, user, logout, meetings }: any) => {
  const live = meetings.filter((m: any) => m.status === 'live').length

  return (
          <motion.aside
            animate={{ width: collapsed ? 68 : 232 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
              background: C.dark !== false
                ? 'rgba(6,6,10,0.92)'
                : 'rgba(248,250,252,0.95)',
              borderRight: `1px solid ${C.border}`,
              height: '100vh', display: 'flex', flexDirection: 'column',
              position: 'fixed', top: 0, left: 0, zIndex: 60,
              backdropFilter: 'blur(40px)',
              flexShrink: 0,
            }}
          >
      {/* Logo */}
      <div style={{ padding: '14px 12px', borderBottom: `1px solid ${C.border}`, marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px', borderRadius: 10, cursor: 'pointer' }}
          className="hover:bg-white/5 transition-colors">
          <div style={{
            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
            background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 800, color: '#fff',
            boxShadow: `0 4px 12px ${C.accentGlow}`,
          }}>{user?.name?.[0]?.toUpperCase()}</div>
          {!collapsed && (
            <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text, whiteSpace: 'nowrap' }}>{user?.name}</div>
              <div style={{ fontSize: 10, color: C.muted }}>{user?.role}</div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0 8px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(n => {
          const isActive = active === n.id
          return (
            <motion.button
              key={n.id}
              onClick={() => setActive(n.id)}
              whileHover={{ x: 2 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: collapsed ? '9px 0' : '8px 10px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 9, cursor: 'pointer', border: 'none', width: '100%',
                background: isActive ? C.accentGlow : 'transparent',
                outline: `1px solid ${isActive ? C.borderAccent : 'transparent'}`,
                color: isActive ? C.accentLight : C.muted,
                fontSize: 12, fontWeight: isActive ? 600 : 400,
                fontFamily: C.F, transition: 'all 0.15s', position: 'relative',
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  style={{
                    position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                    width: 3, height: 16, borderRadius: 2,
                    background: `linear-gradient(to bottom, ${C.accent}, ${C.purple})`,
                  }}
                />
              )}
              <n.icon size={14} style={{ flexShrink: 0, color: n.accent && isActive ? C.purple : 'inherit' }} />
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ whiteSpace: 'nowrap' }}
                >{n.label}</motion.span>
              )}
              {!collapsed && n.id === 'meetings' && live > 0 && (
                <motion.span
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  style={{
                    marginLeft: 'auto', minWidth: 16, height: 16, borderRadius: 8,
                    background: C.red, color: '#fff', fontSize: 9, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 4px',
                  }}
                >{live}</motion.span>
              )}
            </motion.button>
          )
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '8px', borderTop: `1px solid ${C.border}` }}>
        <button
          onClick={logout}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: collapsed ? '8px 0' : '7px 10px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            width: '100%', border: 'none', background: 'transparent',
            color: 'rgba(255,255,255,0.25)', fontSize: 11, cursor: 'pointer',
            borderRadius: 8, fontFamily: C.F, transition: 'all 0.2s',
          }}
          className="hover:text-red-400 hover:bg-red-500/10"
        >
          <LogOut size={13} style={{ flexShrink: 0 }} />
          {!collapsed && <span>Sign out</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '100%', padding: '7px', border: 'none',
            background: 'transparent', color: C.muted, cursor: 'pointer',
            borderRadius: 8, transition: 'all 0.2s',
          }}
          className="hover:bg-white/5 hover:text-white"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>
    </motion.aside>
  )
}

// ── Top Nav ───────────────────────────────────────────────────────────────────





// ── AI Copilot Modal ──────────────────────────────────────────────────────
const CopilotModal = ({ show, onClose, meetings }: any) => {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hi! I\'m your AI Copilot. Ask me anything about your meetings, summaries, or action items!' }
  ])
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const ask = async () => {
    if (!input.trim()) return
    const q = input
    setInput('')
    setMessages(p => [...p, { role: 'user', text: q }])
    setLoading(true)

    // Smart AI responses based on real data
    setTimeout(() => {
      const total = meetings.length
      const summaries = meetings.filter((m: any) => m.aiSummary).length
      const actions = meetings.reduce((a: number, m: any) => a + (m.actionItems?.length || 0), 0)
      const recent = meetings[0]?.title || 'None'

      let response = ''
      const ql = q.toLowerCase()

      if (ql.includes('meeting') && ql.includes('how many') || ql.includes('total meeting')) {
        response = `You have ${total} total meeting${total !== 1 ? 's' : ''} on IntellMeet. ${summaries} of them have AI summaries generated.`
      } else if (ql.includes('summary') || ql.includes('summaries')) {
        response = `You have ${summaries} AI-generated summar${summaries !== 1 ? 'ies' : 'y'} out of ${total} meetings. ${summaries > 0 ? `Your most recent summary is from "${recent}".` : 'End a meeting to generate your first summary!'}`
      } else if (ql.includes('action') || ql.includes('task')) {
        response = `You have ${actions} action item${actions !== 1 ? 's' : ''} tracked across all your meetings. ${actions > 0 ? 'Check the AI Summaries section to view and manage them.' : 'Action items are automatically extracted when you generate an AI summary.'}`
      } else if (ql.includes('recent') || ql.includes('last meeting')) {
        response = total > 0 ? `Your most recent meeting was "${recent}". ${meetings[0]?.aiSummary ? 'It has an AI summary available.' : 'No AI summary generated yet for this meeting.'}` : 'You have no meetings yet. Click "New Meeting" to start!'
      } else if (ql.includes('hello') || ql.includes('hi') || ql.includes('hey')) {
        response = `Hello! I can help you with your meeting data. You currently have ${total} meetings and ${summaries} AI summaries. What would you like to know?`
      } else if (ql.includes('help')) {
        response = 'I can help you with:\n• Meeting statistics\n• AI summary information\n• Action item tracking\n• Recent meeting details\n\nJust ask me anything!'
      } else {
        response = `Based on your data: ${total} meetings, ${summaries} AI summaries, ${actions} action items. I'm here to help you get insights from your meetings!`
      }

      setMessages(p => [...p, { role: 'ai', text: response }])
      setLoading(false)
    }, 1200)
  }

  if (!show) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)', zIndex: 200,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end',
          padding: '70px 20px 20px',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92 }}
          onClick={e => e.stopPropagation()}
          style={{
            width: 380, height: 500,
            background: '#0d0b14',
            border: `1px solid ${C.border}`,
            borderRadius: 20, overflow: 'hidden',
            boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
            display: 'flex', flexDirection: 'column',
            fontFamily: C.F,
          }}
        >
          {/* Header */}
          <div style={{
            padding: '14px 16px',
            background: `linear-gradient(135deg, rgba(94,106,210,0.15), rgba(168,85,247,0.15))`,
            borderBottom: `1px solid ${C.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sparkles size={13} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>AI Copilot</div>
                <div style={{ fontSize: 9, color: C.muted }}>Powered by IntellMeet AI</div>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer' }}
            ><X size={14} /></motion.button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}
              >
                {m.role === 'ai' && (
                  <div style={{ width: 24, height: 24, borderRadius: 7, background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Sparkles size={11} color="#fff" />
                  </div>
                )}
                <div style={{
                  maxWidth: '80%', padding: '8px 11px', borderRadius: m.role === 'user' ? '11px 2px 11px 11px' : '2px 11px 11px 11px',
                  background: m.role === 'user' ? `linear-gradient(135deg, ${C.accent}, ${C.purple})` : 'rgba(255,255,255,0.05)',
                  border: m.role === 'user' ? 'none' : `1px solid ${C.border}`,
                  fontSize: 12, color: C.text, lineHeight: 1.5,
                  whiteSpace: 'pre-line',
                }}>{m.text}</div>
              </motion.div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <div style={{ width: 24, height: 24, borderRadius: 7, background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Sparkles size={11} color="#fff" />
                </div>
                <div style={{ padding: '10px 14px', borderRadius: '2px 11px 11px 11px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}` }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[0, 1, 2].map(i => (
                      <motion.div key={i}
                        animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                        style={{ width: 5, height: 5, borderRadius: '50%', background: C.accentLight }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '10px 12px', borderTop: `1px solid ${C.border}`, display: 'flex', gap: 7 }}>
            <input
              placeholder="Ask about your meetings..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && ask()}
              autoFocus
              style={{
                flex: 1, background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${C.border}`, borderRadius: 9,
                padding: '8px 11px', color: C.text, fontSize: 12,
                outline: 'none', fontFamily: C.F,
              }}
            />
            <motion.button
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
              onClick={ask}
              style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Send size={12} color="#fff" />
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ── Notifications Modal ───────────────────────────────────────────────────
const NotificationsModal = ({ show, onClose, meetings }: any) => {
  if (!show) return null

  const notifications = [
    ...meetings.slice(0, 3).map((m: any, i: number) => ({
      id: i,
      type: m.status === 'live' ? 'live' : m.aiSummary ? 'summary' : 'meeting',
      title: m.status === 'live' ? `"${m.title}" is Live!` : m.aiSummary ? `AI Summary ready` : `Meeting created`,
      sub: m.status === 'live' ? 'Click to join now' : m.aiSummary ? `"${m.title}"` : `"${m.title}"`,
      time: new Date(m.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      color: m.status === 'live' ? C.red : m.aiSummary ? C.purple : C.accentLight,
      icon: m.status === 'live' ? '🔴' : m.aiSummary ? '🤖' : '📅',
    })),
    {
      id: 99, type: 'system',
      title: 'Welcome to IntellMeet!',
      sub: 'AI-powered meetings are ready',
      time: 'Today', color: C.green, icon: '✨',
    }
  ]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 200 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: -10 }}
          onClick={e => e.stopPropagation()}
          style={{
            position: 'absolute', top: 58, right: 20,
            width: 320,
            background: '#0d0b14',
            border: `1px solid ${C.border}`,
            borderRadius: 16, overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            fontFamily: C.F,
          }}
        >
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>Notifications</div>
            <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 20, background: C.accentGlow, color: C.accentLight, fontWeight: 700 }}>
              {notifications.length} new
            </span>
          </div>
          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            {notifications.map((n, i) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                whileHover={{ background: 'rgba(255,255,255,0.04)' }}
                style={{
                  padding: '11px 14px', cursor: 'pointer',
                  borderBottom: i < notifications.length - 1 ? `1px solid ${C.border}` : 'none',
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                  background: n.color + '15', border: `1px solid ${n.color}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                }}>{n.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.text, marginBottom: 2 }}>{n.title}</div>
                  <div style={{ fontSize: 10, color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.sub}</div>
                </div>
                <div style={{ fontSize: 9, color: C.muted, whiteSpace: 'nowrap', marginTop: 1 }}>{n.time}</div>
              </motion.div>
            ))}
          </div>
          {notifications.length === 0 && (
            <div style={{ padding: '30px 20px', textAlign: 'center', color: C.muted, fontSize: 12 }}>
              No notifications yet
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ── Profile Menu ──────────────────────────────────────────────────────────
const ProfileMenu = ({ show, onClose, user, logout, setActive }: any) => {
  if (!show) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 200 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92 }}
          onClick={e => e.stopPropagation()}
          style={{
            position: 'absolute', top: 58, right: 20,
            width: 240,
            background: '#0d0b14',
            border: `1px solid ${C.border}`,
            borderRadius: 14, overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            fontFamily: C.F,
          }}
        >
          {/* User Info */}
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 800, color: '#fff', flexShrink: 0,
              boxShadow: `0 4px 12px ${C.accentGlow}`,
            }}>{user?.name?.[0]?.toUpperCase()}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
              <div style={{ fontSize: 10, color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
            </div>
          </div>

          {/* Menu Items */}
          {[
            { label: 'View Profile', icon: Shield, action: () => { setActive('profile'); onClose() } },
            { label: 'Settings', icon: Settings, action: () => { setActive('settings'); onClose() } },
            { label: 'AI Summaries', icon: Sparkles, action: () => { setActive('ai'); onClose() } },
            { label: 'Analytics', icon: BarChart2, action: () => { setActive('analytics'); onClose() } },
          ].map((item, i) => (
            <motion.button
              key={i}
              whileHover={{ background: 'rgba(255,255,255,0.05)' }}
              onClick={item.action}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '10px 16px', width: '100%',
                background: 'none', border: 'none',
                color: C.sub, fontSize: 12, cursor: 'pointer',
                fontFamily: C.F, textAlign: 'left',
                borderBottom: `1px solid ${C.border}`,
                transition: 'background 0.15s',
              }}
            >
              <item.icon size={13} color={C.muted} />
              {item.label}
            </motion.button>
          ))}

          {/* Logout */}
          <motion.button
            whileHover={{ background: 'rgba(239,68,68,0.08)' }}
            onClick={() => { logout(); onClose() }}
            style={{
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '10px 16px', width: '100%',
              background: 'none', border: 'none',
              color: C.red, fontSize: 12, cursor: 'pointer',
              fontFamily: C.F, textAlign: 'left',
              transition: 'background 0.15s',
            }}
          >
            <LogOut size={13} color={C.red} />
            Sign Out
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}





const TopNav = ({ user, onNew, meetings, logout, setActive, themeName, setThemeName }: any) => {
  const [showCopilot, setShowCopilot] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showTheme, setShowTheme] = useState(false)

  const liveCount = meetings.filter((m: any) => m.status === 'live').length
  const notifCount = meetings.length + 1

  return (
    <>
          <header style={{
            height: 52, position: 'sticky', top: 0, zIndex: 40,
            background: C.dark !== false
              ? 'rgba(6,6,10,0.88)'
              : 'rgba(248,250,252,0.9)',
            backdropFilter: 'blur(32px)',
            borderBottom: `1px solid ${C.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 20px', gap: 16,
            transition: 'background 0.4s ease',
          }}>
        {/* Search */}
        <div style={{ position: 'relative', width: 300 }}>
          <Search size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: C.muted }} />
          <input
            placeholder="Search meetings, summaries..."
            style={{
              width: '100%', background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 9, padding: '6px 30px 6px 30px',
              color: C.text, fontSize: 11, outline: 'none', fontFamily: C.F,
            }}
          />
          <kbd style={{
            position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.border}`,
            borderRadius: 4, padding: '1px 5px', fontSize: 9, color: C.muted,
            display: 'flex', alignItems: 'center', gap: 2,
          }}>
            <Command size={8} /> K
          </kbd>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          {/* AI Copilot */}
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => { setShowCopilot(true); setShowNotifications(false); setShowProfile(false) }}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: showCopilot
                ? `linear-gradient(135deg, rgba(168,85,247,0.25), rgba(94,106,210,0.25))`
                : `linear-gradient(135deg, rgba(168,85,247,0.12), rgba(94,106,210,0.12))`,
              border: `1px solid rgba(168,85,247,${showCopilot ? '0.4' : '0.2'})`,
              borderRadius: 8, padding: '6px 12px',
              color: '#c4b5fd', fontSize: 11, fontWeight: 600, cursor: 'pointer',
              fontFamily: C.F,
            }}
          >
            <Sparkles size={11} /> Ask Copilot
          </motion.button>

          {/* New Meeting */}
          <MagneticBtn
            onClick={onNew}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
              border: 'none', borderRadius: 8, padding: '6px 13px',
              color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer',
              fontFamily: C.F, boxShadow: `0 4px 12px ${C.accentGlow}`,
            }}
          >
            <Plus size={11} /> New Meeting
          </MagneticBtn>

          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
            onClick={() => { setShowNotifications(p => !p); setShowCopilot(false); setShowProfile(false) }}
            style={{
              position: 'relative', width: 32, height: 32, borderRadius: 8,
              background: showNotifications ? C.accentGlow : C.surface,
              border: `1px solid ${showNotifications ? C.accentLight + '40' : C.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: C.muted,
            }}
          >
            <Bell size={13} />
            {notifCount > 0 && (
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                style={{
                  position: 'absolute', top: 5, right: 5,
                  width: 7, height: 7, borderRadius: '50%',
                  background: liveCount > 0 ? C.red : C.accent,
                  boxShadow: `0 0 6px ${liveCount > 0 ? C.red : C.accent}`,
                  border: '1.5px solid #06060a',
                }}
              />
            )}
          </motion.button>


          {/* Theme Switcher */}
<div style={{ position: 'relative' }}>
  <motion.button
    whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
    onClick={() => { setShowTheme(p => !p); setShowCopilot(false); setShowNotifications(false); setShowProfile(false) }}
    style={{
      width: 32, height: 32, borderRadius: 8,
      background: showTheme ? C.accentGlow : C.surface,
      border: `1px solid ${showTheme ? C.accentLight + '40' : C.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer',
    }}
  >
    <div style={{ display: 'flex', gap: 2 }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: THEMES[themeName].preview[0] }} />
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: THEMES[themeName].preview[1] }} />
    </div>
  </motion.button>

  {/* Theme Dropdown */}
  <AnimatePresence>
    {showTheme && (
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: -8 }}
        style={{
          position: 'absolute', top: '110%', right: 0,
          background: '#0d0b14',
          border: `1px solid ${C.border}`,
          borderRadius: 14, padding: '10px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          zIndex: 300, minWidth: 160,
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontSize: 9, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8, padding: '0 4px', fontFamily: C.F }}>
          Theme
        </div>
        {Object.entries(THEMES).map(([key, theme]) => (
          <motion.button
            key={key}
            whileHover={{ background: 'rgba(255,255,255,0.06)' }}
            onClick={() => {
              setThemeName(key)
              localStorage.setItem('intellmeet-theme', key)
              C = THEMES[key] // Turant update
              setShowTheme(false)
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', padding: '8px 8px', borderRadius: 9,
              background: themeName === key ? C.accentGlow : 'transparent',
              border: `1px solid ${themeName === key ? C.borderAccent : 'transparent'}`,
              cursor: 'pointer', fontFamily: C.F,
              transition: 'background 0.15s',
            }}
          >
            <div style={{ display: 'flex', gap: 3 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: theme.preview[0] }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: theme.preview[1] }} />
            </div>
            <span style={{ fontSize: 12, color: themeName === key ? C.accentLight : C.sub, fontWeight: themeName === key ? 700 : 400 }}>
              {theme.label}
            </span>
            {themeName === key && (
              <Check size={11} color={C.accentLight} style={{ marginLeft: 'auto' }} />
            )}
          </motion.button>
        ))}
      </motion.div>
    )}
  </AnimatePresence>
</div>



          {/* Profile */}
          <motion.button
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
            onClick={() => { setShowProfile(p => !p); setShowCopilot(false); setShowNotifications(false) }}
            style={{
              width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
              background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 800, color: '#fff', cursor: 'pointer',
              border: showProfile ? `2px solid ${C.accentLight}` : '2px solid transparent',
              boxShadow: showProfile ? `0 0 12px ${C.accentGlow}` : `0 2px 8px ${C.accentGlow}`,
              transition: 'border 0.2s, box-shadow 0.2s',
            }}
          >{user?.name?.[0]?.toUpperCase()}</motion.button>
        </div>
      </header>

      {/* Modals */}
      <CopilotModal show={showCopilot} onClose={() => setShowCopilot(false)} meetings={meetings} />
      <NotificationsModal show={showNotifications} onClose={() => setShowNotifications(false)} meetings={meetings} />
      <ProfileMenu show={showProfile} onClose={() => setShowProfile(false)} user={user} logout={logout} setActive={setActive} />
    </>
  )
}


// ── Overview Page ─────────────────────────────────────────────────────────────
const OverviewPage = ({ meetings, loading, navigate, setShowNew, setShowJoin, user }: any) => {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const total = meetings.length
  const summaries = meetings.filter((m: any) => m.aiSummary).length
  const actions = meetings.reduce((a: number, m: any) => a + (m.actionItems?.length || 0), 0)
  const live = meetings.filter((m: any) => m.status === 'live').length
  const completed = meetings.filter((m: any) => m.status === 'completed').length

  // Real chart from meetings
  const weekChart = (() => {
    const days: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 }
    meetings.forEach((m: any) => {
      const d = new Date(m.createdAt).toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3)
      if (d in days) days[d]++
    })
    return Object.entries(days).map(([day, count]) => ({ day, count, ai: Math.round((count as number) * 0.65) }))
  })()

  const greet = time.getHours() < 12 ? 'Good morning' : time.getHours() < 17 ? 'Good afternoon' : 'Good evening'
  const recent = meetings.slice(0, 4)

  const COLORS = [C.accent, C.purple, C.green, C.amber]

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18, paddingBottom: 40 }}>

      {/* Welcome Hero */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              style={{
                position: 'relative', overflow: 'hidden', borderRadius: 20,
                border: `1px solid ${C.border}`,
                  background: C.dark !== false
                    ? 'linear-gradient(135deg, #09090f 0%, #0d0b14 50%, #080810 100%)'
                    : `linear-gradient(135deg, #e8eaf6 0%, #ede7f6 50%, #f3e5f5 100%)`,
                padding: '28px 32px',
                transition: 'background 0.4s ease',
              }}
            >
        {/* BG effects */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 280, height: 280, borderRadius: '50%', background: `radial-gradient(circle, ${C.accentGlow} 0%, transparent 70%)` }} />
          <div style={{ position: 'absolute', bottom: -40, left: -40, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${C.purpleGlow} 0%, transparent 70%)` }} />
          {/* Stars */}
          {[...Array(24)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: `${(i * 41) % 100}%`, top: `${(i * 29) % 100}%`,
              width: i % 5 === 0 ? 2 : 1.2, height: i % 5 === 0 ? 2 : 1.2,
              borderRadius: '50%', background: '#fff',
              opacity: 0.08 + (i % 4) * 0.06,
            }} />
          ))}
          {/* Mountain */}
          <svg style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', opacity: 0.06 }} viewBox="0 0 1200 200" preserveAspectRatio="none">
            <path d="M0,200 L0,130 Q120,60 240,100 Q360,140 480,60 Q600,0 720,50 Q840,100 960,60 Q1080,20 1200,80 L1200,200 Z" fill="#a78bfa" />
            <path d="M0,200 L0,155 Q180,110 360,135 Q540,160 720,115 Q900,70 1080,110 Q1140,130 1200,120 L1200,200 Z" fill="#5E6AD2" />
          </svg>
        </div>

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 }}>
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 10px', borderRadius: 20,
              background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`,
              fontSize: 10, color: C.muted, marginBottom: 12,
            }}>
              <Sparkles size={10} color={C.accentLight} />
              AI Copilot Active
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: C.text, letterSpacing: '-0.8px', marginBottom: 6, fontFamily: C.F }}>
              {greet}, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.6, maxWidth: 400, marginBottom: 20, fontFamily: C.F }}>
              {total === 0
                ? 'Welcome to IntellMeet. Start your first AI-powered meeting.'
                : `You have ${total} meeting${total > 1 ? 's' : ''} · ${live > 0 ? `${live} live right now · ` : ''}${summaries} AI summar${summaries === 1 ? 'y' : 'ies'} generated`}
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <MagneticBtn
                onClick={() => setShowNew(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
                  border: 'none', borderRadius: 10, padding: '9px 18px',
                  color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  fontFamily: C.F, boxShadow: `0 6px 20px ${C.accentGlow}`,
                }}
              >
                <Video size={13} /> Start Meeting
              </MagneticBtn>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => setShowJoin(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 10, padding: '9px 18px',
                  color: C.text, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  fontFamily: C.F,
                }}
              >
                <Hash size={13} /> Join Room
              </motion.button>
            </div>
          </div>

          {/* Live clock */}
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: C.text, letterSpacing: '-1.5px', fontFamily: 'SF Mono, monospace' }}>
              {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
              {time.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
            {live > 0 && (
              <motion.div
                animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                style={{
                  marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '4px 10px', borderRadius: 20,
                  background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
                  color: C.red, fontSize: 11, fontWeight: 700,
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.red }} />
                {live} Meeting Live
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <StatCard label="Total Meetings" value={total} icon={Video} color={C.accentLight} trend={total > 0 ? 12 : undefined} sub={total > 0 ? `${completed} completed` : undefined} />
        <StatCard label="AI Summaries" value={summaries} icon={Sparkles} color={C.purple} trend={summaries > 0 ? 8 : undefined} sub={summaries > 0 ? `${Math.round((summaries / Math.max(total, 1)) * 100)}% coverage` : undefined} />
        <StatCard label="Action Items" value={actions} icon={CheckCircle} color={C.green} trend={actions > 0 ? 5 : undefined} sub={actions > 0 ? 'tracked automatically' : undefined} />
        <StatCard label="Live Now" value={live} icon={Activity} color={live > 0 ? C.red : C.muted} sub={live > 0 ? 'meetings in progress' : 'no active meetings'} />
      </div>

      {/* Chart + Recent Meetings */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 14 }}>

        {/* Area Chart */}
        <GCard style={{ padding: '20px 22px' }} hover={false}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: C.F }}>Meeting Activity</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 3, fontFamily: C.F }}>
                {total > 0 ? 'Real data from your meetings this week' : 'Create meetings to see your activity'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: C.muted }}>
                <div style={{ width: 8, height: 2, borderRadius: 2, background: C.accent }} /> Meetings
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: C.muted }}>
                <div style={{ width: 8, height: 2, borderRadius: 2, background: C.purple }} /> AI Actions
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weekChart} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gM" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.accent} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={C.accent} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.purple} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={C.purple} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: '#111', border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 11, boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}
                itemStyle={{ color: C.text }} labelStyle={{ color: C.muted }}
                cursor={{ stroke: C.accentLight, strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area type="monotone" dataKey="count" name="Meetings" stroke={C.accent} strokeWidth={2} fill="url(#gM)" dot={false} />
              <Area type="monotone" dataKey="ai" name="AI Actions" stroke={C.purple} strokeWidth={2} fill="url(#gA)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </GCard>

        {/* Recent Meetings */}
        <GCard style={{ padding: '20px', display: 'flex', flexDirection: 'column' }} hover={false}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: C.F }}>Recent Meetings</div>
            <span style={{ fontSize: 10, color: C.muted }}>{total} total</span>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[1, 2, 3].map(i => (
                <motion.div key={i} animate={{ opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                  style={{ height: 56, borderRadius: 10, background: C.surface }} />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: C.surface, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Video size={18} color={C.muted} />
              </div>
              <div style={{ fontSize: 12, color: C.muted, fontFamily: C.F }}>No meetings yet</div>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => setShowNew(true)}
                style={{
                  fontSize: 11, color: C.accentLight, background: 'none', border: 'none',
                  cursor: 'pointer', fontFamily: C.F, fontWeight: 600,
                }}
              >Create first meeting →</motion.button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, overflowY: 'auto' }}>
              {recent.map((m: any, i: number) => (
                <motion.div
                  key={m._id}
                  initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                  whileHover={{ background: C.surfaceHover }}
                  style={{
                    padding: '10px 12px', borderRadius: 10,
                    background: C.surface, border: `1px solid ${C.border}`,
                    cursor: 'pointer', transition: 'background 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140, fontFamily: C.F }}>
                      {m.title}
                    </div>
                    <div style={{
                      padding: '2px 7px', borderRadius: 20, fontSize: 9, fontWeight: 700,
                      background: m.status === 'live' ? 'rgba(239,68,68,0.12)' : m.status === 'completed' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                      color: m.status === 'live' ? C.red : m.status === 'completed' ? C.green : C.amber,
                      border: `1px solid ${m.status === 'live' ? 'rgba(239,68,68,0.2)' : m.status === 'completed' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`,
                    }}>
                      {m.status === 'live' ? '● Live' : m.status === 'completed' ? '✓ Done' : '⏰ Soon'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 10, color: C.muted, fontFamily: C.F }}>
                      {new Date(m.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`/meeting/${m.roomId}`)}
                        style={{ padding: '3px 9px', borderRadius: 6, background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`, border: 'none', color: '#fff', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: C.F }}
                      >Join</motion.button>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`/post-meeting?meetingId=${m._id}`)}
                        style={{ padding: '3px 9px', borderRadius: 6, background: C.surface, border: `1px solid ${C.border}`, color: C.sub, fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: C.F }}
                      >Summary</motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </GCard>
      </div>

      {/* Quick Actions Bento */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10, fontFamily: C.F }}>
          Quick Actions
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {[
            { title: 'New Meeting', desc: 'Start AI-powered session', icon: Video, color: C.accent, action: () => setShowNew(true) },
            { title: 'Join Room', desc: 'Enter with a Room ID', icon: Hash, color: C.purple, action: () => setShowJoin(true) },
            { title: 'AI Summaries', desc: 'View generated reports', icon: Sparkles, color: '#a855f7', action: null },
            { title: 'Analytics', desc: 'View meeting trends', icon: BarChart2, color: C.amber, action: null },
          ].map((a, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4, borderColor: a.color + '40' }}
              whileTap={{ scale: 0.97 }}
              onClick={a.action || undefined}
              style={{
                padding: '18px', borderRadius: 14, cursor: 'pointer',
                background: C.surface, border: `1px solid ${C.border}`,
                transition: 'border-color 0.2s',
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 9, marginBottom: 12,
                background: a.color + '15', border: `1px solid ${a.color}25`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><a.icon size={15} color={a.color} /></div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 3, fontFamily: C.F }}>{a.title}</div>
              <div style={{ fontSize: 10, color: C.muted, fontFamily: C.F }}>{a.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Meetings Page ─────────────────────────────────────────────────────────────
const MeetingsPage = ({ meetings, loading, navigate, setShowNew }: any) => (
  <div style={{ maxWidth: 900, margin: '0 auto', paddingBottom: 40 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
      <div>
        <div style={{ fontSize: 18, fontWeight: 800, color: C.text, letterSpacing: '-0.5px', fontFamily: C.F }}>Meetings</div>
        <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{meetings.length} total</div>
      </div>
      <MagneticBtn onClick={() => setShowNew(true)} style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
        border: 'none', borderRadius: 9, padding: '7px 14px',
        color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: C.F,
        boxShadow: `0 4px 12px ${C.accentGlow}`,
      }}>
        <Plus size={12} /> New Meeting
      </MagneticBtn>
    </div>

    <GCard style={{ overflow: 'hidden' }} hover={false}>
      {loading ? (
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2, 3].map(i => (
            <motion.div key={i} animate={{ opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              style={{ height: 58, borderRadius: 10, background: C.surface }} />
          ))}
        </div>
      ) : meetings.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: C.surface, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Video size={20} color={C.muted} />
          </div>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 12, fontFamily: C.F }}>No meetings yet</div>
          <MagneticBtn onClick={() => setShowNew(true)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
            border: 'none', borderRadius: 9, padding: '8px 16px',
            color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: C.F,
          }}>
            <Plus size={12} /> Create First Meeting
          </MagneticBtn>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
            padding: '10px 16px', borderBottom: `1px solid ${C.border}`,
          }}>
            {['Meeting', 'Date', 'Status', 'Actions'].map(h => (
              <div key={h} style={{ fontSize: 9, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 1, fontFamily: C.F }}>{h}</div>
            ))}
          </div>
          {meetings.map((m: any, i: number) => (
            <motion.div
              key={m._id}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              whileHover={{ background: C.surfaceHover }}
              style={{
                display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
                padding: '12px 16px', alignItems: 'center',
                borderBottom: i < meetings.length - 1 ? `1px solid ${C.border}` : 'none',
                transition: 'background 0.15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: C.accentGlow, border: `1px solid ${C.borderAccent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Video size={13} color={C.accentLight} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text, fontFamily: C.F }}>{m.title}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>{m.roomId?.slice(0, 16)}...</div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: C.muted, fontFamily: C.F }}>
                {new Date(m.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
              <div>
                <span style={{
                  padding: '3px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600,
                  background: m.status === 'live' ? 'rgba(239,68,68,0.12)' : m.status === 'completed' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                  color: m.status === 'live' ? C.red : m.status === 'completed' ? C.green : C.amber,
                }}>
                  {m.status === 'live' ? 'Live' : m.status === 'completed' ? 'Done' : 'Scheduled'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/meeting/${m.roomId}`)}
                  style={{ padding: '4px 10px', borderRadius: 6, background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`, border: 'none', color: '#fff', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: C.F }}
                >Join</motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/post-meeting?meetingId=${m._id}`)}
                  style={{ padding: '4px 10px', borderRadius: 6, background: C.surface, border: `1px solid ${C.border}`, color: C.sub, fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: C.F }}
                >Summary</motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </GCard>
  </div>
)

// ── AI Summary Page ───────────────────────────────────────────────────────────
const AISummaryPage = ({ meetings, navigate }: any) => {
  const summaries = meetings.filter((m: any) => m.aiSummary)
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', paddingBottom: 40 }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: C.text, letterSpacing: '-0.5px', fontFamily: C.F }}>AI Summaries</div>
        <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{summaries.length} generated from your meetings</div>
      </div>
      {summaries.length === 0 ? (
        <GCard style={{ padding: '60px 20px', textAlign: 'center' as const }} hover={false}>
          <Sparkles size={28} color={C.muted} style={{ margin: '0 auto 12px' }} />
          <div style={{ fontSize: 13, color: C.muted, fontFamily: C.F }}>No summaries yet</div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>End a meeting to generate an AI summary</div>
        </GCard>
      ) : summaries.map((m: any, i: number) => (
        <motion.div
          key={m._id}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
          style={{ marginBottom: 12 }}
        >
          <GCard style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: C.F }}>{m.title}</div>
                <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>
                  {new Date(m.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
              <Badge color={C.purple}><Sparkles size={9} /> AI Generated</Badge>
            </div>
            <div style={{
              fontSize: 12, color: C.sub, lineHeight: 1.7,
              background: 'rgba(255,255,255,0.02)', borderRadius: 10,
              padding: '12px 14px', border: `1px solid ${C.border}`, marginBottom: 14, fontFamily: C.F,
            }}>{m.aiSummary}</div>
            {m.actionItems?.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, fontFamily: C.F }}>Action Items</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {m.actionItems.map((a: any, j: number) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.accent, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: C.sub, flex: 1, fontFamily: C.F }}>{a.task}</span>
                      <span style={{ fontSize: 10, color: C.muted }}>{a.assignee}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate(`/post-meeting?meetingId=${m._id}`)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '6px 12px', borderRadius: 7,
                background: C.accentGlow, border: `1px solid ${C.borderAccent}`,
                color: C.accentLight, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: C.F,
              }}
            >View Full Report <ArrowUpRight size={11} /></motion.button>
          </GCard>
        </motion.div>
      ))}
    </div>
  )
}

// ── Analytics Page ────────────────────────────────────────────────────────────
const AnalyticsPage = ({ meetings }: any) => {
  const total = meetings.length
  const summaries = meetings.filter((m: any) => m.aiSummary).length
  const actions = meetings.reduce((a: number, m: any) => a + (m.actionItems?.length || 0), 0)
  const completed = meetings.filter((m: any) => m.status === 'completed').length

  const monthChart = (() => {
    const mo: Record<string, number> = {}
    meetings.forEach((m: any) => {
      const k = new Date(m.createdAt).toLocaleString('en-IN', { month: 'short' })
      mo[k] = (mo[k] || 0) + 1
    })
    return Object.entries(mo).map(([month, count]) => ({ month, count }))
  })()

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', paddingBottom: 40 }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: C.text, letterSpacing: '-0.5px', fontFamily: C.F }}>Analytics</div>
        <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>Real insights from your meeting data</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 14 }}>
        {[
          { label: 'Total Meetings', value: total, icon: Video, color: C.accentLight },
          { label: 'AI Summaries', value: summaries, icon: Sparkles, color: C.purple },
          { label: 'Action Items', value: actions, icon: Target, color: C.amber },
          { label: 'Completed', value: completed, icon: Award, color: C.green },
        ].map((s, i) => (
          <GCard key={i} style={{ padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: s.color + '15', border: `1px solid ${s.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={16} color={s.color} />
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: '-0.5px', fontFamily: C.F }}><Counter value={s.value} /></div>
                <div style={{ fontSize: 10, color: C.muted, fontFamily: C.F }}>{s.label}</div>
              </div>
            </div>
          </GCard>
        ))}
      </div>

      <GCard style={{ padding: '20px 22px' }} hover={false}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4, fontFamily: C.F }}>Monthly Trend</div>
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 16, fontFamily: C.F }}>
          {monthChart.length > 0 ? 'Based on your actual meetings' : 'Create meetings to see data'}
        </div>
        {monthChart.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthChart} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#111', border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 11 }} />
              <Bar dataKey="count" name="Meetings" radius={[5, 5, 0, 0]}>
                {monthChart.map((_, i) => (
                  <Cell key={i} fill={i % 2 === 0 ? C.accent : C.purple} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 12, color: C.muted }}>No data yet</span>
          </div>
        )}
      </GCard>
    </div>
  )
}

// ── Team Page ─────────────────────────────────────────────────────────────────
const TeamPage = ({ user }: any) => (
  <div style={{ maxWidth: 800, margin: '0 auto', paddingBottom: 40 }}>
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: C.text, letterSpacing: '-0.5px', fontFamily: C.F }}>Team</div>
      <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>Manage your workspace</div>
    </div>
    <GCard style={{ padding: '20px' }} hover={false}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#fff', boxShadow: `0 4px 12px ${C.accentGlow}` }}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: C.F }}>{user?.name}</div>
          <div style={{ fontSize: 11, color: C.muted }}>{user?.email}</div>
        </div>
        <Badge color={C.accent}>{user?.role}</Badge>
      </div>
      <div style={{ padding: '20px 0', textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: C.muted, fontFamily: C.F, marginBottom: 12 }}>Invite teammates to collaborate</div>
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 9, padding: '8px 16px', color: C.text,
            fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: C.F,
          }}
        ><Plus size={12} /> Invite Member</motion.button>
      </div>
    </GCard>
  </div>
)

// ── Profile Page ──────────────────────────────────────────────────────────────
const ProfilePage = ({ user, onUpdate }: any) => {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' })
  const [error, setError] = useState('')

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const res = await axios.put(`${API_URL}/api/auth/profile`,
        { name: form.name, email: form.email },
        { headers }
      )
      // LocalStorage update karo
      localStorage.setItem('user', JSON.stringify(res.data.user))
      setSaved(true)
      setEditing(false)
      onUpdate(res.data.user)
      setTimeout(() => setSaved(false), 3000)
    } catch (e: any) {
      setError(e.response?.data?.message || 'Update failed!')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', paddingBottom: 40 }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: C.text, letterSpacing: '-0.5px', marginBottom: 18, fontFamily: C.F }}>
        Profile
      </div>

      <GCard style={{ padding: '24px' }} hover={false}>
        {/* Avatar + Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 20, borderBottom: `1px solid ${C.border}` }}>
          <div style={{
            width: 54, height: 54, borderRadius: 16, flexShrink: 0,
            background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 800, color: '#fff',
            boxShadow: `0 6px 20px ${C.accentGlow}`,
          }}>{form.name?.[0]?.toUpperCase()}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.text, fontFamily: C.F }}>{form.name}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{form.email}</div>
            <Badge color={C.accent}>{user?.role}</Badge>
          </div>
          {/* Edit / Cancel Button */}
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => { setEditing(p => !p); setError('') }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: editing ? 'rgba(239,68,68,0.1)' : C.accentGlow,
              border: `1px solid ${editing ? 'rgba(239,68,68,0.2)' : C.borderAccent}`,
              borderRadius: 8, padding: '6px 14px',
              color: editing ? C.red : C.accentLight,
              fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: C.F,
            }}
          >
            {editing ? <><X size={11} /> Cancel</> : <><Edit size={11} /> Edit</>}
          </motion.button>
        </div>

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Name */}
          <div>
            <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, fontFamily: C.F }}>
              Full Name
            </div>
            {editing ? (
              <input
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.04)',
                  border: `1.5px solid ${C.accentLight}40`,
                  borderRadius: 9, padding: '10px 13px',
                  color: C.text, fontSize: 13, outline: 'none', fontFamily: C.F,
                }}
                onFocus={e => e.target.style.borderColor = C.accentLight}
                onBlur={e => e.target.style.borderColor = C.accentLight + '40'}
              />
            ) : (
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: C.F }}>{form.name}</div>
            )}
          </div>

          {/* Email */}
          <div>
            <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, fontFamily: C.F }}>
              Email Address
            </div>
            {editing ? (
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.04)',
                  border: `1.5px solid ${C.accentLight}40`,
                  borderRadius: 9, padding: '10px 13px',
                  color: C.text, fontSize: 13, outline: 'none', fontFamily: C.F,
                }}
                onFocus={e => e.target.style.borderColor = C.accentLight}
                onBlur={e => e.target.style.borderColor = C.accentLight + '40'}
              />
            ) : (
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: C.F }}>{form.email}</div>
            )}
          </div>

          {/* Role — readonly */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderTop: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 11, color: C.muted, fontFamily: C.F }}>Role</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.text, fontFamily: C.F }}>{user?.role}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderTop: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 11, color: C.muted, fontFamily: C.F }}>Member Since</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.text, fontFamily: C.F }}>June 2026</span>
          </div>

          {/* Error */}
          {error && (
            <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 9, fontSize: 12, color: C.red, fontFamily: C.F }}>
              ⚠️ {error}
            </div>
          )}

          {/* Success */}
          <AnimatePresence>
            {saved && (
              <motion.div
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ padding: '10px 14px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 9, fontSize: 12, color: C.green, fontFamily: C.F, display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Check size={13} color={C.green} /> Profile updated successfully!
              </motion.div>
            )}
          </AnimatePresence>

          {/* Save Button */}
          {editing && (
            <motion.button
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              disabled={saving}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                background: saving ? C.surface : `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
                border: saving ? `1px solid ${C.border}` : 'none',
                borderRadius: 10, padding: '11px',
                color: saving ? C.muted : '#fff',
                fontSize: 12, fontWeight: 700,
                cursor: saving ? 'not-allowed' : 'pointer', fontFamily: C.F,
                boxShadow: saving ? 'none' : `0 4px 14px ${C.accentGlow}`,
              }}
            >
              {saving ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    style={{ width: 13, height: 13, border: `2px solid ${C.muted}`, borderTopColor: C.text, borderRadius: '50%' }}
                  />
                  Saving...
                </>
              ) : (
                <><Save size={13} /> Save Changes</>
              )}
            </motion.button>
          )}
        </div>
      </GCard>
    </div>
  )
}

// ── Settings Page ─────────────────────────────────────────────────────────────
const SettingsPage = ({ user, logout }: any) => {
  const [t, setT] = useState({ transcription: true, autoSummary: true, notifications: false, recording: false })
  const toggle = (k: string) => setT(p => ({ ...p, [k]: !(p as any)[k] }))

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', paddingBottom: 40 }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: C.text, letterSpacing: '-0.5px', marginBottom: 18, fontFamily: C.F }}>Settings</div>

      <GCard style={{ overflow: 'hidden', marginBottom: 12 }} hover={false}>
        <div style={{ padding: '10px 18px', borderBottom: `1px solid ${C.border}` }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: C.muted, textTransform: 'uppercase' as const, letterSpacing: 1.5, fontFamily: C.F }}>AI Preferences</span>
        </div>
        {[
          { k: 'transcription', l: 'AI Transcription', s: 'Auto-transcribe all meetings' },
          { k: 'autoSummary', l: 'Auto Summary', s: 'Generate summary after meeting ends' },
          { k: 'notifications', l: 'Notifications', s: 'Notify about action items' },
          { k: 'recording', l: 'Auto Recording', s: 'Record all meetings automatically' },
        ].map((p, i, arr) => (
          <div key={p.k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 18px', borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : 'none' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.text, fontFamily: C.F }}>{p.l}</div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 1, fontFamily: C.F }}>{p.s}</div>
            </div>
            <motion.div onClick={() => toggle(p.k)} whileTap={{ scale: 0.9 }}
              style={{ width: 36, height: 20, borderRadius: 10, cursor: 'pointer', background: (t as any)[p.k] ? `linear-gradient(135deg, ${C.accent}, ${C.purple})` : 'rgba(255,255,255,0.1)', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
              <motion.div animate={{ left: (t as any)[p.k] ? 17 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                style={{ position: 'absolute', top: 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }} />
            </motion.div>
          </div>
        ))}
      </GCard>

      <GCard style={{ padding: '16px 18px', border: '1px solid rgba(239,68,68,0.12)' }} hover={false}>
        <div style={{ fontSize: 9, fontWeight: 700, color: C.red, textTransform: 'uppercase' as const, letterSpacing: 1.5, marginBottom: 12, fontFamily: C.F }}>Danger Zone</div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={logout}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '7px 14px', color: C.red, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: C.F }}>
          <LogOut size={12} /> Sign Out
        </motion.button>
      </GCard>
    </div>
  )
}

// ── Modals ────────────────────────────────────────────────────────────────────
const Modal = ({ show, onClose, title, sub, children }: any) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 16 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          onClick={e => e.stopPropagation()}
          style={{ background: '#0d0b14', border: `1px solid ${C.border}`, borderRadius: 18, padding: '24px', width: '100%', maxWidth: 380, boxShadow: `0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset`, fontFamily: C.F }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.text, letterSpacing: '-0.4px' }}>{title}</div>
            <motion.button whileHover={{ scale: 1.1, background: C.surfaceHover }} whileTap={{ scale: 0.9 }}
              onClick={onClose}
              style={{ width: 26, height: 26, borderRadius: 7, border: `1px solid ${C.border}`, background: C.surface, color: C.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <X size={12} />
            </motion.button>
          </div>
          {sub && <div style={{ fontSize: 11, color: C.muted, marginBottom: 18 }}>{sub}</div>}
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
)

// ── Main ──────────────────────────────────────────────────────────────────────
let C = THEMES['violet']

export default function Dashboard() {
  const navigate = useNavigate()
  const [themeName, setThemeName] = useState(() => {
  return localStorage.getItem('intellmeet-theme') || 'violet'
})

  C = THEMES[themeName]

  const [collapsed, setCollapsed] = useState(false)
  const [active, setActive] = useState('dashboard')
  const [meetings, setMeetings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [joinId, setJoinId] = useState('')
  const [toast, setToast] = useState('')

  const [currentUser, setCurrentUser] = useState(
  JSON.parse(localStorage.getItem('user') || '{}')
  
)








  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const fetchMeetings = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/meetings`, { headers })
      setMeetings(res.data.meetings)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }


  // ── Meeting Reminder ──────────────────────────────────────────────────────────


const [reminder, setReminder] = useState<any>(null)

useEffect(() => {
  if (meetings.length === 0) return

  // Scheduled meetings check karo
  const scheduled = meetings.filter((m: any) => m.status === 'scheduled')
  if (scheduled.length > 0) {
    // 5 second baad reminder dikhao (real app mein time check hoga)
    const t = setTimeout(() => {
      setReminder(scheduled[0])
    }, 5000)
    return () => clearTimeout(t)
  }
}, [meetings])

  useEffect(() => { fetchMeetings() }, [])

  const createMeeting = async () => {
    if (!newTitle.trim()) return
    try {
      const res = await axios.post(`${API_URL}/api/meetings/create`, { title: newTitle }, { headers })
      setShowNew(false); setNewTitle(''); fetchMeetings()
      navigate(`/meeting/${res.data.meeting.roomId}`)
    } catch (e) { console.error(e) }
  }

  const joinMeeting = async () => {
    if (!joinId.trim()) return
    try {
      await axios.post(`${API_URL}/api/meetings/join/${joinId}`, {}, { headers })
      setShowJoin(false); setJoinId('')
      navigate(`/meeting/${joinId}`)
    } catch { showToast('Room ID not found!') }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')


  }

  const sidebarW = collapsed ? 68 : 232

  const renderPage = () => {
    switch (active) {
      case 'dashboard': return <OverviewPage meetings={meetings} loading={loading} navigate={navigate} setShowNew={setShowNew} setShowJoin={setShowJoin} user={user} />
      case 'meetings': return <MeetingsPage meetings={meetings} loading={loading} navigate={navigate} setShowNew={setShowNew} />
      case 'ai': return <AISummaryPage meetings={meetings} navigate={navigate} />
      case 'analytics': return <AnalyticsPage meetings={meetings} />
      case 'team': return <TeamPage user={user} />
      case 'profile': return <ProfilePage user={currentUser} onUpdate={(u: any) => setCurrentUser(u)} />
      case 'settings': return <SettingsPage user={user} logout={logout} />
      default: return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: C.surface, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={20} color={C.muted} />
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: C.F }}>{active.charAt(0).toUpperCase() + active.slice(1)}</div>
          <div style={{ fontSize: 11, color: C.muted, fontFamily: C.F }}>Coming soon</div>
        </div>
      )
    }
  }

  return (
    <div style={{minHeight: '100vh',background: C.bg,display: 'flex', fontFamily: C.F,color: C.text, overflow: 'hidden',transition: 'background 0.4s ease, color 0.3s ease'}}>
          <style>{`
            * { box-sizing: border-box; margin: 0; padding: 0; }
            @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
            ::-webkit-scrollbar { width: 3px; height: 3px; }
            ::-webkit-scrollbar-thumb { background: ${C.dark !== false ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.15)'}; border-radius: 2px; }
            input::placeholder { color: ${C.muted}; }
            button { font-family: ${C.F}; }
            * { transition: background-color 0.3s ease, border-color 0.3s ease, color 0.2s ease; }
          `}</style>

{/* Background */}
<div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
  <div style={{
    position: 'absolute', top: '10%', left: '30%',
    width: 600, height: 400,
    background: C.dark !== false
      ? `radial-gradient(ellipse, ${C.accentGlow} 0%, transparent 70%)`
      : `radial-gradient(ellipse, rgba(94,106,210,0.08) 0%, transparent 70%)`,
    filter: 'blur(80px)',
  }} />
  <div style={{
    position: 'absolute', bottom: '10%', right: '20%',
    width: 400, height: 300,
    background: C.dark !== false
      ? `radial-gradient(ellipse, ${C.purpleGlow} 0%, transparent 70%)`
      : `radial-gradient(ellipse, rgba(124,58,237,0.06) 0%, transparent 70%)`,
    filter: 'blur(60px)',
  }} />
  {/* Stars — dark mode mein hi dikhein */}
  {C.dark !== false && [...Array(35)].map((_, i) => (
    <div key={i} style={{
      position: 'absolute',
      left: `${(i * 29) % 100}%`,
      top: `${(i * 19) % 100}%`,
      width: i % 6 === 0 ? 2 : 1.2,
      height: i % 6 === 0 ? 2 : 1.2,
      borderRadius: '50%', background: '#fff',
      opacity: 0.04 + (i % 4) * 0.04,
    }} />
  ))}
</div>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            style={{ position: 'fixed', top: 18, left: '50%', transform: 'translateX(-50%)', background: '#131020', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 18px', color: C.accentLight, fontSize: 12, fontWeight: 500, backdropFilter: 'blur(20px)', zIndex: 999, boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${C.accentGlow}` }}
          >{toast}</motion.div>
        )}
      </AnimatePresence>

        

        {/* Meeting Reminder */}
<AnimatePresence>
  {reminder && (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{
        position: 'fixed', bottom: 24, right: 24,
        width: 320, zIndex: 999,
        background: '#0d0b14',
        border: `1px solid ${C.borderAccent}`,
        borderRadius: 16, overflow: 'hidden',
        boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px ${C.accentGlow}`,
        fontFamily: C.F,
      }}
    >
      {/* Accent top bar */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${C.accent}, ${C.purple})` }} />

      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: C.accentGlow, border: `1px solid ${C.borderAccent}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Bell size={14} color={C.accentLight} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.text }}>Meeting Reminder</div>
              <div style={{ fontSize: 9, color: C.muted }}>Scheduled meeting</div>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => setReminder(null)}
            style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer' }}
          ><X size={13} /></motion.button>
        </div>

        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>
          {reminder.title}
        </div>
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 14 }}>
          You have a scheduled meeting ready to join
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => {
              navigate(`/meeting/${reminder.roomId}`)
              setReminder(null)
            }}
            style={{
              flex: 2, padding: '8px',
              background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
              border: 'none', borderRadius: 9,
              color: '#fff', fontSize: 11, fontWeight: 700,
              cursor: 'pointer', fontFamily: C.F,
              boxShadow: `0 4px 12px ${C.accentGlow}`,
            }}
          >Join Now →</motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => setReminder(null)}
            style={{
              flex: 1, padding: '8px',
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 9, color: C.muted,
              fontSize: 11, fontWeight: 600,
              cursor: 'pointer', fontFamily: C.F,
            }}
          >Dismiss</motion.button>
        </div>
      </div>
    </motion.div>
  )}
</AnimatePresence>



      {/* Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} active={active} setActive={setActive} user={currentUser} logout={logout} meetings={meetings} />

      {/* Main */}
      <div style={{ flex: 1, marginLeft: sidebarW, display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', zIndex: 1, transition: 'margin-left 0.3s cubic-bezier(0.16,1,0.3,1)' }}>
<TopNav
  user={currentUser}
  onNew={() => setShowNew(true)}
  meetings={meetings}
  logout={logout}
  setActive={setActive}
  themeName={themeName}
  setThemeName={setThemeName}
/>


        <main style={{ flex: 1, overflowY: 'auto', padding: '22px 24px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 10, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.99 }}
              transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* New Meeting Modal */}
      <Modal show={showNew} onClose={() => setShowNew(false)} title="New Meeting" sub="AI transcription enabled automatically">
        <input
          type="text" placeholder="Meeting title..." value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && createMeeting()}
          autoFocus
          style={{ width: '100%', background: C.surface, border: `1.5px solid ${C.borderAccent}`, borderRadius: 10, padding: '10px 13px', color: C.text, fontSize: 13, outline: 'none', fontFamily: C.F, marginBottom: 12 }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: C.accentGlow, border: `1px solid ${C.borderAccent}`, borderRadius: 9, padding: '9px 12px', marginBottom: 18 }}>
          <Sparkles size={12} color={C.accentLight} />
          <span style={{ fontSize: 11, color: C.accentLight, fontFamily: C.F }}>AI summary & transcription ready</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setShowNew(false)}
            style={{ flex: 1, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 9, padding: '10px', color: C.sub, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: C.F }}>
            Cancel
          </motion.button>
          <MagneticBtn onClick={createMeeting} style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`, border: 'none', borderRadius: 9, padding: '10px', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: C.F, boxShadow: `0 4px 14px ${C.accentGlow}` }}>
            <Video size={12} /> Start Meeting
          </MagneticBtn>
        </div>
      </Modal>

      {/* Join Room Modal */}
      <Modal show={showJoin} onClose={() => setShowJoin(false)} title="Join Meeting" sub="Paste the Room ID to join instantly">
        <input
          type="text" placeholder="Room ID..." value={joinId}
          onChange={e => setJoinId(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && joinMeeting()}
          autoFocus
          style={{ width: '100%', background: C.surface, border: `1.5px solid ${C.borderAccent}`, borderRadius: 10, padding: '10px 13px', color: C.text, fontSize: 13, outline: 'none', fontFamily: C.F, marginBottom: 18 }}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setShowJoin(false)}
            style={{ flex: 1, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 9, padding: '10px', color: C.sub, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: C.F }}>
            Cancel
          </motion.button>
          <MagneticBtn onClick={joinMeeting} style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`, border: 'none', borderRadius: 9, padding: '10px', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: C.F, boxShadow: `0 4px 14px ${C.accentGlow}` }}>
            <Hash size={12} /> Join Room
          </MagneticBtn>
        </div>
      </Modal>
    </div>
  )
}