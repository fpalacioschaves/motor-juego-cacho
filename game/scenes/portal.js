// game/scenes/portal.js
// Escena 2 del Acto 1: Portal y escaleras del edificio.
// Objetivo: presentar control social (portera) y permitir salir a la calle.

export const portal = {
  id: "portal",
  title: "Portal del edificio",
  subtitle: "El umbral entre tu casa y el juicio público.",
   background: "assets/scenes/portal_manana/background.png",

  objects: [
    {
      id: "portera",
      name: "Doña María del Pilar",
      hotspot: { x: 0, y: 370, w: 360, h: 250 },
      verbs: {
        look: {
          type: "say",
          text: "La portera. Siempre presente. Como un antivirus… pero social."
        },
        talk: {
          type: "dialog",
          title: "Doña María del Pilar",
          text: "¿A dónde vas con esas pintas, Juan? ¿Otra vez a hacer el artista?",
          options: [
            {
              label: "Buenos días, Doña María.",
              action: {
                type: "say",
                text: "“Buenos días”. Dice ella. Como si fuera un juicio."
              }
            },
            {
              label: "¿Ha llegado algún paquete?",
              action: {
                type: "say",
                text: "“Aquí no llega nada sin que yo lo sepa”, responde. Y lo peor es que es verdad."
              }
            },
            {
              label: "Mejor me voy…",
              action: { type: "say", text: "Te vas. Vivo, por ahora." }
            }
          ]
        }
      }
    },

    {
      id: "tablon",
      name: "Tablón de anuncios",
      hotspot: { x: 73, y: 0, w: 300, h: 250 },
      verbs: {
        look: {
          type: "say",
          text:
            "‘Se prohíbe tender ropa en la escalera’. ‘Se ruega silencio’. " +
            "Aquí la libertad tiene horario de oficina."
        }
      }
    },

    {
      id: "buzones",
      name: "Buzones",
      hotspot: { x: 810, y: 70, w: 250, h: 180 },
      verbs: {
        look: { type: "say", text: "Buzones. Un monumento a la publicidad y a las cartas que nunca llegan." }
      }
    }
  ],

  exits: [
    {
      to: "piso_manana_salon",
      label: "Subir al piso",
      text: "Subes al piso otra vez. Lo tuyo es dar vueltas, al parecer.",
      hotspot: { x: 530, y: 0, w: 220, h: 230 }
    },
    {
      to: "calle_manana",
      label: "Salir a la calle",
      text: "Sales a la calle. El barrio te recibe con su alegría habitual: cero.",
      hotspot: { x: 1130, y: 0, w: 230, h: 490 }
    }
  ]
};
