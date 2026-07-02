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
  Star, Activity, Target, Award, Hash
} from 'lucide-react';

import { Edit, Save, Check } from 'lucide-react';


import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, BarChart, Bar, Cell
} from 'recharts';

// ── Utils ─────────────────────────────────────────────────────────────────────
const cn = (...classes: (string | undefined | false | null)[]) =>
  classes.filter(Boolean).join(' ');

// ── Theme tokens ──────────────────────────────────────────────────────────────
const C = {
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
        background: 'rgba(6,6,10,0.92)',
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
const TopNav = ({ user, onNew, onJoin }: any) => (
  <header style={{
    height: 54, position: 'sticky', top: 0, zIndex: 40,
    background: 'rgba(6,6,10,0.85)', backdropFilter: 'blur(32px)',
    borderBottom: `1px solid ${C.border}`,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 20px', gap: 16,
  }}>
    {/* Search */}
    <div style={{ position: 'relative', width: 320 }}>
      <Search size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: C.muted }} />
      <input
        placeholder="Search meetings, summaries..."
        style={{
          width: '100%', background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 10, padding: '7px 32px 7px 32px',
          color: C.text, fontSize: 12, outline: 'none', fontFamily: C.F,
        }}
        className="focus:border-[rgba(94,106,210,0.4)] transition-colors placeholder:text-white/25"
      />
      <kbd style={{
        position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
        background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.border}`,
        borderRadius: 5, padding: '1px 5px', fontSize: 9, color: C.muted,
        display: 'flex', alignItems: 'center', gap: 2,
      }}>
        <Command size={9} /> K
      </kbd>
    </div>

    {/* Actions */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {/* AI Copilot */}
      <motion.button
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(94,106,210,0.15))',
          border: `1px solid rgba(168,85,247,0.25)`,
          borderRadius: 9, padding: '6px 12px',
          color: '#c4b5fd', fontSize: 11, fontWeight: 600, cursor: 'pointer',
          fontFamily: C.F,
        }}
      >
        <Sparkles size={12} /> Ask Copilot
      </motion.button>

      {/* New Meeting */}
      <MagneticBtn
        onClick={onNew}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
          border: 'none', borderRadius: 9, padding: '6px 14px',
          color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer',
          fontFamily: C.F, boxShadow: `0 4px 14px ${C.accentGlow}`,
        }}
      >
        <Plus size={12} /> New Meeting
      </MagneticBtn>

      {/* Bell */}
      <motion.button
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        style={{
          position: 'relative', width: 34, height: 34, borderRadius: 9,
          background: C.surface, border: `1px solid ${C.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: C.muted,
        }}
      >
        <Bell size={14} />
        <span style={{
          position: 'absolute', top: 7, right: 7, width: 6, height: 6,
          background: C.accent, borderRadius: '50%',
          boxShadow: `0 0 6px ${C.accent}`,
        }} />
      </motion.button>

      {/* Avatar */}
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 800, color: '#fff', cursor: 'pointer',
        boxShadow: `0 2px 8px ${C.accentGlow}`,
      }}>{user?.name?.[0]?.toUpperCase()}</div>
    </div>
  </header>
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
          background: trend >= 0 ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
          color: trend >= 0 ? C.green : C.red,
        }}>
          <TrendingUp size={9} />
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <div style={{ fontSize: 26, fontWeight: 800, color: C.text, letterSpacing: '-1px', fontFamily: C.F }}>
      <Counter value={value} />
    </div>
    <div style={{ fontSize: 11, color: C.muted, marginTop: 3, fontFamily: C.F }}>{label}</div>
    {sub && <div style={{ fontSize: 10, color: color, marginTop: 4, fontWeight: 600 }}>{sub}</div>}
  </GCard>
)

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
          background: 'linear-gradient(135deg, #09090f 0%, #0d0b14 50%, #080810 100%)',
          padding: '28px 32px',
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
      const res = await axios.put('http://localhost:5000/api/auth/profile',
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
export default function Dashboard() {
  const navigate = useNavigate()
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
      const res = await axios.get('http://localhost:5000/api/meetings', { headers })
      setMeetings(res.data.meetings)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchMeetings() }, [])

  const createMeeting = async () => {
    if (!newTitle.trim()) return
    try {
      const res = await axios.post('http://localhost:5000/api/meetings/create', { title: newTitle }, { headers })
      setShowNew(false); setNewTitle(''); fetchMeetings()
      navigate(`/meeting/${res.data.meeting.roomId}`)
    } catch (e) { console.error(e) }
  }

  const joinMeeting = async () => {
    if (!joinId.trim()) return
    try {
      await axios.post(`http://localhost:5000/api/meetings/join/${joinId}`, {}, { headers })
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
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', fontFamily: C.F, color: C.text, overflow: 'hidden' }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.07); border-radius: 2px; }
        input::placeholder { color: rgba(255,255,255,0.2); }
        button { font-family: ${C.F}; }
      `}</style>

      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '10%', left: '30%', width: 600, height: 400, background: `radial-gradient(ellipse, ${C.accentGlow} 0%, transparent 70%)`, filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '20%', width: 400, height: 300, background: `radial-gradient(ellipse, ${C.purpleGlow} 0%, transparent 70%)`, filter: 'blur(60px)' }} />
        {/* Stars */}
        {[...Array(35)].map((_, i) => (
          <div key={i} style={{ position: 'absolute', left: `${(i * 29) % 100}%`, top: `${(i * 19) % 100}%`, width: i % 6 === 0 ? 2 : 1.2, height: i % 6 === 0 ? 2 : 1.2, borderRadius: '50%', background: '#fff', opacity: 0.04 + (i % 4) * 0.04 }} />
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

      {/* Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} active={active} setActive={setActive} user={currentUser} logout={logout} meetings={meetings} />

      {/* Main */}
      <div style={{ flex: 1, marginLeft: sidebarW, display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', zIndex: 1, transition: 'margin-left 0.3s cubic-bezier(0.16,1,0.3,1)' }}>
        <TopNav user={user} onNew={() => setShowNew(true)} onJoin={() => setShowJoin(true)} />
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