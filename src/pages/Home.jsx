import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { supabase } from '../lib/supabase'
import Typewriter from 'typewriter-effect'
import RiceGrid from '../components/RiceGrid'

export default function Home() {
  const [total, setTotal] = useState(null)

  useEffect(() => {
    supabase
      .from('rices')
      .select('*', { count: 'exact', head: true })
      .then(({ count }) => setTotal(count))
      .catch(() => {})
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <section className="relative pt-40 pb-24 flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="flex-1 z-10">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-light text-white">
            Archive your <br />
            <span className="text-[#e8ff47] flex gap-3">
              <Typewriter options={{ strings: ['desktop', 'linux', 'workflow', 'dotfiles'], autoStart: true, loop: true, wrapperClassName: "text-[#e8ff47]", cursorClassName: "text-white/20" }} />
            </span>
          </h1>
          <p className="mt-8 text-base md:text-lg text-white/40 max-w-lg leading-relaxed font-medium">
            The central hub for meticulously crafted desktop environments. Discover configurations, color palettes, and scripts.
          </p>
          {total !== null && (
            <p className="mt-2 text-sm text-white/20">{total.toLocaleString()} setups indexed</p>
          )}
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/submit" className="flex items-center gap-2 px-7 py-3 rounded-full bg-[#e8ff47] hover:bg-white text-black text-sm font-medium">
              Submit rice
              <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5" />
            </Link>
            <a href="https://reddit.com/r/unixporn" target="_blank" rel="noreferrer" className="flex items-center px-7 py-3 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 text-sm font-medium">
              r/unixporn
            </a>
          </div>
        </div>
      </section>

      <section className="pb-32 border-t border-white/5 pt-12">
        <RiceGrid />
      </section>
    </div>
  )
}
