// Round-robin "confetti" palette applied to interest tags — see tag--*
// modifiers in sidebar.css. Kept as a plain array (not a token) since it's
// presentation-order, not a semantic mapping.
const TAG_COLOR_CLASSES = ["tag--violet", "tag--blue", "tag--green", "tag--amber", "tag--rose"];

let els;

export function initProfileView(elements) {
  els = elements;
}

export function showLoadingState() {
  els.loadBtn.disabled = true;
  els.loadBtn.textContent = "Loading…";
  els.profileErr.style.display = "none";
}

export function showError(message) {
  els.profileErr.textContent = message;
  els.profileErr.style.display = "block";
}

export function resetLoadButton() {
  els.loadBtn.disabled = false;
  els.loadBtn.textContent = "Load my profile";
}

export function renderInterests(interestsField) {
  els.tagList.innerHTML = "";
  const interests = Array.isArray(interestsField)
    ? interestsField
    : (interestsField || "").split(",").map((s) => s.trim()).filter(Boolean);

  if (interests.length === 0) {
    els.tagList.innerHTML = `<span class="tag-empty">No interests defined</span>`;
    return;
  }
  interests.forEach((interest, index) => {
    const tag = document.createElement("span");
    tag.className = `tag ${TAG_COLOR_CLASSES[index % TAG_COLOR_CLASSES.length]}`;
    tag.textContent = interest;
    els.tagList.appendChild(tag);
  });
}

export function showProfile(data) {
  els.profName.textContent = data.username;
  els.profEmail.textContent = data.email || "—";
  els.profSchedule.textContent = data.schedule || "Not set";
  renderInterests(data.interests);

  els.profileForm.style.display = "none";
  els.profileCard.style.display = "flex";
  els.logoutBtn.style.display = "block";

  els.unsubBtn.style.display = "block";
  els.unsubBtn.textContent = "Unsubscribe";
  els.unsubBtn.disabled = false;
  els.unsubBtn.classList.remove("is-unsubscribed");
  els.unsubConfirm.style.display = "none";
}

export function showLoginForm() {
  els.profileForm.style.display = "flex";
  els.profileCard.style.display = "none";
  els.logoutBtn.style.display = "none";
  els.profileErr.style.display = "none";
  els.usernameInput.value = "";
  els.passwordInput.value = "";
}

export function markUnsubscribed() {
  els.unsubConfirm.style.display = "none";
  els.unsubBtn.style.display = "block";
  els.unsubBtn.textContent = "✓ Unsubscribed";
  els.unsubBtn.disabled = true;
  els.unsubBtn.classList.add("is-unsubscribed");
}

export function showUnsubscribeConfirm() {
  els.unsubConfirm.style.display = "block";
  els.unsubBtn.style.display = "none";
}

export function hideUnsubscribeConfirm() {
  els.unsubConfirm.style.display = "none";
  els.unsubBtn.style.display = "block";
}

export function setUnsubConfirmButtonText(text) {
  els.unsubYesBtn.textContent = text;
}

export function getLoginCredentials() {
  return {
    username: els.usernameInput.value.trim(),
    password: els.passwordInput.value,
  };
}
