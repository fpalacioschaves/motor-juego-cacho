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
      hotspot: { x: 380, y: 300, w: 540, h: 160 },
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
      hotspot: { x: 450, y: 500, w: 150, h: 240 },
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
      hotspot: { x: 1220, y: 70, w: 220, h: 180 },
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
      hotspot: { x: 410, y: 40, w: 190, h: 190 },
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
      hotspot: { x: 0, y: 20, w: 80, h: 420 },
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
      hotspot: { x:200, y: 40, w: 170, h: 290 }
    },
    {
      to: "piso_manana_dormitorio",
      label: "Ir al dormitorio",
      text: "El dormitorio: ropa, caos y cartera.",
      hotspot: { x: 930, y: 40, w: 230, h: 300 }
    },

    // ✅ FIX: estaba en y=420 (fuera del escenario de 420px)
    {
      to: "piso_manana_cocina",
      label: "Ir a la cocina",
      text: "La cocina: supervivencia básica.",
      hotspot: { x: 650, y: 30, w: 200, h: 260 }
    }
  ]
};
