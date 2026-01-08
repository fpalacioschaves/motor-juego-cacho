// game/conditions.js
// Evaluador de condiciones para visibilidad / activación.
//
// Formatos soportados:
//
// - true / false
// - { hasItem: "llave" }
// - { flag: "cartelDado" }
// - { notFlag: "cartelDado" }
// - { all: [cond1, cond2, ...] }
// - { any: [cond1, cond2, ...] }
// - { not: cond }

export function evalCond(cond, ctx) {
  if (cond === undefined || cond === null) return true;
  if (typeof cond === "boolean") return cond;

  if (typeof cond !== "object") {
    console.warn("[conditions] Condición inválida:", cond);
    return false;
  }

  // { hasItem: "x" }
  if ("hasItem" in cond) {
    return !!ctx?.hasItem?.(cond.hasItem);
  }

  // { flag: "x" }
  if ("flag" in cond) {
    return !!ctx?.getFlag?.(cond.flag);
  }

  // { notFlag: "x" }
  if ("notFlag" in cond) {
    return !ctx?.getFlag?.(cond.notFlag);
  }

  // { all: [...] }
  if ("all" in cond) {
    const list = Array.isArray(cond.all) ? cond.all : [];
    return list.every((c) => evalCond(c, ctx));
  }

  // { any: [...] }
  if ("any" in cond) {
    const list = Array.isArray(cond.any) ? cond.any : [];
    return list.some((c) => evalCond(c, ctx));
  }

  // { not: cond }
  if ("not" in cond) {
    return !evalCond(cond.not, ctx);
  }

  console.warn("[conditions] Condición no reconocida:", cond);
  return false;
}
