import readline from "readline";
import "dotenv/config";
import { crearAsistenteGemini } from "./geminiAssistant.js";

async function iniciarCLI() {
  console.clear();
  console.log("╔════════════════════════════════════════════════════════════════╗");
  console.log("║           ASISTENTE DE PRODUCTIVIDAD CON GEMINI API            ║");
  console.log("║         Arquitectura Function Calling en JavaScript (Node)     ║");
  console.log("╚════════════════════════════════════════════════════════════════╝");

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "TU_API_KEY_AQUI") {
    console.log("\n⚠️  ATENCIÓN: No se ha configurado la variable de entorno GEMINI_API_KEY.");
    console.log("Edita el archivo .env y asigna tu API Key:");
    console.log('   GEMINI_API_KEY="AIzaSy..."\n');
  }

  const asistente = crearAsistenteGemini(apiKey);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log("\nEjemplos que puedes probar:");
  console.log(" • Caso 1: 'Crear una tarea para entregar el informe el viernes a las 16:00 con María y José'");
  console.log(" • Caso 2: 'Reunión con Carlos y Elena el lunes a las 09:30, prioridad alta'");
  console.log(" • Caso 3 (Incompleto): 'Documentar el sistema el próximo miércoles'");
  console.log(" • Caso 4 (Reto): 'Incidente crítico con impacto alto y urgencia alta en base de datos'");
  console.log("\nEscribe tu solicitud o escribe 'salir' para terminar.\n");

  const preguntar = () => {
    rl.question("👤 Tú: ", async (entrada) => {
      const texto = entrada.trim();

      if (!texto) {
        preguntar();
        return;
      }

      if (texto.toLowerCase() === "salir" || texto.toLowerCase() === "exit") {
        console.log("\n👋 ¡Hasta luego!");
        rl.close();
        process.exit(0);
      }

      try {
        await asistente.procesarSolicitud(texto);
      } catch (error) {
        console.log(`\n❌ Error: ${error.message}`);
      }

      console.log("\n" + "-".repeat(60) + "\n");
      preguntar();
    });
  };

  preguntar();
}

iniciarCLI();
