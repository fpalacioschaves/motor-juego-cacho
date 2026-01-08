/*
  renderer.js v0.6g
  - ✅ Fondo por escena via scene.background
  - ✅ Título/subtítulo en HEADER (no en el escenario)
*/

import { api } from "./api.js";
import { runAction } from "./actions.js";
import { openDialog, closeDialog } from "./ui_dialog.js";

const $ = (id) => document.getElementById(id);

let UI = null;
let tooltipEl = null;

let verbButtonsById = {};
let verbInitDone = false;

let hoverState = {
  name: null,
  enabled: true,
  kind: null, // "object" | "exit" | null
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
  const sceneEl = document.querySelector(".scene");

  if (!viewport || !stage || !sceneEl) return;

  const vw = sceneEl.clientWidth;

  let scale = vw / BASE_W;
  scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale));

  viewport.style.height = `${BASE_H * scale}px`;
  stage.style.transform = `scale(${scale})`;
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

    // ✅ NUEVO: header scene meta
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
      render(config);
    }
  });

  UI.verbsBar.innerHTML = "";
  verbButtonsById = {};

  for (const v of config.verbs) {
    const btn = document.createElement("button");
    btn.className = "verb-btn";
    btn.type = "button";
    btn.dataset.verb = v.id;
    btn.innerHTML = `${v.label}<small>${v.hint ?? ""}</small>`;

    btn.addEventListener("click", () => {
      if (btn.disabled) return;
      api.setVerb(v.id);
      render(config);
    });

    UI.verbsBar.appendChild(btn);
    verbButtonsById[v.id] = btn;
  }

  updateVerbContextUI(config);

  if (!verbInitDone) {
    api.state.verb = null;
    verbInitDone = true;
  }

  updateHotspotsVisibility(config);
  render(config);
}

export function render(config) {
  const scene = api.scenes[api.state.scene];
  if (!scene) throw new Error(`[render] escena no existe: ${api.state.scene}`);

  // ✅ 1) PINTAR HEADER (aquí estaba “el fallo”: no se hacía)
  if (UI?.sceneHeaderTitle) UI.sceneHeaderTitle.textContent = scene.title ?? scene.id ?? "—";
  if (UI?.sceneHeaderSub) UI.sceneHeaderSub.textContent = scene.subtitle ?? "";

  // ✅ 2) PINTAR FONDO (solo imagen/gradiente)
  if (UI?.sceneBg) {
    const bgPath = scene.background ?? null;

    if (bgPath) {
      UI.sceneBg.classList.add("scene-bg--image");
      UI.sceneBg.style.backgroundImage = `url(${bgPath})`;
    } else {
      UI.sceneBg.classList.remove("scene-bg--image");
      UI.sceneBg.style.backgroundImage = "";
    }

    // ✅ IMPORTANTE: no metemos texto dentro del escenario
    UI.sceneBg.innerHTML = "";
  }

  UI.hotspots.innerHTML = "";

  // =========================
  // OBJETOS
  // =========================
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
      if (!api.state.verb) {
        UI.feedback.textContent =
          "Primero elige un verbo. (Aquí mandan las normas de la SCUMM-ocracia.)";
        render(config);
        return;
      }

      const verb = api.state.verb;
      const ctx = { scene, object: obj, config };

      if (!enabled && verb !== "look") {
        if (api.state.verb === "use" && api.state.useItemId) api.cancelUseMode();

        UI.feedback.textContent =
          obj.disabledText ??
          "Aún no puedes hacer eso. (El juego te mira con superioridad moral.)";

        render(config);
        return;
      }

      if (isVerbDisabledByEntry(obj, verb)) {
        if (verb === "use" && api.state.useItemId) api.cancelUseMode();

        UI.feedback.textContent =
          getDisabledTextByVerb(obj, verb) ??
          "Ese verbo aquí no tiene sentido. (Y tú lo sabías.)";

        render(config);
        return;
      }

      if (verb === "use" && api.state.useItemId) {
        const itemId = api.state.useItemId;
        const useWithAction = obj.verbs?.use_with;

        if (useWithAction) {
          const result = runAction({ ...useWithAction, itemId }, ctx);
          if (result?.text) UI.feedback.textContent = result.text;
          render(config);
          return;
        }

        const defTxt = getDefaultVerbText(obj, "use");
        if (defTxt) {
          UI.feedback.textContent = defTxt;
          api.cancelUseMode();
          render(config);
          return;
        }

        UI.feedback.textContent = "Eso no sirve aqui.";
        api.cancelUseMode();
        render(config);
        return;
      }

      const action = obj.verbs?.[verb];

      if (!action) {
        const defTxt = getDefaultVerbText(obj, verb);
        UI.feedback.textContent = defTxt ?? fallbackMessage(verb);
        render(config);
        return;
      }

      if (action?.type === "dialog") {
        const title = action.title ?? (obj?.name ? `Hablar con ${obj.name}` : "Dialogo");
        const text = action.text ?? "";
        const options = action.options ?? [];

        openDialog({ title, text, options }, (opt) => {
          closeDialog();
          const res = opt?.action ? runAction(opt.action, ctx) : { ok: true, text: "" };
          if (res?.text) UI.feedback.textContent = res.text;
          render(config);
        });

        return;
      }

      const result = runAction(action, ctx);
      UI.feedback.textContent = result?.text ?? "";
      render(config);
    });

    UI.hotspots.appendChild(hs);
  }

  // =========================
  // SALIDAS
  // =========================
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
      if (!enabled) {
        UI.feedback.textContent =
          ex.disabledText ?? "No puedes ir por ahí todavía. (La narrativa manda.)";
        render(config);
        return;
      }

      if (!api.state.verb) {
        UI.feedback.textContent = "Elige un verbo antes. (Sí, incluso para huir.)";
        render(config);
        return;
      }

      api.goto(ex.to);
      UI.feedback.textContent = ex.text ?? "";
      render(config);
    });

    UI.hotspots.appendChild(hs);
  }

  UI.verbsBar.querySelectorAll(".verb-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.verb === api.state.verb);
  });

  updateVerbContextUI(config);

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
          UI.feedback.textContent = "";
          render(config);
          return;
        }

        api.state.selectedItemId = api.state.selectedItemId === itemId ? null : itemId;
        render(config);
      });

      UI.inventory.appendChild(pill);
    }
  }

  renderActionLinePro(config);
  updateHotspotsVisibility(config);
  fitStage();
}

/* =========================================================
   helpers narrativa por verbo
   ========================================================= */

function isVerbDisabledByEntry(entry, verbId) {
  const list = entry?.verbsDisabled;
  if (!Array.isArray(list)) return false;
  return list.includes(verbId);
}

function getDisabledTextByVerb(entry, verbId) {
  const map = entry?.disabledTextByVerb;
  if (!map || typeof map !== "object") return null;
  return map[verbId] ?? null;
}

function getDefaultVerbText(entry, verbId) {
  const map = entry?.defaultVerbText;
  if (!map || typeof map !== "object") return null;
  return map[verbId] ?? null;
}

/* =========================================================
   VERBO CONTEXTUAL
   ========================================================= */

function objectSupportsVerb(obj, verbId) {
  if (!obj) return false;
  if (isVerbDisabledByEntry(obj, verbId)) return false;

  const verbs = obj?.verbs ?? {};
  const hasDefault = Boolean(getDefaultVerbText(obj, verbId));

  if (verbId === "use") return Boolean(verbs.use || verbs.use_with || hasDefault);
  return Boolean(verbs[verbId] || hasDefault);
}

function updateVerbContextUI(config) {
  if (!UI?.verbsBar) return;
  if (!config?.verbs || !Array.isArray(config.verbs)) return;

  if (!hoverState?.name || hoverState.kind !== "object" || !hoverState.entry) {
    setAllVerbButtonsEnabled(config, true);
    return;
  }

  const obj = hoverState.entry;

  if (hoverState.enabled === false) {
    for (const v of config.verbs) {
      const btn = verbButtonsById[v.id];
      if (!btn) continue;

      const allowed = v.id === "look";
      btn.disabled = !allowed;
      btn.classList.toggle("verb-btn--disabled", !allowed);
      btn.title = allowed ? "" : "Bloqueado por condición";
    }
    return;
  }

  for (const v of config.verbs) {
    const btn = verbButtonsById[v.id];
    if (!btn) continue;

    const allowed = objectSupportsVerb(obj, v.id);
    btn.disabled = !allowed;
    btn.classList.toggle("verb-btn--disabled", !allowed);

    if (!allowed && isVerbDisabledByEntry(obj, v.id)) {
      btn.title = getDisabledTextByVerb(obj, v.id) ?? "Este verbo está deshabilitado aquí";
    } else {
      btn.title = allowed ? "" : "Este verbo no aplica aquí";
    }
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

/* =========================================================
   ACTION LINE PRO
   ========================================================= */

function renderActionLinePro(config) {
  if (!UI?.actionLine) return;

  UI.actionLine.innerHTML = "";

  const verbId = api.state.verb;

  if (!verbId) {
    UI.actionLine.appendChild(
      makeToken({
        text: "Elige un verbo…",
        title: "Clic derecho para ciclar verbos",
        kind: "placeholder",
        disabled: true,
      })
    );
    return;
  }

  const verbDef = config.verbs.find((v) => v.id === verbId);
  const verbLabel = verbDef?.label ?? verbId;

  UI.actionLine.appendChild(
    makeToken({
      text: verbLabel,
      title: "Cambiar verbo (clic para pasar al siguiente)",
      kind: "verb",
      onClick: () => cycleVerb(config),
    })
  );

  if (verbId === "use" && api.state.useItemId) {
    const itemId = api.state.useItemId;
    const itemName = config.items[itemId]?.name ?? itemId;

    UI.actionLine.appendChild(makeSep(" "));
    UI.actionLine.appendChild(
      makeToken({
        text: itemName,
        title: "Quitar objeto seleccionado (desarmar)",
        kind: "item",
        onClick: () => {
          api.cancelUseMode();
          render(config);
        },
      })
    );

    UI.actionLine.appendChild(makeSep(" "));
    UI.actionLine.appendChild(makeSep("con"));
    UI.actionLine.appendChild(makeSep(" "));

    const targetText = hoverState.name ?? "…";
    UI.actionLine.appendChild(
      makeToken({
        text: targetText,
        title: hoverState.name ? "Objetivo actual" : "Elige un objetivo",
        kind: hoverState.name ? "target" : "placeholder",
        disabled: false,
        onClick: null,
      })
    );

    UI.actionLine.appendChild(makeSep(" "));
    UI.actionLine.appendChild(
      makeToken({
        text: "✖",
        title: "Cancelar (ESC también)",
        kind: "cancel",
        onClick: () => {
          api.cancelUseMode();
          render(config);
        },
      })
    );

    return;
  }

  UI.actionLine.appendChild(makeSep(" "));

  const targetName = hoverState.name;
  if (!targetName) {
    UI.actionLine.appendChild(
      makeToken({
        text: "Selecciona un objeto…",
        title: "",
        kind: "placeholder",
        disabled: true,
      })
    );
    return;
  }

  UI.actionLine.appendChild(
    makeToken({
      text: targetName,
      title: "Objetivo bajo el cursor",
      kind: "target",
    })
  );
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
    const isEnabled = btn ? !btn.disabled : true;

    if (isEnabled) {
      api.setVerb(candidate);
      render(config);
      return;
    }
  }
}

/* =========================================================
   UTILIDADES
   ========================================================= */

function fallbackMessage(verb) {
  switch (verb) {
    case "look":
      return "No ves nada especial.";
    case "use":
      return "Elige un objeto del inventario para usar con algo.";
    case "talk":
      return "No obtienes respuesta.";
    case "take":
      return "No puedes coger eso.";
    case "open":
      return "No se puede abrir.";
    case "close":
      return "No se puede cerrar.";
    default:
      return "No pasa nada.";
  }
}

function isEntryVisible(entry, state) {
  if (!entry) return true;

  if (entry.hiddenIf !== undefined) {
    if (evaluateCondition(entry.hiddenIf, state)) return false;
  }

  if (entry.visibleIf !== undefined) {
    if (!evaluateCondition(entry.visibleIf, state)) return false;
  }

  return true;
}

function isEntryEnabled(entry, state) {
  if (!entry) return true;

  if (entry.disabledIf !== undefined) {
    if (evaluateCondition(entry.disabledIf, state)) return false;
  }

  if (entry.enabledIf !== undefined) {
    if (!evaluateCondition(entry.enabledIf, state)) return false;
  }

  return true;
}

function evaluateCondition(cond, state) {
  if (typeof cond === "string") return api.hasFlag(cond);
  if (!cond) return false;

  if (Array.isArray(cond)) return cond.every((c) => evaluateCondition(c, state));

  if (cond && typeof cond === "object") {
    if (cond.not) return !evaluateCondition(cond.not, state);
    if (Array.isArray(cond.all)) return cond.all.every((c) => evaluateCondition(c, state));
    if (Array.isArray(cond.any)) return cond.any.some((c) => evaluateCondition(c, state));
    if (cond.hasItem) return api.hasItem(cond.hasItem);
    if (cond.flag) return api.hasFlag(cond.flag, cond.value);
  }

  return false;
}

function shouldShowHotspots(config) {
  return true;
}

function updateHotspotsVisibility(config) {
  if (!UI?.hotspots) return;
  UI.hotspots.classList.toggle("hotspots--visible", shouldShowHotspots(config));
}

function showTooltip(config, text, ev) {
  if (!config.ui?.tooltip?.enabled) return;

  const host = UI?.sceneViewport ?? document.querySelector(".scene");
  const rect = host.getBoundingClientRect();

  const offsetX = config.ui.tooltip.offsetX ?? 14;
  const offsetY = config.ui.tooltip.offsetY ?? 18;

  const x = ev.clientX - rect.left + offsetX;
  const y = ev.clientY - rect.top + offsetY;

  tooltipEl.textContent = text;
  tooltipEl.style.display = "block";
  tooltipEl.style.left = `${x}px`;
  tooltipEl.style.top = `${y}px`;
}

function hideTooltip() {
  if (!tooltipEl) return;
  tooltipEl.style.display = "none";
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
