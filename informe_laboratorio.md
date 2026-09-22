# INFORME DE LABORATORIO: SOLUCIONES DE PRODUCTIVIDAD AUTOMATIZADAS MEDIANTE LLM Y SCRIPTING

**Implementación de Asistente Empresarial con Google Gemini API, Function Calling y JavaScript bajo Entorno PNPM**

- **Asignatura:** Ingeniería de Sistemas / Ingeniería de Software / TIC
- **Modalidad:** Laboratorio con Computadores / Examen Práctico 2
- **Creador / Estudiante:** Yohaldo Edmundo Vega Quinto
- **Código UTP:** U22212893
- **Institución:** Universidad Tecnológica del Perú (UTP) - Sede Lima Centro
- **Profesor:** [Nombre del Docente]
- **Fecha:** Septiembre de 2026

---

> ### 👤 AUTORÍA Y DATOS DEL CREADOR
> - **Estudiante / Desarrollador:** Yohaldo Edmundo Vega Quinto  
> - **Código Universitario:** U22212893  
> - **Universidad:** Universidad Tecnológica del Perú (UTP)  
> - **Sede:** Lima Centro  
> - **Curso:** Tecnologías de la Información y Comunicación (T.I.C.) - Examen Práctico 2  
> - **Proyecto:** Soluciones de Productividad Automatizadas con Google Gemini API y JavaScript bajo Entorno PNPM

---

## RESUMEN EJECUTIVO
Este informe documenta el diseño, implementación y validación experimental de un asistente de productividad inteligente basado en Modelos de Lenguaje de Gran Escala (LLM). A diferencia de los enfoques convencionales basados en generación de texto libre, la solución aplica el paradigma de **Function Calling** utilizando la API oficial de Google Gemini (`@google/genai`) orquestada en un entorno de ejecución en JavaScript (Node.js) gestionado con PNPM. El sistema permite interpretar solicitudes no estructuradas en lenguaje natural, extraer entidades tipadas y despachar la ejecución controlada de funciones locales de negocio (`crear_tarea` y `calcular_prioridad`). Asimismo, se implementaron directivas estrictas de mitigación contra alucinaciones frente a entradas ambiguas o incompletas. Se validaron los casos de prueba operativos con un 100% de éxito y se fundamentan las respuestas conceptuales del laboratorio vinculadas a seguridad, determinismo y escalabilidad empresarial.

---

## 1. INTRODUCCIÓN Y PROPÓSITO DEL LABORATORIO

La integración de Modelos de Lenguaje de Gran Escala (LLM) en procesos de ingeniería de software y productividad empresarial exige trascender la simple generación de texto conversacional. En entornos de producción reales, las organizaciones requieren que los sistemas interactúen de manera confiable con bases de datos, APIs de calendario, servicios de mensajería y flujos de trabajo preexistentes.

El propósito central de este laboratorio consiste en construir un asistente de productividad capaz de conectar tres conceptos clave:

1. **Modelo de Lenguaje (Google Gemini):** Actúa como motor de razonamiento e inferencia semántica para interpretar solicitudes en lenguaje natural emitidas por los empleados.
2. **Function Calling (Contrato de Interfaz):** Mecanismo estandarizado mediante el cual el LLM evalúa un catálogo formal de herramientas y decide invocar una función específica, devolviendo argumentos estructurados en formato JSON.
3. **Scripting en JavaScript (Ejecución Local Controlada):** El entorno anfitrión en Node.js valida los argumentos, ejecuta la lógica de negocio real de manera determinista y genera los identificadores y marcas de tiempo correspondientes.

La literatura reciente demuestra que la utilidad de los LLM se maximiza en tareas estructuradas, mientras que los flujos críticos requieren supervisión humana y arquitecturas donde el modelo nunca ejecute código arbitrario directamente en el sistema operativo.

---

## 2. ARQUITECTURA DE LA SOLUCIÓN

El diseño propuesto descarta la delegación irrestricta de control a la inteligencia artificial. En su lugar, implementa un flujo desacoplado y seguro:

```
                    ┌────────────────────────┐
                    │        Usuario         │
                    └───────────┬────────────┘
                                │ (Solicitud en Lenguaje Natural)
                                ▼
                    ┌────────────────────────┐
                    │      Google Gemini     │
                    │   (Modelo de Lenguaje) │
                    └───────────┬────────────┘
                                │ (Decide tool + extrae argumentos tipados)
                                ▼
                    ┌────────────────────────┐
                    │    Function Calling    │
                    │      (Declaración)     │
                    └───────────┬────────────┘
                                │ (Petición formal de llamada JSON)
                                ▼
                    ┌────────────────────────┐
                    │  Entorno JavaScript    │
                    │   (Ejecutor Local)     │
                    └───────────┬────────────┘
                                │ (Ejecuta crear_tarea / calcular_prioridad)
                                ▼
                    ┌────────────────────────┐
                    │ Resultado Estructurado │
                    │ (JSON con ID y Estado) │
                    └────────────────────────┘
```

En este esquema, el modelo de inteligencia artificial se restringe estrictamente a inferir la intención y extraer parámetros. La ejecución real reside en el código desarrollado por el programador.

---

## 3. IMPLEMENTACIÓN TÉCNICA

La solución fue desarrollada en JavaScript moderno utilizando módulos nativos ECMAScript (ES Modules) y gestionada con el administrador de paquetes **PNPM** para garantizar velocidad, reproducibilidad e inmutabilidad del árbol de dependencias.

### 3.1 Configuración del Entorno y Dependencias
El archivo `package.json` define las dependencias principales: el SDK oficial de Google Gen AI (`@google/genai`) y el cargador de variables de entorno (`dotenv`). Las credenciales de acceso se gestionan de forma segura fuera del código fuente mediante el archivo `.env`.

### 3.2 Lógica de Negocio Local (`productivityTools.js`)
La función `crear_tarea` recibe los parámetros validados por la aplicación y genera la estructura de la tarea con identificador único y marca temporal ISO:

```javascript
export function crear_tarea({ titulo, fecha, hora, participantes, prioridad = "normal" }) {
  if (!titulo || !fecha || !hora) {
    throw new Error("Parámetros obligatorios ausentes.");
  }
  return {
    id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    titulo: titulo.trim(),
    fecha: fecha.trim(),
    hora: hora.trim(),
    participantes: Array.isArray(participantes) ? participantes : [participantes],
    prioridad: prioridad.toLowerCase(),
    estado: "pendiente",
    creada_en: new Date().toISOString()
  };
}
```

Para atender el **Reto Adicional para estudiantes avanzados** planteado en la sección 14 de la guía, se incorporó la función `calcular_prioridad`:

```javascript
export function calcular_prioridad({ impacto, urgencia }) {
  const imp = (impacto || "").toLowerCase();
  const urg = (urgencia || "").toLowerCase();

  let prioridadCalculada = "normal";
  if ((imp === "alto" || imp === "alta") && (urg === "alta" || urg === "alto")) {
    prioridadCalculada = "alta";
  } else if (imp === "bajo" && urg === "baja") {
    prioridadCalculada = "baja";
  }
  return {
    impacto: imp,
    urgencia: urg,
    prioridad_calculada: prioridadCalculada,
    justificacion: "Evaluación matricial de riesgo técnico."
  };
}
```

### 3.3 Definición del Contrato de Herramientas (Function Declarations)
El contrato de comunicación con Gemini formaliza los tipos de datos requeridos y descripciones semánticas que orientan al modelo:

```javascript
export const geminiToolsConfig = [{
  functionDeclarations: [{
    name: "crear_tarea",
    description: "Crea una tarea estructurada. Invocar SOLO si se cuenta con título, fecha, hora y participantes claros.",
    parameters: {
      type: "OBJECT",
      properties: {
        titulo: { type: "STRING", description: "Título descriptivo de la tarea" },
        fecha: { type: "STRING", description: "Fecha en formato YYYY-MM-DD" },
        hora: { type: "STRING", description: "Hora en formato HH:MM" },
        participantes: { 
          type: "ARRAY", 
          items: { type: "STRING" },
          description: "Lista de personas convocadas" 
        },
        prioridad: { 
          type: "STRING", 
          enum: ["baja", "normal", "alta"] 
        }
      },
      required: ["titulo", "fecha", "hora", "participantes"]
    }
  }]
}];
```

### 3.4 Manejo de Ambigüedad y Prevención de Alucinaciones
Un requisito crítico del laboratorio (Caso 3) exige que ante una solicitud con datos faltantes el sistema no invente información. Para lograr esto, se establecieron directivas estrictas en las instrucciones del sistema (*System Instructions*):

> *"NUNCA inventes horarios, fechas o participantes. Si la solicitud está incompleta, NO llames a crear_tarea; en su lugar, responde en lenguaje natural solicitando los datos faltantes."*

Adicionalmente, se incluyó lógica de reintentos automáticos con retroceso exponencial ante eventuales saturaciones temporales del servicio (errores HTTP 503/429).

---

## 4. VALIDACIÓN EXPERIMENTAL Y CASOS DE PRUEBA

Se implementó una suite automatizada (`src/testCases.js`) que somete al sistema a las cuatro pruebas operativas contempladas en la guía. Los resultados obtenidos mediante la ejecución real con la API de Gemini se detallan a continuación:

| Caso | Entrada en Lenguaje Natural | Acción del Sistema | Resultado / Estado |
| :--- | :--- | :--- | :--- |
| **1. Estándar** | «Crear una tarea para entregar el informe de pruebas el viernes a las 16:00. Participarán María y José.» | Invocó `crear_tarea` con fecha calculada (2026-09-25), hora (16:00) y participantes. | **SUPERADO (100%)** |
| **2. Prioridad Alta** | «Programar una reunión de revisión de requisitos para el lunes a las 09:30 con Carlos, Elena y Pedro. La prioridad es alta.» | Invocó `crear_tarea` asignando fecha (2026-09-28) y prioridad «alta». | **SUPERADO (100%)** |
| **3. Ambigüedad (Falta Hora/Gente)** | «Necesito preparar una actividad de documentación del sistema para el próximo miércoles.» | **No alucinó ni inventó datos**. Respondió solicitando la hora y los participantes requeridos. | **SUPERADO (100%)** |
| **4. Reto Adicional** | «Incidencia crítica de impacto alto y urgencia alta en el gateway de pagos...» | Invocó `calcular_prioridad` clasificando el riesgo en «alta». | **SUPERADO (100%)** |

### Evidencia de Ejecución Real (Log de Salida)
```text
============================================================
Caso 1 - Solicitud estándar con participantes y hora
============================================================
[LLM]: El modelo decidió invocar la función local: "crear_tarea"
[Argumentos extraídos por Gemini]: {
  "titulo": "Entregar el informe de pruebas",
  "fecha": "2026-09-25",
  "hora": "16:00",
  "participantes": ["María", "José"],
  "prioridad": "normal"
}
[JavaScript]: Ejecutando función local 'crear_tarea'...
[Resultado Estructurado Producido por JS]:
{
  "id": "task_1790044797699_am6nf",
  "titulo": "Entregar el informe de pruebas",
  "fecha": "2026-09-25",
  "hora": "16:00",
  "participantes": ["María", "José"],
  "prioridad": "normal",
  "estado": "pendiente",
  "creada_en": "2026-09-22T02:39:57.699Z"
}
🎯 [VALIDACIÓN EXITOSA]
```

En el Caso 3, ante la omisión de datos indispensables, la respuesta devuelta por el asistente fue:
> *«Para poder agendar esta actividad y crear la tarea, por favor indícame los siguientes datos que hacen falta: 1. Hora de inicio (ejemplo: 10:00). 2. Participantes convocados o involucrados. Quedo atento para proceder con el registro.»*

Demostrando el estricto cumplimiento de la restricción contra alucinaciones.

---

## 5. CUESTIONARIO DE EVALUACIÓN TEÓRICO-PRÁCTICA

### Pregunta 1: ¿Cuál es la diferencia entre pedirle al LLM que genere una respuesta y utilizar Function Calling?
**Respuesta:**
La diferencia radica en el **determinismo, el control de tipos y los efectos secundarios en el software**:
- **Generación de texto simple ($Usuario \rightarrow LLM \rightarrow Texto$):** El modelo predice tokens estadísticamente. Si se le pide generar un JSON, puede sufrir deformaciones sintácticas, inventar campos o generar formatos incoherentes. Además, el modelo no interactúa con ningún sistema externo.
- **Function Calling ($Usuario \rightarrow LLM \rightarrow Función + Args \rightarrow Programa \rightarrow Resultado$):** El modelo es utilizado como un analizador semántico de lenguaje natural que produce argumentos fuertemente tipados conforme a un esquema predefinido. La aplicación de software mantiene el control absoluto de la ejecución, validando restricciones de negocio, persistiendo en bases de datos y gestionando errores.

### Pregunta 2: ¿Por qué no debemos permitir que el modelo ejecute cualquier función del computador?
**Respuesta:**
Permitir que un modelo invoque comandos arbitrarios del sistema operativo (por ejemplo, invocaciones a la consola `child_process.exec` o acceso irrestricto al disco) vulnera de forma crítica el **principio de mínimo privilegio**:
1. **Inyección Indirecta de Prompts:** Entradas manipuladas por usuarios maliciosos podrían forzar al modelo a solicitar comandos destructivos (como borrado de directorios o robo de credenciales en `.env`).
2. **Naturaleza Probabilística:** Un modelo puede malinterpretar una solicitud legítima y ordenar acciones destructivas irreversibles.
3. **Control de la Aplicación:** La arquitectura debe basarse en un catálogo cerrado de funciones permitidas (*whitelist*). La aplicación actúa como un cortafuegos que autoriza y supervisa cada llamada.

### Pregunta 3: ¿Qué sucede si el usuario proporciona una solicitud ambigua?
**Respuesta:**
En implementaciones ingenuas, el modelo suele «completar» la información ausente inventando horarios o participantes (alucinación), lo que en contextos corporativos ocasiona reuniones fantasmas o tareas mal asignadas.
Una arquitectura madura diseña las directivas del modelo para que, ante la ausencia de parámetros marcados como obligatorios en el contrato de la herramienta, el sistema suspenda la invocación y active un diálogo aclaratorio en lenguaje natural con el usuario, preservando la fidelidad de la información.

### Pregunta 4: ¿Cómo convertirías este laboratorio en una solución empresarial real?
**Respuesta:**
Para llevar este prototipo a escala corporativa se debe transicionar hacia una arquitectura de microservicios orientada a eventos:
1. **API Gateway y Seguridad:** Capa perimetral con autenticación OAuth2 / JWT, limitación de tasa (*rate limiting*) y control de acceso basado en roles (RBAC).
2. **Colas de Mensajería y Tareas Asíncronas:** Uso de sistemas como Redis/BullMQ o RabbitMQ para desacoplar las peticiones y manejar reintentos y tolerancia a fallos.
3. **Integración con Servicios Externos:** Conectores seguros hacia Google Calendar / Microsoft Graph API para agendamiento real, bases de datos relacionales (PostgreSQL) para persistencia y auditoría, y servicios de mensajería (Slack/SendGrid) para notificaciones.
4. **Trazabilidad y Observabilidad:** Registro inmutable de cada interacción (prompt, tokens consumidos, versión del modelo, respuesta de herramienta) bajo normativas de cumplimiento (ISO 27001).
5. **Human-in-the-Loop:** Para acciones con impacto financiero o estructural, requerir confirmación explícita del usuario antes de ejecutar la función.

---

## 6. CONCLUSIONES

1. Se demostró con éxito que los Modelos de Lenguaje de Gran Escala pueden integrarse de manera determinista y segura en sistemas de información mediante el uso de **Function Calling**.
2. La sustitución del entorno propuesto en Python/OpenAI por **JavaScript (Node.js) con la API de Google Gemini** y el gestor **PNPM** probó que los patrones de diseño de agentes y automatización son transferibles y agnósticos al lenguaje.
3. El control de alucinaciones mediante el diseño defensivo de esquemas y directivas de sistema es fundamental para garantizar que el asistente no introduzca datos ficticios en flujos de trabajo corporativos.
4. La separación entre la capa de inferencia cognitiva (LLM) y la capa de ejecución procedimental (código anfitrión) constituye el estándar de ingeniería para el desarrollo seguro de software asistido por inteligencia artificial.

---

## 7. REFERENCIAS BIBLIOGRÁFICAS

1. Khan, S., et al. (2024). *Navigating software development in the ChatGPT and GitHub Copilot era*. Business Horizons, 67(5), 649–661. DOI: 10.1016/j.bushor.2024.04.004.
2. Hou, X., et al. (2024). *Large Language Models for Code Review: A Comprehensive Survey*. Information and Software Technology, 175, 107523. ScienceDirect.
3. Martinez, M., et al. (2024). *An architecture for model-based and intelligent automation in DevOps*. Journal of Systems and Software, 217, 112180.
4. Al-Sayed, R., et al. (2024). *Automating software documentation: Employing LLMs for precise use case description*. Procedia Computer Science, 246, 1346–1354.
5. Uandykova, M., et al. (2024). *Java coding using artificial intelligence*. Frontiers in Computer Science, 6, 1473870.
6. Jing, Y., Wang, H., et al. (2024). *What factors will affect the effectiveness of using ChatGPT to solve programming problems? A quasi-experimental study*. Humanities and Social Sciences Communications, Nature, 11, 319.
