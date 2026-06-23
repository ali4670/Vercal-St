import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

const Grid = () => {
  const gridRef = useRef<THREE.Group>(null);

  // Create grid lines
  const lines = useMemo(() => {
    const size = 100;
    const divisions = 50;
    const points = [];

    for (let i = 0; i <= divisions; i++) {
      const pos = (i / divisions - 0.5) * size;
      points.push(new THREE.Vector3(pos, 0, -size / 2));
      points.push(new THREE.Vector3(pos, 0, size / 2));
      points.push(new THREE.Vector3(-size / 2, 0, pos));
      points.push(new THREE.Vector3(size / 2, 0, pos));
    }
    return points;
  }, []);

  useFrame((state) => {
    if (gridRef.current) {
      // Slow forward movement
      gridRef.current.position.z = (state.clock.getElapsedTime() * 2) % 2;
    }
  });

  return (
    <group ref={gridRef}>
      <gridHelper args={[100, 50, 0x06b6d4, 0x06b6d4]} position={[0, -2, 0]} />

      {/* Secondary glowing grid for depth */}
      <gridHelper
        args={[100, 25, 0x8b5cf6, 0x8b5cf6]}
        position={[0, -2.01, 0]}
      />
    </group>
  );
};

const AtmosphericParticles = () => {
  const count = 1000;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    return pos;
  }, []);

  const particlesRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
      particlesRef.current.position.y =
        Math.sin(state.clock.getElapsedTime() * 0.5) * 0.5;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#06b6d4"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
};

export const ThreeBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-black">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={75} />
        <fog attach="fog" args={["#000", 5, 25]} />
        <color attach="background" args={["#000"]} />

        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} color="#06b6d4" intensity={1} />
        <pointLight position={[-10, -10, -10]} color="#8b5cf6" intensity={1} />

        <Grid />
        <AtmosphericParticles />
        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />

        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          {/* Decorative high-tech torus */}
          <mesh position={[15, 5, -10]} rotation={[Math.PI / 4, 0, 0]}>
            <torusGeometry args={[10, 0.05, 16, 100]} />
            <meshBasicMaterial color="#06b6d4" transparent opacity={0.1} />
          </mesh>
        </Float>
      </Canvas>

      {/* Noise Texture Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url('https://grainy-gradients.vercel.app/noise.svg')`,
        }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,1)]" />
    </div>
  );
};
