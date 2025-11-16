"use client"

export default function PuzzleLoader({ fullScreen = false, variant = "default", message = "Loading..." }) {
  const containerClass = fullScreen
    ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm"
    : "flex flex-col items-center justify-center py-12"

  // Color schemes for different variants
  const colors = {
    default: {
      row1: ["from-emerald-400 to-emerald-600", "from-green-400 to-green-600", "from-teal-400 to-teal-600", "from-cyan-400 to-cyan-600"],
      row2: ["from-green-500 to-emerald-700", "from-emerald-500 to-teal-700", "from-teal-500 to-cyan-700", "from-cyan-500 to-blue-700"],
      row3: ["from-teal-600 to-emerald-800", "from-cyan-600 to-teal-800", "from-blue-600 to-cyan-800", "from-indigo-600 to-blue-800"],
      row4: ["from-cyan-700 to-teal-900", "from-blue-700 to-cyan-900", "from-indigo-700 to-blue-900", "from-purple-700 to-indigo-900"]
    },
    delete: {
      row1: ["from-orange-400 to-orange-600", "from-red-400 to-red-600", "from-pink-400 to-pink-600", "from-rose-400 to-rose-600"],
      row2: ["from-orange-500 to-red-700", "from-red-500 to-pink-700", "from-pink-500 to-rose-700", "from-rose-500 to-red-700"],
      row3: ["from-red-600 to-orange-800", "from-pink-600 to-red-800", "from-rose-600 to-pink-800", "from-red-600 to-rose-800"],
      row4: ["from-orange-700 to-red-900", "from-red-700 to-pink-900", "from-pink-700 to-rose-900", "from-rose-700 to-red-900"]
    }
  }

  const currentColors = colors[variant] || colors.default

  return (
    <div className={containerClass}>
      <div className="relative">
        <div className="puzzle-grid">
          {/* Row 1 */}
          <div className="puzzle-piece piece-1">
            <div className={`piece-content bg-gradient-to-br ${currentColors.row1[0]}`}></div>
          </div>
          <div className="puzzle-piece piece-2">
            <div className={`piece-content bg-gradient-to-br ${currentColors.row1[1]}`}></div>
          </div>
          <div className="puzzle-piece piece-3">
            <div className={`piece-content bg-gradient-to-br ${currentColors.row1[2]}`}></div>
          </div>
          <div className="puzzle-piece piece-4">
            <div className={`piece-content bg-gradient-to-br ${currentColors.row1[3]}`}></div>
          </div>

          {/* Row 2 */}
          <div className="puzzle-piece piece-5">
            <div className={`piece-content bg-gradient-to-br ${currentColors.row2[0]}`}></div>
          </div>
          <div className="puzzle-piece piece-6">
            <div className={`piece-content bg-gradient-to-br ${currentColors.row2[1]}`}></div>
          </div>
          <div className="puzzle-piece piece-7">
            <div className={`piece-content bg-gradient-to-br ${currentColors.row2[2]}`}></div>
          </div>
          <div className="puzzle-piece piece-8">
            <div className={`piece-content bg-gradient-to-br ${currentColors.row2[3]}`}></div>
          </div>

          {/* Row 3 */}
          <div className="puzzle-piece piece-9">
            <div className={`piece-content bg-gradient-to-br ${currentColors.row3[0]}`}></div>
          </div>
          <div className="puzzle-piece piece-10">
            <div className={`piece-content bg-gradient-to-br ${currentColors.row3[1]}`}></div>
          </div>
          <div className="puzzle-piece piece-11">
            <div className={`piece-content bg-gradient-to-br ${currentColors.row3[2]}`}></div>
          </div>
          <div className="puzzle-piece piece-12">
            <div className={`piece-content bg-gradient-to-br ${currentColors.row3[3]}`}></div>
          </div>

          {/* Row 4 */}
          <div className="puzzle-piece piece-13">
            <div className={`piece-content bg-gradient-to-br ${currentColors.row4[0]}`}></div>
          </div>
          <div className="puzzle-piece piece-14">
            <div className={`piece-content bg-gradient-to-br ${currentColors.row4[1]}`}></div>
          </div>
          <div className="puzzle-piece piece-15">
            <div className={`piece-content bg-gradient-to-br ${currentColors.row4[2]}`}></div>
          </div>
          <div className="puzzle-piece piece-16">
            <div className={`piece-content bg-gradient-to-br ${currentColors.row4[3]}`}></div>
          </div>
        </div>

        <div className="puzzle-complete-icon">
          <div className="text-6xl">🧩</div>
        </div>
      </div>

      <div className="mt-8 text-center animate-fade-in">
        <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
          {message}
        </p>
      </div>

      <style jsx>{`
        .puzzle-grid {
          display: grid;
          grid-template-columns: repeat(4, 70px);
          grid-template-rows: repeat(4, 70px);
          gap: 3px;
          padding: 20px;
          background: rgba(16, 185, 129, 0.1);
          border-radius: 20px;
        }

        .puzzle-piece {
          opacity: 0;
          transform: scale(0) rotate(180deg);
          animation: pieceSnap 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }

        .piece-content {
          width: 100%;
          height: 100%;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .piece-1 { animation-delay: 0.1s; }
        .piece-2 { animation-delay: 0.15s; }
        .piece-3 { animation-delay: 0.2s; }
        .piece-4 { animation-delay: 0.25s; }
        .piece-5 { animation-delay: 0.3s; }
        .piece-6 { animation-delay: 0.35s; }
        .piece-7 { animation-delay: 0.4s; }
        .piece-8 { animation-delay: 0.45s; }
        .piece-9 { animation-delay: 0.5s; }
        .piece-10 { animation-delay: 0.55s; }
        .piece-11 { animation-delay: 0.6s; }
        .piece-12 { animation-delay: 0.65s; }
        .piece-13 { animation-delay: 0.7s; }
        .piece-14 { animation-delay: 0.75s; }
        .piece-15 { animation-delay: 0.8s; }
        .piece-16 { animation-delay: 0.85s; }

        @keyframes pieceSnap {
          0% {
            opacity: 0;
            transform: scale(0) rotate(180deg);
          }
          70% {
            opacity: 1;
            transform: scale(1.15) rotate(-10deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }

        .puzzle-complete-icon {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          opacity: 0;
          animation: iconPop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
          animation-delay: 1.5s;
        }

        @keyframes iconPop {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0) rotate(-180deg);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.8s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
