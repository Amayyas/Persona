// Composition root: the only place that queries the DOM and wires
// views + controller together. Nothing else in the app touches `document`
// directly outside of the views.
import { initChatView } from "./views/chatView.js";
import { initStatusView } from "./views/statusView.js";
import { initProfileView } from "./views/profileView.js";
import { initChatController } from "./controllers/chatController.js";

const dom = {
  messagesEl: document.getElementById("messages"),
  inputEl: document.getElementById("input"),
  sendBtn: document.getElementById("send"),
  urlInput: document.getElementById("url-input"),
  statusEl: document.getElementById("status"),
  loggedUserEl: document.getElementById("logged-user"),

  loadBtn: document.getElementById("load-profile-btn"),
  logoutBtn: document.getElementById("logout-btn"),
  profileForm: document.getElementById("profile-login"),
  profileCard: document.getElementById("profile-card"),
  profileErr: document.getElementById("profile-error"),
  usernameInput: document.getElementById("prof-username"),
  passwordInput: document.getElementById("prof-password"),
  profName: document.getElementById("prof-name"),
  profEmail: document.getElementById("prof-email"),
  profSchedule: document.getElementById("prof-schedule"),
  tagList: document.getElementById("prof-interests"),
  refreshBtn: document.getElementById("refresh-btn"),

  unsubBtn: document.getElementById("unsub-btn"),
  unsubConfirm: document.getElementById("unsub-confirm"),
  unsubYesBtn: document.getElementById("unsub-yes"),
  unsubNoBtn: document.getElementById("unsub-no"),
};

initChatView({ messagesEl: dom.messagesEl, loggedUserEl: dom.loggedUserEl });
initStatusView({ statusEl: dom.statusEl });
initProfileView(dom);
initChatController(dom);
