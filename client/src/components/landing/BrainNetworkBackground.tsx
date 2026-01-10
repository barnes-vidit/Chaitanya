import React, { useEffect, useRef } from 'react';

const BrainNetworkBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.width = canvas.offsetWidth;
        let height = canvas.height = canvas.offsetHeight;

        // --- Configuration ---
        const SCALE = 3.2;
        const ROTATION_SPEED_BASE = 0.002;
        const CONNECTION_DISTANCE = 50;
        const MOUSE_INFLUENCE_RADIUS = 70;

        // --- State ---
        let rotationX = 0;
        let rotationY = Math.PI / 2;
        let mouseX = -1000;
        let mouseY = -1000;

        interface Point3D {
            x: number;
            y: number;
            z: number;
            baseX: number;
            baseY: number;
            baseZ: number;
            energy: number;
        }

        const nodes: Point3D[] = [];

        // --- Initialization: Anatomical Brain Shape ---

        const addNode = (x: number, y: number, z: number) => {
            const jitter = () => (Math.random() - 0.5) * 10;
            nodes.push({
                x: 0, y: 0, z: 0,
                baseX: (x + jitter()) * SCALE,
                baseY: (y + jitter()) * SCALE,
                baseZ: (z + jitter()) * SCALE,
                energy: 0
            });
        };

        // 1. Cerebrum (Two hemispheres) - Optimized Count (180)
        const CEREBRUM_COUNT = 180;
        for (let i = 0; i < CEREBRUM_COUNT; i++) {
            const u = Math.random();
            const v = Math.random();
            const theta = 2 * Math.PI * u;
            const phi = Math.acos(2 * v - 1);
            let r = Math.cbrt(Math.random()) * 80;

            let x = r * Math.sin(phi) * Math.cos(theta);
            let y = r * Math.sin(phi) * Math.sin(theta);
            let z = r * Math.cos(phi);

            x *= 1.2;
            y *= 0.9;

            if (Math.abs(z) < 15) {
                const side = z > 0 ? 1 : -1;
                z = 15 * side + (z * 0.5);
            }

            if (y < -20) y *= 0.5;

            addNode(x, -y, z);
        }

        // 2. Cerebellum (Back bottom bump) - Optimized Count (50)
        const CEREBELLUM_COUNT = 50;
        for (let i = 0; i < CEREBELLUM_COUNT; i++) {
            const u = Math.random();
            const v = Math.random();
            const theta = 2 * Math.PI * u;
            const phi = Math.acos(2 * v - 1);
            let r = Math.cbrt(Math.random()) * 35;

            let x = r * Math.sin(phi) * Math.cos(theta);
            let y = r * Math.sin(phi) * Math.sin(theta);
            let z = r * Math.cos(phi);

            y *= 0.6;
            x *= 0.8;

            addNode(x - 60, -y + 40, z);
        }

        // 3. Brainstem (Spinal Cord top) - Optimized Count (30)
        const STEM_COUNT = 30;
        for (let i = 0; i < STEM_COUNT; i++) {
            const h = Math.random() * 60;
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * 15;

            let x = r * Math.cos(angle);
            let z = r * Math.sin(angle);
            let y = -h;

            x -= 20 + (h * 0.2);
            y -= 10;

            addNode(x, -y + 50, z);
        }

        // --- Interaction ---
        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
        };
        const handleMouseLeave = () => {
            mouseX = -1000;
            mouseY = -1000;
        }

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', handleMouseLeave);

        // --- Animation Loop ---
        const animate = () => {
            if (!ctx) return;

            try {
                ctx.clearRect(0, 0, width, height);

                const centerX = width / 2;
                const centerY = height / 2 - 120; // Shifted UP

                rotationY += ROTATION_SPEED_BASE;
                rotationX = Math.sin(Date.now() * 0.001) * 0.05;

                const projectedNodes: { x: number, y: number, scale: number, idx: number }[] = [];

                nodes.forEach((node, idx) => {
                    let x = node.baseX * Math.cos(rotationY) - node.baseZ * Math.sin(rotationY);
                    let z = node.baseX * Math.sin(rotationY) + node.baseZ * Math.cos(rotationY);

                    let y = node.baseY * Math.cos(rotationX) - z * Math.sin(rotationX);
                    z = node.baseY * Math.sin(rotationX) + z * Math.cos(rotationX);

                    node.x = x;
                    node.y = y;
                    node.z = z;

                    node.energy *= 0.95;

                    const focalLength = 800;
                    const scale = focalLength / (focalLength + z);
                    const x2d = x * scale + centerX;
                    const y2d = y * scale + centerY;

                    const dx = x2d - mouseX;
                    const dy = y2d - mouseY;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < MOUSE_INFLUENCE_RADIUS) {
                        node.energy = Math.min(node.energy + 0.1, 1);
                    }

                    if (Math.random() < 0.001) node.energy = 1;

                    projectedNodes.push({ x: x2d, y: y2d, scale, idx });
                });

                projectedNodes.sort((a, b) => a.scale - b.scale);

                ctx.globalCompositeOperation = 'screen';

                for (let i = 0; i < projectedNodes.length; i++) {
                    const p1 = projectedNodes[i];
                    const n1 = nodes[p1.idx];

                    for (let j = i + 1; j < projectedNodes.length; j++) {
                        const p2 = projectedNodes[j];
                        const n2 = nodes[p2.idx];

                        // Optimization: Bounding box check before square distance
                        const dx = n1.x - n2.x;
                        if (Math.abs(dx) > CONNECTION_DISTANCE) continue;

                        const dy = n1.y - n2.y;
                        if (Math.abs(dy) > CONNECTION_DISTANCE) continue;

                        const dz = n1.z - n2.z;
                        const distSq = dx * dx + dy * dy + dz * dz;

                        if (distSq < CONNECTION_DISTANCE * CONNECTION_DISTANCE) {
                            const dist = Math.sqrt(distSq);
                            const opacity = 1 - (dist / CONNECTION_DISTANCE);
                            const energy = Math.max(n1.energy, n2.energy);

                            ctx.beginPath();
                            ctx.moveTo(p1.x, p1.y);
                            ctx.lineTo(p2.x, p2.y);

                            if (energy > 0.1) {
                                ctx.strokeStyle = `rgba(100, 200, 255, ${opacity * (0.2 + energy * 0.8)})`;
                                ctx.lineWidth = 1 + energy * 1.5;
                            } else {
                                ctx.strokeStyle = `rgba(50, 80, 120, ${opacity * 0.15})`;
                                ctx.lineWidth = 0.5;
                            }

                            ctx.stroke();
                        }
                    }
                }

                projectedNodes.forEach(p => {
                    const n = nodes[p.idx];
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 2 * p.scale + (n.energy * 2), 0, Math.PI * 2);

                    // Optimization: Only use shadowBlur for high energy nodes (active thoughts)
                    // shadowBlur is extremely expensive in Canvas 2D
                    if (n.energy > 0.3) {
                        ctx.fillStyle = `rgba(255, 255, 255, ${0.8 + n.energy * 0.2})`;
                        ctx.shadowColor = '#5DADE2';
                        ctx.shadowBlur = 15 * n.energy; // Only blur really bright ones
                    } else {
                        ctx.fillStyle = `rgba(93, 173, 226, ${0.4 * p.scale})`;
                        ctx.shadowBlur = 0;
                    }
                    ctx.fill();
                });

                ctx.globalCompositeOperation = 'source-over';

                requestAnimationFrame(animate);

            } catch (err) {
                console.error("Brain animation error:", err);
            }
        };

        const animId = requestAnimationFrame(animate);

        const handleResize = () => {
            width = canvas.width = canvas.offsetWidth;
            height = canvas.height = canvas.offsetHeight;
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-full cursor-crosshair opacity-90"
        />
    );
};

export default BrainNetworkBackground;
