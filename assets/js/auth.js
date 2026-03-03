/**
 * auth.js — Login, Registration, and Logout logic
 */

// ── Login Page ──────────────────────────────────
function initLoginPage() {
    console.log("Auth: Initializing Login Page...");
    Auth.redirectIfLoggedIn();

    const form = document.getElementById("login-form");
    const errEl = document.getElementById("login-error");
    const btnText = document.getElementById("login-btn-text");
    const spinner = document.getElementById("login-spinner");

    if (!form) {
        console.error("Auth: Login form not found!");
        return;
    }

    form.addEventListener("submit", async (e) => {
        console.log("Auth: Login form submitted");
        e.preventDefault();
        errEl.classList.add("hidden");
        btnText.textContent = "Signing in…";
        spinner.classList.remove("hidden");
        form.querySelector("button[type=submit]").disabled = true;

        const email = form.email.value.trim();
        const password = form.password.value;

        try {
            const res = await API.login({ email, password });
            Auth.setSession(res.jwt, res.user);
            // Fetch full profile to check role
            const me = await API.getMe();
            Auth.setSession(res.jwt, me);
            Toast.success("Welcome back!");
            setTimeout(() => {
                window.location.href = Auth.isAdmin() ? "admin.html" : "dashboard.html";
            }, 800);
        } catch (err) {
            console.error("Login error:", err);
            Toast.error(err.message || "Invalid credentials. Please try again.");
            errEl.textContent = err.message;
            errEl.classList.remove("hidden");
            btnText.textContent = "Sign In";
            spinner.classList.add("hidden");
            form.querySelector("button[type=submit]").disabled = false;
        }
    });
}

// ── Register Page ────────────────────────────────
function initRegisterPage() {
    console.log("Auth: Initializing Register Page...");
    Auth.redirectIfLoggedIn();

    const form = document.getElementById("register-form");
    const errEl = document.getElementById("register-error");
    const btnText = document.getElementById("register-btn-text");
    const spinner = document.getElementById("register-spinner");

    if (!form) {
        console.error("Auth: Register form not found!");
        return;
    }

    form.addEventListener("submit", async (e) => {
        console.log("Auth: Register form submitted");
        e.preventDefault();
        errEl.classList.add("hidden");

        const username = form.username.value.trim();
        const email = form.email.value.trim();
        const password = form.password.value;
        const confirmPassword = form.confirm_password.value;

        if (password !== confirmPassword) {
            Toast.error("Passwords do not match.");
            return;
        }
        if (password.length < 6) {
            Toast.error("Password must be at least 6 characters.");
            return;
        }

        btnText.textContent = "Creating account…";
        spinner.classList.remove("hidden");
        form.querySelector("button[type=submit]").disabled = true;

        try {
            const res = await API.register({ username, email, password });
            Auth.setSession(res.jwt, res.user);
            Toast.success("Account created! 🎉");
            setTimeout(() => { window.location.href = "dashboard.html"; }, 800);
        } catch (err) {
            console.error("Register error:", err);
            Toast.error(err.message || "Could not create account. Please try again.");
            errEl.textContent = err.message;
            errEl.classList.remove("hidden");
            btnText.textContent = "Create Account";
            spinner.classList.add("hidden");
            form.querySelector("button[type=submit]").disabled = false;
        }
    });
}

// ── Logout ───────────────────────────────────────
function initLogout() {
    // "Logout" buttons anywhere on page
    document.querySelectorAll("[data-action=logout]").forEach(btn => {
        btn.addEventListener("click", () => Modal.open("logout-modal"));
    });

    const confirmBtn = document.getElementById("confirm-logout");
    if (confirmBtn) {
        confirmBtn.addEventListener("click", () => {
            Auth.logout();
        });
    }
}

// ── Inject user info in navbar ───────────────────
function populateNavUser() {
    const user = Auth.getUser();
    if (!user) return;
    document.querySelectorAll("[data-user-name]").forEach(el => { el.textContent = user.username || user.email; });
    document.querySelectorAll("[data-user-initials]").forEach(el => { el.textContent = getInitials(user.username || user.email); });
    document.querySelectorAll("[data-user-email]").forEach(el => { el.textContent = user.email; });
    document.querySelectorAll("[data-user-role]").forEach(el => {
        el.textContent = Auth.isAdmin() ? "Admin" : "Member";
    });
}

window.initLoginPage = initLoginPage;
window.initRegisterPage = initRegisterPage;
window.initLogout = initLogout;
window.populateNavUser = populateNavUser;
