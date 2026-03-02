/**
 * dashboard.js — User Dashboard logic
 * My skills list, offer-a-skill form, edit/delete skills
 */

let allCategories = [];
let editingSkillId = null;

async function initDashboard() {
    if (!Auth.requireLogin()) return;
    populateNavUser();
    initLogout();
    await loadCategories();
    await loadMySkills();
    bindSkillForm();
}

// ── Categories ────────────────────────────────────
async function loadCategories() {
    try {
        const res = await API.getCategories();
        allCategories = res?.data || [];
        const sel = document.getElementById("skill-category");
        if (!sel) return;
        sel.innerHTML = `<option value="">Select category</option>`;
        allCategories.forEach(c => {
            const a = c.attributes || c;
            const opt = document.createElement("option");
            opt.value = c.id;
            opt.textContent = a.name;
            sel.appendChild(opt);
        });
    } catch { /* ignore */ }
}

// ── My Skills List ────────────────────────────────
async function loadMySkills() {
    const container = document.getElementById("my-skills-list");
    if (!container) return;
    container.innerHTML = `<div class="flex justify-center py-10"><div class="w-6 h-6 border-2 border-primary-400 border-t-transparent rounded-full animate-spin"></div></div>`;

    try {
        const res = await API.getMySkills();
        const skills = res?.data || [];
        if (!skills.length) {
            container.innerHTML = `
        <div class="text-center py-14">
          <div class="text-4xl mb-3">🎓</div>
          <p class="text-slate-500 font-bold text-sm mb-4">You haven't listed any skills yet.</p>
          <button onclick="Modal.open('skill-modal')" class="px-5 py-2.5 rounded-2xl bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 transition">
            Offer Your First Skill
          </button>
        </div>`;
            updateStatsDisplay(0, 0, 0);
            return;
        }

        const pending = skills.filter(s => (s.attributes?.status || s.status) === "pending").length;
        const approved = skills.filter(s => (s.attributes?.status || s.status) === "approved").length;
        const rejected = skills.filter(s => (s.attributes?.status || s.status) === "rejected").length;
        updateStatsDisplay(skills.length, approved, pending);

        container.innerHTML = skills.map(s => {
            const a = s.attributes || s;
            const cat = a.category?.data?.attributes?.name || a.category?.name || "—";
            const img = a.images?.data?.[0]?.attributes?.url || a.images?.[0]?.url || "";
            return `
        <div class="flex items-start gap-4 p-4 bg-white border border-slate-100 rounded-2xl hover:border-primary-100 transition skill-card" id="skill-row-${s.id}">
          <div class="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden shrink-0">
            ${img ? `<img src="${img}" class="w-full h-full object-cover"/>` : `<div class="w-full h-full flex items-center justify-center text-2xl">🎓</div>`}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap mb-0.5">
              <h3 class="text-sm font-black text-slate-800 truncate">${a.title}</h3>
              ${statusBadge(a.status || "pending")}
            </div>
            <p class="text-xs text-slate-500 font-medium truncate mb-1">${a.description || "No description"}</p>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs font-bold text-slate-400">${cat}</span>
              <span class="text-xs text-slate-300">·</span>
              ${levelBadge(a.level)}
              <span class="text-xs text-slate-300">·</span>
              <span class="text-xs font-medium text-slate-400">${formatDate(a.createdAt || s.createdAt)}</span>
            </div>
          </div>
          <div class="flex gap-2 shrink-0">
            <button onclick="openEditSkill(${s.id})" title="Edit"
              class="p-2 rounded-xl bg-slate-50 hover:bg-primary-50 hover:text-primary-600 text-slate-500 transition">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </button>
            <button onclick="confirmDelete(${s.id},'${a.title.replace(/'/g, "\\'")}'" title="Delete"
              class="p-2 rounded-xl bg-slate-50 hover:bg-red-50 hover:text-red-500 text-slate-500 transition">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        </div>`;
        }).join("");
    } catch {
        container.innerHTML = `<p class="text-center text-sm text-slate-400 py-8">Failed to load your skills.</p>`;
    }
}

function updateStatsDisplay(total, approved, pending) {
    const el = (id) => document.getElementById(id);
    if (el("stat-total")) el("stat-total").textContent = total;
    if (el("stat-approved")) el("stat-approved").textContent = approved;
    if (el("stat-pending")) el("stat-pending").textContent = pending;
}

// ── Offer / Edit Skill Form ────────────────────────
function openNewSkillModal() {
    editingSkillId = null;
    document.getElementById("skill-form").reset();
    document.getElementById("skill-image-preview").innerHTML = "";
    document.getElementById("skill-modal-title").textContent = "Offer a Skill";
    document.getElementById("skill-submit-text").textContent = "Submit Listing";
    Modal.open("skill-modal");
}

async function openEditSkill(id) {
    editingSkillId = id;
    try {
        const res = await API.getSkillById(id);
        const a = res.data?.attributes || res.data || {};
        const form = document.getElementById("skill-form");
        form.title.value = a.title || "";
        form.description.value = a.description || "";
        form.level.value = (a.level || "beginner").toLowerCase();
        form.location.value = a.location || "";
        form.availability.value = a.availability || "";
        // Set category
        const catId = a.category?.data?.id || a.category?.id || "";
        form.querySelector("#skill-category").value = catId;
        document.getElementById("skill-modal-title").textContent = "Edit Skill";
        document.getElementById("skill-submit-text").textContent = "Save Changes";
        document.getElementById("skill-image-preview").innerHTML = "";
        Modal.open("skill-modal");
    } catch {
        Toast.error("Could not load skill for editing.");
    }
}

function bindSkillForm() {
    const form = document.getElementById("skill-form");
    if (!form) return;
    CloudinaryUpload.attachPreview("skill-images", "skill-image-preview");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = document.getElementById("skill-submit-btn");
        const btnText = document.getElementById("skill-submit-text");
        const spinner = document.getElementById("skill-submit-spinner");
        btn.disabled = true;
        btnText.textContent = editingSkillId ? "Saving…" : "Submitting…";
        spinner.classList.remove("hidden");

        try {
            // Upload images
            const imageInput = document.getElementById("skill-images");
            let uploadedUrls = [];
            if (imageInput?.files?.length) {
                Toast.info("Uploading image(s)…");
                const uploads = await CloudinaryUpload.uploadMultiple(imageInput.files);
                uploadedUrls = uploads.map(u => u.url);
            }

            const payload = {
                title: form.title.value.trim(),
                description: form.description.value.trim(),
                category: form.querySelector("#skill-category").value || null,
                level: form.level.value,
                location: form.location.value.trim(),
                availability: form.availability.value.trim(),
                provider: Auth.getUser()?.id,
                status: "pending",
                ...(uploadedUrls.length ? { imageUrls: uploadedUrls } : {}),
            };

            if (editingSkillId) {
                await API.updateSkill(editingSkillId, payload);
                Toast.success("Skill updated! Awaiting re-approval.");
            } else {
                await API.createSkill(payload);
                Toast.success("Skill submitted for review! 🎉");
            }

            Modal.close("skill-modal");
            form.reset();
            document.getElementById("skill-image-preview").innerHTML = "";
            await loadMySkills();
        } catch (err) {
            Toast.error(err.message || "Failed to submit skill.");
        } finally {
            btn.disabled = false;
            btnText.textContent = editingSkillId ? "Save Changes" : "Submit Listing";
            spinner.classList.add("hidden");
        }
    });
}

// ── Delete Skill ──────────────────────────────────
let pendingDeleteId = null;
function confirmDelete(id, title) {
    pendingDeleteId = id;
    document.getElementById("delete-skill-name").textContent = title;
    Modal.open("delete-skill-modal");
}

async function executeDelete() {
    if (!pendingDeleteId) return;
    try {
        await API.deleteSkill(pendingDeleteId);
        Toast.success("Skill deleted.");
        Modal.close("delete-skill-modal");
        loadMySkills();
    } catch {
        Toast.error("Failed to delete skill.");
    }
}

window.initDashboard = initDashboard;
window.openNewSkillModal = openNewSkillModal;
window.openEditSkill = openEditSkill;
window.confirmDelete = confirmDelete;
window.executeDelete = executeDelete;
