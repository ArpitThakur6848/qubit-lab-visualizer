'use client'

import { useRef, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Html, Line } from '@react-three/drei'
import * as THREE from 'three'

// ── Types ────────────────────────────────────────────────────

interface BlochSphereProps {
  blochVector: [number, number, number] // [x, y, z] on unit sphere
  showXAxis: boolean
  showYAxis: boolean
  showZAxis: boolean
  controlsRef?: React.RefObject<any>
}

interface StateVectorArrowProps {
  target: [number, number, number]
}

interface AxisProps {
  direction: [number, number, number]
  color: string
  label?: string
  negLabel?: string
}

interface AxisLabelProps {
  position: [number, number, number]
  text: string
  color: string
}

// ── Constants ────────────────────────────────────────────────

const SPHERE_RADIUS = 1
const AXIS_LENGTH = 1.35
const LABEL_OFFSET = 1.5
const SPHERE_COLOR = '#3f3f46' // zinc-700
const SPHERE_OPACITY = 0.12
const WIRE_COLOR = '#52525b' // zinc-600
const WIRE_OPACITY = 0.3

// ── Subcomponents ────────────────────────────────────────────

function AxisLabel({ position, text, color }: AxisLabelProps) {
  return (
    <Html position={position} center distanceFactor={5}>
      <span
        style={{ color, fontSize: '12px', fontFamily: 'monospace', userSelect: 'none' }}
      >
        {text}
      </span>
    </Html>
  )
}

function Axis({ direction, color, label, negLabel }: AxisProps) {
  const start: [number, number, number] = [
    -direction[0] * AXIS_LENGTH,
    -direction[1] * AXIS_LENGTH,
    -direction[2] * AXIS_LENGTH,
  ]
  const end: [number, number, number] = [
    direction[0] * AXIS_LENGTH,
    direction[1] * AXIS_LENGTH,
    direction[2] * AXIS_LENGTH,
  ]

  const labelPos: [number, number, number] = [
    direction[0] * LABEL_OFFSET,
    direction[1] * LABEL_OFFSET,
    direction[2] * LABEL_OFFSET,
  ]
  const negLabelPos: [number, number, number] = [
    -direction[0] * LABEL_OFFSET,
    -direction[1] * LABEL_OFFSET,
    -direction[2] * LABEL_OFFSET,
  ]

  return (
    <group>
      <Line
        points={[start, end]}
        color={color}
        lineWidth={1}
        transparent
        opacity={0.6}
      />
      {label && <AxisLabel position={labelPos} text={label} color={color} />}
      {negLabel && <AxisLabel position={negLabelPos} text={negLabel} color={color} />}
    </group>
  )
}

function StateVectorArrow({ target }: StateVectorArrowProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const coneRef = useRef<THREE.Mesh>(null)

  const { shaftEnd, conePosition, quaternion } = useMemo(() => {
    const dir = new THREE.Vector3(...target).normalize()
    const len = SPHERE_RADIUS
    const coneHeight = 0.12
    const shaftLen = len - coneHeight

    // Quaternion to rotate from +Y to the target direction
    const quat = new THREE.Quaternion()
    quat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)

    return {
      shaftEnd: dir.clone().multiplyScalar(shaftLen),
      conePosition: dir.clone().multiplyScalar(len - coneHeight / 2),
      quaternion: quat,
    }
  }, [target])

  const shaftLength = shaftEnd.length()

  return (
    <group>
      {/* Shaft */}
      <mesh
        ref={meshRef}
        position={[
          shaftEnd.x / 2,
          shaftEnd.y / 2,
          shaftEnd.z / 2,
        ]}
        quaternion={quaternion}
      >
        <cylinderGeometry args={[0.015, 0.015, shaftLength, 8]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.5} />
      </mesh>

      {/* Arrowhead cone */}
      <mesh ref={coneRef} position={conePosition.toArray()} quaternion={quaternion}>
        <coneGeometry args={[0.04, 0.12, 12]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.5} />
      </mesh>

      {/* Dot at the tip */}
      <mesh position={new THREE.Vector3(...target).normalize().multiplyScalar(SPHERE_RADIUS).toArray()}>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshStandardMaterial color="#7dd3fc" emissive="#7dd3fc" emissiveIntensity={0.8} />
      </mesh>
    </group>
  )
}

function WireframeSphere() {
  return (
    <group>
      {/* Solid transparent sphere */}
      <mesh>
        <sphereGeometry args={[SPHERE_RADIUS, 48, 48]} />
        <meshStandardMaterial
          color={SPHERE_COLOR}
          transparent
          opacity={SPHERE_OPACITY}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Equator ring (dashed) */}
      <EquatorRing radius={SPHERE_RADIUS} plane="xz" color={WIRE_COLOR} opacity={WIRE_OPACITY} />

      {/* Longitude rings */}
      <EquatorRing radius={SPHERE_RADIUS} plane="xy" color={WIRE_COLOR} opacity={WIRE_OPACITY * 0.6} />
      <EquatorRing radius={SPHERE_RADIUS} plane="yz" color={WIRE_COLOR} opacity={WIRE_OPACITY * 0.6} />
    </group>
  )
}

function EquatorRing({
  radius,
  plane,
  color,
  opacity,
}: {
  radius: number
  plane: 'xy' | 'xz' | 'yz'
  color: string
  opacity: number
}) {
  const points = useMemo(() => {
    const pts: [number, number, number][] = []
    const segments = 96
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      const c = Math.cos(angle) * radius
      const s = Math.sin(angle) * radius
      switch (plane) {
        case 'xz':
          pts.push([c, 0, s])
          break
        case 'xy':
          pts.push([c, s, 0])
          break
        case 'yz':
          pts.push([0, c, s])
          break
      }
    }
    return pts
  }, [radius, plane])

  return <Line points={points} color={color} lineWidth={0.8} transparent opacity={opacity} />
}

function BlochSphereContent({
  blochVector,
  showXAxis,
  showYAxis,
  showZAxis,
  controlsRef,
}: BlochSphereProps) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 4]} intensity={0.8} />
      <directionalLight position={[-3, -2, -4]} intensity={0.3} />

      {/* Orbit controls */}
      <OrbitControls
        ref={controlsRef as any}
        enablePan={false}
        enableZoom={true}
        minDistance={2}
        maxDistance={6}
        makeDefault
      />

      {/* Sphere */}
      <WireframeSphere />

      {/* Axes */}
      {showXAxis && (
        <Axis
          direction={[1, 0, 0]}
          color="#ef4444"
          label="|+⟩"
          negLabel="|-⟩"
        />
      )}
      {showYAxis && (
        <Axis
          direction={[0, 0, 1]}
          color="#22c55e"
          label="|+i⟩"
          negLabel="|-i⟩"
        />
      )}
      {showZAxis && (
        <Axis
          direction={[0, 1, 0]}
          color="#3b82f6"
          label="|0⟩"
          negLabel="|1⟩"
        />
      )}

      {/* State vector */}
      <StateVectorArrow target={blochVector} />

      {/* Origin dot */}
      <mesh>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshStandardMaterial color="#a1a1aa" />
      </mesh>
    </>
  )
}

// ── Main export ──────────────────────────────────────────────

export function BlochSphere(props: BlochSphereProps) {
  return (
    <Canvas
      camera={{ position: [2.5, 2, 2.5], fov: 45, near: 0.1, far: 100 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ antialias: true, alpha: true }}
    >
      <BlochSphereContent {...props} />
    </Canvas>
  )
}
