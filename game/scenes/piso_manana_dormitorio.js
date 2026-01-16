// game/scenes/piso_manana_dormitorio.js
// Dormitorio de Juan por la mañana.
// Aquí se obtiene la CARTERA.

export const piso_manana_dormitorio = {
  id: "piso_manana_dormitorio",
  title: "Dormitorio",
  subtitle: "Desorden funcional. Como tu cabeza, pero con cajones.",
   background: "assets/scenes/piso_manana_dormitorio/background.png",

  objects: [
    {
      id: "cama",
      name: "Cama",
      hotspot: { x: 0, y: 300, w: 260, h: 120 },
      verbs: {
        look: {
          type: "say",
          text: "La cama sigue caliente. Claramente, alguien no quería levantarse."
        }
      }
    },

    {
      id: "mesilla",
      name: "Mesilla",
      hotspot: { x: 380, y: 460, w: 170, h: 120 },
      verbs: {
        look: {
          type: "say",
          text: "Una mesilla con papeles, polvo… y responsabilidades."
        },

        open: {
          type: "if_has_item",
          item: "cartera",
          then: {
            type: "say",
            text: "La mesilla ya ha dado todo lo que tenía que dar."
          },
          else: [
            {
              type: "say",
              text: "Abres el cajón. Entre recibos y decepciones aparece tu cartera."
            },
            {
              type: "add_item",
              item: "cartera",
              text: "Coges la cartera. Sigues siendo pobre, pero organizado."
            }
          ]
        }
      }
    },

    {
      id: "armario",
      name: "Armario",
      hotspot: { x: 1080, y: 0, w: 220, h: 1200 },
      verbs: {
        look: {
          type: "say",
          text: "Ropa limpia mezclada con ropa 'todavía usable'. Una democracia textil."
        }
      }
    }
  ],

  exits: [
    {
      to: "piso_manana_salon",
      label: "Volver al salón",
      text: "Regresas al salón.",
      hotspot: { x: 1300, y: 0, w: 120, h: 1200 }
    }
  ]
};
