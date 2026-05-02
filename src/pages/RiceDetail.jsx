import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowLeft, faEye, faCopy, faCheck, faThumbsUp, faThumbsDown,
  faShareAlt, faDownload, faPaperPlane, faExpand, faXmark, faCode
} from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { supabase } from '../lib/supabase'
import { formatDistanceToNow, format } from 'date-fns'
import clsx from 'clsx'
import toast from 'react-hot-toast'

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const handle = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handle}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white/5 border border-white/8 text-[11px] text-white/30 hover:text-white/60 transition-all"
    >
      <FontAwesomeIcon icon={copied ? faCheck : faCopy} className={clsx('w-3 h-3', copied && 'text-[#e8ff47]')} />
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function Lightbox({ src, alt, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 cursor-zoom-out"
      >
        <motion.img
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          src={src}
          alt={alt}
          className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/8 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/12 transition-all"
        >
          <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  )
}

function Comments({ riceId }) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [body, setBody] = useState('')
  const [author, setAuthor] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchComments() }, [riceId])

  async function fetchComments() {
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('rice_id', riceId)
      .order('created_at', { ascending: false })
    setComments(data ?? [])
    setLoading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!body.trim()) return
    setSubmitting(true)
    try {
      const { error } = await supabase.from('comments').insert({
        rice_id: riceId,
        author: author.trim() || 'anonymous',
        body: body.trim(),
      })
      if (error) throw error
      setBody('')
      setAuthor('')
      toast.success('Comment posted!')
      fetchComments()
    } catch {
      toast.error('Failed to post comment.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-mono uppercase tracking-widest text-white/20">Comments</span>
        {!loading && comments.length > 0 && (
          <span className="px-1.5 py-0.5 rounded-md bg-white/5 text-[10px] text-white/20 font-mono">{comments.length}</span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a comment..."
          rows={3}
          className="w-full px-4 pt-4 pb-2 bg-transparent text-sm text-white/70 placeholder:text-white/15 outline-none resize-none"
        />
        <div className="flex items-center gap-2 px-4 pb-3 pt-1 border-t border-white/5">
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Name (optional)"
            className="flex-1 bg-transparent text-xs text-white/40 placeholder:text-white/15 outline-none"
          />
          <button
            type="submit"
            disabled={submitting || !body.trim()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#e8ff47] hover:bg-[#d4eb30] disabled:opacity-25 disabled:cursor-not-allowed text-black text-[11px] font-semibold transition-all"
          >
            <FontAwesomeIcon icon={faPaperPlane} className="w-2.5 h-2.5" />
            Post
          </button>
        </div>
      </form>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-4 h-4 rounded-full border-2 border-white/10 border-t-white/30 animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-white/15 text-center py-6 font-mono">no comments yet</p>
      ) : (
        <div className="flex flex-col divide-y divide-white/[0.04]">
          <AnimatePresence>
            {comments.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex gap-3 py-4"
              >
                <div className="w-8 h-8 rounded-lg bg-[#e8ff47]/8 border border-[#e8ff47]/15 flex items-center justify-center text-[10px] font-bold text-[#e8ff47] flex-shrink-0">
                  {c.author?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-white/60">{c.author || 'anonymous'}</span>
                    <span className="text-[10px] text-white/20 font-mono">
                      {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-white/40 leading-relaxed break-words">{c.body}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

export default function RiceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [rice, setRice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [vote, setVote] = useState(null)
  const [voting, setVoting] = useState(true)
  const [bannerLoading, setBannerLoading] = useState(false)
  const [lightbox, setLightbox] = useState(false)

  async function getIpHash() {
    try {
      const res = await fetch('https://ifconfig.me/ip')
      const ip = await res.text()
      if (!ip) return 'unknown'
      const msgBuffer = new TextEncoder().encode(ip.trim())
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    } catch {
      return 'unknown'
    }
  }

  useEffect(() => {
    async function fetchRice() {
      setLoading(true)
      try {
        const { data, error } = await supabase.from('rices').select('*').eq('id', id).single()
        if (error || !data) { setNotFound(true); setLoading(false); return }
        setRice(data)
        const viewed = localStorage.getItem(`viewed_${id}`)
        if (!viewed) {
          await supabase.rpc('increment_views', { row_id: id })
          localStorage.setItem(`viewed_${id}`, '1')
        }
        const localVote = localStorage.getItem(`vote_${id}`)
        if (localVote) {
          setVote(localVote)
        } else {
          const ipHash = await getIpHash()
          const { data: existing } = await supabase.from('votes').select('vote_type').eq('rice_id', id).eq('vote_ip', ipHash).maybeSingle()
          if (existing) {
            setVote(existing.vote_type)
            localStorage.setItem(`vote_${id}`, existing.vote_type)
          }
        }
      } catch {
        setNotFound(true)
      }
      setLoading(false)
      setVoting(false)
    }
    fetchRice()
  }, [id])

  async function handleVote(type) {
    if (voting) return
    setVoting(true)
    try {
      const localKey = `vote_${id}`
      const localVote = localStorage.getItem(localKey)
      const ipHash = await getIpHash()
      let newLikes = rice.likes ?? 0
      let newDislikes = rice.dislikes ?? 0
      if (localVote === type) {
        if (type === 'up') newLikes--; else newDislikes--
        localStorage.removeItem(localKey); setVote(null)
        await supabase.from('votes').delete().eq('rice_id', id).eq('vote_ip', ipHash)
        toast.success('Vote removed')
      } else if (localVote) {
        if (localVote === 'up') newLikes--; else newDislikes--
        if (type === 'up') newLikes++; else newDislikes++
        localStorage.setItem(localKey, type); setVote(type)
        await supabase.from('votes').update({ vote_type: type }).eq('rice_id', id).eq('vote_ip', ipHash)
        toast.success('Vote changed!')
      } else {
        if (type === 'up') newLikes++; else newDislikes++
        localStorage.setItem(localKey, type); setVote(type)
        await supabase.from('votes').insert({ rice_id: id, vote_ip: ipHash, vote_type: type })
        toast.success('Voted!')
      }
      await supabase.from('rices').update({ likes: Math.max(0, newLikes), dislikes: Math.max(0, newDislikes) }).eq('id', id)
      setRice(prev => prev ? ({ ...prev, likes: Math.max(0, newLikes), dislikes: Math.max(0, newDislikes) }) : null)
    } catch {
      toast.error('Failed to vote')
    } finally {
      setVoting(false)
    }
  }

  async function downloadBanner() {
    if (bannerLoading) return
    setBannerLoading(true)
    const canvas = document.createElement('canvas')
    canvas.width = 1200
    canvas.height = 630
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = rice.image_url
    img.onerror = () => { toast.error('Could not load image.'); setBannerLoading(false) }
    img.onload = () => {
      // bg image cover
      const ir = img.width / img.height
      const cr = 1200 / 630
      let sx = 0, sy = 0, sw = img.width, sh = img.height
      if (ir > cr) { sw = img.height * cr; sx = (img.width - sw) / 2 }
      else { sh = img.width / cr; sy = (img.height - sh) / 2 }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, 1200, 630)

      // dark overlay
      const vg = ctx.createLinearGradient(0, 0, 0, 630)
      vg.addColorStop(0, 'rgba(0,0,0,0.15)')
      vg.addColorStop(0.45, 'rgba(0,0,0,0.3)')
      vg.addColorStop(1, 'rgba(0,0,0,0.88)')
      ctx.fillStyle = vg
      ctx.fillRect(0, 0, 1200, 630)

      // bottom panel
      ctx.fillStyle = 'rgba(6,6,6,0.82)'
      ctx.fillRect(0, 470, 1200, 160)

      // accent line
      const accentGrad = ctx.createLinearGradient(0, 470, 1200, 470)
      accentGrad.addColorStop(0, '#e8ff47')
      accentGrad.addColorStop(0.5, '#b8ff00')
      accentGrad.addColorStop(1, 'rgba(232,255,71,0)')
      ctx.fillStyle = accentGrad
      ctx.fillRect(0, 470, 1200, 2)

      // palette dots
      const palette = Array.isArray(rice.palette) ? rice.palette : []
      if (palette.length > 0) {
        let dotX = 48
        palette.slice(0, 8).forEach((color) => {
          ctx.beginPath()
          ctx.arc(dotX, 502, 8, 0, Math.PI * 2)
          ctx.fillStyle = color
          ctx.fill()
          dotX += 24
        })
      }

      // wm badge top-left
      if (rice.wm) {
        ctx.font = '500 13px ui-monospace, monospace'
        const tw = ctx.measureText(rice.wm).width
        const bw = tw + 24, bh = 26, bx = 48, by = 28
        roundRect(ctx, bx, by, bw, bh, 5)
        ctx.fillStyle = 'rgba(232,255,71,0.1)'
        ctx.fill()
        ctx.strokeStyle = 'rgba(232,255,71,0.4)'
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.fillStyle = '#e8ff47'
        ctx.textAlign = 'left'
        ctx.fillText(rice.wm, bx + 12, by + 17)
      }

      // distro badge
      if (rice.distro) {
        ctx.font = '500 13px ui-monospace, monospace'
        const wmW = rice.wm ? ctx.measureText(rice.wm).width + 24 + 8 : 0
        const tw = ctx.measureText(rice.distro).width
        const bw = tw + 24, bh = 26, bx = 48 + wmW, by = 28
        roundRect(ctx, bx, by, bw, bh, 5)
        ctx.fillStyle = 'rgba(255,255,255,0.05)'
        ctx.fill()
        ctx.strokeStyle = 'rgba(255,255,255,0.12)'
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.fillText(rice.distro, bx + 12, by + 17)
      }

      // title
      ctx.textAlign = 'left'
      ctx.font = '700 48px ui-sans-serif, system-ui'
      ctx.fillStyle = '#ffffff'
      const maxW = 900
      let title = rice.title ?? ''
      while (ctx.measureText(title).width > maxW && title.length > 0) title = title.slice(0, -1)
      if (title !== rice.title) title += '…'
      const titleY = palette.length > 0 ? 562 : 548
      ctx.fillText(title, 48, titleY)

      // author + stats
      ctx.font = '400 15px ui-sans-serif, system-ui'
      ctx.fillStyle = 'rgba(255,255,255,0.35)'
      const meta = [
        rice.author ? `by ${rice.author}` : 'anonymous',
        `${rice.views ?? 0} views`,
        `${rice.likes ?? 0} likes`,
      ].join('  ·  ')
      ctx.fillText(meta, 48, titleY + 28)

      // site watermark
      ctx.textAlign = 'right'
      ctx.font = '500 13px ui-monospace, monospace'
      ctx.fillStyle = 'rgba(232,255,71,0.5)'
      ctx.fillText('awesome-dotfiles.vercel.app', 1152, titleY + 28)

      const slug = (rice.title || 'banner').replace(/[^a-z0-9]/gi, '-').toLowerCase()
      const link = document.createElement('a')
      link.download = `${slug}-banner.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      setBannerLoading(false)
      toast.success('Banner downloaded!')
    }
  }

  async function handleShare() {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: rice.title, text: `Check out ${rice.title} by ${rice.author || 'anonymous'}`, url })
      } catch (err) {
        if (err.name !== 'AbortError') { await navigator.clipboard.writeText(url); toast.success('Link copied') }
      }
    } else {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied')
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-5 h-5 rounded-full border-2 border-white/10 border-t-[#e8ff47] animate-spin" />
    </div>
  )

  if (notFound) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-6">
      <p className="text-6xl font-medium text-white/5 font-mono">404</p>
      <p className="text-sm text-white/30">This setup doesn't exist or was removed.</p>
      <button onClick={() => navigate('/')} className="text-xs text-[#e8ff47] hover:underline">← Back to gallery</button>
    </div>
  )

  const createdDate = rice.created_at ? new Date(rice.created_at) : null
  const likes = rice.likes ?? 0
  const dislikes = rice.dislikes ?? 0
  const total = likes + dislikes
  const likePercent = total > 0 ? Math.round((likes / total) * 100) : null

  return (
    <>
      {lightbox && <Lightbox src={rice.image_url} alt={rice.title} onClose={() => setLightbox(false)} />}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-24"
      >
        <div className="mb-6">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-xs text-white/25 hover:text-white/60 transition-colors font-mono">
            <FontAwesomeIcon icon={faArrowLeft} className="w-3 h-3" />
            back
          </button>
        </div>

        {/* Hero image */}
        {rice.image_url && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="relative rounded-xl overflow-hidden border border-white/8 mb-8 bg-black group cursor-zoom-in"
            onClick={() => setLightbox(true)}
          >
            <img
              src={rice.image_url}
              alt={rice.title}
              className="w-full object-cover max-h-[520px] transition-transform duration-700 group-hover:scale-[1.01]"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-10 h-10 rounded-full bg-black/60 border border-white/20 backdrop-blur-sm flex items-center justify-center">
                <FontAwesomeIcon icon={faExpand} className="w-4 h-4 text-white/80" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Title + actions */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6"
        >
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white leading-tight">{rice.title}</h1>
            <div className="flex items-center gap-2.5 mt-2 flex-wrap">
              <div className="w-6 h-6 rounded-md bg-[#e8ff47]/10 border border-[#e8ff47]/20 flex items-center justify-center text-[9px] font-bold text-[#e8ff47]">
                {rice.author?.[0]?.toUpperCase() ?? '?'}
              </div>
              <span className="text-sm text-white/40">{rice.author ?? 'anonymous'}</span>
              <span className="text-white/10">·</span>
              {createdDate && (
                <span className="text-xs text-white/20 font-mono">
                  {formatDistanceToNow(createdDate, { addSuffix: true })}
                </span>
              )}
              <span className="text-white/10">·</span>
              <span className="flex items-center gap-1 text-xs text-white/20 font-mono">
                <FontAwesomeIcon icon={faEye} className="w-2.5 h-2.5" />
                {rice.views ?? 0}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
            <button
              onClick={downloadBanner}
              disabled={bannerLoading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/8 text-[11px] text-white/30 hover:text-white/60 hover:border-white/15 disabled:opacity-30 transition-all"
            >
              <FontAwesomeIcon icon={faDownload} className="w-3 h-3" />
              {bannerLoading ? 'wait...' : 'Banner'}
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/8 text-[11px] text-white/30 hover:text-white/60 hover:border-white/15 transition-all"
            >
              <FontAwesomeIcon icon={faShareAlt} className="w-3 h-3" />
              Share
            </button>
          </div>
        </motion.div>

        {/* Vote bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.12 }}
          className="flex items-center gap-3 mb-8 flex-wrap"
        >
          <button
            onClick={() => handleVote('up')}
            disabled={voting}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              vote === 'up'
                ? 'bg-[#e8ff47] text-black'
                : 'bg-white/[0.04] border border-white/8 text-white/30 hover:text-white/60 hover:border-white/15'
            )}
          >
            <FontAwesomeIcon icon={faThumbsUp} className="w-3.5 h-3.5" />
            <span className="font-mono tabular-nums text-xs">{likes}</span>
          </button>
          <button
            onClick={() => handleVote('down')}
            disabled={voting}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              vote === 'down'
                ? 'bg-white/[0.06] border border-red-500/30 text-red-400'
                : 'bg-white/[0.04] border border-white/8 text-white/30 hover:text-white/50 hover:border-white/15'
            )}
          >
            <FontAwesomeIcon icon={faThumbsDown} className="w-3.5 h-3.5" />
            <span className="font-mono tabular-nums text-xs">{dislikes}</span>
          </button>

          {likePercent !== null && (
            <div className="flex items-center gap-3">
              <div className="w-px h-4 bg-white/8" />
              <div className="flex items-center gap-2">
                <div className="w-20 sm:w-28 h-0.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${likePercent}%` }}
                    transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
                    className="h-full bg-[#e8ff47] rounded-full"
                  />
                </div>
                <span className="text-[10px] text-white/20 font-mono">{likePercent}%</span>
              </div>
            </div>
          )}
        </motion.div>

        <div className="border-t border-white/[0.06] mb-8" />

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-10 lg:gap-14">
          <div className="flex flex-col gap-10 min-w-0">
            {rice.description && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
                <p className="text-[10px] font-mono uppercase tracking-widest text-white/20 mb-3">About</p>
                <p className="text-sm text-white/45 leading-relaxed">{rice.description}</p>
              </motion.div>
            )}

            {rice.notes && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-white/20">Notes</p>
                  <CopyButton text={rice.notes} />
                </div>
                <div className="rounded-xl bg-black/60 border border-white/[0.06] p-4 overflow-x-auto">
                  <pre className="text-xs font-mono text-white/35 leading-relaxed whitespace-pre-wrap break-words">{rice.notes}</pre>
                </div>
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
              <Comments riceId={id} />
            </motion.div>
          </div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.18 }}
            className="flex flex-col gap-4"
          >
            {/* Specs */}
            <div className="rounded-xl border border-white/8 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-white/[0.05]">
                <p className="text-[10px] font-mono uppercase tracking-widest text-white/20">Specs</p>
              </div>
              {[
                { label: 'WM / DE', value: rice.wm },
                { label: 'Distro', value: rice.distro },
                { label: 'License', value: rice.license },
                { label: 'Date', value: createdDate ? format(createdDate, 'MMM d, yyyy') : null },
              ].filter(r => r.value).map(({ label, value }, i, arr) => (
                <div key={label} className={clsx('px-4 py-3 flex flex-col gap-0.5', i < arr.length - 1 && 'border-b border-white/[0.04]')}>
                  <span className="text-[9px] font-mono text-white/20 uppercase tracking-wider">{label}</span>
                  <span className="text-xs text-white/60 font-medium">{value}</span>
                </div>
              ))}
            </div>

            {/* Palette */}
            {rice.palette?.length > 0 && (
              <div className="rounded-xl border border-white/8 p-4">
                <p className="text-[9px] font-mono uppercase tracking-widest text-white/20 mb-3">Palette</p>
                <div className="flex flex-wrap gap-2">
                  {rice.palette.map((color, i) => (
                    <button
                      key={i}
                      title={color}
                      className="w-7 h-7 rounded-md border border-white/10 hover:scale-110 hover:border-white/25 transition-all"
                      style={{ backgroundColor: color }}
                      onClick={() => { navigator.clipboard.writeText(color); toast.success(color) }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* GitHub */}
            {rice.github_url && (
              <a
                href={rice.github_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#e8ff47] hover:bg-[#d4eb30] text-black text-xs font-semibold transition-colors"
              >
                <FontAwesomeIcon icon={faGithub} className="w-3.5 h-3.5" />
                View dotfiles
              </a>
            )}
          </motion.div>
        </div>
      </motion.div>
    </>
  )
}
