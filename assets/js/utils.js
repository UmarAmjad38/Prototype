/**
 * utils.js — Shared utility helpers
 * Toast notifications, modal control, route guards, date formatting
 */

// ── Toast Notifications ─────────────────────────
const Toast = {
    container: null,

    init() {
        if (this.container) return;
        this.container = document.createElement("div");
        this.container.id = "toast-container";
        this.container.className =
            "fixed top-5 right-5 z-[9999] flex flex-col gap-2";
        document.body.appendChild(this.container);
    },

    show(message, type = "success", duration = 3500) {
        this.init();
        const id = "toast-" + Date.now();
        const colors = {
            success: "bg-emerald-50 border-emerald-400 text-emerald-800",
            error: "bg-red-50 border-red-400 text-red-800",
            info: "bg-indigo-50 border-indigo-400 text-indigo-800",
            warning: "bg-amber-50 border-amber-400 text-amber-800",
        };
        const icons = {
            success: `<svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`,
            error: `<svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>`,
            info: `<svg class="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01"/></svg>`,
            warning: `<svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>`,
        };

        const toast = document.createElement("div");
        toast.id = id;
        toast.className = `flex items-start gap-3 px-4 py-3 rounded-2xl border shadow-md text-sm font-medium transition-all duration-300 translate-x-full opacity-0 ${colors[type]} max-w-xs`;
        toast.innerHTML = `
      <span class="shrink-0 mt-0.5">${icons[type]}</span>
      <span class="flex-1">${message}</span>
      <button onclick="Toast.dismiss('${id}')" class="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>`;

        this.container.appendChild(toast);
        requestAnimationFrame(() => {
            toast.classList.remove("translate-x-full", "opacity-0");
        });
        setTimeout(() => this.dismiss(id), duration);
    },

    dismiss(id) {
        const toast = document.getElementById(id);
        if (!toast) return;
        toast.classList.add("translate-x-full", "opacity-0");
        setTimeout(() => toast.remove(), 300);
    },

    success(msg) { this.show(msg, "success"); },
    error(msg) { this.show(msg, "error"); },
    info(msg) { this.show(msg, "info"); },
    warning(msg) { this.show(msg, "warning"); },
};
window.Toast = Toast;

// ── Modal Control ────────────────────────────────
const Modal = {
    open(id) {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.remove("hidden");
        el.classList.add("flex");
        document.body.classList.add("overflow-hidden");
    },

    close(id) {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.add("hidden");
        el.classList.remove("flex");
        document.body.classList.remove("overflow-hidden");
    },

    closeOnBackdrop(event, id) {
        if (event.target === event.currentTarget) this.close(id);
    },
};
window.Modal = Modal;

// ── Route Guards ─────────────────────────────────
const Auth = {
    getToken() { return localStorage.getItem("skillswap_jwt"); },
    getUser() { try { return JSON.parse(localStorage.getItem("skillswap_user")); } catch { return null; } },
    setSession(jwt, user) {
        localStorage.setItem("skillswap_jwt", jwt);
        localStorage.setItem("skillswap_user", JSON.stringify(user));
    },
    clearSession() {
        localStorage.removeItem("skillswap_jwt");
        localStorage.removeItem("skillswap_user");
    },
    isLoggedIn() { return !!this.getToken(); },
    isAdmin() {
        const user = this.getUser();
        return user && (user.role?.type === "admin" || user.isAdmin === true);
    },

    requireLogin() {
        if (!this.isLoggedIn()) {
            window.location.href = "login.html";
            return false;
        }
        return true;
    },

    requireAdmin() {
        if (!this.isLoggedIn()) { window.location.href = "login.html"; return false; }
        if (!this.isAdmin()) { window.location.href = "dashboard.html"; return false; }
        return true;
    },

    redirectIfLoggedIn() {
        if (this.isLoggedIn()) {
            window.location.href = this.isAdmin() ? "admin.html" : "dashboard.html";
        }
    },

    logout() {
        this.clearSession();
        window.location.href = "index.html";
    },
};
window.Auth = Auth;

// ── Helpers ──────────────────────────────────────
function formatDate(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
window.formatDate = formatDate;

function statusBadge(status) {
    const map = {
        pending: "bg-amber-100 text-amber-700 border border-amber-300",
        approved: "bg-emerald-100 text-emerald-700 border border-emerald-300",
        rejected: "bg-red-100 text-red-700 border border-red-300",
    };
    const labels = { pending: "Pending", approved: "Approved", rejected: "Rejected" };
    const cls = map[status] || "bg-slate-100 text-slate-600 border border-slate-200";
    return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}">${labels[status] || status}</span>`;
}
window.statusBadge = statusBadge;

function levelBadge(level) {
    const map = {
        beginner: "bg-sky-100 text-sky-700",
        intermediate: "bg-violet-100 text-violet-700",
        expert: "bg-rose-100 text-rose-700",
    };
    const cls = map[level?.toLowerCase()] || "bg-slate-100 text-slate-600";
    return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls} capitalize">${level || "—"}</span>`;
}
window.levelBadge = levelBadge;

function getInitials(name = "") {
    return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}
window.getInitials = getInitials;

function debounce(fn, ms = 300) {
    let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}
window.debounce = debounce;

// Close modal when pressing Escape
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        document.querySelectorAll("[id$='-modal']:not(.hidden)").forEach(m => {
            m.classList.add("hidden");
            m.classList.remove("flex");
            document.body.classList.remove("overflow-hidden");
        });
    }
});
