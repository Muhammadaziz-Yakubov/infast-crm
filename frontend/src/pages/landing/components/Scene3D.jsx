import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, Stars, PerspectiveCamera } from '@react-three/drei';

const AnimatedShape = () => {
    const meshRef = useRef();

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        meshRef.current.rotation.x = time * 0.2;
        meshRef.current.rotation.y = time * 0.3;
    });

    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={2}>
            <mesh ref={meshRef}>
                <octahedronGeometry args={[2, 0]} />
                <MeshDistortMaterial
                    color="#3b82f6"
                    speed={3}
                    distort={0.4}
                    radius={1}
                />
            </mesh>
        </Float>
    );
};

const Blob = ({ position, color, speed, distort }) => {
    return (
        <Float speed={speed} rotationIntensity={0.5} floatIntensity={1}>
            <Sphere args={[1, 100, 200]} position={position}>
                <MeshDistortMaterial
                    color={color}
                    speed={speed}
                    distort={distort}
                    radius={1}
                />
            </Sphere>
        </Float>
    );
};

const Scene3D = () => {
    return (
        <div className="absolute inset-0 z-0">
            <Canvas>
                <PerspectiveCamera makeDefault position={[0, 0, 8]} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />

                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                <AnimatedShape />
                <Blob position={[-4, 2, -2]} color="#8b5cf6" speed={2} distort={0.3} />
                <Blob position={[4, -2, -1]} color="#ec4899" speed={1.5} distort={0.5} />
                <Blob position={[2, 3, -3]} color="#3b82f6" speed={2.5} distort={0.4} />

                <gridHelper args={[20, 20, 0xffffff, 0x333333]} position={[0, -5, 0]} rotation={[0, 0, 0]} />
            </Canvas>
        </div>
    );
};

export default Scene3D;
