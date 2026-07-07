let messagesEl;
let loggedUserEl;

export function initChatView({ messagesEl: msgEl, loggedUserEl: userEl }) {
  messagesEl = msgEl;
  loggedUserEl = userEl;
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function appendMessage(className, innerHtml) {
  const el = document.createElement("div");
  el.className = `message ${className}`;
  el.innerHTML = innerHtml;
  messagesEl.appendChild(el);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return el;
}

export function addMessage(role, text) {
  const avatar = role === "user" ? "👤" : "✦";
  return appendMessage(role, `<div class="avatar">${avatar}</div><div class="bubble">${escapeHtml(text)}</div>`);
}

export function addTyping() {
  return appendMessage(
    "bot typing",
    `<div class="avatar">✦</div><div class="bubble"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>`
  );
}

export function showLoggedUserBadge(username) {
  loggedUserEl.textContent = "👤 " + username;
  loggedUserEl.style.display = "inline-block";
}

export function hideLoggedUserBadge() {
  loggedUserEl.style.display = "none";
}
