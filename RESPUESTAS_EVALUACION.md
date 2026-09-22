# Respuestas de Evaluación y Fundamentación Conceptual
### Asignatura: Ingeniería de Sistemas / Ingeniería de Software
**Tema:** Asistente de Productividad con Gemini API y Function Calling en JavaScript (Node.js)

---

## Pregunta 1: ¿Cuál es la diferencia entre pedirle al LLM que genere una respuesta y utilizar Function Calling?

### Respuesta Explicada:
La diferencia fundamental radica en el **control de flujo, el determinismo y la integración con sistemas del mundo real**.

* **Generación de texto tradicional (`Usuario → LLM → Texto`):**
  - El modelo de lenguaje predice probabilísticamente el siguiente token.
  - Aunque puede redactar una tarea con apariencia formal, su salida es texto libre no estructurado (o JSON simulado sin garantías de tipos).
  - No interactúa con el entorno: no puede guardar en una base de datos real, no valida fechas de calendario, no ejecuta lógica de negocio y es vulnerable a alucinaciones de formato.

* **Arquitectura Function Calling (`Usuario → LLM → Función + Argumentos → Programa (JavaScript) → Resultado Estructurado`):**
  - El LLM se utiliza exclusivamente como un **motor de inferencia semántica y extracción de entidades**.
  - El modelo no ejecuta nada; en su lugar, devuelve una estructura formal indicando el nombre de la función que debe invocarse (`crear_tarea`) y los argumentos tipados extraídos del lenguaje natural (`titulo`, `fecha`, `hora`, `participantes`).
  - Es el **código JavaScript del desarrollador** el que valida los tipos, asegura restricciones de negocio, genera identificadores únicos y marcas de tiempo confiables (`new Date().toISOString()`), y ejecuta la persistencia o llamadas a APIs secundarias.

| Aspecto | Generación de Texto Directa | Function Calling (Gemini + JS) |
| :--- | :--- | :--- |
| **Rol del LLM** | Generador de contenido final | Parser semántico y selector de herramientas |
| **Determinismo** | Bajo (variaciones sintácticas y estilísticas) | Alto (garantía de esquema y tipos de datos) |
| **Efectos Secundarios** | Nulos (solo texto en pantalla) | Reales (crea registros, envía correos, agenda) |
| **Validación** | Difícil de automatizar | Inmediata mediante validadores de código y schemas |

---

## Pregunta 2: ¿Por qué no debemos permitir que el modelo ejecute cualquier función del computador?

### Respuesta Explicada:
Permitir que un modelo de lenguaje invoque funciones arbitrarias del sistema operativo (por ejemplo, `child_process.exec`, acceso irrestricto al sistema de archivos o llamadas a APIs sin control) rompe el **principio de mínimo privilegio** y abre vectores de ataque críticos:

1. **Inyección de Prompts Indirecta (Prompt Injection):**
   Si el modelo procesa entradas maliciosas provenientes de correos, tickets de soporte o usuarios no confiables, un atacante podría engañarlo para ejecutar comandos destructivos (`rm -rf /`, exfiltración de variables de entorno con credenciales, creación de usuarios no autorizados).
2. **Naturaleza Estocástica de los LLM:**
   Los modelos son probabilísticos, no deterministas. Un error de interpretación en una solicitud ambigua podría desencadenar operaciones irreversibles si el modelo tiene acceso a comandos de sistema.
3. **Principio Arquitectónico Clave:**
   > *"El modelo propone una acción; la aplicación anfitriona (JavaScript) controla, valida y autoriza su ejecución."*
   
   En nuestra implementación, el programa utiliza un despachador local estricto (`localToolDispatchers`). Solo se ejecutan las funciones explícitamente registradas (`crear_tarea`, `calcular_prioridad`), descartando cualquier invocación no autorizada o fuera del catálogo preaprobado.

---

## Pregunta 3: ¿Qué sucede si el estudiante le proporciona al modelo una solicitud ambigua o incompleta?

### Respuesta Explicada:
Si el usuario envía una solicitud incompleta (por ejemplo: *"Necesito preparar una actividad de documentación del sistema para el próximo miércoles"* donde faltan la hora y los participantes):

* **Comportamiento ingenuo / indeseable (Alucinación):**
  Un modelo mal instruido o sin validaciones estrictas intentará forzar los parámetros requeridos inventando datos (por ejemplo, asumiendo una hora a las 09:00 y participantes ficticios), lo cual genera errores graves en entornos empresariales.
* **Comportamiento robusto e inteligente (El implementado en el Caso 3):**
  A través del `systemInstruction` y las definiciones de parámetros obligatorios (`required: ["titulo", "fecha", "hora", "participantes"]`), el asistente detecta que no cuenta con información suficiente. En lugar de invocar la herramienta con datos inventados, el modelo se abstiene de usar `crear_tarea` y responde en lenguaje natural pidiendo las aclaraciones necesarias:
  > *"¿A qué hora deseas programar la actividad de documentación el miércoles y quiénes participarán?"*

Esto garantiza que la automatización de procesos no priorice la velocidad por encima de la **exactitud, trazabilidad y control humano**.

---

## Pregunta 4: ¿Cómo convertirías este laboratorio en una solución empresarial real?

### Respuesta Explicada:
Para transformar este script en un sistema empresarial escalable y resiliente, la arquitectura debe evolucionar hacia un modelo desacoplado de microservicios o arquitectura orientada a eventos:

```
                               ┌────────────────────────────────┐
                               │   Canales de Usuario           │
                               │   (Web Dashboard / Slack / MS Teams / Móvil)
                               └───────────────┬────────────────┘
                                               │ HTTPS / WSS
                                               ▼
                               ┌────────────────────────────────┐
                               │   API Gateway & Auth           │
                               │   (JWT, OAuth2, Rate Limiting) │
                               └───────────────┬────────────────┘
                                               │
                                               ▼
                               ┌────────────────────────────────┐
                               │   Servicio Orquestador AI      │
                               │   (Node.js / Fastify / NestJS) │
                               └───────┬────────────────┬───────┘
                                       │                │
             Inferencia Semántica      │                │  Despacho Seguro
             con Gemini API            ▼                ▼  de Herramientas
                        ┌──────────────────┐    ┌───────────────────────────┐
                        │ Google Gemini    │    │ Capa de Ejecución y       │
                        │ 2.5 Flash        │    │ Validación de Negocio     │
                        │ (Function Calls) │    └──────┬──────┬──────┬──────┘
                        └──────────────────┘           │      │      │
                                    ┌──────────────────┘      │      └─────────────────┐
                                    ▼                         ▼                        ▼
                        ┌──────────────────────┐  ┌───────────────────────┐  ┌────────────────────┐
                        │ Microservicio Agenda │  │ Microservicio Datos   │  │ Servicio Mensajería│
                        │ (Google Calendar API │  │ (PostgreSQL / Prisma /│  │ (SendGrid / Twilio/│
                        │  / Microsoft 365)    │  │  MongoDB - Auditoría) │  │  Slack Webhooks)   │
                        └──────────────────────┘  └───────────────────────┘  └────────────────────┘
```

### Componentes Empresariales Imprescindibles:
1. **Autenticación y Autorización (RBAC):**
   Garantizar que la función invocada por el modelo solo opere bajo los permisos del usuario que emitió la solicitud (por ejemplo, un empleado no puede agendar reuniones en calendarios directivos sin autorización).
2. **Cola de Tareas y Resiliencia (BullMQ / RabbitMQ / Kafka):**
   Manejo asíncrono para operaciones de alta latencia o llamadas a terceros con reintentos exponenciales y Dead Letter Queues (DLQ).
3. **Auditoría y Observabilidad (Logging estructurado / OpenTelemetry):**
   Registro inmutable de: prompt original del usuario, versión del modelo, token usage, tool llamada, argumentos validados y respuesta del sistema para auditorías de cumplimiento normativo (ISO 27001 / GDPR).
4. **Validación Humana en el Bucle (Human-in-the-Loop):**
   Para acciones de alto impacto (modificación de bases de datos de clientes, cancelaciones masivas o correos a clientes), el sistema debe generar una previsualización estructurada y requerir un botón de confirmación explícita del usuario antes de ejecutar la función.
