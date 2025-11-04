export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        night: "#0F0F1A",
        card: "#1B1B2F",
        primary: "#7A3FFF",
        accent: "#FF66C4"
      },
      boxShadow: {
        soft: "0 10px 25px rgba(122,63,255,0.25)"
      }
    }
  },
  plugins: []
}
