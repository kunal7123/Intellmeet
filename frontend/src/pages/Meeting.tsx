import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { io, Socket } from 'socket.io-client'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic, MicOff, Video, VideoOff, Monitor, MonitorOff,
  PhoneOff, MessageSquare, Users, Sparkles, Send,
  Copy, Check, Hash, Hand, Smile, Wifi, X
} from 'lucide-react'

const F = '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
const C = {
  bg: '#06060a',
  surface: 'rgba(255,255,255,0.04)',
  surfaceHover: 'rgba(255,255,255,0.07)',
  border: 'rgba(255,255,255,0.07)',
  accent: '#5E6AD2',
  accentLight: '#818cf8',
  accentGlow: 'rgba(94,106,210,0.2)',
  purple: '#a855f7',
  green: '#10b981',
  red: '#ef4444',
  amber: '#f59e0b',
  text: '#f8fafc',
  sub: '#94a3b8',
  muted: 'rgba(255,255,255,0.28)',
}

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ]
}

const EMOJIS = ['👍', '❤️', '😂', '😮', '👏', '🔥']

// ── Timer ──────────────────────────────────────────────────────────────────
const Timer = ({ start }: { start: number }) => {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000)
    return () => clearInterval(t)
  }, [start])
  const m = Math.floor(elapsed / 60)
  const s = elapsed % 60
  return (
    <span style={{ fontFamily: 'monospace', fontSize: 12, color: C.muted, letterSpacing: 1 }}>
      {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
    </span>
  )
}

// ── Floating Emoji ─────────────────────────────────────────────────────────
const FloatingEmoji = ({ emoji, id, onDone }: any) => {
  useEffect(() => {
    const t = setTimeout(onDone, 3000)
    return () => clearTimeout(t)
  }, [])
  return (
    <motion.div
      initial={{ opacity: 1, y: 0, x: Math.random() * 60 - 30, scale: 0.5 }}
      animate={{ opacity: 0, y: -180, scale: 1.4 }}
      transition={{ duration: 3, ease: 'easeOut' }}
      style={{
        position: 'fixed', bottom: 120,
        left: '45%', fontSize: 36, zIndex: 999,
        pointerEvents: 'none', userSelect: 'none',
      }}
    >{emoji}</motion.div>
  )
}

// ── Control Button ─────────────────────────────────────────────────────────
const CtrlBtn = ({ onClick, active, danger, title, children, badge }: any) => (
  <motion.button
    whileHover={{ scale: 1.1, y: -3 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    title={title}
    style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
      background: 'none', border: 'none', cursor: 'pointer', padding: '6px',
      position: 'relative',
    }}
  >
    <div style={{
      width: 42, height: 42, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: danger && active
        ? 'rgba(239,68,68,0.18)'
        : active ? C.accentGlow : 'rgba(255,255,255,0.06)',
      border: `1px solid ${danger && active ? 'rgba(239,68,68,0.35)' : active ? C.accentLight + '50' : C.border}`,
      transition: 'all 0.2s',
      boxShadow: active && !danger ? `0 0 14px ${C.accentGlow}` : 'none',
    }}>{children}</div>
    <span style={{ fontSize: 9, color: C.muted, fontFamily: F, fontWeight: 500, whiteSpace: 'nowrap' }}>{title}</span>
    {badge && (
      <div style={{
        position: 'absolute', top: 2, right: 2, width: 8, height: 8,
        borderRadius: '50%', background: C.red,
        boxShadow: `0 0 6px ${C.red}`,
      }} />
    )}
  </motion.button>
)

// ── Premium Video Tile ─────────────────────────────────────────────────────
const VideoTile = ({ name, videoRef, isLocal, videoOff, muted, isActive, index = 0, handRaised }: any) => {
  const colors = [
    ['#5E6AD2', '#a855f7'],
    ['#10b981', '#3b82f6'],
    ['#f59e0b', '#ef4444'],
    ['#ec4899', '#8b5cf6'],
  ]
  const [c1, c2] = colors[index % colors.length]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22, delay: index * 0.06 }}
      style={{
        position: 'relative', borderRadius: 18, overflow: 'hidden',
        background: `linear-gradient(135deg, #0a0814 0%, #0d0b18 100%)`,
        border: `1.5px solid ${isActive ? c1 + '50' : C.border}`,
        boxShadow: isActive ? `0 0 28px ${c1}25` : '0 4px 20px rgba(0,0,0,0.4)',
        transition: 'border-color 0.3s, box-shadow 0.3s',
        minHeight: 0,
      }}
    >
      {/* Active glow ring */}
      {isActive && (
        <motion.div
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            position: 'absolute', inset: 0, borderRadius: 17,
            border: `2px solid ${c1}60`, pointerEvents: 'none', zIndex: 8,
          }}
        />
      )}

      {/* Corner accents */}
      {isActive && ['tl', 'tr', 'bl', 'br'].map((pos, i) => (
        <motion.div
          key={pos}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}
          style={{
            position: 'absolute', width: 14, height: 14, zIndex: 9,
            ...(pos === 'tl' ? { top: 0, left: 0, borderTop: `2px solid ${c1}`, borderLeft: `2px solid ${c1}`, borderTopLeftRadius: 18 } : {}),
            ...(pos === 'tr' ? { top: 0, right: 0, borderTop: `2px solid ${c1}`, borderRight: `2px solid ${c1}`, borderTopRightRadius: 18 } : {}),
            ...(pos === 'bl' ? { bottom: 0, left: 0, borderBottom: `2px solid ${c1}`, borderLeft: `2px solid ${c1}`, borderBottomLeftRadius: 18 } : {}),
            ...(pos === 'br' ? { bottom: 0, right: 0, borderBottom: `2px solid ${c1}`, borderRight: `2px solid ${c1}`, borderBottomRightRadius: 18 } : {}),
          }}
        />
      ))}

      {/* Video */}
      <video
        ref={videoRef} autoPlay playsInline muted={isLocal}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: videoOff ? 'none' : 'block', minHeight: 0 }}
      />

      {/* Avatar fallback */}
      {(videoOff || !videoRef) && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: `radial-gradient(circle at 40% 40%, ${c1}14 0%, transparent 65%)`,
        }}>
          {isActive && [1, 2, 3].map(i => (
            <motion.div key={i}
              animate={{ scale: [1, 1.4 + i * 0.25], opacity: [0.25, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.4 }}
              style={{ position: 'absolute', width: 52 + i * 26, height: 52 + i * 26, borderRadius: '50%', border: `1px solid ${c1}45` }}
            />
          ))}
          <motion.div
            animate={isActive ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              width: 58, height: 58, borderRadius: '50%', zIndex: 2,
              background: `linear-gradient(135deg, ${c1}, ${c2})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 800, color: '#fff',
              boxShadow: `0 8px 28px ${c1}55`,
            }}
          >{name?.[0]?.toUpperCase()}</motion.div>
          {videoOff && isLocal && (
            <div style={{ marginTop: 8, fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: F, zIndex: 2 }}>Camera off</div>
          )}
        </div>
      )}

      {/* Hand raised */}
      {handRaised && (
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          style={{
            position: 'absolute', top: 10, right: 10, zIndex: 10,
            width: 28, height: 28, borderRadius: 8,
            background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
          }}
        >✋</motion.div>
      )}

      {/* Bottom gradient */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 72,
        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      {/* Name bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '8px 10px', zIndex: 5,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Audio visualizer */}
          {isActive && !muted && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 1.5, height: 12 }}>
              {[0.6, 1, 0.7, 0.9, 0.5].map((h, i) => (
                <motion.div key={i}
                  animate={{ scaleY: [h, 1, h * 0.3, h] }}
                  transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.1 }}
                  style={{ width: 2, height: 12, borderRadius: 2, background: c1, transformOrigin: 'bottom' }}
                />
              ))}
            </div>
          )}
          <span style={{ fontSize: 11, fontWeight: 600, color: '#fff', fontFamily: F, textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
            {name}{isLocal ? ' (You)' : ''}
          </span>
          {isLocal && (
            <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 4, background: `${c1}30`, border: `1px solid ${c1}50`, color: c1, fontFamily: F, fontWeight: 700 }}>
              HOST
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {muted && (
            <div style={{ width: 20, height: 20, borderRadius: 5, background: 'rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MicOff size={9} color={C.red} />
            </div>
          )}
          {videoOff && (
            <div style={{ width: 20, height: 20, borderRadius: 5, background: 'rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <VideoOff size={9} color={C.red} />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}










export default function Meeting() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const socketRef = useRef<Socket | null>(null)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const peersRef = useRef<Record<string, RTCPeerConnection>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const startTime = useRef(Date.now())

  const [muted, setMuted] = useState(false)
  const [videoOff, setVideoOff] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [handRaised, setHandRaised] = useState(false)
  const [tab, setTab] = useState<'chat' | 'people' | 'ai'>('chat')
  const [showEndModal, setShowEndModal] = useState(false)
  const [showEmojis, setShowEmojis] = useState(false)
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: number; emoji: string }[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [chatMsg, setChatMsg] = useState('')
  const [copied, setCopied] = useState(false)
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [aiGenerating, setAiGenerating] = useState(false)
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor'>('excellent')
  const [remoteStreams, setRemoteStreams] = useState<Record<string, { stream: MediaStream; name: string }>>({})
  const [transcript, setTranscript] = useState<{ speaker: string; text: string; time: string }[]>([
    { speaker: 'System', text: 'Meeting started. AI transcription active.', time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) }
  ])

  // ── Media ────────────────────────────────────────────────────────────────
  const startMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      localStreamRef.current = stream
      if (localVideoRef.current) localVideoRef.current.srcObject = stream
      return stream
    } catch (e) {
      console.error('Camera error:', e)
      return null
    }
  }, [])

  // ── Peer Connection ──────────────────────────────────────────────────────
  const createPeer = useCallback((targetId: string, stream: MediaStream, initiator: boolean) => {
    const peer = new RTCPeerConnection(ICE_SERVERS)
    stream.getTracks().forEach(track => peer.addTrack(track, stream))

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socketRef.current?.emit('ice-candidate', { candidate: e.candidate, to: targetId })
      }
    }

    peer.ontrack = (e) => {
      setRemoteStreams(prev => ({
        ...prev,
        [targetId]: { stream: e.streams[0], name: `User-${targetId.slice(0, 4)}` }
      }))
    }

    // Connection quality monitor
    peer.onconnectionstatechange = () => {
      if (peer.connectionState === 'connected') setConnectionQuality('excellent')
      else if (peer.connectionState === 'connecting') setConnectionQuality('good')
      else if (peer.connectionState === 'failed') setConnectionQuality('poor')
    }

    if (initiator) {
      peer.createOffer()
        .then(offer => peer.setLocalDescription(offer))
        .then(() => {
          socketRef.current?.emit('webrtc-offer', { offer: peer.localDescription, to: targetId })
        })
    }

    peersRef.current[targetId] = peer
    return peer
  }, [])

  // ── Socket ───────────────────────────────────────────────────────────────
  useEffect(() => {
    let localStream: MediaStream | null = null

    const init = async () => {
      localStream = await startMedia()
      if (!localStream) return

      const socket = io('http://localhost:5000')
      socketRef.current = socket
      socket.emit('join-room', roomId)

      socket.on('user-joined', ({ socketId }: any) => {
        if (localStream) createPeer(socketId, localStream, true)
        setTranscript(t => [...t, {
          speaker: 'System',
          text: 'A participant joined.',
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        }])
      })

      socket.on('webrtc-offer', async ({ offer, from }: any) => {
        if (!localStream) return
        const peer = createPeer(from, localStream, false)
        await peer.setRemoteDescription(new RTCSessionDescription(offer))
        const answer = await peer.createAnswer()
        await peer.setLocalDescription(answer)
        socket.emit('webrtc-answer', { answer, to: from })
      })

      socket.on('webrtc-answer', async ({ answer, from }: any) => {
        const peer = peersRef.current[from]
        if (peer) await peer.setRemoteDescription(new RTCSessionDescription(answer))
      })

      socket.on('ice-candidate', async ({ candidate, from }: any) => {
        const peer = peersRef.current[from]
        if (peer && candidate) {
          try { await peer.addIceCandidate(new RTCIceCandidate(candidate)) }
          catch (e) { console.error('ICE error:', e) }
        }
      })

      socket.on('user-left', ({ socketId }: any) => {
        peersRef.current[socketId]?.close()
        delete peersRef.current[socketId]
        setRemoteStreams(prev => {
          const u = { ...prev }
          delete u[socketId]
          return u
        })
      })

      socket.on('receive-message', (data: any) => {
        if (data.from !== user.name) setMessages(p => [...p, data])
      })

      socket.on('emoji-reaction', ({ emoji }: any) => {
        setFloatingEmojis(p => [...p, { id: Date.now(), emoji }])
      })
    }

    init()

    return () => {
      localStreamRef.current?.getTracks().forEach(t => t.stop())
      Object.values(peersRef.current).forEach(p => p.close())
      socketRef.current?.emit('leave-room', roomId)
      socketRef.current?.disconnect()
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Controls ─────────────────────────────────────────────────────────────
  const toggleMute = () => {
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled })
    setMuted(p => !p)
  }

  const toggleVideo = () => {
    localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled })
    setVideoOff(p => !p)
  }

  const toggleShare = async () => {
    if (sharing) {
      localStreamRef.current?.getTracks().forEach(t => t.stop())
      await startMedia()
      setSharing(false)
    } else {
      try {
        const screen = await navigator.mediaDevices.getDisplayMedia({ video: true })
        localStreamRef.current = screen
        if (localVideoRef.current) localVideoRef.current.srcObject = screen
        const vt = screen.getVideoTracks()[0]
        Object.values(peersRef.current).forEach(peer => {
          const sender = peer.getSenders().find(s => s.track?.kind === 'video')
          if (sender) sender.replaceTrack(vt)
        })
        setSharing(true)
        vt.onended = async () => { await startMedia(); setSharing(false) }
      } catch (e) { console.error(e) }
    }
  }

  const sendMessage = () => {
    if (!chatMsg.trim()) return
    const data = {
      roomId, from: user.name, msg: chatMsg,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    }
    socketRef.current?.emit('send-message', data)
    setMessages(p => [...p, { ...data, self: true }])
    setChatMsg('')
  }

  const sendEmoji = (emoji: string) => {
    socketRef.current?.emit('emoji-reaction', { roomId, emoji })
    setFloatingEmojis(p => [...p, { id: Date.now(), emoji }])
    setShowEmojis(false)
  }

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const generateAI = () => {
    setAiGenerating(true)
    setTab('ai')
    setTimeout(() => {
      setAiSummary(`Meeting in progress with ${Object.keys(remoteStreams).length + 1} participant(s). AI will generate full summary when meeting ends.`)
      setAiGenerating(false)
    }, 2000)
  }

  const endMeeting = (saveSummary: boolean) => {
    localStreamRef.current?.getTracks().forEach(t => t.stop())
    Object.values(peersRef.current).forEach(p => p.close())
    socketRef.current?.emit('leave-room', roomId)
    socketRef.current?.disconnect()
    navigate(saveSummary ? '/post-meeting' : '/dashboard')
  }

  const remoteList = Object.entries(remoteStreams)
  const totalParticipants = 1 + remoteList.length

  const qualityColor = connectionQuality === 'excellent' ? C.green : connectionQuality === 'good' ? C.amber : C.red
  const qualityBars = connectionQuality === 'excellent' ? 4 : connectionQuality === 'good' ? 2 : 1

  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      background: C.bg, fontFamily: F, overflow: 'hidden',
    }}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
        input::placeholder { color: rgba(255,255,255,0.2); }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
      `}</style>

      {/* Floating Emojis */}
      {floatingEmojis.map(e => (
        <FloatingEmoji
          key={e.id} emoji={e.emoji} id={e.id}
          onDone={() => setFloatingEmojis(p => p.filter(x => x.id !== e.id))}
        />
      ))}

      {/* ── TOP BAR ── */}
      <div style={{
        height: 46, flexShrink: 0,
        padding: '0 16px',
        background: 'rgba(6,6,10,0.92)', backdropFilter: 'blur(32px)',
        borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        zIndex: 10,
      }}>
        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontSize: 13, fontWeight: 800,
            background: `linear-gradient(135deg, ${C.accentLight}, ${C.purple})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>IntellMeet</span>
          <div style={{ width: 1, height: 12, background: C.border }} />
          <motion.div
            animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '2px 7px', borderRadius: 20,
              background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)',
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.red }} />
            <span style={{ fontSize: 9, color: C.red, fontWeight: 700 }}>LIVE</span>
          </motion.div>
          <Timer start={startTime.current} />

          {/* Connection quality */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 1.5, height: 14, marginLeft: 4 }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{
                width: 3, height: 4 + i * 2.5, borderRadius: 2,
                background: i <= qualityBars ? qualityColor : 'rgba(255,255,255,0.12)',
                transition: 'background 0.3s',
              }} />
            ))}
          </div>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 7, padding: '4px 9px',
          }}>
            <Users size={10} color={C.muted} />
            <span style={{ fontSize: 10, color: C.muted }}>{totalParticipants}</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => { generateAI(); setTab('ai') }}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(94,106,210,0.15))',
              border: '1px solid rgba(168,85,247,0.25)', borderRadius: 7,
              padding: '4px 11px', color: '#c4b5fd', fontSize: 10, fontWeight: 600, cursor: 'pointer',
            }}
          ><Sparkles size={10} /> AI Summary</motion.button>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

        {/* ── VIDEO AREA ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '10px', gap: 8, minWidth: 0, minHeight: 0 }}>

          {/* Grid */}
          <div style={{
            flex: 1, minHeight: 0,
            display: 'grid', gap: 8,
            gridTemplateColumns: totalParticipants === 1 ? '1fr' : 'repeat(2, 1fr)',
            gridTemplateRows: totalParticipants <= 2 ? '1fr' : 'repeat(2, 1fr)',
          }}>
            <VideoTile
              name={user.name} videoRef={localVideoRef}
              isLocal videoOff={videoOff} muted={muted}
              isActive={!muted} index={0} handRaised={handRaised}
            />
            {remoteList.map(([socketId, { stream, name }], i) => {
              const ref = (el: HTMLVideoElement | null) => { if (el && stream) el.srcObject = stream }
              return (
                <VideoTile key={socketId} name={name} videoRef={ref}
                  isLocal={false} videoOff={false} muted={false}
                  isActive={true} index={i + 1} handRaised={false}
                />
              )
            })}
          </div>

          {/* ── CONTROLS ── */}
          <div style={{
            flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 2, padding: '6px 16px',
            background: 'rgba(6,6,10,0.88)', backdropFilter: 'blur(24px)',
            borderRadius: 16, border: `1px solid ${C.border}`,
            alignSelf: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}>
            <CtrlBtn onClick={toggleMute} active={muted} danger title={muted ? 'Unmute' : 'Mute'}>
              {muted ? <MicOff size={16} color={C.red} /> : <Mic size={16} color={C.muted} />}
            </CtrlBtn>
            <CtrlBtn onClick={toggleVideo} active={videoOff} danger title={videoOff ? 'Start Cam' : 'Stop Cam'}>
              {videoOff ? <VideoOff size={16} color={C.red} /> : <Video size={16} color={C.muted} />}
            </CtrlBtn>
            <CtrlBtn onClick={toggleShare} active={sharing} title="Share Screen">
              {sharing ? <MonitorOff size={16} color={C.accentLight} /> : <Monitor size={16} color={C.muted} />}
            </CtrlBtn>

            {/* Hand Raise */}
            <CtrlBtn onClick={() => setHandRaised(p => !p)} active={handRaised} title="Raise Hand">
              <Hand size={16} color={handRaised ? C.amber : C.muted} />
            </CtrlBtn>

            {/* Emoji Reactions */}
            <div style={{ position: 'relative' }}>
              <CtrlBtn onClick={() => setShowEmojis(p => !p)} active={showEmojis} title="React">
                <Smile size={16} color={showEmojis ? C.accentLight : C.muted} />
              </CtrlBtn>
              <AnimatePresence>
                {showEmojis && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    style={{
                      position: 'absolute', bottom: '110%', left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'rgba(14,12,22,0.98)', backdropFilter: 'blur(24px)',
                      border: `1px solid ${C.border}`, borderRadius: 14,
                      padding: '8px', display: 'flex', gap: 4,
                      boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                      zIndex: 50,
                    }}
                  >
                    {EMOJIS.map(e => (
                      <motion.button key={e}
                        whileHover={{ scale: 1.4, y: -4 }} whileTap={{ scale: 0.9 }}
                        onClick={() => sendEmoji(e)}
                        style={{
                          fontSize: 22, background: 'none', border: 'none',
                          cursor: 'pointer', padding: '4px', borderRadius: 8,
                          lineHeight: 1,
                        }}
                      >{e}</motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div style={{ width: 1, height: 24, background: C.border, margin: '0 4px' }} />

            <CtrlBtn onClick={() => setTab('chat')} active={tab === 'chat'} title="Chat">
              <MessageSquare size={16} color={tab === 'chat' ? C.accentLight : C.muted} />
            </CtrlBtn>
            <CtrlBtn onClick={() => setTab('people')} active={tab === 'people'} title="People">
              <Users size={16} color={tab === 'people' ? C.accentLight : C.muted} />
            </CtrlBtn>
            <CtrlBtn onClick={() => { generateAI(); setTab('ai') }} active={tab === 'ai'} title="AI">
              <Sparkles size={16} color={tab === 'ai' ? C.accentLight : C.muted} />
            </CtrlBtn>

            <div style={{ width: 1, height: 24, background: C.border, margin: '0 4px' }} />

            {/* End */}
            <motion.button
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
              onClick={() => setShowEndModal(true)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                background: 'none', border: 'none', cursor: 'pointer', padding: '6px',
              }}
            >
              <div style={{
                width: 42, height: 42, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(239,68,68,0.18)', border: '1px solid rgba(239,68,68,0.35)',
                boxShadow: '0 4px 12px rgba(239,68,68,0.2)',
              }}>
                <PhoneOff size={16} color={C.red} />
              </div>
              <span style={{ fontSize: 9, color: C.red, fontFamily: F, fontWeight: 600 }}>End</span>
            </motion.button>
          </div>
        </div>

        {/* ── SIDEBAR ── */}
        <div style={{
          width: 280, flexShrink: 0,
          background: 'rgba(6,6,10,0.88)', backdropFilter: 'blur(24px)',
          borderLeft: `1px solid ${C.border}`,
          display: 'flex', flexDirection: 'column', minHeight: 0,
        }}>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
            {[
              { id: 'chat', label: 'Chat', icon: MessageSquare },
              { id: 'people', label: 'People', icon: Users },
              { id: 'ai', label: 'AI', icon: Sparkles },
            ].map(t => (
              <motion.button key={t.id} onClick={() => setTab(t.id as any)}
                style={{
                  flex: 1, padding: '10px 4px', background: 'none', border: 'none',
                  borderBottom: `2px solid ${tab === t.id ? C.accentLight : 'transparent'}`,
                  color: tab === t.id ? C.accentLight : C.muted,
                  cursor: 'pointer', fontSize: 10, fontWeight: 600, fontFamily: F,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                  transition: 'all 0.2s',
                }}
              >
                <t.icon size={11} />{t.label}
              </motion.button>
            ))}
          </div>

          {/* Room ID */}
          <div style={{
            padding: '8px 10px', borderBottom: `1px solid ${C.border}`,
            flexShrink: 0, display: 'flex', alignItems: 'center', gap: 7,
          }}>
            <div style={{
              flex: 1, background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 7, padding: '5px 9px',
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <Hash size={9} color={C.muted} />
              <span style={{ fontSize: 9, color: C.muted, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {roomId?.slice(0, 24)}...
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
              onClick={copyRoomId}
              style={{
                width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                background: copied ? 'rgba(16,185,129,0.15)' : C.surface,
                border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : C.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}
            >
              {copied ? <Check size={11} color={C.green} /> : <Copy size={11} color={C.muted} />}
            </motion.button>
          </div>

          {/* ── CHAT TAB ── */}
          {tab === 'chat' && (
            <>
              <div style={{ flex: 1, overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: 7, minHeight: 0 }}>
                {messages.length === 0 && (
                  <div style={{ textAlign: 'center', paddingTop: 40 }}>
                    <MessageSquare size={22} color={C.muted} style={{ margin: '0 auto 8px' }} />
                    <p style={{ fontSize: 11, color: C.muted, fontFamily: F }}>No messages yet</p>
                  </div>
                )}
                {messages.map((m, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: m.self ? 'flex-end' : 'flex-start' }}
                  >
                    {!m.self && <span style={{ fontSize: 9, color: C.muted, marginBottom: 2, fontFamily: F }}>{m.from}</span>}
                    <div style={{
                      padding: '7px 10px', maxWidth: '82%',
                      borderRadius: m.self ? '11px 2px 11px 11px' : '2px 11px 11px 11px',
                      background: m.self
                        ? `linear-gradient(135deg, ${C.accent}, ${C.purple})`
                        : C.surface,
                      border: m.self ? 'none' : `1px solid ${C.border}`,
                      fontSize: 12, color: '#fff', lineHeight: 1.5, fontFamily: F,
                    }}>{m.msg}</div>
                    <span style={{ fontSize: 9, color: C.muted, marginTop: 2, fontFamily: F }}>{m.time}</span>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div style={{
                padding: '8px 10px', borderTop: `1px solid ${C.border}`,
                flexShrink: 0, display: 'flex', gap: 6,
              }}>
                <input
                  type="text" placeholder="Message..." value={chatMsg}
                  onChange={e => setChatMsg(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  style={{
                    flex: 1, background: C.surface, border: `1px solid ${C.border}`,
                    borderRadius: 8, padding: '7px 10px', color: C.text, fontSize: 12,
                    outline: 'none', fontFamily: F,
                  }}
                />
                <motion.button
                  whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                  onClick={sendMessage}
                  style={{
                    width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
                    border: 'none', cursor: 'pointer', flexShrink: 0,
                  }}
                ><Send size={12} color="#fff" /></motion.button>
              </div>
            </>
          )}

          {/* ── PEOPLE TAB ── */}
          {tab === 'people' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px', minHeight: 0 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8, fontFamily: F }}>
                In Meeting — {totalParticipants}
              </div>
              {/* Local */}
              <motion.div
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 10, marginBottom: 5, background: C.surface, border: `1px solid ${C.border}` }}
              >
                <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.text, fontFamily: F, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
                  <div style={{ fontSize: 9, color: C.muted, fontFamily: F }}><span style={{ color: C.green }}>● </span>Host · You</div>
                </div>
                {handRaised && <span style={{ fontSize: 14 }}>✋</span>}
                <span style={{ fontSize: 8, fontWeight: 700, color: C.accentLight, background: C.accentGlow, border: `1px solid ${C.accentLight}30`, borderRadius: 4, padding: '1px 5px', fontFamily: F }}>HOST</span>
              </motion.div>
              {/* Remote */}
              {remoteList.map(([socketId, { name }], i) => (
                <motion.div key={socketId}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: (i + 1) * 0.05 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 10, marginBottom: 5, background: C.surface, border: `1px solid ${C.border}` }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>
                    {name?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.text, fontFamily: F }}>{name}</div>
                    <div style={{ fontSize: 9, color: C.muted, fontFamily: F }}><span style={{ color: C.green }}>● </span>Participant</div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* ── AI TAB ── */}
          {tab === 'ai' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 1.5, fontFamily: F }}>
                Live Transcript
              </div>
              {transcript.map((t, i) => (
                <div key={i} style={{ padding: '7px 9px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, color: C.accentLight, fontFamily: F }}>{t.speaker}</span>
                    <span style={{ fontSize: 9, color: C.muted, fontFamily: F }}>{t.time}</span>
                  </div>
                  <p style={{ fontSize: 11, color: C.sub, lineHeight: 1.5, fontFamily: F }}>{t.text}</p>
                </div>
              ))}
              {aiGenerating && (
                <div style={{ padding: '12px', background: C.accentGlow, border: `1px solid ${C.accentLight}30`, borderRadius: 9, textAlign: 'center' }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                    style={{ width: 16, height: 16, border: `2px solid ${C.accentLight}`, borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 7px' }} />
                  <div style={{ fontSize: 10, color: C.accentLight, fontFamily: F, fontWeight: 600 }}>AI analyzing...</div>
                </div>
              )}
              {aiSummary && !aiGenerating && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  style={{ padding: '10px', background: C.accentGlow, border: `1px solid ${C.accentLight}30`, borderRadius: 9 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                    <Sparkles size={10} color={C.accentLight} />
                    <span style={{ fontSize: 9, fontWeight: 700, color: C.accentLight, fontFamily: F }}>AI Preview</span>
                  </div>
                  <p style={{ fontSize: 11, color: C.sub, lineHeight: 1.5, fontFamily: F }}>{aiSummary}</p>
                </motion.div>
              )}
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={generateAI} disabled={aiGenerating}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(94,106,210,0.2))',
                  border: '1px solid rgba(168,85,247,0.3)', borderRadius: 8,
                  padding: '8px', color: '#c4b5fd', fontSize: 10, fontWeight: 600,
                  cursor: aiGenerating ? 'not-allowed' : 'pointer', fontFamily: F,
                  opacity: aiGenerating ? 0.5 : 1,
                }}
              >
                <Sparkles size={11} />{aiGenerating ? 'Generating...' : 'Generate AI Preview'}
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* ── END MODAL ── */}
      <AnimatePresence>
        {showEndModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowEndModal(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              onClick={e => e.stopPropagation()}
              style={{ background: '#0d0b14', border: `1px solid ${C.border}`, borderRadius: 20, padding: '26px', width: '100%', maxWidth: 360, fontFamily: F }}
            >
              <div style={{ width: 46, height: 46, borderRadius: 13, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <PhoneOff size={18} color={C.red} />
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, color: C.text, marginBottom: 5, letterSpacing: '-0.4px' }}>End Meeting?</div>
              <p style={{ fontSize: 11, color: C.muted, marginBottom: 20, lineHeight: 1.6 }}>
                {totalParticipants > 1 ? `${totalParticipants} participants will be disconnected. ` : ''}
                Save AI summary before leaving?
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => endMeeting(true)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`, border: 'none', borderRadius: 10, padding: '11px', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: F, boxShadow: `0 4px 14px ${C.accentGlow}` }}
                ><Sparkles size={12} /> End & Save AI Summary</motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => endMeeting(false)}
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.22)', borderRadius: 10, padding: '11px', color: C.red, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: F }}
                >End Without Summary</motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setShowEndModal(false)}
                  style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '11px', color: C.muted, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: F }}
                >Continue Meeting</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}