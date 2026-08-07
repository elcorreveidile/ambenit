/**
 * Configuración central de la landing "ambenit".
 *
 * TODO (Javier): aquí viven TODOS los datos editables. Corrige lo marcado y listo,
 * sin tocar componentes. Los marcados como PLACEHOLDER hay que sustituirlos por los
 * reales cuando Antonio los tenga.
 */

export const site = {
  marca: "ambenit",
  tagline: "fotografía nocturna",
  // Dominio real (comprado). Usado para la URL canónica / metadatos.
  dominio: "https://ambenit.com",

  // El fotógrafo
  fotografo: {
    nombre: "Antonio Maldonado Benítez", // TODO confirmar nombre real
    edad: 17, // TODO confirmar edad real
    // Foto de retrato servida desde /public. La galería/retrato pueden arrancar
    // con esta o vacíos. Ojo: antonio.webp original salen dos personas.
    retrato: "/antonio.webp",
  },

  // Contacto
  contacto: {
    // Email retirado a petición de Javier. Cuando haya buzón real, añadir aquí.
    instagram: "@ambenit", // TODO placeholder — poner el handle real
  },

  // Crédito de desarrollo (la agencia del tito).
  desarrollo: {
    por: "Por 2 Duros",
    url: "https://por2duros.com",
  },

  // Objetivo simbólico de la galería (el "pack" de la broma)
  galeria: {
    objetivo: 151,
    // Fotos "semilla" reales servidas desde /public. Se muestran cuando la base
    // de datos aún no está configurada o está vacía, para que el sitio se vea vivo.
    // Cuando Antonio suba fotos desde /admin, mandan las de la base de datos.
    semilla: [
      { src: "/sesion-1.jpg", alt: "Recital nocturno — ambenit" },
      { src: "/sesion-2.jpg", alt: "Recital nocturno — ambenit" },
      { src: "/sesion-3.jpg", alt: "Recital nocturno — ambenit" },
      { src: "/sesion-4.jpg", alt: "Recital nocturno — ambenit" },
      { src: "/sesion-5.jpg", alt: "Recital nocturno — ambenit" },
      { src: "/sesion-6.jpg", alt: "Recital nocturno — ambenit" },
    ],
  },

  // Cifras del hero
  stats: [
    { valor: "277", etiqueta: "disparos esa noche" },
    { valor: "151", etiqueta: "fotos que sobreviven" },
    { valor: "1", etiqueta: "tito con buen ojo" },
  ],

  // La sesión destacada — evento REAL fotografiado por Antonio.
  sesion: {
    titulo: "Poesía en el Jardín",
    subtitulo: "en el Cuarto Real, Granada",
    ficha: [
      ["Evento", "«Poesía en el Jardín» — XV edición"],
      ["Lugar", "Cuarto Real de Santo Domingo (Granada)"],
      ["Fecha", "11 de septiembre de 2025"],
      ["En escena", "Javier Benítez y Alfonso Salazar (poesía)"],
      ["Música", "Juan Pinilla (cante) · David Caro (guitarra)"],
      ["Luz", "Natural nocturna, alto contraste"],
      ["Selección", "277 disparos → 151 elegidas a mano"],
    ] as const,
  },

  // La cuenta / el trueque — TODO ajustar cifras si hace falta
  trueque: {
    // Lo que paga el tito a Antonio (por las fotos)
    tito: {
      titulo: "Lo que te pago yo",
      etiqueta: "tito → antonio",
      lineas: [
        { concepto: "Pack «Recital nocturno»", detalle: "151 fotos seleccionadas y editadas.", importe: "30 €" },
        { concepto: "Presupuesto previo", detalle: "No lo hubo. Sorpresa a los dos audios.", importe: "—", libre: true },
      ],
      total: "30 €",
    },
    // Lo que paga Antonio al tito (por la web)
    antonio: {
      titulo: "Lo que me pagas tú",
      etiqueta: "antonio → tito",
      lineas: [
        { concepto: "Identidad «ambenit»", detalle: "Logo, tipografías y color de fotógrafo.", importe: "90 €" },
        { concepto: "Desarrollo web a medida", detalle: "Una página, responsive, hecha a mano.", importe: "120 €" },
        { concepto: "Galería con subida de fotos", detalle: "Para tus 151, con contador y todo.", importe: "60 €" },
        { concepto: "Suplemento «yo tampoco avisé»", detalle: "Justo. Mismo juego.", importe: "30 €" },
      ],
      total: "300 €",
    },
    // Balance del trueque
    balance: {
      pagaTito: "− 30 €",
      pagaAntonio: "+ 300 €",
      saldo: "270 €",
      guino: "o lo dejamos en tablas y quedamos en paz 😌",
    },
  },
} as const;

export type Site = typeof site;
