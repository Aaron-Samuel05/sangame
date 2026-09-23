import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

function App() {
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    let value = 0;
    const timer = setInterval(() => {
      value += Math.random() * 9;
      if (value >= 100) {
        value = 100;
        clearInterval(timer);
        setTimeout(() => setLoading(false), 350);
      }
      setProgress(Math.round(value));
    }, 90);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || loading) return;
    const ctx = canvas.getContext("2d");
    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * ratio;
      canvas.height = canvas.clientHeight * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    ctx.fillStyle = "#071018";
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    return () => window.removeEventListener("resize", resize);
  }, [loading]);

  const enterFullscreen = async () => {
    const target = document.querySelector(".game-shell");
    if (!document.fullscreenElement) {
      await target?.requestFullscreen?.();
      setFullscreen(true);
    } else {
      await document.exitFullscreen?.();
      setFullscreen(false);
    }
  };

  return (
    <main className="app">
      {loading && (
        <section className="loader">
          <div className="loader-brand">SAN ANDREAS</div>
          <div className="loader-sub">BROWSER EDITION</div>
          <div className="loader-bar"><span style={{ width: progress + "%" }} /></div>
          <div className="loader-status">INITIALIZING GAME ENGINE {progress}%</div>
        </section>
      )}

      <header className="topbar">
        <div className="brand">SAN ANDREAS</div>
        <div className="status"><span className="dot" /> WEB ENGINE</div>
      </header>

      <section className={"game-shell " + (fullscreen ? "is-fullscreen" : "")}>
        <canvas ref={canvasRef} className="game-canvas" />
        {!loading && (
          <div className="engine-overlay">
            <div className="engine-title">SAN ANDREAS</div>
            <div className="engine-copy">
              Game runtime ready. The browser game engine / WebAssembly build will be connected here.
            </div>
            <div className="engine-pill">WASM RUNTIME PLACEHOLDER</div>
          </div>
        )}
        <button className="fullscreen" onClick={enterFullscreen}>
          {fullscreen ? "EXIT FULLSCREEN" : "FULLSCREEN"}
        </button>
      </section>

      <footer>
        <span>Browser game runtime</span>
        <span>Keyboard · Mouse · Controller ready</span>
      </footer>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);