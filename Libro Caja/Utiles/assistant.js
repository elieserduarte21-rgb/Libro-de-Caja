const assistantUI = {
  panel: document.getElementById("assistantPanel"),
  launcher: document.getElementById("assistantLauncher"),
  messages: document.getElementById("assistantMessages"),
  form: document.getElementById("assistantForm"),
  input: document.getElementById("assistantInput"),
  send: document.getElementById("assistantSend"),
  mic: document.getElementById("assistantMic"),
  status: document.getElementById("assistantStatus"),
};

let assistantAgent;
let assistantMessages = [];
let recognition;
let listening = false;
let speechRequest = 0;

function addAssistantMessage(text, role = "assistant") {
  const bubble = document.createElement("div");
  bubble.className = `assistant-message ${role}`;
  const content = document.createElement("p");
  content.textContent = text;
  bubble.append(content);
  if (role === "assistant" && text.trim()) {
    const speak = document.createElement("button");
    speak.type = "button";
    speak.className = "assistant-speak";
    speak.title = "Escuchar respuesta";
    speak.setAttribute("aria-label", "Escuchar respuesta");
    speak.textContent = "◖))";
    speak.addEventListener("click", () => speakAssistantText(text));
    bubble.append(speak);
  }
  assistantUI.messages.append(bubble);
  assistantUI.messages.scrollTop = assistantUI.messages.scrollHeight;
}

function setAssistantStatus(text, busy = false) {
  assistantUI.status.textContent = text;
  assistantUI.send.disabled = busy;
  assistantUI.input.disabled = busy;
}

function showAssistantScreen(screen) {
  const tab = document.querySelector(`.screen-tab[data-screen="${screen}"]`);
  if (!tab) return { error: "No encontré ese informe." };
  document.querySelectorAll(".screen-tab").forEach(item => item.classList.toggle("active", item === tab));
  document.querySelectorAll("main[id]").forEach(view => view.hidden = view.id !== screen);
  document.getElementById("newItemButton").hidden = screen !== "inventoryView";
  const renderers = {
    inventoryView: window.inventoryAssistant.renderInventory,
    ccView: window.inventoryAssistant.renderCostReport,
    generalView: window.inventoryAssistant.renderGeneral,
    breakagesView: window.inventoryAssistant.renderBreakages,
    personalView: window.inventoryAssistant.renderPersonal,
    responsibilityView: window.inventoryAssistant.renderResponsibility,
    disposalView: window.inventoryAssistant.renderDisposal,
  };
  renderers[screen]?.();
  return { shown: screen };
}

async function buildAssistantAgent() {
  if (assistantAgent) return assistantAgent;
  assistantAgent = await websim.agent.create({
    instructions: `Eres el asistente del sistema de Inventario de Útiles. Habla siempre en español, con claridad y brevedad.
Puedes consultar registros e informes, aplicar filtros en pantalla y editar datos únicamente usando tus herramientas.
Antes de afirmar cifras, consulta los datos con la herramienta correspondiente. Nunca inventes datos.
Para editar, primero identifica el registro con una consulta. Si el resultado es ambiguo, pregunta cuál registro desea cambiar. Cambia solo los campos que el usuario pidió. Confirma claramente las modificaciones realizadas.
No elimines registros, no registres roturas y no cambies configuraciones de la empresa. No afirmes que aplicaste un filtro si la herramienta devolvió un error.
Al filtrar, abre el informe relevante y aplica los filtros disponibles. Los cambios se guardan en este dispositivo.`,
    reasoning: false,
    maxSteps: 5,
    tools: {
      consultar_inventario: {
        description: "Consulta útiles por nombre, código, centro de costo, departamento, responsable y estado. Devuelve datos reales y totales.",
        parameters: {
          type: "object",
          properties: {
            texto: { type: "string", description: "Texto para buscar; puede ser nombre, código, CC, departamento o responsable." },
            centro_costo: { type: "string" },
            departamento: { type: "string" },
            responsable: { type: "string" },
            estado: { type: "string", description: "Bueno, Regular, Requiere reparación o Fuera de servicio." },
          },
          additionalProperties: false,
        },
        execute: args => window.inventoryAssistant.search(args),
      },
      editar_util: {
        description: "Edita un útil identificado por su id o nombre exacto. Realiza primero una consulta y usa el id cuando esté disponible. Campos editables: nombre, codigo, cantidad, unidad, estado, centro_costo, departamento, ubicacion, observaciones, descripcion, precio. Si hay duplicados devuelve opciones sin hacer cambios.",
        parameters: {
          type: "object",
          properties: {
            identificador: { type: "string", description: "Id del útil devuelto por consultar_inventario o nombre exacto." },
            cambios: {
              type: "object",
              properties: {
                nombre: { type: "string" }, codigo: { type: "string" }, cantidad: { type: "number" },
                unidad: { type: "string" }, estado: { type: "string" }, centro_costo: { type: "string" },
                departamento: { type: "string" }, ubicacion: { type: "string" }, observaciones: { type: "string" },
                descripcion: { type: "string" }, precio: { type: "number" },
              },
              additionalProperties: false,
            },
          },
          required: ["identificador", "cambios"],
          additionalProperties: false,
        },
        execute: args => window.inventoryAssistant.update(args),
      },
      filtrar_informe: {
        description: "Abre y filtra un informe o el inventario. Vistas válidas: inventario, centro_costo, general, roturas, responsabilidad, personal, bajas. Filtros disponibles según la vista: texto, estado, departamento, centro_costo, responsable.",
        parameters: {
          type: "object",
          properties: {
            vista: { type: "string", enum: ["inventario", "centro_costo", "general", "roturas", "responsabilidad", "personal", "bajas"] },
            texto: { type: "string" }, estado: { type: "string" }, departamento: { type: "string" },
            centro_costo: { type: "string" }, responsable: { type: "string" },
          },
          required: ["vista"],
          additionalProperties: false,
        },
        execute: args => window.inventoryAssistant.filter(args),
      },
    },
  });
  return assistantAgent;
}

function lastAssistantText(messages) {
  for (let index = messages.length - 1; index >= 0; index--) {
    const message = messages[index];
    if (message.role !== "assistant") continue;
    if (typeof message.content === "string" && message.content.trim()) return message.content;
    const parts = message.content || message.parts || [];
    const text = Array.isArray(parts) ? parts.filter(part => part.type === "text").map(part => part.text).join("") : "";
    if (text.trim()) return text;
  }
  return "";
}

async function sendAssistantMessage(text) {
  const message = text.trim();
  if (!message || assistantUI.send.disabled) return;
  addAssistantMessage(message, "user");
  assistantUI.input.value = "";
  setAssistantStatus("Pensando…", true);
  const thinking = document.createElement("div");
  thinking.className = "assistant-message assistant-thinking";
  thinking.textContent = "…";
  assistantUI.messages.append(thinking);
  assistantUI.messages.scrollTop = assistantUI.messages.scrollHeight;
  try {
    const agent = await buildAssistantAgent();
    assistantMessages.push({ role: "user", content: message });
    assistantMessages = assistantMessages.slice(-16);
    const result = await agent.generate({ messages: assistantMessages });
    const returned = result.response?.messages || [];
    const answer = lastAssistantText(returned) || "No pude preparar una respuesta. Inténtalo de nuevo.";
    assistantMessages.push({ role: "assistant", content: answer });
    assistantMessages = assistantMessages.slice(-16);
    thinking.remove();
    addAssistantMessage(answer);
    setAssistantStatus("Listo");
  } catch (error) {
    thinking.remove();
    const reason = error?.message || "";
    const text = /sign_in_required|credits_required|rate_limited/i.test(reason)
      ? "El servicio de IA no está disponible en este momento. Puedes volver a intentarlo más tarde."
      : "No pude conectar con el asistente. Revisa la conexión e inténtalo de nuevo.";
    addAssistantMessage(text);
    setAssistantStatus("No se pudo conectar");
    console.error("Error del asistente:", error);
  } finally {
    assistantUI.input.disabled = false;
    assistantUI.send.disabled = false;
    assistantUI.input.focus();
  }
}

async function speakAssistantText(text) {
  if (!window.websim?.textToSpeech) {
    addAssistantMessage("La lectura en voz alta no está disponible en este navegador.");
    return;
  }
  const request = ++speechRequest;
  try {
    await websim.textToSpeech({ text, voice: "es-female" });
  } catch (error) {
    if (request === speechRequest) setAssistantStatus("No se pudo reproducir el audio");
  }
}

function setupVoiceInput() {
  const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognitionAPI) {
    assistantUI.mic.disabled = true;
    assistantUI.mic.title = "El dictado no está disponible en este navegador";
    assistantUI.mic.setAttribute("aria-label", "El dictado no está disponible");
    return;
  }
  recognition = new SpeechRecognitionAPI();
  recognition.lang = "es-ES";
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.onstart = () => {
    listening = true;
    assistantUI.mic.classList.add("recording");
    assistantUI.mic.setAttribute("aria-label", "Detener dictado");
    setAssistantStatus("Escuchando…");
  };
  recognition.onresult = event => {
    const transcript = Array.from(event.results).map(result => result[0].transcript).join("");
    assistantUI.input.value = transcript;
  };
  recognition.onerror = () => setAssistantStatus("No se pudo reconocer la voz");
  recognition.onend = () => {
    listening = false;
    assistantUI.mic.classList.remove("recording");
    assistantUI.mic.setAttribute("aria-label", "Dictar mensaje");
    if (!assistantUI.send.disabled) setAssistantStatus("Listo");
  };
  assistantUI.mic.addEventListener("click", () => {
    if (listening) recognition.stop();
    else {
      try { recognition.start(); } catch { setAssistantStatus("El micrófono ya está activo"); }
    }
  });
}

assistantUI.launcher.addEventListener("click", () => {
  const open = assistantUI.panel.hidden;
  assistantUI.panel.hidden = !open;
  assistantUI.launcher.setAttribute("aria-expanded", String(open));
  if (open) assistantUI.input.focus();
});
document.getElementById("assistantClose").addEventListener("click", () => {
  assistantUI.panel.hidden = true;
  assistantUI.launcher.setAttribute("aria-expanded", "false");
});
assistantUI.form.addEventListener("submit", event => {
  event.preventDefault();
  sendAssistantMessage(assistantUI.input.value);
});
setupVoiceInput();
addAssistantMessage("Hola. Puedo consultar el inventario, filtrar informes y editar registros si me indicas qué cambiar.");

Object.assign(window.inventoryAssistant || {}, {
  renderInventory: () => document.getElementById("searchInput").dispatchEvent(new Event("input")),
  renderCostReport: () => document.getElementById("ccFilter").dispatchEvent(new Event("change")),
  renderGeneral: () => document.getElementById("generalDateLabel").textContent = document.getElementById("todayLabel").textContent,
  renderBreakages: () => document.getElementById("breakageResponsibleFilter").dispatchEvent(new Event("change")),
  renderPersonal: () => document.getElementById("personalResponsible").dispatchEvent(new Event("change")),
  renderResponsibility: () => document.getElementById("responsibilitySheetSelect").dispatchEvent(new Event("change")),
  renderDisposal: () => document.getElementById("disposalResponsible").dispatchEvent(new Event("change")),
});
