import { defineConfig } from "astro/config";

// Sitio estático: mismo modelo de despliegue que SANHER (GitHub Pages / host estático).
export default defineConfig({
  output: "static",
  site: "https://celaya51.github.io/veia-landing/",
  // Necesario en GitHub Pages de proyecto: el sitio vive bajo /veia-landing/
  // y sin base los assets (CSS/JS) se buscan en la raíz del dominio (404).
  base: "/veia-landing/",
});
