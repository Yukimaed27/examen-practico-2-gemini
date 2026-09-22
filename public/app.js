const chatHistory = document.getElementById("chatHistory");
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

const casosTexto = {
  1: "Crear una tarea para entregar el informe de pruebas el viernes a las 16:00. Participarán María y José.",
  2: "Programar una reunión de revisión de requisitos para el lunes a las 09:30 con Carlos, Elena y Pedro. La prioridad es alta.",
  3: "Necesito preparar una actividad de documentación del sistema para el próximo miércoles.",
  4: "Tenemos una incidencia crítica de impacto alto y urgencia alta en el gateway de pagos. Agenda una reunión de mitigación para hoy a las 17:00 con el equipo de DevOps y Seguridad."
};

function cargarCaso(num) {
  const texto = casosTexto[num];
  if (texto) {
    userInput.value = texto;
    enviarMensaje();
  }
}

function scrollToBottom() {
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

function appendUserMessage(text) {
  const msgDiv = document.createElement("div");
  msgDiv.className = "message user-msg";
  msgDiv.innerHTML = `
    <div class="msg-content">
      <p>${escapeHtml(text)}</p>
    </div>
  `;
  chatHistory.appendChild(msgDiv);
  scrollToBottom();
}

function appendTypingIndicator() {
  const id = `typing_${Date.now()}`;
  const msgDiv = document.createElement("div");
  msgDiv.className = "message assistant-msg";
  msgDiv.id = id;
  msgDiv.innerHTML = `
    <div class="msg-avatar">🤖</div>
    <div class="msg-content">
      <div class="typing-dots">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;
  chatHistory.appendChild(msgDiv);
  scrollToBottom();
  return id;
}

function removeTypingIndicator(id) {
  const elem = document.getElementById(id);
  if (elem) elem.remove();
}

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function appendAssistantResponse(data) {
  const msgDiv = document.createElement("div");
  msgDiv.className = "message assistant-msg";

  let innerHTML = `<div class="msg-avatar">🤖</div><div class="msg-content">`;

  if (data.tipo === "function_call") {
    innerHTML += `<p>✨ <strong>Intención detectada:</strong> Gemini invocó una herramienta local mediante <em>Function Calling</em>.</p>`;

    for (const ejec of data.ejecuciones) {
      innerHTML += `
        <div class="fc-card">
          <div class="fc-header">
            <span class="fc-badge">🔧 Herramienta: ${escapeHtml(ejec.funcion)}</span>
            <span class="fc-status">✔ Ejecutada en JavaScript</span>
          </div>
          <div class="fc-json">Argumentos extraídos:\n${escapeHtml(JSON.stringify(ejec.argumentos, null, 2))}</div>
        </div>
      `;

      if (ejec.funcion === "crear_tarea" && ejec.resultado) {
        const t = ejec.resultado;
        const prioClass = t.prioridad?.toLowerCase() || "normal";
        const parts = Array.isArray(t.participantes) ? t.participantes.join(", ") : t.participantes;

        innerHTML += `
          <div class="task-badge-card">
            <div class="task-title-row">
              <h4>📅 ${escapeHtml(t.titulo)}</h4>
              <span class="prio-pill ${prioClass}">Prioridad ${escapeHtml(t.prioridad)}</span>
            </div>
            <div class="task-meta-grid">
              <div class="meta-item"><strong>Fecha:</strong> ${escapeHtml(t.fecha)}</div>
              <div class="meta-item"><strong>Hora:</strong> ${escapeHtml(t.hora)}</div>
              <div class="meta-item"><strong>Participantes:</strong> ${escapeHtml(parts)}</div>
              <div class="meta-item"><strong>Estado:</strong> ${escapeHtml(t.estado)}</div>
            </div>
          </div>
        `;
      } else if (ejec.funcion === "calcular_prioridad" && ejec.resultado) {
        const r = ejec.resultado;
        innerHTML += `
          <div class="task-badge-card">
            <div class="task-title-row">
              <h4>⚖️ Prioridad Calculada: ${escapeHtml(r.prioridad_calculada.toUpperCase())}</h4>
            </div>
            <p style="font-size: 0.85rem; color: #cbd5e1;">${escapeHtml(r.justificacion)}</p>
          </div>
        `;
      }
    }
  } else {
    // Respuesta de texto (por ejemplo, pidiendo datos faltantes)
    innerHTML += `
      <p style="white-space: pre-wrap;">${escapeHtml(data.respuesta)}</p>
    `;
  }

  innerHTML += `</div>`;
  msgDiv.innerHTML = innerHTML;
  chatHistory.appendChild(msgDiv);
  scrollToBottom();
}

async function enviarMensaje(e) {
  if (e) e.preventDefault();
  const mensaje = userInput.value.trim();
  if (!mensaje) return;

  userInput.value = "";
  appendUserMessage(mensaje);

  const typingId = appendTypingIndicator();
  userInput.disabled = true;
  sendBtn.disabled = true;

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mensaje })
    });

    const json = await res.json();
    removeTypingIndicator(typingId);

    if (json.ok && json.data) {
      appendAssistantResponse(json.data);
    } else {
      appendAssistantResponse({
        tipo: "texto",
        respuesta: `⚠️ Error del Asistente: ${json.error || "No se pudo procesar la solicitud."}`
      });
    }
  } catch (err) {
    removeTypingIndicator(typingId);
    appendAssistantResponse({
      tipo: "texto",
      respuesta: `❌ Error de red o servidor: ${err.message}`
    });
  } finally {
    userInput.disabled = false;
    sendBtn.disabled = false;
    userInput.focus();
  }
}
