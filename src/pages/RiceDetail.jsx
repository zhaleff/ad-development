import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faEye, faCopy, faCheck, faThumbsUp, faThumbsDown, faShareAlt, faDownload, faPaperPlane } from '@fortawesome/free-solid-svg-icons'
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
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/40 hover:text-white transition-colors"
    >
      <FontAwesomeIcon icon={copied ? faCheck : faCopy} className={clsx('w-3 h-3', copied && 'text-[#e8ff47]')} />
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function Comments({ riceId }) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [body, setBody] = useState('')
  const [author, setAuthor] = useState('')
  const [submitting, setSubmitting] = useState(false)
  useEffect(() => {
    fetchComments()
  }, [riceId])
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
    <div className="flex flex-col gap-6">
      <p className="text-[11px] font-medium uppercase tracking-widest text-white/20">
        Comments {!loading && comments.length > 0 && <span className="text-white/10">· {comments.length}</span>}
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Leave a comment..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/8 text-sm text-white placeholder:text-white/15 outline-none transition-all resize-none focus:border-[#e8ff47]/30 focus:bg-white/[0.05]"
        />
        <div className="flex items-center gap-3">
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Your name (optional)"
            className="flex-1 px-4 py-2.5 rounded-full bg-white/[0.03] border border-white/8 text-sm text-white placeholder:text-white/15 outline-none transition-all focus:border-[#e8ff47]/30 focus:bg-white/[0.05]"
          />
          <button
            type="submit"
            disabled={submitting || !body.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#e8ff47] hover:bg-[#d4eb30] disabled:opacity-30 disabled:cursor-not-allowed text-black text-xs font-semibold transition-all"
          >
            <FontAwesomeIcon icon={submitting ? faPaperPlane : faPaperPlane} className="w-3 h-3" />
            Post
          </button>
        </div>
      </form>
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-4 h-4 rounded-full border-2 border-white/10 border-t-white/30 animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-white/15 text-center py-6">No comments yet. Be the first.</p>
      ) : (
        <div className="flex flex-col gap-4">
          <AnimatePresence>
            {comments.map((c) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-[9px] font-semibold text-[#e8ff47]/70 flex-shrink-0 mt-0.5">
                  {c.author?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-white/60">{c.author || 'anonymous'}</span>
                    <span className="text-[10px] text-white/20">
                      {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-white/45 leading-relaxed">{c.body}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
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
        const { data, error } = await supabase
          .from('rices')
          .select('*')
          .eq('id', id)
          .single()

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
          const { data: existing } = await supabase
            .from('votes')
            .select('vote_type')
            .eq('rice_id', id)
            .eq('vote_ip', ipHash)
            .maybeSingle()
          if (existing) {
            setVote(existing.vote_type)
            localStorage.setItem(`vote_${id}`, existing.vote_type)
          }
        }
      } catch (err) {
        console.error('Error fetching rice:', err)
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
        if (type === 'up') newLikes--
        else newDislikes--
        localStorage.removeItem(localKey)
        setVote(null)
        await supabase.from('votes').delete().eq('rice_id', id).eq('vote_ip', ipHash)
        toast.success('Vote removed')
      } else if (localVote) {
        if (localVote === 'up') newLikes--
        else newDislikes--
        if (type === 'up') newLikes++
        else newDislikes++
        localStorage.setItem(localKey, type)
        setVote(type)
        await supabase.from('votes').update({ vote_type: type }).eq('rice_id', id).eq('vote_ip', ipHash)
        toast.success('Vote changed!')
      } else {
        if (type === 'up') newLikes++
        else newDislikes++
        localStorage.setItem(localKey, type)
        setVote(type)
        await supabase.from('votes').insert({ rice_id: id, vote_ip: ipHash, vote_type: type })
        toast.success('Voted!')
      }

      await supabase.from('rices').update({ likes: Math.max(0, newLikes), dislikes: Math.max(0, newDislikes) }).eq('id', id)
      setRice(prev => prev ? ({ ...prev, likes: Math.max(0, newLikes), dislikes: Math.max(0, newDislikes) }) : null)
    } catch (err) {
      console.error('Vote error:', err)
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

    img.onerror = () => {
      toast.error('Could not load image.')
      setBannerLoading(false)
    }
    img.onload = () => {
      const ir = img.width / img.height
      const cr = 1200 / 630
      let sx = 0, sy = 0, sw = img.width, sh = img.height
      if (ir > cr) { sw = img.height * cr; sx = (img.width - sw) / 2 }
      else { sh = img.width / cr; sy = (img.height - sh) / 2 }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, 1200, 630)

      const vg = ctx.createLinearGradient(0, 0, 0, 630)
      vg.addColorStop(0, 'rgba(0,0,0,0.1)')
      vg.addColorStop(0.5, 'rgba(0,0,0,0.2)')
      vg.addColorStop(1, 'rgba(0,0,0,0.92)')
      ctx.fillStyle = vg
      ctx.fillRect(0, 0, 1200, 630)

      ctx.fillStyle = 'rgba(8,8,8,0.78)'
      roundRect(ctx, 0, 468, 1200, 162, 0)
      ctx.fill()

      ctx.fillStyle = '#e8ff47'
      ctx.fillRect(0, 468, 1200, 2.5)

      const palette = Array.isArray(rice.palette) ? rice.palette : []
      if (palette.length > 0) {
        const dotR = 9
        const gap = 8
        let dotX = 60 + dotR
        palette.slice(0, 10).forEach((color) => {
          ctx.beginPath()
          ctx.arc(dotX, 500, dotR, 0, Math.PI * 2)
          ctx.fillStyle = color
          ctx.fill()
          ctx.strokeStyle = 'rgba(255,255,255,0.12)'
          ctx.lineWidth = 1
          ctx.stroke()
          dotX += dotR * 2 + gap
        })
      }
      ctx.textAlign = 'left'
      ctx.fillStyle = '#ffffff'
      ctx.font = '600 46px -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif'
      const titleY = palette.length > 0 ? 560 : 545
      const maxTitleW = 860
      let titleText = rice.title
      while (ctx.measureText(titleText).width > maxTitleW && titleText.length > 0) {
        titleText = titleText.slice(0, -1)
      }
      if (titleText !== rice.title) titleText += '…'
      ctx.fillText(titleText, 60, titleY)
      ctx.fillStyle = 'rgba(255,255,255,0.38)'
      ctx.font = '400 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif'
      const parts = [
        rice.author ? `by ${rice.author}` : 'anonymous',
        rice.wm,
        rice.distro,
      ].filter(Boolean)
      ctx.fillText(parts.join('  ·  '), 60, titleY + 32)

      // — site label derecha
      ctx.textAlign = 'right'
      ctx.fillStyle = '#e8ff47'
      ctx.font = '500 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif'
      ctx.fillText('awesome-dotfiles.vercel.app', 1140, titleY + 32)

      if (rice.wm) {
        ctx.font = '500 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif'
        const tw = ctx.measureText(rice.wm).width
        const bpad = 14
        const bw = tw + bpad * 2
        const bh = 30
        const bx = 1140 - bw
        const by = 32
        roundRect(ctx, bx, by, bw, bh, 6)
        ctx.fillStyle = 'rgba(232,255,71,0.12)'
        ctx.fill()
        ctx.strokeStyle = 'rgba(232,255,71,0.5)'
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.fillStyle = '#e8ff47'
        ctx.textAlign = 'center'
        ctx.fillText(rice.wm, bx + bw / 2, by + 20)
      }

      // — views badge arriba izquierda
      ctx.textAlign = 'left'
      ctx.fillStyle = 'rgba(255,255,255,0.25)'
      ctx.font = '400 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif'
      ctx.fillText(`${rice.views ?? 0} views  ·  ${rice.likes ?? 0} likes`, 60, 56)

      const slug = (rice.title || 'banner').replace(/[^a-z0-9]/gi, '-').toLowerCase()
      const link = document.createElement('a')
      link.download = `${slug}-banner.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      setBannerLoading(false)
      toast.success('Banner downloaded!')
    }
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
        if (type === 'up') newLikes--
        else newDislikes--
        localStorage.removeItem(localKey)
        setVote(null)
        await supabase.from('votes').delete().eq('rice_id', id).eq('vote_ip', ipHash)
        toast.success('Vote removed')
      } else if (localVote) {
        if (localVote === 'up') newLikes--
        else newDislikes--
        if (type === 'up') newLikes++
        else newDislikes++
        localStorage.setItem(localKey, type)
        setVote(type)
        await supabase.from('votes').update({ vote_type: type }).eq('rice_id', id).eq('vote_ip', ipHash)
        toast.success('Vote changed!')
      } else {
        if (type === 'up') newLikes++
        else newDislikes++
        localStorage.setItem(localKey, type)
        setVote(type)
        await supabase.from('votes').insert({ rice_id: id, vote_ip: ipHash, vote_type: type })
        toast.success('Voted!')
      }

      await supabase.from('rices').update({ likes: Math.max(0, newLikes), dislikes: Math.max(0, newDislikes) }).eq('id', id)
      setRice(prev => prev ? ({ ...prev, likes: Math.max(0, newLikes), dislikes: Math.max(0, newDislikes) }) : null)
    } catch (err) {
      console.error('Vote error:', err)
      toast.error('Failed to vote')
    } finally {
      setVoting(false)
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
      <p className="text-6xl font-medium text-white/5">404</p>
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
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.4 }}
    className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-28"
  >
    <div className="mb-8">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-xs text-white/30 hover:text-white transition-colors">
        <FontAwesomeIcon icon={faArrowLeft} className="w-3 h-3" />
        Back
      </button>
    </div>

    {rice.image_url && (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="rounded-2xl overflow-hidden border border-white/8 mb-10 bg-black"
      >
        <img src={rice.image_url} alt={rice.title} className="w-full object-cover max-h-[560px]" />
      </motion.div>
    )}

    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1 }}
      className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 mb-8"
    >
      <div>
        <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-white leading-snug">{rice.title}</h1>
        <div className="flex items-center gap-3 mt-2.5">
          <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-medium text-[#e8ff47] uppercase">
            {rice.author?.[0] ?? '?'}
          </div>
          <span className="text-sm text-white/40">{rice.author ?? 'anonymous'}</span>
          {createdDate && <span className="text-xs text-white/20">{formatDistanceToNow(createdDate, { addSuffix: true })}</span>}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 pt-1 flex-wrap justify-end">
        <div className="flex items-center gap-1.5 text-xs text-white/20">
          <FontAwesomeIcon icon={faEye} className="w-3 h-3" />
          {rice.views ?? 0}
        </div>
        <button
          onClick={downloadBanner}
          disabled={bannerLoading}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white/40 hover:text-white hover:border-white/20 disabled:opacity-40 transition-all"
        >
          <FontAwesomeIcon icon={faDownload} className="w-3 h-3" />
          {bannerLoading ? 'Generating...' : 'Banner'}
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white/40 hover:text-white hover:border-white/20 transition-all"
        >
          <FontAwesomeIcon icon={faShareAlt} className="w-3 h-3" />
          Share
        </button>
      </div>
    </motion.div>

    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="flex items-center gap-3 mb-8">
      <button
        onClick={() => handleVote('up')}
        disabled={voting}
        className={clsx(
          'group relative flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200',
          vote === 'up'
            ? 'bg-[#e8ff47] text-black shadow-[0_0_20px_rgba(232,255,71,0.25)]'
            : 'bg-white/[0.04] border border-white/8 text-white/30 hover:text-white/70 hover:border-white/15 hover:bg-white/[0.07]'
        )}
      >
        <FontAwesomeIcon icon={faThumbsUp} className={clsx('w-3.5 h-3.5 transition-transform duration-150', vote === 'up' ? 'scale-110' : 'group-hover:scale-110')} />
        <span className="tabular-nums">{likes}</span>
      </button>
      <button
        onClick={() => handleVote('down')}
        disabled={voting}
        className={clsx(
          'group relative flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200',
          vote === 'down'
            ? 'bg-white/[0.06] border border-red-500/30 text-red-400'
            : 'bg-white/[0.04] border border-white/8 text-white/30 hover:text-white/50 hover:border-white/15 hover:bg-white/[0.07]'
        )}
      >
        <FontAwesomeIcon icon={faThumbsDown} className={clsx('w-3.5 h-3.5 transition-transform duration-150', vote === 'down' ? 'scale-110' : 'group-hover:scale-110')} />
        <span className="tabular-nums">{dislikes}</span>
      </button>
      {likePercent !== null && (
        <div className="flex items-center gap-3 ml-1">
          <div className="w-px h-5 bg-white/8" />
          <div className="flex flex-col gap-1">
            <div className="w-28 h-0.5 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${likePercent}%` }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
                className="h-full bg-[#e8ff47] rounded-full"
              />
            </div>
            <span className="text-[10px] text-white/20 tabular-nums">{likePercent}% · {total} votes</span>
          </div>
        </div>
      )}
    </motion.div>

    <div className="border-t border-white/5 mb-10" />

    <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-12">
      <div className="flex flex-col gap-10">
        {rice.description && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <p className="text-[11px] font-medium uppercase tracking-widest text-white/20 mb-3">About</p>
            <p className="text-sm text-white/50 leading-relaxed">{rice.description}</p>
          </motion.div>
        )}

        {rice.notes && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-medium uppercase tracking-widest text-white/20">Notes</p>
              <CopyButton text={rice.notes} />
            </div>
            <div className="rounded-xl bg-black border border-white/8 p-4 overflow-x-auto">
              <pre className="text-xs font-mono text-white/40 leading-relaxed whitespace-pre-wrap break-words">{rice.notes}</pre>
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
          <Comments riceId={id} />
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-col gap-4">
        <p className="text-[11px] font-medium uppercase tracking-widest text-white/20">Specs</p>
        <div className="rounded-xl border border-white/8 overflow-hidden">
          {[
            { label: 'WM / DE', value: rice.wm },
            { label: 'Palette', value: rice.palette?.length > 0 ? `${rice.palette.length} colors` : 'None' },
            { label: 'Distro', value: rice.distro },
            { label: 'License', value: rice.license },
            { label: 'Date', value: createdDate ? format(createdDate, 'MMM d, yyyy') : null },
          ].filter(r => r.value).map(({ label, value }, i, arr) => (
            <div key={label} className={clsx('px-4 py-3 flex flex-col gap-0.5', i < arr.length - 1 && 'border-b border-white/5')}>
              <span className="text-[9px] text-white/20 uppercase tracking-wider">{label}</span>
              <span className="text-xs text-white/70 font-medium">{value}</span>
            </div>
          ))}
        </div>

        {rice.palette?.length > 0 && (
          <div className="rounded-xl border border-white/8 p-4">
            <p className="text-[9px] text-white/20 uppercase tracking-wider mb-3">Colors</p>
            <div className="flex flex-wrap gap-1.5">
              {rice.palette.map((color, i) => (
                <div
                  key={i}
                  title={color}
                  className="w-6 h-6 rounded-md border border-white/10 cursor-pointer hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => { navigator.clipboard.writeText(color); toast.success(color) }}
                />
              ))}
            </div>
          </div>
        )}

        {rice.github_url && (
          <a
            href={rice.github_url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#e8ff47] hover:bg-[#d4eb30] text-black text-xs font-medium transition-colors"
          >
            <FontAwesomeIcon icon={faGithub} className="w-3.5 h-3.5" />
            View dotfiles
          </a>
        )}
      </motion.div>
    </div>
  </motion.div>
)
}
