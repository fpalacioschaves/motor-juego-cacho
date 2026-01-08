// engine/api.js
// API central del motor: estado, escenas y helpers.
// Compatible con dos firmas de init():
// 1) api.init({ scenes, startSceneId })
// 2) api.init(scenesById, startSceneId)

const DEFAULT_STATE = {
  scene: "hall",
  verb: "look",
  inventory: [],
  selectedItemId: null,
  useItemId: null,

  // ✅ Estado global formal (progreso narrativo)
  // flags: { [flagName]: boolean | any }
  flags: {},
};

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export const api = {
  state: clone(DEFAULT_STATE),
  scenes: null,

  reset() {
    this.state = clone(DEFAULT_STATE);
  },

  init(arg1, arg2) {
    let scenesById = null;
    let startSceneId = null;

    // Firma 1: api.init({ scenes, startSceneId })
    if (arg1 && typeof arg1 === "object" && arg1.scenes) {
      scenesById = arg1.scenes;
      startSceneId = arg1.startSceneId;
    } else {
      // Firma 2: api.init(scenesById, startSceneId)
      scenesById = arg1;
      startSceneId = arg2;
    }

    if (!scenesById || typeof scenesById !== "object") {
      throw new Error("[api.init] scenesById inválido");
    }

    this.scenes = scenesById;

    // Elegir escena inicial válida
    if (startSceneId && this.scenes[startSceneId]) {
      this.state.scene = startSceneId;
    } else if (!this.scenes[this.state.scene]) {
      this.state.scene = Object.keys(this.scenes)[0];
    }
  },

  /* =========================================================
     ✅ Helpers “oficiales” de estado global
     ========================================================= */

  // Inventory ------------------------------------------------
  hasItem(itemId) {
    return Boolean(this.state?.inventory?.includes(itemId));
  },

  addItem(itemId) {
    if (!itemId) return;
    const inv = this.state.inventory ?? (this.state.inventory = []);
    if (!inv.includes(itemId)) inv.push(itemId);
  },

  removeItem(itemId) {
    if (!itemId) return;
    const inv = this.state.inventory ?? (this.state.inventory = []);
    const idx = inv.indexOf(itemId);
    if (idx >= 0) inv.splice(idx, 1);
  },

  // Flags -----------------------------------------------------
  hasFlag(flagName, expectedValue) {
    if (!flagName) return false;
    const v = this.state?.flags?.[flagName];

    // Si no se especifica valor, se interpreta como booleano
    if (expectedValue === undefined) return Boolean(v);

    // Si se especifica valor, comparación estricta
    return v === expectedValue;
  },

  setFlag(flagName, value = true) {
    if (!flagName) return;
    if (!this.state.flags || typeof this.state.flags !== "object") {
      this.state.flags = {};
    }
    this.state.flags[flagName] = value;
  },

  // “unset” = desactivar; lo hacemos eliminando o poniendo false.
  // Para este motor, eliminar es limpio: “no definido” equivale a false.
  unsetFlag(flagName) {
    if (!flagName) return;
    if (!this.state.flags || typeof this.state.flags !== "object") {
      this.state.flags = {};
    }
    delete this.state.flags[flagName];
  },

  /* =========================================================
     ✅ NECESARIA: actions.js la usa
     ========================================================= */

  say(text) {
    // El renderer decide dónde mostrarlo; aquí solo devolvemos el texto
    return String(text ?? "");
  },

  goto(sceneId) {
    if (!this.scenes || !this.scenes[sceneId]) {
      throw new Error(`[api.goto] escena no existe: ${sceneId}`);
    }
    this.state.scene = sceneId;
  },

  setVerb(verbId) {
    this.state.verb = verbId;
    if (verbId !== "use") {
      this.state.useItemId = null;
    }
  },

  armUseItem(itemId) {
    this.state.useItemId = itemId;
  },

  cancelUseMode() {
    this.state.useItemId = null;
  },
};
