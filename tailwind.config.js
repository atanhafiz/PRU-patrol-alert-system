/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors:{
        pru:{ purple:"#6b5bff", red:"#ef4444", blue:"#2563eb" }
      },
      boxShadow:{
        soft:"0 1px 2px rgba(0,0,0,.05)",
        strong:"0 10px 30px rgba(0,0,0,.15)"
      },
      borderRadius:{ xl:"1rem", "2xl":"1.25rem" }
    }
  },
  plugins: [],
}
