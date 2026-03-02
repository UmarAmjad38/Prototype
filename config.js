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
  STRAPI_URL: "https://YOUR_STRAPI_CLOUD_URL",      // e.g. https://my-skillswap.strapiapp.com
  STRAPI_API_TOKEN: "YOUR_STRAPI_API_TOKEN",        // Full Access token from Strapi Settings

  // ── Cloudinary ──────────────────────────────────
  CLOUDINARY_CLOUD_NAME: "dvrlpegyd",
  CLOUDINARY_UPLOAD_PRESET: "Prototype",

  // ── App Settings ────────────────────────────────
  APP_NAME: "SkillSwap",
  DEFAULT_AVATAR: "assets/images/default-avatar.png",
};

// Make available globally
window.CONFIG = CONFIG;
