/*
  config.js
  Config del juego: verbos + catálogo de items + ajustes UI.
*/

export const START_SCENE_ID = "hall";

export const GAME_CONFIG = {
  ui: {
    showHotspotsWhen: {
      altKey: true,      // ALT muestra hotspots
      verbLook: true,    // verbo "look" muestra hotspots
    },
    tooltip: {
      enabled: true,
      offsetX: 14,
      offsetY: 18,
    },
  },

  verbs: [
    { id: "look", label: "Mirar", hint: "examinar" },
    { id: "use", label: "Usar", hint: "con objeto" },
    { id: "talk", label: "Hablar", hint: "con…" },
    { id: "take", label: "Coger", hint: "a inventario" },
    { id: "open", label: "Abrir", hint: "puertas/cosas" },
    { id: "close", label: "Cerrar", hint: "por si acaso" },
  ],

  items: {
    llave: {
      name: "Llave",
      description: "Una llave pequeña. No abre tu futuro, pero algo hará.",
    },
    nota: {
      name: "Nota arrugada",
      description: "Pone: “La cocina guarda secretos… y migas.”",
    },
  },
};
