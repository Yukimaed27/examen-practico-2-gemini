import { crear_tarea, calcular_prioridad } from "../src/tools/productivityTools.js";

console.log("🧪 Probando funciones locales puras (sin llamadas de red)...\n");

// 1. Prueba de crear_tarea
const tareaEjemplo = crear_tarea({
  titulo: "Reunión proyecto de migración",
  fecha: "2026-09-22",
  hora: "10:00",
  participantes: ["Ana", "Luis", "Carlos"],
  prioridad: "normal"
});

console.log("1. Resultado de crear_tarea:");
console.log(JSON.stringify(tareaEjemplo, null, 2));

// Validaciones
if (tareaEjemplo.titulo !== "Reunión proyecto de migración") throw new Error("Falla título");
if (tareaEjemplo.estado !== "pendiente") throw new Error("Falla estado");
if (!Array.isArray(tareaEjemplo.participantes) || tareaEjemplo.participantes.length !== 3) throw new Error("Falla participantes");
if (!tareaEjemplo.creada_en) throw new Error("Falla fecha de creación");
console.log("  ✅ Prueba crear_tarea superada.\n");

// 2. Prueba de calcular_prioridad (Reto adicional)
const prioAlta = calcular_prioridad({ impacto: "alto", urgencia: "alta" });
console.log("2. Resultado de calcular_prioridad (alto, alta):");
console.log(JSON.stringify(prioAlta, null, 2));
if (prioAlta.prioridad_calculada !== "alta") throw new Error("Falla cálculo alta");

const prioBaja = calcular_prioridad({ impacto: "bajo", urgencia: "baja" });
console.log("\n3. Resultado de calcular_prioridad (bajo, baja):");
console.log(JSON.stringify(prioBaja, null, 2));
if (prioBaja.prioridad_calculada !== "baja") throw new Error("Falla cálculo baja");

console.log("  ✅ Pruebas de lógica local completadas con éxito.\n");
