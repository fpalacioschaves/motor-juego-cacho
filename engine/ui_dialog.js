/*
  ui_dialog.js
  Controla el modal de dialogo (abrir, cerrar, opciones).
*/

let els = null;
let onChoose = null;

export function initDialogUI() {
  els = {
    overlay: document.getElementById("dialogOverlay"),
    title: document.getElementById("dialogTitle"),
    text: document.getElementById("dialogText"),
    options: document.getElementById("dialogOptions"),
    close: document.getElementById("dialogClose"),
  };

  if (!els.overlay) {
    throw new Error("[dialog] No existe dialogOverlay en el HTML");
  }

  els.close.addEventListener("click", () => closeDialog());

  // Cerrar al clicar fuera del modal
  els.overlay.addEventListener("click", (e) => {
    if (e.target === els.overlay) closeDialog();
  });

  // Escape para cerrar
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen()) closeDialog();
  });
}

export function openDialog({ title = "Dialogo", text = "", options = [] }, chooseCallback) {
  if (!els) initDialogUI();

  onChoose = chooseCallback;

  els.title.textContent = title;
  els.text.textContent = text;

  els.options.innerHTML = "";

  for (let i = 0; i < options.length; i++) {
    const opt = options[i];
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "dialog-option";
    btn.textContent = opt.label ?? `Opcion ${i + 1}`;

    btn.addEventListener("click", () => {
      if (typeof onChoose === "function") onChoose(opt, i);
    });

    els.options.appendChild(btn);
  }

  els.overlay.classList.add("open");
  els.overlay.setAttribute("aria-hidden", "false");
}

export function closeDialog() {
  if (!els) return;
  els.overlay.classList.remove("open");
  els.overlay.setAttribute("aria-hidden", "true");
  onChoose = null;
}

export function isOpen() {
  return Boolean(els?.overlay?.classList.contains("open"));
}
