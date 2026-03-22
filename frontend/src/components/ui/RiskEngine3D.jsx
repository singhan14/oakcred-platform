import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Stars, RoundedBox } from '@react-three/drei';

function FinancialChart() {
  const groupRef = useRef();
  
  // Heights for the ascending financial bars
  const heights = [0.6, 1.2, 0.9, 1.8, 3.0];
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.15; // Slow rotation of the whole chart
      groupRef.current.position.y = Math.sin(t * 1.5) * 0.1 - 0.5; // Subtle floating
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        
        {/* Base Platform (Obsidian Glass style) */}
        <RoundedBox args={[5.5, 0.2, 3]} radius={0.05} position={[0, -0.1, 0]}>
          <meshStandardMaterial color="#0A0A0B" metalness={0.9} roughness={0.1} />
        </RoundedBox>
        {/* Glowing Rim under the platform */}
        <RoundedBox args={[5.6, 0.05, 3.1]} radius={0.02} position={[0, -0.15, 0]}>
          <meshBasicMaterial color="#ea580c" transparent opacity={0.3} />
        </RoundedBox>

        {/* 3D Bar Chart Pillars */}
        {heights.map((h, i) => {
          // Calculate step position evenly spaced
          const x = -2 + (i * 1.0);
          const isHighest = i === heights.length - 1;
          
          return (
            <group key={i} position={[x, h / 2, 0]}>
              <RoundedBox args={[0.7, h, 0.7]} radius={0.05} smoothness={4}>
                <meshStandardMaterial 
                  color={isHighest ? "#f59e0b" : "#18181b"}
                  emissive={isHighest ? "#ea580c" : "#000000"}
                  emissiveIntensity={isHighest ? 0.6 : 0}
                  metalness={0.8}
                  roughness={0.2}
                />
              </RoundedBox>
              
              {/* Add a floating glowing cap to the active column */}
              {isHighest && (
                <RoundedBox args={[0.72, 0.05, 0.72]} radius={0.02} position={[0, h / 2 + 0.1, 0]}>
                  <meshBasicMaterial color="#fef08a" />
                </RoundedBox>
              )}
            </group>
          );
        })}
        
        {/* Glowing Ascending Trend Line cutting across the chart */}
        <mesh position={[0, 1.5, 0.5]} rotation={[0, 0, Math.PI / 6]}>
          <cylinderGeometry args={[0.03, 0.03, 6.5, 12]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>
        
        {/* Data rings orbiting the chart platform */}
        <mesh rotation={[Math.PI / 2.2, 0, 0]} position={[0, 1, 0]}>
          <torusGeometry args={[3.2, 0.005, 16, 100]} />
          <meshBasicMaterial color="#ea580c" transparent opacity={0.4} />
        </mesh>
        <mesh rotation={[Math.PI / 1.8, 0, 0]} position={[0, 1, 0]}>
          <torusGeometry args={[3.6, 0.003, 16, 100]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.2} />
        </mesh>

      </Float>
    </group>
  );
}

export default function RiskEngine3D() {
  return (
    <div className="w-full h-full absolute inset-0 cursor-move z-20">
      <Canvas camera={{ position: [0, 2, 8], fov: 45 }} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={0.4} />
        <spotLight position={[10, 20, 10]} angle={0.4} penumbra={1} intensity={2} color="#f59e0b" />
        <spotLight position={[-10, 20, -10]} angle={0.4} penumbra={1} intensity={1} color="#ea580c" />
        <pointLight position={[2, 4, 3]} intensity={1.5} color="#ea580c" distance={6} />
        
        <Stars radius={20} depth={50} count={2000} factor={4} saturation={1} fade speed={1.5} />
        
        <FinancialChart />
        
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} maxPolarAngle={Math.PI / 2.1} minPolarAngle={Math.PI / 3} />
      </Canvas>
    </div>
  );
}
