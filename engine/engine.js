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
  if (!scenesById[startSceneId]) {
    startSceneId = Object.keys(scenesById)[0];
  }

  // ✅ Contrato existente
  api.init({ scenes: scenesById, startSceneId });

  // ✅ Saneado (por si localStorage trae una escena inválida tipo "scenes")
  sanitizeStateScene(api.state, scenesById, startSceneId);

  // UI
  bindUI(GAME_CONFIG);

  // ✅ Debug UI (Scene Jump): PASAMOS scenesById y un callback de render
  if (DEBUG) {
    mountDebugUI(api, scenesById, () => render(GAME_CONFIG));
  }

  // Botones
  const btnSave = document.getElementById("btnSave");
  const btnLoad = document.getElementById("btnLoad");
  const btnNew = document.getElementById("btnNew");
  const feedback = document.getElementById("feedback");

  btnSave.addEventListener("click", () => {
    const payload = saveToLocalStorage(api.state);
    feedback.textContent = `Partida guardada (${payload.savedAt}).`;
    render(GAME_CONFIG);
  });

  btnLoad.addEventListener("click", () => {
    const payload = loadFromLocalStorage();
    if (!payload) {
      feedback.textContent = "No hay partida guardada.";
      return;
    }

    api.state = payload.state;

    // ✅ Saneado al cargar
    sanitizeStateScene(api.state, scenesById, startSceneId);

    addHistory(api.state, `Load (${payload.savedAt})`);
    feedback.textContent = `Partida cargada (${payload.savedAt}).`;
    render(GAME_CONFIG);
  });

  btnNew.addEventListener("click", () => {
    clearLocalStorageSave();
    api.state = createInitialState(startSceneId);

    // ✅ Saneado por si acaso
    sanitizeStateScene(api.state, scenesById, startSceneId);

    addHistory(api.state, "Nueva partida");
    feedback.textContent = "Nueva partida. El destino (y tus errores) te esperan.";
    render(GAME_CONFIG);
  });

  // Render inicial
  render(GAME_CONFIG);
}

/**
 * Corrige el estado si apunta a una escena inexistente.
 */
function sanitizeStateScene(state, scenesById, startSceneId) {
  if (!state) return;

  if (!state.scene || !scenesById[state.scene]) {
    state.scene = scenesById[startSceneId] ? startSceneId : Object.keys(scenesById)[0];
  }

  if (!state.verb) state.verb = "look";
}
