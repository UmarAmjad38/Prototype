/**
 * footer.js — Shared Footer Component
 * Inject into any page by calling: renderFooter()
 * Place <div id="footer-root"></div> at the bottom of <body>
 */

function renderFooter() {
  const year = new Date().getFullYear();
  const html = `
    <footer class="border-t border-slate-100 bg-white py-8 mt-auto">
      <div class="max-w-6xl mx-auto px-4 sm:px-6">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-5">
          <!-- Logo + tagline -->
          <div class="flex flex-col items-center sm:items-start gap-1">
            <div class="flex items-center gap-2 text-primary-600 font-black">
              <span class="w-7 h-7 bg-primary-600 rounded-xl flex items-center justify-center text-white font-black text-xs">S</span>
              SkillSwap
            </div>
            <p class="text-xs text-slate-400 font-medium">Share skills. Grow together.</p>
          </div>

          <!-- Links -->
          <nav class="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-bold text-slate-500">
            <a href="index.html" class="hover:text-primary-600 transition">Home</a>
            <a href="skills.html" class="hover:text-primary-600 transition">Browse Skills</a>
            <a href="register.html" class="hover:text-primary-600 transition">Join Free</a>
            <a href="login.html" class="hover:text-primary-600 transition">Sign In</a>
          </nav>

          <!-- Copyright -->
          <p class="text-xs text-slate-400 font-medium">© ${year} SkillSwap</p>
        </div>
      </div>
    </footer>`;

  const root = document.getElementById("footer-root");
  if (root) root.innerHTML = html;
}

window.renderFooter = renderFooter;
