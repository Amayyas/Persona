// Observer pattern: views subscribe once and react whenever the session
// changes, instead of every call site remembering to update each view.
const listeners = new Set();

const state = {
  sessionId: "session-" + Math.random().toString(36).slice(2, 10),
  currentUsername: null,
};

function notify() {
  for (const listener of listeners) listener(state.currentUsername);
}

export const SessionStore = {
  get sessionId() {
    return state.sessionId;
  },

  get currentUsername() {
    return state.currentUsername;
  },

  setCurrentUsername(username) {
    state.currentUsername = username;
    notify();
  },

  clear() {
    state.currentUsername = null;
    notify();
  },

  onUsernameChange(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
