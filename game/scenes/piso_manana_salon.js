// game/scenes/piso_manana_salon.js
// Escena HUB del piso por la mañana.
// Desde aquí se accede a baño, dormitorio, cocina y (si estás listo) al portal.

export const piso_manana_salon = {
  id: "piso_manana_salon",
  title: "Piso de Juan (salón)",
  subtitle: "Mañana. El cuerpo está aquí; el alma aún no ha firmado el contrato.",
  background: "assets/scenes/piso_manana_salon/background.png",
  objects: [
    {
      id: "sofa",
      name: "Sofá",
      hotspot: { x: 280, y: 240, w: 550, h: 160 },
      verbs: {
        look: {
          type: "say",
          text: "El sofá te mira con cara de: 'vuelve'. Tentador. Peligroso."
        }
      }
    },

    {
      id: "cenicero",
      name: "Cenicero",
      hotspot: { x: 330, y: 420, w: 70, h: 60 },
      verbs: {
        look: {
          type: "say",
          text: "Un cenicero con más pasado que futuro. Como tú, pero sin dignidad."
        },

        // ✅ Aquí colocamos las llaves (jugable YA)
        take: {
          type: "if_has_item",
          item: "llaves",
          then: {
            type: "say",
            text: "Ya tienes las llaves. No hace falta coleccionar copias como cromos."
          },
          else: [
            { type: "say", text: "Remueves el cenicero con asco profesional." },
            { type: "add_item", item: "llaves", text: "Aparecen tus llaves. La civilización está a salvo." }
          ]
        }
      }
    },

    {
      id: "libros",
      name: "Libros",
      hotspot: { x: 320, y: 290, w: 120, h: 80 },
      verbs: {
        look: {
          type: "say",
          text: "Libros de cosas serias. Te recuerdan que en algún momento fuiste optimista."
        }
      }
    },

    {
      id: "einstein",
      name: "Póster de Einstein",
      hotspot: { x: 340, y: 40, w: 120, h: 160 },
      verbs: {
        look: {
          type: "say",
          text: "Einstein te observa. No juzga. Solo… calcula tus probabilidades de éxito."
        }
      }
    },

    {
      id: "puerta_piso",
      name: "Puerta del piso",
      hotspot: { x: 1250, y: 50, w: 130, h: 380 },
      verbs: {
        look: {
          type: "say",
          text: "La puerta al mundo exterior. El mundo exterior es un sitio hostil, con gente."
        },

        // ✅ Puzzle obligatorio: no sales sin llaves+cartera+tabaco
        open: {
          type: "if_has_item",
          item: "llaves",
          then: {
            type: "if_has_item",
            item: "cartera",
            then: {
              type: "if_has_item",
              item: "tabaco",
              then: [
                { type: "say", text: "Vale. Estás listo. Más o menos." },
                { type: "goto", scene: "portal" }
              ],
              else: {
                type: "say",
                text: "Salir sin tabaco es como ir a la guerra en calzoncillos."
              }
            },
            else: {
              type: "say",
              text: "Juan, campeón… ¿a dónde vas sin la cartera?"
            }
          },
          else: {
            type: "say",
            text: "Juan, campeón… ¿a dónde vas sin las llaves?"
          }
        }
      }
    }
  ],

  exits: [
    {
      to: "piso_manana_bano",
      label: "Ir al baño",
      text: "El baño: espejo y verdad.",
      hotspot: { x: 1100, y: 80, w: 110, h: 290 }
    },
    {
      to: "piso_manana_dormitorio",
      label: "Ir al dormitorio",
      text: "El dormitorio: ropa, caos y cartera.",
      hotspot: { x: 130, y: 40, w: 180, h: 390 }
    },

    // ✅ FIX: estaba en y=420 (fuera del escenario de 420px)
    {
      to: "piso_manana_cocina",
      label: "Ir a la cocina",
      text: "La cocina: supervivencia básica.",
      hotspot: { x: 900, y: 90, w: 150, h: 260 }
    }
  ]
};
