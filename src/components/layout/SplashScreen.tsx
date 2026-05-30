"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";

export default function SplashScreen() {
  const [visible,  setVisible]  = useState(true);
  const [leaving,  setLeaving]  = useState(false);
  const [mounted,  setMounted]  = useState(false);
  const [hoverBtn, setHoverBtn] = useState(false);

  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const rafRef      = useRef<number>(0);
  const isDragging  = useRef(false);
  const lastX       = useRef(0);
  const lastY       = useRef(0);
  const velX        = useRef(0);
  const velY        = useRef(0.008);
  const rotX        = useRef(0.15);
  const rotY        = useRef(0.3);
  const timeRef     = useRef(0);

  useEffect(() => { setMounted(true); }, []);

  /* ── Three.js scene ── */
  useEffect(() => {
    if (!mounted || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const W = canvas.clientWidth  || 480;
    const H = canvas.clientHeight || 320;

    /* Renderer */
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H, false);
    renderer.setClearColor(0x000000, 0); // fully transparent background
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;

    /* Scene + camera */
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 100);
    camera.position.set(0, 0, 4.5);

    /* Environment map (fake chrome reflection) */
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTexture = (() => {
      const size = 256;
      const data = new Uint8Array(size * size * 4);
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const idx = (y * size + x) * 4;
          // Gradient from dark bottom to bright top-center
          const cx = Math.abs(x / size - 0.5) * 2;
          const cy = 1 - y / size;
          const bright = Math.pow(Math.max(0, 1 - cx * 1.6) * cy, 1.2);
          const v = Math.floor(bright * 255);
          data[idx]     = v;
          data[idx + 1] = v;
          data[idx + 2] = v;
          data[idx + 3] = 255;
        }
      }
      const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
      tex.needsUpdate = true;
      return tex;
    })();
    const envMap = pmrem.fromEquirectangular(envTexture).texture;
    scene.environment = envMap;

    /* Lights */
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.5);
    keyLight.position.set(2, 3, 4);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xaaaacc, 1.2);
    fillLight.position.set(-3, -1, 2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 2);
    rimLight.position.set(0, -3, -2);
    scene.add(rimLight);

    const pointLight = new THREE.PointLight(0xffffff, 1.5, 12);
    pointLight.position.set(0, 2, 3);
    scene.add(pointLight);

    scene.add(new THREE.AmbientLight(0x111111, 1));

    /* Logo group */
    const group = new THREE.Group();
    scene.add(group);

    /* Load logo texture → create extruded mesh stack */
    const loader = new THREE.TextureLoader();
    loader.load(
      "/logo.png",
      (logoTex) => {
        logoTex.colorSpace = THREE.SRGBColorSpace;
        logoTex.minFilter  = THREE.LinearMipmapLinearFilter;
        logoTex.generateMipmaps = true;

        const aspect = logoTex.image.width / logoTex.image.height;
        const pw = 3.2;
        const ph = pw / aspect;

        /* ── DEPTH SLABS — extruded layers ── */
        const SLABS = 18;
        const SLAB_DEPTH = 0.055;

        for (let i = 0; i < SLABS; i++) {
          const geo = new THREE.PlaneGeometry(pw, ph);
          const depthFade = 1 - i / SLABS;

          const mat = new THREE.MeshStandardMaterial({
            map:              logoTex,
            alphaMap:         logoTex,
            transparent:      true,
            metalness:        0.95,
            roughness:        0.08 + i * 0.018,
            envMap,
            envMapIntensity:  2.5 * depthFade,
            color:            new THREE.Color(depthFade * 0.6 + 0.2, depthFade * 0.6 + 0.2, depthFade * 0.6 + 0.2),
            side:             THREE.FrontSide,
            depthWrite:       false,
            depthTest:        false,
            alphaTest:        0.12,
          });

          const mesh = new THREE.Mesh(geo, mat);
          mesh.position.z = -(i * SLAB_DEPTH);
          mesh.renderOrder = SLABS - i;
          group.add(mesh);
        }

        /* ── FRONT FACE — chrome ── */
        const frontGeo = new THREE.PlaneGeometry(pw, ph);
        const frontMat = new THREE.MeshStandardMaterial({
          map:             logoTex,
          alphaMap:        logoTex,
          transparent:     true,
          metalness:       1.0,
          roughness:       0.04,
          envMap,
          envMapIntensity: 3.5,
          color:           new THREE.Color(1.0, 1.0, 1.05),
          side:            THREE.FrontSide,
          depthWrite:      false,
          alphaTest:       0.12,
        });
        const frontMesh = new THREE.Mesh(frontGeo, frontMat);
        frontMesh.position.z = 0.01;
        frontMesh.renderOrder = SLABS + 1;
        group.add(frontMesh);

        /* ── BACK FACE ── */
        const backMat = new THREE.MeshStandardMaterial({
          map:         logoTex,
          alphaMap:    logoTex,
          transparent: true,
          metalness:   0.9,
          roughness:   0.3,
          color:       new THREE.Color(0.15, 0.15, 0.15),
          side:        THREE.BackSide,
          depthWrite:  false,
          alphaTest:   0.12,
        });
        const backMesh = new THREE.Mesh(frontGeo.clone(), backMat);
        backMesh.position.z = -(SLABS * SLAB_DEPTH);
        group.add(backMesh);
      },
      undefined,
      (err) => console.warn("Logo load error:", err)
    );

    /* ── RAF render loop ── */
    function tick() {
      timeRef.current += 0.008;

      if (!isDragging.current) {
        velY.current  += (0.008 - velY.current)  * 0.025;
        velX.current  += (0      - velX.current)  * 0.04;
      }

      rotY.current += velY.current;
      rotX.current += velX.current;

      // gentle oscillating nod
      const nod = Math.sin(timeRef.current * 0.7) * 0.06;
      group.rotation.x = rotX.current + nod;
      group.rotation.y = rotY.current;

      // subtle light orbit
      pointLight.position.x = Math.cos(timeRef.current * 0.5) * 2.5;
      pointLight.position.y = Math.sin(timeRef.current * 0.4) * 1.5;

      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);

    /* Resize */
    function onResize() {
      if (!canvasRef.current) return;
      const w = canvasRef.current.clientWidth;
      const h = canvasRef.current.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      pmrem.dispose();
      envTexture.dispose();
      envMap.dispose();
    };
  }, [mounted]);

  /* ── Drag / touch ── */
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    lastX.current = e.clientX;
    lastY.current = e.clientY;
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastX.current;
    const dy = e.clientY - lastY.current;
    velY.current = dx * 0.012;
    velX.current = dy * 0.008;
    lastX.current = e.clientX;
    lastY.current = e.clientY;
  }, []);

  const onMouseUp = useCallback(() => { isDragging.current = false; }, []);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    isDragging.current = true;
    lastX.current = e.touches[0].clientX;
    lastY.current = e.touches[0].clientY;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const dx = e.touches[0].clientX - lastX.current;
    const dy = e.touches[0].clientY - lastY.current;
    velY.current = dx * 0.012;
    velX.current = dy * 0.008;
    lastX.current = e.touches[0].clientX;
    lastY.current = e.touches[0].clientY;
  }, []);

  const onTouchEnd = useCallback(() => { isDragging.current = false; }, []);

  function enter() {
    setLeaving(true);
    setTimeout(() => setVisible(false), 900);
  }

  if (!mounted || !visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center
        select-none overflow-hidden
        ${leaving ? "animate-splash-leave" : "animate-splash-enter"}`}
      style={{ background: "#060608" }}
    >
      {/* Grain */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.065,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "160px",
        }}
      />

      {/* Vignette */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 75% 70% at 50% 50%, transparent 30%, rgba(0,0,0,0.82) 100%)",
        }}
      />

      {/* Corner brackets */}
      {[
        { top: "28px",    left: "28px",  border: "border-t border-l" },
        { top: "28px",    right: "28px", border: "border-t border-r" },
        { bottom: "28px", left: "28px",  border: "border-b border-l" },
        { bottom: "28px", right: "28px", border: "border-b border-r" },
      ].map((pos, i) => (
        <div
          key={i}
          aria-hidden
          className={`absolute w-5 h-5 ${pos.border} border-white/[0.11] pointer-events-none`}
          style={{ top: pos.top, left: pos.left, bottom: pos.bottom, right: pos.right }}
        />
      ))}

      {/* ── Three.js Canvas ── */}
      <div
        className={`relative mb-14 ${leaving ? "animate-logo-leave" : "animate-logo-enter"}`}
        style={{ cursor: isDragging.current ? "grabbing" : "grab" }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <canvas
          ref={canvasRef}
          style={{
            width:      "clamp(280px, 44vw, 520px)",
            height:     "clamp(160px, 26vw, 300px)",
            display:    "block",
            background: "transparent",
          }}
        />

        {/* Drag hint */}
        <p
          className="absolute -bottom-7 left-0 right-0 text-center text-[8px] uppercase tracking-[0.55em]"
          style={{ color: "rgba(255,255,255,0.18)" }}
        >
          Drag to spin
        </p>
      </div>

      {/* ── MASUK button ── */}
      <div
        className={leaving ? "opacity-0 translate-y-6" : "animate-enter-text"}
        style={{ transition: leaving ? "all 0.35s ease-in" : "" }}
      >
        <p
          className="text-center uppercase mb-4"
          style={{
            fontSize: "9px",
            letterSpacing: "0.65em",
            color: "rgba(255,255,255,0.22)",
            fontWeight: 500,
          }}
        >
          ◈ &nbsp; DUTCH.IND &nbsp; ◈
        </p>

        <button
          onClick={enter}
          onMouseEnter={() => setHoverBtn(true)}
          onMouseLeave={() => setHoverBtn(false)}
          className="group relative overflow-hidden"
          style={{
            padding: "15px 64px",
            clipPath: "polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%)",
            border: `1px solid rgba(255,255,255,${hoverBtn ? 0.9 : 0.5})`,
            background: "transparent",
            cursor: "pointer",
            transition: "border-color 0.3s",
          }}
        >
          <span
            aria-hidden
            className="absolute inset-0 bg-white"
            style={{
              transform:       hoverBtn ? "scaleY(1)" : "scaleY(0)",
              transformOrigin: "bottom",
              transition:      "transform 0.42s cubic-bezier(0.76,0,0.24,1)",
            }}
          />
          <span
            className="relative z-10 font-black uppercase"
            style={{
              fontSize:      "11px",
              letterSpacing: "0.6em",
              color:         hoverBtn ? "#000" : "#fff",
              transition:    "color 0.28s",
              display:       "block",
              paddingLeft:   "0.6em",
            }}
          >
            MASUK
          </span>
        </button>

        <p
          className="text-center uppercase mt-3"
          style={{
            fontSize: "8px",
            letterSpacing: "0.45em",
            color: "rgba(255,255,255,0.15)",
          }}
        >
          EST. 2026
        </p>
      </div>

      {/* Bottom stamp */}
      <p
        className={`absolute bottom-7 uppercase ${leaving ? "opacity-0" : "animate-brand-fade"}`}
        style={{
          fontSize: "8px",
          letterSpacing: "0.65em",
          color: "rgba(255,255,255,0.12)",
        }}
      >
        DUTCH.IND &nbsp;/&nbsp; STREETWEAR
      </p>
    </div>
  );
}
