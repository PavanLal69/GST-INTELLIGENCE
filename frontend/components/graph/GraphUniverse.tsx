"use client";

import { useGraphStore } from "@/store/useGraphStore";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";

// Camera Animation Controller Component
const CameraController = ({ targetPosition, isAnalyzing }: { targetPosition: [number, number, number] | null, isAnalyzing: boolean }) => {
    const { camera } = useThree();
    const controlsRef = useRef<any>(null);

    useEffect(() => {
        if (targetPosition && !isAnalyzing) {
            // Animate Camera Position using GSAP
            gsap.to(camera.position, {
                x: targetPosition[0],
                y: targetPosition[1] + 2, // Slightly above
                z: targetPosition[2] + 4, // Zoomed in
                duration: 2,
                ease: "power3.inOut"
            });

            // Animate OrbitControls Target
            if (controlsRef.current) {
                gsap.to(controlsRef.current.target, {
                    x: targetPosition[0],
                    y: targetPosition[1],
                    z: targetPosition[2],
                    duration: 2,
                    ease: "power3.inOut"
                });
            }
        } else if (!targetPosition) {
            // Reset Camera
            gsap.to(camera.position, { x: 0, y: 0, z: 15, duration: 2, ease: "power2.out" });
            if (controlsRef.current) {
                gsap.to(controlsRef.current.target, { x: 0, y: 0, z: 0, duration: 2, ease: "power2.out" });
            }
        }
    }, [targetPosition, isAnalyzing, camera]);

    return (
        <OrbitControls
            ref={controlsRef}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            autoRotate={!targetPosition}
            autoRotateSpeed={0.5}
        />
    );
};

// Simulated Graph Data (normally fetched from API or generated from ingested nodes)
const initialNodes = [
    { id: "Taxpayer:GSTIN_A", pos: [-5, 0, -2], color: "#3b82f6" },
    { id: "Taxpayer:GSTIN_B", pos: [0, 2, 0], color: "#ef4444" }, // Risky
    { id: "Taxpayer:GSTIN_C", pos: [5, 0, -2], color: "#3b82f6" },
    { id: "Taxpayer:GSTIN_D", pos: [0, -4, 2], color: "#3b82f6" },

    // Invoices floating between
    { id: "Invoice:INV-AB-1", pos: [-2.5, 1, -1], color: "#eab308" },
    { id: "Invoice:INV-BC-1", pos: [2.5, 1, -1], color: "#eab308" },
    { id: "Invoice:INV-CA-1", pos: [0, 0, -3], color: "#eab308" },
    { id: "Invoice:INV-BD-1", pos: [0, -1, 1], color: "#eab308" },
];

const initialEdges = [
    { source: "Taxpayer:GSTIN_A", target: "Taxpayer:GSTIN_B" },
    { source: "Taxpayer:GSTIN_B", target: "Taxpayer:GSTIN_C" },
    { source: "Taxpayer:GSTIN_C", target: "Taxpayer:GSTIN_A" }, // Circular
    { source: "Taxpayer:GSTIN_B", target: "Taxpayer:GSTIN_D" }, // Normal
];

export const GraphUniverse = () => {
    const { focusedNodeId, auditData, isAnalyzing } = useGraphStore();

    const focusedNode = initialNodes.find(n => n.id === focusedNodeId);
    const targetPos = focusedNode ? (focusedNode.pos as [number, number, number]) : null;

    return (
        <div className="absolute inset-0 w-full h-full bg-background z-0">
            <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
                {/* Cinematic GSAP Animated Camera Controller */}
                <CameraController targetPosition={targetPos} isAnalyzing={isAnalyzing} />

                {/* Lights */}
                <ambientLight intensity={0.2} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#60a5fa" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ef4444" />

                {/* Environment particles */}
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                {/* Graph Nodes */}
                {initialNodes.map((n) => {
                    // Highlight logic
                    let isTarget = focusedNodeId === n.id;
                    let isInPath = false;
                    let isCycle = false;

                    if (auditData) {
                        // Check if node is in mismatches path
                        isInPath = auditData.mismatches.some((m: any) => m.traversal_path.includes(n.id)) || auditData.explanation.includes(n.id);
                        if (auditData.overall_risk === "Critical (Cycle Detected)") {
                            // Approximate cycle nodes mapping for demo effect
                            if (n.id === "Taxpayer:GSTIN_B" || n.id === "Taxpayer:GSTIN_C" || n.id === "Taxpayer:GSTIN_A") {
                                isCycle = true;
                            }
                        }
                    }

                    let meshColor = n.color;
                    let scale = 1;

                    if (isTarget) {
                        meshColor = "#ffffff";
                        scale = 1.5;
                    } else if (isInPath) {
                        meshColor = "#ef4444";
                        scale = 1.2;
                    }

                    return (
                        <mesh key={n.id} position={n.pos as [number, number, number]} scale={scale}>
                            <sphereGeometry args={[isCycle ? 0.6 : 0.4, 32, 32]} />
                            <meshStandardMaterial
                                color={meshColor}
                                emissive={meshColor}
                                emissiveIntensity={isTarget || isInPath || isCycle ? 2 : 0.5}
                                wireframe={isCycle}
                            />
                        </mesh>
                    );
                })}

                {/* Connections / Edges */}
                {initialEdges.map((e, i) => {
                    const src = initialNodes.find(n => n.id === e.source);
                    const tgt = initialNodes.find(n => n.id === e.target);
                    if (!src || !tgt) return null;

                    const points = [
                        new THREE.Vector3(...src.pos),
                        new THREE.Vector3(...tgt.pos)
                    ];
                    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

                    let isCycleEdge = auditData && auditData.overall_risk === "Critical (Cycle Detected)" &&
                        ["Taxpayer:GSTIN_B", "Taxpayer:GSTIN_C", "Taxpayer:GSTIN_A"].includes(src.id) &&
                        ["Taxpayer:GSTIN_B", "Taxpayer:GSTIN_C", "Taxpayer:GSTIN_A"].includes(tgt.id);

                    return (
                        <primitive key={i} object={new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({
                            color: isCycleEdge ? "#ef4444" : "#ffffff",
                            transparent: true,
                            opacity: isCycleEdge ? 0.8 : 0.2,
                            linewidth: isCycleEdge ? 3 : 1
                        }))} />
                    );
                })}

                {/* Orbit Controls extracted to GSAP controller above */}

                {/* Post Processing for Cinematic Bloom Glow */}
                <EffectComposer>
                    <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={1.5} />
                </EffectComposer>
            </Canvas>
        </div>
    );
};
