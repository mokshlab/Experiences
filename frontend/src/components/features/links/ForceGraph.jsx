'use client'

import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { CATEGORY_CONFIG } from '@/lib/constants'
import { FiMaximize2, FiMinimize2, FiZoomIn, FiZoomOut, FiRefreshCw } from 'react-icons/fi'

// Category → color mapping
const CATEGORY_COLORS = {
  CAREER: '#8b5cf6',
  EDUCATION: '#3b82f6',
  TRAVEL: '#06b6d4',
  RELATIONSHIP: '#ec4899',
  HEALTH: '#10b981',
  CREATIVE: '#f59e0b',
  FINANCIAL: '#84cc16',
  SOCIAL: '#a855f7',
  FAMILY: '#f43f5e',
  SPIRITUAL: '#6366f1',
  ADVENTURE: '#14b8a6',
  FOOD: '#f97316',
  VOLUNTEER: '#22d3ee',
  TECHNOLOGY: '#0ea5e9',
  PERSONAL_GROWTH: '#d946ef',
  ACHIEVEMENT: '#eab308',
}

const DEFAULT_COLOR = '#8b5cf6'

/**
 * Simple force simulation engine (no D3 dependency).
 * Implements: center gravity, node repulsion (Coulomb), edge spring (Hooke).
 */
class ForceSimulation {
  constructor(nodes, edges, width, height) {
    this.width = width
    this.height = height
    this.nodes = nodes.map((n, i) => ({
      ...n,
      x: width / 2 + (Math.random() - 0.5) * width * 0.5,
      y: height / 2 + (Math.random() - 0.5) * height * 0.5,
      vx: 0,
      vy: 0,
      radius: Math.min(6 + (n.edgeCount || 0) * 2, 20),
    }))
    this.edges = edges
    this.alpha = 1
    this.alphaDecay = 0.02
    this.alphaMin = 0.001
  }

  tick() {
    if (this.alpha < this.alphaMin) return false
    this.alpha *= (1 - this.alphaDecay)

    const nodes = this.nodes
    const cx = this.width / 2
    const cy = this.height / 2

    // Center gravity
    for (const node of nodes) {
      node.vx += (cx - node.x) * 0.01 * this.alpha
      node.vy += (cy - node.y) * 0.01 * this.alpha
    }

    // Node repulsion (simplified O(n^2))
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        let dx = nodes[j].x - nodes[i].x
        let dy = nodes[j].y - nodes[i].y
        let dist = Math.sqrt(dx * dx + dy * dy) || 1
        let force = -300 * this.alpha / (dist * dist)
        let fx = dx / dist * force
        let fy = dy / dist * force
        nodes[i].vx += fx
        nodes[i].vy += fy
        nodes[j].vx -= fx
        nodes[j].vy -= fy
      }
    }

    // Edge springs
    for (const edge of this.edges) {
      const source = nodes.find(n => n.id === edge.source)
      const target = nodes.find(n => n.id === edge.target)
      if (!source || !target) continue

      let dx = target.x - source.x
      let dy = target.y - source.y
      let dist = Math.sqrt(dx * dx + dy * dy) || 1
      let force = (dist - 100) * 0.05 * this.alpha
      let fx = dx / dist * force
      let fy = dy / dist * force
      source.vx += fx
      source.vy += fy
      target.vx -= fx
      target.vy -= fy
    }

    // Apply velocity with damping
    for (const node of nodes) {
      node.vx *= 0.6
      node.vy *= 0.6
      node.x += node.vx
      node.y += node.vy
      // Boundary constraints
      const pad = node.radius + 5
      node.x = Math.max(pad, Math.min(this.width - pad, node.x))
      node.y = Math.max(pad, Math.min(this.height - pad, node.y))
    }

    return true
  }

  reheat() {
    this.alpha = 0.8
  }
}

export default function ForceGraph({ links }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const simRef = useRef(null)
  const animRef = useRef(null)
  const router = useRouter()

  const [hoveredNode, setHoveredNode] = useState(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 })
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(null)
  const [panning, setPanning] = useState(false)
  const panStart = useRef({ x: 0, y: 0 })

  // Build graph data from links
  const { nodes, edges, linkMap } = useMemo(() => {
    const nodeMap = new Map()
    const edges = []
    const linkMap = new Map()

    for (const link of links) {
      const expLinks = link.experienceLinks || []
      const expIds = expLinks.map(el => el.experience?.id || el.experienceId).filter(Boolean)

      for (const el of expLinks) {
        const exp = el.experience
        if (!exp) continue
        if (!nodeMap.has(exp.id)) {
          nodeMap.set(exp.id, {
            id: exp.id,
            title: exp.title,
            category: exp.category,
            date: exp.date,
            mood: exp.mood,
            color: CATEGORY_COLORS[exp.category] || DEFAULT_COLOR,
            edgeCount: 0,
          })
        }
      }

      // Create edges between all experiences in this link
      for (let i = 0; i < expIds.length; i++) {
        for (let j = i + 1; j < expIds.length; j++) {
          const edgeKey = [expIds[i], expIds[j]].sort().join('-')
          if (!linkMap.has(edgeKey)) {
            linkMap.set(edgeKey, {
              source: expIds[i],
              target: expIds[j],
              linkName: link.name,
              linkColor: link.color || '#8b5cf6',
            })
            edges.push(linkMap.get(edgeKey))

            const srcNode = nodeMap.get(expIds[i])
            const tgtNode = nodeMap.get(expIds[j])
            if (srcNode) srcNode.edgeCount++
            if (tgtNode) tgtNode.edgeCount++
          }
        }
      }
    }

    return { nodes: Array.from(nodeMap.values()), edges, linkMap }
  }, [links])

  // Resize observer
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        if (width > 0 && height > 0) {
          setDimensions({ width: Math.floor(width), height: Math.floor(height) })
        }
      }
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [isFullscreen])

  // Initialize simulation when data or dimensions change
  useEffect(() => {
    if (nodes.length === 0) return

    simRef.current = new ForceSimulation(nodes, edges, dimensions.width, dimensions.height)

    const animate = () => {
      const running = simRef.current?.tick()
      draw()
      if (running) {
        animRef.current = requestAnimationFrame(animate)
      }
    }
    animate()

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [nodes, edges, dimensions])

  // Draw function
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const sim = simRef.current
    if (!canvas || !sim) return

    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    canvas.width = dimensions.width * dpr
    canvas.height = dimensions.height * dpr
    ctx.scale(dpr, dpr)

    ctx.clearRect(0, 0, dimensions.width, dimensions.height)
    ctx.save()

    // Apply zoom and pan
    ctx.translate(pan.x, pan.y)
    ctx.translate(dimensions.width / 2, dimensions.height / 2)
    ctx.scale(zoom, zoom)
    ctx.translate(-dimensions.width / 2, -dimensions.height / 2)

    const isDark = document.documentElement.classList.contains('dark')

    // Draw edges
    for (const edge of sim.edges) {
      const source = sim.nodes.find(n => n.id === edge.source)
      const target = sim.nodes.find(n => n.id === edge.target)
      if (!source || !target) continue

      ctx.beginPath()
      ctx.moveTo(source.x, source.y)
      ctx.lineTo(target.x, target.y)
      ctx.strokeStyle = isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.15)'
      ctx.lineWidth = 1.5
      ctx.stroke()
    }

    // Draw nodes
    for (const node of sim.nodes) {
      const isHovered = hoveredNode?.id === node.id
      const r = node.radius * (isHovered ? 1.4 : 1)

      // Glow
      if (isHovered) {
        ctx.beginPath()
        ctx.arc(node.x, node.y, r + 8, 0, Math.PI * 2)
        ctx.fillStyle = node.color + '30'
        ctx.fill()
      }

      // Node circle
      ctx.beginPath()
      ctx.arc(node.x, node.y, r, 0, Math.PI * 2)
      ctx.fillStyle = node.color
      ctx.fill()
      ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Category icon/letter
      ctx.fillStyle = '#fff'
      ctx.font = `bold ${Math.max(r * 0.9, 8)}px system-ui`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const label = (CATEGORY_CONFIG[node.category]?.label || node.category || '?')[0]
      ctx.fillText(label, node.x, node.y)
    }

    // Draw hovered node info
    if (hoveredNode) {
      const node = sim.nodes.find(n => n.id === hoveredNode.id)
      if (node) {
        const tooltipW = 220
        const tooltipH = 60
        let tx = node.x + node.radius + 12
        let ty = node.y - tooltipH / 2
        
        // Keep tooltip in bounds
        if (tx + tooltipW > dimensions.width) tx = node.x - node.radius - tooltipW - 12
        if (ty < 5) ty = 5
        if (ty + tooltipH > dimensions.height - 5) ty = dimensions.height - tooltipH - 5

        // Tooltip background
        ctx.fillStyle = isDark ? 'rgba(24, 24, 27, 0.95)' : 'rgba(255, 255, 255, 0.95)'
        ctx.strokeStyle = isDark ? 'rgba(63, 63, 70, 0.5)' : 'rgba(229, 231, 235, 0.8)'
        ctx.lineWidth = 1
        roundRect(ctx, tx, ty, tooltipW, tooltipH, 8)
        ctx.fill()
        ctx.stroke()

        // Title
        ctx.fillStyle = isDark ? '#fff' : '#111'
        ctx.font = 'bold 12px system-ui'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'top'
        const title = node.title.length > 28 ? node.title.slice(0, 28) + '...' : node.title
        ctx.fillText(title, tx + 10, ty + 10)

        // Category
        ctx.fillStyle = isDark ? '#a1a1aa' : '#6b7280'
        ctx.font = '11px system-ui'
        const catLabel = CATEGORY_CONFIG[node.category]?.label || node.category
        ctx.fillText(catLabel, tx + 10, ty + 30)

        // Click hint
        ctx.fillStyle = node.color
        ctx.font = 'italic 10px system-ui'
        ctx.fillText('Click to view →', tx + 10, ty + 44)
      }
    }

    ctx.restore()
  }, [dimensions, hoveredNode, zoom, pan])

  // Redraw on state changes
  useEffect(() => { draw() }, [draw])

  // Mouse event helpers
  const getNodeAtPos = useCallback((clientX, clientY) => {
    const canvas = canvasRef.current
    const sim = simRef.current
    if (!canvas || !sim) return null

    const rect = canvas.getBoundingClientRect()
    // Inverse transform to get world coords
    let mx = clientX - rect.left
    let my = clientY - rect.top
    mx = (mx - pan.x - dimensions.width / 2) / zoom + dimensions.width / 2
    my = (my - pan.y - dimensions.height / 2) / zoom + dimensions.height / 2

    for (const node of sim.nodes) {
      const dx = mx - node.x
      const dy = my - node.y
      if (dx * dx + dy * dy < (node.radius + 4) ** 2) {
        return node
      }
    }
    return null
  }, [pan, zoom, dimensions])

  const handleMouseMove = useCallback((e) => {
    if (panning) {
      setPan(p => ({
        x: p.x + e.clientX - panStart.current.x,
        y: p.y + e.clientY - panStart.current.y,
      }))
      panStart.current = { x: e.clientX, y: e.clientY }
      return
    }
    if (dragging && simRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      let mx = e.clientX - rect.left
      let my = e.clientY - rect.top
      mx = (mx - pan.x - dimensions.width / 2) / zoom + dimensions.width / 2
      my = (my - pan.y - dimensions.height / 2) / zoom + dimensions.height / 2
      const node = simRef.current.nodes.find(n => n.id === dragging)
      if (node) {
        node.x = mx
        node.y = my
        node.vx = 0
        node.vy = 0
        simRef.current.reheat()
        // Re-animate
        if (animRef.current) cancelAnimationFrame(animRef.current)
        const animate = () => {
          const running = simRef.current?.tick()
          draw()
          if (running) animRef.current = requestAnimationFrame(animate)
        }
        animate()
      }
      return
    }

    const node = getNodeAtPos(e.clientX, e.clientY)
    setHoveredNode(node)
    canvasRef.current.style.cursor = node ? 'pointer' : 'grab'
  }, [getNodeAtPos, panning, dragging, pan, zoom, dimensions, draw])

  const handleMouseDown = useCallback((e) => {
    const node = getNodeAtPos(e.clientX, e.clientY)
    if (node) {
      setDragging(node.id)
    } else {
      setPanning(true)
      panStart.current = { x: e.clientX, y: e.clientY }
      canvasRef.current.style.cursor = 'grabbing'
    }
  }, [getNodeAtPos])

  const handleMouseUp = useCallback((e) => {
    if (dragging) {
      // If didn't move much, treat as click
      const node = getNodeAtPos(e.clientX, e.clientY)
      if (node && node.id === dragging) {
        router.push(`/experiences/${node.id}`)
      }
      setDragging(null)
    }
    setPanning(false)
    canvasRef.current.style.cursor = 'grab'
  }, [dragging, getNodeAtPos, router])

  const handleWheel = useCallback((e) => {
    e.preventDefault()
    setZoom(z => Math.max(0.3, Math.min(3, z + (e.deltaY > 0 ? -0.1 : 0.1))))
  }, [])

  const resetView = useCallback(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
    if (simRef.current) {
      simRef.current.reheat()
      const animate = () => {
        const running = simRef.current?.tick()
        draw()
        if (running) animRef.current = requestAnimationFrame(animate)
      }
      animate()
    }
  }, [draw])

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(f => !f)
  }, [])

  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 p-12 text-center">
        <span className="text-5xl mb-4">🕸️</span>
        <p className="text-gray-400 text-lg">Create links with multiple experiences to see your knowledge graph</p>
      </div>
    )
  }

  // Build legend from categories present
  const categoriesInGraph = [...new Set(nodes.map(n => n.category))].slice(0, 8)

  return (
    <div
      ref={containerRef}
      className={`relative rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      }`}
      style={{ height: isFullscreen ? '100vh' : '500px' }}
    >
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ width: dimensions.width, height: dimensions.height }}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { setHoveredNode(null); setPanning(false); setDragging(null) }}
        onWheel={handleWheel}
      />

      {/* Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button onClick={() => setZoom(z => Math.min(3, z + 0.2))} className="p-2 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors" title="Zoom in" aria-label="Zoom in">
          <FiZoomIn className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
        <button onClick={() => setZoom(z => Math.max(0.3, z - 0.2))} className="p-2 rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shadow-sm hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors" title="Zoom out" aria-label="Zoom out">
          <FiZoomOut className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
        <button onClick={resetView} className="p-2 rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shadow-sm hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors" title="Reset view" aria-label="Reset view">
          <FiRefreshCw className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
        <button onClick={toggleFullscreen} className="p-2 rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shadow-sm hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors" title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'} aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
          {isFullscreen ? <FiMinimize2 className="w-4 h-4 text-gray-600 dark:text-gray-300" /> : <FiMaximize2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />}
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-xl px-4 py-3 border border-gray-200 dark:border-slate-700 shadow-sm">
        <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Categories</p>
        <div className="flex flex-wrap gap-x-3 gap-y-1.5">
          {categoriesInGraph.map(cat => (
            <div key={cat} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat] || DEFAULT_COLOR }} />
              <span className="text-[11px] text-gray-600 dark:text-gray-400">{CATEGORY_CONFIG[cat]?.label || cat}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2">
          {nodes.length} nodes ・ {edges.length} connections ・ Scroll to zoom ・ Drag to explore
        </p>
      </div>

      {/* Fullscreen escape hint */}
      {isFullscreen && (
        <div className="absolute top-4 left-4 bg-black/50 text-white text-xs px-3 py-1.5 rounded-lg backdrop-blur-sm">
          Press button or Esc to exit fullscreen
        </div>
      )}
    </div>
  )
}

// Canvas rounded rectangle helper
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
