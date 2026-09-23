export async function probeBrowserRuntime(canvas) {
  const webgl2 = canvas?.getContext("webgl2", {
    alpha: false,
    antialias: true,
    powerPreference: "high-performance"
  });

  const wasm = typeof WebAssembly !== "undefined";

  return {
    wasm,
    webgl2: Boolean(webgl2),
    sharedArrayBuffer: typeof SharedArrayBuffer !== "undefined",
    crossOriginIsolated: window.crossOriginIsolated === true,
    renderer: webgl2
      ? webgl2.getParameter(webgl2.RENDERER)
      : "Unavailable"
  };
}