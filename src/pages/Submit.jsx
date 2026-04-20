import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faPlus, faArrowRight, faScaleBalanced, faCircleNotch, faCloudArrowUp } from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { uploadImage } from '../lib/uploadcare' 
import clsx from 'clsx'

const LICENSE_OPTIONS = ['MIT', 'GPL-3.0', 'Apache-2.0', 'Unlicense', 'BSD-3-Clause', 'MPL-2.0', 'None']
const WM_OPTIONS = ['Hyprland', 'i3', 'Sway', 'MangoWM', 'bspwm', 'dwm', 'Qtile', 'AwesomeWM', 'XFCE', 'KDE', 'GNOME', 'Other']
const DISTRO_OPTIONS = ['Arch', 'NixOS', 'Debian', 'Fedora', 'Ubuntu', 'Void', 'Gentoo', 'EndeavourOS', 'openSUSE', 'Other']

function Label({ children, required }) {
  return (
    <label className="block text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-2.5">
      {children}{required && <span className="text-[#e8ff47] ml-1">*</span>}
    </label>
  )
}

function Field({ error, className, ...props }) {
  return (
    <input
      className={clsx(
        'w-full px-4 py-3 rounded-full bg-white/[0.04] border text-sm text-white placeholder:text-white/15 outline-none transition-all',
        error
          ? 'border-red-500/40 focus:border-red-500/60'
          : 'border-white/8 focus:border-[#e8ff47]/30 focus:bg-white/[0.06]',
        className
      )}
      {...props}
    />
  )
}

function Textarea({ error, ...props }) {
  return (
    <textarea
      className={clsx(
        'w-full px-4 py-3 rounded-md bg-white/[0.04] border text-sm text-white placeholder:text-white/15 outline-none transition-all resize-none',
        error
          ? 'border-red-500/40 focus:border-red-500/60'
          : 'border-white/8 focus:border-[#e8ff47]/30 focus:bg-white/[0.06]'
      )}
      {...props}
    />
  )
}

function SelectGrid({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt === value ? '' : opt)}
          className={clsx(
            'px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all',
            value === opt
              ? 'bg-[#e8ff47] border-[#e8ff47] text-black shadow-[0_0_16px_rgba(232,255,71,0.2)]'
              : 'bg-white/[0.03] border-white/8 text-white/35 hover:text-white hover:border-white/20 hover:bg-white/[0.06]'
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

export default function Submit() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [wm, setWm] = useState('')
  const [distro, setDistro] = useState('')
  const [palette, setPalette] = useState([])
  const [colorInput, setColorInput] = useState('#')
  const [license, setLicense] = useState('')
  const { register, handleSubmit, formState: { errors } } = useForm()

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxSize: 8 * 1024 * 1024,
    multiple: false,
    onDropAccepted: ([file]) => { setImageFile(file); setImagePreview(URL.createObjectURL(file)) },
    onDropRejected: () => toast.error('Image must be under 8MB.'),
  })

  const addColor = () => {
    const hex = colorInput.trim()
    if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) { toast.error('Enter a valid hex, e.g. #1e1e2e'); return }
    if (palette.includes(hex) || palette.length >= 10) return
    setPalette((p) => [...p, hex])
    setColorInput('#')
  }

  const removeColor = (c) => setPalette((p) => p.filter((x) => x !== c))

  const onSubmit = async (data) => {
    if (!imageFile) { toast.error('Please upload a screenshot.'); return }
    if (!wm || !distro) { toast.error('Please select WM and distro.'); return }
    setSubmitting(true)
    const toastId = toast.loading('Uploading to CDN...')
    
    try {
      const imageUrl = await uploadImage(imageFile)
      
      toast.loading('Saving to database...', { id: toastId })
      
      const docRef = await addDoc(collection(db, 'rices'), {
        ...data,
        wm, 
        distro, 
        palette, 
        license, 
        imageUrl, 
        status: 'pending',
        author: data.author || 'anonymous',
        views: 0, 
        stars: 0,
        createdAt: serverTimestamp(),
      })

      toast.success('Submitted successfully!', { id: toastId })
      navigate(`/rice/${docRef.id}`)
    } catch (err) {
      console.error(err)
      toast.error('Upload failed. Check your config.', { id: toastId })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-28 pb-24">
      <div className="mb-12">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#e8ff47] mb-3">New submission</p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
          Share your setup
        </h1>
        <p className="mt-2.5 text-sm text-white/35 leading-relaxed max-w-sm">
          Screenshot, config details, color palette — all in one place.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
        <div>
          <Label required>Screenshot</Label>
          <div
            {...getRootProps()}
            className={clsx(
              'relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer overflow-hidden',
              isDragActive
                ? 'border-[#e8ff47]/50 bg-[#e8ff47]/5'
                : 'border-white/8 hover:border-white/16 bg-white/[0.02]'
            )}
          >
            <input {...getInputProps()} />
            <AnimatePresence mode="wait">
              {imagePreview ? (
                <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
                  <img src={imagePreview} alt="Preview" className="w-full object-cover max-h-72 rounded-2xl" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-2xl pointer-events-none" />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(null) }}
                    className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm border border-white/15 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                  >
                    <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
                  </button>
                  <span className="absolute bottom-3 left-3 text-[10px] text-white/40 font-medium">Click to replace</span>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-14 gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <FontAwesomeIcon icon={faCloudArrowUp} className="w-4 h-4 text-white/20" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-white/30">Drop screenshot here</p>
                    <p className="text-xs text-white/15 mt-0.5">PNG, JPG, WEBP — max 8MB</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <Label required>Title</Label>
            <Field
              placeholder="Minimal Hyprland + Catppuccin"
              error={errors.title}
              {...register('title', { required: true })}
            />
            {errors.title && <p className="text-xs text-red-400 mt-1.5">Required.</p>}
          </div>
          <div>
            <Label>Author</Label>
            <Field placeholder="anonymous" {...register('author')} />
          </div>
        </div>

        <div>
          <Label>Description</Label>
          <Textarea rows={3} placeholder="What makes your setup special..." {...register('description')} />
        </div>

        <div>
          <Label required>Window manager / DE</Label>
          <SelectGrid options={WM_OPTIONS} value={wm} onChange={setWm} />
        </div>
        <div>
          <Label><FontAwesomeIcon icon={faScaleBalanced} className="mr-2 opacity-50" />License</Label>
          <SelectGrid options={LICENSE_OPTIONS} value={license} onChange={setLicense} />
        </div>
        <div>
          <Label required>Distro</Label>
          <SelectGrid options={DISTRO_OPTIONS} value={distro} onChange={setDistro} />
        </div>

        <div>
          <Label>Dotfiles URL</Label>
          <div className="relative">
            <FontAwesomeIcon icon={faGithub} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
            <Field className="pl-11" placeholder="https://github.com/you/dotfiles" {...register('githubUrl')} />
          </div>
        </div>

        <div>
          <Label>Color palette</Label>
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <div
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 rounded border border-white/15"
                style={{ backgroundColor: /^#[0-9A-Fa-f]{6}$/.test(colorInput) ? colorInput : 'transparent' }}
              />
              <Field
                className="pl-11 font-mono text-xs"
                placeholder="#1e1e2e"
                value={colorInput}
                onChange={(e) => setColorInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
              />
            </div>
            <button
              type="button"
              onClick={addColor}
              className="px-4 rounded-xl bg-white/[0.04] border border-white/8 text-white/30 hover:text-white hover:border-white/20 text-xs transition-all"
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </div>
          {palette.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {palette.map((color) => (
                <div key={color} className="flex items-center gap-1.5 pl-2 pr-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/8">
                  <div className="w-3.5 h-3.5 rounded-md border border-white/10 flex-shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-[11px] font-mono text-white/35">{color}</span>
                  <button type="button" onClick={() => removeColor(color)} className="text-white/15 hover:text-white/60 ml-0.5 transition-colors">
                    <FontAwesomeIcon icon={faXmark} className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <Label>Notes / config snippets</Label>
          <Textarea
            rows={4}
            placeholder="Shell, font, terminal, compositor settings..."
            className="font-mono text-xs"
            {...register('notes')}
          />
        </div>

        <div className="pt-1">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-full bg-[#e8ff47] hover:bg-[#d4eb30] disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold text-sm transition-all shadow-[0_0_24px_rgba(232,255,71,0.15)] hover:shadow-[0_0_32px_rgba(232,255,71,0.25)]"
          >
            {submitting
              ? <FontAwesomeIcon icon={faCircleNotch} className="animate-spin w-4 h-4" />
              : <><span>Submit rice</span><FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5" /></>
            }
          </button>
          <p className="text-center text-[11px] text-white/15 mt-3">
            Your submission will be reviewed before appearing publicly.
          </p>
        </div>
      </form>
    </div>
  )
}
