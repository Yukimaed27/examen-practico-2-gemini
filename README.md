# Asistente de Productividad Automatizada con Gemini API y Function Calling en JavaScript

> ### 🎓 PROYECTO ACADÉMICO - EXAMEN PRÁCTICO 2 (T.I.C.)
> - **Creador y Desarrollador:** **Yohaldo Edmundo Vega Quinto**
> - **Código Estudiantil:** **U22212893**
> - **Universidad:** **Universidad Tecnológica del Perú (UTP) - Sede Lima Centro**
> - **Tecnología:** JavaScript (Node.js ES Modules) + Google Gemini API (`@google/genai`) + PNPM

---

## 🏗️ Arquitectura de la Solución

El objetivo no es que el modelo de lenguaje redacte texto simulando una tarea, sino implementar una arquitectura determinista de **Function Calling** donde:

```
Usuario (Lenguaje Natural)
       │
       ▼
Google Gemini (Inferencia Semántica & Extracción de Argumentos)
       │
       ▼
Function Calling (Declaración formal de herramienta y esquema JSON)
       │
       ▼
Entorno JavaScript (Validación de reglas, ejecución de función local crear_tarea)
       │
       ▼
Resultado Estructurado (JSON con ID, metadatos, timestamp y estado)
```

> **Principio Clave:** El LLM **no** ejecuta código del sistema ni accede a recursos locales directamente. El programa en JavaScript es quien controla la validación y ejecución de las funciones locales.

---

## 📂 Estructura del Proyecto

```text
├── .env.example                  # Plantilla de variables de entorno
├── .env                          # Archivo donde configuras tu GEMINI_API_KEY
├── package.json                  # Configuración de dependencias y scripts PNPM
├── RESPUESTAS_EVALUACION.md      # Respuestas a las preguntas conceptuales de la guía
├── src/
│   ├── index.js                  # CLI interactiva por terminal
│   ├── geminiAssistant.js        # Motor de conexión con Gemini y despachador de tools
│   ├── testCases.js              # Suite de los casos prácticos 1, 2, 3 y reto adicional
│   └── tools/
│       └── productivityTools.js  # Funciones locales (crear_tarea, calcular_prioridad) y schemas
└── test/
    └── productivityTools.test.js # Pruebas unitarias de la lógica pura local
```

---

## ⚙️ Requisitos Previos

- **Node.js**: v18+ (probado en Node.js v22)
- **PNPM**: Gestor de paquetes oficial (`pnpm -v`)
- **API Key de Google Gemini**: Obtenible gratuitamente en [Google AI Studio](https://aistudio.google.com/).

---

## 🚀 Instalación y Configuración

1. **Instalar dependencias con PNPM:**
   ```bash
   pnpm install
   ```

2. **Configurar tu clave de API:**
   Abre el archivo `.env` en la raíz del proyecto y coloca tu clave de Gemini:
   ```env
   GEMINI_API_KEY="AIzaSyTuClaveAqui..."
   ```

---

## 🧪 Ejecución de Pruebas y Casos de la Guía

### 1. Pruebas Unitarias Locales (Sin consumo de API)
Verifica que las funciones de negocio locales generen objetos válidos y evalúen matrices de prioridad:
```bash
pnpm test
```

### 2. Ejecución Automatizada de los Casos de la Guía
Ejecuta la suite con la API de Gemini para evaluar los casos planteados en la guía:
```bash
pnpm test:cases
```

Los casos cubiertos son:
- **Caso 1:** Solicitud estructurada completa (*"informe de pruebas el viernes a las 16:00 con María y José"*).
- **Caso 2:** Solicitud con prioridad explícita alta (*"revisión de requisitos el lunes a las 09:30 con Carlos, Elena y Pedro"*).
- **Caso 3 (Detección de Datos Faltantes):** Solicitud ambigua (*"documentación del sistema para el próximo miércoles"* sin hora ni participantes). El asistente **no inventa información** y responde pidiendo aclaraciones.
- **Caso 4 (Reto Adicional de la Guía):** Incidente técnico crítico donde se compone la evaluación de impacto y urgencia con `calcular_prioridad` y posterior creación de tarea.

---

## 💬 Modo Interactivo (CLI por Terminal)

Para interactuar en tiempo real escribiendo cualquier solicitud en lenguaje natural:
```bash
pnpm start
```

Escribe consultas libres como:
> *"Necesito agendar una reunión de retrospectiva ágil para mañana a las 11:00 con Laura y Andrés"*

---

## 📚 Respuestas Teóricas y Evaluación

Para revisar las respuestas fundamentadas a las cuatro preguntas de evaluación de la guía (Diferencia entre LLM y Function Calling, Principio de mínimo privilegio / seguridad, Manejo de solicitudes ambiguas y Evolución hacia arquitectura empresarial), consulta el archivo:
📄 [`RESPUESTAS_EVALUACION.md`](file:///home/yukastael/Documentos/TIC/Examen%20Pr%C3%A1ctico%202/RESPUESTAS_EVALUACION.md)
