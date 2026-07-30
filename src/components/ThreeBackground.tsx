import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

const Grid = ({ mobile }: { mobile: boolean }) => {
  const gridRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.position.z = (state.clock.getElapsedTime() * 2) % 2;
    }
  });

  return (
    <group ref={gridRef}>
      <gridHelper args={[100, mobile ? 20 : 50, 0x06b6d4, 0x06b6d4]} position={[0, -2, 0]} />
      <gridHelper
        args={[100, mobile ? 10 : 25, 0x8b5cf6, 0x8b5cf6]}
        position={[0, -2.01, 0]}
      />
    </group>
  );
};

const AtmosphericParticles = ({ mobile }: { mobile: boolean }) => {
  const count = mobile ? 200 : 1000;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    return pos;
  }, [count]);

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
        size={mobile ? 0.08 : 0.05}
        color="#06b6d4"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
};

export const ThreeBackground: React.FC = () => {
  const mobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-black">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={75} />
        <fog attach="fog" args={[mobile ? "#000" : "#000", mobile ? 3 : 5, mobile ? 15 : 25]} />
        <color attach="background" args={["#000"]} />

        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} color="#06b6d4" intensity={1} />
        <pointLight position={[-10, -10, -10]} color="#8b5cf6" intensity={1} />

        <Grid mobile={mobile} />
        <AtmosphericParticles mobile={mobile} />
        <Stars
          radius={mobile ? 50 : 100}
          depth={mobile ? 25 : 50}
          count={mobile ? 1000 : 5000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />

        {!mobile && (
          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh position={[15, 5, -10]} rotation={[Math.PI / 4, 0, 0]}>
              <torusGeometry args={[10, 0.05, 16, 100]} />
              <meshBasicMaterial color="#06b6d4" transparent opacity={0.1} />
            </mesh>
          </Float>
        )}
      </Canvas>

      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url('https://grainy-gradients.vercel.app/noise.svg')`,
        }}
      />

      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,1)]" />
    </div>
  );
};
