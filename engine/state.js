/*
  state.js
  Estado global del juego (serializable).
*/

export function createInitialState(startSceneId) {
  return {
    scene: startSceneId,
    verb: "look",
    inventory: [],
    selectedItemId: null, // item seleccionado del inventario (para "Usar X con Y")
    useItemId: null, // ✅ modo "Usar (item) con (objeto)" (v0.4)
    flags: {}, // banderas/condiciones del juego (boolean)
    history: [], // log interno (útil para debug didáctico)
  };
}

export function addHistory(state, msg) {
  state.history.push({ t: Date.now(), msg });
  // Evitamos crecimiento infinito
  if (state.history.length > 200) state.history.shift();
}

export function hasFlag(state, flag) {
  return Boolean(state.flags?.[flag]);
}

export function setFlag(state, flag, value = true) {
  state.flags[flag] = Boolean(value);
}

export function clearFlag(state, flag) {
  delete state.flags[flag];
}

export function hasItem(state, itemId) {
  return state.inventory.includes(itemId);
}

export function addItem(state, itemId) {
  if (!state.inventory.includes(itemId)) state.inventory.push(itemId);
}

export function removeItem(state, itemId) {
  state.inventory = state.inventory.filter((id) => id !== itemId);
  if (state.selectedItemId === itemId) state.selectedItemId = null;
  if (state.useItemId === itemId) state.useItemId = null; // ✅ si se consume, desarmar
}
