// Facade: callers ask for "sendChatMessage" / "fetchProfile" / "unsubscribe"
// without knowing about fetch, headers, JSON encoding, or endpoint paths.
import { ENDPOINTS } from "../config.js";

function buildUrl(baseUrl, path) {
  return baseUrl.replace(/\/$/, "") + path;
}

async function postJson(url, payload) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export const PersonaApi = {
  sendChatMessage(baseUrl, { chatInput, sessionId }) {
    return postJson(buildUrl(baseUrl, ENDPOINTS.chat), { chatInput, sessionId });
  },

  fetchProfileByCredentials(baseUrl, { username, password }) {
    return postJson(buildUrl(baseUrl, ENDPOINTS.profile), { username, password });
  },

  fetchProfileForChatbotSession(baseUrl, { username }) {
    return postJson(buildUrl(baseUrl, ENDPOINTS.profile), { username, chatbotSession: true });
  },

  unsubscribe(baseUrl, { username }) {
    return postJson(buildUrl(baseUrl, ENDPOINTS.unsubscribe), { username });
  },
};
