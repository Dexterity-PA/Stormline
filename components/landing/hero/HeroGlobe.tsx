'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, useTexture } from '@react-three/drei'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { MARKERS, MARKER_COLOR, MARKER_PULSE_COLOR, latLngToVec3 } from './markers'
import LivePulse from '@/components/motion/LivePulse'
import { usePrefersReducedMotion } from '@/components/motion/usePrefersReducedMotion'

const RADIUS = 1.4
// NASA Blue Marble (natural earth daytime imagery), served from the
// three-globe example bundle on unpkg — same source as globe.gl examples.
const EARTH_TEXTURE_URL =
  'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg'

// Soft fresnel atmosphere — rim glow with falloff. Power 2.5 = soft tail,
// accent color at 20% saturation rendered at 30% opacity max so the halo
// feels like a subtle horizon glow, not a hard ring.
const atmosphereVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mvPosition.xyz);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const atmosphereFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uPower;
  uniform float uOpacity;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    float rim = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), uPower);
    gl_FragColor = vec4(uColor, rim * uOpacity);
  }
`

function FresnelAtmosphere() {
  const uniforms = useMemo(
    () => ({
      // --sl-accent (#4ea8ff) mixed with bg at ~20% saturation visually
      uColor: { value: new THREE.Color('#9bc7ff') },
      uPower: { value: 2.5 },
      uOpacity: { value: 0.3 },
    }),
    [],
  )
  return (
    <mesh scale={1.08}>
      <sphereGeometry args={[RADIUS, 64, 32]} />
      <shaderMaterial
        vertexShader={atmosphereVertex}
        fragmentShader={atmosphereFragment}
        uniforms={uniforms}
        transparent
        side={THREE.BackSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

function EarthSurface() {
  const texture = useTexture(EARTH_TEXTURE_URL)

  useEffect(() => {
    if (!texture) return
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 8
  }, [texture])

  return (
    <mesh>
      <sphereGeometry args={[RADIUS, 96, 64]} />
      {/* Daytime imagery, dark-mode tinted: emissive --sl-bg-1 (#0a0e13)
         lifts continent legibility while the directional light handles the
         day/night terminator. roughness 1 keeps oceans matte. */}
      <meshStandardMaterial
        map={texture}
        emissive={new THREE.Color('#0a0e13')}
        emissiveIntensity={0.55}
        roughness={1}
        metalness={0}
      />
    </mesh>
  )
}

function EarthGroup({ markersOn }: { markersOn: boolean }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (!ref.current) return
    ref.current.rotation.y += delta * 0.06
  })

  return (
    <group ref={ref}>
      <Suspense fallback={
        <mesh>
          <sphereGeometry args={[RADIUS, 48, 32]} />
          <meshStandardMaterial color="#0e1822" roughness={1} metalness={0} />
        </mesh>
      }>
        <EarthSurface />
      </Suspense>
      <FresnelAtmosphere />
      <Markers visible={markersOn} />
    </group>
  )
}

// Cinematic opening: camera starts close (z≈1.2) angled 15° around y, then
// pulls back to z=3.0 over 2.4s with ease-out-expo while orbiting back to 0°.
// Markers fade in once the camera settles (staggered 80ms).
function CameraIntro({
  onSettled,
}: {
  onSettled: (v: boolean) => void
}) {
  const { camera } = useThree()
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReduced) {
      camera.position.set(0, 0.3, 3.0)
      camera.lookAt(0, 0, 0)
      onSettled(true)
      return
    }
    const state = { angle: -(Math.PI * 15) / 180, dist: 1.2, y: 0 }
    const apply = () => {
      camera.position.set(
        Math.sin(state.angle) * state.dist,
        state.y,
        Math.cos(state.angle) * state.dist,
      )
      camera.lookAt(0, 0, 0)
    }
    apply()
    const tl = gsap.timeline({ onComplete: () => onSettled(true) })
    tl.to(state, {
      angle: 0,
      dist: 3.0,
      y: 0.3,
      duration: 2.4,
      ease: 'expo.out',
      onUpdate: apply,
    })
    return () => {
      tl.kill()
    }
  }, [camera, prefersReduced, onSettled])

  return null
}

type MarkerProps = {
  m: (typeof MARKERS)[number]
  index: number
  visible: boolean
  hovered: string | null
  setHovered: (v: string | null | ((prev: string | null) => string | null)) => void
}

// Per-marker occlusion: marker's outward normal (its world position relative to
// the globe center at origin) dotted with the view direction (camera - marker).
// Positive → front-facing; negative → behind globe. Damped per-frame so the
// transition reads as a ~180ms fade instead of a pop.
function Marker({ m, index, visible, hovered, setHovered }: MarkerProps) {
  const groupRef = useRef<THREE.Group>(null)
  const meshRef = useRef<THREE.Mesh>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const facingRef = useRef(0)
  const mountedAtRef = useRef<number | null>(null)
  const { camera } = useThree()
  const worldPos = useMemo(() => new THREE.Vector3(), [])
  const normal = useMemo(() => new THREE.Vector3(), [])
  const toCam = useMemo(() => new THREE.Vector3(), [])
  const pos = useMemo(
    () => latLngToVec3(m.lat, m.lng, RADIUS + 0.02),
    [m.lat, m.lng],
  )
  const color = MARKER_COLOR[m.kind]

  useEffect(() => {
    if (visible && mountedAtRef.current === null) {
      mountedAtRef.current = performance.now()
    }
  }, [visible])

  useFrame((_, delta) => {
    if (!groupRef.current) return

    groupRef.current.getWorldPosition(worldPos)
    normal.copy(worldPos).normalize()
    toCam.copy(camera.position).sub(worldPos).normalize()
    // Small positive bias so markers right on the silhouette fade out before
    // they'd render edge-on (which reads as a visible leak).
    const facingTarget = normal.dot(toCam) > 0.05 ? 1 : 0

    // Exponential damp, ~180ms to reach ~95% of target. 1 - exp(-dt / tau).
    const tau = 0.06
    const k = 1 - Math.exp(-delta / tau)
    facingRef.current += (facingTarget - facingRef.current) * k

    let entrance = 0
    if (visible && mountedAtRef.current !== null) {
      const delay = index * 80
      const duration = 600
      const t = Math.max(0, performance.now() - mountedAtRef.current - delay)
      const p = Math.min(1, t / duration)
      entrance = 1 - Math.pow(1 - p, 3)
    }

    const finalOpacity = entrance * facingRef.current

    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = finalOpacity
    }
    if (wrapperRef.current) {
      wrapperRef.current.style.opacity = String(finalOpacity)
      wrapperRef.current.style.pointerEvents =
        facingRef.current > 0.5 ? 'auto' : 'none'
    }
  })

  const isHovered = hovered === m.id

  return (
    <group ref={groupRef} position={pos}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.018, 12, 12]} />
        <meshBasicMaterial color={color} transparent opacity={0} />
      </mesh>
      <Html
        center
        distanceFactor={8}
        occlude={false}
        style={{ pointerEvents: 'auto' }}
      >
        <div
          ref={wrapperRef}
          onPointerEnter={() => setHovered(m.id)}
          onPointerLeave={() => setHovered((h) => (h === m.id ? null : h))}
          className="relative"
          style={{ width: 28, height: 28, opacity: 0 }}
        >
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            aria-hidden
          >
            <LivePulse color={MARKER_PULSE_COLOR[m.kind]} size={10} />
          </div>
          {isHovered && (
            <div
              className="absolute left-1/2 top-full mt-2 w-[240px] -translate-x-1/2 rounded-md border p-3 text-left shadow-[var(--sl-glow-accent)]"
              style={{
                background: 'var(--sl-surface-glass)',
                backdropFilter: 'blur(10px)',
                borderColor: 'var(--sl-border-strong)',
                zIndex: 10,
              }}
            >
              <div
                className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider"
                style={{ color }}
              >
                {m.kind}
                <span className="text-fg-dim">·</span>
                <span className="text-fg-dim">{m.updated}</span>
              </div>
              <div className="mt-1.5 font-display text-sm font-semibold text-fg">
                {m.title}
              </div>
              <div className="mt-1 text-xs text-fg-muted">{m.summary}</div>
              <div className="mt-2 text-[11px] text-fg-dim">
                Affects: <span className="text-fg-muted">{m.affects}</span>
              </div>
            </div>
          )}
        </div>
      </Html>
    </group>
  )
}

function Markers({ visible }: { visible: boolean }) {
  const [hovered, setHovered] = useState<string | null>(null)
  return (
    <>
      {MARKERS.map((m, i) => (
        <Marker
          key={m.id}
          m={m}
          index={i}
          visible={visible}
          hovered={hovered}
          setHovered={setHovered}
        />
      ))}
    </>
  )
}

const STAR_POSITIONS: Float32Array = (() => {
  // Deterministic pseudo-random so render stays pure.
  let seed = 1337
  const rnd = () => {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
  const count = 180
  const arr = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const r = 6 + rnd() * 4
    const theta = rnd() * Math.PI * 2
    const phi = Math.acos(2 * rnd() - 1)
    arr[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta)
    arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    arr[i * 3 + 2] = r * Math.cos(phi)
  }
  return arr
})()

function Stars() {
  const positions = STAR_POSITIONS

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={positions.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#5a6472" sizeAttenuation transparent opacity={0.6} />
    </points>
  )
}

export default function HeroGlobe() {
  const [settled, setSettled] = useState(false)
  return (
    <Canvas
      dpr={[1, 1.6]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0, 1.2], fov: 45 }}
      style={{ width: '100%', height: '100%' }}
    >
      {/* Ambient lifts the night side so continents stay readable; the
          directional rig lights ~60% of the visible hemisphere from the
          upper-front-right, leaving a soft terminator on the left. */}
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 2, 4]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[-3, 1, -2]} intensity={0.18} color="#7aa9ff" />
      <CameraIntro onSettled={setSettled} />
      <Suspense fallback={null}>
        <Stars />
        <EarthGroup markersOn={settled} />
      </Suspense>
    </Canvas>
  )
}
