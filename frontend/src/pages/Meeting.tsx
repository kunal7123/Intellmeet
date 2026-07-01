import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { io, Socket } from 'socket.io-client'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic, MicOff, Video, VideoOff, Monitor, MonitorOff,
  PhoneOff, MessageSquare, Users, Sparkles, Send,
  Copy, Check, X, Circle, CheckCircle
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
  text: '#f8fafc',
  sub: '#94a3b8',
  muted: 'rgba(255,255,255,0.28)',
}

// STUN servers — Google ke free STUN use karenge
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ]
}

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
    <span style={{ fontFamily: 'monospace', fontSize: 13, color: C.muted, letterSpacing: 1 }}>
      {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
    </span>
  )
}

// ── Control Button ─────────────────────────────────────────────────────────
const CtrlBtn = ({ onClick, active, danger, title, children }: any) => (
  <motion.button
    whileHover={{ scale: 1.08, y: -2 }} whileTap={{ scale: 0.93 }}
    onClick={onClick} title={title}
    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}
  >
    <div style={{
      width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: danger && active ? 'rgba(239,68,68,0.15)' : active ? C.accentGlow : 'rgba(255,255,255,0.06)',
      border: `1px solid ${danger && active ? 'rgba(239,68,68,0.3)' : active ? C.accentLight + '40' : C.border}`,
      transition: 'all 0.2s',
    }}>{children}</div>
    <span style={{ fontSize: 9, color: C.muted, fontFamily: F, fontWeight: 500 }}>{title}</span>
  </motion.button>
)

// ── Video Tile ─────────────────────────────────────────────────────────────
const VideoTile = ({ name, videoRef, isLocal, videoOff, muted, isActive }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.92 }}
    animate={{ opacity: 1, scale: 1 }}
    style={{
      position: 'relative', borderRadius: 16, overflow: 'hidden',
      background: 'linear-gradient(135deg, #0f0d1a, #0a0814)',
      border: `1.5px solid ${isActive ? C.accentLight + '60' : C.border}`,
      boxShadow: isActive ? `0 0 24px ${C.accentGlow}` : 'none',
      aspectRatio: '16/9', transition: 'all 0.3s',
    }}
  >
    <video
      ref={videoRef} autoPlay playsInline muted={isLocal}
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: videoOff ? 'none' : 'block' }}
    />
    {videoOff && (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <motion.div
          animate={{ scale: isActive ? [1, 1.06, 1] : 1 }}
          transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
          style={{
            width: 56, height: 56, borderRadius: '50%',
            background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 800, color: '#fff',
            boxShadow: isActive ? `0 0 24px ${C.accentGlow}` : 'none',
          }}
        >{name?.[0]?.toUpperCase()}</motion.div>
        <span style={{ fontSize: 11, color: C.muted, fontFamily: F }}>Camera off</span>
      </div>
    )}
    {isActive && (
      <motion.div
        animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}
        style={{ position: 'absolute', inset: 0, borderRadius: 14, border: `2px solid ${C.accentLight}`, pointerEvents: 'none' }}
      />
    )}
    <div style={{
      position: 'absolute', bottom: 10, left: 10,
      display: 'flex', alignItems: 'center', gap: 5,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)',
      borderRadius: 8, padding: '4px 8px',
    }}>
      {muted && <MicOff size={10} color={C.red} />}
      <span style={{ fontSize: 11, color: '#fff', fontFamily: F, fontWeight: 500 }}>
        {name}{isLocal ? ' (You)' : ''}
      </span>
    </div>
  </motion.div>
)

export default function Meeting() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  // Refs
  const socketRef = useRef<Socket | null>(null)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const peersRef = useRef<Record<string, RTCPeerConnection>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const startTime = useRef(Date.now())

  // States
  const [muted, setMuted] = useState(false)
  const [videoOff, setVideoOff] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [tab, setTab] = useState<'chat' | 'people' | 'ai'>('chat')
  const [showEndModal, setShowEndModal] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [chatMsg, setChatMsg] = useState('')
  const [copied, setCopied] = useState(false)
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [aiGenerating, setAiGenerating] = useState(false)

  // Remote streams — key: socketId, value: { stream, name }
  const [remoteStreams, setRemoteStreams] = useState<Record<string, { stream: MediaStream; name: string }>>({})

  // ── Media Setup ──────────────────────────────────────────────────────────
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

  // ── Create Peer Connection ───────────────────────────────────────────────
  const createPeer = useCallback((targetSocketId: string, stream: MediaStream, initiator: boolean) => {
    const peer = new RTCPeerConnection(ICE_SERVERS)

    // Add local tracks
    stream.getTracks().forEach(track => peer.addTrack(track, stream))

    // ICE candidates bhejo
    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socketRef.current?.emit('ice-candidate', {
          candidate: e.candidate,
          to: targetSocketId,
        })
      }
    }

    // Remote stream receive karo
    peer.ontrack = (e) => {
      const remoteStream = e.streams[0]
      setRemoteStreams(prev => ({
        ...prev,
        [targetSocketId]: {
          stream: remoteStream,
          name: `User-${targetSocketId.slice(0, 4)}`,
        }
      }))
    }

    // Agar initiator hai toh offer banao
    if (initiator) {
      peer.createOffer()
        .then(offer => peer.setLocalDescription(offer))
        .then(() => {
          socketRef.current?.emit('webrtc-offer', {
            offer: peer.localDescription,
            to: targetSocketId,
          })
        })
    }

    peersRef.current[targetSocketId] = peer
    return peer
  }, [])

  // ── Socket Setup ─────────────────────────────────────────────────────────
  useEffect(() => {
    let localStream: MediaStream | null = null

    const init = async () => {
      localStream = await startMedia()
      if (!localStream) return

      const socket = io('http://localhost:5000')
      socketRef.current = socket

      socket.emit('join-room', roomId)

      // Naya user join hua — offer bhejo
      socket.on('user-joined', ({ socketId }: { socketId: string }) => {
        if (localStream) {
          createPeer(socketId, localStream, true)
        }
      })

      // Offer mila — answer bhejo
      socket.on('webrtc-offer', async ({ offer, from }: any) => {
        if (!localStream) return
        const peer = createPeer(from, localStream, false)
        await peer.setRemoteDescription(new RTCSessionDescription(offer))
        const answer = await peer.createAnswer()
        await peer.setLocalDescription(answer)
        socket.emit('webrtc-answer', { answer, to: from })
      })

      // Answer mila
      socket.on('webrtc-answer', async ({ answer, from }: any) => {
        const peer = peersRef.current[from]
        if (peer) await peer.setRemoteDescription(new RTCSessionDescription(answer))
      })

      // ICE candidate mila
      socket.on('ice-candidate', async ({ candidate, from }: any) => {
        const peer = peersRef.current[from]
        if (peer && candidate) {
          try {
            await peer.addIceCandidate(new RTCIceCandidate(candidate))
          } catch (e) { console.error('ICE error:', e) }
        }
      })

      // User left
      socket.on('user-left', ({ socketId }: { socketId: string }) => {
        if (peersRef.current[socketId]) {
          peersRef.current[socketId].close()
          delete peersRef.current[socketId]
        }
        setRemoteStreams(prev => {
          const updated = { ...prev }
          delete updated[socketId]
          return updated
        })
      })

      // Chat messages
      socket.on('receive-message', (data: any) => {
        setMessages(p => [...p, data])
      })
    }

    init()

    return () => {
      // Cleanup
      localStreamRef.current?.getTracks().forEach(t => t.stop())
      Object.values(peersRef.current).forEach(p => p.close())
      socketRef.current?.emit('leave-room', roomId)
      socketRef.current?.disconnect()
    }
  }, [])

  // Auto scroll chat
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

        // Peers ko bhi screen share track bhejo
        const videoTrack = screen.getVideoTracks()[0]
        Object.values(peersRef.current).forEach(peer => {
          const sender = peer.getSenders().find(s => s.track?.kind === 'video')
          if (sender) sender.replaceTrack(videoTrack)
        })

        setSharing(true)
        videoTrack.onended = async () => {
          await startMedia()
          setSharing(false)
        }
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

  // ── Video Grid Layout ─────────────────────────────────────────────────────
  const remoteList = Object.entries(remoteStreams)
  const totalParticipants = 1 + remoteList.length
  const gridCols = totalParticipants === 1 ? '1fr' : totalParticipants <= 2 ? '1fr 1fr' : totalParticipants <= 4 ? '1fr 1fr' : 'repeat(3, 1fr)'

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: C.bg, fontFamily: F, overflow: 'hidden' }}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
        input::placeholder { color: rgba(255,255,255,0.2); }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
      `}</style>

      {/* BG */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '20%', left: '30%', width: 500, height: 300, background: `radial-gradient(ellipse, rgba(94,106,210,0.07) 0%, transparent 70%)`, filter: 'blur(60px)' }} />
      </div>

      {/* Top Bar */}
      <div style={{ position: 'relative', zIndex: 10, padding: '0 20px', height: 52, background: 'rgba(6,6,10,0.9)', backdropFilter: 'blur(32px)', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 800, background: `linear-gradient(135deg, ${C.accentLight}, ${C.purple})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>IntellMeet</div>
          <div style={{ width: 1, height: 16, background: C.border }} />
          <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 20, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.red }} />
            <span style={{ fontSize: 10, color: C.red, fontWeight: 700 }}>LIVE</span>
          </motion.div>
          <Timer start={startTime.current} />
        </div>

        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={copyRoomId}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '5px 12px', cursor: 'pointer', color: C.muted, fontSize: 11 }}>
          {copied ? <Check size={11} color={C.green} /> : <Copy size={11} />}
          <span style={{ fontFamily: 'monospace' }}>{roomId?.slice(0, 18)}...</span>
          <span style={{ color: copied ? C.green : C.accentLight, fontWeight: 600, fontSize: 10 }}>{copied ? 'Copied!' : 'Copy ID'}</span>
        </motion.button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '4px 10px' }}>
            <Users size={11} color={C.muted} />
            <span style={{ fontSize: 11, color: C.muted }}>{totalParticipants}</span>
          </div>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={generateAI}
            style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(94,106,210,0.15))', border: '1px solid rgba(168,85,247,0.25)', borderRadius: 8, padding: '5px 12px', color: '#c4b5fd', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
            <Sparkles size={11} /> AI Summary
          </motion.button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative', zIndex: 1 }}>

        {/* Video Grid */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 14, gap: 12 }}>
          <div style={{ flex: 1, display: 'grid', gap: 10, gridTemplateColumns: gridCols, gridTemplateRows: totalParticipants <= 2 ? '1fr' : 'repeat(2, 1fr)' }}>

            {/* Local Video */}
            <VideoTile
              name={user.name} videoRef={localVideoRef}
              isLocal videoOff={videoOff} muted={muted} isActive={!muted}
            />

            {/* Remote Videos */}
            {remoteList.map(([socketId, { stream, name }]) => {
              const remoteVideoRef = (el: HTMLVideoElement | null) => {
                if (el && stream) el.srcObject = stream
              }
              return (
                <VideoTile
                  key={socketId}
                  name={name}
                  videoRef={remoteVideoRef}
                  isLocal={false}
                  videoOff={false}
                  muted={false}
                  isActive={true}
                />
              )
            })}
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '10px 20px', background: 'rgba(6,6,10,0.85)', backdropFilter: 'blur(20px)', borderRadius: 18, border: `1px solid ${C.border}`, alignSelf: 'center' }}>
            <CtrlBtn onClick={toggleMute} active={muted} danger title={muted ? 'Unmute' : 'Mute'}>
              {muted ? <MicOff size={18} color={C.red} /> : <Mic size={18} color={C.muted} />}
            </CtrlBtn>
            <CtrlBtn onClick={toggleVideo} active={videoOff} danger title={videoOff ? 'Start Cam' : 'Stop Cam'}>
              {videoOff ? <VideoOff size={18} color={C.red} /> : <Video size={18} color={C.muted} />}
            </CtrlBtn>
            <CtrlBtn onClick={toggleShare} active={sharing} title={sharing ? 'Stop Share' : 'Share Screen'}>
              {sharing ? <MonitorOff size={18} color={C.accentLight} /> : <Monitor size={18} color={C.muted} />}
            </CtrlBtn>
            <div style={{ width: 1, height: 28, background: C.border, margin: '0 6px' }} />
            <CtrlBtn onClick={() => setTab('chat')} active={tab === 'chat'} title="Chat">
              <MessageSquare size={18} color={tab === 'chat' ? C.accentLight : C.muted} />
            </CtrlBtn>
            <CtrlBtn onClick={() => setTab('people')} active={tab === 'people'} title="People">
              <Users size={18} color={tab === 'people' ? C.accentLight : C.muted} />
            </CtrlBtn>
            <CtrlBtn onClick={generateAI} active={tab === 'ai'} title="AI">
              <Sparkles size={18} color={tab === 'ai' ? C.accentLight : C.muted} />
            </CtrlBtn>
            <div style={{ width: 1, height: 28, background: C.border, margin: '0 6px' }} />
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowEndModal(true)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
                <PhoneOff size={18} color={C.red} />
              </div>
              <span style={{ fontSize: 9, color: C.red, fontFamily: F, fontWeight: 600 }}>End</span>
            </motion.button>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ width: 300, background: 'rgba(6,6,10,0.88)', backdropFilter: 'blur(24px)', borderLeft: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}` }}>
            {[
              { id: 'chat', label: 'Chat', icon: MessageSquare },
              { id: 'people', label: 'People', icon: Users },
              { id: 'ai', label: 'AI', icon: Sparkles },
            ].map(t => (
              <motion.button key={t.id} onClick={() => setTab(t.id as any)}
                style={{ flex: 1, padding: '11px 4px', background: 'none', border: 'none', borderBottom: `2px solid ${tab === t.id ? C.accentLight : 'transparent'}`, color: tab === t.id ? C.accentLight : C.muted, cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: F, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, transition: 'all 0.2s' }}>
                <t.icon size={12} />{t.label}
              </motion.button>
            ))}
          </div>

          {/* Chat */}
          {tab === 'chat' && (
            <>
              <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {messages.length === 0 && (
                  <div style={{ textAlign: 'center', paddingTop: 40 }}>
                    <MessageSquare size={24} color={C.muted} style={{ margin: '0 auto 8px' }} />
                    <p style={{ fontSize: 11, color: C.muted, fontFamily: F }}>No messages yet</p>
                  </div>
                )}
                {messages.map((m, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: m.self ? 'flex-end' : 'flex-start' }}>
                    {!m.self && <span style={{ fontSize: 9, color: C.muted, marginBottom: 3, fontFamily: F }}>{m.from}</span>}
                    <div style={{
                      padding: '8px 11px', maxWidth: '80%',
                      borderRadius: m.self ? '12px 2px 12px 12px' : '2px 12px 12px 12px',
                      background: m.self ? `linear-gradient(135deg, ${C.accent}, ${C.purple})` : C.surface,
                      border: m.self ? 'none' : `1px solid ${C.border}`,
                      fontSize: 12, color: '#fff', lineHeight: 1.4, fontFamily: F,
                    }}>{m.msg}</div>
                    <span style={{ fontSize: 9, color: C.muted, marginTop: 2, fontFamily: F }}>{m.time}</span>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div style={{ padding: '10px 12px', borderTop: `1px solid ${C.border}`, display: 'flex', gap: 7 }}>
                <input type="text" placeholder="Message..." value={chatMsg}
                  onChange={e => setChatMsg(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  style={{ flex: 1, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 9, padding: '8px 11px', color: C.text, fontSize: 12, outline: 'none', fontFamily: F }} />
                <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} onClick={sendMessage}
                  style={{ width: 34, height: 34, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`, border: 'none', cursor: 'pointer' }}>
                  <Send size={13} color="#fff" />
                </motion.button>
              </div>
            </>
          )}

          {/* People */}
          {tab === 'people' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10, fontFamily: F }}>
                In Meeting — {totalParticipants}
              </div>
              {/* Local */}
              <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 10, marginBottom: 5, background: C.surface, border: `1px solid ${C.border}` }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text, fontFamily: F }}>{user.name}</div>
                  <div style={{ fontSize: 9, color: C.muted, fontFamily: F }}><span style={{ color: C.green }}>● </span>Host · You</div>
                </div>
                <span style={{ fontSize: 9, fontWeight: 700, color: C.accentLight, background: C.accentGlow, border: `1px solid ${C.accentLight}30`, borderRadius: 4, padding: '2px 6px', fontFamily: F }}>HOST</span>
              </motion.div>
              {/* Remote */}
              {remoteList.map(([socketId, { name }], i) => (
                <motion.div key={socketId} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: (i + 1) * 0.05 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 10, marginBottom: 5, background: C.surface, border: `1px solid ${C.border}` }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    {name?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.text, fontFamily: F }}>{name}</div>
                    <div style={{ fontSize: 9, color: C.muted, fontFamily: F }}><span style={{ color: C.green }}>● </span>Participant</div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* AI */}
          {tab === 'ai' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 1.5, fontFamily: F }}>AI Assistant</div>
              {aiGenerating && (
                <div style={{ padding: '16px', background: C.accentGlow, border: `1px solid ${C.accentLight}30`, borderRadius: 10, textAlign: 'center' }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                    style={{ width: 18, height: 18, border: `2px solid ${C.accentLight}`, borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 8px' }} />
                  <div style={{ fontSize: 11, color: C.accentLight, fontFamily: F, fontWeight: 600 }}>AI analyzing...</div>
                </div>
              )}
              {aiSummary && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  style={{ padding: '12px', background: C.accentGlow, border: `1px solid ${C.accentLight}30`, borderRadius: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                    <Sparkles size={11} color={C.accentLight} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: C.accentLight, fontFamily: F }}>AI Preview</span>
                  </div>
                  <p style={{ fontSize: 11, color: C.sub, lineHeight: 1.6, fontFamily: F }}>{aiSummary}</p>
                </motion.div>
              )}
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={generateAI} disabled={aiGenerating}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: `linear-gradient(135deg, rgba(168,85,247,0.2), rgba(94,106,210,0.2))`, border: '1px solid rgba(168,85,247,0.3)', borderRadius: 9, padding: '9px', color: '#c4b5fd', fontSize: 11, fontWeight: 600, cursor: aiGenerating ? 'not-allowed' : 'pointer', fontFamily: F, opacity: aiGenerating ? 0.5 : 1 }}>
                <Sparkles size={12} />{aiGenerating ? 'Generating...' : 'Generate AI Preview'}
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* End Modal */}
      <AnimatePresence>
        {showEndModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowEndModal(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              onClick={e => e.stopPropagation()}
              style={{ background: '#0d0b14', border: `1px solid ${C.border}`, borderRadius: 20, padding: '28px', width: '100%', maxWidth: 370, boxShadow: '0 40px 80px rgba(0,0,0,0.7)', fontFamily: F }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <PhoneOff size={20} color={C.red} />
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.text, marginBottom: 6, letterSpacing: '-0.4px' }}>End Meeting?</div>
              <p style={{ fontSize: 12, color: C.muted, marginBottom: 22, lineHeight: 1.6 }}>
                {totalParticipants > 1 ? `${totalParticipants} participants will be disconnected.` : ''} Would you like to save an AI summary?
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => endMeeting(true)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`, border: 'none', borderRadius: 11, padding: '12px', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>
                  <Sparkles size={13} /> End & Save AI Summary
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => endMeeting(false)}
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.22)', borderRadius: 11, padding: '12px', color: C.red, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: F }}>
                  End Without Summary
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setShowEndModal(false)}
                  style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 11, padding: '12px', color: C.muted, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: F }}>
                  Continue Meeting
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}