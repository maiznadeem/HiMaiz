"use client";

import { useEffect, useRef } from "react";

const codeMarks = ["01", "build", "ship", "craft", "{ }", "soon", "maiz", "init"];

function drawRibbon(
    context: CanvasRenderingContext2D,
    width: number,
    height: number,
    time: number,
    index: number,
    pointer: { x: number; y: number; vx: number; vy: number; active: boolean },
) {
    const hue = [176, 205, 44, 338][index % 4];
    const yBase = height * (0.24 + index * 0.15);
    const amplitude = height * (0.045 + index * 0.01);
    const pullRadius = Math.min(width, height) * (0.34 + index * 0.025);
    const pullStrength = pointer.active ? 0.48 - index * 0.045 : 0.12;

    const gradient = context.createLinearGradient(0, yBase - amplitude, width, yBase + amplitude);
    gradient.addColorStop(0, `hsla(${hue}, 88%, 66%, 0)`);
    gradient.addColorStop(0.2, `hsla(${hue}, 88%, 66%, 0.1)`);
    gradient.addColorStop(0.52, `hsla(${hue + 22}, 92%, 72%, 0.24)`);
    gradient.addColorStop(0.84, `hsla(${hue}, 88%, 66%, 0.08)`);
    gradient.addColorStop(1, `hsla(${hue}, 88%, 66%, 0)`);

    context.strokeStyle = gradient;
    context.lineWidth = 52 - index * 5;
    context.beginPath();

    for (let x = -80; x <= width + 80; x += 28) {
        const progress = x / width;
        const restingY =
            yBase +
            Math.sin(progress * 6.2 + time * (0.72 + index * 0.08) + index) * amplitude +
            Math.cos(progress * 10.5 - time * 0.45 + index * 2.2) * amplitude * 0.36;
        const dx = pointer.x - x;
        const dy = pointer.y - restingY;
        const distance = Math.hypot(dx, dy);
        const influence = Math.max(0, 1 - distance / pullRadius) ** 2;
        const xPull = dx * influence * pullStrength * 0.18 + pointer.vx * influence * 0.62;
        const yPull = dy * influence * pullStrength + pointer.vy * influence * 0.72;
        const springRipple = Math.sin(distance * 0.026 - time * 4.2 + index) * influence * 16;
        const y = restingY + yPull + springRipple;
        const pulledX = x + xPull;

        if (x === -80) {
            context.moveTo(pulledX, y);
        } else {
            context.lineTo(pulledX, y);
        }
    }

    context.stroke();
}

export function SignalLoom() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d", { alpha: true });
        if (!context) return;

        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const pointer = {
            x: window.innerWidth * 0.68,
            y: window.innerHeight * 0.42,
            tx: window.innerWidth * 0.68,
            ty: window.innerHeight * 0.42,
            vx: 0,
            vy: 0,
            active: false,
        };

        let frame = 0;
        let animationId = 0;

        const resize = () => {
            const ratio = Math.min(window.devicePixelRatio || 1, 2);
            const width = window.innerWidth;
            const height = window.innerHeight;
            canvas.width = Math.floor(width * ratio);
            canvas.height = Math.floor(height * ratio);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            context.setTransform(ratio, 0, 0, ratio, 0, 0);
        };

        const move = (event: PointerEvent) => {
            pointer.tx = event.clientX;
            pointer.ty = event.clientY;
            pointer.active = true;
        };

        const leave = () => {
            pointer.active = false;
            pointer.tx = window.innerWidth * 0.68;
            pointer.ty = window.innerHeight * 0.42;
        };

        const draw = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            const time = frame * 0.012;
            const isCompact = width < 720;

            const stiffness = pointer.active ? 0.028 : 0.018;
            const damping = pointer.active ? 0.82 : 0.86;
            pointer.vx = (pointer.vx + (pointer.tx - pointer.x) * stiffness) * damping;
            pointer.vy = (pointer.vy + (pointer.ty - pointer.y) * stiffness) * damping;
            pointer.x += pointer.vx;
            pointer.y += pointer.vy;

            context.clearRect(0, 0, width, height);

            const base = context.createLinearGradient(0, 0, width, height);
            base.addColorStop(0, "#07151a");
            base.addColorStop(0.42, "#11161d");
            base.addColorStop(1, "#211219");
            context.fillStyle = base;
            context.fillRect(0, 0, width, height);

            context.save();
            context.globalCompositeOperation = "screen";
            context.filter = "blur(22px)";
            context.globalAlpha = isCompact ? 0.62 : 1;
            for (let i = 0; i < 4; i += 1) {
                drawRibbon(context, width, height, time, i, pointer);
            }
            context.restore();

            context.save();
            context.globalCompositeOperation = "lighter";
            context.filter = "blur(1px)";
            context.globalAlpha = isCompact ? 0.52 : 1;
            for (let i = 0; i < 4; i += 1) {
                drawRibbon(context, width, height, time + 0.4, i, pointer);
            }
            context.restore();

            const lensRadius = Math.min(width, height) * (pointer.active ? 0.28 : 0.21);
            const lens = context.createRadialGradient(
                pointer.x,
                pointer.y,
                0,
                pointer.x,
                pointer.y,
                lensRadius,
            );
            lens.addColorStop(0, "rgba(255, 248, 238, 0.17)");
            lens.addColorStop(0.28, "rgba(132, 245, 218, 0.11)");
            lens.addColorStop(0.62, "rgba(255, 111, 145, 0.055)");
            lens.addColorStop(1, "rgba(255, 248, 238, 0)");
            context.fillStyle = lens;
            context.fillRect(0, 0, width, height);

            context.save();
            context.globalAlpha = 0.16;
            context.strokeStyle = "rgba(255, 248, 238, 0.5)";
            context.lineWidth = 1;
            for (let i = 0; i < 9; i += 1) {
                const radius = lensRadius * (0.18 + i * 0.085);
                context.beginPath();
                context.ellipse(
                    pointer.x + Math.sin(time + i) * 10,
                    pointer.y + Math.cos(time * 0.7 + i) * 8,
                    radius * 1.34,
                    radius * 0.48,
                    time * 0.12 + i * 0.34,
                    0,
                    Math.PI * 2,
                );
                context.stroke();
            }
            context.restore();

            context.save();
            context.font = "12px Geist Mono, ui-monospace, monospace";
            context.textBaseline = "middle";
            for (let i = 0; i < 28; i += 1) {
                const column = (i * 0.137 + time * 0.012) % 1;
                const x = column * width;
                const y =
                    (height * (0.12 + ((i * 29) % 76) / 100) + Math.sin(time + i) * 18) % height;
                context.fillStyle = `rgba(255, 248, 238, ${0.035 + (i % 4) * 0.016})`;
                context.fillText(codeMarks[i % codeMarks.length], x, y);
            }
            context.restore();

            context.fillStyle = "rgba(255, 252, 244, 0.032)";
            for (let y = 0; y < height; y += 6) {
                context.fillRect(0, y, width, 1);
            }

            const vignette = context.createRadialGradient(
                width * 0.46,
                height * 0.46,
                Math.min(width, height) * 0.2,
                width * 0.46,
                height * 0.46,
                Math.max(width, height) * 0.72,
            );
            vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
            vignette.addColorStop(1, "rgba(0, 0, 0, 0.42)");
            context.fillStyle = vignette;
            context.fillRect(0, 0, width, height);

            frame += 1;
            if (!reduced) animationId = window.requestAnimationFrame(draw);
        };

        resize();
        draw();

        window.addEventListener("resize", resize);
        window.addEventListener("pointermove", move);
        window.addEventListener("pointerleave", leave);

        return () => {
            window.cancelAnimationFrame(animationId);
            window.removeEventListener("resize", resize);
            window.removeEventListener("pointermove", move);
            window.removeEventListener("pointerleave", leave);
        };
    }, []);

    return <canvas ref={canvasRef} className="signal-loom" aria-hidden="true" />;
}
