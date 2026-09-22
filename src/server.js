import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import { crearAsistenteGemini } from "./geminiAssistant.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(rootDir, "public")));

const asistente = crearAsistenteGemini(process.env.GEMINI_API_KEY);

// Endpoint para procesar solicitudes de usuario
app.post("/api/chat", async (req, res) => {
  const { mensaje } = req.body;
  if (!mensaje || typeof mensaje !== "string") {
    return res.status(400).json({ error: "El campo 'mensaje' es obligatorio." });
  }

  try {
    const resultado = await asistente.procesarSolicitud(mensaje, { verbose: false });
    return res.json({ ok: true, data: resultado });
  } catch (error) {
    console.error("Error procesando solicitud web:", error);
    return res.status(500).json({
      ok: false,
      error: error.message || "Ocurrió un error inesperado al consultar Gemini."
    });
  }
});

// Endpoint para descargar el informe en Word
app.get("/api/download/docx", (req, res) => {
  const filePath = path.join(rootDir, "informe_laboratorio.docx");
  res.download(filePath, "informe_laboratorio_Yohaldo_Vega.docx", (err) => {
    if (err) {
      console.error("Error al descargar archivo docx:", err);
      res.status(404).send("El documento Word aún no ha sido generado.");
    }
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor Web activo en http://localhost:${PORT}`);
});
