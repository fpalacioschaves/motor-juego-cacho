/*
  engine.js
  Orquestador: inicializa motor, enlaza UI, eventos globales, render.
*/

import { api } from "./api.js";
import { bindUI, render } from "./renderer.js";
import { saveToLocalStorage, loadFromLocalStorage, clearLocalStorageSave } from "./storage.js";
import { addHistory, createInitialState } from "./state.js";
import { GAME_CONFIG } from "../game/config.js";

import { DEBUG } from "../game/debug.js";
import { mountDebugUI } from "../game/debug-ui.js";

export function initEngine(scenesById, startSceneId) {
  if (!scenesById || typeof scenesById !== "object") {
    throw new Error("[engine] scenesById inválido");
  }

  // ✅ Inicializar API
  api.init({ scenes: scenesById, startSceneId });

  // ✅ Vincular UI (esto suscribe el render a api.onUpdate)
  bindUI(GAME_CONFIG);

  // ✅ Debug UI
  if (DEBUG) {
    mountDebugUI(api, scenesById, () => api.notify());
  }

  // Botones
  const btnSave = document.getElementById("btnSave");
  const btnLoad = document.getElementById("btnLoad");
  const btnNew = document.getElementById("btnNew");
  const feedback = document.getElementById("feedback");

  btnSave.addEventListener("click", () => {
    const payload = saveToLocalStorage(api.state);
    feedback.textContent = `Partida guardada (${payload.savedAt}).`;
  });

  btnLoad.addEventListener("click", () => {
    const payload = loadFromLocalStorage();
    if (!payload) {
      feedback.textContent = "No hay partida guardada.";
      return;
    }

    api.state = payload.state;
    addHistory(api.state, `Load (${payload.savedAt})`);
    feedback.textContent = `Partida cargada (${payload.savedAt}).`;
    api.notify(); // ✅ Disparar actualización manual tras cargar estado completo
  });

  btnNew.addEventListener("click", () => {
    clearLocalStorageSave();
    api.state = createInitialState(startSceneId);
    addHistory(api.state, "Nueva partida");
    feedback.textContent = "Nueva partida. El destino te espera.";
    api.notify(); // ✅ Disparar actualización manual
  });
}
