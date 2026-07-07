import { PersonaApi } from "../api/personaApi.js";
import { SessionStore } from "../state/sessionStore.js";
import { DEFAULT_N8N_URL, PROFILE_UPDATE_KEYWORDS, SESSION_TOKEN_PATTERN, SESSION_TOKEN_STRIP_PATTERN } from "../config.js";
import { addMessage, addTyping, showLoggedUserBadge, hideLoggedUserBadge } from "../views/chatView.js";
import { setStatus } from "../views/statusView.js";
import * as profileView from "../views/profileView.js";

export function initChatController(dom) {
  function getBaseUrl() {
    return (dom.urlInput.value.trim() || DEFAULT_N8N_URL).replace(/\/$/, "");
  }

  async function loadProfileFromChatbot(username) {
    SessionStore.setCurrentUsername(username);
    try {
      const data = await PersonaApi.fetchProfileForChatbotSession(getBaseUrl(), { username });
      if (data.success) {
        profileView.showProfile(data);
        showLoggedUserBadge(data.username);
      }
    } catch {
      // The chatbot flow tolerates a failed background profile fetch;
      // the conversation itself already told the user they're logged in.
    }
  }

  async function refreshProfile() {
    if (!SessionStore.currentUsername) return;
    dom.refreshBtn.classList.add("spinning");
    await loadProfileFromChatbot(SessionStore.currentUsername);
    dom.refreshBtn.classList.remove("spinning");
  }

  function maybeRefreshAfterBotReply(text) {
    if (!SessionStore.currentUsername) return;
    const lower = text.toLowerCase();
    if (PROFILE_UPDATE_KEYWORDS.some((kw) => lower.includes(kw))) {
      setTimeout(refreshProfile, 600);
    }
  }

  function detectSession(text) {
    const match = text.match(SESSION_TOKEN_PATTERN);
    if (!match) return text;
    const username = match[1].replace(/[^a-zA-Z0-9_-]/g, "");
    showLoggedUserBadge(username);
    loadProfileFromChatbot(username);
    return text.replace(SESSION_TOKEN_STRIP_PATTERN, "").trim();
  }

  async function sendChatMessage() {
    const text = dom.inputEl.value.trim();
    if (!text) return;

    dom.inputEl.value = "";
    dom.inputEl.style.height = "auto";
    dom.sendBtn.disabled = true;
    addMessage("user", text);
    const typing = addTyping();

    try {
      const data = await PersonaApi.sendChatMessage(getBaseUrl(), {
        chatInput: text,
        sessionId: SessionStore.sessionId,
      });
      typing.remove();
      let reply = data.output || data.text || data.message || JSON.stringify(data);
      reply = detectSession(reply);
      addMessage("bot", reply);
      maybeRefreshAfterBotReply(reply);
      setStatus(true);
    } catch (err) {
      typing.remove();
      setStatus(false);
      addMessage("bot", `Connection error to n8n.\n${err.message}\n\nCheck that n8n is running at ${getBaseUrl()}`);
    } finally {
      dom.sendBtn.disabled = false;
      dom.inputEl.focus();
    }
  }

  async function notifyBotManualLogin(username) {
    const hiddenMessage = `SESSION_USER:${username}`;
    const typing = addTyping();
    try {
      const data = await PersonaApi.sendChatMessage(getBaseUrl(), {
        chatInput: hiddenMessage,
        sessionId: SessionStore.sessionId,
      });
      typing.remove();
      let reply = data.output || data.text || data.message || "";
      reply = detectSession(reply);
      if (reply) addMessage("bot", reply);
      setStatus(true);
    } catch {
      typing.remove();
    }
  }

  async function handleManualLogin() {
    const { username, password } = profileView.getLoginCredentials();
    if (!username || !password) {
      profileView.showError("Please fill in both fields.");
      return;
    }

    profileView.showLoadingState();
    try {
      const data = await PersonaApi.fetchProfileByCredentials(getBaseUrl(), { username, password });
      if (!data.success) {
        profileView.showError(data.message || "Unknown error.");
        return;
      }
      SessionStore.setCurrentUsername(data.username);
      profileView.showProfile(data);
      showLoggedUserBadge(data.username);
      notifyBotManualLogin(data.username);
    } catch {
      profileView.showError("Could not reach n8n.");
    } finally {
      profileView.resetLoadButton();
    }
  }

  function handleLogout() {
    SessionStore.clear();
    profileView.showLoginForm();
    hideLoggedUserBadge();
  }

  async function handleUnsubscribeConfirm() {
    const username = SessionStore.currentUsername;
    if (!username) return;
    profileView.setUnsubConfirmButtonText("Processing…");
    try {
      const data = await PersonaApi.unsubscribe(getBaseUrl(), { username });
      if (data.success) {
        profileView.markUnsubscribed();
        addMessage("bot", "You have been successfully unsubscribed. You will no longer receive newsletters.");
      } else {
        profileView.setUnsubConfirmButtonText("Confirm");
      }
    } catch {
      profileView.setUnsubConfirmButtonText("Confirm");
    }
  }

  dom.sendBtn.addEventListener("click", sendChatMessage);
  dom.inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  });
  dom.inputEl.addEventListener("input", () => {
    dom.inputEl.style.height = "auto";
    dom.inputEl.style.height = Math.min(dom.inputEl.scrollHeight, 140) + "px";
  });

  dom.loadBtn.addEventListener("click", handleManualLogin);
  dom.logoutBtn.addEventListener("click", handleLogout);
  dom.refreshBtn.addEventListener("click", refreshProfile);

  dom.unsubBtn.addEventListener("click", profileView.showUnsubscribeConfirm);
  dom.unsubNoBtn.addEventListener("click", profileView.hideUnsubscribeConfirm);
  dom.unsubYesBtn.addEventListener("click", handleUnsubscribeConfirm);
}
