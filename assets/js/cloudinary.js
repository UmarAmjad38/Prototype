/**
 * cloudinary.js — Unsigned image upload helper
 * Uses Cloudinary's unsigned upload preset (no server needed).
 */

const CloudinaryUpload = {
    async uploadFile(file) {
        const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } = window.CONFIG;
        const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
        formData.append("folder", "skillswap");

        const res = await fetch(url, { method: "POST", body: formData });
        if (!res.ok) throw new Error("Image upload failed");
        const data = await res.json();
        return { url: data.secure_url, publicId: data.public_id };
    },

    async uploadMultiple(files) {
        return Promise.all(Array.from(files).map(f => this.uploadFile(f)));
    },

    /**
     * Attach upload preview to an <input type="file"> element.
     * @param {string} inputId    - file input element id
     * @param {string} previewId  - container div to show preview thumbnails
     */
    attachPreview(inputId, previewId) {
        const input = document.getElementById(inputId);
        const preview = document.getElementById(previewId);
        if (!input || !preview) return;

        input.addEventListener("change", () => {
            preview.innerHTML = "";
            Array.from(input.files).forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement("img");
                    img.src = e.target.result;
                    img.className = "w-20 h-20 object-cover rounded-xl border border-slate-200";
                    preview.appendChild(img);
                };
                reader.readAsDataURL(file);
            });
        });
    },
};

window.CloudinaryUpload = CloudinaryUpload;
