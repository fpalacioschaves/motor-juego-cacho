/*
  storage.js
  Guardado/carga en localStorage.
*/

const KEY = "motor_aventuras_save_v01";

export function saveToLocalStorage(state) {
  const payload = {
    version: "0.1",
    savedAt: new Date().toISOString(),
    state,
  };
  localStorage.setItem(KEY, JSON.stringify(payload));
  return payload;
}

export function loadFromLocalStorage() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;

  try {
    const payload = JSON.parse(raw);
    if (!payload?.state) return null;
    return payload;
  } catch {
    return null;
  }
}

export function clearLocalStorageSave() {
  localStorage.removeItem(KEY);
}
