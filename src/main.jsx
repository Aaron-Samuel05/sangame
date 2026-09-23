import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { pickGameFolder, saveFolderHandle } from "./runtime/gameFiles";
import { probeBrowserRuntime } from "./runtime/wasmRuntime";
import "./styles.css";

function App() {
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [runtime, setRuntime] = useState(null);
  const [gameFiles, setGameFiles] = useState(null);
  const [error, setError] = useState("");

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
    if (!loading && canvasRef.current) {
      probeBrowserRuntime(canvasRef.current).then(setRuntime);
    }
  }, [loading]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || loading) return;

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * ratio;
      canvas.height = canvas.clientHeight * ratio;
    };

    resize();
    window.addEventListener("resize", resize);
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

  const loadGameFolder = async () => {
    setError("");
    try {
      const result = await pickGameFolder();
      await saveFolderHandle(result.handle);
      setGameFiles(result.files);
    } catch (err) {
      setError(err?.message || "Unable to read the selected folder.");
    }
  };

  const totalSize = gameFiles
    ? gameFiles.reduce((sum, file) => sum + file.size, 0)
    : 0;

  return (
    <main className="app">
      {loading && (
        <section className="loader">
          <div className="loader-brand">SAN ANDREAS</div>
          <div className="loader-sub">BROWSER EDITION</div>
          <div className="loader-bar"><span style={{ width: progress + "%" }} /></div>
          <div className="loader-status">INITIALIZING WEB RUNTIME {progress}%</div>
        </section>
      )}

      <header className="topbar">
        <div className="brand">SAN ANDREAS</div>
        <div className="status">
          <span className={"dot " + (runtime?.wasm && runtime?.webgl2 ? "" : "offline")} />
          {runtime?.wasm && runtime?.webgl2 ? "WASM + WEBGL2" : "WEB RUNTIME"}
        </div>
      </header>

      <section className={"game-shell " + (fullscreen ? "is-fullscreen" : "")}>
        <canvas ref={canvasRef} className="game-canvas" />

        {!loading && (
          <div className="engine-overlay">
            <div className="engine-title">SAN ANDREAS</div>

            <div className="runtime-card">
              <div className="runtime-heading">BROWSER RUNTIME READY</div>
              <div className="runtime-test-note">
                Vice City has a working public WebAssembly browser client. Use the test button to launch it in a top-level tab; its Service Worker/OPFS setup is designed to run from its own origin.
              </div>
              <div className="runtime-grid">
                <span>WebAssembly <b>{runtime?.wasm ? "YES" : "NO"}</b></span>
                <span>WebGL 2 <b>{runtime?.webgl2 ? "YES" : "NO"}</b></span>
                <span>SharedArrayBuffer <b>{runtime?.sharedArrayBuffer ? "YES" : "NO"}</b></span>
                <span>Isolation <b>{runtime?.crossOriginIsolated ? "YES" : "NO"}</b></span>
              </div>

              {!gameFiles ? (
                <>
                  <p>
                    The next runtime step is ready for your own game installation.
                    Select your GTA San Andreas folder to prepare the browser file layer.
                  </p>
                  <div className="action-row">
                    <button className="load-game" onClick={loadGameFolder}>
                      SELECT GAME FOLDER
                    </button>
                    <button
                      className="vice-city"
                      onClick={() => {
                        window.location.href = "https://joncodeofficial.github.io/gta-vice-city-wasm/";
                      }}
                    >
                      TEST VICE CITY
                    </button>
                  </div>
                  {error && <div className="error">{error}</div>}
                </>
              ) : (
                <div className="loaded">
                  <div className="loaded-title">GAME FOLDER CONNECTED</div>
                  <div>{gameFiles.length.toLocaleString()} files · {(totalSize / 1024 / 1024).toFixed(1)} MB</div>
                  <div className="loaded-note">
                    Files are accessed locally by the browser. They are not uploaded to GitHub.
                  </div>
                </div>
              )}

              <div className="renderer">
                GPU: {runtime?.renderer || "Detecting…"}
              </div>
            </div>
          </div>
        )}

        <button className="fullscreen" onClick={enterFullscreen}>
          {fullscreen ? "EXIT FULLSCREEN" : "FULLSCREEN"}
        </button>
      </section>

      <footer>
        <span>WebAssembly / WebGL runtime foundation</span>
        <span>Keyboard · Mouse · Controller ready</span>
      </footer>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);