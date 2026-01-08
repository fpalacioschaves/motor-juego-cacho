/*
  actions.js
  Ejecuta acciones declarativas (mini lenguaje) definidas en escenas.

  ✅ NARRATIVA CONTEXTUAL
  - action.text puede ser:
      "texto"
      o { default, cases:[ { if: {...}, text:"..." }, ... ] }
  - También aplicado a: add_item/remove_item/set_flag/unset_flag/clear_flag,
    y a textos de error (wrongItemText/noItemText), y a dialog title/text si quieres.
*/

import { api } from "./api.js";
import { openDialog, closeDialog } from "./ui_dialog.js";

/* =========================================================
   ✅ NARRATIVA CONTEXTUAL: resolveText + evaluateCond
   ========================================================= */

function resolveText(textOrSpec, ctx) {
  // texto simple
  if (typeof textOrSpec === "string" || typeof textOrSpec === "number") {
    return String(textOrSpec);
  }

  // null/undefined
  if (textOrSpec == null) return "";

  // objeto => spec condicional
  if (typeof textOrSpec === "object") {
    const spec = textOrSpec;

    // formato: { default, cases:[{if, text}] }
    const cases = Array.isArray(spec.cases) ? spec.cases : [];
    for (const c of cases) {
      if (!c) continue;
      if (evaluateCond(c.if, ctx)) {
        return String(c.text ?? "");
      }
    }

    if (spec.default !== undefined) return String(spec.default ?? "");
    if (spec.else !== undefined) return String(spec.else ?? "");
    return "";
  }

  return "";
}

function evaluateCond(cond, ctx) {
  const state = api.state;
  if (!cond) return false;

  // not / all / any
  if (cond.not) return !evaluateCond(cond.not, ctx);
  if (Array.isArray(cond.all)) return cond.all.every((c) => evaluateCond(c, ctx));
  if (Array.isArray(cond.any)) return cond.any.some((c) => evaluateCond(c, ctx));

  // flag: { flag:"x", value: true/false/..." }
  if (cond.flag) {
    const flagName = cond.flag;
    const expected = cond.value; // puede ser undefined
    return api.hasFlag(flagName, expected);
  }

  // hasItem: { hasItem:"llave" }
  if (cond.hasItem) {
    return api.hasItem(cond.hasItem);
  }

  // (futuro) scene / object / etc.
  // if (cond.scene) return state.scene === cond.scene;

  return false;
}

/* =========================================================
   ✅ RUN ACTION
   ========================================================= */

export function runAction(action, ctx) {
  if (!action) return { ok: true, text: "" };

  // Lista de acciones
  if (Array.isArray(action)) {
    let outText = "";
    for (const a of action) {
      const r = runAction(a, ctx);
      if (r?.text) outText += (outText ? "\n" : "") + r.text;
    }
    return { ok: true, text: outText };
  }

  if (typeof action !== "object") return { ok: false, text: "[accion invalida]" };

  switch (action.type) {
    case "say": {
      const text = resolveText(action.text, ctx);
      api.say(text);
      return { ok: true, text };
    }

    // ✅ cambio de escena (tu motor ya lo soporta)
    case "goto": {
      api.goto(action.scene);
      return { ok: true, text: "" };
    }

    // Inventory ---------------------------------------------
    // ✅ Acción oficial: add_item
    case "add_item": {
      api.addItem(action.item);
      return { ok: true, text: resolveText(action.text, ctx) };
    }

    // ✅ Alias retrocompatible: take (para escenas antiguas o ejemplos)
    case "take": {
      api.addItem(action.item);
      return { ok: true, text: resolveText(action.text, ctx) };
    }

    case "remove_item": {
      api.removeItem(action.item);
      return { ok: true, text: resolveText(action.text, ctx) };
    }

    // ✅ Alias retrocompatible (por coherencia futura)
    case "drop": {
      api.removeItem(action.item);
      return { ok: true, text: resolveText(action.text, ctx) };
    }

    // Flags ---------------------------------------------------
    case "set_flag": {
      api.setFlag(action.flag, action.value ?? true);
      return { ok: true, text: resolveText(action.text, ctx) };
    }

    // ✅ retrocompatible: clear_flag existe en escenas actuales
    case "clear_flag": {
      api.unsetFlag(action.flag);
      return { ok: true, text: resolveText(action.text, ctx) };
    }

    // ✅ nuevo: unset_flag (alias más “oficial” según el documento)
    case "unset_flag": {
      api.unsetFlag(action.flag);
      return { ok: true, text: resolveText(action.text, ctx) };
    }

    case "if_flag": {
      const ok = api.hasFlag(action.flag);
      return runAction(ok ? action.then : action.else, ctx);
    }

    case "if_has_item": {
      const ok = api.hasItem(action.item);
      return runAction(ok ? action.then : action.else, ctx);
    }

    // Uso de item seleccionado (inventario) ------------------
    case "use_selected_item": {
      const selected = api.state.selectedItemId;

      if (!selected) {
        return {
          ok: false,
          text: resolveText(action.noItemText ?? "Selecciona antes un objeto del inventario.", ctx),
        };
      }

      if (action.mustBe && selected !== action.mustBe) {
        return {
          ok: false,
          text: resolveText(action.wrongItemText ?? "Ese objeto no sirve aqui.", ctx),
        };
      }

      const res = runAction(action.then, ctx);

      if (action.consume === true) api.removeItem(selected);
      api.state.selectedItemId = null;

      return res;
    }

    /* ===== v0.4: usar item con objeto ===== */
    case "use_with_item": {
      const itemId = action.itemId; // lo pasamos desde renderer
      if (!itemId) return { ok: false, text: "[use_with_item sin itemId]" };

      if (action.mustBe && itemId !== action.mustBe) {
        return {
          ok: false,
          text: resolveText(action.wrongItemText ?? "Ese objeto no sirve aqui.", ctx),
        };
      }

      const res = runAction(action.then, ctx);

      if (action.consume === true) {
        api.removeItem(itemId);
      }

      api.cancelUseMode();
      return res;
    }

    // Dialog --------------------------------------------------
    case "dialog": {
      const title = resolveText(
        action.title ?? (ctx?.object?.name ? `Hablar con ${ctx.object.name}` : "Dialogo"),
        ctx
      );

      const text = resolveText(action.text ?? "", ctx);
      const options = action.options ?? [];

      openDialog({ title, text, options }, (opt) => {
        closeDialog();
        if (opt?.action) runAction(opt.action, ctx);
      });

      return { ok: true, text: "" };
    }

    default:
      return { ok: false, text: `[accion desconocida: ${action.type}]` };
  }
}
