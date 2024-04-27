require('./config')
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, generateForwardMessageContent, prepareWAMessageMedia, generateWAMessageFromContent, generateMessageID, downloadContentFromMessage, makeInMemoryStore, jidDecode, getAggregateVotesInPollMessage, proto } = require("@whiskeysockets/baileys")
const fs = require('fs')
const pino = require('pino')
const chalk = require('chalk')
const path = require('path')
const readline = require("readline");
const axios = require('axios')
const FileType = require('file-type')
const yargs = require('yargs/yargs')
const _ = require('lodash')
const { Boom } = require('@hapi/boom')
const moment = require('moment-timezone')
const PhoneNumber = require('awesome-phonenumber')
const figlet = require("figlet")
const usePairingCode = true
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/exif')
const { smsg, isUrl, generateMessageTag, getBuffer, getSizeMedia, fetchJson, await, sleep } = require('./lib/myfunc')
const question = (text) => {
  const rl = readline.createInterface({
input: process.stdin,
output: process.stdout
  });
  return new Promise((resolve) => {
rl.question(text, resolve)
  })
};

var low
try {
  low = require('lowdb')
} catch (e) {
  low = require('./lib/lowdb')
}

const { Low, JSONFile } = low
const mongoDB = require('./lib/mongoDB')

const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) })
const color = (text, color) => {
    return !color ? chalk.green(text) : chalk.keyword(color)(text)
}

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
global.db = new Low(
  /https?:\/\//.test(opts['db'] || '') ?
    new cloudDBAdapter(opts['db']) : /mongodb/.test(opts['db']) ?
      new mongoDB(opts['db']) :
      new JSONFile(`src/database.json`)
)
global.DATABASE = global.db // Backwards Compatibility
global.loadDatabase = async function loadDatabase() {
  if (global.db.READ) return new Promise((resolve) => setInterval(function () { (!global.db.READ ? (clearInterval(this), resolve(global.db.data == null ? global.loadDatabase() : global.db.data)) : null) }, 1 * 1000))
  if (global.db.data !== null) return
  global.db.READ = true
  await global.db.read()
  global.db.READ = false
  global.db.data = {
users: {},
chats: {},
game: {},
database: {},
settings: {},
setting: {},
others: {},
sticker: {},
    ...(global.db.data || {})
  }
  global.db.chain = _.chain(global.db.data)
}
loadDatabase()

// save database every 30seconds
if (global.db) setInterval(async () => {
    if (global.db.data) await global.db.write()
  }, 30 * 1000)

console.log(color(figlet.textSync("yudamods", {
font: 'Standard',
horizontalLayout: 'default',
vertivalLayout: 'default',
width: 50,
whitespaceBreak: false
}), 'blue'))

async function connectToWhatsApp() {
const { state, saveCreds } = await useMultiFileAuthState(global.sessionName)
const yudamods = makeWASocket({
logger: pino({ level: "silent" }),
printQRInTerminal: !usePairingCode,
auth: state,
browser: ['Ubuntu', 'Chrome', "20.0.04"],
});
if(usePairingCode && !yudamods.authState.creds.registered) {
		const phoneNumber = await question('Masukan Nomor Yang Diawali Dengan 62 :\n');
		const code = await yudamods.requestPairingCode(phoneNumber.trim())
		console.log(`Pairing Code: ${code}`)

	}

yudamods.decodeJid = (jid) => {
if (!jid) return jid
if (/:\d+@/gi.test(jid)) {
let decode = jidDecode(jid) || {}
return decode.user && decode.server && decode.user + '@' + decode.server || jid
} else return jid
}

yudamods.ev.on('messages.upsert', async chatUpdate => {
try {
mek = chatUpdate.messages[0]
if (!mek.message) return
mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
if (mek.key && mek.key.remoteJid === 'status@broadcast') return
if (!yudamods.public && !mek.key.fromMe && chatUpdate.type === 'notify') return
if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return
m = smsg(yudamods, mek, store)
require("./yudamods")(yudamods, m, chatUpdate, store)
} catch (err) {
console.log(err)
}
})

yudamods.ev.on('call', async (celled) => {
let botNumber = await yudamods.decodeJid(yudamods.user.id)
let koloi = global.anticall
if (!koloi) return
console.log(celled)
for (let kopel of celled) {
if (kopel.isGroup == false) {
if (kopel.status == "offer") {
let nomer = await yudamods.sendTextWithMentions(kopel.from, `*${yudamods.user.name}* Tidak Menerima Panggilan ${kopel.isVideo ? `video` : `suara`}. Maaf @${kopel.from.split('@')[0]} Kamu Diblokir. Silahkan Hubungi Owner !`)
yudamods.sendContact(kopel.from, owner.map( i => i.split("@")[0]), nomer)
await sleep(8000)
await yudamods.updateBlockStatus(kopel.from, "block")
}
}
}
})

yudamods.ev.on('group-participants.update', async (anu) => {
//console.log(anu)
try {
let metadata = await yudamods.groupMetadata(anu.id)
let participants = anu.participants
for (let num of participants) {
// Get Profile Picture User
try {
ppuser = await yudamods.profilePictureUrl(num, 'image')
} catch {
ppuser = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60'
}

// Get Profile Picture Group
try {
ppgroup = await yudamods.profilePictureUrl(anu.id, 'image')
} catch {
ppgroup = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60'
}

if (anu.action == 'add') {
let a = `Selamat datang di grup ${metadata.subject}, semoga betah di grup ini yaa ${num.split("@")[0]}`
                    yudamods.sendMessage(anu.id, {
     text: a, 
      contextInfo: {
         externalAdReply: {
         title: `💬 Halo Selamat Datang`,
         body: `${ownername}`,
         thumbnailUrl: ppuser,
         sourceUrl: "https://instagram.com/yudamods",
         mediaType: 1,
         renderLargerThumbnail: true
    }}})
    await sleep(1000)
    yudamods.sendMessage(anu.id, { audio: fs.readFileSync('./mp3/welcome.mp3'), mimetype: 'audio/mp4', ptt: true, fileLength: 88738})
} else if (anu.action == 'yudamods2443417') {
let b = `👋*Selamat Tinggal* ${num.split("@")[0]} terimakasih telah singgah meski tak sungguh..

*Quote:*
_Jangan malu terlihat miskin, tapi malu lah di saat orang lain qunut dan kau malah sujud.._
*AP*`
yudamods.sendMessage(anu.id, {
     text: b, 
      contextInfo: {
         externalAdReply: {
         title: `💬 Selamat Tinggal`,
         body: `${ownername}`,
         thumbnailUrl: ppuser,
         sourceUrl: "https://instagram.com/yudamods",
         mediaType: 1,
         renderLargerThumbnail: true
    }}})
await sleep(1000)
yudamods.sendMessage(anu.id, { audio: fs.readFileSync('./mp3/sayonara.mp3'), mimetype: 'audio/mp4', ptt: true, fileLength: 88738})
} else if (anu.action == 'promote') {
yudamods.sendMessage(anu.id, { image: { url: ppuser }, mentions: [num], caption: `@${num.split('@')[0]} Ciee Jadi Admin Group ${metadata.subject}`})
} else if (anu.action == 'demote') {
yudamods.sendMessage(anu.id, { image: { url: ppuser }, mentions: [num], caption: `@${num.split('@')[0]} Wkwk Di Hapus Jadi Admin Group ${metadata.subject}`})
  }
}
} catch (err) {
console.log(err)
}
})

yudamods.ev.on('contacts.update', update => {
for (let contact of update) {
let id = yudamods.decodeJid(contact.id)
if (store && store.contacts) store.contacts[id] = { id, name: contact.notify }}})

yudamods.getName = (jid, withoutContact  = false) => {
id = yudamods.decodeJid(jid)
withoutContact = yudamods.withoutContact || withoutContact 
let v
if (id.endsWith("@g.us")) return new Promise(async (resolve) => {
v = store.contacts[id] || {}
if (!(v.name || v.subject)) v = yudamods.groupMetadata(id) || {}
resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'))
})
else v = id === '0@s.whatsapp.net' ? {
id,
name: 'WhatsApp'
} : id === yudamods.decodeJid(yudamods.user.id) ?
yudamods.user :
(store.contacts[id] || {})
return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')}

yudamods.sendContact = async (jid, kon, quoted = '', opts = {}) => {
let list = []
for (let i of kon) {
list.push({
displayName: await yudamods.getName(i + '@s.whatsapp.net'),
vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await yudamods.getName(i + '@s.whatsapp.net')}\nFN:${await yudamods.getName(i + '@s.whatsapp.net')}\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:Ponsel\nitem2.EMAIL;type=INTERNET:yudamodsmodz@gmail.com\nitem2.X-ABLabel:Email\nitem3.URL:https://chat.whatsapp.com/JsXKjrkkd9NIXEb5cMKHWz\nitem3.X-ABLabel:Instagram\nitem4.ADR:;;Indonesia;;;;\nitem4.X-ABLabel:Region\nEND:VCARD`})}

yudamods.sendMessage(jid, { contacts: { displayName: `${list.length} Kontak`, contacts: list }, ...opts }, { quoted })}

//Kalau Mau Self Lu Buat Jadi false
yudamods.public = true


yudamods.ev.on('creds.update', saveCreds)
 
 yudamods.downloadMediaMessage = async (message) => {
let mime = (message.msg || message).mimetype || ''
let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
const stream = await downloadContentFromMessage(message, messageType)
let buffer = Buffer.from([])
for await(const chunk of stream) {
buffer = Buffer.concat([buffer, chunk])}
return buffer} 
 
 yudamods.sendImage = async (jid, path, caption = '', quoted = '', options) => {
let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
return await yudamods.sendMessage(jid, { image: buffer, caption: caption, ...options }, { quoted })}

yudamods.sendText = (jid, text, quoted = '', options) => yudamods.sendMessage(jid, { text: text, ...options }, { quoted })

yudamods.sendTextWithMentions = async (jid, text, quoted, options = {}) => yudamods.sendMessage(jid, { text: text, contextInfo: { mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net') }, ...options }, { quoted })
 
yudamods.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
let buffer
if (options && (options.packname || options.author)) {
buffer = await writeExifImg(buff, options)
} else {
buffer = await imageToWebp(buff)}
await yudamods.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
return buffer}
 
yudamods.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
let buffer
if (options && (options.packname || options.author)) {
buffer = await writeExifVid(buff, options)
} else {
buffer = await videoToWebp(buff)}
await yudamods.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
return buffer}
 
 yudamods.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
let quoted = message.msg ? message.msg : message
let mime = (message.msg || message).mimetype || ''
let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
const stream = await downloadContentFromMessage(quoted, messageType)
let buffer = Buffer.from([])
for await(const chunk of stream) {
buffer = Buffer.concat([buffer, chunk])}
let type = await FileType.fromBuffer(buffer)
trueFileName = attachExtension ? (filename + '.' + type.ext) : filename
// save to file
await fs.writeFileSync(trueFileName, buffer)
return trueFileName}
//=================================================
 yudamods.cMod = (jid, copy, text = '', sender = yudamods.user.id, options = {}) => {
//let copy = message.toJSON()
let mtype = Object.keys(copy.message)[0]
let isEphemeral = mtype === 'ephemeralMessage'
if (isEphemeral) {
mtype = Object.keys(copy.message.ephemeralMessage.message)[0]}
let msg = isEphemeral ? copy.message.ephemeralMessage.message : copy.message
let content = msg[mtype]
if (typeof content === 'string') msg[mtype] = text || content
else if (content.caption) content.caption = text || content.caption
else if (content.text) content.text = text || content.text
if (typeof content !== 'string') msg[mtype] = {
...content,
...options}
if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
if (copy.key.remoteJid.includes('@s.whatsapp.net')) sender = sender || copy.key.remoteJid
else if (copy.key.remoteJid.includes('@broadcast')) sender = sender || copy.key.remoteJid
copy.key.remoteJid = jid
copy.key.fromMe = sender === yudamods.user.id
return proto.WebMessageInfo.fromObject(copy)}
yudamods.sendFile = async(jid, PATH, fileName, quoted = {}, options = {}) => {
let types = await yudamods.getFile(PATH, true)
let { filename, size, ext, mime, data } = types
let type = '', mimetype = mime, pathFile = filename
if (options.asDocument) type = 'document'
if (options.asSticker || /webp/.test(mime)) {
let { writeExif } = require('./lib/sticker.js')
let media = { mimetype: mime, data }
pathFile = await writeExif(media, { packname: global.packname, author: global.packname2, categories: options.categories ? options.categories : [] })
await fs.promises.unlink(filename)
type = 'sticker'
mimetype = 'image/webp'}
else if (/image/.test(mime)) type = 'image'
else if (/video/.test(mime)) type = 'video'
else if (/audio/.test(mime)) type = 'audio'
else type = 'document'
await yudamods.sendMessage(jid, { [type]: { url: pathFile }, mimetype, fileName, ...options }, { quoted, ...options })
return fs.promises.unlink(pathFile)}
yudamods.parseMention = async(text) => {
return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')}

yudamods.copyNForward = async (jid, message, forceForward = false, options = {}) => {
let vtype
if (options.readViewOnce) {
message.message = message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message ? message.message.ephemeralMessage.message : (message.message || undefined)
vtype = Object.keys(message.message.viewOnceMessage.message)[0]
delete(message.message && message.message.ignore ? message.message.ignore : (message.message || undefined))
delete message.message.viewOnceMessage.message[vtype].viewOnce
message.message = {
...message.message.viewOnceMessage.message}}
let mtype = Object.keys(message.message)[0]
let content = await generateForwardMessageContent(message, forceForward)
let ctype = Object.keys(content)[0]
let context = {}
if (mtype != "conversation") context = message.message[mtype].contextInfo
content[ctype].contextInfo = {
...context,
...content[ctype].contextInfo}
const waMessage = await generateWAMessageFromContent(jid, content, options ? {
...content[ctype],
...options,
...(options.contextInfo ? {
contextInfo: {
...content[ctype].contextInfo,
...options.contextInfo}} : {})} : {})
await yudamods.relayMessage(jid, waMessage.message, { messageId:  waMessage.key.id })
return waMessage}

yudamods.getFile = async (PATH, save) => {
let res
let data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,`[1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await getBuffer(PATH)) : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0)
//if (!Buffer.isBuffer(data)) throw new TypeError('Result is not a buffer')
let type = await FileType.fromBuffer(data) || {
mime: 'application/octet-stream',
ext: '.bin'
}
filename = path.join(__filename, '../src/' + new Date * 1 + '.' + type.ext)
if (data && save) fs.promises.writeFile(filename, data)
return {
res,
filename,
	size: await getSizeMedia(data),
...type,
data
}
}
yudamods.serializeM = (m) => smsg(yudamods, m, store)
yudamods.ev.on("connection.update", async (update) => {
const { connection, lastDisconnect } = update;
if (connection === "close") {
  let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
  if (reason === DisconnectReason.badSession) {
console.log(`Bad Session File, Please Delete Session and Scan Again`);
process.exit();
  } else if (reason === DisconnectReason.connectionClosed) {
console.log("Connection closed, reconnecting....");
connectToWhatsApp();
  } else if (reason === DisconnectReason.connectionLost) {
console.log("Connection Lost from Server, reconnecting...");
connectToWhatsApp();
  } else if (reason === DisconnectReason.connectionReplaced) {
console.log("Connection Replaced, Another New Session Opened, Please Restart Bot");
process.exit();
  } else if (reason === DisconnectReason.loggedOut) {
console.log(`Device Logged Out, Please Delete Folder Session yusril and Scan Again.`);
process.exit();
  } else if (reason === DisconnectReason.restartRequired) {
console.log("Restart Required, Restarting...");
connectToWhatsApp();
  } else if (reason === DisconnectReason.timedOut) {
console.log("Connection TimedOut, Reconnecting...");
connectToWhatsApp();
  } else {
console.log(`Unknown DisconnectReason: ${reason}|${connection}`);
connectToWhatsApp();
  }
} else if (connection === "open") {
  yudamods.sendMessage('6283153305709' + "@s.whatsapp.net", { text: `⚡ *UPDATE NEW*\n\n_ANDA TELAH BERHASIL TERHUBUNG OLEH BOT BANG YUDAMODS, SUPPORT YT BABG yudamods YAA_\n\n🎁 JOIN TELE : t.me/YUDAMODS` });
}
// console.log('Connected...', update)
});
return yudamods
}
connectToWhatsApp()
let file = require.resolve(__filename)
fs.watchFile(file, () => {
fs.unwatchFile(file)
console.log(chalk.redBright(`Update ${__filename}`))
delete require.cache[file]
require(file)
})
