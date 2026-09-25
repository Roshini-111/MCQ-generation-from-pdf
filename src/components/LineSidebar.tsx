import { useCallback, useEffect, useRef, useState } from 'react'
import './LineSidebar.css'

interface LineSidebarProps {
  items: string[]
  accentColor?: string
  textColor?: string
  markerColor?: string
  showIndex?: boolean
  showMarker?: boolean
  proximityRadius?: number
  maxShift?: number
  falloff?: 'linear' | 'smooth' | 'sharp'
  markerLength?: number
  markerGap?: number
  tickScale?: number
  scaleTick?: boolean
  itemGap?: number
  fontSize?: number
  smoothing?: number
  defaultActive?: number | null
  onItemClick?: (index: number, label: string) => void
  className?: string
}

const curves = {
  linear: (value: number) => value,
  smooth: (value: number) => value * value * (3 - 2 * value),
  sharp: (value: number) => value * value * value,
}

export function LineSidebar({
  items,
  accentColor = '#7F9172',
  textColor = '#576568',
  markerColor = '#B49594',
  showIndex = true,
  showMarker = true,
  proximityRadius = 100,
  maxShift = 30,
  falloff = 'smooth',
  markerLength = 48,
  markerGap = 0,
  tickScale = 0.5,
  scaleTick = true,
  itemGap = 18,
  fontSize = 0.86,
  smoothing = 100,
  defaultActive = null,
  onItemClick,
  className = '',
}: LineSidebarProps) {
  const listRef = useRef<HTMLUListElement>(null)
  const itemRefs = useRef<Array<HTMLLIElement | null>>([])
  const targetsRef = useRef<number[]>([])
  const currentRef = useRef<number[]>([])
  const rafRef = useRef<number | null>(null)
  const lastRef = useRef(0)
  const [activeIndex, setActiveIndex] = useState<number | null>(defaultActive)

  const runFrame = useCallback((now: number) => {
    const dt = Math.min((now - lastRef.current) / 1000, 0.05)
    lastRef.current = now
    const tau = Math.max(smoothing, 1) / 1000
    const factor = 1 - Math.exp(-dt / tau)
    let moving = false

    itemRefs.current.forEach((element, index) => {
      if (!element) return
      const target = Math.max(targetsRef.current[index] || 0, activeIndex === index ? 1 : 0)
      const current = currentRef.current[index] || 0
      const next = current + (target - current) * factor
      const settled = Math.abs(target - next) < 0.0015
      const value = settled ? target : next
      currentRef.current[index] = value
      element.style.setProperty('--effect', value.toFixed(4))
      if (!settled) moving = true
    })

    rafRef.current = moving ? requestAnimationFrame(runFrame) : null
  }, [activeIndex, smoothing])

  const startLoop = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    lastRef.current = performance.now()
    rafRef.current = requestAnimationFrame(runFrame)
  }, [runFrame])

  const handlePointerMove = (event: React.PointerEvent<HTMLUListElement>) => {
    if (!listRef.current) return
    const rect = listRef.current.getBoundingClientRect()
    const pointerY = event.clientY - rect.top
    const ease = curves[falloff]
    itemRefs.current.forEach((element, index) => {
      if (!element) return
      const center = element.offsetTop + element.offsetHeight / 2
      const distance = Math.abs(pointerY - center)
      targetsRef.current[index] = ease(Math.max(0, 1 - distance / proximityRadius))
    })
    startLoop()
  }

  const handlePointerLeave = () => {
    targetsRef.current = targetsRef.current.map(() => 0)
    startLoop()
  }

  useEffect(() => {
    startLoop()
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [startLoop])

  return (
    <nav
      className={`line-sidebar${showMarker ? ' line-sidebar--markers' : ''}${scaleTick ? ' line-sidebar--scale-tick' : ''}${className ? ` ${className}` : ''}`}
      style={{
        '--accent-color': accentColor,
        '--text-color': textColor,
        '--marker-color': markerColor,
        '--marker-length': `${markerLength}px`,
        '--marker-gap': `${markerGap}px`,
        '--tick-scale': tickScale,
        '--max-shift': `${maxShift}px`,
        '--item-gap': `${itemGap}px`,
        '--font-size': `${fontSize}rem`,
      } as React.CSSProperties}
    >
      <ul ref={listRef} className="line-sidebar__list" onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave}>
        {items.map((label, index) => (
          <li
            key={`${label}-${index}`}
            ref={(element) => { itemRefs.current[index] = element }}
            className="line-sidebar__item"
            aria-current={activeIndex === index ? 'true' : undefined}
            onClick={() => { setActiveIndex(index); onItemClick?.(index, label) }}
          >
            {showMarker && <span className="line-sidebar__marker" aria-hidden="true" />}
            <span className="line-sidebar__label">
              {showIndex && <span className="line-sidebar__index">{String(index + 1).padStart(2, '0')}</span>}
              <span className="line-sidebar__text">{label}</span>
            </span>
          </li>
        ))}
      </ul>
    </nav>
  )
}
