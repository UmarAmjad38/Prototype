/**
 * api.js — Strapi CMS API wrapper
 * All HTTP calls to Strapi go through here.
 */

const API = {
    get baseURL() { return window.CONFIG.STRAPI_URL; },
    get token() { return window.CONFIG.STRAPI_API_TOKEN; },
    get userJwt() { return localStorage.getItem("skillswap_jwt"); },

    headers(useUserToken = false) {
        const tok = useUserToken ? this.userJwt : this.token;
        return {
            "Content-Type": "application/json",
            ...(tok ? { Authorization: `Bearer ${tok}` } : {}),
        };
    },

    async request(method, path, body = null, useUserToken = false) {
        const opts = {
            method,
            headers: this.headers(useUserToken),
        };
        if (body) opts.body = JSON.stringify(body);
        try {
            const res = await fetch(`${this.baseURL}${path}`, opts);
            if (res.status === 204) return {}; // Handle No Content
            const data = await res.json();
            if (!res.ok) {
                const msg = data?.error?.message || data?.message?.[0]?.messages?.[0]?.message || "Something went wrong";
                throw new Error(msg);
            }
            return data;
        } catch (err) {
            throw err;
        }
    },

    // ── Auth ─────────────────────────────────────────
    async register({ username, email, password }) {
        return this.request("POST", "/api/auth/local/register", { username, email, password });
    },

    async login({ email, password }) {
        return this.request("POST", "/api/auth/local", { identifier: email, password });
    },

    async getMe() {
        return this.request("GET", "/api/users/me?populate=role", null, true);
    },

    // ── Skill Categories ─────────────────────────────
    async getCategories() {
        return this.request("GET", "/api/skill-categories?populate=*&pagination[pageSize]=100", null, false);
    },

    async createCategory(data) {
        return this.request("POST", "/api/skill-categories", { data }, false);
    },

    async updateCategory(id, data) {
        return this.request("PUT", `/api/skill-categories/${id}`, { data }, false);
    },

    async deleteCategory(id) {
        return this.request("DELETE", `/api/skill-categories/${id}`, null, false);
    },

    // ── Skills ───────────────────────────────────────
    async getSkills(params = {}) {
        const qs = new URLSearchParams({
            "populate[skillCategory]": "true",
            "populate[owner]": "true",
            "pagination[pageSize]": params.limit || 20,
            "pagination[page]": params.page || 1,
            ...(params.status ? { "filters[skillStatus][$eq]": params.status } : {}),
            ...(params.category ? { "filters[skillCategory][name][$eq]": params.category } : {}),
            ...(params.level ? { "filters[level][$eq]": params.level } : {}),
            ...(params.search ? { "filters[title][$containsi]": params.search } : {}),
        }).toString();
        return this.request("GET", `/api/skills?${qs}`, null, false);
    },

    async getSkillById(id) {
        return this.request(
            "GET",
            `/api/skills/${id}?populate[skillCategory]=true&populate[owner]=true`,
            null, false
        );
    },

    async getMySkills() {
        const userId = Auth.getUser()?.id;
        return this.request(
            "GET",
            `/api/skills?filters[owner][id][$eq]=${userId}&populate[skillCategory]=true&pagination[pageSize]=100`,
            null, true
        );
    },

    async createSkill(data) {
        return this.request("POST", "/api/skills", { data }, true);
    },

    async updateSkill(id, data) {
        return this.request("PUT", `/api/skills/${id}`, { data }, true);
    },

    async deleteSkill(id) {
        return this.request("DELETE", `/api/skills/${id}`, null, true);
    },

    // Admin: update skill status
    async updateSkillStatus(id, status) {
        return this.request("PUT", `/api/skills/${id}`, { data: { skillStatus: status } }, false);
    },

    // ── Users (Admin) ────────────────────────────────
    async getUsers() {
        return this.request("GET", "/api/users?populate=role&pagination[pageSize]=100", null, false);
    },

    async updateUser(id, data) {
        return this.request("PUT", `/api/users/${id}`, data, false);
    },

    async blockUser(id) {
        return this.updateUser(id, { blocked: true });
    },

    async unblockUser(id) {
        return this.updateUser(id, { blocked: false });
    },
};

window.API = API;
