import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import { geminiToolsConfig, localToolDispatchers } from "./tools/productivityTools.js";

/**
 * Retorna la fecha actual formateada en ISO y día de la semana
 * para dar contexto temporal preciso al modelo.
 */
function obtenerContextoTemporal() {
  const ahora = new Date();
  const opciones = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  const fechaTexto = ahora.toLocaleDateString("es-ES", opciones);
  const isoFecha = ahora.toISOString().split("T")[0];
  return { isoFecha, fechaTexto };
}

/**
 * Inicializa el cliente de Gemini y retorna el motor de procesamiento.
 */
export function crearAsistenteGemini(apiKey = process.env.GEMINI_API_KEY) {
  if (!apiKey || apiKey === "TU_API_KEY_AQUI") {
    console.warn("⚠️  ADVERTENCIA: No se ha configurado una clave válida en GEMINI_API_KEY.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const modelo = process.env.GEMINI_MODEL || "gemini-3.6-flash";

  /**
   * Procesa una solicitud de usuario en lenguaje natural.
   *
   * @param {string} solicitud - Texto ingresado por el usuario.
   * @param {Object} [opciones]
   * @param {boolean} [opciones.verbose=true] - Si muestra logs detallados por consola.
   * @returns {Promise<Object>} Resultado de la operación.
   */
  async function procesarSolicitud(solicitud, { verbose = true } = {}) {
    const { isoFecha, fechaTexto } = obtenerContextoTemporal();

    const systemInstruction = `
Eres un Asistente de Productividad Empresarial de alta precisión para gestión de tareas y reuniones.
Tu propósito es analizar solicitudes en lenguaje natural de los empleados y utilizar herramientas locales para automatizar procesos.

CONTEXTO TEMPORAL ACTUAL:
- Fecha de referencia hoy: ${isoFecha} (${fechaTexto}).
- Usa esta referencia para calcular fechas relativas como "mañana", "el próximo viernes", "el lunes", etc., siempre en formato YYYY-MM-DD.

REGLAS DE OPERACIÓN (FUNCTION CALLING):
1. Cuando la solicitud contenga los datos suficientes (título o asunto, fecha, hora y participantes), invoca inmediatamente la función 'crear_tarea'.
2. Si el usuario describe aspectos de impacto y urgencia de un incidente o problema técnico, puedes invocar 'calcular_prioridad' para determinar la prioridad objetiva.
3. Si el usuario define explícitamente la prioridad (ej: "alta", "baja", "normal"), asígnala directamente a 'crear_tarea'.

POLÍTICA ESTRICTA CONTRA ALUCINACIONES Y DATOS FALTANTES (CASOS AMBIGUOS):
- NUNCA inventes horarios, fechas o participantes que el usuario no haya mencionado ni se puedan inferir de forma segura.
- Si a la solicitud le falta información esencial para agendar (por ejemplo, se pide una reunión o actividad pero no se especifica la hora o quiénes participarán), NO invoques 'crear_tarea' con datos ficticios.
- En caso de datos faltantes, responde directamente en lenguaje natural indicando cortésmente qué datos específicos hacen falta para poder registrar la tarea.
    `.trim();

    if (verbose) {
      console.log("\n" + "=".repeat(60));
      console.log(`📩 Solicitud del usuario: "${solicitud}"`);
      console.log("=".repeat(60));
    }

    try {
      // 1. Envío de solicitud al modelo con herramientas declaradas y reintento en caso de 503/429
      let response;
      let intentos = 0;
      const maxIntentos = 3;

      while (intentos < maxIntentos) {
        try {
          response = await ai.models.generateContent({
            model: modelo,
            contents: solicitud,
            config: {
              systemInstruction,
              tools: geminiToolsConfig
            }
          });
          break;
        } catch (apiError) {
          intentos++;
          const esTransitorio = apiError.message?.includes("503") || apiError.message?.includes("429");
          if (esTransitorio && intentos < maxIntentos) {
            if (verbose) {
              console.log(`⏳ [Aviso]: Demanda alta en el servicio (503/429). Reintentando en ${intentos * 1.5}s (intento ${intentos}/${maxIntentos})...`);
            }
            await new Promise((resolve) => setTimeout(resolve, intentos * 1500));
          } else {
            throw apiError;
          }
        }
      }

      const functionCalls = response.functionCalls;

      // 2. Verificación de Function Calling
      if (functionCalls && functionCalls.length > 0) {
        const resultadosEjecucion = [];

        for (const call of functionCalls) {
          const fnName = call.name;
          const fnArgs = call.args || {};

          if (verbose) {
            console.log(`\n🤖 [LLM]: El modelo decidió invocar la función local: "${fnName}"`);
            console.log("📦 [Argumentos extraídos por Gemini]:", JSON.stringify(fnArgs, null, 2));
          }

          const localFn = localToolDispatchers[fnName];
          if (!localFn) {
            throw new Error(`La función '${fnName}' no está implementada en el sistema local.`);
          }

          // 3. Ejecución controlada en JavaScript (El LLM no ejecuta código local directamente)
          if (verbose) {
            console.log(`⚙️  [JavaScript]: Ejecutando función local '${fnName}'...`);
          }

          const resultado = localFn(fnArgs);
          resultadosEjecucion.push({
            funcion: fnName,
            argumentos: fnArgs,
            resultado
          });

          if (verbose) {
            console.log("✅ [Resultado Estructurado Producido por JS]:");
            console.log(JSON.stringify(resultado, null, 2));
          }
        }

        return {
          tipo: "function_call",
          ejecuciones: resultadosEjecucion,
          solicitudOriginal: solicitud
        };
      }

      // 4. Si el modelo no invocó ninguna función, generó una respuesta de texto
      // (por ejemplo, solicitando datos faltantes o respondiendo una duda)
      const textoRespuesta = response.text || "No se obtuvo respuesta del modelo.";

      if (verbose) {
        console.log("\n💬 [Respuesta del Asistente (Aclaración o Información)]: ");
        console.log(textoRespuesta);
      }

      return {
        tipo: "texto",
        respuesta: textoRespuesta,
        solicitudOriginal: solicitud
      };
    } catch (error) {
      console.error("\n❌ Error durante el procesamiento con Gemini:", error.message);
      throw error;
    }
  }

  return {
    procesarSolicitud,
    modelo
  };
}
