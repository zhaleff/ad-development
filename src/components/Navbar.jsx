import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faXmark, faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons'
import logo from '../assets/blacknode.png'
import clsx from 'clsx'

const navLinks = [
  { label: 'Gallery', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Themes', to: '/themes' },
  { label: 'Wiki', to: '/wiki' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0c] border-b border-white/5">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <img src={logo} alt="logo" className="h-7 w-auto object-contain" />
            <span
              className="text-white font-semibold text-[15px] tracking-tight"
              style={{ fontFamily: "'Lato', sans-serif" }}
            >
              Awesome <span className="text-[#e8ff47]">Dotfiles</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navLinks.map(({ label, to }) => (
              <NavLink
                key={label}
                to={to}
                end
                className={({ isActive }) =>
                  clsx(
                    'px-4 py-1.5 text-sm font-medium tracking-tight rounded-full',
                    isActive
                      ? 'bg-[#e8ff47] text-black'
                      : 'text-white/40 hover:text-white hover:bg-white/5'
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <Link
              to="/submit"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#e8ff47] hover:bg-[#d4eb30] text-black font-medium text-sm"
            >
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="w-2.5 h-2.5" />
              Share your build
            </Link>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-white/10 text-white/40 hover:text-white transition-all"
            >
              <FontAwesomeIcon icon={mobileOpen ? faXmark : faBars} className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="fixed top-14 left-0 right-0 z-40 bg-[#0a0a0c] border-b border-white/5 md:hidden"
          >
            <nav className="max-w-screen-xl mx-auto px-4 py-3 flex flex-col gap-1">
              {navLinks.map(({ label, to }) => (
                <NavLink
                  key={label}
                  to={to}
                  end
                  className={({ isActive }) =>
                    clsx(
                      'px-3 py-2 rounded-full font-black',
                      isActive
                        ? 'bg-[#e8ff47] text-black'
                        : 'text-white/40 hover:text-white hover:bg-white/5'
                    )
                  }
                >
                  {label}
                </NavLink>
              ))}

              <div className="pt-2 mt-1 border-t border-white/5">
                <Link
                  to="/submit"
                  className="flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded bg-[#e8ff47] hover:bg-[#d4eb30] text-black text-sm font-bold tracking-wide"
                >
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="w-2.5 h-2.5" />
                  Share your build
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
