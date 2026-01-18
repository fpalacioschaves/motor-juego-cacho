// game/debug.js
// Activa debug con: ?debug=1
// o persistente con: localStorage.setItem("debug","1")

export const DEBUG =
  new URLSearchParams(window.location.search).has("debug") ||
  localStorage.getItem("debug") === "1";
