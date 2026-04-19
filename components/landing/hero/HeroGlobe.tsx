'use client'

import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { Html, Line } from '@react-three/drei'
import { Suspense, useMemo, useRef, useState, type MutableRefObject } from 'react'
import * as THREE from 'three'
import { MARKERS, MARKER_COLOR, MARKER_PULSE_COLOR, latLngToVec3 } from './markers'
import { CASCADE_ALERTS, HORMUZ_LAT, HORMUZ_LNG } from './heroOpeningData'
import LivePulse from '@/components/motion/LivePulse'
import type { HeroAnimState } from './heroAnimState'
import { DEFAULT_FINAL_STATE } from './heroAnimState'

const RADIUS = 1.15

const EARTH_TEXTURE_URL =
  'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg'
const EARTH_BUMP_URL =
  'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png'

type AnimRef = MutableRefObject<HeroAnimState>

function CameraController({ animRef }: { animRef: AnimRef }) {
  const { camera } = useThree()
  useFrame(() => {
    const s = animRef.current
    camera.position.z = s.cameraZ
    camera.position.y = s.cameraY
    camera.lookAt(0, 0, 0)
  })
  return null
}

function Earth({ animRef }: { animRef: AnimRef }) {
  const ref = useRef<THREE.Group>(null)
  const markerGroupRef = useRef<THREE.Group>(null)
  const [map, bump] = useLoader(THREE.TextureLoader, [
    EARTH_TEXTURE_URL,
    EARTH_BUMP_URL,
  ])

  map.colorSpace = THREE.SRGBColorSpace
  map.anisotropy = 8

  useFrame((_, delta) => {
    if (!ref.current) return
    const s = animRef.current
    ref.current.rotation.y = s.globeRotY + delta * 0 // base set, auto below
    ref.current.rotation.x = s.globeRotX
    ref.current.scale.setScalar(s.globeScale)
    if (s.autoRotateSpeed > 0) {
      ref.current.rotation.y = ref.current.rotation.y + delta * s.autoRotateSpeed
      // write back to state so GSAP resumes from current value if it tweens again
      s.globeRotY = ref.current.rotation.y
    }
    if (markerGroupRef.current) {
      markerGroupRef.current.visible = s.markerOpacity > 0.01
    }
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
      <group ref={markerGroupRef}>
        <Markers animRef={animRef} />
      </group>
      <CascadeArcs animRef={animRef} />
      <CascadeCards animRef={animRef} />
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

function Markers({ animRef }: { animRef: AnimRef }) {
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
                style={{
                  width: 28,
                  height: 28,
                  opacity: animRef.current.markerOpacity,
                  transition: 'opacity 300ms linear',
                }}
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

// Great-circle arc from Hormuz to each cascade alert region, drawn as a 3D
// Line along the globe surface so it rotates with the earth naturally.
function arcPoints(from: [number, number], to: [number, number], segments = 64) {
  const start = new THREE.Vector3(
    ...latLngToVec3(from[0], from[1], RADIUS + 0.008),
  )
  const end = new THREE.Vector3(
    ...latLngToVec3(to[0], to[1], RADIUS + 0.008),
  )
  const pts: THREE.Vector3[] = []
  const axis = new THREE.Vector3().crossVectors(start, end).normalize()
  const angle = start.angleTo(end)
  // Arc lifts above the surface at its midpoint for a readable curve
  const midLift = 0.22 + angle * 0.12
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const q = new THREE.Quaternion().setFromAxisAngle(axis, angle * t)
    const p = start.clone().applyQuaternion(q)
    const lift = Math.sin(Math.PI * t) * midLift
    p.multiplyScalar(1 + lift / RADIUS)
    pts.push(p)
  }
  return pts
}

function CascadeArcs({ animRef }: { animRef: AnimRef }) {
  const groupRef = useRef<THREE.Group>(null)
  const arcs = useMemo(
    () =>
      CASCADE_ALERTS.map((a) => ({
        id: a.id,
        pts: arcPoints([HORMUZ_LAT, HORMUZ_LNG], [a.lat, a.lng]),
      })),
    [],
  )
  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.visible = animRef.current.cascadeOpacity > 0.01
  })
  return (
    <group ref={groupRef}>
      {arcs.map((a) => (
        <Line
          key={a.id}
          points={a.pts}
          color="#ff5c5c"
          transparent
          opacity={0.28}
          lineWidth={1}
          dashed={false}
        />
      ))}
    </group>
  )
}

function CascadeCards({ animRef }: { animRef: AnimRef }) {
  const groupRef = useRef<THREE.Group>(null)
  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.visible = animRef.current.cascadeOpacity > 0.01
  })
  return (
    <group ref={groupRef}>
      {CASCADE_ALERTS.map((a) => {
        const pos = latLngToVec3(a.lat, a.lng, RADIUS + 0.02)
        const dotColor =
          a.tone === 'cost' ? 'var(--sl-warn)' : 'var(--sl-good)'
        return (
          <group key={a.id} position={pos}>
            <Html
              center
              distanceFactor={8}
              style={{ pointerEvents: 'none' }}
            >
              <div
                data-cascade-card={a.id}
                className="pointer-events-none relative"
                style={{
                  width: 180,
                  opacity: 0,
                  transform: 'translate3d(0, 0, 0)',
                  willChange: 'transform, opacity',
                }}
              >
                <div
                  className="rounded-md border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider shadow-[var(--sl-glow-accent)]"
                  style={{
                    background: 'var(--sl-surface-glass)',
                    backdropFilter: 'blur(10px)',
                    borderColor: 'var(--sl-border-strong)',
                    color: 'var(--sl-fg)',
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full"
                      style={{ background: dotColor }}
                    />
                    <span className="text-fg-muted">{a.region}</span>
                  </div>
                  <div className="mt-0.5 flex items-baseline gap-1.5">
                    <span className="text-fg">{a.indicator}</span>
                    <span style={{ color: dotColor }}>{a.delta}</span>
                  </div>
                </div>
              </div>
            </Html>
          </group>
        )
      })}
    </group>
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

type HeroGlobeProps = {
  animRef?: AnimRef
}

export default function HeroGlobe({ animRef }: HeroGlobeProps = {}) {
  const fallbackRef = useRef<HeroAnimState>({ ...DEFAULT_FINAL_STATE })
  const state = animRef ?? fallbackRef
  return (
    <Canvas
      dpr={[1, 3]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0.15, 3.9], fov: 42 }}
      style={{ width: '100%', height: '100%' }}
    >
      <CameraController animRef={state} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 3, 5]} intensity={1.1} color="#ffffff" />
      <pointLight position={[-4, -2, -3]} intensity={0.4} color="#4ea8ff" />
      <Suspense fallback={null}>
        <Stars />
        <Earth animRef={state} />
      </Suspense>
    </Canvas>
  )
}
