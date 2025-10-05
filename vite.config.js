import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    hmr: { overlay: true } // tukar ke false kalau tak mau popup error
  }
});
