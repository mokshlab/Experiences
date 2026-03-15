'use client'

import { useEffect, useRef, useState } from 'react'
import { FiMaximize, FiMinimize, FiCalendar, FiZap, FiClock } from 'react-icons/fi'
import Link from 'next/link'

export default function TimelineRiverFlow({ links }) {
  const canvasRef = useRef(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [hoveredLink, setHoveredLink] = useState(null)
  const [isGuideOpen, setIsGuideOpen] = useState(false)
  const [dimensions, setDimensions] = useState({ width: 0, height: 800 })
  const particlesRef = useRef([])
  const animationRef = useRef(null)

  // Calculate river data from links
  const riverData = links.map((link, index) => {
    const experiences = link.experienceLinks || []
    const dates = experiences.map(ec => new Date(ec.experience.date))
    const minDate = dates.length > 0 ? new Date(Math.min(...dates)) : new Date()
    const maxDate = dates.length > 0 ? new Date(Math.max(...dates)) : new Date()
    
    return {
      id: link.id,
      name: link.name,
      color: link.color,
      count: experiences.length,
      minDate,
      maxDate,
      experiences: experiences.sort((a, b) => 
        new Date(a.experience.date) - new Date(b.experience.date)
      ),
      yPosition: 100 + (index * 150), // Vertical position
    }
  })

  // Calculate timeline range - extend by 1 year before and after
  const allDates = riverData.flatMap(r => [r.minDate, r.maxDate])
  const dataMinDate = allDates.length > 0 ? new Date(Math.min(...allDates)) : new Date()
  const dataMaxDate = allDates.length > 0 ? new Date(Math.max(...allDates)) : new Date()
  
  // Extend timeline: 1 year before earliest experience
  const globalMinDate = new Date(dataMinDate)
  globalMinDate.setFullYear(globalMinDate.getFullYear() - 1)
  
  // Extend timeline: 1 year after current year
  const currentYear = new Date().getFullYear()
  const globalMaxDate = new Date(currentYear + 1, 11, 31) // Dec 31 of next year
  
  const timeRange = globalMaxDate - globalMinDate || 1

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const updateDimensions = () => {
      const container = canvas.parentElement
      if (container) {
        setDimensions({
          width: container.clientWidth,
          height: isFullscreen ? window.innerHeight : Math.max(800, riverData.length * 150 + 200)
        })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)

    return () => window.removeEventListener('resize', updateDimensions)
  }, [isFullscreen, riverData.length])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = dimensions.width
    canvas.height = dimensions.height
    const ctx = canvas.getContext('2d')

    // Initialize particles for each river
    if (particlesRef.current.length === 0) {
      riverData.forEach((river, riverIndex) => {
        const particleCount = Math.max(20, river.count * 3)
        for (let i = 0; i < particleCount; i++) {
          particlesRef.current.push({
            riverId: river.id,
            riverIndex,
            x: Math.random() * dimensions.width,
            y: river.yPosition + (Math.random() - 0.5) * 40,
            baseY: river.yPosition,
            speed: 0.5 + Math.random() * 1.5,
            size: 1 + Math.random() * 3,
            opacity: 0.3 + Math.random() * 0.7,
            phase: Math.random() * Math.PI * 2,
          })
        }
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const isDark = document.documentElement.classList.contains('dark')

      // Draw time axis
      const leftMargin = 150
      const rightMargin = 50
      const timelineWidth = dimensions.width - leftMargin - rightMargin

      // Draw year markers (use muted color depending on theme)
      ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
      ctx.fillStyle = isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)'
      ctx.font = '12px monospace'
      ctx.textAlign = 'center'

      const yearStart = globalMinDate.getFullYear()
      const yearEnd = globalMaxDate.getFullYear()
      
      for (let year = yearStart; year <= yearEnd + 1; year++) {
        const yearDate = new Date(year, 0, 1)
        const x = leftMargin + ((yearDate - globalMinDate) / timeRange) * timelineWidth
        
        if (x >= leftMargin && x <= dimensions.width - rightMargin) {
          ctx.beginPath()
          ctx.moveTo(x, 50)
          ctx.lineTo(x, dimensions.height - 50)
          ctx.stroke()
          
          ctx.fillText(year.toString(), x, 40)
        }
      }

      // Draw rivers
      riverData.forEach((river, index) => {
        const startX = leftMargin + ((river.minDate - globalMinDate) / timeRange) * timelineWidth
        const endX = leftMargin + ((river.maxDate - globalMinDate) / timeRange) * timelineWidth
        const y = river.yPosition
        const width = Math.max(100, endX - startX)
        
        const isHovered = hoveredLink === river.id

        // River background glow - convert hex to rgba for canvas alpha handling
        const hex = river.color || '#8b5cf6'
        const rgb = hexToRgb(hex)
        const alphaMid = isHovered ? 0.25 : 0.12
        const gradient = ctx.createLinearGradient(startX, y - 40, startX, y + 40)
        gradient.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},0)`)
        gradient.addColorStop(0.5, `rgba(${rgb.r},${rgb.g},${rgb.b},${alphaMid})`)
        gradient.addColorStop(1, `rgba(${rgb.r},${rgb.g},${rgb.b},0)`)

        ctx.fillStyle = gradient
        ctx.fillRect(startX, y - 40, width, 80)

        // River outline with wave effect
        ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${isHovered ? 0.8 : 0.5})`
        ctx.lineWidth = isHovered ? 3 : 2
        ctx.beginPath()
        
        // Top wave
        for (let x = startX; x <= endX; x += 5) {
          const waveY = y - 30 + Math.sin((x / 20) + Date.now() / 1000) * 5
          if (x === startX) {
            ctx.moveTo(x, waveY)
          } else {
            ctx.lineTo(x, waveY)
          }
        }
        
        // Bottom wave
        for (let x = endX; x >= startX; x -= 5) {
          const waveY = y + 30 + Math.sin((x / 20) + Date.now() / 1000 + Math.PI) * 5
          ctx.lineTo(x, waveY)
        }
        
        ctx.closePath()
        ctx.stroke()

        // River label box (theme-aware)
        const labelBoxHeight = 50
        ctx.fillStyle = isDark ? 'rgba(10,10,10,0.7)' : 'rgba(255,255,255,0.95)'
        ctx.fillRect(10, y - labelBoxHeight/2, leftMargin - 20, labelBoxHeight)

        ctx.fillStyle = isDark ? '#fff' : '#111'
        ctx.font = 'bold 12px sans-serif'
        ctx.textAlign = 'left'
        
        // Word wrap for long names
        const maxWidth = leftMargin - 30
        const words = river.name.split(' ')
        let line = ''
        let lineY = y - 8
        const lineHeight = 14
        
        for (let i = 0; i < words.length; i++) {
          const testLine = line + words[i] + ' '
          const metrics = ctx.measureText(testLine)
          
          if (metrics.width > maxWidth && i > 0) {
            ctx.fillText(line, 20, lineY)
            line = words[i] + ' '
            lineY += lineHeight
          } else {
            line = testLine
          }
        }
        ctx.fillText(line, 20, lineY)

        // Experience markers
        river.experiences.forEach((ec) => {
          const expDate = new Date(ec.experience.date)
          const x = leftMargin + ((expDate - globalMinDate) / timeRange) * timelineWidth
          
          // Marker circle
          ctx.beginPath()
          ctx.arc(x, y, isHovered ? 6 : 4, 0, Math.PI * 2)
          ctx.fillStyle = river.color
          ctx.fill()
          
          // Pulse ring
          const pulseSize = 8 + Math.sin(Date.now() / 500 + (ec.experience.id || '').length) * 2
          ctx.beginPath()
          ctx.arc(x, y, pulseSize, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.35)`
          ctx.lineWidth = 2
          ctx.stroke()
        })
      })

      // Animate and draw particles
      particlesRef.current.forEach((particle) => {
        const river = riverData[particle.riverIndex]
        if (!river) return

        // Update particle position
        particle.x += particle.speed
        particle.phase += 0.05
        particle.y = particle.baseY + Math.sin(particle.phase) * 15

        // Reset particle if it goes off screen
        if (particle.x > dimensions.width) {
          particle.x = 0
          particle.y = river.yPosition + (Math.random() - 0.5) * 40
          particle.baseY = river.yPosition
        }

        // Draw particle (use rgba from hex for safe alpha handling)
        const isHovered = hoveredLink === river.id
        const particleRgb = hexToRgb(river.color || '#8b5cf6')
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${particleRgb.r},${particleRgb.g},${particleRgb.b},${Math.max(0.05, particle.opacity * (isHovered ? 1 : 0.5))})`
        ctx.fill()
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [dimensions, riverData, hoveredLink, globalMinDate, globalMaxDate, timeRange])

  // Reset particles when river data changes to keep visual in sync
  useEffect(() => {
    particlesRef.current = []
  }, [riverData.length])

  // Helper: convert hex color to rgb object
  function hexToRgb(hex) {
    try {
      if (!hex) return { r: 139, g: 92, b: 246 }
      const h = hex.replace('#', '')
      const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h
      const bigint = parseInt(full, 16)
      if (Number.isNaN(bigint)) return { r: 139, g: 92, b: 246 }
      const r = (bigint >> 16) & 255
      const g = (bigint >> 8) & 255
      const b = bigint & 255
      return { r, g, b }
    } catch (e) {
      return { r: 139, g: 92, b: 246 }
    }
  }

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check if clicked on a river
    riverData.forEach((river) => {
      if (y >= river.yPosition - 40 && y <= river.yPosition + 40) {
        window.location.href = `/links/${river.id}`
      }
    })
  }

  const handleCanvasMouseMove = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const y = e.clientY - rect.top

    let hovered = null
    riverData.forEach((river) => {
      if (y >= river.yPosition - 40 && y <= river.yPosition + 40) {
        hovered = river.id
      }
    })

    setHoveredLink(hovered)
    canvas.style.cursor = hovered ? 'pointer' : 'default'
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const containerClass = isFullscreen
    ? 'fixed inset-0 z-50 bg-slate-900'
    : 'relative w-full rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-sm overflow-hidden'

  return (
    <div className={containerClass}>
      {/* Controls - TOP RIGHT CORNER */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={toggleFullscreen}
          className="p-3 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-sm border border-white/20 shadow-lg"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <FiMinimize size={20} /> : <FiMaximize size={20} />}
        </button>
      </div>

      {/* Info Panel */}
      {hoveredLink && !isGuideOpen && (
        <div className="absolute top-4 right-4 z-10 bg-slate-900/90 backdrop-blur-md border border-white/20 rounded-xl p-4 max-w-xs mr-16">
          {riverData.find(r => r.id === hoveredLink) && (
            <>
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-3 h-3 rounded-full animate-pulse"
                  style={{ backgroundColor: riverData.find(r => r.id === hoveredLink).color }}
                />
                <h3 className="text-white font-semibold text-lg">
                  {riverData.find(r => r.id === hoveredLink).name}
                </h3>
              </div>
              
              {/* Stats Row */}
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <FiZap className="text-purple-400" size={16} />
                  <div>
                    <div className="text-xs text-gray-500">Experiences</div>
                    <div className="text-white font-semibold">{riverData.find(r => r.id === hoveredLink).count}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FiClock className="text-blue-400" size={16} />
                  <div>
                    <div className="text-xs text-gray-500">Duration</div>
                    <div className="text-white font-semibold">
                      {(() => {
                        const minDate = riverData.find(r => r.id === hoveredLink).minDate
                        const maxDate = riverData.find(r => r.id === hoveredLink).maxDate
                        const years = maxDate.getFullYear() - minDate.getFullYear()
                        const months = maxDate.getMonth() - minDate.getMonth()
                        const totalMonths = years * 12 + months
                        
                        if (totalMonths < 12) {
                          return `${totalMonths}m`
                        } else {
                          const y = Math.floor(totalMonths / 12)
                          const m = totalMonths % 12
                          return m > 0 ? `${y}y ${m}m` : `${y}y`
                        }
                      })()}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Date Range */}
              <div className="flex items-center gap-2 text-sm text-gray-400 bg-white/5 rounded-lg p-2">
                <FiCalendar size={14} />
                <span>
                  {(() => {
                    const minDate = riverData.find(r => r.id === hoveredLink).minDate
                    const maxDate = riverData.find(r => r.id === hoveredLink).maxDate
                    const formatDate = (date) => {
                      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                      return `${months[date.getMonth()]} ${date.getFullYear()}`
                    }
                    return `${formatDate(minDate)} → ${formatDate(maxDate)}`
                  })()}
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Guide Button - Left Side */}
      <div
        onMouseEnter={() => setIsGuideOpen(true)}
        onMouseLeave={() => setIsGuideOpen(false)}
        className="absolute top-4 left-4 z-10"
      >
        <button
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ${
            isGuideOpen
              ? 'bg-purple-600 text-white'
              : 'bg-slate-800/90 backdrop-blur-md border border-white/20 text-white hover:bg-slate-700/90'
          }`}
        >
          <span className="text-lg">🗺️</span>
          <span>GUIDE</span>
        </button>

        {/* Guide Panel - Opens on Hover */}
        {isGuideOpen && (
          <div className="absolute top-14 left-0 w-64 bg-slate-800/95 backdrop-blur-md border border-white/20 rounded-lg p-4 shadow-2xl animate-fadeInUp">
            <div className="space-y-3">
              {/* Memory River */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-4 bg-gradient-to-r from-purple-500 to-purple-500/30 rounded mt-1 flex-shrink-0" />
                <div>
                  <div className="text-white font-medium text-sm">Memory River</div>
                  <div className="text-gray-400 text-xs">Each shows time span</div>
                </div>
              </div>

              {/* Experience Marker */}
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-4">
                  <div className="w-3 h-3 rounded-full bg-purple-400 flex-shrink-0" />
                </div>
                <div>
                  <div className="text-white font-medium text-sm">Experience Marker</div>
                  <div className="text-gray-400 text-xs">Hover for details</div>
                </div>
              </div>

              {/* Flowing Energy */}
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-start w-8 h-4 gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400/80 flex-shrink-0" />
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400/60 flex-shrink-0" />
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400/40 flex-shrink-0" />
                </div>
                <div>
                  <div className="text-white font-medium text-sm">Flowing Energy</div>
                  <div className="text-gray-400 text-xs">Active memories</div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-white/10 my-3"></div>

              {/* Interactions */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-gray-300">
                  <span className="w-4 text-center">🖱️</span>
                  <span>Hover river or dots for info</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <span className="w-4 text-center">👆</span>
                  <span>Click river to view timeline</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <span className="w-4 text-center">⛶</span>
                  <span>Top-right for fullscreen</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        className="w-full"
        style={{ height: dimensions.height }}
      />
    </div>
  )
}
