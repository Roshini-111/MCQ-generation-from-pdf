import { useEffect, useRef, useState } from 'react'
import { Renderer, Program, Triangle, Mesh } from 'ogl'
import './SideRays.css'

interface SideRaysProps {
  speed?: number
  rayColor1?: string
  rayColor2?: string
  intensity?: number
  spread?: number
  origin?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  tilt?: number
  saturation?: number
  blend?: number
  falloff?: number
  opacity?: number
  className?: string
}

const hexToRgb = (hex: string): [number, number, number] => {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return match
    ? [parseInt(match[1], 16) / 255, parseInt(match[2], 16) / 255, parseInt(match[3], 16) / 255]
    : [1, 1, 1]
}

const originToFlip = (origin: string): [number, number] => {
  switch (origin) {
    case 'top-left': return [1, 0]
    case 'bottom-right': return [0, 1]
    case 'bottom-left': return [1, 1]
    default: return [0, 0]
  }
}

export function SideRays({
  speed = 2.5,
  rayColor1 = '#A6A779',
  rayColor2 = '#96c8ff',
  intensity = 2,
  spread = 2,
  origin = 'top-right',
  tilt = 0,
  saturation = 1.5,
  blend = 0.75,
  falloff = 1.6,
  opacity = 1.0,
  className = '',
}: SideRaysProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const uniformsRef = useRef<any>(null)
  const animationIdRef = useRef<number | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new IntersectionObserver(
      (entries) => setIsVisible(entries[0].isIntersecting),
      { threshold: 0.1 }
    )
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible || !containerRef.current) return

    const init = async () => {
      await new Promise((r) => setTimeout(r, 10))
      if (!containerRef.current) return

      const renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio, 2), alpha: true })
      const gl = renderer.gl
      gl.canvas.style.width = '100%'
      gl.canvas.style.height = '100%'

      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild)
      }
      containerRef.current.appendChild(gl.canvas)

      const vert = `attribute vec2 position; void main() { gl_Position = vec4(position, 0.0, 1.0); }`
      const frag = `precision highp float;
uniform float iTime, iSpeed, iIntensity, iSpread, iFlipX, iFlipY, iTilt, iSaturation, iBlend, iFalloff, iOpacity;
uniform vec2 iResolution;
uniform vec3 iRayColor1, iRayColor2;
float rayStrength(vec2 s, vec2 d, vec2 c, float a, float b, float sp) {
  vec2 stc = c - s; float ca = dot(normalize(stc), d);
  return clamp((0.45+0.15*sin(ca*a+iTime*sp))+(0.3+0.2*cos(-ca*b+iTime*sp)),0.0,1.0)*clamp((iResolution.x-length(stc))/iResolution.x,0.5,1.0);
}
void main() {
  vec2 fc = gl_FragCoord.xy;
  if(iFlipX>0.5) fc.x=iResolution.x-fc.x;
  if(iFlipY>0.5) fc.y=iResolution.y-fc.y;
  vec2 coord = vec2(fc.x, iResolution.y-fc.y);
  vec2 rayPos = vec2(iResolution.x*1.1, -0.5*iResolution.y);
  float tr = iTilt*3.14159265/180.0;
  float cs=cos(tr), sn=sin(tr);
  vec2 rel = coord-rayPos;
  vec2 tc = vec2(rel.x*cs-rel.y*sn, rel.x*sn+rel.y*cs)+rayPos;
  float hs = iSpread*0.275;
  vec2 d1 = normalize(vec2(cos(0.785398+hs), sin(0.785398+hs)));
  vec2 d2 = normalize(vec2(cos(0.785398-hs), sin(0.785398-hs)));
  vec4 r1 = vec4(iRayColor1,1.0)*rayStrength(rayPos,d1,tc,36.2214,21.11349,iSpeed);
  vec4 r2 = vec4(iRayColor2,1.0)*rayStrength(rayPos,d2,tc,22.3991,18.0234,iSpeed*0.2);
  vec4 color = r1*(1.0-iBlend)*0.9+r2*iBlend*0.9;
  float dl = length(fc.xy-vec2(rayPos.x, iResolution.y-rayPos.y))/iResolution.y;
  float br = iIntensity*0.4/pow(max(dl,0.001), iFalloff);
  color.rgb *= br;
  float gray = dot(color.rgb, vec3(0.299,0.587,0.114));
  color.rgb = mix(vec3(gray), color.rgb, iSaturation);
  color.a = max(color.r, max(color.g, color.b))*iOpacity;
  gl_FragColor = color;
}`

      const [flipX, flipY] = originToFlip(origin)
      const uniforms = {
        iTime: { value: 0 }, iResolution: { value: [1, 1] }, iSpeed: { value: speed },
        iRayColor1: { value: hexToRgb(rayColor1) }, iRayColor2: { value: hexToRgb(rayColor2) },
        iIntensity: { value: intensity }, iSpread: { value: spread }, iFlipX: { value: flipX },
        iFlipY: { value: flipY }, iTilt: { value: tilt }, iSaturation: { value: saturation },
        iBlend: { value: blend }, iFalloff: { value: falloff }, iOpacity: { value: opacity },
      }
      uniformsRef.current = uniforms

      const geometry = new Triangle(gl)
      const program = new Program(gl, { vertex: vert, fragment: frag, uniforms })
      const mesh = new Mesh(gl, { geometry, program })

      const updateSize = () => {
        if (!containerRef.current) return
        renderer.dpr = Math.min(window.devicePixelRatio, 2)
        const { clientWidth: w, clientHeight: h } = containerRef.current
        renderer.setSize(w, h)
        uniforms.iResolution.value = [w * renderer.dpr, h * renderer.dpr]
      }

      const loop = (t: number) => {
        if (!uniformsRef.current) return
        uniforms.iTime.value = t * 0.001
        try { renderer.render({ scene: mesh }); animationIdRef.current = requestAnimationFrame(loop) } catch { /* ignore */ }
      }

      window.addEventListener('resize', updateSize)
      updateSize()
      animationIdRef.current = requestAnimationFrame(loop)

      cleanupRef.current = () => {
        if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current)
        window.removeEventListener('resize', updateSize)
        try {
          const loseCtx = gl.getExtension('WEBGL_lose_context')
          if (loseCtx) loseCtx.loseContext()
          if (gl.canvas.parentNode) gl.canvas.parentNode.removeChild(gl.canvas)
        } catch { /* ignore */ }
      }
    }

    init()
    return () => { cleanupRef.current?.(); cleanupRef.current = null }
  }, [isVisible, speed, rayColor1, rayColor2, intensity, spread, origin, tilt, saturation, blend, falloff, opacity])

  return <div ref={containerRef} className={`side-rays-container ${className}`.trim()} />
}
