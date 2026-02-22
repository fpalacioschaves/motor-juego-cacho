// engine/api.js
// API central del motor: estado, escenas y helpers.

const DEFAULT_STATE = {
  scene: "hall",
  verb: "look",
  inventory: [],
  selectedItemId: null,
  useItemId: null,
  flags: {},
};

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export const api = {
  state: clone(DEFAULT_STATE),
  scenes: null,
  listeners: [], // ✅ Sistema de eventos simple

  onUpdate(callback) {
    if (typeof callback === "function") this.listeners.push(callback);
  },

  notify() {
    this.listeners.forEach((cb) => cb(this.state));
  },

  reset() {
    this.state = clone(DEFAULT_STATE);
    this.notify();
  },

  init(arg1, arg2) {
    let scenesById = null;
    let startSceneId = null;

    if (arg1 && typeof arg1 === "object" && arg1.scenes) {
      scenesById = arg1.scenes;
      startSceneId = arg1.startSceneId;
    } else {
      scenesById = arg1;
      startSceneId = arg2;
    }

    if (!scenesById || typeof scenesById !== "object") {
      throw new Error("[api.init] scenesById inválido");
    }

    this.scenes = scenesById;

    if (startSceneId && this.scenes[startSceneId]) {
      this.state.scene = startSceneId;
    } else if (!this.scenes[this.state.scene]) {
      this.state.scene = Object.keys(this.scenes)[0];
    }

    // El primer notify se hará tras el primer render manual para evitar loops
  },

  // Inventory ------------------------------------------------
  hasItem(itemId) {
    return Boolean(this.state?.inventory?.includes(itemId));
  },

  addItem(itemId) {
    if (!itemId) return;
    const inv = this.state.inventory ?? (this.state.inventory = []);
    if (!inv.includes(itemId)) {
      inv.push(itemId);
      this.notify();
    }
  },

  removeItem(itemId) {
    if (!itemId) return;
    const inv = this.state.inventory ?? (this.state.inventory = []);
    const idx = inv.indexOf(itemId);
    if (idx >= 0) {
      inv.splice(idx, 1);
      this.notify();
    }
  },

  // Flags -----------------------------------------------------
  hasFlag(flagName, expectedValue) {
    if (!flagName) return false;
    const v = this.state?.flags?.[flagName];
    if (expectedValue === undefined) return Boolean(v);
    return v === expectedValue;
  },

  setFlag(flagName, value = true) {
    if (!flagName) return;
    if (!this.state.flags || typeof this.state.flags !== "object") {
      this.state.flags = {};
    }
    this.state.flags[flagName] = value;
    this.notify();
  },

  unsetFlag(flagName) {
    if (!flagName) return;
    if (!this.state.flags || typeof this.state.flags !== "object") {
      this.state.flags = {};
    }
    delete this.state.flags[flagName];
    this.notify();
  },

  // Utilities -------------------------------------------------
  say(text) {
    return String(text ?? "");
  },

  goto(sceneId) {
    if (!this.scenes || !this.scenes[sceneId]) {
      throw new Error(`[api.goto] escena no existe: ${sceneId}`);
    }
    this.state.scene = sceneId;
    this.notify();
  },

  setVerb(verbId) {
    this.state.verb = verbId;
    if (verbId !== "use") {
      this.state.useItemId = null;
    }
    this.notify();
  },

  armUseItem(itemId) {
    this.state.useItemId = itemId;
    this.notify();
  },

  cancelUseMode() {
    this.state.useItemId = null;
    this.notify();
  },

  setSelectedItemID(itemId) {
    this.state.selectedItemId = itemId;
    this.notify();
  }
};
