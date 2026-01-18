// game/scenes/calle_manana.js
// Escena del Acto 1: Calles del barrio (mañana).
// Diseño (Notion 1.3): "el barrio se observa, no se usa" -> paseo + mirar localizaciones cerradas + conversaciones triviales.
// No se permite entrar aún a farmacia / gimnasio / academia.

export const calle_manana = {
  id: "calle_manana",
  title: "Calle del barrio",
  subtitle: "Aquí se pasea. Interactuar, ya si eso… otro día.",
  background: "assets/scenes/calle_manana/background.png",

  objects: [
    {
      id: "farmacia",
      name: "Farmacia",
      hotspot: { x: 0, y: 120, w: 260, h: 260 },
      verbs: {
        look: {
          type: "say",
          text:
            "Farmacia. Un lugar donde venden soluciones rápidas… y ninguna sirve para tu vida."
        },
        use: {
          type: "say",
          text:
            "Está cerrada. Y aunque estuviera abierta, hoy no vienes a resolverte: vienes a sobrevivirte."
        }
      }
    },

    {
      id: "gimnasio",
      name: "Gimnasio",
      hotspot: { x: 760, y: 110, w: 260, h: 360 },
      verbs: {
        look: {
          type: "say",
          text:
            "Gimnasio. Gente feliz sudando por decisión propia. Qué concepto tan ofensivo."
        },
        use: {
          type: "say",
          text:
            "No. Hoy no. Hoy tu cardio es caminar hasta el bar sin perder la dignidad por el camino."
        }
      }
    },

    {
      id: "academia",
      name: "Academia",
      hotspot: { x: 330, y: 210, w: 250, h: 150 },
      verbs: {
        look: {
          type: "say",
          text:
            "La academia. El problema latente con fachada. Lo miras como quien mira una cita con el dentista."
        },
        use: {
          type: "say",
          text:
            "Aún no. Todavía no toca. El juego te está dejando calentar… como los villanos con monólogo."
        }
      }
    },



    {
      id: "cartel_bar",
      name: "Cartel del bar",
      hotspot: { x: 1080, y: 170, w: 160, h: 70 },
      verbs: {
        look: {
          type: "say",
          text:
            "El cartel dice “Dos Tercios del Quinto”. Tú estás en el cuarto y ya vas justito."
        }
      }
    },

    {
      id: "portal_edificio",
      name: "Tu portal",
      hotspot: { x: 590, y: 160, w: 140, h: 140 },
      verbs: {
        look: {
          type: "say",
          text:
            "Tu portal. El lugar donde la portera convierte el saludo en auditoría."
        },
        use: {
          type: "say",
          text:
            "Podrías volver… pero el barrio ya te ha visto salir. Retroceder ahora cuenta como debilidad."
        }
      }
    },

    {
      id: "vecino_trivial",
      name: "Vecino (charla trivial)",
      hotspot: { x: 340, y: 330, w: 220, h: 200 },
      verbs: {
        look: {
          type: "say",
          text:
            "Un vecino de esos que parecen generados proceduralmente. Misma cara, distinta queja."
        },
        talk: {
          type: "dialog",
          title: "Vecino del barrio",
          text: "¡Juan! ¿Qué, otra vez con cara de lunes aunque sea jueves?",
          options: [
            {
              label: "Buenos días… supongo.",
              action: {
                type: "say",
                text:
                  "Intercambiáis un “buenos días” de cortesía y derrota. Tradición local."
              }
            },
            {
              label: "¿Qué tal va todo?",
              action: {
                type: "say",
                text:
                  "“Tirando…”, dice. El barrio entero está oficialmente tirando."
              }
            },
            {
              label: "Voy con prisa.",
              action: {
                type: "say",
                text:
                  "Dices “prisa” como si tuvieras un plan. Él asiente como si te creyera. Qué amable."
              }
            }
          ]
        }
      }
    }
  ],

  exits: [
    {
      to: "portal",
      label: "Volver al portal",
      text: "Vuelves al portal. Doña María del Pilar probablemente ya lo sabía antes que tú.",
      hotspot: { x: 590, y: 300, w: 140, h: 140 }
    },
    {
      to: "bar_dostercios_manana",
      label: "Entrar al bar",
      text: "Entras al bar. El olor a café te perdona, pero solo por hoy.",
      hotspot: { x: 1080, y: 240, w: 150, h: 150 }
    }
  ]
};
