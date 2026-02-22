/**
 * engine/logic.js
 * 
 * Lógica pura de evaluación de estado y condiciones.
 * Separada del renderer y de las acciones para ser reutilizable.
 */

import { api } from "./api.js";

/**
 * Evalúa una condición compleja (string, array, u objeto) contra el estado actual.
 */
export function evaluateCondition(cond, state = api.state) {
    if (typeof cond === "string") return api.hasFlag(cond);
    if (!cond) return false;

    if (Array.isArray(cond)) return cond.every((c) => evaluateCondition(c, state));

    if (typeof cond === "object") {
        if (cond.not) return !evaluateCondition(cond.not, state);
        if (Array.isArray(cond.all)) return cond.all.every((c) => evaluateCondition(c, state));
        if (Array.isArray(cond.any)) return cond.any.some((c) => evaluateCondition(c, state));
        if (cond.hasItem) return api.hasItem(cond.hasItem);
        if (cond.flag) return api.hasFlag(cond.flag, cond.value);
    }

    return false;
}

/**
 * Determina si una entrada (hotspot, salida, etc.) debe ser visible.
 */
export function isEntryVisible(entry, state = api.state) {
    if (!entry) return true;

    if (entry.hiddenIf !== undefined) {
        if (evaluateCondition(entry.hiddenIf, state)) return false;
    }

    if (entry.visibleIf !== undefined) {
        if (!evaluateCondition(entry.visibleIf, state)) return false;
    }

    return true;
}

/**
 * Determina si una entrada está habilitada para interactuar.
 */
export function isEntryEnabled(entry, state = api.state) {
    if (!entry) return true;

    if (entry.disabledIf !== undefined) {
        if (evaluateCondition(entry.disabledIf, state)) return false;
    }

    if (entry.enabledIf !== undefined) {
        if (!evaluateCondition(entry.enabledIf, state)) return false;
    }

    return true;
}

/**
 * Verifica si un verbo específico está explícitamente deshabilitado para una entrada.
 */
export function isVerbDisabledByEntry(entry, verbId) {
    const list = entry?.verbsDisabled;
    if (!Array.isArray(list)) return false;
    return list.includes(verbId);
}

/**
 * Obtiene el texto de error personalizado cuando un verbo está deshabilitado.
 */
export function getDisabledTextByVerb(entry, verbId) {
    const map = entry?.disabledTextByVerb;
    if (!map || typeof map !== "object") return null;
    return map[verbId] ?? null;
}

/**
 * Obtiene el texto por defecto para un verbo en una entrada específica.
 */
export function getDefaultVerbText(entry, verbId) {
    const map = entry?.defaultVerbText;
    if (!map || typeof map !== "object") return null;
    return map[verbId] ?? null;
}

/**
 * Comprueba si un objeto soporta un verbo (tiene acción definida o texto por defecto).
 */
export function objectSupportsVerb(obj, verbId) {
    if (!obj) return false;
    if (isVerbDisabledByEntry(obj, verbId)) return false;

    const verbs = obj?.verbs ?? {};
    const hasDefault = Boolean(getDefaultVerbText(obj, verbId));

    if (verbId === "use") return Boolean(verbs.use || verbs.use_with || hasDefault);
    return Boolean(verbs[verbId] || hasDefault);
}
