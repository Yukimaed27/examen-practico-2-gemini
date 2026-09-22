import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  BorderStyle,
  WidthType,
  AlignmentType,
  ShadingType
} from "docx";
import fs from "fs";
import path from "path";

function createHeader(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({
    text,
    heading: level,
    spacing: { before: 280, after: 120 }
  });
}

function createParagraph(text, { bold = false, italic = false, spacingAfter = 140 } = {}) {
  return new Paragraph({
    children: [new TextRun({ text, bold, italics: italic, size: 22, font: "Calibri" })],
    spacing: { after: spacingAfter, line: 276 }
  });
}

function createCodeBlock(codeLines) {
  const tableRows = codeLines.map((line) => {
    return new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: line,
                  font: "Consolas",
                  size: 18,
                  color: "1A1A1A"
                })
              ],
              spacing: { before: 20, after: 20 }
            })
          ],
          shading: {
            fill: "F4F5F7",
            type: ShadingType.CLEAR
          },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.SINGLE, size: 16, color: "0052CC" },
            right: { style: BorderStyle.NONE }
          }
        })
      ]
    });
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: tableRows,
    spacing: { after: 180 }
  });
}

function createCallout(title, text) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: `💡 ${title}\n`, bold: true, size: 22, color: "0747A6", font: "Calibri" }),
                  new TextRun({ text, italics: true, size: 21, color: "172B4D", font: "Calibri" })
                ],
                spacing: { before: 80, after: 80, line: 260 }
              })
            ],
            shading: { fill: "DEEBFF", type: ShadingType.CLEAR },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 4, color: "B3D4FF" },
              bottom: { style: BorderStyle.SINGLE, size: 4, color: "B3D4FF" },
              left: { style: BorderStyle.SINGLE, size: 24, color: "0052CC" },
              right: { style: BorderStyle.SINGLE, size: 4, color: "B3D4FF" }
            }
          })
        ]
      })
    ],
    spacing: { before: 120, after: 180 }
  });
}

async function buildDocx() {
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 22, color: "262626" }
        }
      },
      heading1: {
        run: { font: "Calibri Light", size: 32, bold: true, color: "003366" },
        paragraph: { spacing: { before: 320, after: 140 } }
      },
      heading2: {
        run: { font: "Calibri Light", size: 26, bold: true, color: "0747A6" },
        paragraph: { spacing: { before: 240, after: 100 } }
      }
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }
          }
        },
        children: [
          // Título principal
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "INFORME DE LABORATORIO: SOLUCIONES DE PRODUCTIVIDAD AUTOMATIZADAS MEDIANTE LLM Y SCRIPTING",
                bold: true,
                size: 34,
                color: "003366",
                font: "Calibri"
              })
            ],
            spacing: { before: 100, after: 120 }
          }),

          // Subtítulo
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Implementación de Asistente Empresarial con Google Gemini API, Function Calling y JavaScript bajo Entorno PNPM",
                italics: true,
                size: 24,
                color: "4A5568",
                font: "Calibri"
              })
            ],
            spacing: { after: 260 }
          }),

          // Metadatos
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: "Asignatura: ", bold: true }),
                          new TextRun({ text: "Ingeniería de Sistemas / Ingeniería de Software / TIC" })
                        ]
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: "Modalidad: ", bold: true }),
                          new TextRun({ text: "Laboratorio con Computadores / Examen Práctico 2" })
                        ]
                      })
                    ]
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: "Creador: ", bold: true }),
                          new TextRun({ text: "Yohaldo Edmundo Vega Quinto" })
                        ]
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: "Código Estudiante: ", bold: true }),
                          new TextRun({ text: "U22212893" })
                        ]
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: "Institución: ", bold: true }),
                          new TextRun({ text: "UTP Sede Lima Centro" })
                        ]
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: "Fecha: ", bold: true }),
                          new TextRun({ text: "Septiembre de 2026" })
                        ]
                      })
                    ]
                  })
                ]
              })
            ],
            spacing: { after: 180 }
          }),

          createCallout(
            "AUTORÍA Y DATOS DEL CREADOR",
            "Estudiante / Desarrollador: Yohaldo Edmundo Vega Quinto\nCódigo Universitario: U22212893\nUniversidad: Universidad Tecnológica del Perú (UTP) - Sede Lima Centro\nCurso: Tecnologías de la Información y Comunicación (T.I.C.) - Examen Práctico 2\nProyecto: Implementación y Adaptación de Asistente de Productividad Empresarial con Google Gemini API y JavaScript"
          ),

          createCallout(
            "RESUMEN EJECUTIVO",
            "Este informe documenta el diseño, implementación y validación experimental de un asistente de productividad inteligente basado en Modelos de Lenguaje de Gran Escala (LLM). A diferencia de los enfoques convencionales basados en generación de texto libre, la solución aplica el paradigma de Function Calling utilizando la API oficial de Google Gemini (@google/genai) orquestada en un entorno de ejecución en JavaScript (Node.js) gestionado con PNPM. El sistema interpreta solicitudes no estructuradas en lenguaje natural, extrae entidades tipadas y despacha la ejecución controlada de funciones locales de negocio (crear_tarea y calcular_prioridad), conteniendo alucinaciones ante datos incompletos con un 100% de éxito en las pruebas."
          ),

          // 1. Introducción
          createHeader("1. Introducción y Propósito del Laboratorio"),
          createParagraph(
            "La integración de Modelos de Lenguaje de Gran Escala (LLM) en procesos de ingeniería de software y productividad empresarial exige trascender la simple generación de texto conversacional. En entornos de producción reales, las organizaciones requieren que los sistemas interactúen de manera confiable con bases de datos, APIs de calendario, servicios de mensajería y flujos de trabajo preexistentes."
          ),
          createParagraph(
            "El propósito central de este laboratorio consiste en construir un asistente de productividad capaz de conectar tres dimensiones técnicas:"
          ),
          new Paragraph({
            children: [
              new TextRun({ text: "1. Modelo de Lenguaje (Google Gemini): ", bold: true }),
              new TextRun({ text: "Actúa como motor de inferencia semántica para interpretar solicitudes en lenguaje natural de los empleados." })
            ],
            bullet: { level: 0 },
            spacing: { after: 80 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "2. Function Calling (Contrato de Interfaz): ", bold: true }),
              new TextRun({ text: "Mecanismo formal donde el LLM analiza herramientas y solicita su ejecución devolviendo argumentos estructurados en JSON." })
            ],
            bullet: { level: 0 },
            spacing: { after: 80 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "3. Scripting en JavaScript (Ejecución Local Controlada): ", bold: true }),
              new TextRun({ text: "El entorno anfitrión en Node.js valida tipos, ejecuta la lógica de negocio de manera determinista y genera los identificadores únicos y marcas temporales ISO." })
            ],
            bullet: { level: 0 },
            spacing: { after: 140 }
          }),

          // 2. Arquitectura
          createHeader("2. Arquitectura de la Solución"),
          createParagraph(
            "El diseño implementado descarta delegar el control irrestricto de ejecución a la inteligencia artificial. Se establece una arquitectura desacoplada donde el modelo propone acciones y el software anfitrión valida y ejecuta:"
          ),
          createCallout(
            "Flujo de Control Desacoplado",
            "Usuario (Lenguaje Natural)  ==>  Google Gemini (Inferencia & Extracción)  ==>  Function Calling (Solicitud JSON Tipada)  ==>  JavaScript (Ejecutor Local)  ==>  Resultado Estructurado (JSON con ID, Fecha y Estado)"
          ),
          createParagraph(
            "En este flujo, el LLM jamás ejecuta código directamente en el sistema operativo ni accede a recursos del servidor. El programa en JavaScript actúa como un cortafuegos que autoriza la ejecución."
          ),

          // 3. Implementación Técnica
          createHeader("3. Implementación Técnica en JavaScript"),
          createParagraph(
            "La solución fue desarrollada en JavaScript moderno (ES Modules) utilizando PNPM como administrador exclusivo de dependencias. Se utilizaron las bibliotecas oficiales @google/genai y dotenv."
          ),
          createHeader("3.1 Lógica de Negocio Local (productivityTools.js)", HeadingLevel.HEADING_2),
          createParagraph(
            "La función crear_tarea recibe los datos validados y retorna el objeto estructurado con metadatos de auditoría:"
          ),
          createCodeBlock([
            "export function crear_tarea({ titulo, fecha, hora, participantes, prioridad = 'normal' }) {",
            "  if (!titulo || !fecha || !hora) throw new Error('Parámetros obligatorios ausentes.');",
            "  return {",
            "    id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,",
            "    titulo: titulo.trim(),",
            "    fecha: fecha.trim(),",
            "    hora: hora.trim(),",
            "    participantes: Array.isArray(participantes) ? participantes : [participantes],",
            "    prioridad: prioridad.toLowerCase(),",
            "    estado: 'pendiente',",
            "    creada_en: new Date().toISOString()",
            "  };",
            "}"
          ]),
          createParagraph(
            "Adicionalmente, se implementó la función calcular_prioridad para responder al Reto Adicional de estudiantes avanzados planteado en la sección 14 de la guía:"
          ),
          createCodeBlock([
            "export function calcular_prioridad({ impacto, urgencia }) {",
            "  const imp = (impacto || '').toLowerCase();",
            "  const urg = (urgencia || '').toLowerCase();",
            "  let prioridadCalculada = 'normal';",
            "  if ((imp === 'alto' || imp === 'alta') && (urg === 'alta' || urg === 'alto')) {",
            "    prioridadCalculada = 'alta';",
            "  } else if (imp === 'bajo' && urg === 'baja') {",
            "    prioridadCalculada = 'baja';",
            "  }",
            "  return { impacto: imp, urgencia: urg, prioridad_calculada: prioridadCalculada };",
            "}"
          ]),

          createHeader("3.2 Esquema de Herramientas (Function Declarations)", HeadingLevel.HEADING_2),
          createParagraph(
            "Se definió el contrato formal de parámetros requeridos (título, fecha, hora, participantes) y descripciones semánticas para que Gemini pueda identificar cuándo y cómo invocar cada herramienta."
          ),

          createHeader("3.3 Manejo de Ambigüedad y Prevención de Alucinaciones", HeadingLevel.HEADING_2),
          createParagraph(
            "Para cumplir con el Caso 3 de la guía (solicitudes incompletas), se incluyeron directivas de sistema que prohíben taxativamente la invención de horarios o participantes. Si la solicitud carece de datos obligatorios, el modelo se abstiene de invocar herramientas y emite preguntas aclaratorias en lenguaje natural."
          ),

          // 4. Validación Experimental
          createHeader("4. Validación Experimental y Casos de Prueba"),
          createParagraph(
            "Se sometió al sistema a la batería de cuatro pruebas operativas mediante el script automatizado testCases.js conectado en vivo con la API de Google Gemini. La siguiente tabla resume los resultados:"
          ),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "Caso", bold: true, color: "FFFFFF" })] })],
                    shading: { fill: "003366" }
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "Entrada en Lenguaje Natural", bold: true, color: "FFFFFF" })] })],
                    shading: { fill: "003366" }
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "Acción del Sistema", bold: true, color: "FFFFFF" })] })],
                    shading: { fill: "003366" }
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "Estado", bold: true, color: "FFFFFF" })] })],
                    shading: { fill: "003366" }
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [createParagraph("1. Estándar")] }),
                  new TableCell({ children: [createParagraph("Crear tarea entregar informe de pruebas el viernes a las 16:00 con María y José")] }),
                  new TableCell({ children: [createParagraph("Invocó crear_tarea con fecha calculada, hora y participantes")] }),
                  new TableCell({ children: [createParagraph("SUPERADO (100%)", { bold: true })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [createParagraph("2. Prioridad Alta")] }),
                  new TableCell({ children: [createParagraph("Reunión revisión de requisitos lunes a las 09:30 con Carlos, Elena y Pedro. Prioridad alta")] }),
                  new TableCell({ children: [createParagraph("Invocó crear_tarea con prioridad 'alta' y fecha del lunes")] }),
                  new TableCell({ children: [createParagraph("SUPERADO (100%)", { bold: true })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [createParagraph("3. Ambigüedad")] }),
                  new TableCell({ children: [createParagraph("Preparar actividad de documentación para el próximo miércoles (sin hora/gente)")] }),
                  new TableCell({ children: [createParagraph("NO alucinó. Solicitó en lenguaje natural la hora y participantes")] }),
                  new TableCell({ children: [createParagraph("SUPERADO (100%)", { bold: true })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [createParagraph("4. Reto Adicional")] }),
                  new TableCell({ children: [createParagraph("Incidencia crítica de impacto alto y urgencia alta en el gateway de pagos...")] }),
                  new TableCell({ children: [createParagraph("Invocó calcular_prioridad clasificando riesgo técnico en 'alta'")] }),
                  new TableCell({ children: [createParagraph("SUPERADO (100%)", { bold: true })] })
                ]
              })
            ],
            spacing: { after: 180 }
          }),

          createHeader("5. Cuestionario de Evaluación Teórico-Práctica"),
          createParagraph(
            "Pregunta 1: ¿Cuál es la diferencia entre pedirle al LLM que genere una respuesta y utilizar Function Calling?",
            { bold: true }
          ),
          createParagraph(
            "Respuesta: La diferencia reside en el determinismo, el control de tipos y la integración con el mundo real. En la generación tradicional, el LLM produce texto libre no tipado propenso a deformaciones sintácticas. En Function Calling, el LLM se restringe a inferir intenciones y emitir argumentos JSON conforme a un contrato; la aplicación de software en JavaScript controla la validación, la persistencia en bases de datos y la gestión de errores de forma determinista."
          ),

          createParagraph(
            "Pregunta 2: ¿Por qué no debemos permitir que el modelo ejecute cualquier función del computador?",
            { bold: true }
          ),
          createParagraph(
            "Respuesta: Permitir acceso irrestricto a comandos del sistema operativo (child_process.exec o comandos de consola) rompe el principio de mínimo privilegio y expone al sistema a inyecciones indirectas de prompts donde un atacante podría forzar al modelo a borrar archivos o exfiltrar credenciales. El modelo debe proponer acciones únicamente dentro de una lista blanca (whitelist) autorizada por la aplicación."
          ),

          createParagraph(
            "Pregunta 3: ¿Qué sucede si el estudiante le proporciona al modelo una solicitud ambigua?",
            { bold: true }
          ),
          createParagraph(
            "Respuesta: En sistemas deficientes, el modelo alucina inventando datos faltantes (asignando horas o participantes arbitrarios). En una arquitectura robusta orientada a productividad, el sistema detecta la ausencia de parámetros requeridos, suspende la ejecución de la función y emite una solicitud de aclaración en lenguaje natural."
          ),

          createParagraph(
            "Pregunta 4: ¿Cómo convertirías este laboratorio en una solución empresarial real?",
            { bold: true }
          ),
          createParagraph(
            "Respuesta: La solución debe evolucionar a una arquitectura de microservicios con: 1) API Gateway con autenticación OAuth2/JWT y Rate Limiting; 2) Colas de mensajería (BullMQ / RabbitMQ) para desacoplamiento asíncrono; 3) Conectores seguros a Google Calendar y bases de datos PostgreSQL; 4) Registro inmutable y observabilidad (OpenTelemetry / ISO 27001); 5) Flujo de validación humana (Human-in-the-Loop) para operaciones críticas."
          ),

          createHeader("6. Conclusiones"),
          new Paragraph({
            children: [
              new TextRun({
                text: "• Se demostró la viabilidad y robustez de integrar Google Gemini API mediante Function Calling en JavaScript, sustituyendo con éxito la pila de referencia de Python/OpenAI."
              })
            ],
            bullet: { level: 0 },
            spacing: { after: 60 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "• La separación entre inferencia semántica (LLM) y ejecución determinista (JavaScript) previene vulnerabilidades de seguridad y alucinaciones en los datos corporativos."
              })
            ],
            bullet: { level: 0 },
            spacing: { after: 60 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "• El uso exclusivo de PNPM aseguró un entorno de dependencias ligero, veloz y reproducible para la ejecución de pruebas."
              })
            ],
            bullet: { level: 0 },
            spacing: { after: 140 }
          }),

          createHeader("7. Referencias Bibliográficas"),
          createParagraph("1. Khan, S., et al. (2024). Navigating software development in the ChatGPT and GitHub Copilot era. Business Horizons, 67(5), 649–661."),
          createParagraph("2. Hou, X., et al. (2024). Large Language Models for Code Review: A Comprehensive Survey. Information and Software Technology, 175, 107523."),
          createParagraph("3. Martinez, M., et al. (2024). An architecture for model-based and intelligent automation in DevOps. Journal of Systems and Software, 217, 112180."),
          createParagraph("4. Al-Sayed, R., et al. (2024). Automating software documentation: Employing LLMs for precise use case description. Procedia Computer Science, 246, 1346–1354."),
          createParagraph("5. Uandykova, M., et al. (2024). Java coding using artificial intelligence. Frontiers in Computer Science, 6, 1473870."),
          createParagraph("6. Jing, Y., Wang, H., et al. (2024). What factors will affect the effectiveness of using ChatGPT to solve programming problems? Nature - Humanities & Social Sciences, 11, 319.")
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  const outputPath = path.join(process.cwd(), "informe_laboratorio.docx");
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ Documento Word generado exitosamente en: ${outputPath}`);
}

buildDocx().catch((err) => {
  console.error("Error generando docx:", err);
  process.exit(1);
});
