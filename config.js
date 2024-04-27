const fs = require('fs')
const chalk = require('chalk')
const moment = require('moment-timezone')

global.domain = "-" // Isi Domain Lu
global.apikey = '-' // Isi Apikey Plta Lu
global.capikey = '-' // Isi Apikey Pltc Lu
global.grup = 'https://chat.whatsapp.com/JsXKjrkkd9NIXEb5cMKHWz'
global.ig = 'https://instagram.com/yudamods'
global.thumb = fs.readFileSync("./data/image/thumb.jpg")
global.email = 'yudamodz@gmail.com'
global.region = 'Indonesia'
//theme link
global.link = 'https://whatsapp.com/channel/0029VaTtfCtChq6G44SWKM0g'
//GEMINI AI FEATURE//
const phoneNumber = '+6283153305709';

// Replace with your Gemini API endpoint URL or access token
// Replace with your free Chatfuel API key
const chatfuelApiKey = 'your-chatfuel-api-key-here';

//—————「 Set Nama Own & Bot 」—————//
global.ownername = 'YudaMods'
global.domain = ''
global.apikey2 = '' // Isi Apikey Pltc Lu
global.capikey2 = ''
global.eggsnya = '15' // id eggs yang dipakai
global.location = '1' // id location

global.owner = ['6283153305709']

global.keyopenai = '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'
global.ibeng = 'Yl4h5x9wiA'

global.botname = 'YudaModsBot'
global.packname = 'YudaMods'
global.author = `© YudaMods\nWa: 6283153305709`
global.prefa = ['','!','.',',','🐤','🗿']
global.sessionName = 'sessions'
global.sp = '⭔'
global.anticall = true

global.mess = {
    success: 'Selesai 🫡',
    admin: '☘️ Fitur Khusus Admin Group !',
    botAdmin: '☘️ Fitur Ini Hanya Bisa Digunakan Ketika Bot Menjadi Admin Group !',
    owner: '🎁 Fitur Khusus Owner !',
    group: '☘️ Fitur Ini Hanya Bisa Digunakan Di Group Chat !',
    private: '☘️ Fitur Ini Hanya Bisa Digunakan Di Private Chat !',
    bot: '☘️ Fitur Khusus Pengguna Nomor Bot !',
    wait: '☘️ *Dalam Proses*',
    endLimit: '☘️ Limit kamu Habis, Limit Akan Direset Setiap Jam 12 !\n\n☘️ *Premium Cuma 5K Permanen* 😋',
    error: '☘️ *Kayaknya Ada Error Nih*',
    prem: '☘️ Fitur Khusus Premium!\n\n☘️ Beli Premium Cuma 5K Permanen',
}

global.limitawal = {
    premium: 9999999999 ,
    free: 10
}

global.multiplier = 1000

let file = require.resolve(__filename)
fs.watchFile(file, () => {
	fs.unwatchFile(file)
	console.log(chalk.redBright(`Update'${__filename}'`))
	delete require.cache[file]
	require(file)
})