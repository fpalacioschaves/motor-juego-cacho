import { initEngine } from "./engine/engine.js";
import { SCENES } from "./game/scenes/index.js";
import { START_SCENE_ID } from "./game/config.js";

function showFatal(err) {
  console.error(err);
  const el = document.getElementById("feedback");
  if (el) {
    el.textContent =
      "❌ Error arrancando el motor:\n" +
      (err?.stack || err?.message || String(err));
    el.style.color = "#ffb3b3";
    el.style.fontWeight = "700";
  } else {
    alert(err?.message || String(err));
  }
}

// Errores globales (incluye errores de módulos)
window.addEventListener("error", (e) => showFatal(e.error || e.message));
window.addEventListener("unhandledrejection", (e) => showFatal(e.reason));

document.addEventListener("DOMContentLoaded", () => {
  try {
    initEngine(SCENES, START_SCENE_ID);
  } catch (err) {
    showFatal(err);
  }
});
