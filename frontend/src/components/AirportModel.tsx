import React, { useMemo } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

// Helper for labels used throughout the airport
const Label = ({ position, text, size = 1.2, rotation = [0, 0, 0] as [number, number, number] }) => (
    <Text
        position={position}
        color="#333"
        fontSize={size}
        anchorX="center"
        anchorY="middle"
        rotation={rotation}
        outlineWidth={0.05}
        outlineColor="white"
    >
        {text}
    </Text>
);

// Reusable component for realistic chairs, as in your original design
const RealisticChair: React.FC<{ position: [number, number, number], rotation?: [number, number, number] }> = ({ position, rotation = [0, 0, 0] }) => {
    const metalMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: 0x708090, roughness: 0.2, metalness: 0.8 }), []);
    const leatherMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: 0x2c2c2c, roughness: 0.6, metalness: 0.0 }), []);

    return (
        <group position={position} rotation={rotation}>
            <mesh castShadow position={[0, 0.5, 0]}>
                <boxGeometry args={[0.6, 0.1, 0.6]} />
                <primitive object={leatherMaterial} attach="material" />
            </mesh>
            <mesh castShadow position={[0, 0.9, -0.25]}>
                <boxGeometry args={[0.6, 0.8, 0.1]} />
                <primitive object={leatherMaterial} attach="material" />
            </mesh>
            {/* Legs */}
            {[[-0.25, -0.25], [0.25, -0.25], [-0.25, 0.25], [0.25, 0.25]].map(([x, z], i) => (
                <mesh key={i} position={[x, 0.25, z]}>
                    <cylinderGeometry args={[0.03, 0.03, 0.5, 8]} />
                    <primitive object={metalMaterial} attach="material" />
                </mesh>
            ))}
            {/* Armrests */}
            <mesh position={[-0.35, 0.7, -0.1]}><boxGeometry args={[0.1, 0.1, 0.4]} /><primitive object={leatherMaterial} attach="material" /></mesh>
            <mesh position={[0.35, 0.7, -0.1]}><boxGeometry args={[0.1, 0.1, 0.4]} /><primitive object={leatherMaterial} attach="material" /></mesh>
        </group>
    );
};

// Reusable component for plants
const Plant: React.FC<{ position: [number, number, number], size?: number }> = ({ position, size = 1 }) => {
    const potMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.8 }), []);
    const stemMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: 0x228b22 }), []);
    const leafMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: 0x32cd32 }), []);

    return (
        <group position={position}>
            <mesh position={[0, 0.2 * size, 0]}>
                <cylinderGeometry args={[0.3 * size, 0.4 * size, 0.4 * size, 16]} />
                <primitive object={potMaterial} attach="material" />
            </mesh>
            <mesh position={[0, 0.9 * size, 0]}>
                <cylinderGeometry args={[0.02 * size, 0.02 * size, 1 * size, 8]} />
                <primitive object={stemMaterial} attach="material" />
            </mesh>
            {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i / 12) * Math.PI * 2;
                return (
                    <mesh
                        key={i}
                        position={[
                            Math.cos(angle) * 0.3 * size + (Math.random() - 0.5) * 0.1 * size,
                            1.2 * size + Math.sin(i) * 0.2 * size,
                            Math.sin(angle) * 0.3 * size + (Math.random() - 0.5) * 0.1 * size
                        ]}
                        rotation={[Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]}
                        scale={[1, 0.3, 1]}
                    >
                        <sphereGeometry args={[0.15 * size, 10, 10]} />
                        <primitive object={leafMaterial} attach="material" />
                    </mesh>
                );
            })}
        </group>
    );
};


// The main Airport Model Component
export const AirportModel: React.FC<{ route: any[] }> = ({ route }) => {
    // Convert route coordinates for 3D space
    const pathPoints = route.map(p => new THREE.Vector3(p.x, 0.2, p.y));
    const pathCurve = pathPoints.length > 1 ? new THREE.CatmullRomCurve3(pathPoints) : null;

    // --- Materials (defined once with useMemo for performance) ---
    const floorMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#f5f5f5', roughness: 0.1 }), []);
    const wallMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#f5f5f5', roughness: 0.3 }), []);
    const carpetMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2c5aa0', roughness: 0.8 }), []);
    const woodMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#8b4513', roughness: 0.7 }), []);
    const baggageMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#404040', metalness: 0.6, roughness: 0.4 }), []);
    const signageMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#4169e1' }), []);
    const metalMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: 0x708090, roughness: 0.2, metalness: 0.8 }), []);
    const restroomMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: 0xe1bee7, roughness: 0.3 }), []);
    const loungeMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: 0x8b0000, roughness: 0.5 }), []);


    return (
        <>
            {/* --- Lighting Setup from your index.html --- */}
            <ambientLight intensity={0.4} />
            <directionalLight
                position={[50, 80, 50]}
                intensity={0.7}
                castShadow
                shadow-mapSize-width={4096}
                shadow-mapSize-height={4096}
            />
            {Array.from({ length: 80 }).map((_, i) => {
                 const x = -40 + (i % 9) * 10;
                 const z = -25 + Math.floor(i / 9) * 10;
                 return <pointLight key={i} position={[x, 3.2, z]} intensity={0.2} distance={15} />
            })}

            {/* --- Main Structure --- */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[120, 70]} />
                <primitive object={floorMaterial} attach="material" />
            </mesh>
            <mesh position={[0, 4.1, 0]}>
                <planeGeometry args={[120, 70]} />
                <meshStandardMaterial color="#f8f8f8" side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, 2, -35.15]}><boxGeometry args={[120, 4, 0.3]} /><primitive object={wallMaterial} attach="material" /></mesh>
            <mesh position={[-35, 2, 35.15]}><boxGeometry args={[50, 4, 0.3]} /><primitive object={wallMaterial} attach="material" /></mesh>
            <mesh position={[35, 2, 35.15]}><boxGeometry args={[50, 4, 0.3]} /><primitive object={wallMaterial} attach="material" /></mesh>
            <mesh position={[-60.15, 2, 0]}><boxGeometry args={[0.3, 4, 70.3]} /><primitive object={wallMaterial} attach="material" /></mesh>
            <mesh position={[60.15, 2, 0]}><boxGeometry args={[0.3, 4, 70.3]} /><primitive object={wallMaterial} attach="material" /></mesh>


            {/* --- Airport Features --- */}
            <Label position={[0, 1, 10]} text="Main Terminal Hall" />
            <Label position={[0, 1, 25]} text="Main Entrance" />
            
            {/* Check-in Counters */}
            {Array.from({ length: 15 }).map((_, i) => (
                <mesh key={`checkin-${i}`} position={[-55 + i * 4, 0.6, 10]} castShadow>
                    <boxGeometry args={[3.5, 1.2, 1.5]} />
                    <primitive object={woodMaterial} attach="material" />
                </mesh>
            ))}
            <Label position={[-25, 3.5, 10]} text="Check-in Counters" />

            {/* Security */}
            <mesh position={[0, 0.01, 0]}><planeGeometry args={[40, 8]} /><meshStandardMaterial color="#e0e0e0" /></mesh>
            <Label position={[0, 3.5, 3]} text="Security Checkpoints" />

            {/* Concourses */}
            <mesh position={[-40, 0.01, -10]}><planeGeometry args={[30, 40]} /><primitive object={carpetMaterial} attach="material" /></mesh>
            <Label position={[-40, 3.5, -5]} text="Terminal A" />

            <mesh position={[40, 0.01, -10]}><planeGeometry args={[30, 40]} /><primitive object={carpetMaterial} attach="material" /></mesh>
            <Label position={[40, 3.5, -5]} text="Terminal B" />
            
            {/* Gates */}
            {Array.from({ length: 5 }).map((_, i) => <Label key={`gate-a-${i}`} position={[-52 + i * 6, 2.5, -28]} text={`A${i + 1}`} />)}
            {Array.from({ length: 5 }).map((_, i) => <Label key={`gate-b-${i}`} position={[28 + i * 6, 2.5, -28]} text={`B${i + 1}`} />)}

            {/* Baggage Claim */}
            <mesh position={[-45, 0.3, 10]} rotation={[0, 0, -Math.PI / 2]}><torusGeometry args={[4, 0.3, 8, 32]} /><primitive object={baggageMaterial} attach="material" /></mesh>
            <Label position={[-45, 3.5, 15]} text="Baggage Claim 1" />

            <mesh position={[45, 0.3, 10]} rotation={[0, 0, -Math.PI / 2]}><torusGeometry args={[4, 0.3, 8, 32]} /><primitive object={baggageMaterial} attach="material" /></mesh>
            <Label position={[45, 3.5, 15]} text="Baggage Claim 2" />

            {/* Information Desk */}
            <mesh position={[0, 0.6, -2]} castShadow><cylinderGeometry args={[2, 2, 1.2, 32]} /><primitive object={signageMaterial} attach="material" /></mesh>
            <Label position={[0, 2.5, -2]} text="Information" />

            {/* Other Labels & Features */}
            <Label position={[-25, 2.5, -15]} text="Restrooms" />
            <Label position={[25, 2.5, -15]} text="Restrooms" />
            <Label position={[0, 3.5, -25]} text="Food Court" />
            <Label position={[-40, 2.5, 5]} text="Airport Lounge" />
            <Label position={[0, 4.5, -45]} text="Connecting Bridge" />

             {/* Seating Areas */}
            {Array.from({ length: 3 }).map((_, i) => <RealisticChair key={`seat-a-${i}`} position={[-52 + i * 1.5, 0, -20]} rotation={[0, Math.PI, 0]} />)}
            {Array.from({ length: 3 }).map((_, i) => <RealisticChair key={`seat-b-${i}`} position={[28 + i * 1.5, 0, -20]} rotation={[0, Math.PI, 0]} />)}

            {/* Plants */}
            <Plant position={[-15, 0, 12]} />
            <Plant position={[15, 0, 12]} />
            <Plant position={[-30, 0, -5]} />
            <Plant position={[30, 0, -5]} />

            {/* --- Dynamic Navigation Path --- */}
            {pathCurve && (
                <mesh>
                    <tubeGeometry args={[pathCurve, 64, 0.2, 8, false]} />
                    <meshStandardMaterial color="yellow" emissive="yellow" emissiveIntensity={2} toneMapped={false} />
                </mesh>
            )}
        </>
    );
};