// game/scenes/piso_manana_bano.js
// Baño de Juan por la mañana.
// Escena de identidad y tono. No hay objetos clave.

export const piso_manana_bano = {
  id: "piso_manana_bano",
  title: "Baño",
  subtitle: "El espejo no miente. A veces exagera.",

  objects: [
    {
      id: "espejo",
      name: "Espejo",
      hotspot: { x: 300, y: 120, w: 260, h: 260 },
      verbs: {
        look: {
          type: "say",
          text: "Te miras al espejo. Sigues siendo tú. Contra todo pronóstico."
        }
      }
    },

    {
      id: "lavabo",
      name: "Lavabo",
      hotspot: { x: 300, y: 420, w: 260, h: 120 },
      verbs: {
        look: {
          type: "say",
          text: "El lavabo. Podría contar historias. Prefiere no hacerlo."
        }
      }
    },

    {
      id: "medicinas",
      name: "Mueble de medicinas",
      hotspot: { x: 600, y: 200, w: 160, h: 220 },
      verbs: {
        look: {
          type: "say",
          text: "Medicinas viejas. Ninguna soluciona lo importante."
        }
      }
    }
  ],

  exits: [
    {
      to: "piso_manana_salon",
      label: "Volver al salón",
      text: "Regresas al salón.",
      hotspot: { x: 40, y: 200, w: 160, h: 200 }
    }
  ]
};
