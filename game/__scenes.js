// game/scenes.js
// Escenas de prueba (canónicas) para el Motor de Aventuras.
// Incluye 2 escenas:
// - hall: escena principal con felpudo (pista) + llave (revelación) + puerta
// - cocina: escena destino mínima para validar goto
//
// Estructura por escena:
// - id, title, subtitle
// - objects: [{ id, name, hotspot:{x,y,w,h}, verbs:{...} }]
// - exits:   [{ to, label, text, hotspot:{x,y,w,h} }]

export const SCENES = {
  hall: {
    id: "hall",
    title: "Hall",
    subtitle: "Una entrada tranquila. Demasiado tranquila.",

    objects: [
      {
        id: "felpudo",
        name: "Felpudo",
        hotspot: { x: 90, y: 260, w: 210, h: 90 },

        verbs: {
          // ✅ Ahora MIRAR sí deja caer la pista de la llave
          look: {
            type: "if_has_item",
            item: "llave",
            then: { type: "say", text: "El felpudo está algo torcido. Ya no esconde nada." },
            else: {
              type: "say",
              text: "Un felpudo con letras gastadas: 'HOME'. Está un poco abultado... como si escondiera algo debajo."
            }
          },

          // ✅ COGER/TAKE revela la llave de forma explícita
          take: {
            type: "if_has_item",
            item: "llave",
            then: { type: "say", text: "Ya levantaste el felpudo. No hay nada más debajo." },
            else: [
              { type: "say", text: "Levantas el felpudo con cuidado..." },
              { type: "say", text: "¡Ajá! Debajo hay una pequeña llave oxidada." },
              { type: "take", item: "llave", text: "Te guardas la llave." }
            ]
          }
        }
      },

      {
        id: "puerta",
        name: "Puerta",
        hotspot: { x: 320, y: 120, w: 140, h: 280 },

        verbs: {
          look: {
            type: "say",
            text: "Una puerta de madera maciza. Tiene cerradura. De las que no se abren con buenas intenciones."
          },

          open: {
            type: "if_has_item",
            item: "llave",
            then: [
              { type: "say", text: "Metes la llave en la cerradura..." },
              { type: "say", text: "Gira. ¡Clac! La puerta se abre." },
              { type: "goto", scene: "cocina" }
            ],
            else: { type: "say", text: "No cede. Necesitas una llave." }
          },

          // Por si tu motor tiene modo USAR (2 clics)
          use: {
            type: "if_has_item",
            item: "llave",
            then: { type: "say", text: "Si quieres usar la llave aquí, prueba con ABRIR." },
            else: { type: "say", text: "La empujas… pero sin llave esto es un 'no' rotundo." }
          }
        }
      }
    ],

    exits: [
      {
        to: "cocina",
        label: "Ir a la cocina",
        text: "La puerta lleva a la cocina.",
        hotspot: { x: 500, y: 200, w: 140, h: 160 }
        // Si tu motor soporta enabledIf en exits, lo añadimos luego.
      }
    ]
  },

  cocina: {
    id: "cocina",
    title: "Cocina",
    subtitle: "Huele a café… o a problema.",

    objects: [
      {
        id: "cafetera",
        name: "Cafetera",
        hotspot: { x: 220, y: 220, w: 180, h: 140 },
        verbs: {
          look: { type: "say", text: "Una cafetera vieja. Podría contar historias. No todas buenas." },
          use: { type: "say", text: "La enciendes… y decide no colaborar. Muy sindicalista ella." }
        }
      }
    ],

    exits: [
      {
        to: "hall",
        label: "Volver al hall",
        text: "Regresas a la entrada.",
        hotspot: { x: 30, y: 200, w: 140, h: 160 }
      }
    ]
  }
};
