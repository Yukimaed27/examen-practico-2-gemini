/**
 * Herramientas de productividad y definiciones de esquemas para Function Calling.
 */

/**
 * Crea una tarea estructurada en el sistema local.
 * Esta función no utiliza IA; es lógica de negocio pura en JavaScript.
 *
 * @param {Object} params
 * @param {string} params.titulo - Título o asunto de la tarea/reunión.
 * @param {string} params.fecha - Fecha en formato YYYY-MM-DD.
 * @param {string} params.hora - Hora en formato HH:MM.
 * @param {string[]|string} params.participantes - Lista de participantes.
 * @param {string} [params.prioridad="normal"] - "baja" | "normal" | "alta".
 * @returns {Object} Tarea estructurada con metadatos de creación y estado.
 */
export function crear_tarea({ titulo, fecha, hora, participantes, prioridad = "normal" }) {
  // Validación de seguridad básica en la aplicación local
  if (!titulo || typeof titulo !== "string") {
    throw new Error("El parámetro 'titulo' es obligatorio.");
  }
  if (!fecha || typeof fecha !== "string") {
    throw new Error("El parámetro 'fecha' es obligatorio (formato YYYY-MM-DD).");
  }
  if (!hora || typeof hora !== "string") {
    throw new Error("El parámetro 'hora' es obligatorio (formato HH:MM).");
  }

  const listaParticipantes = Array.isArray(participantes)
    ? participantes
    : [participantes].filter(Boolean);

  const prioridadesValidas = ["baja", "normal", "alta"];
  const prioridadFinal = prioridadesValidas.includes(prioridad?.toLowerCase())
    ? prioridad.toLowerCase()
    : "normal";

  const tarea = {
    id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    titulo: titulo.trim(),
    fecha: fecha.trim(),
    hora: hora.trim(),
    participantes: listaParticipantes,
    prioridad: prioridadFinal,
    estado: "pendiente",
    creada_en: new Date().toISOString()
  };

  return tarea;
}

/**
 * Calcula la prioridad de una tarea basada en una matriz de Impacto vs Urgencia.
 * (Reto adicional para estudiantes avanzados según la guía de laboratorio)
 *
 * @param {Object} params
 * @param {"alto"|"medio"|"bajo"} params.impacto
 * @param {"alta"|"media"|"baja"} params.urgencia
 * @returns {Object} Nivel de prioridad calculado y justificación.
 */
export function calcular_prioridad({ impacto, urgencia }) {
  const imp = (impacto || "").toLowerCase();
  const urg = (urgencia || "").toLowerCase();

  let prioridadCalculada = "normal";
  let justificacion = "Parámetros operativos estándar.";

  if (imp === "alto" || imp === "alta") {
    if (urg === "alta" || urg === "alto" || urg === "media" || urg === "medio") {
      prioridadCalculada = "alta";
      justificacion = "Impacto alto con urgencia considerable: atención inmediata.";
    } else {
      prioridadCalculada = "normal";
      justificacion = "Impacto alto pero con urgencia baja: planificar en agenda regular.";
    }
  } else if (urg === "alta" || urg === "alto") {
    prioridadCalculada = "alta";
    justificacion = "Urgencia crítica requiere respuesta prioritaria.";
  } else if (imp === "bajo" || imp === "baja" || urg === "baja" || urg === "bajo") {
    prioridadCalculada = "baja";
    justificacion = "Bajo impacto o baja urgencia temporal.";
  }

  return {
    impacto: imp,
    urgencia: urg,
    prioridad_calculada: prioridadCalculada,
    justificacion
  };
}

/**
 * Esquema de herramientas (Function Declarations) para Google Gemini API.
 * Define el contrato formal entre el modelo de lenguaje y las funciones JavaScript.
 */
export const geminiToolsConfig = [
  {
    functionDeclarations: [
      {
        name: "crear_tarea",
        description: "Crea y agenda formalmente una tarea o reunión estructurada en el sistema de productividad. Invocar SOLO si se cuenta con título, fecha, hora y participantes claros.",
        parameters: {
          type: "OBJECT",
          properties: {
            titulo: {
              type: "STRING",
              description: "Título descriptivo de la tarea o reunión (ej: 'Reunión de revisión de requisitos')"
            },
            fecha: {
              type: "STRING",
              description: "Fecha de la tarea en formato ISO YYYY-MM-DD (ej: '2026-09-22')"
            },
            hora: {
              type: "STRING",
              description: "Hora de la tarea en formato de 24 horas HH:MM (ej: '10:00' o '16:30')"
            },
            participantes: {
              type: "ARRAY",
              items: {
                type: "STRING"
              },
              description: "Lista de nombres de las personas convocadas o involucradas"
            },
            prioridad: {
              type: "STRING",
              enum: ["baja", "normal", "alta"],
              description: "Prioridad asignada a la tarea (por defecto 'normal')"
            }
          },
          required: ["titulo", "fecha", "hora", "participantes"]
        }
      },
      {
        name: "calcular_prioridad",
        description: "Calcula el nivel de prioridad técnica (alta, normal, baja) a partir del nivel de impacto y urgencia de un requerimiento.",
        parameters: {
          type: "OBJECT",
          properties: {
            impacto: {
              type: "STRING",
              enum: ["alto", "medio", "bajo"],
              description: "Nivel de impacto en el negocio o sistemas"
            },
            urgencia: {
              type: "STRING",
              enum: ["alta", "media", "baja"],
              description: "Nivel de premura temporal para resolverlo"
            }
          },
          required: ["impacto", "urgencia"]
        }
      }
    ]
  }
];

/**
 * Registro de despachadores locales para ejecutar las funciones solicitadas por el LLM.
 */
export const localToolDispatchers = {
  crear_tarea,
  calcular_prioridad
};
