// ╔══════════════════════════════════════════════════╗
// ║          🥷 IB-HEX-BOT v3.0 - index.js          ║
// ║      Développé par : ibrahima sory sacko         ║
// ║              Guinée 🇬🇳 — 2025                   ║
// ╚══════════════════════════════════════════════════╝

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  downloadMediaMessage,
  generateWAMessageFromContent,
  proto,
} = require("@whiskeysockets/baileys");

const express = require("express");
const qrcode  = require("qrcode");
const pino    = require("pino");
const axios   = require("axios");
const fs      = require("fs");
const path    = require("path");

// ════════════════════════════════════════════════════
//  🌐 SERVEUR WEB QR CODE
// ════════════════════════════════════════════════════
const app       = express();
const PORT      = process.env.PORT || 3000;
let   qrData    = null;
let   connected = false;

app.get("/", (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>🥷 IB-HEX-BOT</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',sans-serif;background:#0d1117;color:#fff;
min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
.card{background:#161b22;border:2px solid #25D366;border-radius:20px;
padding:35px 25px;max-width:430px;width:100%;text-align:center;
box-shadow:0 0 50px rgba(37,211,102,0.3)}
h1{color:#25D366;font-size:2.2rem;margin-bottom:6px}
.sub{color:#8b949e;font-size:.9rem;margin-bottom:16px}
.badge{display:inline-block;padding:7px 18px;border-radius:20px;
font-size:.85rem;font-weight:bold;margin-bottom:18px}
.ok{background:#1a4731;color:#25D366;border:1px solid #25D366}
.wait{background:#3d2b00;color:#FF9800;border:1px solid #FF9800}
.load{background:#1a1f2e;color:#58a6ff;border:1px solid #58a6ff}
#qrimg{background:#fff;border-radius:14px;padding:12px;
display:inline-block;margin:10px 0}
#qrimg img{width:230px;height:230px;display:block}
.steps{text-align:left;background:#0d1117;border-radius:10px;
padding:15px;margin:15px 0}
.steps p{margin:6px 0;font-size:.85rem;color:#c9d1d9}
.steps span{color:#25D366;font-weight:bold}
button{background:#25D366;color:#000;border:none;padding:12px;
border-radius:8px;cursor:pointer;font-size:.95rem;font-weight:bold;
margin-top:10px;width:100%}
button:hover{background:#1faf56}
.cats{display:flex;flex-wrap:wrap;gap:8px;
justify-content:center;margin:12px 0}
.cat{background:#21262d;border:1px solid #30363d;border-radius:8px;
padding:5px 12px;font-size:.78rem;color:#8b949e}
.footer{margin-top:18px;color:#555;font-size:.78rem}
</style>
</head>
<body>
<div class="card">
  <h1>🥷 IB-HEX-BOT</h1>
  <p class="sub">Bot WhatsApp par <strong>ibrahima sory sacko</strong> 🇬🇳</p>
  <div class="cats">
    <span class="cat">🤖 Général</span>
    <span class="cat">🎭 Fun</span>
    <span class="cat">🛠️ Outils</span>
    <span class="cat">👥 Groupe</span>
    <span class="cat">🎨 Médias</span>
  </div>
  ${connected
    ? `<div class="badge ok">✅ Bot Connecté et Actif!</div>
       <p style="color:#25D366;font-size:1.1rem;margin:10px 0">🎉 Votre bot fonctionne!</p>
       <p style="color:#8b949e">Envoyez <strong style="color:#fff">Ibmenu</strong> sur WhatsApp</p>`
    : qrData
    ? `<div class="badge wait">📱 Scannez le QR Code</div>
       <div id="qrimg"><img src="${qrData}" alt="QR"/></div>
       <div class="steps">
         <p><span>1.</span> Ouvrez WhatsApp</p>
         <p><span>2.</span> Appuyez sur ⋮ les 3 points</p>
         <p><span>3.</span> Sélectionnez "Appareils liés"</p>
         <p><span>4.</span> Appuyez "Lier un appareil"</p>
         <p><span>5.</span> Scannez ce QR Code</p>
       </div>
       <button onclick="location.reload()">🔄 Actualiser</button>`
    : `<div class="badge load">⏳ Génération du QR...</div>
       <p style="color:#8b949e;margin:18px 0">Patientez quelques secondes...</p>
       <button onclick="location.reload()">🔄 Actualiser</button>`}
  <p class="footer">IB-HEX-BOT v3.0 • Préfixe <strong>Ib</strong></p>
</div>
${!connected ? "<script>setTimeout(()=>location.reload(),5000)</script>" : ""}
</body></html>`);
});

app.listen(PORT, () => {
  console.log(`\n🥷 IB-HEX-BOT v3.0 démarré!`);
  console.log(`🌐 Page QR: http://localhost:${PORT}\n`);
});

// ════════════════════════════════════════════════════
//  ⚙️ CONFIGURATION
// ════════════════════════════════════════════════════
const OWNER    = "224621963059";
const PREFIX   = "Ib";
const BOT_NAME = "IB_HEX_BOT";
const DEV_NAME = "ibrahima sory sacko";
const MENU_IMG = "https://i.ibb.co/S4Bq8FGC/file-0000000019fc722f9717382cd6600e56.png";
let   startTime = Date.now();

// Anti-spam & protection stockage
const antiLinkGroups    = new Set();
const antiStickerGroups = new Set();
const antiGmGroups      = new Set();

// ════════════════════════════════════════════════════
//  📦 DONNÉES
// ════════════════════════════════════════════════════
const BLAGUES = [
  "Pourquoi les plongeurs plongent en arrière?\nParce que sinon ils tomberaient dans le bateau! 😂",
  "Quel est le comble pour un électricien?\nDe ne pas être au courant! ⚡",
  "Que dit un squelette avant de manger?\nBon appé-os! 💀",
  "Pourquoi Superman porte son slip par-dessus?\nParce qu'il le met toujours en dernier! 🦸",
  "Comment appelle-t-on un chat dans un pot de peinture?\nUn chat-peint! 🎨",
  "Pourquoi les vaches portent des cloches?\nParce que leurs cornes ne fonctionnent pas! 🐄",
  "Comment appelle-t-on un boomerang qui ne revient pas?\nUn bâton! 🪃",
  "Quel est le sport préféré des fantômes?\nLe basket — ils adorent les filets! 👻",
];

const CITATIONS = [
  '"La vie c\'est comme une bicyclette, il faut avancer pour ne pas perdre l\'équilibre."\n— Albert Einstein 🚲',
  '"Le succès c\'est d\'aller d\'échec en échec sans perdre son enthousiasme."\n— Churchill 💪',
  '"La seule façon de faire du bon travail est d\'aimer ce que vous faites."\n— Steve Jobs ❤️',
  '"Un voyage de mille lieues commence par un premier pas."\n— Lao Tseu 👣',
  '"La créativité c\'est l\'intelligence qui s\'amuse."\n— Einstein 🎨',
  '"Ne comptez pas les jours, faites que les jours comptent."\n— Muhammad Ali 🥊',
];

const MOTIVATIONS = [
  "🔥 Tu es capable de tout! Ne lâche *jamais*!",
  "💪 Chaque matin est une nouvelle chance de tout changer!",
  "⚡ Les difficultés ne font que te rendre plus fort!",
  "🚀 Le succès n'est pas une destination, c'est un voyage!",
  "🏆 Travaille en silence. Laisse ton succès faire le bruit!",
  "🌈 Après chaque tempête, il y a toujours un arc-en-ciel!",
];

const FAITS = [
  "🐙 Les pieuvres ont *3 cœurs* et du sang bleu!",
  "🍯 Le miel ne se périme *jamais* — trouvé intact dans des tombeaux de 3000 ans!",
  "🐌 Les escargots peuvent dormir jusqu'à *3 ans* de suite!",
  "🦋 Les papillons goûtent leur nourriture avec *leurs pieds*!",
  "🌙 La Lune s'éloigne de *3,8 cm* de la Terre chaque année!",
  "🦁 Un lion peut dormir *20 heures* par jour!",
];

const BOULE8 = [
  "✅ Oui, absolument!", "❌ Non, certainement pas!",
  "🤔 Peut-être...", "🌟 Les signes disent OUI!",
  "⚡ Très probablement oui!", "💫 Sans aucun doute!",
  "🌙 Je ne compterais pas là-dessus...", "🔮 C'est très incertain...",
  "✨ Tout indique que oui!", "💭 Concentre-toi et redemande!",
  "⭐ C'est une certitude!", "🎯 Oui, définitivement!",
];

const HOROSCOPES = {
  belier:"♈ *Bélier* — Journée idéale pour prendre des initiatives! 🔥",
  taureau:"♉ *Taureau* — Bonne journée côté finances. 💰",
  gemeaux:"♊ *Gémeaux* — Votre communication brille! 💬",
  cancer:"♋ *Cancer* — La famille est au cœur de votre journée. 🏠",
  lion:"♌ *Lion* — Vous brillez aujourd'hui! ✨",
  vierge:"♍ *Vierge* — Votre sens du détail vous sauve. 📋",
  balance:"♎ *Balance* — Belle journée pour l'amour. ❤️",
  scorpion:"♏ *Scorpion* — Faites confiance à votre instinct. 🔮",
  sagittaire:"♐ *Sagittaire* — Une opportunité se présente. 🗺️",
  capricorne:"♑ *Capricorne* — Le succès professionnel est proche. 🏆",
  verseau:"♒ *Verseau* — Vos idées créatives impressionnent. 💡",
  poissons:"♓ *Poissons* — Écoutez votre cœur. 💙",
};

const DEVINETTES = [
  { q:"J'ai des mains mais pas de bras. Qui suis-je?", r:"Une horloge! ⏰" },
  { q:"Plus je sèche, plus je suis mouillée. Qui suis-je?", r:"Une serviette! 🏖️" },
  { q:"J'ai des dents mais je ne peux pas mordre. Qui suis-je?", r:"Un peigne! 💇" },
  { q:"Plus je grandis, moins on me voit. Qui suis-je?", r:"La nuit! 🌑" },
  { q:"Je parle sans bouche, j'entends sans oreilles. Qui suis-je?", r:"Un écho! 🔊" },
];

const QUIZZ = [
  { q:"Quelle est la capitale de la Guinée?", r:"Conakry 🇬🇳" },
  { q:"Combien de pays en Afrique?", r:"54 pays 🌍" },
  { q:"Qui a inventé l'ampoule électrique?", r:"Thomas Edison 💡" },
  { q:"Quel est l'animal le plus rapide du monde?", r:"Le guépard 🐆 (110 km/h)" },
  { q:"Quelle est la planète la plus grande du système solaire?", r:"Jupiter 🪐" },
  { q:"Combien de cordes a une guitare classique?", r:"6 cordes 🎸" },
];

const ANIME_LIST = [
  { nom:"Naruto", genre:"Action/Aventure", note:"9/10", desc:"Un jeune ninja rêve de devenir le chef de son village." },
  { nom:"Dragon Ball Z", genre:"Action/Combat", note:"9.5/10", desc:"Goku et ses amis défendent la Terre contre des ennemis puissants." },
  { nom:"One Piece", genre:"Aventure/Action", note:"9.8/10", desc:"Monkey D. Luffy cherche le One Piece pour devenir Roi des Pirates." },
  { nom:"Attack on Titan", genre:"Action/Drame", note:"9.9/10", desc:"L'humanité survit derrière des murs géants face aux Titans." },
  { nom:"Death Note", genre:"Thriller/Mystère", note:"9.5/10", desc:"Un lycéen trouve un carnet qui tue quiconque dont il écrit le nom." },
  { nom:"Demon Slayer", genre:"Action/Surnaturel", note:"9.7/10", desc:"Tanjiro cherche à guérir sa sœur transformée en démon." },
];

const FANCY_STYLES = {
  bold:    str => str.split("").map(c => {
    const base = c.charCodeAt(0);
    if (base >= 65 && base <= 90) return String.fromCodePoint(base - 65 + 0x1D400);
    if (base >= 97 && base <= 122) return String.fromCodePoint(base - 97 + 0x1D41A);
    return c;
  }).join(""),
  italic:  str => str.split("").map(c => {
    const base = c.charCodeAt(0);
    if (base >= 65 && base <= 90) return String.fromCodePoint(base - 65 + 0x1D434);
    if (base >= 97 && base <= 122) return String.fromCodePoint(base - 97 + 0x1D44E);
    return c;
  }).join(""),
};

// ════════════════════════════════════════════════════
//  🔧 UTILITAIRES
// ════════════════════════════════════════════════════
function getUptime() {
  const ms = Date.now() - startTime;
  const h  = Math.floor(ms / 3600000);
  const m  = Math.floor((ms % 3600000) / 60000);
  const s  = Math.floor((ms % 60000) / 1000);
  return `${h}h ${m}m ${s}s`;
}

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function getDate() {
  return new Date().toLocaleDateString("fr-FR", {
    weekday:"long", year:"numeric", month:"long", day:"numeric",
    timeZone:"Africa/Conakry",
  });
}

function getTime() {
  return new Date().toLocaleTimeString("fr-FR", { timeZone:"Africa/Conakry" });
}

async function sendMsg(sock, jid, text) {
  await sock.sendMessage(jid, { text });
}

async function sendImg(sock, jid, url, caption = "") {
  try {
    await sock.sendMessage(jid, { image: { url }, caption });
  } catch {
    if (caption) await sendMsg(sock, jid, caption);
  }
}

async function isAdmin(sock, jid, participant) {
  try {
    const meta   = await sock.groupMetadata(jid);
    const admins = meta.participants.filter(p => p.admin).map(p => p.id);
    return admins.includes(participant);
  } catch { return false; }
}

async function isBotAdmin(sock, jid) {
  try {
    const meta   = await sock.groupMetadata(jid);
    const botNum = sock.user.id.split(":")[0];
    const admins = meta.participants.filter(p => p.admin).map(p => p.id);
    return admins.some(a => a.includes(botNum));
  } catch { return false; }
}

function getMentioned(msg) {
  return msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || null;
}

function getQuotedMsg(msg) {
  return msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
}

// ════════════════════════════════════════════════════
//  🚀 DÉMARRAGE
// ════════════════════════════════════════════════════
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");
  const { version }          = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger:            pino({ level:"silent" }),
    printQRInTerminal: true,
    auth:              state,
    browser:           ["IB-HEX-BOT", "Chrome", "3.0"],
    defaultQueryTimeoutMs: 60000,
  });

  // ── Connexion ──────────────────────────────────────
  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      qrData    = await qrcode.toDataURL(qr);
      connected = false;
      console.log("📱 QR prêt! Ouvrez la page web pour scanner.");
    }
    if (connection === "close") {
      connected = false;
      const code = lastDisconnect?.error?.output?.statusCode;
      if (code !== DisconnectReason.loggedOut) {
        console.log("🔄 Reconnexion...");
        setTimeout(startBot, 3000);
      } else {
        qrData = null;
        console.log("❌ Déconnecté. Supprimez auth_info_baileys et relancez.");
      }
    }
    if (connection === "open") {
      connected = true;
      qrData    = null;
      startTime = Date.now();
      console.log("✅ IB-HEX-BOT v3.0 connecté avec succès!");
    }
  });

  sock.ev.on("creds.update", saveCreds);

  // ── Bienvenue / Au revoir automatique ─────────────
  sock.ev.on("group-participants.update", async ({ id, participants, action }) => {
    if (action === "add") {
      for (const p of participants) {
        const num = p.replace("@s.whatsapp.net", "");
        await sock.sendMessage(id, {
          text: `🎉 *╔══ BIENVENUE! ══╗*\n\n👋 Bienvenue *@${num}* dans le groupe!\n\n📜 Règles: *${PREFIX}regles*\n🤖 Menu bot: *${PREFIX}menu*\n\n_Content de t'avoir parmi nous!_ 🥳\n*╚══════════════╝*`,
          mentions: [p],
        });
      }
    }
    if (action === "remove") {
      const num = participants[0].replace("@s.whatsapp.net","");
      await sendMsg(sock, id, `👋 *Au revoir +${num}*\nNous espérons te revoir! 😢`);
    }
  });

  // ── Protection de groupe (anti-link, anti-sticker, anti-gm) ───
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;
    const msg = messages[0];
    if (!msg?.message || msg.key.fromMe) return;

    const from    = msg.key.remoteJid;
    const isGroup = from.endsWith("@g.us");
    const sender  = isGroup ? msg.key.participant : from;
    const senderNum = sender.replace("@s.whatsapp.net", "");

    // Anti-lien
    if (isGroup && antiLinkGroups.has(from)) {
      const mtype = Object.keys(msg.message)[0];
      let body = "";
      if (mtype === "conversation") body = msg.message.conversation;
      else if (mtype === "extendedTextMessage") body = msg.message.extendedTextMessage.text;
      const hasLink = /https?:\/\/|wa\.me|chat\.whatsapp\.com/i.test(body);
      if (hasLink && !(await isAdmin(sock, from, sender))) {
        try {
          await sock.sendMessage(from, { delete: msg.key });
          await sock.sendMessage(from, {
            text: `⚠️ @${senderNum} les liens sont interdits dans ce groupe!`,
            mentions: [sender],
          });
        } catch {}
        return;
      }
    }

    // Anti-sticker
    if (isGroup && antiStickerGroups.has(from)) {
      if (msg.message?.stickerMessage && !(await isAdmin(sock, from, sender))) {
        try {
          await sock.sendMessage(from, { delete: msg.key });
          await sock.sendMessage(from, {
            text: `⚠️ @${senderNum} les stickers sont interdits ici!`,
            mentions: [sender],
          });
        } catch {}
        return;
      }
    }

    // ── Commandes ────────────────────────────────────
    const isOwner = senderNum === OWNER;
    const mtype   = Object.keys(msg.message)[0];
    let body = "";
    if (mtype === "conversation")             body = msg.message.conversation;
    else if (mtype === "extendedTextMessage") body = msg.message.extendedTextMessage.text;
    else if (mtype === "imageMessage")        body = msg.message.imageMessage.caption || "";
    else if (mtype === "videoMessage")        body = msg.message.videoMessage.caption || "";
    if (!body) return;

    if (!new RegExp(`^${PREFIX}`, "i").test(body)) return;

    const args      = body.slice(PREFIX.length).trim().split(/\s+/);
    const cmd       = args.shift().toLowerCase();
    const texte     = args.join(" ").trim();
    const mentionné = getMentioned(msg);
    const quoted    = getQuotedMsg(msg);

    console.log(`📩 [${getTime()}] ${PREFIX}${cmd} | +${senderNum}`);

    // ════════════════════════════════════════════════
    //  🤖 CATÉGORIE 1 — GÉNÉRAL
    // ════════════════════════════════════════════════

    if (cmd === "menu") {
      const menu = `╭──𝗜𝗕-𝗛𝗘𝗫-𝗕𝗢𝗧─────🥷
│ 🤖 *${BOT_NAME}* v3.0
│ ⏱️ Uptime: *${getUptime()}*
│ 🛡️ Préfixe: *${PREFIX}*
│ 👑 Owner: *IbSacko*
╰──────────────🥷

🤖─────────────────🤖
   🥷𝗜𝗕𝗥𝗔𝗛𝗜𝗠𝗔 𝗦𝗢𝗡𝗬 𝗦𝗔𝗖𝗞𝗢🥷
🤖─────────────────🤖

🥷───────────────🥷
『 🤖 𝗚É𝗡É𝗥𝗔𝗟 』
│ ⬡ ${PREFIX}menu → Menu complet
│ ⬡ ${PREFIX}alive → État du bot
│ ⬡ ${PREFIX}ping → Vitesse de réponse
│ ⬡ ${PREFIX}uptime → Temps actif
│ ⬡ ${PREFIX}dev → Développeur
│ ⬡ ${PREFIX}owner → Propriétaire
│ ⬡ ${PREFIX}info → Infos complètes
│ ⬡ ${PREFIX}stats → Statistiques
│ ⬡ ${PREFIX}aide [cmd] → Aide commande
│ ⬡ ${PREFIX}support → Contact support
╰────────────────🥷

🥷───────────────🥷
『 🎭 𝗙𝗨𝗡 & 𝗝𝗘𝗨𝗫 』
│ ⬡ ${PREFIX}blague → Blague aléatoire
│ ⬡ ${PREFIX}citation → Citation motivante
│ ⬡ ${PREFIX}motivation → Boost motivation
│ ⬡ ${PREFIX}fortune → Fortune du jour
│ ⬡ ${PREFIX}8ball [?] → Boule magique
│ ⬡ ${PREFIX}horoscope [signe] → Horoscope
│ ⬡ ${PREFIX}devinette → Devinette
│ ⬡ ${PREFIX}quizz → Culture générale
│ ⬡ ${PREFIX}couple @m → Couple aléatoire
│ ⬡ ${PREFIX}profil → Ton profil
│ ⬡ ${PREFIX}duel @m → Duel de points
│ ⬡ ${PREFIX}pfc [choix] → Pierre Feuille Ciseaux
│ ⬡ ${PREFIX}emojimix → Mélange d'emojis
│ ⬡ ${PREFIX}goodnight → Bonne nuit
│ ⬡ ${PREFIX}anime → Info anime aléatoire
╰────────────────🥷

🥷───────────────🥷
『 🛠️ 𝗢𝗨𝗧𝗜𝗟𝗦 』
│ ⬡ ${PREFIX}calc [calcul] → Calculatrice
│ ⬡ ${PREFIX}heure → Heure actuelle
│ ⬡ ${PREFIX}date → Date du jour
│ ⬡ ${PREFIX}meteo [ville] → Météo
│ ⬡ ${PREFIX}wiki [sujet] → Wikipedia
│ ⬡ ${PREFIX}crypto [coin] → Prix crypto
│ ⬡ ${PREFIX}morse [texte] → Code morse
│ ⬡ ${PREFIX}random [max] → Nb aléatoire
│ ⬡ ${PREFIX}pile → Pile ou Face
│ ⬡ ${PREFIX}des [nb] → Lancer des dés
│ ⬡ ${PREFIX}url [lien] → Infos sur un lien
│ ⬡ ${PREFIX}faitinsolite → Fait insolite
╰────────────────🥷

🥷───────────────🥷
『 👥 𝗚𝗥𝗢𝗨𝗣𝗘 』
│ ⬡ ${PREFIX}ginfo → Infos du groupe
│ ⬡ ${PREFIX}regles → Règles
│ ⬡ ${PREFIX}tagall [msg] → Taguer tous
│ ⬡ ${PREFIX}tagadmin [msg] → Taguer admins
│ ⬡ ${PREFIX}getall → Liste des membres
│ ⬡ ${PREFIX}kick @m → Expulser (admin)
│ ⬡ ${PREFIX}kickall → Exclure tous (admin)
│ ⬡ ${PREFIX}add [num] → Ajouter membre
│ ⬡ ${PREFIX}promote @m → Promouvoir admin
│ ⬡ ${PREFIX}demote @m → Rétrograder admin
│ ⬡ ${PREFIX}groupopen → Ouvrir groupe
│ ⬡ ${PREFIX}groupclose → Fermer groupe
│ ⬡ ${PREFIX}linkgc → Lien du groupe
│ ⬡ ${PREFIX}vcf → Exporter contacts
│ ⬡ ${PREFIX}poll [?] → Sondage natif
│ ⬡ ${PREFIX}antilink on/off → Anti-lien
│ ⬡ ${PREFIX}antisticker on/off → Anti-sticker
│ ⬡ ${PREFIX}antigm on/off → Anti-mention
│ ⬡ ${PREFIX}wcg → Classement groupe
│ ⬡ ${PREFIX}bataille → Jeu bataille
│ ⬡ ${PREFIX}defi → Défi aléatoire
│ ⬡ ${PREFIX}sondage [?] → Sondage texte
╰────────────────🥷

🥷───────────────🥷
『 🎨 𝗠É𝗗𝗜𝗔𝗦 & 𝗖𝗥É𝗔𝗧𝗜𝗙 』
│ ⬡ ${PREFIX}sticker → Image → Sticker
│ ⬡ ${PREFIX}toimage → Sticker → Image
│ ⬡ ${PREFIX}getpp @m → Photo de profil
│ ⬡ ${PREFIX}gimage [mot] → Image Google
│ ⬡ ${PREFIX}take → Récupérer média cité
│ ⬡ ${PREFIX}fancy [texte] → Texte stylé
│ ⬡ ${PREFIX}encadrer [texte] → Encadrer
│ ⬡ ${PREFIX}styliser [texte] → Styliser
│ ⬡ ${PREFIX}invertir [texte] → Inverser
│ ⬡ ${PREFIX}majuscule [texte] → MAJUSCULE
│ ⬡ ${PREFIX}minuscule [texte] → minuscule
│ ⬡ ${PREFIX}compter [texte] → Analyser
│ ⬡ ${PREFIX}repeter [n] [txt] → Répéter
│ ⬡ ${PREFIX}ascii [texte] → Art ASCII
│ ⬡ ${PREFIX}attp [texte] → Texte → Sticker
╰────────────────🥷

_🤖 ${BOT_NAME} v3.0 | centralhex_`;

      await sendImg(sock, from, MENU_IMG, menu);
    }

    else if (cmd === "alive") {
      await sendImg(sock, from, MENU_IMG,
        `╭─✅ BOT ACTIF ──────🥷
│ 🤖 *${BOT_NAME}* en ligne!
│ ⏱️ Uptime: *${getUptime()}*
│ 🛡️ Préfixe: *${PREFIX}*
│ 🕐 Heure: *${getTime()}*
│ ⚡ Statut: *Parfaitement actif ✅*
╰──────────────🥷

_Tapez *${PREFIX}menu* pour tout voir!_`);
    }

    else if (cmd === "ping") {
      const t1 = Date.now();
      await sock.sendMessage(from, { text:"🏓 Calcul..." });
      const ms = Date.now() - t1;
      await sendMsg(sock, from,
        `🏓 *PONG!*\n\n⚡ Latence: *${ms}ms*\n${ms < 500 ? "🟢 Excellente!" : ms < 1000 ? "🟡 Correcte." : "🔴 Lente."}`);
    }

    else if (cmd === "uptime") {
      await sendMsg(sock, from, `⏱️ *Temps actif:*\n\n🕐 *${getUptime()}*`);
    }

    else if (cmd === "dev") {
      await sendMsg(sock, from,
        `╭─👨‍💻 DÉVELOPPEUR ───🥷
│ 👤 *${DEV_NAME}*
│ 📱 *+${OWNER}*
│ 🌍 Guinée 🇬🇳
│ 💻 Node.js + Baileys
╰──────────────🥷
wa.me/${OWNER}`);
    }

    else if (cmd === "owner") {
      await sendMsg(sock, from,
        `╭─👑 PROPRIÉTAIRE ──🥷
│ 👤 *IbSacko*
│ 📱 *+${OWNER}*
│ 🌍 Guinée 🇬🇳
╰──────────────🥷
wa.me/${OWNER}`);
    }

    else if (cmd === "info") {
      const mem = process.memoryUsage();
      await sendMsg(sock, from,
        `╭─ℹ️ INFOS BOT ──────🥷
│ 🤖 *${BOT_NAME} v3.0*
│ 👤 Dev: *${DEV_NAME}*
│ 👑 Owner: *+${OWNER}*
│ ⏱️ Uptime: *${getUptime()}*
│ 🛡️ Préfixe: *${PREFIX}*
│ 💾 RAM: *${Math.round(mem.heapUsed/1024/1024)}MB*
│ 📅 *${getDate()}*
╰──────────────🥷`);
    }

    else if (cmd === "stats") {
      const mem = process.memoryUsage();
      await sendMsg(sock, from,
        `📊 *STATISTIQUES:*\n\n⏱️ Uptime: *${getUptime()}*\n💾 RAM: *${Math.round(mem.heapUsed/1024/1024)}MB*\n⚡ Statut: *✅ En ligne*\n🕐 *${getTime()}*`);
    }

    else if (cmd === "aide") {
      const helps = {
        menu:"Affiche le menu complet.",
        alive:"Vérifie que le bot est actif.",
        ping:"Mesure la vitesse du bot.",
        calc:`Calcule une expression. Ex: *${PREFIX}calc 5+3*2*`,
        meteo:`Météo d'une ville. Ex: *${PREFIX}meteo Conakry*`,
        wiki:`Wikipedia. Ex: *${PREFIX}wiki Guinée*`,
        crypto:`Prix crypto. Ex: *${PREFIX}crypto bitcoin*`,
        "8ball":`Boule magique. Ex: *${PREFIX}8ball Vais-je réussir?*`,
        sticker:"Réponds à une image pour créer un sticker.",
        toimage:"Réponds à un sticker pour le convertir en image.",
        getpp:`Photo de profil. Ex: *${PREFIX}getpp @membre*`,
        kick:`Expulse un membre. Ex: *${PREFIX}kick @membre*`,
        kickall:"Expulse tous les non-admins.",
        add:`Ajoute un membre. Ex: *${PREFIX}add 224XXXXXXX*`,
        tagall:"Mentionne tout le groupe.",
        tagadmin:"Mentionne les admins.",
        antilink:"Active/désactive anti-lien. *on/off*",
        antisticker:"Active/désactive anti-sticker. *on/off*",
        poll:`Sondage natif WhatsApp. Ex: *${PREFIX}poll Question|Choix1|Choix2*`,
        fancy:`Texte stylé. Ex: *${PREFIX}fancy Bonjour*`,
        attp:`Texte en sticker. Ex: *${PREFIX}attp Bonjour*`,
        couple:"Couple aléatoire dans le groupe.",
      };
      if (!texte) return sendMsg(sock, from,
        `📖 Usage: *${PREFIX}aide [commande]*\nEx: *${PREFIX}aide meteo*`);
      const h = helps[texte.toLowerCase()];
      await sendMsg(sock, from, h
        ? `📖 *Aide — ${PREFIX}${texte}:*\n\n${h}`
        : `❌ Aucune aide pour "${texte}".`);
    }

    else if (cmd === "support") {
      await sendMsg(sock, from,
        `🛠️ *SUPPORT:*\n\nwa.me/${OWNER}\n👤 *${DEV_NAME}*`);
    }

    // ════════════════════════════════════════════════
    //  🎭 CATÉGORIE 2 — FUN & JEUX
    // ════════════════════════════════════════════════

    else if (cmd === "blague") {
      await sendMsg(sock, from, `😂 *Blague:*\n\n${rand(BLAGUES)}`);
    }

    else if (cmd === "citation") {
      await sendMsg(sock, from, `💬 *Citation:*\n\n${rand(CITATIONS)}`);
    }

    else if (cmd === "motivation") {
      await sendMsg(sock, from, `💪 *Motivation:*\n\n${rand(MOTIVATIONS)}`);
    }

    else if (cmd === "fortune") {
      const fortunes = [
        "🌟 La chance te sourit énormément aujourd'hui!",
        "💰 Une opportunité financière arrive bientôt!",
        "❤️ L'amour frappe à ta porte!",
        "🚀 Un grand changement positif arrive!",
        "🏆 Le succès que tu mérites approche!",
      ];
      await sendMsg(sock, from, `🔮 *Fortune:*\n\n${rand(fortunes)}\n📅 ${getDate()}`);
    }

    else if (cmd === "8ball") {
      if (!texte) return sendMsg(sock, from, `🎱 Usage: *${PREFIX}8ball [question]*`);
      await sendMsg(sock, from,
        `🎱 *BOULE MAGIQUE:*\n\n❓ _${texte}_\n\n🔮 *${rand(BOULE8)}*`);
    }

    else if (cmd === "horoscope") {
      if (!texte) return sendMsg(sock, from,
        `♈ Usage: *${PREFIX}horoscope [signe]*\nSignes: ${Object.keys(HOROSCOPES).join(", ")}`);
      const h = HOROSCOPES[texte.toLowerCase().trim()];
      if (!h) return sendMsg(sock, from, `❌ Signe inconnu!`);
      await sendMsg(sock, from, `🔮 *Horoscope:*\n\n${h}\n\n📅 ${getDate()}`);
    }

    else if (cmd === "devinette") {
      const d = rand(DEVINETTES);
      await sendMsg(sock, from,
        `🧩 *DEVINETTE:*\n\n❓ ${d.q}\n\n||✅ Réponse: ${d.r}||`);
    }

    else if (cmd === "quizz") {
      const q = rand(QUIZZ);
      await sendMsg(sock, from,
        `🎯 *QUIZZ:*\n\n❓ ${q.q}\n\n||✅ ${q.r}||`);
    }

    else if (cmd === "couple") {
      if (!isGroup) return sendMsg(sock, from, "❌ Groupe uniquement!");
      try {
        const meta    = await sock.groupMetadata(from);
        const membres = meta.participants.map(p => p.id);
        if (membres.length < 2) return sendMsg(sock, from, "❌ Pas assez de membres!");
        const melange = [...membres].sort(() => Math.random()-0.5);
        const p1      = melange[0];
        const p2      = melange[1];
        await sock.sendMessage(from, {
          text: `💑 *COUPLE DU JOUR:*\n\n❤️ @${p1.replace("@s.whatsapp.net","")} + @${p2.replace("@s.whatsapp.net","")}\n\n_Compatibilité: *${Math.floor(Math.random()*40)+60}%* 💘_`,
          mentions: [p1, p2],
        });
      } catch {
        await sendMsg(sock, from, "❌ Erreur couple.");
      }
    }

    else if (cmd === "profil") {
      const roles = ["🥷 Ninja silencieux","⚔️ Guerrier redoutable","🌟 Star du groupe","🧠 Génie incompris","😂 Comique officiel","👑 Chef en devenir"];
      const humeurs = ["😊 Bonne humeur","😴 Fatigué(e)","🔥 En feu","🌙 Rêveur(se)","⚡ Énergique"];
      await sendMsg(sock, from,
        `👤 *TON PROFIL:*\n\n📱 Numéro: *+${senderNum}*\n🎭 Rôle: *${rand(roles)}*\n💫 Humeur: *${rand(humeurs)}*\n⭐ Score: *${Math.floor(Math.random()*5000)+100} pts*\n🏆 Rang: *${Math.floor(Math.random()*100)+1}ème*\n📅 ${getDate()}`);
    }

    else if (cmd === "duel") {
      if (!isGroup) return sendMsg(sock, from, "❌ Groupe uniquement!");
      if (!mentionné) return sendMsg(sock, from, `⚔️ Usage: *${PREFIX}duel @membre*`);
      const ptsA = Math.floor(Math.random()*100)+1;
      const ptsB = Math.floor(Math.random()*100)+1;
      const numA = senderNum;
      const numB = mentionné.replace("@s.whatsapp.net","");
      const gagne = ptsA > ptsB ? `+${numA}` : `+${numB}`;
      const perdu = ptsA > ptsB ? `+${numB}` : `+${numA}`;
      const bar = n => "█".repeat(Math.floor(n/10))+"░".repeat(10-Math.floor(n/10));
      await sock.sendMessage(from, {
        text: `⚔️ *══ DUEL ══*\n\n🥷 @${numA}\n${bar(ptsA)} *${ptsA}pts*\n\n🥷 @${numB}\n${bar(ptsB)} *${ptsB}pts*\n\n🏆 *Gagnant: ${gagne}* 🎉\n💀 *Perdant: ${perdu}*`,
        mentions: [sender, mentionné],
      });
    }

    else if (cmd === "pfc") {
      const valides = ["pierre","feuille","ciseaux"];
      const choix   = texte.toLowerCase().trim();
      if (!valides.includes(choix)) return sendMsg(sock, from,
        `✊ Usage: *${PREFIX}pfc [pierre/feuille/ciseaux]*`);
      const bot    = rand(valides);
      const emojis = { pierre:"✊", feuille:"✋", ciseaux:"✌️" };
      let res;
      if (choix === bot) res = "🤝 *ÉGALITÉ!*";
      else if (
        (choix==="pierre" && bot==="ciseaux")||
        (choix==="feuille" && bot==="pierre")||
        (choix==="ciseaux" && bot==="feuille")
      ) res = "🏆 *VICTOIRE!* Tu as gagné!";
      else res = "💀 *DÉFAITE!* Le bot est trop fort!";
      await sendMsg(sock, from,
        `${emojis[choix]} *PFC:*\n\n👤 Toi: *${choix} ${emojis[choix]}*\n🤖 Bot: *${bot} ${emojis[bot]}*\n\n${res}`);
    }

    else if (cmd === "emojimix") {
      const packs = [
        ["🔥","⚡","💫","🌟","✨","🎯","🏆","💎"],
        ["❤️","💙","💚","💛","🧡","💜","🖤","🤍"],
        ["😂","😎","🥷","👑","🦁","🐉","🦅","🌊"],
        ["🍀","🌹","🌺","🌸","🌻","🌼","🌷","🍁"],
      ];
      const pack = rand(packs);
      const mix  = Array.from({length:8}, () => rand(pack)).join("");
      await sendMsg(sock, from, `🎨 *EMOJI MIX:*\n\n${mix}\n\n${rand(pack).repeat(3)} IB-HEX-BOT ${rand(pack).repeat(3)}`);
    }

    else if (cmd === "goodnight") {
      const msgs = [
        "🌙 *Bonne nuit à tous!*\nQue vos rêves soient aussi beaux que vous! 😴⭐",
        "🌙 *Bonne nuit la famille!*\nReposez-vous bien, demain est une nouvelle journée! 🌟",
        "🌙 *Dors bien!*\nLes étoiles veillent sur toi cette nuit! ⭐💙",
      ];
      await sendMsg(sock, from, rand(msgs));
    }

    else if (cmd === "anime") {
      const a = rand(ANIME_LIST);
      await sendMsg(sock, from,
        `🎌 *ANIME:*\n\n📺 *${a.nom}*\n🎭 Genre: *${a.genre}*\n⭐ Note: *${a.note}*\n📝 ${a.desc}`);
    }

    // ════════════════════════════════════════════════
    //  🛠️ CATÉGORIE 3 — OUTILS
    // ════════════════════════════════════════════════

    else if (cmd === "calc") {
      if (!texte) return sendMsg(sock, from, `🔢 Usage: *${PREFIX}calc [expression]*`);
      try {
        const safe   = texte.replace(/[^0-9+\-*/%.() ]/g,"");
        if (!safe.trim()) return sendMsg(sock, from, "❌ Expression invalide!");
        const result = Function(`"use strict";return(${safe})`)();
        if (!isFinite(result)) return sendMsg(sock, from, "❌ Résultat invalide!");
        await sendMsg(sock, from, `🔢 *CALCULATRICE:*\n\n📝 \`${texte}\`\n✅ = *${result}*`);
      } catch {
        await sendMsg(sock, from, "❌ Expression mathématique invalide!");
      }
    }

    else if (cmd === "heure") {
      await sendMsg(sock, from, `🕐 *Heure (Conakry):*\n\n⏰ *${getTime()}*`);
    }

    else if (cmd === "date") {
      const d = new Date().toLocaleDateString("fr-FR", {
        weekday:"long", year:"numeric", month:"long", day:"numeric",
        timeZone:"Africa/Conakry"
      });
      await sendMsg(sock, from, `📅 *Date:*\n\n📆 *${d.charAt(0).toUpperCase()+d.slice(1)}*`);
    }

    else if (cmd === "meteo") {
      const ville = texte || "Conakry";
      try {
        const r = await axios.get(
          `https://wttr.in/${encodeURIComponent(ville)}?format=j1`, { timeout:10000 });
        const cur   = r.data.current_condition[0];
        const desc  = cur.lang_fr?.[0]?.value || cur.weatherDesc[0].value;
        await sendMsg(sock, from,
          `🌤️ *MÉTÉO — ${ville.toUpperCase()}:*\n\n🌡️ Temp: *${cur.temp_C}°C*\n🤔 Ressenti: *${cur.FeelsLikeC}°C*\n💧 Humidité: *${cur.humidity}%*\n💨 Vent: *${cur.windspeedKmph} km/h*\n☁️ *${desc}*\n\n📅 ${getDate()}`);
      } catch {
        await sendMsg(sock, from, `❌ Météo indisponible pour "${ville}".`);
      }
    }

    else if (cmd === "wiki") {
      if (!texte) return sendMsg(sock, from, `📚 Usage: *${PREFIX}wiki [sujet]*`);
      try {
        const r  = await axios.get(
          `https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(texte)}`,
          { timeout:10000 });
        const d  = r.data;
        const ex = d.extract
          ? (d.extract.length > 600 ? d.extract.slice(0,600)+"..." : d.extract)
          : "Aucune description.";
        await sendMsg(sock, from,
          `📚 *WIKIPEDIA — ${d.title||texte}:*\n\n${ex}\n\n🔗 ${d.content_urls?.mobile?.page||""}`);
      } catch {
        await sendMsg(sock, from, `❌ Aucun résultat pour "${texte}".`);
      }
    }

    else if (cmd === "crypto") {
      const alias = { btc:"bitcoin", eth:"ethereum", bnb:"binancecoin",
        doge:"dogecoin", sol:"solana", ada:"cardano", xrp:"ripple",
        ltc:"litecoin", matic:"matic-network", shib:"shiba-inu" };
      const coin = texte.toLowerCase() || "bitcoin";
      const id   = alias[coin] || coin;
      try {
        const r = await axios.get(
          `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd,eur&include_24hr_change=true`,
          { timeout:10000 });
        const d = r.data[id];
        if (!d) return sendMsg(sock, from, `❌ "${coin}" introuvable!`);
        const change = d.usd_24h_change?.toFixed(2);
        await sendMsg(sock, from,
          `💰 *${coin.toUpperCase()}:*\n\n💵 *$${d.usd?.toLocaleString()}*\n💶 *€${d.eur?.toLocaleString()}*\n${change>0?"📈":"📉"} 24h: *${change}%*`);
      } catch {
        await sendMsg(sock, from, "❌ Service crypto indisponible.");
      }
    }

    else if (cmd === "morse") {
      if (!texte) return sendMsg(sock, from, `📡 Usage: *${PREFIX}morse [texte]*`);
      const table = {
        a:".-",b:"-...",c:"-.-.",d:"-..",e:".",f:"..-.",g:"--.",h:"....",
        i:"..",j:".---",k:"-.-",l:".-..",m:"--",n:"-.",o:"---",p:".--.",
        q:"--.-",r:".-.",s:"...",t:"-",u:"..-",v:"...-",w:".--",x:"-..-",
        y:"-.--",z:"--..",
        "0":"-----","1":".----","2":"..---","3":"...--","4":"....-",
        "5":".....","6":"-....","7":"--...","8":"---..","9":"----."," ":"/"
      };
      const morse = texte.toLowerCase().split("").map(c => table[c]||"?").join(" ");
      await sendMsg(sock, from, `📡 *MORSE:*\n\n📝 _${texte}_\n📡 \`${morse}\``);
    }

    else if (cmd === "random") {
      const max = Math.min(parseInt(texte)||100, 1000000);
      await sendMsg(sock, from,
        `🎲 *Nombre aléatoire (1-${max}):*\n\n🎯 *${Math.floor(Math.random()*max)+1}*`);
    }

    else if (cmd === "pile") {
      const res = Math.random() < 0.5;
      await sendMsg(sock, from, `🪙 *PILE OU FACE:*\n\n${res ? "🟡 *PILE!*" : "⚪ *FACE!*"}`);
    }

    else if (cmd === "des") {
      const nb    = Math.min(parseInt(texte)||1, 5);
      const faces = ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣"];
      const jets  = Array.from({length:nb}, () => Math.floor(Math.random()*6));
      const total = jets.reduce((a,b) => a+b+1, 0);
      await sendMsg(sock, from,
        `🎲 *DÉ${nb>1?"S":""}:*\n\n${jets.map(j=>faces[j]).join("  ")}\n${nb>1?`\n➕ Total: *${total}*`:""}`);
    }

    else if (cmd === "url") {
      if (!texte) return sendMsg(sock, from, `🔗 Usage: *${PREFIX}url [lien]*`);
      const isUrl = /^https?:\/\//i.test(texte);
      await sendMsg(sock, from,
        `🔗 *INFOS URL:*\n\n🌐 Lien: ${texte}\n✅ Format valide: *${isUrl?"Oui":"Non"}*\n📋 Longueur: *${texte.length} caractères*\n\n_Copiez et partagez ce lien!_`);
    }

    else if (cmd === "faitinsolite") {
      await sendMsg(sock, from, `🤯 *FAIT INSOLITE:*\n\n${rand(FAITS)}`);
    }

    // ════════════════════════════════════════════════
    //  👥 CATÉGORIE 4 — GROUPE
    // ════════════════════════════════════════════════

    else if (cmd === "ginfo") {
      if (!isGroup) return sendMsg(sock, from, "❌ Groupe uniquement!");
      try {
        const meta   = await sock.groupMetadata(from);
        const admins = meta.participants.filter(p => p.admin).length;
        await sendMsg(sock, from,
          `👥 *INFOS GROUPE:*\n\n📛 *${meta.subject}*\n👤 Membres: *${meta.participants.length}*\n👑 Admins: *${admins}*\n📅 Créé: *${new Date(meta.creation*1000).toLocaleDateString("fr-FR")}*\n📝 _${meta.desc||"Pas de description"}_`);
      } catch {
        await sendMsg(sock, from, "❌ Impossible de récupérer les infos.");
      }
    }

    else if (cmd === "regles") {
      await sendMsg(sock, from,
        `📜 *RÈGLES DU GROUPE:*\n\n1️⃣ Respectez tous les membres\n2️⃣ Zéro insulte ou discrimination\n3️⃣ Pas de spam ni de pub non autorisée\n4️⃣ Contenu positif uniquement\n5️⃣ Respectez la vie privée de chacun\n6️⃣ Conflits réglés en privé\n7️⃣ Pas de contenu choquant\n8️⃣ Non-respect = exclusion ⚠️`);
    }

    else if (cmd === "tagall") {
      if (!isGroup) return sendMsg(sock, from, "❌ Groupe uniquement!");
      const admin = await isAdmin(sock, from, sender);
      if (!admin) return sendMsg(sock, from, "❌ Réservé aux admins!");
      try {
        const meta    = await sock.groupMetadata(from);
        const membres = meta.participants.map(p => p.id);
        const tags    = membres.map(m => `@${m.replace("@s.whatsapp.net","")}`).join(" ");
        await sock.sendMessage(from, {
          text: `📢 *${texte||"Attention tout le monde!"}*\n\n${tags}`,
          mentions: membres,
        });
      } catch {
        await sendMsg(sock, from, "❌ Erreur tagall.");
      }
    }

    else if (cmd === "tagadmin") {
      if (!isGroup) return sendMsg(sock, from, "❌ Groupe uniquement!");
      try {
        const meta   = await sock.groupMetadata(from);
        const admins = meta.participants.filter(p => p.admin).map(p => p.id);
        if (!admins.length) return sendMsg(sock, from, "❌ Aucun admin trouvé!");
        const tags = admins.map(a => `@${a.replace("@s.whatsapp.net","")}`).join(" ");
        await sock.sendMessage(from, {
          text: `👑 *${texte||"Attention les admins!"}*\n\n${tags}`,
          mentions: admins,
        });
      } catch {
        await sendMsg(sock, from, "❌ Erreur tagadmin.");
      }
    }

    else if (cmd === "getall") {
      if (!isGroup) return sendMsg(sock, from, "❌ Groupe uniquement!");
      try {
        const meta    = await sock.groupMetadata(from);
        const admins  = meta.participants.filter(p => p.admin);
        const simples = meta.participants.filter(p => !p.admin);
        let liste = `👥 *MEMBRES (${meta.participants.length}):*\n\n👑 *ADMINS (${admins.length}):*\n`;
        admins.forEach((a,i) => {
          liste += `${i+1}. +${a.id.replace("@s.whatsapp.net","")}\n`;
        });
        liste += `\n👤 *MEMBRES (${simples.length}):*\n`;
        simples.slice(0,20).forEach((m,i) => {
          liste += `${i+1}. +${m.id.replace("@s.whatsapp.net","")}\n`;
        });
        if (simples.length > 20) liste += `_...et ${simples.length-20} autres._`;
        await sendMsg(sock, from, liste);
      } catch {
        await sendMsg(sock, from, "❌ Impossible de récupérer les membres.");
      }
    }

    else if (cmd === "kick") {
      if (!isGroup) return sendMsg(sock, from, "❌ Groupe uniquement!");
      const admin = await isAdmin(sock, from, sender);
      if (!admin) return sendMsg(sock, from, "❌ Réservé aux admins!");
      if (!mentionné) return sendMsg(sock, from, `❌ Usage: *${PREFIX}kick @membre*`);
      const botAdmin = await isBotAdmin(sock, from);
      if (!botAdmin) return sendMsg(sock, from, "❌ Le bot doit être admin!");
      try {
        await sock.groupParticipantsUpdate(from, [mentionné], "remove");
        await sendMsg(sock, from,
          `🚫 *Expulsé!*\n\n+${mentionné.replace("@s.whatsapp.net","")} a quitté le groupe.`);
      } catch {
        await sendMsg(sock, from, "❌ Impossible d'expulser.");
      }
    }

    else if (cmd === "kickall") {
      if (!isGroup) return sendMsg(sock, from, "❌ Groupe uniquement!");
      const admin = await isAdmin(sock, from, sender);
      if (!admin) return sendMsg(sock, from, "❌ Réservé aux admins!");
      const botAdmin = await isBotAdmin(sock, from);
      if (!botAdmin) return sendMsg(sock, from, "❌ Le bot doit être admin!");
      try {
        const meta    = await sock.groupMetadata(from);
        const botNum  = sock.user.id.split(":")[0];
        const membres = meta.participants.filter(p =>
          !p.admin && !p.id.includes(botNum) && !p.id.includes(OWNER)
        ).map(p => p.id);
        if (!membres.length) return sendMsg(sock, from, "❌ Aucun membre à expulser!");
        await sendMsg(sock, from, `⚠️ *KICKALL EN COURS...*\n🚫 Expulsion de *${membres.length}* membres...`);
        for (const m of membres) {
          await sock.groupParticipantsUpdate(from, [m], "remove");
          await new Promise(r => setTimeout(r, 1000));
        }
        await sendMsg(sock, from, `✅ *KICKALL TERMINÉ!*\n🚫 *${membres.length}* membres expulsés.`);
      } catch {
        await sendMsg(sock, from, "❌ Erreur kickall.");
      }
    }

    else if (cmd === "add") {
      if (!isGroup) return sendMsg(sock, from, "❌ Groupe uniquement!");
      const admin = await isAdmin(sock, from, sender);
      if (!admin) return sendMsg(sock, from, "❌ Réservé aux admins!");
      const botAdmin = await isBotAdmin(sock, from);
      if (!botAdmin) return sendMsg(sock, from, "❌ Le bot doit être admin!");
      if (!texte) return sendMsg(sock, from, `➕ Usage: *${PREFIX}add [numéro]*\nEx: ${PREFIX}add 224621963059`);
      const numero = texte.replace(/[^0-9]/g,"");
      if (numero.length < 8) return sendMsg(sock, from, "❌ Numéro invalide!");
      try {
        await sock.groupParticipantsUpdate(from, [`${numero}@s.whatsapp.net`], "add");
        await sendMsg(sock, from, `✅ *+${numero} ajouté au groupe!* 🎉`);
      } catch {
        await sendMsg(sock, from, `❌ Impossible d'ajouter +${numero}.`);
      }
    }

    else if (cmd === "promote") {
      if (!isGroup) return sendMsg(sock, from, "❌ Groupe uniquement!");
      const admin = await isAdmin(sock, from, sender);
      if (!admin) return sendMsg(sock, from, "❌ Réservé aux admins!");
      if (!mentionné) return sendMsg(sock, from, `❌ Usage: *${PREFIX}promote @membre*`);
      try {
        await sock.groupParticipantsUpdate(from, [mentionné], "promote");
        await sock.sendMessage(from, {
          text: `⬆️ *@${mentionné.replace("@s.whatsapp.net","")} est maintenant admin!* 👑`,
          mentions: [mentionné],
        });
      } catch {
        await sendMsg(sock, from, "❌ Impossible de promouvoir.");
      }
    }

    else if (cmd === "demote") {
      if (!isGroup) return sendMsg(sock, from, "❌ Groupe uniquement!");
      const admin = await isAdmin(sock, from, sender);
      if (!admin) return sendMsg(sock, from, "❌ Réservé aux admins!");
      if (!mentionné) return sendMsg(sock, from, `❌ Usage: *${PREFIX}demote @membre*`);
      try {
        await sock.groupParticipantsUpdate(from, [mentionné], "demote");
        await sock.sendMessage(from, {
          text: `⬇️ *@${mentionné.replace("@s.whatsapp.net","")} n'est plus admin.*`,
          mentions: [mentionné],
        });
      } catch {
        await sendMsg(sock, from, "❌ Impossible de rétrograder.");
      }
    }

    else if (cmd === "groupopen") {
      if (!isGroup) return sendMsg(sock, from, "❌ Groupe uniquement!");
      const admin = await isAdmin(sock, from, sender);
      if (!admin) return sendMsg(sock, from, "❌ Réservé aux admins!");
      try {
        await sock.groupSettingUpdate(from, "not_announcement");
        await sendMsg(sock, from, `🔓 *GROUPE OUVERT!*\nTout le monde peut envoyer des messages. ✅`);
      } catch {
        await sendMsg(sock, from, "❌ Erreur — Le bot doit être admin.");
      }
    }

    else if (cmd === "groupclose") {
      if (!isGroup) return sendMsg(sock, from, "❌ Groupe uniquement!");
      const admin = await isAdmin(sock, from, sender);
      if (!admin) return sendMsg(sock, from, "❌ Réservé aux admins!");
      try {
        await sock.groupSettingUpdate(from, "announcement");
        await sendMsg(sock, from, `🔒 *GROUPE FERMÉ!*\nSeuls les admins peuvent envoyer des messages. 🚫`);
      } catch {
        await sendMsg(sock, from, "❌ Erreur — Le bot doit être admin.");
      }
    }

    else if (cmd === "linkgc") {
      if (!isGroup) return sendMsg(sock, from, "❌ Groupe uniquement!");
      const admin = await isAdmin(sock, from, sender);
      if (!admin) return sendMsg(sock, from, "❌ Réservé aux admins!");
      try {
        const code = await sock.groupInviteCode(from);
        await sendMsg(sock, from,
          `🔗 *LIEN DU GROUPE:*\n\nhttps://chat.whatsapp.com/${code}\n\n⚠️ _Partagez avec précaution!_`);
      } catch {
        await sendMsg(sock, from, "❌ Impossible de récupérer le lien.");
      }
    }

    else if (cmd === "vcf") {
      if (!isGroup) return sendMsg(sock, from, "❌ Groupe uniquement!");
      const admin = await isAdmin(sock, from, sender);
      if (!admin) return sendMsg(sock, from, "❌ Réservé aux admins!");
      try {
        const meta    = await sock.groupMetadata(from);
        const membres = meta.participants;
        let vcf = "";
        membres.forEach((m, i) => {
          const num = m.id.replace("@s.whatsapp.net","");
          vcf += `BEGIN:VCARD\nVERSION:3.0\nFN:Membre ${i+1}\nTEL;TYPE=CELL:+${num}\nEND:VCARD\n`;
        });
        await sock.sendMessage(from, {
          document: Buffer.from(vcf, "utf-8"),
          mimetype: "text/vcard",
          fileName: `membres.vcf`,
          caption:  `📇 *${membres.length} contacts exportés!*`,
        });
      } catch {
        await sendMsg(sock, from, "❌ Erreur VCF.");
      }
    }

    else if (cmd === "poll") {
      if (!texte) return sendMsg(sock, from,
        `📊 Usage: *${PREFIX}poll Question|Choix1|Choix2|Choix3*\nEx: ${PREFIX}poll Vous aimez le bot?|Oui|Non|Peut-être`);
      const parts   = texte.split("|");
      const question = parts[0]?.trim();
      const choices  = parts.slice(1).map(c => c.trim()).filter(Boolean);
      if (!question || choices.length < 2)
        return sendMsg(sock, from, "❌ Format: *Question|Choix1|Choix2*");
      try {
        await sock.sendMessage(from, {
          poll: {
            name: question,
            values: choices.slice(0, 12),
            selectableCount: 1,
          },
        });
      } catch {
        // Fallback sondage texte
        const opts = choices.map((c,i) => `${["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣"][i]||`${i+1}.`} ${c}`).join("\n");
        await sendMsg(sock, from, `📊 *SONDAGE:*\n\n❓ ${question}\n\n${opts}`);
      }
    }

    else if (cmd === "sondage") {
      if (!texte) return sendMsg(sock, from,
        `📊 Usage: *${PREFIX}sondage [question]*`);
      await sendMsg(sock, from,
        `📊 *SONDAGE:*\n\n❓ *${texte}*\n\n👍 *OUI* — vous êtes pour\n👎 *NON* — vous êtes contre\n🤔 *NSP* — je ne sais pas\n\n_Votez maintenant!_ 🗳️`);
    }

    else if (cmd === "antilink") {
      if (!isGroup) return sendMsg(sock, from, "❌ Groupe uniquement!");
      const admin = await isAdmin(sock, from, sender);
      if (!admin) return sendMsg(sock, from, "❌ Réservé aux admins!");
      const opt = texte.toLowerCase();
      if (opt === "on") {
        antiLinkGroups.add(from);
        await sendMsg(sock, from, `🔗 *ANTI-LIEN ACTIVÉ!* ✅\nLes liens seront supprimés automatiquement.`);
      } else if (opt === "off") {
        antiLinkGroups.delete(from);
        await sendMsg(sock, from, `🔗 *ANTI-LIEN DÉSACTIVÉ!* ❌`);
      } else {
        await sendMsg(sock, from, `🔗 Usage: *${PREFIX}antilink on/off*`);
      }
    }

    else if (cmd === "antisticker") {
      if (!isGroup) return sendMsg(sock, from, "❌ Groupe uniquement!");
      const admin = await isAdmin(sock, from, sender);
      if (!admin) return sendMsg(sock, from, "❌ Réservé aux admins!");
      const opt = texte.toLowerCase();
      if (opt === "on") {
        antiStickerGroups.add(from);
        await sendMsg(sock, from, `🎭 *ANTI-STICKER ACTIVÉ!* ✅`);
      } else if (opt === "off") {
        antiStickerGroups.delete(from);
        await sendMsg(sock, from, `🎭 *ANTI-STICKER DÉSACTIVÉ!* ❌`);
      } else {
        await sendMsg(sock, from, `🎭 Usage: *${PREFIX}antisticker on/off*`);
      }
    }

    else if (cmd === "antigm") {
      if (!isGroup) return sendMsg(sock, from, "❌ Groupe uniquement!");
      const admin = await isAdmin(sock, from, sender);
      if (!admin) return sendMsg(sock, from, "❌ Réservé aux admins!");
      const opt = texte.toLowerCase();
      if (opt === "on") {
        antiGmGroups.add(from);
        await sendMsg(sock, from, `🔔 *ANTI-MENTION ACTIVÉ!* ✅`);
      } else if (opt === "off") {
        antiGmGroups.delete(from);
        await sendMsg(sock, from, `🔔 *ANTI-MENTION DÉSACTIVÉ!* ❌`);
      } else {
        await sendMsg(sock, from, `🔔 Usage: *${PREFIX}antigm on/off*`);
      }
    }

    else if (cmd === "wcg") {
      if (!isGroup) return sendMsg(sock, from, "❌ Groupe uniquement!");
      try {
        const meta    = await sock.groupMetadata(from);
        const membres = meta.participants.map(p => p.id);
        const top     = [...membres].sort(() => Math.random()-0.5).slice(0, Math.min(5,membres.length));
        const medals  = ["🥇","🥈","🥉","4️⃣","5️⃣"];
        const lignes  = top.map((m,i) => {
          const pts = Math.floor(Math.random()*9000)+1000;
          return `${medals[i]} @${m.replace("@s.whatsapp.net","")} — *${pts.toLocaleString()} pts*`;
        }).join("\n");
        await sock.sendMessage(from, {
          text: `🏆 *══ CLASSEMENT ══*\n\n${lignes}\n\n_Jouez pour grimper!_ 🎮`,
          mentions: top,
        });
      } catch {
        await sendMsg(sock, from, "❌ Erreur classement.");
      }
    }

    else if (cmd === "bataille") {
      if (!isGroup) return sendMsg(sock, from, "❌ Groupe uniquement!");
      const atk   = Math.floor(Math.random()*60)+20;
      const def   = Math.floor(Math.random()*60)+20;
      const bot   = Math.floor(Math.random()*100)+20;
      const total = atk + def;
      const gagne = total > bot;
      const bar = (n,max=120) => {
        const p = Math.min(Math.floor((n/max)*10),10);
        return "🟩".repeat(p)+"⬜".repeat(10-p);
      };
      await sendMsg(sock, from,
        `⚔️ *BATAILLE:*\n\n👤 Toi:\n⚔️ ${atk} | 🛡️ ${def}\n${bar(total)} ${total}pts\n\n🤖 Bot:\n💪 ${bot}\n${bar(bot)} ${bot}pts\n\n${gagne?"🏆 *VICTOIRE!* 🎉":"💀 *DÉFAITE!* 😈"}`);
    }

    else if (cmd === "defi") {
      const defis = [
        "💪 Fais 20 pompes et reviens confirmer!",
        "🎤 Envoie un vocal avec ta meilleure imitation!",
        "😂 Raconte la blague la plus nulle que tu connais!",
        "🌟 Fais 3 compliments sincères à 3 membres!",
        "🎮 Défie quelqu'un avec *Ibduel @membre*!",
        "🧠 Pose une question difficile au groupe!",
        "🕺 Décris ta danse en 3 emojis seulement!",
        "🎯 Devine un chiffre entre 1 et 100!",
      ];
      await sendMsg(sock, from, `🎯 *DÉFI:*\n\n${rand(defis)}\n\n_Tu acceptes?_ 💪`);
    }

    // ════════════════════════════════════════════════
    //  🎨 CATÉGORIE 5 — MÉDIAS & CRÉATIF
    // ════════════════════════════════════════════════

    else if (cmd === "sticker") {
      const quoted2 = msg.message?.extendedTextMessage?.contextInfo;
      const imgMsg  = quoted2?.quotedMessage?.imageMessage ||
                      quoted2?.quotedMessage?.videoMessage ||
                      msg.message?.imageMessage;
      if (!imgMsg) return sendMsg(sock, from,
        `🖼️ *Usage:*\nRéponds à une image avec *${PREFIX}sticker* pour créer un sticker!`);
      try {
        await sendMsg(sock, from, "⏳ Création du sticker...");
        const buffer = await downloadMediaMessage(
          quoted2 ? {
            key: { ...msg.key, id: quoted2.stanzaId },
            message: quoted2.quotedMessage,
          } : msg,
          "buffer", {}
        );
        await sock.sendMessage(from, {
          sticker: buffer,
        });
      } catch {
        await sendMsg(sock, from, "❌ Erreur lors de la création du sticker. Réessayez avec une image.");
      }
    }

    else if (cmd === "toimage") {
      const quoted2   = msg.message?.extendedTextMessage?.contextInfo;
      const stickerMsg = quoted2?.quotedMessage?.stickerMessage;
      if (!stickerMsg) return sendMsg(sock, from,
        `🖼️ *Usage:*\nRéponds à un sticker avec *${PREFIX}toimage* pour le convertir en image!`);
      try {
        const buffer = await downloadMediaMessage(
          {
            key: { ...msg.key, id: quoted2.stanzaId },
            message: quoted2.quotedMessage,
          },
          "buffer", {}
        );
        await sock.sendMessage(from, {
          image: buffer,
          caption: "🖼️ *Sticker converti en image!*",
        });
      } catch {
        await sendMsg(sock, from, "❌ Erreur conversion. Réessayez.");
      }
    }

    else if (cmd === "getpp") {
      const cible = mentionné || `${senderNum}@s.whatsapp.net`;
      const num   = cible.replace("@s.whatsapp.net","");
      try {
        const pp = await sock.profilePictureUrl(cible, "image");
        await sock.sendMessage(from, {
          image: { url: pp },
          caption: `🖼️ *Photo de profil de +${num}*`,
        });
      } catch {
        await sendMsg(sock, from,
          `❌ Aucune photo de profil visible pour *+${num}*.\n_(Profil privé ou pas de photo)_`);
      }
    }

    else if (cmd === "gimage") {
      if (!texte) return sendMsg(sock, from,
        `🖼️ Usage: *${PREFIX}gimage [recherche]*\nEx: ${PREFIX}gimage paysage Guinée`);
      try {
        const r = await axios.get(
          `https://api.unsplash.com/photos/random?query=${encodeURIComponent(texte)}&client_id=YOUR_UNSPLASH_KEY`,
          { timeout: 10000 }
        );
        const url = r.data?.urls?.regular;
        if (!url) throw new Error("Pas d'image");
        await sock.sendMessage(from, {
          image: { url },
          caption: `🖼️ *Image: "${texte}"*\n📸 Source: Unsplash`,
        });
      } catch {
        // Fallback avec picsum
        const seed = encodeURIComponent(texte);
        const url  = `https://picsum.photos/seed/${seed}/800/600`;
        await sock.sendMessage(from, {
          image: { url },
          caption: `🖼️ *Image aléatoire pour: "${texte}"*`,
        });
      }
    }

    else if (cmd === "take") {
      const quoted2 = msg.message?.extendedTextMessage?.contextInfo;
      if (!quoted2?.quotedMessage) return sendMsg(sock, from,
        `📥 *Usage:*\nRéponds à un média avec *${PREFIX}take* pour le récupérer!`);
      const qmsg    = quoted2.quotedMessage;
      const qtype   = Object.keys(qmsg)[0];
      const mediaTypes = ["imageMessage","videoMessage","audioMessage","documentMessage","stickerMessage"];
      if (!mediaTypes.includes(qtype)) return sendMsg(sock, from,
        "❌ Ce type de message ne peut pas être récupéré!");
      try {
        const buffer = await downloadMediaMessage(
          {
            key: { ...msg.key, id: quoted2.stanzaId },
            message: qmsg,
          },
          "buffer", {}
        );
        const mimeMap = {
          imageMessage:    { image:buffer, caption:"📥 *Image récupérée!*" },
          videoMessage:    { video:buffer, caption:"📥 *Vidéo récupérée!*" },
          audioMessage:    { audio:buffer, mimetype:"audio/mp4" },
          stickerMessage:  { sticker:buffer },
          documentMessage: { document:buffer, mimetype:"application/octet-stream", fileName:"fichier" },
        };
        await sock.sendMessage(from, mimeMap[qtype]);
      } catch {
        await sendMsg(sock, from, "❌ Erreur lors de la récupération du média.");
      }
    }

    else if (cmd === "fancy") {
      if (!texte) return sendMsg(sock, from, `✨ Usage: *${PREFIX}fancy [texte]*`);
      try {
        const bold   = FANCY_STYLES.bold(texte);
        const italic = FANCY_STYLES.italic(texte);
        await sendMsg(sock, from,
          `✨ *TEXTE STYLÉ:*\n\n𝗚𝗿𝗮𝘀: ${bold}\n𝐼𝑡𝑎𝑙𝑖𝑞𝑢𝑒: ${italic}\n★彡 ${texte} 彡★\n⚡【 ${texte.toUpperCase()} 】⚡\n🥷『 ${texte} 』🥷`);
      } catch {
        await sendMsg(sock, from,
          `✨ *TEXTE STYLÉ:*\n\n★彡 ${texte} 彡★\n⚡【 ${texte.toUpperCase()} 】⚡\n🥷『 ${texte} 』🥷`);
      }
    }

    else if (cmd === "encadrer") {
      if (!texte) return sendMsg(sock, from, `🖼️ Usage: *${PREFIX}encadrer [texte]*`);
      const l = texte.length + 4;
      await sendMsg(sock, from, `╔${"═".repeat(l)}╗\n║  ${texte}  ║\n╚${"═".repeat(l)}╝`);
    }

    else if (cmd === "styliser") {
      if (!texte) return sendMsg(sock, from, `✨ Usage: *${PREFIX}styliser [texte]*`);
      await sendMsg(sock, from,
        `✨ *STYLES:*\n\n★彡 ${texte} 彡★\n⚡【 ${texte.toUpperCase()} 】⚡\n🥷『 ${texte} 』🥷\n╔══❮ ${texte} ❯══╗\n✦✦ ${texte} ✦✦`);
    }

    else if (cmd === "invertir") {
      if (!texte) return sendMsg(sock, from, `🔄 Usage: *${PREFIX}invertir [texte]*`);
      await sendMsg(sock, from,
        `🔄 *INVERSÉ:*\n\n📝 _${texte}_\n🔄 *${texte.split("").reverse().join("")}*`);
    }

    else if (cmd === "majuscule") {
      if (!texte) return sendMsg(sock, from, `🔠 Usage: *${PREFIX}majuscule [texte]*`);
      await sendMsg(sock, from, `🔠 *${texte.toUpperCase()}*`);
    }

    else if (cmd === "minuscule") {
      if (!texte) return sendMsg(sock, from, `🔡 Usage: *${PREFIX}minuscule [texte]*`);
      await sendMsg(sock, from, `🔡 ${texte.toLowerCase()}`);
    }

    else if (cmd === "compter") {
      if (!texte) return sendMsg(sock, from, `📊 Usage: *${PREFIX}compter [texte]*`);
      const mots    = texte.trim().split(/\s+/).filter(Boolean).length;
      const phrases = (texte.match(/[.!?]+/g)||[]).length;
      await sendMsg(sock, from,
        `📊 *ANALYSE:*\n\n🔤 Caractères: *${texte.length}*\n📌 Sans espaces: *${texte.replace(/\s/g,"").length}*\n💬 Mots: *${mots}*\n📄 Phrases: *${phrases||1}*`);
    }

    else if (cmd === "repeter") {
      const nb  = Math.min(parseInt(args[0])||3, 15);
      const txt = args.slice(1).join(" ");
      if (!txt || isNaN(parseInt(args[0]))) return sendMsg(sock, from,
        `🔁 Usage: *${PREFIX}repeter [nombre] [texte]*`);
      await sendMsg(sock, from, `🔁 *x${nb}:*\n\n${Array(nb).fill(txt).join("\n")}`);
    }

    else if (cmd === "ascii") {
      if (!texte) return sendMsg(sock, from, `🎨 Usage: *${PREFIX}ascii [texte]*`);
      await sendMsg(sock, from,
        `🎨 *ART ASCII:*\n\n◆ ${texte.toUpperCase().split("").join(" ◆ ")} ◆\n\n${"═".repeat(20)}\n🥷 ${texte.toUpperCase()} 🥷\n${"═".repeat(20)}`);
    }

    else if (cmd === "attp") {
      if (!texte) return sendMsg(sock, from,
        `🎨 Usage: *${PREFIX}attp [texte]*\nEx: ${PREFIX}attp IB-HEX-BOT`);
      try {
        const url    = `https://api.dreamsands.tech/api/attp?text=${encodeURIComponent(texte)}`;
        const r      = await axios.get(url, { responseType:"arraybuffer", timeout:15000 });
        await sock.sendMessage(from, {
          sticker: Buffer.from(r.data),
        });
      } catch {
        // Fallback: envoi image texte via placeholder
        await sendMsg(sock, from,
          `✏️ *Texte en Sticker:*\n\n🎨 *${texte}*\n\n_⚠️ Serveur ATTP indisponible. Réessayez plus tard._`);
      }
    }

    // ── COMMANDE INCONNUE ────────────────────────
    else {
      await sendMsg(sock, from,
        `❓ Commande *${PREFIX}${cmd}* introuvable!\n\nTapez *${PREFIX}menu* pour voir toutes les commandes. 😊`);
    }
  });
}

startBot().catch(console.error);
