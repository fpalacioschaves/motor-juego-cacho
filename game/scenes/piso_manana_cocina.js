// game/scenes/piso_manana_cocina.js
// Cocina de Juan por la mañana.
// Aquí se obtiene el TABACO.

export const piso_manana_cocina = {
  id: "piso_manana_cocina",
  title: "Cocina",
  subtitle: "Supervivencia básica con electrodomésticos cansados.",
   background: "assets/scenes/piso_manana_cocina/background.png",

  objects: [
    {
      id: "nevera",
      name: "Nevera",
      hotspot: { x: 0, y: 0, w: 160, h: 280 },
      verbs: {
        look: {
          type: "say",
          text: "La nevera contiene cosas que fueron comida. Hace tiempo."
        }
      }
    },

    {
      id: "mesa_cocina",
      name: "Mesa",
      hotspot: { x: 1060, y: 260, w: 360, h: 120 },
      verbs: {
        look: {
          type: "say",
          text: "La mesa de la cocina. Aquí se desayuna y se toman malas decisiones."
        }
      }
    },

    {
      id: "cajon",
      name: "Cajón",
      hotspot: { x: 170, y: 280, w: 180, h: 100 },
      verbs: {
        look: {
          type: "say",
          text: "Un cajón. El tipo de cajón que siempre guarda algo importante."
        },

        open: {
          type: "if_has_item",
          item: "tabaco",
          then: {
            type: "say",
            text: "El cajón está vacío. Dramáticamente vacío."
          },
          else: [
            {
              type: "say",
              text: "Abres el cajón. Ahí está. Tu pequeño salvavidas químico."
            },
            {
              type: "add_item",
              item: "tabaco",
              text: "Coges el tabaco. El día mejora un 12%."
            }
          ]
        }
      }
    }
  ],

  exits: [
    {
      to: "piso_manana_salon",
      label: "Volver al salón",
      text: "Regresas al salón.",
      // ✅ FIX: antes estaba en y=420 (fuera). Ahora es visible.
      hotspot: { x: 0, y: 300, w: 160, h: 90 }
    }
  ]
};
