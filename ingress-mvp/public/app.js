const copy = {
  x: "Import your own public X posts where your API access allows it.",
  telegramLogin: "Use Telegram to identify your Weavr account.",
  telegramBot: "Send or forward messages to the Weavr bot to add them to your profile.",
  telegramChannel: "Add the bot to a channel to import posts the bot can receive.",
  instagram: "Planned later. Instagram media import requires additional Meta account setup and review.",
  whatsapp_manual: "Weavr cannot read WhatsApp Status. WhatsApp may become a manual/share import path later."
};

const connectorsEl = document.querySelector("#connectors");
const timelineEl = document.querySelector("#timeline");
const emptyEl = document.querySelector("#empty-state");
const connectionCountEl = document.querySelector("#connection-count");
const syncStateEl = document.querySelector("#sync-state");

async function loadState() {
  const response = await fetch("/api/state");
  return response.json();
}

function sourceBadge(update) {
  if (update.provider === "x") return "X · Connected";
  if (update.source_kind === "channel_post") return "Telegram · Channel";
  if (update.source_kind === "forwarded_message") return "Telegram · Bot";
  if (update.provider === "telegram") return "Telegram · Bot";
  if (update.provider === "instagram") return "Instagram · Deferred";
  return "WhatsApp · Manual later";
}

function statusFor(provider, state) {
  const account = state.connected_accounts.find(item => item.provider === provider);
  if (provider === "instagram") return { text: "Deferred", tone: "warn" };
  if (provider === "whatsapp_manual") return { text: "Manual later", tone: "warn" };
  if (!account) return { text: provider === "x" ? "Connect X" : "Not connected", tone: "" };
  if (account.status === "blocked") return { text: "API access blocked", tone: "warn" };
  if (account.status === "expired") return { text: "Needs reconnect", tone: "warn" };
  if (account.status === "error") return { text: "Needs attention", tone: "warn" };
  return { text: "Connected", tone: "ok" };
}

function renderConnectors(state) {
  const rows = [
    { provider: "x", title: "X", body: copy.x, actions: [{ label: "Connect X", href: "/api/auth/x/start" }] },
    { provider: "telegram", title: "Telegram Login", body: copy.telegramLogin, actions: [{ label: "Demo login", demo: "telegram-login" }] },
    { provider: "telegram", title: "Telegram Bot", body: copy.telegramBot, actions: [{ label: "Webhook ready", disabled: true }] },
    { provider: "telegram", title: "Telegram Channel", body: copy.telegramChannel, actions: [{ label: "Requires bot in channel", disabled: true }] },
    { provider: "instagram", title: "Instagram", body: copy.instagram, actions: [] },
    { provider: "whatsapp_manual", title: "WhatsApp", body: copy.whatsapp_manual, actions: [] }
  ];
  connectorsEl.innerHTML = rows.map(row => {
    const status = statusFor(row.provider, state);
    const actions = row.actions.map(action => {
      if (action.href) return `<button data-href="${action.href}">${action.label}</button>`;
      if (action.demo) return `<button class="secondary" data-demo="${action.demo}">${action.label}</button>`;
      return `<button class="secondary" disabled>${action.label}</button>`;
    }).join("");
    return `
      <article class="connector">
        <div class="connector-top">
          <strong>${row.title}</strong>
          <span class="badge ${status.tone}">${status.text}</span>
        </div>
        <p>${row.body}</p>
        ${row.provider === "x" && status.text === "API access blocked" ? "<p><strong>X is connected, but this API tier does not allow post import yet.</strong></p>" : ""}
        <div class="connector-actions">${actions}</div>
      </article>
    `;
  }).join("");
}

function renderTimeline(state) {
  const updates = [...state.updates].sort((a, b) => new Date(b.occurred_at) - new Date(a.occurred_at));
  emptyEl.style.display = updates.length ? "none" : "block";
  timelineEl.innerHTML = updates.map(update => `
    <article class="update">
      <div class="update-meta">
        <span class="badge ${update.provider === "telegram" || update.provider === "x" ? "ok" : ""}">${sourceBadge(update)}</span>
        <span>${update.author_name || "Unknown"}</span>
        ${update.author_username ? `<span>@${update.author_username}</span>` : ""}
        <time>${new Date(update.occurred_at).toLocaleString()}</time>
      </div>
      <div class="update-text">${escapeHtml(update.text || "Media update")}</div>
      ${(update.media_urls || []).map(url => `<span class="media-pill">${escapeHtml(url)}</span>`).join("")}
    </article>
  `).join("");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" }[char]));
}

async function refresh() {
  const state = await loadState();
  const connected = state.connected_accounts.length;
  const blocked = state.sync_runs.find(run => run.status === "blocked");
  connectionCountEl.textContent = connected ? `${connected} connected source${connected === 1 ? "" : "s"}` : "No connected sources yet";
  syncStateEl.textContent = blocked ? "API access blocked" : "Ready";
  renderConnectors(state);
  renderTimeline(state);
}

document.body.addEventListener("click", async event => {
  const target = event.target.closest("button");
  if (!target || target.disabled) return;
  if (target.dataset.href) window.location.href = target.dataset.href;
  if (target.dataset.demo === "telegram-login") {
    await fetch("/api/dev/telegram-login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: "demo-telegram-user", username: "weavr_user", display_name: "Weavr User" })
    });
    await refresh();
  }
});

document.querySelector("#demo-telegram").addEventListener("click", async () => {
  await fetch("/api/webhooks/telegram", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      update_id: Date.now(),
      message: {
        message_id: Date.now(),
        date: Math.floor(Date.now() / 1000),
        chat: { id: 100, type: "private" },
        from: { id: 100, first_name: "Weavr", last_name: "User", username: "weavr_user" },
        forward_sender_name: "Original Sender",
        text: "Forwarded Telegram update normalized through the Weavr bot."
      }
    })
  });
  await refresh();
});

refresh();
