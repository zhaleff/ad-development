import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { getOptimizedUrl } from '../lib/imagekit' // <--- Importas el nuevo helper

export default function RiceCard({ rice, index = 0 }) {
  const date = rice.createdAt?.toDate?.() ?? (rice.createdAt ? new Date(rice.createdAt) : null)

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.02 }}
    >
      <Link
        to={`/rice/${rice.id}`}
        className="group block bg-[#0e0e10] border border-white/5 hover:border-[#e8ff47]/30 rounded-lg overflow-hidden"
      >
        <div className="aspect-video overflow-hidden relative bg-black">
          {rice.imageUrl ? (
            <img
              src={getOptimizedUrl(rice.imageUrl, 800)} // <--- Aquí se optimiza
              alt={rice.title}
              className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-[1.03] transition-all duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-white/10 uppercase tracking-widest">
              no preview
            </div>
          )}
        </div>

        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-medium text-white truncate group-hover:text-[#e8ff47] transition-colors">
              {rice.title}
            </h3>
            <span className="text-[10px] font-mono text-white/20">v2.0</span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40 font-medium lowercase">
                by {rice.author ?? 'zhaleff'}
              </span>
            </div>
            {date && (
              <span className="text-[10px] text-white/10 italic">
                {formatDistanceToNow(date, { addSuffix: true })}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
