import { Link } from 'react-router-dom'
import { faCode } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeart } from '@fortawesome/free-solid-svg-icons'
import { faGithub, faRedditAlien } from '@fortawesome/free-brands-svg-icons'
import logo from '../assets/blacknode.png'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-24 border-t border-white/5 bg-[#0a0a0c] py-12">
      <div className="max-w-7xl mx-auto px-6">

        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">

          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <img
                src={logo}
                alt="BlackNode"
                className="h-9 w-auto opacity-90 group-hover:opacity-100 transition-all"
              />
              <div className="absolute -inset-1 bg-[#e8ff47]/10 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-all"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-wide  text-white  leading-none">
                Awesome<span className="text-[#e8ff47]">Dotfiles</span>
              </span>
            </div>
          </Link>

          <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-xs font-bold uppercase tracking-widest text-white/30">
            <li><Link to="/" className="hover:text-[#e8ff47] transition-colors">Gallery</Link></li>
            <li><Link to="/submit" className=" hover:text-[#e8ff47]">Guide</Link></li>
            <li><Link to="/submit" className=" hover:text-[#e8ff47]">Themes</Link></li>
            <li><Link to="/about" className=" transition-colors">About</Link></li>
            <li><Link to="/submit" className="text-[#e8ff47]/60 hover:text-[#e8ff47]">Submit rice</Link></li>
          </ul>

        </div>

        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/5 to-transparent mb-8"></div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <a href="https://github.com/zhaleff/Awesome-Dotfiles" target="_blank" rel="noreferrer" className="text-white/20 hover:text-white text-xl">
              <FontAwesomeIcon icon={faGithub} />
            </a>
            <a href="https://reddit.com/r/unixporn" target="_blank" rel="noreferrer" className="text-white/20 hover:text-white text-xl">
              <FontAwesomeIcon icon={faRedditAlien} />
            </a>
            <a href="https://github.com/zhaleff/ad-development" target="_blank" rel="noreferrer" className="text-white/20 hover:text-white text-xl">
              <FontAwesomeIcon icon={faCode} />
            </a>
            <span className="text-[10px] font-mono text-white/10 ml-2 tracking-tighter">
              Copyright (c) {year} zhaleff. All Rights Reserved..
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
