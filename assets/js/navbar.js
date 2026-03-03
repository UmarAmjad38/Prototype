/**
 * navbar.js — Shared Navbar Component
 * Inject into any page by calling: renderNavbar("public" | "user" | "admin")
 * Place <div id="navbar-root"></div> at the top of <body>
 */

function renderNavbar(variant = "public") {
  const user = Auth?.getUser?.() || null;
  const isAuth = Auth?.isLoggedIn?.() || false;

  const logo = `
    <a href="index.html" class="flex items-center gap-2 text-xl font-black text-primary-600 shrink-0">
      <span class="w-8 h-8 bg-primary-600 rounded-xl flex items-center justify-center text-white font-black text-sm">S</span>
      <span class="hidden sm:block">SkillSwap</span>
    </a>`;

  const publicLinks = `
    <div class="hidden md:flex items-center justify-center gap-8 text-sm font-bold text-slate-600 flex-1">
      <a href="skills.html" class="hover:text-primary-600 transition">Browse Skills</a>
      <a href="index.html#how-it-works" class="hover:text-primary-600 transition">How it Works</a>
      <a href="index.html#categories" class="hover:text-primary-600 transition">Categories</a>
    </div>`;

  const publicActions = isAuth ? `
    <div class="hidden md:flex items-center gap-3">
      ${Auth.isAdmin?.() ? '<a href="admin.html" class="text-sm font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition px-4 py-2 rounded-2xl">Admin Panel &rarr;</a>' : ''}
      <a href="dashboard.html" class="text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 transition px-4 py-2 rounded-2xl">
        Dashboard &rarr;
      </a>
    </div>` : `
    <div class="hidden md:flex items-center gap-3">
      <a href="login.html" class="text-sm font-bold text-slate-600 hover:text-primary-600 transition px-4 py-2 rounded-2xl hover:bg-primary-50">Sign In</a>
      <a href="register.html" class="text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 transition px-4 py-2 rounded-2xl">Get Started</a>
    </div>`;

  const userActions = `
    <div class="flex items-center gap-2">
      <a href="skills.html" class="hidden sm:block text-sm font-bold text-slate-500 hover:text-primary-600 transition px-3 py-1.5 rounded-xl hover:bg-slate-50">Browse</a>
      <div class="flex items-center gap-2 cursor-pointer group" onclick="Modal?.open?.('profile-modal')">
        <div class="w-8 h-8 rounded-xl bg-primary-100 flex items-center justify-center text-xs font-black text-primary-600" data-user-initials>${user ? getInitials(user.username || user.email) : "?"}</div>
        <span class="hidden sm:block text-sm font-bold text-slate-700 group-hover:text-primary-600 transition" data-user-name>${user?.username || ""}</span>
        <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
      </div>
      <button data-action="logout" class="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition" title="Logout">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
        </svg>
      </button>
    </div>`;

  const adminActions = `
    <div class="flex items-center gap-2">
      <span class="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">Admin</span>
      <div class="w-8 h-8 rounded-xl bg-primary-100 flex items-center justify-center text-xs font-black text-primary-600" data-user-initials>${user ? getInitials(user.username || user.email) : "?"}</div>
      <span class="hidden sm:block text-sm font-bold text-slate-700" data-user-name>${user?.username || ""}</span>
      <button data-action="logout" class="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition ml-1" title="Logout">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
        </svg>
      </button>
    </div>`;

  const mobileMenu = `
    <button id="mobile-menu-btn" class="md:hidden p-2 rounded-xl hover:bg-slate-50 transition" onclick="toggleMobileNav()">
      <svg class="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 6h16M4 12h16M4 18h16"/>
      </svg>
    </button>`;

  const mobileNav = `
    <div id="mobile-nav" class="hidden md:hidden flex-col bg-white border-t border-slate-100 px-4 py-4 gap-3">
      <a href="skills.html" class="text-sm font-bold text-slate-600 py-2">Browse Skills</a>
      <a href="index.html#how-it-works" class="text-sm font-bold text-slate-600 py-2">How it Works</a>
      ${isAuth ? `
        ${Auth.isAdmin?.() ? '<a href="admin.html" class="text-sm font-bold text-emerald-600 py-2">Admin Panel &rarr;</a>' : ''}
        <a href="dashboard.html" class="text-sm font-bold text-primary-600 py-2">Dashboard &rarr;</a>
        <button data-action="logout" class="text-left text-sm font-bold text-red-500 py-2">Sign Out</button>
      ` : `
        <div class="flex gap-2 pt-2 border-t border-slate-100">
          <a href="login.html" class="flex-1 text-center text-sm font-bold text-slate-600 border border-slate-200 py-2.5 rounded-2xl">Sign In</a>
          <a href="register.html" class="flex-1 text-center text-sm font-bold text-white bg-primary-600 py-2.5 rounded-2xl">Get Started</a>
        </div>`}
    </div>`;

  let inner = "";
  if (variant === "public") {
    inner = `
        <div class="flex items-center justify-between w-full gap-4">
          ${logo}
          ${publicLinks}
          <div class="flex items-center gap-3">
            ${publicActions}
            ${mobileMenu}
          </div>
        </div>`;
  } else if (variant === "user") {
    inner = `
        <div class="flex items-center justify-between w-full">
          ${logo}
          <div class="flex-1"></div>
          ${userActions}
        </div>`;
  } else if (variant === "admin") {
    inner = `
        <div class="flex items-center justify-between w-full">
          ${logo}
          <div class="flex-1"></div>
          ${adminActions}
        </div>`;
  }

  const isSidebarPage = variant === "user" || variant === "admin";
  const html = `
    <nav class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm h-16 flex items-center px-4 sm:px-8">
      ${inner}
    </nav>
    ${variant === "public" ? mobileNav : ""}`;

  const root = document.getElementById("navbar-root");
  if (root) root.innerHTML = html;

  // Re-attach logout & scroll handlers
  setTimeout(() => {
    document.querySelectorAll("[data-action=logout]").forEach(btn => {
      btn.addEventListener("click", () => Modal?.open?.("logout-modal"));
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"], a[href*="index.html#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        const hash = href.includes('#') ? '#' + href.split('#')[1] : null;

        // Only intercept if we're on the homepage or the target is just a hash
        const isHome = window.location.pathname.endsWith("index.html") || window.location.pathname === "/" || window.location.pathname.endsWith("/");
        const isLocalHash = href.startsWith('#');

        if (hash && (isLocalHash || isHome)) {
          const target = document.querySelector(hash);
          if (target) {
            e.preventDefault();
            window.scrollTo({
              top: target.offsetTop - 64, // 64px is h-16 (navbar height)
              behavior: 'smooth'
            });
            // Close mobile nav
            const mob = document.getElementById("mobile-nav");
            if (mob) mob.classList.add("hidden");
          }
        }
      });
    });
  }, 0);
}

function toggleMobileNav() {
  const nav = document.getElementById("mobile-nav");
  if (!nav) return;
  nav.classList.toggle("hidden");
}

window.renderNavbar = renderNavbar;
window.toggleMobileNav = toggleMobileNav;
