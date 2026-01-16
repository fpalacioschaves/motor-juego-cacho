// game/scenes/piso_manana_bano.js
// Baño de Juan por la mañana.
// Escena de identidad y tono. No hay objetos clave.

export const piso_manana_bano = {
  id: "piso_manana_bano",
  title: "Baño",
  subtitle: "El espejo no miente. A veces exagera.", 
  background: "assets/scenes/piso_manana_bano/background.png",

  objects: [
    {
      id: "espejo",
      name: "Espejo",
      hotspot: { x: 480, y: 0, w: 500, h: 220 },
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
      hotspot: { x: 440, y: 230, w: 560, h: 120 },
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
      hotspot: { x: 160, y: 0, w: 250, h: 180 },
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
      hotspot: { x: 0, y: 200, w: 160, h: 400 }
    }
  ]
};
