let statusEl;

export function initStatusView({ statusEl: el }) {
  statusEl = el;
}

export function setStatus(isOnline) {
  statusEl.textContent = isOnline ? "online" : "offline";
  statusEl.classList.toggle("is-offline", !isOnline);
}
