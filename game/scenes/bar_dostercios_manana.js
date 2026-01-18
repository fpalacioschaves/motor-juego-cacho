// game/scenes/bar_dostercios_manana.js
// Escena del Acto 1: Bar "Dos Tercios del Quinto" (mañana).
// Diseño (Notion 1.4): puzzle pasivo/de escucha -> observar personajes, escuchar conversaciones, pedir bebida.
// No hay pistas reales. No hay acciones correctas.

export const bar_dostercios_manana = {
  id: "bar_dostercios_manana",
  title: "Bar Dos Tercios del Quinto",
  subtitle: "Aquí no se investiga. Aquí se escucha… y se paga.",
  background: "assets/scenes/bar_dostercios_manana/background.png",

  objects: [
    {
      id: "barra",
      name: "Barra",
      hotspot: { x: 0, y: 70, w: 350, h: 240 },
      verbs: {
        look: {
          type: "say",
          text:
            "La barra. El templo donde la gente confiesa pecados en forma de tapas."
        }
      }
    },

    {
      id: "camarero",
      name: "Camarero",
      hotspot: { x: 720, y: 120, w: 160, h: 280 },
      verbs: {
        look: {
          type: "say",
          text:
            "El camarero. Lleva la paciencia en la cara… y el juicio en la ceja."
        },
        talk: {
          type: "dialog",
          title: "Camarero",
          text: "¿Lo de siempre, Juan? ¿O vienes a sorprender al mundo?",
          options: [
            {
              label: "Un café.",
              action: {
                type: "say",
                text:
                  "Te pone un café con la rapidez de alguien que ya se sabe tu tragedia de memoria."
              }
            },
            {
              label: "¿Qué se cuece hoy?",
              action: {
                type: "say",
                text:
                  "“Lo de siempre: gente hablando y nadie diciendo nada”, responde. Filosofía de barra."
              }
            },
            {
              label: "Nada, gracias.",
              action: {
                type: "say",
                text:
                  "“Pues estorba poco”, dice con cariño laboral."
              }
            }
          ]
        }
      }
    },

    {
      id: "conversacion_1",
      name: "Conversación cruzada",
      hotspot: { x: 1100, y: 320, w: 320, h: 150 },
      verbs: {
        look: {
          type: "say",
          text:
            "Dos clientes hablan fuerte. No sabes si discuten fútbol, política o el fin del mundo. Probablemente las tres."
        },
        talk: {
          type: "say",
          text:
            "No te metas. Este bar tiene una norma no escrita: el que pregunta, se convierte en tema."
        }
      }
    },

    {
      id: "conversacion_2",
      name: "Rumor de fondo",
      hotspot: { x: 450, y: 320, w: 320, h: 150 },
      verbs: {
        look: {
          type: "say",
          text:
            "Escuchas frases sueltas: “dicen que…”, “yo lo vi…”, “eso seguro…”. Información con garantía de humo."
        },
        talk: {
          type: "say",
          text:
            "Te acercas, pero lo único que obtienes es confirmación de que la gente habla por deporte."
        }
      }
    },

    {
      id: "television",
      name: "Televisión",
      hotspot: { x: 370, y: 0, w: 200, h: 100 },
      verbs: {
        look: {
          type: "say",
          text:
            "La tele está puesta. Volumen “discusión familiar”. Contenido “nada importante, pero molesto”."
        },
        use: {
          type: "say",
          text:
            "No hay mando. Aquí manda la costumbre. Y la costumbre no negocia."
        }
      }
    },

    {
      id: "maquina_tabaco",
      name: "Máquina de tabaco",
      hotspot: { x: 920, y: 150, w: 120, h: 260 },
      verbs: {
        look: {
          type: "say",
          text:
            "Máquina de tabaco. Un recordatorio brillante de que las malas decisiones vienen en formato industrial."
        },
        use: {
          type: "say",
          text:
            "Hoy no toca. Y además… si esto se convierte en puzzle ahora, sería demasiado pronto. El juego tiene modales."
        }
      }
    }
  ],

  exits: [
    {
      to: "calle_manana",
      label: "Salir a la calle",
      text: "Sales a la calle. La luz de la mañana te juzga sin decir una palabra.",
      hotspot: { x: 1100, y: 90, w: 180, h: 220 }
    }
  ]
};
