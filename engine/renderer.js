/*
  renderer.js v0.7
  - ✅ Modularizado: usa logic.js para condiciones
  - ✅ Reactivo: se suscribe a api.onUpdate
*/

import { api } from "./api.js";
import { runAction } from "./actions.js";
import { openDialog, closeDialog } from "./ui_dialog.js";
import {
  isEntryVisible,
  isEntryEnabled,
  isVerbDisabledByEntry,
  getDisabledTextByVerb,
  getDefaultVerbText,
  objectSupportsVerb
} from "./logic.js";

const $ = (id) => document.getElementById(id);

let UI = null;
let tooltipEl = null;

let verbButtonsById = {};
let verbInitDone = false;

let hoverState = {
  name: null,
  enabled: true,
  kind: null,
  entry: null,
};

const BASE_W = 1440;
const BASE_H = 810;
const MIN_SCALE = 0.55;
const MAX_SCALE = 1.25;

function ensureStageDOM() {
  const sceneEl = document.querySelector(".scene");
  if (!sceneEl) return;

  const bg = $("sceneBg");
  const hs = $("hotspots");
  if (!bg || !hs) return;

  if (document.getElementById("sceneViewport")) return;

  const viewport = document.createElement("div");
  viewport.id = "sceneViewport";
  viewport.className = "scene-viewport";

  const stage = document.createElement("div");
  stage.id = "sceneStage";
  stage.className = "scene-stage";

  viewport.style.position = "relative";
  viewport.style.width = "100%";
  viewport.style.overflow = "hidden";
  viewport.style.borderBottom = "var(--border)";
  viewport.style.background =
    "linear-gradient(135deg, rgba(122, 167, 255, 0.18), rgba(255, 255, 255, 0.02))";

  stage.style.position = "absolute";
  stage.style.left = "0";
  stage.style.top = "0";
  stage.style.width = BASE_W + "px";
  stage.style.height = BASE_H + "px";
  stage.style.transformOrigin = "0 0";

  sceneEl.insertBefore(viewport, sceneEl.firstChild);
  viewport.appendChild(stage);

  stage.appendChild(bg);
  stage.appendChild(hs);

  bg.style.height = BASE_H + "px";
  bg.style.padding = "0";
}

function fitStage() {
  const viewport = document.getElementById("sceneViewport");
  const stage = document.getElementById("sceneStage");

  if (!viewport || !stage) return;

  const vw = viewport.clientWidth;
  const vh = viewport.clientHeight;

  if (vw === 0 || vh === 0) return;

  // Calculamos escala para que quepa tanto en ancho como en alto
  const scaleW = vw / BASE_W;
  const scaleH = vh / BASE_H;

  let scale = Math.min(scaleW, scaleH);
  scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale));

  stage.style.transform = `scale(${scale})`;

  // Centrar el escenario si sobra espacio
  const actualW = BASE_W * scale;
  const actualH = BASE_H * scale;

  stage.style.left = `${(vw - actualW) / 2}px`;
  stage.style.top = `${(vh - actualH) / 2}px`;
}

export function bindUI(config) {
  ensureStageDOM();
  fitStage();
  window.addEventListener("resize", fitStage);

  UI = {
    sceneViewport: document.getElementById("sceneViewport"),
    sceneStage: document.getElementById("sceneStage"),
    sceneBg: $("sceneBg"),
    hotspots: $("hotspots"),
    verbsBar: $("verbsBar"),
    inventory: $("inventory"),
    actionLine: $("actionLine"),
    feedback: $("feedback"),
    sceneHeaderTitle: $("sceneHeaderTitle"),
    sceneHeaderSub: $("sceneHeaderSub"),
  };

  tooltipEl = document.createElement("div");
  tooltipEl.className = "tooltip";
  tooltipEl.style.display = "none";

  const tooltipHost = UI.sceneViewport ?? document.querySelector(".scene");
  tooltipHost.appendChild(tooltipEl);

  const sceneEl = document.querySelector(".scene");
  if (sceneEl) {
    sceneEl.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      cycleVerb(config);
    });
  }

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      api.cancelUseMode();
    }
  });

  UI.verbsBar.innerHTML = "";
  verbButtonsById = {};

  for (const v of config.verbs) {
    const btn = document.createElement("button");
    btn.className = "verb-btn";
    btn.type = "button";
    btn.dataset.verb = v.id;
    btn.innerHTML = `${v.label} <small>${v.hint ?? ""}</small>`;

    btn.addEventListener("click", () => {
      if (btn.disabled) return;
      api.setVerb(v.id);
    });

    UI.verbsBar.appendChild(btn);
    verbButtonsById[v.id] = btn;
  }

  // ✅ Suscribirse a cambios de estado
  api.onUpdate(() => render(config));

  if (!verbInitDone) {
    api.state.verb = "look";
    verbInitDone = true;
  }

  render(config);
}

export function render(config) {
  const scene = api.scenes[api.state.scene];
  if (!scene) throw new Error(`[render] escena no existe: ${api.state.scene}`);

  if (UI?.sceneHeaderTitle) UI.sceneHeaderTitle.textContent = scene.title ?? scene.id ?? "—";
  if (UI?.sceneHeaderSub) UI.sceneHeaderSub.textContent = scene.subtitle ?? "";

  if (UI?.sceneBg) {
    const bgPath = scene.background ?? null;
    if (bgPath) {
      UI.sceneBg.classList.add("scene-bg--image");
      UI.sceneBg.style.backgroundImage = `url(${bgPath})`;
    } else {
      UI.sceneBg.classList.remove("scene-bg--image");
      UI.sceneBg.style.backgroundImage = "";
    }
    UI.sceneBg.innerHTML = "";
  }

  UI.hotspots.innerHTML = "";

  // Render Objects
  for (const obj of scene.objects ?? []) {
    if (!isEntryVisible(obj, api.state)) continue;

    const enabled = isEntryEnabled(obj, api.state);
    const hs = document.createElement("div");
    hs.className = "hotspot";
    hs.classList.toggle("hotspot--disabled", !enabled);
    hs.style.left = obj.hotspot.x + "px";
    hs.style.top = obj.hotspot.y + "px";
    hs.style.width = obj.hotspot.w + "px";
    hs.style.height = obj.hotspot.h + "px";
    hs.title = obj.name;

    hs.addEventListener("mousemove", (ev) => {
      showTooltip(config, obj.name, ev);
      hoverState = { name: obj.name, enabled, kind: "object", entry: obj };
      updateVerbContextUI(config);
      renderActionLinePro(config);
    });

    hs.addEventListener("mouseleave", () => {
      hideTooltip();
      hoverState = { name: null, enabled: true, kind: null, entry: null };
      updateVerbContextUI(config);
      renderActionLinePro(config);
    });

    hs.addEventListener("click", () => {
      handleEntryClick(obj, "object", config, scene);
    });

    UI.hotspots.appendChild(hs);
  }

  // Render Exits
  for (const ex of scene.exits ?? []) {
    if (!isEntryVisible(ex, api.state)) continue;

    const enabled = isEntryEnabled(ex, api.state);
    const hs = document.createElement("div");
    hs.className = "hotspot exit";
    hs.classList.toggle("hotspot--disabled", !enabled);
    hs.style.left = ex.hotspot.x + "px";
    hs.style.top = ex.hotspot.y + "px";
    hs.style.width = ex.hotspot.w + "px";
    hs.style.height = ex.hotspot.h + "px";
    hs.title = ex.label ?? "Salir";

    hs.addEventListener("mousemove", (ev) => {
      const label = ex.label ?? "Salida";
      showTooltip(config, label, ev);
      hoverState = { name: label, enabled, kind: "exit", entry: ex };
      updateVerbContextUI(config);
      renderActionLinePro(config);
    });

    hs.addEventListener("mouseleave", () => {
      hideTooltip();
      hoverState = { name: null, enabled: true, kind: null, entry: null };
      updateVerbContextUI(config);
      renderActionLinePro(config);
    });

    hs.addEventListener("click", () => {
      handleEntryClick(ex, "exit", config, scene);
    });

    UI.hotspots.appendChild(hs);
  }

  UI.verbsBar.querySelectorAll(".verb-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.verb === api.state.verb);
  });

  updateVerbContextUI(config);

  // Render Inventory
  UI.inventory.innerHTML = "";
  if ((api.state.inventory ?? []).length === 0) {
    const empty = document.createElement("div");
    empty.className = "muted";
    empty.textContent = "(vacío)";
    UI.inventory.appendChild(empty);
  } else {
    for (const itemId of api.state.inventory) {
      const itemDef = config.items[itemId] ?? { name: itemId };
      const pill = document.createElement("div");
      pill.className = "item-pill";
      pill.textContent = itemDef.name;
      pill.title = itemDef.description ?? "";

      const isActive = api.state.selectedItemId === itemId || api.state.useItemId === itemId;
      pill.classList.toggle("active", isActive);

      pill.addEventListener("click", () => {
        if (api.state.verb === "use") {
          api.armUseItem(itemId);
        } else {
          api.setSelectedItemID(api.state.selectedItemId === itemId ? null : itemId);
        }
      });

      UI.inventory.appendChild(pill);
    }
  }

  renderActionLinePro(config);
  updateHotspotsVisibility(config);
  fitStage();
}

function handleEntryClick(entry, kind, config, scene) {
  const enabled = isEntryEnabled(entry, api.state);
  const verb = api.state.verb;
  const ctx = { scene, object: entry, config };

  if (kind === "exit") {
    if (!enabled) {
      UI.feedback.textContent = entry.disabledText ?? "No puedes ir por ahí todavía.";
      return;
    }
    if (!verb) {
      UI.feedback.textContent = "Elige un verbo antes.";
      return;
    }
    api.goto(entry.to);
    UI.feedback.textContent = entry.text ?? "";
    return;
  }

  // Object handling
  if (!verb) {
    UI.feedback.textContent = "Primero elige un verbo.";
    return;
  }

  if (!enabled && verb !== "look") {
    if (verb === "use" && api.state.useItemId) api.cancelUseMode();
    UI.feedback.textContent = entry.disabledText ?? "Aún no puedes hacer eso.";
    return;
  }

  if (isVerbDisabledByEntry(entry, verb)) {
    if (verb === "use" && api.state.useItemId) api.cancelUseMode();
    UI.feedback.textContent = getDisabledTextByVerb(entry, verb) ?? "Ese verbo aquí no tiene sentido.";
    return;
  }

  if (verb === "use" && api.state.useItemId) {
    const itemId = api.state.useItemId;
    const useWithAction = entry.verbs?.use_with;

    if (useWithAction) {
      const result = runAction({ ...useWithAction, itemId }, ctx);
      if (result?.text) UI.feedback.textContent = result.text;
      return;
    }

    const defTxt = getDefaultVerbText(entry, "use");
    if (defTxt) {
      UI.feedback.textContent = defTxt;
      api.cancelUseMode();
      return;
    }

    UI.feedback.textContent = "Eso no sirve aqui.";
    api.cancelUseMode();
    return;
  }

  const action = entry.verbs?.[verb];
  if (!action) {
    const defTxt = getDefaultVerbText(entry, verb);
    UI.feedback.textContent = defTxt ?? fallbackMessage(verb);
    return;
  }

  if (action?.type === "dialog") {
    const title = action.title ?? (entry?.name ? `Hablar con ${entry.name}` : "Dialogo");
    openDialog({ title, text: action.text ?? "", options: action.options ?? [] }, (opt) => {
      closeDialog();
      const res = opt?.action ? runAction(opt.action, ctx) : { ok: true, text: "" };
      if (res?.text) UI.feedback.textContent = res.text;
    });
    return;
  }

  const result = runAction(action, ctx);
  UI.feedback.textContent = result?.text ?? "";
}

function updateVerbContextUI(config) {
  if (!UI?.verbsBar) return;

  if (!hoverState?.name || hoverState.kind !== "object" || !hoverState.entry) {
    setAllVerbButtonsEnabled(config, true);
    return;
  }

  const obj = hoverState.entry;
  for (const v of config.verbs) {
    const btn = verbButtonsById[v.id];
    if (!btn) continue;

    const allowed = hoverState.enabled === false ? (v.id === "look") : objectSupportsVerb(obj, v.id);
    btn.disabled = !allowed;
    btn.classList.toggle("verb-btn--disabled", !allowed);
  }
}

function setAllVerbButtonsEnabled(config, enabled) {
  for (const v of config.verbs) {
    const btn = verbButtonsById[v.id];
    if (!btn) continue;
    btn.disabled = !enabled;
    btn.classList.toggle("verb-btn--disabled", !enabled);
    btn.title = "";
  }
}

function renderActionLinePro(config) {
  if (!UI?.actionLine) return;
  UI.actionLine.innerHTML = "";

  const verbId = api.state.verb;
  if (!verbId) {
    UI.actionLine.appendChild(makeToken({ text: "Elige un verbo…", kind: "placeholder", disabled: true }));
    return;
  }

  const verbDef = config.verbs.find((v) => v.id === verbId);
  UI.actionLine.appendChild(makeToken({ text: verbDef?.label ?? verbId, kind: "verb", onClick: () => cycleVerb(config) }));

  if (verbId === "use" && api.state.useItemId) {
    const itemName = config.items[api.state.useItemId]?.name ?? api.state.useItemId;
    UI.actionLine.appendChild(makeSep(" "));
    UI.actionLine.appendChild(makeToken({ text: itemName, kind: "item", onClick: () => api.cancelUseMode() }));
    UI.actionLine.appendChild(makeSep(" con "));
    UI.actionLine.appendChild(makeToken({ text: hoverState.name ?? "…", kind: hoverState.name ? "target" : "placeholder" }));
    return;
  }

  UI.actionLine.appendChild(makeSep(" "));
  const targetName = hoverState.name;
  if (!targetName) {
    UI.actionLine.appendChild(makeToken({ text: "Selecciona un objeto…", kind: "placeholder", disabled: true }));
  } else {
    UI.actionLine.appendChild(makeToken({ text: targetName, kind: "target" }));
  }
}

function makeToken({ text, title = "", kind = "token", disabled = false, onClick = null }) {
  const el = document.createElement("button");
  el.type = "button";
  el.className = `action-token action-token--${kind}`;
  el.textContent = String(text ?? "");
  if (title) el.title = title;

  if (disabled) {
    el.disabled = true;
    el.classList.add("action-token--disabled");
    return el;
  }

  if (typeof onClick === "function") {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick();
    });
  } else {
    el.classList.add("action-token--static");
  }

  return el;
}

function makeSep(text) {
  const s = document.createElement("span");
  s.className = "action-sep";
  s.textContent = text;
  return s;
}

function cycleVerb(config) {
  const verbs = config.verbs.map((v) => v.id);
  const current = api.state.verb;
  const idx = current ? verbs.indexOf(current) : -1;

  for (let step = 1; step <= verbs.length; step++) {
    const candidate = verbs[(idx + step + verbs.length) % verbs.length];
    const btn = verbButtonsById?.[candidate];
    if (btn && !btn.disabled) {
      api.setVerb(candidate);
      return;
    }
  }
}

function fallbackMessage(verb) {
  switch (verb) {
    case "look": return "No ves nada especial.";
    case "use": return "Elige un objeto del inventario.";
    case "talk": return "No obtienes respuesta.";
    case "take": return "No puedes coger eso.";
    case "open": return "No se puede abrir.";
    case "close": return "No se puede cerrar.";
    default: return "No pasa nada.";
  }
}

function updateHotspotsVisibility(config) {
  if (!UI?.hotspots) return;
  UI.hotspots.classList.toggle("hotspots--visible", true);
}

function showTooltip(config, text, ev) {
  if (!config.ui?.tooltip?.enabled) return;
  const host = UI?.sceneViewport ?? document.querySelector(".scene");
  const rect = host.getBoundingClientRect();
  const x = ev.clientX - rect.left + (config.ui.tooltip.offsetX ?? 14);
  const y = ev.clientY - rect.top + (config.ui.tooltip.offsetY ?? 18);
  tooltipEl.textContent = text;
  tooltipEl.style.display = "block";
  tooltipEl.style.left = `${x}px`;
  tooltipEl.style.top = `${y}px`;
}

function hideTooltip() {
  if (tooltipEl) tooltipEl.style.display = "none";
}
