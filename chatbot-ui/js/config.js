export const DEFAULT_N8N_URL = "http://localhost:5678";

export const ENDPOINTS = {
  chat: "/webhook/persona-chatbot-webhook-001/chat",
  profile: "/webhook/persona-profile",
  unsubscribe: "/webhook/persona-unsubscribe",
};

// Substrings the chatbot's reply may contain after a profile change;
// their presence tells the controller to silently refresh the sidebar.
export const PROFILE_UPDATE_KEYWORDS = [
  "updated", "modified", "interests", "email", "schedule", "saved",
];

export const SESSION_TOKEN_PATTERN = /SESSION_USER:\s*(\S+)/i;
export const SESSION_TOKEN_STRIP_PATTERN = /SESSION_USER:\s*\S+/gi;
