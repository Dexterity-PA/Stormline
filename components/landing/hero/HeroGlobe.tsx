'use client'

import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { Suspense, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { MARKERS, MARKER_COLOR, MARKER_PULSE_COLOR, latLngToVec3 } from './markers'
import LivePulse from '@/components/motion/LivePulse'

const RADIUS = 1.15

// Bundled NASA Blue Marble night texture (and topology bump) served via the
// three-globe package on jsDelivr — public domain imagery. Single request each,
// cacheable, no CORS issues.
const EARTH_TEXTURE_URL =
  'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg'
const EARTH_BUMP_URL =
  'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png'

function Earth() {
  const ref = useRef<THREE.Group>(null)
  const [map, bump] = useLoader(THREE.TextureLoader, [
    EARTH_TEXTURE_URL,
    EARTH_BUMP_URL,
  ])

  // Soften the night texture a touch so glow rim + markers remain the focal point.
  map.colorSpace = THREE.SRGBColorSpace
  map.anisotropy = 8

  useFrame((_, delta) => {
    if (!ref.current) return
    ref.current.rotation.y += delta * 0.05
  })

  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[RADIUS, 96, 64]} />
        <meshStandardMaterial
          map={map}
          bumpMap={bump}
          bumpScale={0.015}
          roughness={0.95}
          metalness={0.05}
          color="#a8c4e8"
        />
      </mesh>
      <Atmosphere />
      <Markers />
    </group>
  )
}

function Atmosphere() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          glowColor: { value: new THREE.Color('#4ea8ff') },
          intensity: { value: 0.9 },
        },
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vViewPosition;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vViewPosition = -mvPosition.xyz;
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          uniform vec3 glowColor;
          uniform float intensity;
          varying vec3 vNormal;
          varying vec3 vViewPosition;
          void main() {
            vec3 viewDir = normalize(vViewPosition);
            float fresnel = 1.0 - abs(dot(viewDir, vNormal));
            fresnel = pow(fresnel, 2.5);
            gl_FragColor = vec4(glowColor, fresnel * intensity);
          }
        `,
        transparent: true,
        side: THREE.BackSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  )

  return (
    <mesh scale={1.06}>
      <sphereGeometry args={[RADIUS, 64, 64]} />
      <primitive object={mat} attach="material" />
    </mesh>
  )
}

function Markers() {
  const [hovered, setHovered] = useState<string | null>(null)
  return (
    <>
      {MARKERS.map((m) => {
        const pos = latLngToVec3(m.lat, m.lng, RADIUS + 0.015)
        const color = MARKER_COLOR[m.kind]
        const isHovered = hovered === m.id
        return (
          <group key={m.id} position={pos}>
            <Html
              center
              distanceFactor={8}
              occlude="blending"
              style={{ pointerEvents: 'auto' }}
            >
              <div
                onPointerEnter={() => setHovered(m.id)}
                onPointerLeave={() =>
                  setHovered((h) => (h === m.id ? null : h))
                }
                className="relative"
                style={{ width: 28, height: 28 }}
              >
                <div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                  aria-hidden
                  style={{
                    filter:
                      'drop-shadow(0 0 6px color-mix(in oklab, var(--sl-accent) 55%, transparent))',
                  }}
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
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[STAR_POSITIONS, 3]}
          count={STAR_POSITIONS.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#5a6472"
        sizeAttenuation
        transparent
        opacity={0.6}
      />
    </points>
  )
}

export default function HeroGlobe() {
  return (
    <Canvas
      dpr={[1, 3]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0.15, 3.9], fov: 42 }}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 3, 5]} intensity={1.1} color="#ffffff" />
      <pointLight position={[-4, -2, -3]} intensity={0.4} color="#4ea8ff" />
      <Suspense fallback={null}>
        <Stars />
        <Earth />
      </Suspense>
    </Canvas>
  )
}
