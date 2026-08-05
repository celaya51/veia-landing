import { defineConfig } from "astro/config";

// Sitio estático: mismo modelo de despliegue que SANHER (GitHub Pages / host estático).
export default defineConfig({
  output: "static",
  site: "https://celaya51.github.io/veia-landing/",
});
