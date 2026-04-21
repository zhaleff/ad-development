import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import Typewriter from 'typewriter-effect'

export default function Themes() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-32 pb-32">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-28"
      >
        <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-[#e8ff47] mb-6">Themes</p>
        <div className="flex flex-col lg:flex-row lg:items-end gap-12">
          <div className="flex-1">
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-medium tracking-[-0.05em] leading-[0.9] text-white mb-0">
              Themes
            </h1>
            <div className="text-6xl sm:text-7xl lg:text-8xl font-medium tracking-[-0.05em] leading-[0.9] text-[#e8ff47] mt-1">
              <Typewriter
                options={{
                  strings: ['Linux', 'Grubvox.', 'Tokyo Night.', 'Rose Pine.', 'Catppuccin.'],
                  autoStart: true,
                  loop: true,
                  delay: 65,
                  deleteSpeed: 45,
                  wrapperClassName: 'font-medium',
                  cursorClassName: 'text-[#e8ff47]',
                }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="border-t border-white/5 mb-28" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
      >
        <div>
          <p className="text-xl font-medium text-white mb-1">More sections coming soon</p>
          <p className="text-sm text-white/25 italic">The project is currently under active development.</p>
        </div>
      </motion.div>
    </div>
  )
}

