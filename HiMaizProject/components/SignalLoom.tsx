"use client";

import { useEffect, useRef } from "react";

type PointerState = {
    x: number;
    y: number;
    tx: number;
    ty: number;
    vx: number;
    vy: number;
    active: boolean;
};

function roundedRect(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
) {
    const r = Math.min(radius, width / 2, height / 2);
    context.beginPath();
    context.moveTo(x + r, y);
    context.arcTo(x + width, y, x + width, y + height, r);
    context.arcTo(x + width, y + height, x, y + height, r);
    context.arcTo(x, y + height, x, y, r);
    context.arcTo(x, y, x + width, y, r);
    context.closePath();
}

function drawUndertones(
    context: CanvasRenderingContext2D,
    width: number,
    height: number,
    time: number,
    pointer: PointerState,
) {
    context.fillStyle = "#050606";
    context.fillRect(0, 0, width, height);

    const ribCount = Math.max(10, Math.round(width / 120));
    const ribWidth = width / ribCount;
    const centerX = width * 0.66 + (pointer.x - width * 0.5) * 0.14;
    const centerY = height * 0.51 + (pointer.y - height * 0.5) * 0.12;
    const glowWidth = Math.max(width * 0.48, 520);
    const glowHeight = Math.max(height * 0.34, 220);

    context.save();
    context.globalCompositeOperation = "screen";
    context.filter = `blur(${Math.max(22, width * 0.025)}px)`;
    const bloom = context.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        glowWidth * 0.68,
    );
    bloom.addColorStop(0, "rgba(255, 107, 70, 0.8)");
    bloom.addColorStop(0.26, "rgba(255, 70, 32, 0.48)");
    bloom.addColorStop(0.62, "rgba(155, 38, 13, 0.16)");
    bloom.addColorStop(1, "rgba(0, 0, 0, 0)");
    context.fillStyle = bloom;
    context.fillRect(0, 0, width, height);
    context.restore();

    for (let index = 0; index < ribCount; index += 1) {
        const x = index * ribWidth;
        const ribCenter = x + ribWidth * 0.5;
        const distance = Math.abs(ribCenter - centerX) / glowWidth;
        const intensity = Math.max(0, 1 - distance) ** 1.55;
        const ripple = Math.sin(time * 0.72 + index * 0.63) * height * 0.014;
        const pointerWave =
            Math.sin(index * 0.82 - time * 1.25) *
            Math.max(0, 1 - Math.abs(ribCenter - pointer.x) / (ribWidth * 4.5)) *
            pointer.vy *
            0.42;
        const litHeight = glowHeight * (0.7 + intensity * 0.42);
        const top = centerY - litHeight * 0.5 + ripple + pointerWave;
        const inset = Math.max(2, ribWidth * 0.08);

        context.save();
        roundedRect(context, x + inset, top, ribWidth - inset * 2, litHeight, ribWidth * 0.2);
        context.clip();

        const verticalLight = context.createLinearGradient(0, top, 0, top + litHeight);
        verticalLight.addColorStop(0, "rgba(20, 7, 3, 0)");
        verticalLight.addColorStop(0.18, `rgba(109, 30, 14, ${intensity * 0.28})`);
        verticalLight.addColorStop(0.42, `rgba(255, 92, 52, ${intensity * 0.94})`);
        verticalLight.addColorStop(0.68, `rgba(222, 61, 31, ${intensity * 0.76})`);
        verticalLight.addColorStop(1, "rgba(16, 5, 2, 0)");
        context.fillStyle = verticalLight;
        context.fillRect(x, top, ribWidth, litHeight);

        const glass = context.createLinearGradient(x, 0, x + ribWidth, 0);
        glass.addColorStop(0, "rgba(0, 0, 0, 0.88)");
        glass.addColorStop(0.14, `rgba(255, 76, 26, ${intensity * 0.19})`);
        glass.addColorStop(0.42, `rgba(255, 207, 166, ${intensity * 0.16})`);
        glass.addColorStop(0.72, "rgba(4, 8, 10, 0.58)");
        glass.addColorStop(0.9, "rgba(0, 0, 0, 0.95)");
        glass.addColorStop(1, "rgba(3, 9, 12, 1)");
        context.fillStyle = glass;
        context.fillRect(x, top, ribWidth, litHeight);
        context.restore();

        const ribShade = context.createLinearGradient(x, 0, x + ribWidth, 0);
        ribShade.addColorStop(0, "rgba(0, 0, 0, 0.94)");
        ribShade.addColorStop(0.12, "rgba(255, 255, 255, 0.025)");
        ribShade.addColorStop(0.48, "rgba(255, 255, 255, 0)");
        ribShade.addColorStop(0.82, "rgba(0, 0, 0, 0.34)");
        ribShade.addColorStop(0.96, "rgba(0, 0, 0, 0.9)");
        ribShade.addColorStop(1, "rgba(58, 108, 128, 0.09)");
        context.fillStyle = ribShade;
        context.fillRect(x, 0, ribWidth, height);

        context.fillStyle = "rgba(128, 188, 205, 0.035)";
        context.fillRect(x + ribWidth - 1, 0, 1, height);
    }

    context.save();
    context.globalAlpha = 0.1;
    for (let y = 0; y < height; y += 3) {
        const wave = Math.sin(y * 0.08 + time * 0.9) * 0.5 + 0.5;
        context.fillStyle = `rgba(255, 124, 82, ${0.012 + wave * 0.018})`;
        context.fillRect(0, y, width, 1);
    }
    context.restore();

    context.save();
    context.globalAlpha = 0.12;
    for (let i = 0; i < Math.floor((width * height) / 340); i += 1) {
        const x = (i * 71.37 + time * 18) % width;
        const y = (i * 37.91 + time * 11) % height;
        const value = 110 + ((i * 29) % 90);
        context.fillStyle = `rgb(${value}, ${value * 0.74}, ${value * 0.62})`;
        context.fillRect(x, y, 0.7, 0.7);
    }
    context.restore();

    const vignette = context.createRadialGradient(
        centerX,
        centerY,
        Math.min(width, height) * 0.12,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.75,
    );
    vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
    vignette.addColorStop(0.54, "rgba(0, 0, 0, 0.08)");
    vignette.addColorStop(1, "rgba(0, 0, 0, 0.72)");
    context.fillStyle = vignette;
    context.fillRect(0, 0, width, height);
}

export function SignalLoom() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d", { alpha: false });
        if (!context) return;

        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const pointer: PointerState = {
            x: window.innerWidth * 0.66,
            y: window.innerHeight * 0.5,
            tx: window.innerWidth * 0.66,
            ty: window.innerHeight * 0.5,
            vx: 0,
            vy: 0,
            active: false,
        };

        let frame = 0;
        let animationId = 0;

        const resize = () => {
            const ratio = Math.min(window.devicePixelRatio || 1, 1.75);
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
            pointer.tx = window.innerWidth * 0.66;
            pointer.ty = window.innerHeight * 0.5;
        };

        const draw = () => {
            const stiffness = pointer.active ? 0.024 : 0.012;
            const damping = pointer.active ? 0.84 : 0.89;
            pointer.vx = (pointer.vx + (pointer.tx - pointer.x) * stiffness) * damping;
            pointer.vy = (pointer.vy + (pointer.ty - pointer.y) * stiffness) * damping;
            pointer.x += pointer.vx;
            pointer.y += pointer.vy;

            drawUndertones(context, window.innerWidth, window.innerHeight, frame * 0.012, pointer);

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
