import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

const Globe = () => {
    const meshRef = useRef();

    useFrame((state, delta) => {
        meshRef.current.rotation.y += delta * 0.1;
    });

    const points = useMemo(() => {
        const p = [];
        for (let i = 0; i < 50; i++) {
            const lat = (Math.random() - 0.5) * Math.PI;
            const lon = (Math.random() - 0.5) * Math.PI * 2;
            const r = 1.5;
            const x = r * Math.cos(lat) * Math.cos(lon);
            const y = r * Math.sin(lat);
            const z = r * Math.cos(lat) * Math.sin(lon);
            p.push(new THREE.Vector3(x, y, z));
        }
        return p;
    }, []);

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <sphereGeometry args={[1.5, 64, 64]} />
            <mesh ref={meshRef}>
                <sphereGeometry args={[1.48, 64, 64]} />
                <meshStandardMaterial
                    color="#4f46e5"
                    metalness={0.6}
                    roughness={0.7}
                    opacity={0.8}
                    transparent
                />
                {points.map((pos, i) => (
                    <mesh key={i} position={pos}>
                        <sphereGeometry args={[0.03, 16, 16]} />
                        <meshBasicMaterial color="#ffffff" />
                    </mesh>
                ))}
            </mesh>
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        </>
    );
};

export const LiveGlobe = () => {
    return (
        <div className="w-full h-[400px] bg-black rounded-xl overflow-hidden relative shadow-2xl">
            <div className="absolute top-4 left-4 z-10">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    Live Activity
                </h3>
                <p className="text-gray-400 text-xs">Real-time reader locations</p>
            </div>
            <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
                <Globe />
                <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
            </Canvas>
        </div>
    );
};
