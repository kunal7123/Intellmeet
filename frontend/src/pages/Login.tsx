import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'

import { API_URL } from "../config";

const Login = () => {
  const navigate = useNavigate()
  const [isSignup, setIsSignup] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [focusedField, setFocusedField] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [toast, setToast] = useState('')
  const [textIndex, setTextIndex] = useState(0)

  const taglines = [
    'Smarter Meetings,\nBetter Outcomes.',
    'AI Summaries,\nZero Effort.',
    'Real-Time Video,\nReal Results.',
  ]

  // Tagline cycling
  useEffect(() => {
    const t = setInterval(() => {
      setTextIndex(p => (p + 1) % taglines.length)
    }, 3000)
    return () => clearInterval(t)
  }, [])

  // Toast auto hide
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(''), 3000)
      return () => clearTimeout(t)
    }
  }, [toast])

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const url = isSignup
        ? `${API_URL}/api/auth/signup`
        : `${API_URL}/api/auth/login`
      const body = isSignup
        ? { name: form.name, email: form.email, password: form.password }
        : { email: form.email, password: form.password }
      const res = await axios.post(url, body)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something Wrong..!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#13111a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      padding: 24,
    }}>
      <style>{`
        * { box-sizing: border-box; }
        input::placeholder { color: rgba(255,255,255,0.25); }
        input { caret-color: #a78bfa; }
      `}</style>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            style={{
              position: 'fixed', top: 24, left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(30,28,40,0.95)',
              border: '1px solid rgba(167,139,250,0.3)',
              borderRadius: 12, padding: '12px 20px',
              color: '#a78bfa', fontSize: 14, fontWeight: 500,
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              zIndex: 999, whiteSpace: 'nowrap',
            }}
          >
            🚧 {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          display: 'flex',
          width: '100%',
          maxWidth: 900,
          minHeight: 540,
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* ── Left Side ── */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minWidth: 320 }}>
          {/* BG */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(160deg, #1a0533 0%, #2d1b69 30%, #1e3a5f 60%, #0d2137 80%, #0a1628 100%)',
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: `
              radial-gradient(ellipse at 50% 120%, rgba(139,92,246,0.3) 0%, transparent 60%),
              radial-gradient(ellipse at 80% 80%, rgba(30,58,95,0.8) 0%, transparent 50%),
              radial-gradient(ellipse at 20% 60%, rgba(45,27,105,0.6) 0%, transparent 40%)
            `,
          }} />

          {/* Mountain SVG */}
          <svg style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%' }}
            viewBox="0 0 400 200" preserveAspectRatio="none">
            <path d="M0,200 L0,140 Q50,80 100,100 Q150,120 180,60 Q210,0 240,40 Q270,80 300,70 Q330,60 360,90 Q380,110 400,80 L400,200 Z"
              fill="rgba(15,10,30,0.8)" />
            <path d="M0,200 L0,160 Q40,120 80,140 Q120,160 160,110 Q200,60 230,90 Q260,120 300,100 Q340,80 400,110 L400,200 Z"
              fill="rgba(10,8,20,0.9)" />
            <path d="M0,200 L0,180 Q60,160 120,170 Q180,180 220,150 Q260,120 310,140 Q350,155 400,145 L400,200 Z"
              fill="rgba(8,6,16,0.95)" />
          </svg>

          {/* Stars */}
          {[...Array(30)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: `${(i * 37) % 100}%`,
              top: `${(i * 23) % 60}%`,
              width: i % 5 === 0 ? 2.5 : 1.5,
              height: i % 5 === 0 ? 2.5 : 1.5,
              borderRadius: '50%',
              background: '#fff',
              opacity: 0.3 + (i % 3) * 0.2,
            }} />
          ))}

          {/* Glow */}
          <div style={{
            position: 'absolute', bottom: '25%', left: '50%',
            transform: 'translateX(-50%)',
            width: 200, height: 60,
            background: 'radial-gradient(ellipse, rgba(139,92,246,0.4) 0%, transparent 70%)',
            filter: 'blur(10px)',
          }} />

          {/* Logo — sirf text */}
          <div style={{ position: 'absolute', top: 24, left: 24 }}>
            <span style={{
              color: '#fff', fontWeight: 800, fontSize: 17,
              letterSpacing: '-0.5px',
              background: 'linear-gradient(135deg, #a78bfa, #60a5fa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>IntellMeet</span>
          </div>

          {/* Back to website */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/')}
            style={{
              position: 'absolute', top: 20, right: 20,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 25, padding: '7px 14px',
              color: 'rgba(255,255,255,0.7)', fontSize: 12,
              cursor: 'pointer', backdropFilter: 'blur(10px)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            ← Back to website
          </motion.div>

          {/* Animated tagline */}
          <div style={{
            position: 'absolute', bottom: 40, left: 28,
          }}>
            <AnimatePresence mode="wait">
              <motion.h2
                key={textIndex}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                style={{
                  color: '#fff', fontSize: 22, fontWeight: 700,
                  margin: 0, letterSpacing: '-0.5px', lineHeight: 1.4,
                  whiteSpace: 'pre-line',
                  textShadow: '0 2px 20px rgba(0,0,0,0.5)',
                }}
              >
                {taglines[textIndex].split('\n')[0]}<br />
                <span style={{ color: 'rgba(167,139,250,0.9)' }}>
                  {taglines[textIndex].split('\n')[1]}
                </span>
              </motion.h2>
            </AnimatePresence>

            {/* Dots indicator */}
            <div style={{ display: 'flex', gap: 6, marginTop: 16 }}>
              {taglines.map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ width: i === textIndex ? 20 : 6 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    height: 6, borderRadius: 3,
                    background: i === textIndex ? '#a78bfa' : 'rgba(255,255,255,0.25)',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Right Side ── */}
        <div style={{
          width: 420, background: '#1a1825',
          padding: '48px 40px',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={isSignup ? 'signup' : 'signin'}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <h2 style={{
                fontSize: 28, fontWeight: 700, color: '#fff',
                margin: '0 0 8px', letterSpacing: '-0.8px',
              }}>
                {isSignup ? 'Create an account' : 'Welcome back'}
              </h2>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '0 0 28px' }}>
                {isSignup ? 'Already have an account? ' : "Don't have an account? "}
                <span
                  onClick={() => { setIsSignup(p => !p); setError('') }}
                  style={{ color: '#a78bfa', cursor: 'pointer', fontWeight: 600 }}
                >
                  {isSignup ? 'Log in' : 'Sign up'}
                </span>
              </p>
            </motion.div>
          </AnimatePresence>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <AnimatePresence>
              {isSignup && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FormInput
                    type="text" placeholder="Full Name"
                    value={form.name}
                    onChange={(v: string) => setForm(p => ({ ...p, name: v }))}
                    focused={focusedField === 'name'}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField('')}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <FormInput
              type="email" placeholder="Email"
              value={form.email}
              onChange={(v: string) => setForm(p => ({ ...p, email: v }))}
              focused={focusedField === 'email'}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField('')}
            />

            <FormInput
              type="password" placeholder="Enter your password"
              value={form.password}
              onChange={(v: string) => setForm(p => ({ ...p, password: v }))}
              focused={focusedField === 'password'}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField('')}
              onKeyDown={(e: any) => e.key === 'Enter' && handleSubmit()}
            />

            {isSignup && (
              <label style={{
                display: 'flex', alignItems: 'center', gap: 8,
                cursor: 'pointer', marginTop: 2,
              }}>
                <input type="checkbox" style={{ accentColor: '#a78bfa', width: 15, height: 15 }} />
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                  I agree to the{' '}
                  <span style={{ color: '#a78bfa' }}>Terms & Conditions</span>
                </span>
              </label>
            )}

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    background: 'rgba(255,59,48,0.1)',
                    border: '1px solid rgba(255,59,48,0.25)',
                    borderRadius: 10, padding: '10px 14px',
                    fontSize: 13, color: '#ff6b6b',
                  }}
                >⚠️ {error}</motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              onClick={handleSubmit}
              disabled={loading}
              whileHover={!loading ? { scale: 1.02, boxShadow: '0 8px 28px rgba(124,58,237,0.5)' } : {}}
              whileTap={!loading ? { scale: 0.97 } : {}}
              style={{
                background: loading
                  ? 'rgba(167,139,250,0.3)'
                  : 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
                color: '#fff', border: 'none', borderRadius: 12,
                padding: '14px', fontSize: 15, fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: 4,
                boxShadow: '0 4px 20px rgba(124,58,237,0.35)',
                fontFamily: 'inherit',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 8,
              }}
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    style={{
                      width: 16, height: 16,
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff', borderRadius: '50%',
                    }}
                  />
                  Please wait...
                </>
              ) : isSignup ? 'Create account' : 'Sign in'}
            </motion.button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>Or register with</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            </div>

            {/* OAuth — Coming Soon toast */}
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { icon: 'G', label: 'Google', color: '#ea4335' },
                { icon: '🍎', label: 'Apple', color: '#fff' },
              ].map((b, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.02, background: 'rgba(255,255,255,0.08)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setToast(`${b.label} login coming soon!`)}
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12, padding: '12px',
                    cursor: 'pointer', color: '#fff',
                    fontSize: 14, fontWeight: 500,
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 8,
                    fontFamily: 'inherit',
                  }}
                >
                  <span style={{ fontSize: 16, color: b.color, fontWeight: 800 }}>{b.icon}</span>
                  {b.label}
                </motion.button>
              ))}
            </div>
          </div>

          <p style={{
            textAlign: 'center', fontSize: 11,
            color: 'rgba(255,255,255,0.15)', marginTop: 24,
          }}>
            🔒 Secured with JWT + bcrypt
          </p>
        </div>
      </motion.div>
    </div>
  )
}

const FormInput = ({ type, placeholder, value, onChange, focused, onFocus, onBlur, onKeyDown }: any) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={e => onChange(e.target.value)}
    onFocus={onFocus}
    onBlur={onBlur}
    onKeyDown={onKeyDown}
    style={{
      background: focused ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
      border: `1.5px solid ${focused ? '#a78bfa' : 'rgba(255,255,255,0.08)'}`,
      borderRadius: 10, padding: '13px 16px',
      fontSize: 14, color: '#fff',
      outline: 'none', width: '100%',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      transition: 'all 0.2s',
      boxSizing: 'border-box' as const,
      boxShadow: focused ? '0 0 0 3px rgba(167,139,250,0.15)' : 'none',
    }}
  />
)

export default Login