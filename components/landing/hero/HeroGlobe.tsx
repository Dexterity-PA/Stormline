'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { Suspense, useRef, useState } from 'react'
import type * as THREE from 'three'
import { MARKERS, MARKER_COLOR, MARKER_PULSE_COLOR, latLngToVec3 } from './markers'
import LivePulse from '@/components/motion/LivePulse'

const RADIUS = 1.4

function WireSphere() {
  const ref = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (!ref.current) return
    ref.current.rotation.y += delta * 0.06
  })

  return (
    <group ref={ref}>
      {/* Filled, very low opacity sphere to give depth mask */}
      <mesh>
        <sphereGeometry args={[RADIUS - 0.005, 48, 48]} />
        <meshBasicMaterial color="#0a0e13" transparent opacity={0.95} />
      </mesh>
      {/* Wireframe overlay */}
      <mesh>
        <sphereGeometry args={[RADIUS, 48, 24]} />
        <meshBasicMaterial color="#1e2631" wireframe transparent opacity={0.75} />
      </mesh>
      {/* Atmosphere glow */}
      <mesh scale={1.06}>
        <sphereGeometry args={[RADIUS, 32, 32]} />
        <meshBasicMaterial color="#4ea8ff" transparent opacity={0.04} depthWrite={false} />
      </mesh>
      <Markers />
    </group>
  )
}

function Markers() {
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <>
      {MARKERS.map((m) => {
        const pos = latLngToVec3(m.lat, m.lng, RADIUS + 0.02)
        const color = MARKER_COLOR[m.kind]
        const isHovered = hovered === m.id
        return (
          <group key={m.id} position={pos}>
            <mesh>
              <sphereGeometry args={[0.018, 12, 12]} />
              <meshBasicMaterial color={color} />
            </mesh>
            <Html
              center
              distanceFactor={8}
              occlude={false}
              style={{ pointerEvents: 'auto' }}
            >
              <div
                onPointerEnter={() => setHovered(m.id)}
                onPointerLeave={() => setHovered((h) => (h === m.id ? null : h))}
                className="relative"
                style={{ width: 28, height: 28 }}
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
      })}
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
  return (
    <Canvas
      dpr={[1, 1.6]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0.3, 3.6], fov: 45 }}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 3, 5]} intensity={0.8} color="#4ea8ff" />
      <Suspense fallback={null}>
        <Stars />
        <WireSphere />
      </Suspense>
    </Canvas>
  )
}
