// game/debug-ui.js
// Panel de salto de escenas para ajustar hotspots sin cumplir puzzles.
// Firma: mountDebugUI(api, scenesById, onJump)

export function mountDebugUI(api, scenesById, onJump) {
  // Guardas anti-sustos
  if (!api || typeof api.goto !== "function") {
    console.error("[debug-ui] api inválida o sin goto()");
    return;
  }
  if (!scenesById || typeof scenesById !== "object") {
    console.error("[debug-ui] scenesById inválido:", scenesById);
    return;
  }

  if (document.getElementById("debugSceneJump")) return;

  const root = document.createElement("div");
  root.id = "debugSceneJump";

  root.style.position = "fixed";
  root.style.right = "12px";
  root.style.top = "12px";
  root.style.zIndex = "9999";
  root.style.background = "rgba(0,0,0,0.78)";
  root.style.border = "1px solid rgba(255,255,255,0.18)";
  root.style.borderRadius = "14px";
  root.style.padding = "10px";
  root.style.color = "#fff";
  root.style.fontFamily = "system-ui, sans-serif";
  root.style.fontSize = "13px";
  root.style.backdropFilter = "blur(6px)";
  root.style.minWidth = "260px";
  root.style.boxShadow = "0 10px 30px rgba(0,0,0,0.35)";

  const title = document.createElement("div");
  title.textContent = "🛠 Debug · Scene Jump";
  title.style.fontWeight = "800";
  title.style.marginBottom = "8px";

  const select = document.createElement("select");
  select.style.width = "100%";
  select.style.padding = "8px 10px";
  select.style.borderRadius = "10px";
  select.style.border = "1px solid rgba(255,255,255,0.18)";
  select.style.background = "rgba(0,0,0,0.35)";
  select.style.color = "#fff";
  select.style.outline = "none";

  const ids = Object.keys(scenesById).sort();
  ids.forEach((id) => {
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = id;
    select.appendChild(opt);
  });

  // Preselección escena actual
  if (api?.state?.scene && ids.includes(api.state.scene)) {
    select.value = api.state.scene;
  }

  const btn = document.createElement("button");
  btn.textContent = "Ir";
  btn.style.marginTop = "8px";
  btn.style.width = "100%";
  btn.style.padding = "8px 10px";
  btn.style.borderRadius = "10px";
  btn.style.border = "1px solid rgba(255,255,255,0.18)";
  btn.style.background = "rgba(255,255,255,0.12)";
  btn.style.color = "#fff";
  btn.style.cursor = "pointer";

  const status = document.createElement("div");
  status.style.marginTop = "8px";
  status.style.color = "rgba(255,255,255,0.75)";
  status.style.fontSize = "12px";
  status.textContent = api?.state?.scene ? `Actual: ${api.state.scene}` : "Actual: —";

  btn.addEventListener("click", () => {
    const target = select.value;
    if (!target) return;

    try {
      api.goto(target);

      // 🔑 Forzar render si nos pasan callback
      if (typeof onJump === "function") onJump();

      status.textContent = api?.state?.scene ? `Actual: ${api.state.scene}` : "Actual: —";
      if (api?.state?.scene && ids.includes(api.state.scene)) {
        select.value = api.state.scene;
      }
    } catch (err) {
      status.textContent = "Error al saltar (mira consola).";
      console.error("[debug-ui] Error en salto de escena:", err);
    }
  });

  const btnHide = document.createElement("button");
  btnHide.textContent = "Ocultar (J)";
  btnHide.style.marginTop = "8px";
  btnHide.style.width = "100%";
  btnHide.style.padding = "8px 10px";
  btnHide.style.borderRadius = "10px";
  btnHide.style.border = "1px solid rgba(255,255,255,0.18)";
  btnHide.style.background = "rgba(255,255,255,0.08)";
  btnHide.style.color = "#fff";
  btnHide.style.cursor = "pointer";

  btnHide.addEventListener("click", () => {
    root.style.display = "none";
  });

  const hint = document.createElement("div");
  hint.style.marginTop = "8px";
  hint.style.color = "rgba(255,255,255,0.75)";
  hint.style.fontSize = "12px";
  hint.textContent = "Tecla J muestra/oculta";

  root.appendChild(title);
  root.appendChild(select);
  root.appendChild(btn);
  root.appendChild(btnHide);
  root.appendChild(status);
  root.appendChild(hint);

  document.body.appendChild(root);

  window.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "j") {
      root.style.display = root.style.display === "none" ? "block" : "none";
    }
  });
}
