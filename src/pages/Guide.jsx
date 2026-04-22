import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTerminal, faWindowMaximize, faPalette, faCodeBranch, faArrowRight, faBookOpen, faPaintbrush, faGear } from '@fortawesome/free-solid-svg-icons'

const programs = [
  { name: 'Hyprland / i3 / bspwm', desc: 'Window managers (dynamic/tiling)', icon: faWindowMaximize },
  { name: 'Waybar / Polybar', desc: 'Status bars with modules', icon: faGear },
  { name: 'Alacritty / Kitty', desc: 'GPU accelerated terminals', icon: faTerminal },
  { name: 'Zsh / Fish', desc: 'Shells with powerful prompts', icon: faCodeBranch },
  { name: 'Neovim / VSCode', desc: 'Editors you rice to death', icon: faBookOpen },
  { name: 'Rofi / Wofi', desc: 'Launchers, menus, powermenu', icon: faPaintbrush },
  { name: 'Picom', desc: 'Compositor for transparency/animations', icon: faWindowMaximize },
  { name: 'swaync / dunst', desc: 'Notification daemons', icon: faGear },
]

const palettes = [
  { name: 'Nord', slug: 'nord', colors: ['#2e3440', '#3b4252', '#88c0d0', '#bf616a'] },
  { name: 'Catppuccin', slug: 'catppuccin', colors: ['#1e1e2e', '#313244', '#cba6f7', '#f38ba8'] },
  { name: 'Tokyo Night', slug: 'tokyo-night', colors: ['#1a1b26', '#32344a', '#7aa2f7', '#bb9af7'] },
  { name: 'Gruvbox', slug: 'gruvbox', colors: ['#282828', '#3c3836', '#fabd2f', '#fb4934'] },
  { name: 'Solarized', slug: 'solarized', colors: ['#002b36', '#073642', '#268bd2', '#dc322f'] },
]

export default function Guide() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-28">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-20"
      >
        <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-[#e8ff47]">Guide</span>
        <h1 className="text-4xl sm:text-6xl font-medium tracking-[-0.03em] text-white mt-4 leading-[1.1]">
          Craft your own<br />dotfiles setup
        </h1>
        <p className="text-white/40 max-w-2xl mt-6 text-base">
          A practical walkthrough to build a unique Linux rice — from zero to a reproducible, shareable configuration.
        </p>
      </motion.div>

      <div className="border-t border-white/5 mb-20" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 mb-24"
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/20 mb-2">01</p>
          <h2 className="text-2xl font-medium text-white tracking-tight">Essential programs</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {programs.map((prog, idx) => (
            <div key={prog.name} className="flex gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/8 hover:border-white/15 transition-all">
              <FontAwesomeIcon icon={prog.icon} className="w-4 h-4 text-[#e8ff47] mt-0.5" />
              <div>
                <p className="text-sm text-white/80">{prog.name}</p>
                <p className="text-[11px] text-white/30">{prog.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 mb-24"
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/20 mb-2">02</p>
          <h2 className="text-2xl font-medium text-white tracking-tight">Build your dotfiles</h2>
        </div>
        <div className="flex flex-col gap-8">
          <div className="space-y-6">
            {[
              { step: 'Choose a window manager', desc: 'Start with i3 (easy) or Hyprland (modern Wayland). Install it and set up a basic config file (~/.config/hypr/hyprland.conf or ~/.i3/config).' },
              { step: 'Add a status bar', desc: 'Waybar or Polybar – configure modules like workspace indicator, clock, volume, battery. Style with CSS (Waybar) or custom format (Polybar).' },
              { step: 'Pick a terminal & shell', desc: 'Alacritty/Kitty + Zsh with plugins (zsh-autosuggestions, syntax-highlighting). Customize prompt with Powerlevel10k or Starship.' },
              { step: 'Set a color palette', desc: 'Choose Nord, Catppuccin, or generate your own. Apply it across all apps (terminal, bar, launcher, editor). Use pywal to automate.' },
              { step: 'Add a launcher & compositor', desc: 'Rofi (themes) for app launcher, powermenu. Picom for blur, fading, rounded corners.' },
              { step: 'Version control with Git', desc: 'Store your dotfiles in ~/.dotfiles/ and symlink using GNU Stow or a bare repo. Push to GitHub for backup and sharing.' },
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[11px] text-[#e8ff47] font-mono shrink-0 mt-0.5">{i + 1}</div>
                <div>
                  <p className="text-sm text-white/80">{item.step}</p>
                  <p className="text-xs text-white/30 leading-relaxed mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 mt-2">
            <p className="text-xs text-white/40 font-mono">💡 Pro tip: Use `stow` to symlink everything. Example:</p>
            <pre className="text-[11px] text-white/30 mt-2 bg-black/50 p-3 rounded-lg overflow-x-auto">cd ~/.dotfiles &amp;&amp; stow -v nvim alacritty waybar hypr</pre>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 mb-24"
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/20 mb-2">03</p>
          <h2 className="text-2xl font-medium text-white tracking-tight">Available palettes</h2>
        </div>
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {palettes.map((pal) => (
              <Link
                key={pal.slug}
                to={`/themes?palette=${pal.slug}`}
                className="group block p-3 rounded-xl bg-white/[0.02] border border-white/8 hover:border-white/20 transition-all"
              >
                <div className="flex gap-2 mb-2">
                  {pal.colors.slice(0, 4).map((c, idx) => (
                    <div key={idx} className="w-5 h-5 rounded-full" style={{ backgroundColor: c }} />
                  ))}
                </div>
                <p className="text-sm text-white/60 group-hover:text-white/90 transition-colors">{pal.name}</p>
              </Link>
            ))}
          </div>
          <Link
            to="/themes"
            className="inline-flex items-center gap-2 text-xs text-[#e8ff47] hover:gap-3 transition-all"
          >
            Browse all themes <FontAwesomeIcon icon={faArrowRight} className="w-2.5 h-2.5" />
          </Link>
          <p className="text-xs text-white/25 mt-4 leading-relaxed">
            Each theme includes ready‑to‑use color codes (hex, rgb, hsl) and example configs for popular tools. Pick one and adapt it to your own dotfiles.
          </p>
        </div>
      </motion.div>

      <div className="border-t border-white/5 my-16" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="text-center"
      >
        <p className="text-white/40 text-sm max-w-2xl mx-auto">
          Your dotfiles are a reflection of your workflow — make them personal, keep them versioned, and share them when you're proud.
        </p>
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <Link
            to="/submit"
            className="px-5 py-2 rounded-full bg-[#e8ff47] text-black text-xs font-medium transition-all hover:scale-[1.02]"
          >
            Submit your rice
          </Link>
          <a
            href="https://wiki.archlinux.org/title/Dotfiles"
            target="_blank"
            rel="noreferrer"
            className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs hover:text-white transition-colors"
          >
            Read Arch Wiki
          </a>
        </div>
      </motion.div>
    </div>
  )
}
