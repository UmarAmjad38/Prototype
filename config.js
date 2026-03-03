/**
 * SkillSwap Configuration
 * ──────────────────────────────────────────────────
 * Replace the placeholder values below with your actual credentials
 * once you have set up Strapi Cloud and Cloudinary.
 *
 * STRAPI:
 *   1. Deploy your Strapi project on cloud.strapi.io
 *   2. Go to Settings → API Tokens → Create token (Full Access)
 *   3. Replace STRAPI_URL and STRAPI_API_TOKEN below
 *
 * CLOUDINARY:
 *   1. Sign up at cloudinary.com
 *   2. Settings → Upload → Upload Presets → Add preset (Unsigned)
 *   3. Replace CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET below
 * ──────────────────────────────────────────────────
 */

const CONFIG = {
  // ── Strapi CMS ─────────────────────────────────
  STRAPI_URL: "http://localhost:1337",
  STRAPI_API_TOKEN: "bb9ba595d99965c78c103e0517f604fb7920c3c46f3b5f6a053c96eb65cc7962ea6fa93f09e67c1754b60380481cc850dd5316682e27bb5b32e2d568c7a14859e97b85b2f300c7a951468269b266e632e0c9251c96a48c86c585f75c9caff6a374b8a79aa56b67ec4596f8daf089949325a427a0278576a8e9071eb79d2a9aa1",

  // ── Cloudinary ──────────────────────────────────
  CLOUDINARY_CLOUD_NAME: "dvrlpegyd",
  CLOUDINARY_UPLOAD_PRESET: "Prototype",

  // ── App Settings ────────────────────────────────
  APP_NAME: "SkillSwap",
  DEFAULT_AVATAR: "assets/images/default-avatar.png",
};

// Make available globally
window.CONFIG = CONFIG;
