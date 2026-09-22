import "dotenv/config";
import { crearAsistenteGemini } from "./geminiAssistant.js";

const casos = [
  {
    nombre: "Caso 1 - Solicitud estándar con participantes y hora",
    descripcion: "Debe extraer título, fecha relativa, hora '16:00' y participantes ['María', 'José'].",
    solicitud: "Crear una tarea para entregar el informe de pruebas el viernes a las 16:00. Participarán María y José."
  },
  {
    nombre: "Caso 2 - Solicitud con prioridad explícita alta",
    descripcion: "Debe extraer reunión de requisitos, fecha del lunes, hora '09:30', participantes y prioridad 'alta'.",
    solicitud: "Programar una reunión de revisión de requisitos para el lunes a las 09:30 con Carlos, Elena y Pedro. La prioridad es alta."
  },
  {
    nombre: "Caso 3 - Solicitud ambigua / datos faltantes (Regla contra alucinación)",
    descripcion: "Falta hora y participantes. El sistema NO debe inventar datos ni llamar crear_tarea; debe pedir aclaraciones.",
    solicitud: "Necesito preparar una actividad de documentación del sistema para el próximo miércoles."
  },
  {
    nombre: "Caso 4 - Reto Adicional: Evaluación de Impacto y Urgencia (calcular_prioridad)",
    descripcion: "El usuario plantea un incidente con alto impacto y alta urgencia para calcular la prioridad y crear la reunión.",
    solicitud: "Tenemos una incidencia crítica de impacto alto y urgencia alta en el gateway de pagos. Agenda una reunión de mitigación para hoy a las 17:00 con el equipo de DevOps y Seguridad."
  }
];

async function ejecutarPruebas() {
  console.log("============================================================");
  console.log("🚀 EJECUCIÓN DE CASOS DE PRUEBA: ASISTENTE DE PRODUCTIVIDAD");
  console.log("   Tecnología: Node.js + Google Gemini API + Function Calling");
  console.log("============================================================\n");

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "TU_API_KEY_AQUI") {
    console.error("❌ ERROR: No se encontró una clave válida en la variable GEMINI_API_KEY.");
    console.error("Por favor, abre el archivo .env y asigna tu clave de Gemini:");
    console.error('    GEMINI_API_KEY="AIzaSy..."\n');
    process.exit(1);
  }

  const asistente = crearAsistenteGemini(apiKey);

  for (let i = 0; i < casos.length; i++) {
    const caso = casos[i];
    console.log(`\n📌 [${i + 1}/${casos.length}] ${caso.nombre}`);
    console.log(`ℹ️  Objetivo esperado: ${caso.descripcion}`);

    try {
      const resultado = await asistente.procesarSolicitud(caso.solicitud);

      // Verificación diagnóstica pedagógica
      if (i === 2) {
        // Caso 3: comprobamos que no haya inventado la tarea
        if (resultado.tipo === "texto") {
          console.log("\n🎯 [VALIDACIÓN CASO 3 EXITOSA]: El asistente detectó correctamente la falta de información y solicitó datos faltantes en lugar de alucinar.");
        } else {
          console.warn("\n⚠️ [AVISO CASO 3]: El modelo ejecutó una función cuando se esperaba que solicitara datos faltantes.");
        }
      } else {
        if (resultado.tipo === "function_call") {
          console.log("\n🎯 [VALIDACIÓN EXITOSA]: El modelo invocó la herramienta correspondiente y JavaScript generó la estructura de datos.");
        }
      }
    } catch (err) {
      console.error(`❌ Falló la ejecución del ${caso.nombre}:`, err.message);
    }

    console.log("\n" + "-".repeat(60));
  }

  console.log("\n🎉 Todas las pruebas de la guía han concluido.");
}

ejecutarPruebas();
