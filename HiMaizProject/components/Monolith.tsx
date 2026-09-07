"use client";

import { useEffect, useRef, useState } from "react";

const LOGO_PATH = "M26 94V34H48L64 62L80 34H102V94H86V58L70 86H58L42 58V94H26Z";
const OUTLINE = [
    [26, 94],
    [26, 34],
    [48, 34],
    [64, 62],
    [80, 34],
    [102, 34],
    [102, 94],
    [86, 94],
    [86, 58],
    [70, 86],
    [58, 86],
    [42, 58],
    [42, 94],
] as const;

function placement(width: number, height: number, contentBottom: number) {
    const desktop = window.innerWidth >= 760 || width > height * 1.6;
    const artworkTop = Math.max(contentBottom + 20, height * 0.43);
    const artworkBottom = height - 64;
    return {
        x: width * (desktop ? 0.74 : 0.6),
        y: desktop ? height * 0.48 : (artworkTop + artworkBottom) / 2,
        size: desktop
            ? Math.min(width * 0.35, height * 0.77)
            : Math.max(0, Math.min(width * 0.64, (artworkBottom - artworkTop) * 0.9)),
    };
}

export function Monolith({ paused }: { paused: boolean }) {
    const stageRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pausedRef = useRef(paused);
    const syncMotionRef = useRef<(() => void) | null>(null);
    const [rendererState, setRendererState] = useState<"loading" | "webgl" | "fallback">("loading");

    useEffect(() => {
        pausedRef.current = paused;
        syncMotionRef.current?.();
    }, [paused]);

    useEffect(() => {
        const stage = stageRef.current;
        const canvas = canvasRef.current;
        if (!stage || !canvas) return;

        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
        const disposables: Array<() => void> = [];
        let disposed = false;
        let failed = false;
        let frame = 0;
        let width = 0;
        let height = 0;
        let resizeScene: (() => void) | undefined;
        let syncMotion: (() => void) | undefined;
        const getPlacement = () => {
            const intro = stage.parentElement?.querySelector(".hero-intro");
            const contentBottom = intro
                ? intro.getBoundingClientRect().bottom - stage.getBoundingClientRect().top
                : 0;
            return placement(width, height, contentBottom);
        };

        const canAnimate = () =>
            !disposed &&
            !failed &&
            !pausedRef.current &&
            !reducedMotion.matches &&
            !document.hidden &&
            width > 0 &&
            height > 0;

        const releaseGraphics = () => {
            cancelAnimationFrame(frame);
            frame = 0;
            for (const dispose of disposables.splice(0).reverse()) dispose();
        };

        const showFallback = () => {
            if (disposed || failed) return;
            failed = true;
            syncMotion?.();
            releaseGraphics();
            setRendererState("fallback");
        };

        const onContextLost = (event: Event) => {
            event.preventDefault();
            // Retire this renderer permanently; the static brand remains available.
            showFallback();
        };
        canvas.addEventListener("webglcontextlost", onContextLost);

        const resize = () => {
            const bounds = stage.getBoundingClientRect();
            width = bounds.width;
            height = bounds.height;
            const art = getPlacement();
            stage.style.setProperty("--art-x", `${art.x}px`);
            stage.style.setProperty("--art-y", `${art.y}px`);
            stage.style.setProperty("--art-size", `${art.size}px`);
            resizeScene?.();
            syncMotion?.();
        };
        const observer = new ResizeObserver(resize);
        observer.observe(stage);
        void document.fonts.ready.then(() => {
            if (!disposed) resize();
        });

        const onMotionPolicyChange = () => syncMotion?.();
        syncMotionRef.current = onMotionPolicyChange;
        reducedMotion.addEventListener("change", onMotionPolicyChange);
        document.addEventListener("visibilitychange", onMotionPolicyChange);
        window.addEventListener("resize", resize, { passive: true });

        async function initialize() {
            try {
                const [THREE, { RoomEnvironment }, { springValue }] = await Promise.all([
                    import("three"),
                    import("three/addons/environments/RoomEnvironment.js"),
                    import("motion"),
                ]);
                if (disposed || failed || !canvas || !stage) return;

                // Probe first so unsupported devices never reach Three's error logger.
                const context = canvas.getContext("webgl2", {
                    alpha: true,
                    antialias: true,
                    premultipliedAlpha: true,
                    powerPreference: "low-power",
                });
                if (!context || context.isContextLost()) {
                    showFallback();
                    return;
                }

                const renderer = new THREE.WebGLRenderer({ canvas, context, alpha: true });
                disposables.push(() => renderer.dispose());
                renderer.setClearColor(0x000000, 0);
                renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
                renderer.outputColorSpace = THREE.SRGBColorSpace;
                renderer.toneMapping = THREE.ACESFilmicToneMapping;
                renderer.toneMappingExposure = 1.15;
                let shaderFailed = false;
                renderer.debug.onShaderError = () => {
                    shaderFailed = true;
                };

                const scene = new THREE.Scene();
                const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
                camera.position.z = 20;
                const environment = new RoomEnvironment();
                const pmrem = new THREE.PMREMGenerator(renderer);
                let environmentMap: ReturnType<typeof pmrem.fromScene>;
                try {
                    environmentMap = pmrem.fromScene(environment, 0.035);
                } finally {
                    environment.dispose();
                    pmrem.dispose();
                }
                disposables.push(() => environmentMap.dispose());
                scene.environment = environmentMap.texture;
                scene.environmentIntensity = 1;
                scene.environmentRotation.set(0.12, -0.5, 0.08);

                const sculpture = new THREE.Group();
                scene.add(sculpture);
                const shape = new THREE.Shape();
                OUTLINE.forEach(([x, y], index) => {
                    const worldX = (x - 64) * 0.05;
                    const worldY = (64 - y) * 0.05;
                    if (index === 0) shape.moveTo(worldX, worldY);
                    else shape.lineTo(worldX, worldY);
                });
                shape.closePath();
                const geometry = new THREE.ExtrudeGeometry(shape, {
                    depth: 0.48,
                    steps: 1,
                    bevelEnabled: true,
                    bevelSize: 0.065,
                    bevelThickness: 0.065,
                    bevelSegments: 6,
                    curveSegments: 1,
                });
                geometry.translate(0, 0, -0.24);
                disposables.push(() => geometry.dispose());
                // Fine machining lines break up the otherwise perfectly flat metal reflections.
                const grain = new Uint8Array(256 * 256 * 4);
                for (let row = 0; row < 256; row++) {
                    for (let column = 0; column < 256; column++) {
                        const index = (row * 256 + column) * 4;
                        const value =
                            145 +
                            Math.sin((row * Math.PI) / 16) * 38 +
                            Math.sin(row * 2.4 + column * 0.08) * 4;
                        grain[index] = grain[index + 1] = grain[index + 2] = value;
                        grain[index + 3] = 255;
                    }
                }
                const brushedTexture = new THREE.DataTexture(grain, 256, 256);
                brushedTexture.wrapS = brushedTexture.wrapT = THREE.RepeatWrapping;
                brushedTexture.magFilter = THREE.LinearFilter;
                brushedTexture.minFilter = THREE.LinearMipmapLinearFilter;
                brushedTexture.generateMipmaps = true;
                brushedTexture.needsUpdate = true;
                disposables.push(() => brushedTexture.dispose());
                const silver = new THREE.MeshPhysicalMaterial({
                    color: 0x718581,
                    metalness: 1,
                    roughness: 0.32,
                    bumpMap: brushedTexture,
                    bumpScale: 0.025,
                    clearcoat: 0.3,
                    clearcoatRoughness: 0.22,
                });
                const graphite = new THREE.MeshPhysicalMaterial({
                    color: 0x464f52,
                    metalness: 0.95,
                    roughness: 0.29,
                    clearcoat: 0.25,
                    clearcoatRoughness: 0.2,
                });
                disposables.push(
                    () => silver.dispose(),
                    () => graphite.dispose(),
                );
                sculpture.add(new THREE.Mesh(geometry, [silver, graphite]));

                const finGeometry = new THREE.ExtrudeGeometry(shape, {
                    depth: 0.022,
                    steps: 1,
                    bevelEnabled: true,
                    bevelSize: 0.016,
                    bevelThickness: 0.008,
                    bevelSegments: 2,
                    curveSegments: 1,
                });
                const finMaterial = new THREE.MeshStandardMaterial({
                    color: 0x9ea7a4,
                    metalness: 1,
                    roughness: 0.22,
                });
                disposables.push(
                    () => finGeometry.dispose(),
                    () => finMaterial.dispose(),
                );
                const fins = Array.from({ length: 8 }, (_, index) => {
                    const fin = new THREE.Mesh(finGeometry, finMaterial);
                    fin.position.z = -0.36 - index * 0.075;
                    sculpture.add(fin);
                    return fin;
                });

                // Coplanar enamel covers exactly logo x80..102, y34..56.
                const accentGeometry = new THREE.PlaneGeometry(22 * 0.05, 22 * 0.05);
                const mint = new THREE.MeshPhysicalMaterial({
                    color: 0x35b992,
                    emissive: 0x124536,
                    emissiveIntensity: 0.4,
                    metalness: 0.18,
                    roughness: 0.34,
                    clearcoat: 0.5,
                    clearcoatRoughness: 0.18,
                    polygonOffset: true,
                    polygonOffsetFactor: -1,
                    polygonOffsetUnits: -1,
                });
                disposables.push(
                    () => accentGeometry.dispose(),
                    () => mint.dispose(),
                );
                const accent = new THREE.Mesh(accentGeometry, mint);
                accent.position.set((91 - 64) * 0.05, (64 - 45) * 0.05, 0.305);
                sculpture.add(accent);

                const key = new THREE.DirectionalLight(0xffffff, 3.2);
                key.position.set(-3, 5, 7);
                const fill = new THREE.DirectionalLight(0xb5ffdf, 1.25);
                fill.position.set(4, 1, 4);
                const rim = new THREE.DirectionalLight(0xff9e8d, 1.6);
                rim.position.set(-4, 0, -3);
                scene.add(key, fill, rim);

                const springOptions = { stiffness: 75, damping: 13, mass: 0.9 };
                const pointerX = springValue<number>(0, springOptions);
                const pointerY = springValue<number>(0, springOptions);
                const freezePointer = () => {
                    // Reset pending targets as well as active springs before stopping.
                    for (const value of [pointerX, pointerY]) {
                        const current = value.get();
                        value.set(current);
                        value.jump(current);
                    }
                };
                disposables.push(() => {
                    freezePointer();
                    pointerX.destroy();
                    pointerY.destroy();
                });

                let elapsed = 0;
                let previousTime: number | undefined;
                let running = false;
                const applyPose = () => {
                    sculpture.rotation.set(
                        0.18 + pointerY.get() + Math.sin(elapsed * 0.37) * 0.025,
                        -0.48 + pointerX.get() + Math.sin(elapsed * 0.29) * 0.06,
                        -0.14 + Math.sin(elapsed * 0.23) * 0.015,
                    );
                    fins.forEach((fin, index) => {
                        fin.position.x = canAnimate()
                            ? Math.exp(-elapsed * 1.5) * index * 0.045
                            : 0;
                    });
                };
                let announcedRenderer = false;
                const render = () => {
                    if (disposed || failed || width <= 0 || height <= 0 || document.hidden) return;
                    try {
                        if (context.isContextLost()) {
                            showFallback();
                            return;
                        }
                        renderer.render(scene, camera);
                        if (shaderFailed) showFallback();
                        else if (!announcedRenderer) {
                            announcedRenderer = true;
                            setRendererState("webgl");
                        }
                    } catch {
                        showFallback();
                    }
                };
                const tick = (time: number) => {
                    frame = 0;
                    if (!canAnimate()) return;
                    if (previousTime !== undefined) elapsed += (time - previousTime) / 1000;
                    previousTime = time;
                    applyPose();
                    render();
                    if (canAnimate()) frame = requestAnimationFrame(tick);
                };
                syncMotion = () => {
                    if (!canAnimate()) {
                        running = false;
                        cancelAnimationFrame(frame);
                        frame = 0;
                        previousTime = undefined;
                        freezePointer();
                        render();
                    } else if (!running) {
                        running = true;
                        previousTime = undefined;
                        pointerX.set(0);
                        pointerY.set(0);
                        frame = requestAnimationFrame(tick);
                    }
                };

                resizeScene = () => {
                    if (disposed || failed || width <= 0 || height <= 0) return;
                    const next = getPlacement();
                    if (next.size <= 0) return;
                    // A fixed camera keeps the studio lights in sculpture space.
                    const unitsPerPixel = 3.8 / next.size;
                    camera.left = -next.x * unitsPerPixel;
                    camera.right = (width - next.x) * unitsPerPixel;
                    camera.top = next.y * unitsPerPixel;
                    camera.bottom = -(height - next.y) * unitsPerPixel;
                    camera.updateProjectionMatrix();
                    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
                    renderer.setSize(width, height, false);
                    render();
                };

                const pointerSurface = stage.parentElement ?? stage;
                const onPointerMove = (event: PointerEvent) => {
                    if (!canAnimate() || event.pointerType === "touch") return;
                    const bounds = stage.getBoundingClientRect();
                    const x = (event.clientX - bounds.left) / width;
                    const y = (event.clientY - bounds.top) / height;
                    pointerX.set(THREE.MathUtils.clamp(x * 2 - 1, -1, 1) * 0.25);
                    pointerY.set(THREE.MathUtils.clamp(y * 2 - 1, -1, 1) * 0.14);
                };
                const onPointerLeave = () => {
                    if (!canAnimate()) return;
                    pointerX.set(0);
                    pointerY.set(0);
                };
                pointerSurface.addEventListener("pointermove", onPointerMove, { passive: true });
                pointerSurface.addEventListener("pointerleave", onPointerLeave);
                disposables.push(() => {
                    pointerSurface.removeEventListener("pointermove", onPointerMove);
                    pointerSurface.removeEventListener("pointerleave", onPointerLeave);
                });

                applyPose();
                resize();
            } catch {
                showFallback();
            }
        }

        void initialize();
        return () => {
            disposed = true;
            syncMotionRef.current = null;
            observer.disconnect();
            reducedMotion.removeEventListener("change", onMotionPolicyChange);
            document.removeEventListener("visibilitychange", onMotionPolicyChange);
            window.removeEventListener("resize", resize);
            canvas.removeEventListener("webglcontextlost", onContextLost);
            releaseGraphics();
        };
    }, []);

    return (
        <div
            ref={stageRef}
            className="monolith-stage"
            aria-hidden="true"
            data-renderer={rendererState}
        >
            <canvas
                ref={canvasRef}
                className="monolith-canvas"
                style={{ visibility: rendererState === "webgl" ? "visible" : "hidden" }}
            />
            {rendererState !== "webgl" && (
                <svg className="monolith-fallback" viewBox="26 34 76 60" focusable="false">
                    <path d={LOGO_PATH} fill="#bec5c7" />
                    <path d="M80 34H102V56H80Z" fill="#9ff5d0" />
                </svg>
            )}
        </div>
    );
}
