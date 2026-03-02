/**
 * admin.js — Admin Panel logic
 * Manage users, skill categories, and skill approvals
 */

async function initAdmin() {
    if (!Auth.requireAdmin()) return;
    populateNavUser();
    initLogout();
    await Promise.all([loadAdminStats(), loadPendingSkills()]);
    bindAdminTabs();
}

// ── Stats ─────────────────────────────────────────
async function loadAdminStats() {
    try {
        const [usersRes, skillsRes, catsRes] = await Promise.all([
            API.getUsers(),
            API.getSkills({ limit: 100 }),
            API.getCategories(),
        ]);
        const users = usersRes?.length || 0;
        const skills = skillsRes?.data?.length || 0;
        const pending = skillsRes?.data?.filter(s => (s.attributes?.status || s.status) === "pending").length || 0;
        const cats = catsRes?.data?.length || 0;
        setStat("admin-stat-users", users);
        setStat("admin-stat-skills", skills);
        setStat("admin-stat-pending", pending);
        setStat("admin-stat-cats", cats);
    } catch { /* ignore */ }
}

function setStat(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

// ── TAB LOADER ────────────────────────────────────
function bindAdminTabs() {
    // tabs are switched by showAdminTab()
}

async function showAdminTab(tab) {
    ["overview", "pending", "categories", "users", "all-skills"].forEach(t => {
        document.getElementById(`admin-tab-${t}`)?.classList.add("hidden");
        document.getElementById(`admin-nav-${t}`)?.classList.remove("active");
    });
    document.getElementById(`admin-tab-${tab}`)?.classList.remove("hidden");
    document.getElementById(`admin-nav-${tab}`)?.classList.add("active");

    switch (tab) {
        case "pending": await loadPendingSkills(); break;
        case "categories": await loadCategories(); break;
        case "users": await loadUsers(); break;
        case "all-skills": await loadAllSkills(); break;
    }
}
window.showAdminTab = showAdminTab;

// ── Pending Skills ────────────────────────────────
async function loadPendingSkills() {
    const el = document.getElementById("pending-list");
    if (!el) return;
    el.innerHTML = spinner();
    try {
        const res = await API.getSkills({ status: "pending", limit: 50 });
        const skills = res?.data || [];
        const countEl = document.getElementById("admin-stat-pending");
        if (countEl) countEl.textContent = skills.length;
        if (!skills.length) {
            el.innerHTML = emptyState("🎉", "No skills pending review.");
            return;
        }
        el.innerHTML = skills.map(s => {
            const a = s.attributes || s;
            const cat = a.category?.data?.attributes?.name || a.category?.name || "—";
            const img = a.images?.data?.[0]?.attributes?.url || "";
            return `
        <div class="flex items-start gap-4 p-4 bg-white border border-slate-100 rounded-2xl" id="pending-row-${s.id}">
          <div class="w-14 h-14 shrink-0 bg-slate-100 rounded-2xl overflow-hidden">
            ${img ? `<img src="${img}" class="w-full h-full object-cover"/>` : `<div class="w-full h-full flex items-center justify-center text-2xl">🎓</div>`}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-black text-slate-800 truncate">${a.title}</p>
            <p class="text-xs text-slate-500 font-medium truncate mb-1">${a.description || "—"}</p>
            <div class="flex flex-wrap gap-2 text-xs">
              <span class="font-bold text-slate-500">${cat}</span>
              <span class="text-slate-300">·</span>
              ${levelBadge(a.level)}
              <span class="text-slate-300">·</span>
              <span class="font-medium text-slate-400">by ${a.provider?.data?.attributes?.username || "Unknown"}</span>
            </div>
          </div>
          <div class="flex flex-col gap-1.5 shrink-0">
            <button onclick="approveSkill(${s.id})"
              class="px-3 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-xs font-bold transition">Approve</button>
            <button onclick="rejectSkill(${s.id})"
              class="px-3 py-1.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-600 text-xs font-bold transition">Reject</button>
          </div>
        </div>`;
        }).join("");
    } catch {
        el.innerHTML = errorState("Failed to load pending skills.");
    }
}

async function approveSkill(id) {
    try {
        await API.updateSkillStatus(id, "approved");
        document.getElementById(`pending-row-${id}`)?.remove();
        Toast.success("Skill approved and published! ✅");
        loadAdminStats();
    } catch { Toast.error("Failed to approve skill."); }
}
async function rejectSkill(id) {
    try {
        await API.updateSkillStatus(id, "rejected");
        document.getElementById(`pending-row-${id}`)?.remove();
        Toast.info("Skill rejected.");
        loadAdminStats();
    } catch { Toast.error("Failed to reject skill."); }
}
window.approveSkill = approveSkill;
window.rejectSkill = rejectSkill;

// ── All Skills ────────────────────────────────────
async function loadAllSkills() {
    const el = document.getElementById("all-skills-list");
    if (!el) return;
    el.innerHTML = spinner();
    try {
        const res = await API.getSkills({ limit: 100 });
        const skills = res?.data || [];
        if (!skills.length) { el.innerHTML = emptyState("📭", "No skills yet."); return; }
        el.innerHTML = `<div class="overflow-x-auto"><table class="w-full text-sm">
      <thead><tr class="text-left text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
        <th class="pb-3 pr-4">Title</th><th class="pb-3 pr-4">Category</th>
        <th class="pb-3 pr-4">Level</th><th class="pb-3 pr-4">Status</th>
        <th class="pb-3 pr-4">By</th><th class="pb-3">Actions</th>
      </tr></thead>
      <tbody class="divide-y divide-slate-50">
        ${skills.map(s => {
            const a = s.attributes || s;
            const cat = a.category?.data?.attributes?.name || "—";
            return `<tr class="hover:bg-slate-50 transition" id="all-row-${s.id}">
            <td class="py-3 pr-4 font-bold text-slate-800 max-w-[180px] truncate">${a.title}</td>
            <td class="py-3 pr-4 text-slate-500 font-medium">${cat}</td>
            <td class="py-3 pr-4">${levelBadge(a.level)}</td>
            <td class="py-3 pr-4">${statusBadge(a.status)}</td>
            <td class="py-3 pr-4 text-slate-500 font-medium">${a.provider?.data?.attributes?.username || "—"}</td>
            <td class="py-3">
              <div class="flex gap-1.5">
                ${a.status !== "approved" ? `<button onclick="approveSkillAll(${s.id})" class="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-700 text-xs font-bold hover:bg-emerald-200 transition">Approve</button>` : ""}
                ${a.status !== "rejected" ? `<button onclick="rejectSkillAll(${s.id})" class="px-2.5 py-1 rounded-xl bg-red-100 text-red-600 text-xs font-bold hover:bg-red-200 transition">Reject</button>` : ""}
              </div>
            </td>
          </tr>`;
        }).join("")}
      </tbody></table></div>`;
    } catch { el.innerHTML = errorState("Failed to load skills."); }
}
async function approveSkillAll(id) {
    try { await API.updateSkillStatus(id, "approved"); Toast.success("Approved!"); loadAllSkills(); loadAdminStats(); } catch { Toast.error("Failed."); }
}
async function rejectSkillAll(id) {
    try { await API.updateSkillStatus(id, "rejected"); Toast.info("Rejected."); loadAllSkills(); loadAdminStats(); } catch { Toast.error("Failed."); }
}
window.approveSkillAll = approveSkillAll;
window.rejectSkillAll = rejectSkillAll;

// ── Categories ────────────────────────────────────
let editingCatId = null;

async function loadCategories() {
    const el = document.getElementById("categories-list");
    if (!el) return;
    el.innerHTML = spinner();
    try {
        const res = await API.getCategories();
        const cats = res?.data || [];
        if (!cats.length) { el.innerHTML = emptyState("📂", "No categories yet. Add one!"); return; }
        el.innerHTML = cats.map(c => {
            const a = c.attributes || c;
            return `
        <div class="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl" id="cat-row-${c.id}">
          <span class="text-2xl">${a.icon || "📂"}</span>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-black text-slate-800">${a.name}</p>
            <p class="text-xs text-slate-400 font-medium truncate">${a.description || "No description"}</p>
          </div>
          <div class="flex gap-1.5">
            <button onclick="openEditCat(${c.id},'${encodeURIComponent(a.name)}','${encodeURIComponent(a.description || '')}','${a.icon || ''}')"
              class="p-2 rounded-xl bg-slate-50 hover:bg-primary-50 hover:text-primary-600 text-slate-500 transition">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </button>
            <button onclick="deleteCat(${c.id})"
              class="p-2 rounded-xl bg-slate-50 hover:bg-red-50 hover:text-red-500 text-slate-500 transition">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        </div>`;
        }).join("");
    } catch { el.innerHTML = errorState("Failed to load categories."); }
}

function openAddCat() {
    editingCatId = null;
    document.getElementById("cat-form").reset();
    document.getElementById("cat-modal-title").textContent = "Add Category";
    Modal.open("cat-modal");
}
function openEditCat(id, name, desc, icon) {
    editingCatId = id;
    const form = document.getElementById("cat-form");
    form.cat_name.value = decodeURIComponent(name);
    form.cat_description.value = decodeURIComponent(desc);
    form.cat_icon.value = icon;
    document.getElementById("cat-modal-title").textContent = "Edit Category";
    Modal.open("cat-modal");
}
async function deleteCat(id) {
    if (!confirm("Delete this category?")) return;
    try {
        await API.deleteCategory(id);
        Toast.success("Category deleted.");
        loadCategories(); loadAdminStats();
    } catch { Toast.error("Cannot delete — skills may depend on it."); }
}
window.openAddCat = openAddCat;
window.openEditCat = openEditCat;
window.deleteCat = deleteCat;

async function submitCatForm(e) {
    e.preventDefault();
    const form = document.getElementById("cat-form");
    const data = {
        name: form.cat_name.value.trim(),
        description: form.cat_description.value.trim(),
        icon: form.cat_icon.value.trim(),
    };
    try {
        if (editingCatId) {
            await API.updateCategory(editingCatId, data);
            Toast.success("Category updated!");
        } else {
            await API.createCategory(data);
            Toast.success("Category created!");
        }
        Modal.close("cat-modal");
        loadCategories(); loadAdminStats();
    } catch (err) { Toast.error(err.message || "Failed to save category."); }
}
window.submitCatForm = submitCatForm;

// ── Users ─────────────────────────────────────────
async function loadUsers() {
    const el = document.getElementById("users-list");
    if (!el) return;
    el.innerHTML = spinner();
    try {
        const users = await API.getUsers();
        if (!users?.length) { el.innerHTML = emptyState("👤", "No users yet."); return; }
        el.innerHTML = `<div class="overflow-x-auto"><table class="w-full text-sm">
      <thead><tr class="text-left text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
        <th class="pb-3 pr-4">User</th><th class="pb-3 pr-4">Email</th>
        <th class="pb-3 pr-4">Role</th><th class="pb-3 pr-4">Status</th><th class="pb-3">Actions</th>
      </tr></thead>
      <tbody class="divide-y divide-slate-50">
        ${users.map(u => `
          <tr class="hover:bg-slate-50 transition" id="user-row-${u.id}">
            <td class="py-3 pr-4">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-xl bg-primary-100 flex items-center justify-center text-xs font-black text-primary-600 shrink-0">${getInitials(u.username || "?")}</div>
                <span class="font-bold text-slate-800">${u.username || "—"}</span>
              </div>
            </td>
            <td class="py-3 pr-4 text-slate-500 font-medium">${u.email}</td>
            <td class="py-3 pr-4 text-slate-500 font-medium capitalize">${u.role?.type || "authenticated"}</td>
            <td class="py-3 pr-4">
              ${u.blocked
                ? `<span class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">Blocked</span>`
                : `<span class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">Active</span>`}
            </td>
            <td class="py-3">
              ${u.blocked
                ? `<button onclick="unblockUser(${u.id})" class="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-700 text-xs font-bold hover:bg-emerald-200 transition">Unblock</button>`
                : `<button onclick="blockUser(${u.id})" class="px-3 py-1.5 rounded-xl bg-red-100 text-red-600 text-xs font-bold hover:bg-red-200 transition">Block</button>`}
            </td>
          </tr>`).join("")}
      </tbody></table></div>`;
    } catch { el.innerHTML = errorState("Failed to load users."); }
}

async function blockUser(id) {
    try { await API.blockUser(id); Toast.info("User blocked."); loadUsers(); } catch { Toast.error("Failed."); }
}
async function unblockUser(id) {
    try { await API.unblockUser(id); Toast.success("User unblocked."); loadUsers(); } catch { Toast.error("Failed."); }
}
window.blockUser = blockUser;
window.unblockUser = unblockUser;

// ── Helpers ───────────────────────────────────────
function spinner() {
    return `<div class="flex justify-center py-10"><div class="w-6 h-6 border-2 border-primary-400 border-t-transparent rounded-full animate-spin"></div></div>`;
}
function emptyState(icon, msg) {
    return `<div class="text-center py-12"><div class="text-4xl mb-2">${icon}</div><p class="text-slate-400 font-bold text-sm">${msg}</p></div>`;
}
function errorState(msg) {
    return `<p class="text-center text-sm text-red-400 py-8">${msg}</p>`;
}

window.initAdmin = initAdmin;
