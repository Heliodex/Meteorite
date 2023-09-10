import Module from "node:module";

const require = Module.createRequire(import.meta.url);
import path from 'path';
import { fileURLToPath } from 'url';
import { requireAuth } from "./middleware/authmiddleware.js";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);


var express = require('express');
const app = require("express")();
var cookieParser = require('cookie-parser')
var session = require('express-session')
const helmet = require("helmet");
const mongoose = require('mongoose');
const config = require('./model/config.js')
import ipWhitelist from './model/ipWhitelist.mjs'
const user = require('./model/user.js')
const model = require("./model/user.js")
const jwt = require('jsonwebtoken')
const rcctalk = require('./rcctalk')
const { grabAuth } = require('./middleware/grabauth.js')
const games = require('./model/games.js')
require('dotenv').config()
const https = require('https')
const PROD = process.env.PROD
const client = require('prom-client')
const { handler } = await import('../meteoriterewrite/build/handler.js')

app.use((req, res, next) => {
    const allowedOrigins = ['m.mete0r.xyz', 'mete0r.xyz', 'assetgame.mete0r.xyz', 'www.mete0r.xyz', 'api.mete0r.xyz', 'dinnerbone.mete0r.xyz' /* funny */, 'assetgame.mete0r.xyz', 'clientsettingscdn.mete0r.xyz', 'http://127.0.0.1:5173']
    const origin = req.get('host')
    if (allowedOrigins.includes(origin)) {
         res.setHeader('Access-Control-Allow-Origin', req.headers['x-forwarded-proto']??"http"+"://"+origin)
    }
    if (origin === "mete0r.xyz"){
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
    //res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:8020');
    res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.header('Access-Control-Allow-Credentials', true);
    return next();
  });

import { createClient } from 'redis'
let redis
// on prod we can just use a locally hosted redisStack I'm too lazy to use docker on windows to host one for local dev
if (PROD === "true"){
    redis = createClient()
}else{
    redis = createClient({url: "redis://default:2BxaAV7Dcbt8d6QqNm58TdUfdIQtEY5q@redis-15195.c53.west-us.azure.cloud.redislabs.com:15195"})
}
redis.on('error', (err) => console.log('Redis Client Error', err));
await redis.connect()

import { Repository } from 'redis-om'


const ipWhiteListRepository = new Repository(ipWhitelist, redis)

const collectDefaultMetrics = client.collectDefaultMetrics
collectDefaultMetrics({timeout: 5000})

const counter = new client.Counter({
    name: 'node_request_operations_total',
    help: 'The total number of processed requests'
})

const playercounter = new client.Gauge({
    name: 'node_players',
    help: 'Amount of players every minute',
    async collect() {
        // Invoked when the registry collects its metrics' values.
        const currentValue = await games.aggregate([
            {
              "$group": {
                "_id": null,
                "numberofplayers": {
                    '$sum': { 
                    '$convert': { 'input': '$numberofplayers', 'to': 'int' }
                    }
                }
              }
            }
          ])
        this.set(currentValue[0].numberofplayers);
      },
})

const histogram = new client.Histogram({
    name: 'node_request_duration_seconds',
    help: 'Histogram for the duration in seconds',
    buckets: [1,2,5,6,10]
})
const getDurationInMilliseconds = (start) => {
    const NS_PER_SEC = 1e9
    const NS_TO_MS = 1e6
    const diff = process.hrtime(start)

    return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS
}

app.use((req, res, next) => {
    const start = process.hrtime()
    counter.inc()

    res.on('finish', () => {            
        const durationInMilliseconds = getDurationInMilliseconds (start)
        histogram.observe(durationInMilliseconds)
    })

    next()
})


const JWT_SECRET = process.env.JWT_SECRET
const RCC_HOST = process.env.RCC_HOST
const DB_PASSWORD = process.env.DB_PASSWORD
console.log(RCC_HOST)
if (PROD === "true"){
    mongoose.connect('mongodb://localhost:27017/meteoritedb', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    authSource: "admin",
    user: "server",
    pass: DB_PASSWORD,
})
}else{
    mongoose.connect('mongodb://localhost:27017/meteoritedb', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
}

app.disable('x-powered-by') // we don't wanna tell potential attackers our exact framework yet lol
// automatically create a default document in mongodb for our config
// if the config document doesn't exist auto create one these are also the default settings your site will start with
async function createconfig(){
try {
    var resp =  await config.findOne()
    if (!resp) {
        const response = await config.create({
            RegistrationEnabled: true,
            MaintenanceEnabled: false,
            KeysEnabled: false,
            GamesEnabled: true
        })
    } 
  } catch (err) {
    throw(err)
  }
}
createconfig()
app.use(cookieParser())
// maintenance mode middleware
app.use(async function (req, res, next) {
    if (req.url === "/assets/audio/wof.mp3"){
         return next()
    }
    res.header("Cache-Control", "no-store,no-cache,must-revalidate");
    var resp = await config.findOne().lean()
    req.config = resp

    //console.log(req.headers['x-forwarded-proto'])
    if (!req.headers['x-forwarded-proto']){
        if (req.secure === true){
            req.headers['x-forwarded-proto'] = "https"
        }else{
            req.headers['x-forwarded-proto'] = "http"
        }
    }
    if (!req.headers['cf-connecting-ip']){ //localhost
        res.header("Access-Control-Allow-Origin", "*");
    }
    if (req.headers['x-forwarded-host'] === "www.mete0r.xyz" && req.headers['x-forwarded-host'] && req.headers?.["user-agent"] != "RobloxStudio/WinInet" && req.headers?.["user-agent"] != "Roblox/WinInet"){
        if (req.method === "GET" && req.url.startsWith('/game/') === false && req.url.startsWith("/login/") === false){
            return res.redirect(302,  req.headers['x-forwarded-proto']+"://mete0r.xyz"+req.url)
        }
    }
    //console.log(req.headers['x-forwarded-host'])
    //req.headers['x-forwarded-host'] = "mete0r.xyz"
    //console.log(req.headers?.['cf-connecting-ip'])
    //console.log(req.socket.remoteAddress)
    //console.log(req.url)
    if (req.url === "/assets/2020.zip"){
        return res.redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
   }
    //return res.sendFile(path.join(__dirname, '/under_maintenance.html'));

    if (resp.MaintenanceEnabled === true && req.headers?.['cf-connecting-ip'] != RCC_HOST && req.headers?.['cf-connecting-ip']){
        if (!req.cookies) {
            return res.sendFile(path.join(__dirname, '/under_maintenance.html'));
          }

          if (req?.cookies?.real === "2fKMlOumsNSnbuVJkLonCOYZXYZbWrGrdDeRTIeWAbXeOiFGyAY"){
            return next()
          }
        return res.sendFile(path.join(__dirname, '/under_maintenance.html'));
    }

    if (req.headers?.['cf-connecting-ip'] != RCC_HOST && req.headers?.['cf-connecting-ip'] && req.url != "/initialize" && req.headers?.["user-agent"] != "Roblox/WinInet" && req.headers?.["user-agent"] != "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/605.1.15 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/605.1.15"){
        var ip = req.headers['cf-connecting-ip'] || req.socket.remoteAddress
        var resp = await redis.exists('ipWhiteListSchema:'+ip.toString())
        if (resp === 0){
            return res.status(401).send("Not allowed visit the discord. discord.gg/5r6ZjG57kU")
        }
    }
    next()
  })

app.use(express.urlencoded({ extended: true }))
async function lol(){
    try {
    const res= await rcctalk.GetAllJobs()
    //console.dir(res,{ depth: null })
      } catch (error) {
       throw("RCC Test run failed please have rcc soap running on port 64989")
      }
}
//lol()
app.set('trust proxy', true)

// routes lol
const assetRouter = require('./routes/assets.js')

app.use(['/asset','/v1/asset'], assetRouter)

const gameRouter = require('./routes/game.js')

app.use(['/game','//game'],gameRouter)

const persistenceRouter = require('./routes/persistence.js')

app.use('/persistence',persistenceRouter)

const clientSettingsRouter = require('./routes/clientsettings.js')

app.use('/',clientSettingsRouter)

const registerRouter = require('./routes/register.js')

app.use('/register',registerRouter)

const loginRouter = require('./routes/login.js')

app.use(['/login',"/v2/login","/v2/twostepverification/verify"],loginRouter)

const logoutRouter = require('./routes/logout.js');

app.use('/logout',logoutRouter)

const gamesRouter = require('./routes/games.js');

app.use('/games',gamesRouter)

const adminRouter = require('./routes/admin.js');

app.use('/admin',adminRouter)

app.get('/users/account-info', (req, res) => {
    return res.json({
        AgeBracket : 0,
        Email :     {
            IsVerified : 1,
            Value : "kmulherin@roblox.com",
        },
        HasPasswordSet : 1,
        Username : "iMightBeLying",
        RobuxBalance: 9999999
     })
})

const usersRouter = require('./routes/users.js');

app.use('/',usersRouter)

const avatarRouter = require('./routes/avatar.js');

app.use('/api/avatar',avatarRouter)

const settingsRouter = require('./routes/settings.js');

app.use('/settings',settingsRouter)

const developRouter = require('./routes/develop.js');

app.use('/develop',developRouter)

const thumbnailRenderRouter = require('./routes/api/renderthumbnail.js');

app.use(['/api/thumbnailrender','/thumbs'/*2016 asset thumbs*/, '/avatar-thumbnail/image'],thumbnailRenderRouter)

const purchaseRouter = require('./routes/api/purchase.js');

app.use('/api/purchase',purchaseRouter)

const moderateRouter = require('./routes/api/moderate.js');

app.use('/api/moderate',moderateRouter)

const verifyRouter = require('./routes/api/verify.js');

app.use('/api/verify',verifyRouter)

const itemactionRouter = require('./routes/api/itemaction.js');

app.use('/api/itemaction',itemactionRouter)

const bodycolorupdateRouter = require('./routes/api/bodycolorupdate.js');

app.use('/api/bodycolorupdate',bodycolorupdateRouter)

const changepasswordRouter = require('./routes/api/changepassword.js');

app.use('/api/changepassword',changepasswordRouter)

const generatekeyRouter = require('./routes/api/generatekey.js');

app.use('/api/generatekey',generatekeyRouter)

const authRouter = require('./routes/api/auth.js');

app.use('/api/auth',authRouter)

const catalogRouter = require('./routes/catalog.js');

app.use('/api/catalog',catalogRouter)

const updategameinfoRouter = require('./routes/api/updategameinfo.js');

app.use('/',updategameinfoRouter)

const userinfoRouter = require('./routes/api/userinfo.js');

app.use('/api/userinfo',userinfoRouter)

const updateusermembershipRouter = require('./routes/api/updateusermembership.js');

app.use('/api/updateusermembership',updateusermembershipRouter)

const marketplaceRouter = require('./routes/marketplace.js');

app.use('/',marketplaceRouter)

const versioncompatibilityRouter = require('./routes/versioncompatibility.js');

app.use('/',versioncompatibilityRouter)

const t8gameRouter = require('./routes/2018/game.js');

app.use('/game/',t8gameRouter.router)

const t20gameRouter = require('./routes/2020/game.js')

app.use(['/game/','/v1'],t20gameRouter.router)

const mobileApiRouter = require('./routes/mobileapi.js');

app.use('/mobileapi',mobileApiRouter)

const friendsApiRouter = require('./routes/api/friends.js');

app.use('/api/friends',friendsApiRouter)

const advertiseApiRouter = require('./routes/api/advertise.js');

app.use('/api/advertise',advertiseApiRouter)

const requestAdRouter = require('./routes/api/requestad.js');

app.use('/api/requestad',requestAdRouter)

/*const bankRouter = require('./routes/api/bank.js');

app.use('/api/bank',bankRouter)*/

/*const groupRouter = require('./routes/api/groups.js');

app.use('/api/groups',groupRouter)*/

const feedRouter = require('./routes/api/feed.js');

app.use('/api/feed',feedRouter)

const commentRouter = require('./routes/api/comment.js');

app.use('/api/comments',commentRouter)


/*
app.get("/My/Places", (req, res) => {
    res.send("No editing sorry")
})*/

app.get("/studio/e.png", (req, res) => {
    res.send()
})

app.get("/tags/c/36/studio.json", (req, res) => {
    res.json({"users":[{"id":306443,"username":"Hajimalago","avatar_template":"/user_avatar/devforum.roblox.com/hajimalago/{size}/724795_2.png"},{"id":36263,"username":"rickje139","avatar_template":"/user_avatar/devforum.roblox.com/rickje139/{size}/1459648_2.png"},{"id":120450,"username":"GodSysAdmin","avatar_template":"/user_avatar/devforum.roblox.com/godsysadmin/{size}/1540208_2.png"},{"id":472489,"username":"ItsMeFelixAccept","avatar_template":"/user_avatar/devforum.roblox.com/itsmefelixaccept/{size}/1551006_2.png"},{"id":44883,"username":"iSyriux","avatar_template":"/user_avatar/devforum.roblox.com/isyriux/{size}/1464807_2.png"},{"id":351893,"username":"JoshSedai","avatar_template":"/user_avatar/devforum.roblox.com/joshsedai/{size}/842420_2.png"},{"id":376200,"username":"Logimite","avatar_template":"/user_avatar/devforum.roblox.com/logimite/{size}/1573532_2.png"},{"id":598293,"username":"jmkd3v","avatar_template":"/user_avatar/devforum.roblox.com/jmkd3v/{size}/1572236_2.png"},{"id":249742,"username":"zachary108181","avatar_template":"/user_avatar/devforum.roblox.com/zachary108181/{size}/1376998_2.png"},{"id":557246,"username":"Miles_1king","avatar_template":"/user_avatar/devforum.roblox.com/miles_1king/{size}/1558993_2.png"},{"id":341046,"username":"tnavarts","avatar_template":"/user_avatar/devforum.roblox.com/tnavarts/{size}/797168_2.png"},{"id":164536,"username":"LucasTutoriaisSaimo","avatar_template":"/user_avatar/devforum.roblox.com/lucastutoriaissaimo/{size}/1572474_2.png"},{"id":300,"username":"Tomarty","avatar_template":"/user_avatar/devforum.roblox.com/tomarty/{size}/1557837_2.png"},{"id":27022,"username":"nooneisback","avatar_template":"/user_avatar/devforum.roblox.com/nooneisback/{size}/1488960_2.png"},{"id":11348,"username":"Hexcede","avatar_template":"/user_avatar/devforum.roblox.com/hexcede/{size}/1152765_2.png"},{"id":350909,"username":"crypto_mancer","avatar_template":"/user_avatar/devforum.roblox.com/crypto_mancer/{size}/822643_2.png"},{"id":200305,"username":"Kyxino","avatar_template":"/user_avatar/devforum.roblox.com/kyxino/{size}/1526293_2.png"},{"id":176552,"username":"7z99","avatar_template":"/user_avatar/devforum.roblox.com/7z99/{size}/1375229_2.png"},{"id":17304,"username":"FilteredStudio","avatar_template":"/user_avatar/devforum.roblox.com/filteredstudio/{size}/1555102_2.png"},{"id":461567,"username":"Optiplex3020SFF","avatar_template":"/user_avatar/devforum.roblox.com/optiplex3020sff/{size}/1498767_2.png"},{"id":260389,"username":"WallsAreForClimbing","avatar_template":"/user_avatar/devforum.roblox.com/wallsareforclimbing/{size}/1041671_2.png"},{"id":163116,"username":"SillyMeTimbers","avatar_template":"/user_avatar/devforum.roblox.com/sillymetimbers/{size}/1395188_2.png"},{"id":396736,"username":"HugeCoolboy2007","avatar_template":"/user_avatar/devforum.roblox.com/hugecoolboy2007/{size}/1533064_2.png"},{"id":105134,"username":"Fire540Games","avatar_template":"/user_avatar/devforum.roblox.com/fire540games/{size}/1539762_2.png"},{"id":17941,"username":"RBLXImagineer","avatar_template":"/user_avatar/devforum.roblox.com/rblximagineer/{size}/1417349_2.png"},{"id":395244,"username":"IdontPlayz343","avatar_template":"/user_avatar/devforum.roblox.com/idontplayz343/{size}/1379043_2.png"},{"id":351579,"username":"SimonEnderB","avatar_template":"/user_avatar/devforum.roblox.com/simonenderb/{size}/1533230_2.png"},{"id":194130,"username":"cunpliy","avatar_template":"/user_avatar/devforum.roblox.com/cunpliy/{size}/1426008_2.png"},{"id":7289,"username":"ittrgrey","avatar_template":"/user_avatar/devforum.roblox.com/ittrgrey/{size}/1570588_2.png"},{"id":451394,"username":"parker02311","avatar_template":"/user_avatar/devforum.roblox.com/parker02311/{size}/1103926_2.png"},{"id":312723,"username":"ihavoc101","avatar_template":"/user_avatar/devforum.roblox.com/ihavoc101/{size}/1574065_2.png"},{"id":51619,"username":"G2_funny","avatar_template":"/user_avatar/devforum.roblox.com/g2_funny/{size}/1528742_2.png"},{"id":285060,"username":"RainingSwordFire","avatar_template":"/user_avatar/devforum.roblox.com/rainingswordfire/{size}/1311775_2.png"},{"id":417018,"username":"SoaringKeyy","avatar_template":"/user_avatar/devforum.roblox.com/soaringkeyy/{size}/1551178_2.png"},{"id":32451,"username":"Clueless_Brick","avatar_template":"/user_avatar/devforum.roblox.com/clueless_brick/{size}/1556141_2.png"},{"id":45822,"username":"Vulkarin","avatar_template":"/user_avatar/devforum.roblox.com/vulkarin/{size}/1533760_2.png"},{"id":100697,"username":"ItzDaSniper_ALT","avatar_template":"/user_avatar/devforum.roblox.com/itzdasniper_alt/{size}/1111052_2.png"},{"id":192817,"username":"GeneralRelish","avatar_template":"/user_avatar/devforum.roblox.com/generalrelish/{size}/882303_2.png"},{"id":3657,"username":"Maxx_J","avatar_template":"/user_avatar/devforum.roblox.com/maxx_j/{size}/1257582_2.png"},{"id":778,"username":"gillern","avatar_template":"/user_avatar/devforum.roblox.com/gillern/{size}/1063851_2.png"},{"id":5316,"username":"unmiss","avatar_template":"/user_avatar/devforum.roblox.com/unmiss/{size}/1275904_2.png"},{"id":230186,"username":"overflowed","avatar_template":"/user_avatar/devforum.roblox.com/overflowed/{size}/1518666_2.png"},{"id":119859,"username":"kleptonaut","avatar_template":"/user_avatar/devforum.roblox.com/kleptonaut/{size}/1534225_2.png"},{"id":222257,"username":"ko_ch4","avatar_template":"/user_avatar/devforum.roblox.com/ko_ch4/{size}/1277003_2.png"},{"id":96898,"username":"Phoninian","avatar_template":"/user_avatar/devforum.roblox.com/phoninian/{size}/1505728_2.png"},{"id":130,"username":"zeuxcg","avatar_template":"/user_avatar/devforum.roblox.com/zeuxcg/{size}/759527_2.png"},{"id":346894,"username":"XOLT1268","avatar_template":"/user_avatar/devforum.roblox.com/xolt1268/{size}/1081693_2.png"},{"id":223,"username":"Dekkonot","avatar_template":"/user_avatar/devforum.roblox.com/dekkonot/{size}/1268788_2.png"},{"id":431,"username":"DataBrain","avatar_template":"/user_avatar/devforum.roblox.com/databrain/{size}/1346532_2.png"},{"id":87089,"username":"ForgotenR4","avatar_template":"/user_avatar/devforum.roblox.com/forgotenr4/{size}/993976_2.png"},{"id":134567,"username":"RoxyBloxyy","avatar_template":"/user_avatar/devforum.roblox.com/roxybloxyy/{size}/1063572_2.png"},{"id":214043,"username":"DavidNet22","avatar_template":"/user_avatar/devforum.roblox.com/davidnet22/{size}/1561725_2.png"},{"id":393053,"username":"jumbopushpop112","avatar_template":"/user_avatar/devforum.roblox.com/jumbopushpop112/{size}/1448545_2.png"},{"id":9518,"username":"jacklollz2","avatar_template":"/user_avatar/devforum.roblox.com/jacklollz2/{size}/1453855_2.png"},{"id":34253,"username":"incapaz","avatar_template":"/user_avatar/devforum.roblox.com/incapaz/{size}/1097885_2.png"},{"id":32226,"username":"Optikk","avatar_template":"/user_avatar/devforum.roblox.com/optikk/{size}/1515061_2.png"},{"id":317122,"username":"DoctorNO2106","avatar_template":"/user_avatar/devforum.roblox.com/doctorno2106/{size}/1439049_2.png"},{"id":33762,"username":"RuizuKun_Dev","avatar_template":"/user_avatar/devforum.roblox.com/ruizukun_dev/{size}/1587315_2.png"},{"id":237547,"username":"darkmodeonn","avatar_template":"/user_avatar/devforum.roblox.com/darkmodeonn/{size}/975957_2.png"},{"id":1045,"username":"WingItMan","avatar_template":"/user_avatar/devforum.roblox.com/wingitman/{size}/1288630_2.png"},{"id":27530,"username":"swmaniac","avatar_template":"/user_avatar/devforum.roblox.com/swmaniac/{size}/1054812_2.png"},{"id":47029,"username":"PH_OENlX","avatar_template":"/user_avatar/devforum.roblox.com/ph_oenlx/{size}/1462687_2.png"},{"id":231587,"username":"KrYn0MoRe","avatar_template":"/user_avatar/devforum.roblox.com/kryn0more/{size}/1347965_2.png"},{"id":347486,"username":"CanadianCrepe","avatar_template":"/user_avatar/devforum.roblox.com/canadiancrepe/{size}/1544739_2.png"},{"id":416893,"username":"FirewolfYT_751Adult","avatar_template":"/user_avatar/devforum.roblox.com/firewolfyt_751adult/{size}/1002940_2.png"},{"id":33422,"username":"nsgriff","avatar_template":"/user_avatar/devforum.roblox.com/nsgriff/{size}/648586_2.png"},{"id":-1,"username":"system","avatar_template":"/user_avatar/devforum.roblox.com/system/{size}/278369_2.png"},{"id":112950,"username":"coefficients","avatar_template":"/user_avatar/devforum.roblox.com/coefficients/{size}/1344844_2.png"},{"id":419793,"username":"ORLANDOMAGIC00","avatar_template":"/user_avatar/devforum.roblox.com/orlandomagic00/{size}/1583711_2.png"},{"id":57718,"username":"rogchamp","avatar_template":"/user_avatar/devforum.roblox.com/rogchamp/{size}/1359144_2.png"},{"id":3052,"username":"ziplocBag","avatar_template":"/user_avatar/devforum.roblox.com/ziplocbag/{size}/909305_2.png"},{"id":26244,"username":"mxdanger","avatar_template":"/user_avatar/devforum.roblox.com/mxdanger/{size}/1457829_2.png"},{"id":2791,"username":"Dogutsune","avatar_template":"/user_avatar/devforum.roblox.com/dogutsune/{size}/1053710_2.png"},{"id":431740,"username":"TheSenorDuck","avatar_template":"/user_avatar/devforum.roblox.com/thesenorduck/{size}/933266_2.png"},{"id":155602,"username":"RobieTheCat","avatar_template":"/user_avatar/devforum.roblox.com/robiethecat/{size}/1572265_2.png"},{"id":6350,"username":"The_Aliens","avatar_template":"/user_avatar/devforum.roblox.com/the_aliens/{size}/1369228_2.png"},{"id":8849,"username":"lateregistration","avatar_template":"/user_avatar/devforum.roblox.com/lateregistration/{size}/964581_2.png"},{"id":241899,"username":"CringeEngineer","avatar_template":"/user_avatar/devforum.roblox.com/cringeengineer/{size}/1141949_2.png"},{"id":789,"username":"mothmage","avatar_template":"/user_avatar/devforum.roblox.com/mothmage/{size}/1387000_2.png"},{"id":273497,"username":"Voxelinator","avatar_template":"/user_avatar/devforum.roblox.com/voxelinator/{size}/1083723_2.png"},{"id":120247,"username":"MeaxisDev","avatar_template":"/user_avatar/devforum.roblox.com/meaxisdev/{size}/1454273_2.png"},{"id":38549,"username":"NickoSCP","avatar_template":"/user_avatar/devforum.roblox.com/nickoscp/{size}/1128258_2.png"},{"id":139902,"username":"LuukOriginal","avatar_template":"/user_avatar/devforum.roblox.com/luukoriginal/{size}/1314121_2.png"},{"id":38606,"username":"Homeomorph","avatar_template":"/user_avatar/devforum.roblox.com/homeomorph/{size}/1521085_2.png"},{"id":31496,"username":"Sentross","avatar_template":"/user_avatar/devforum.roblox.com/sentross/{size}/1485711_2.png"},{"id":326221,"username":"so1ehee","avatar_template":"/user_avatar/devforum.roblox.com/so1ehee/{size}/1494050_2.png"},{"id":304229,"username":"RawEggTheGreatIX","avatar_template":"/user_avatar/devforum.roblox.com/raweggthegreatix/{size}/1534316_2.png"},{"id":357,"username":"Plutonem","avatar_template":"/user_avatar/devforum.roblox.com/plutonem/{size}/1214626_2.png"},{"id":281177,"username":"meshadapt","avatar_template":"/user_avatar/devforum.roblox.com/meshadapt/{size}/1024879_2.png"},{"id":1227,"username":"Rocky28447","avatar_template":"/user_avatar/devforum.roblox.com/rocky28447/{size}/1025963_2.png"},{"id":439104,"username":"meblec","avatar_template":"/user_avatar/devforum.roblox.com/meblec/{size}/1582125_2.png"},{"id":224996,"username":"TheCrypticRunner","avatar_template":"/user_avatar/devforum.roblox.com/thecrypticrunner/{size}/1457066_2.png"},{"id":92183,"username":"Vasilakious","avatar_template":"/user_avatar/devforum.roblox.com/vasilakious/{size}/1117302_2.png"},{"id":9593,"username":"BanTech","avatar_template":"/user_avatar/devforum.roblox.com/bantech/{size}/1534999_2.png"},{"id":7351,"username":"Sublivion","avatar_template":"/user_avatar/devforum.roblox.com/sublivion/{size}/629555_2.png"},{"id":643,"username":"buildthomas","avatar_template":"/user_avatar/devforum.roblox.com/buildthomas/{size}/1146835_2.png"},{"id":153142,"username":"Blokhampster34","avatar_template":"/user_avatar/devforum.roblox.com/blokhampster34/{size}/1170235_2.png"},{"id":86089,"username":"Vmena","avatar_template":"/user_avatar/devforum.roblox.com/vmena/{size}/1155786_2.png"},{"id":220864,"username":"rogeriodec_games","avatar_template":"/user_avatar/devforum.roblox.com/rogeriodec_games/{size}/957129_2.png"},{"id":186756,"username":"Dummy_Tested","avatar_template":"/user_avatar/devforum.roblox.com/dummy_tested/{size}/399575_2.png"},{"id":23710,"username":"DarthChadius","avatar_template":"/user_avatar/devforum.roblox.com/darthchadius/{size}/734631_2.png"},{"id":77150,"username":"CAP7A1N","avatar_template":"/user_avatar/devforum.roblox.com/cap7a1n/{size}/1428937_2.png"},{"id":306008,"username":"Stelth155_Dev","avatar_template":"/user_avatar/devforum.roblox.com/stelth155_dev/{size}/1127802_2.png"},{"id":103015,"username":"Cruizer_Snowman","avatar_template":"/user_avatar/devforum.roblox.com/cruizer_snowman/{size}/1441731_2.png"},{"id":210201,"username":"vrtblox","avatar_template":"/user_avatar/devforum.roblox.com/vrtblox/{size}/580542_2.png"},{"id":12817,"username":"anon66957764","avatar_template":"https://www.roblox.com/headshot-thumbnail/image?userId=463253&width=150&height=150"},{"id":380713,"username":"Vargogram","avatar_template":"/user_avatar/devforum.roblox.com/vargogram/{size}/1475193_2.png"},{"id":289807,"username":"Crazedbrick1","avatar_template":"/user_avatar/devforum.roblox.com/crazedbrick1/{size}/1571206_2.png"},{"id":10734,"username":"CycloneUprising","avatar_template":"/user_avatar/devforum.roblox.com/cycloneuprising/{size}/1327682_2.png"},{"id":363802,"username":"Kairomatic","avatar_template":"/user_avatar/devforum.roblox.com/kairomatic/{size}/1482469_2.png"},{"id":224243,"username":"Eternalove_fan32","avatar_template":"/user_avatar/devforum.roblox.com/eternalove_fan32/{size}/1426044_2.png"},{"id":84276,"username":"Phlegethon5778","avatar_template":"/user_avatar/devforum.roblox.com/phlegethon5778/{size}/1232567_2.png"},{"id":317063,"username":"umpireboy","avatar_template":"/user_avatar/devforum.roblox.com/umpireboy/{size}/1418322_2.png"},{"id":14154,"username":"Hadiisepic","avatar_template":"/user_avatar/devforum.roblox.com/hadiisepic/{size}/1472103_2.png"},{"id":202896,"username":"vrs2210","avatar_template":"/user_avatar/devforum.roblox.com/vrs2210/{size}/1570268_2.png"},{"id":201,"username":"Khanovich","avatar_template":"/user_avatar/devforum.roblox.com/khanovich/{size}/540780_2.png"},{"id":85229,"username":"Oficcer_F","avatar_template":"/user_avatar/devforum.roblox.com/oficcer_f/{size}/1545789_2.png"},{"id":186768,"username":"Cald_fan","avatar_template":"/user_avatar/devforum.roblox.com/cald_fan/{size}/1561054_2.png"},{"id":286481,"username":"TheGreat_Scott","avatar_template":"/user_avatar/devforum.roblox.com/thegreat_scott/{size}/1350329_2.png"}],"primary_groups":[{"id":41,"name":"Roblox_Staff","flair_url":"/uploads/default/original/4X/9/e/7/9e76ae2dd3aa25dc7a42e6443ec4cc57dd999ffe.png","flair_bg_color":"","flair_color":""},{"id":50,"name":"DevRelationsTeam","flair_url":"/uploads/default/original/4X/9/e/7/9e76ae2dd3aa25dc7a42e6443ec4cc57dd999ffe.png","flair_bg_color":"","flair_color":""}],"topic_list":{"can_create_topic":true,"more_topics_url":"/tags/c/updates/announcements/36/studio?match_all_tags=true&page=1&tags%5B%5D=studio","draft":null,"draft_key":"new_topic","draft_sequence":1681,"per_page":30,"top_tags":["studio","physics","scripting","maintenance","avatar","beta","accelerator","building","welds","gui","modeling","wiki","animation","humanoid","luau","terrain","api","events","intern","internship","motor6d","r15","smoothterrain","accessories","analytics","animation-editor","animations","incubator","rdc","rendering"],"tags":[{"id":68,"name":"studio","topic_count":7872,"staff":false}],"topics":[{"id":1038853,"title":"New Physics Stepping Method: Adaptive Timestepping","fancy_title":"New Physics Stepping Method: Adaptive Timestepping","slug":"new-physics-stepping-method-adaptive-timestepping","posts_count":65,"reply_count":33,"highest_post_number":68,"image_url":null,"created_at":"2021-02-10T22:51:55.427Z","last_posted_at":"2021-02-16T20:18:25.918Z","bumped":true,"bumped_at":"2021-02-18T03:52:19.710Z","archetype":"regular","unseen":false,"last_read_post_number":12,"unread":34,"new_posts":22,"pinned":false,"unpinned":null,"visible":true,"closed":false,"archived":false,"notification_level":3,"bookmarked":false,"liked":false,"tags":["studio","beta"],"views":15049,"like_count":663,"has_summary":true,"last_poster_username":"iSyriux","category_id":36,"pinned_globally":false,"featured_link":null,"has_accepted_answer":false,"vote_count":0,"can_vote":false,"user_voted":false,"posters":[{"extras":null,"description":"Автор","user_id":306443,"primary_group_id":41},{"extras":null,"description":"Частый автор","user_id":36263,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":120450,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":472489,"primary_group_id":null},{"extras":"latest","description":"Последний автор","user_id":44883,"primary_group_id":null}]},{"id":1025033,"title":"Heightmaps Go to New Altitudes!","fancy_title":"Heightmaps Go to New Altitudes!","slug":"heightmaps-go-to-new-altitudes","posts_count":108,"reply_count":69,"highest_post_number":141,"image_url":"https://doy2mn9upadnk.cloudfront.net/uploads/default/optimized/4X/0/c/c/0cca114c25efbe61d257c9580c3cd7413278b84d_2_1024x779.jpeg","created_at":"2021-02-04T18:31:29.269Z","last_posted_at":"2021-02-17T09:20:13.946Z","bumped":true,"bumped_at":"2021-02-17T09:20:13.946Z","archetype":"regular","unseen":false,"pinned":false,"unpinned":null,"visible":true,"closed":false,"archived":false,"bookmarked":null,"liked":null,"tags":["studio","beta"],"views":16743,"like_count":1093,"has_summary":true,"last_poster_username":"Miles_1king","category_id":36,"pinned_globally":false,"featured_link":null,"has_accepted_answer":false,"vote_count":0,"can_vote":false,"user_voted":false,"posters":[{"extras":null,"description":"Автор","user_id":351893,"primary_group_id":41},{"extras":null,"description":"Частый автор","user_id":376200,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":598293,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":249742,"primary_group_id":null},{"extras":"latest","description":"Последний автор","user_id":557246,"primary_group_id":null}]},{"id":1007452,"title":"Upcoming Potential Property Name Conflict: \"Pivot\"","fancy_title":"Upcoming Potential Property Name Conflict: &ldquo;Pivot&rdquo;","slug":"upcoming-potential-property-name-conflict-pivot","posts_count":74,"reply_count":51,"highest_post_number":76,"image_url":null,"created_at":"2021-01-26T17:37:55.868Z","last_posted_at":"2021-02-11T19:12:41.189Z","bumped":true,"bumped_at":"2021-02-11T19:12:41.189Z","archetype":"regular","unseen":false,"last_read_post_number":5,"unread":6,"new_posts":65,"pinned":false,"unpinned":null,"visible":true,"closed":false,"archived":false,"notification_level":3,"bookmarked":false,"liked":false,"tags":["studio"],"views":16748,"like_count":490,"has_summary":true,"last_poster_username":"tnavarts","category_id":36,"pinned_globally":false,"featured_link":null,"has_accepted_answer":false,"vote_count":0,"can_vote":false,"user_voted":false,"posters":[{"extras":"latest","description":"Автор, Последний автор","user_id":341046,"primary_group_id":41},{"extras":null,"description":"Частый автор","user_id":164536,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":300,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":27022,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":11348,"primary_group_id":null}]},{"id":993767,"title":"Changing the Mac Studio Command Keycode: Control vs Meta","fancy_title":"Changing the Mac Studio Command Keycode: Control vs Meta","slug":"changing-the-mac-studio-command-keycode-control-vs-meta","posts_count":16,"reply_count":5,"highest_post_number":17,"image_url":null,"created_at":"2021-01-19T22:05:17.218Z","last_posted_at":"2021-01-22T01:22:09.206Z","bumped":true,"bumped_at":"2021-01-22T01:22:09.206Z","archetype":"regular","unseen":false,"pinned":false,"unpinned":null,"visible":true,"closed":false,"archived":false,"bookmarked":null,"liked":null,"tags":["studio"],"views":14308,"like_count":166,"has_summary":false,"last_poster_username":"Optiplex3020SFF","category_id":36,"pinned_globally":false,"featured_link":null,"has_accepted_answer":false,"vote_count":0,"can_vote":false,"user_voted":false,"posters":[{"extras":null,"description":"Автор","user_id":350909,"primary_group_id":41},{"extras":null,"description":"Частый автор","user_id":200305,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":176552,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":17304,"primary_group_id":null},{"extras":"latest","description":"Последний автор","user_id":461567,"primary_group_id":null}]},{"id":984141,"title":"New Studio Beta: Attributes!","fancy_title":"New Studio Beta: Attributes!","slug":"new-studio-beta-attributes","posts_count":353,"reply_count":140,"highest_post_number":372,"image_url":"https://doy2mn9upadnk.cloudfront.net/uploads/default/original/4X/f/0/4/f04ea572324df16f6eb86f657ab0765c3b7c4779.png","created_at":"2021-01-14T23:57:24.805Z","last_posted_at":"2021-02-17T21:39:05.229Z","bumped":true,"bumped_at":"2021-02-17T21:39:05.229Z","archetype":"regular","unseen":false,"last_read_post_number":30,"unread":314,"new_posts":28,"pinned":false,"unpinned":null,"visible":true,"closed":false,"archived":false,"notification_level":3,"bookmarked":false,"liked":false,"tags":["studio","beta"],"views":36468,"like_count":1942,"has_summary":true,"last_poster_username":"Fire540Games","category_id":36,"pinned_globally":false,"featured_link":null,"has_accepted_answer":false,"vote_count":0,"can_vote":false,"user_voted":false,"posters":[{"extras":null,"description":"Автор","user_id":260389,"primary_group_id":41},{"extras":null,"description":"Частый автор","user_id":11348,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":163116,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":396736,"primary_group_id":null},{"extras":"latest","description":"Последний автор","user_id":105134,"primary_group_id":null}]},{"id":932576,"title":"New Terrain, and Parts, and Built-In Materials, Oh my!","fancy_title":"New Terrain, and Parts, and Built-In Materials, Oh my!","slug":"new-terrain-and-parts-and-built-in-materials-oh-my","posts_count":1155,"reply_count":358,"highest_post_number":1341,"image_url":"https://doy2mn9upadnk.cloudfront.net/uploads/default/optimized/4X/5/2/2/52240686713d0ec0b1b9ab802268030a8cb15627_2_1024x420.jpeg","created_at":"2020-12-19T00:22:20.801Z","last_posted_at":"2021-02-17T22:45:44.156Z","bumped":true,"bumped_at":"2021-02-17T22:45:44.156Z","archetype":"regular","unseen":false,"last_read_post_number":20,"unread":849,"new_posts":472,"pinned":false,"unpinned":null,"visible":true,"closed":false,"archived":false,"notification_level":3,"bookmarked":false,"liked":false,"tags":["studio","beta"],"views":100027,"like_count":7467,"has_summary":true,"last_poster_username":"ittrgrey","category_id":36,"pinned_globally":false,"featured_link":null,"has_accepted_answer":false,"vote_count":0,"can_vote":false,"user_voted":false,"posters":[{"extras":null,"description":"Автор","user_id":17941,"primary_group_id":41},{"extras":null,"description":"Частый автор","user_id":395244,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":351579,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":194130,"primary_group_id":null},{"extras":"latest","description":"Последний автор","user_id":7289,"primary_group_id":null}]},{"id":919991,"title":"Proximity Prompt Release","fancy_title":"Proximity Prompt Release","slug":"proximity-prompt-release","posts_count":161,"reply_count":96,"highest_post_number":228,"image_url":"https://doy2mn9upadnk.cloudfront.net/uploads/default/original/4X/5/a/8/5a8617595bc32d070053437b78e722f12f01e78a.gif","created_at":"2020-12-12T02:06:19.525Z","last_posted_at":"2021-02-16T02:45:15.238Z","bumped":true,"bumped_at":"2021-02-16T02:45:15.238Z","archetype":"regular","unseen":false,"last_read_post_number":205,"unread":22,"new_posts":1,"pinned":false,"unpinned":null,"visible":true,"closed":false,"archived":false,"notification_level":3,"bookmarked":false,"liked":false,"tags":["studio"],"views":33224,"like_count":941,"has_summary":true,"last_poster_username":"Miles_1king","category_id":36,"pinned_globally":false,"featured_link":null,"has_accepted_answer":false,"vote_count":0,"can_vote":false,"user_voted":false,"posters":[{"extras":null,"description":"Автор","user_id":350909,"primary_group_id":41},{"extras":null,"description":"Частый автор","user_id":451394,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":312723,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":51619,"primary_group_id":null},{"extras":"latest","description":"Последний автор","user_id":557246,"primary_group_id":null}]},{"id":904022,"title":"Asset Manager Phased Rollout","fancy_title":"Asset Manager Phased Rollout","slug":"asset-manager-phased-rollout","posts_count":75,"reply_count":42,"highest_post_number":82,"image_url":null,"created_at":"2020-12-03T19:15:44.962Z","last_posted_at":"2021-02-13T04:08:21.822Z","bumped":true,"bumped_at":"2021-02-13T04:08:21.822Z","archetype":"regular","unseen":false,"last_read_post_number":17,"unread":0,"new_posts":65,"pinned":false,"unpinned":null,"visible":true,"closed":false,"archived":false,"notification_level":3,"bookmarked":false,"liked":false,"tags":["studio","beta"],"views":20262,"like_count":339,"has_summary":true,"last_poster_username":"ItzDaSniper_ALT","category_id":36,"pinned_globally":false,"featured_link":null,"has_accepted_answer":false,"vote_count":0,"can_vote":false,"user_voted":false,"posters":[{"extras":null,"description":"Автор","user_id":285060,"primary_group_id":41},{"extras":null,"description":"Частый автор","user_id":417018,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":32451,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":45822,"primary_group_id":null},{"extras":"latest","description":"Последний автор","user_id":100697,"primary_group_id":null}]},{"id":898436,"title":"Expressive Output Window - Phased Rollout","fancy_title":"Expressive Output Window - Phased Rollout","slug":"expressive-output-window-phased-rollout","posts_count":35,"reply_count":9,"highest_post_number":38,"image_url":null,"created_at":"2020-11-30T21:14:57.519Z","last_posted_at":"2021-02-09T02:19:01.395Z","bumped":true,"bumped_at":"2021-02-09T02:19:01.395Z","archetype":"regular","unseen":false,"last_read_post_number":1,"unread":0,"new_posts":37,"pinned":false,"unpinned":null,"visible":true,"closed":false,"archived":false,"notification_level":3,"bookmarked":false,"liked":false,"tags":["studio","beta","output-window","output"],"views":11811,"like_count":255,"has_summary":false,"last_poster_username":"overflowed","category_id":36,"pinned_globally":false,"featured_link":null,"has_accepted_answer":false,"vote_count":0,"can_vote":false,"user_voted":false,"posters":[{"extras":null,"description":"Автор","user_id":192817,"primary_group_id":41},{"extras":null,"description":"Частый автор","user_id":3657,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":778,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":5316,"primary_group_id":null},{"extras":"latest","description":"Последний автор","user_id":230186,"primary_group_id":null}]},{"id":897999,"title":"[Activated!] New Part Physics API","fancy_title":"[Activated!] New Part Physics API","slug":"activated-new-part-physics-api","posts_count":80,"reply_count":43,"highest_post_number":83,"image_url":null,"created_at":"2020-11-30T18:30:16.161Z","last_posted_at":"2021-02-08T20:31:36.781Z","bumped":true,"bumped_at":"2021-02-08T20:31:36.781Z","archetype":"regular","unseen":false,"last_read_post_number":33,"unread":0,"new_posts":50,"pinned":false,"unpinned":null,"visible":true,"closed":false,"archived":false,"notification_level":3,"bookmarked":false,"liked":false,"tags":["studio","physics"],"views":15373,"like_count":456,"has_summary":true,"last_poster_username":"Phoninian","category_id":36,"pinned_globally":false,"featured_link":null,"has_accepted_answer":true,"vote_count":0,"can_vote":false,"user_voted":false,"posters":[{"extras":null,"description":"Автор","user_id":119859,"primary_group_id":41},{"extras":null,"description":"Частый автор","user_id":341046,"primary_group_id":41},{"extras":null,"description":"Частый автор","user_id":222257,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":36263,"primary_group_id":null},{"extras":"latest","description":"Последний автор","user_id":96898,"primary_group_id":null}]},{"id":878947,"title":"Luau Type Checking Release","fancy_title":"Luau Type Checking Release","slug":"luau-type-checking-release","posts_count":130,"reply_count":51,"highest_post_number":135,"image_url":"https://doy2mn9upadnk.cloudfront.net/uploads/default/original/4X/1/0/b/10b42bc7cc1bef0f79f6a79415c8a87435edf0c1.png","created_at":"2020-11-19T18:21:13.701Z","last_posted_at":"2021-02-09T20:39:33.667Z","bumped":true,"bumped_at":"2021-02-09T20:39:33.667Z","archetype":"regular","unseen":false,"pinned":false,"unpinned":null,"visible":true,"closed":false,"archived":false,"bookmarked":null,"liked":null,"tags":["scripting","studio","luau"],"views":15216,"like_count":507,"has_summary":true,"last_poster_username":"zeuxcg","category_id":36,"pinned_globally":false,"featured_link":null,"has_accepted_answer":false,"vote_count":0,"can_vote":false,"user_voted":false,"posters":[{"extras":"latest","description":"Автор, Последний автор","user_id":130,"primary_group_id":41},{"extras":null,"description":"Частый автор","user_id":346894,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":223,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":431,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":87089,"primary_group_id":null}]},{"id":877873,"title":"Introducing Bulk Audio Importing in Studio!","fancy_title":"Introducing Bulk Audio Importing in Studio!","slug":"introducing-bulk-audio-importing-in-studio","posts_count":55,"reply_count":19,"highest_post_number":60,"image_url":"https://doy2mn9upadnk.cloudfront.net/uploads/default/original/4X/e/f/b/efbc663dd66369ccc18459d2ec642cc45cff3414.png","created_at":"2020-11-19T00:00:47.997Z","last_posted_at":"2021-02-07T00:36:38.741Z","bumped":true,"bumped_at":"2021-02-07T00:36:38.741Z","archetype":"regular","unseen":false,"pinned":false,"unpinned":null,"visible":true,"closed":false,"archived":false,"bookmarked":null,"liked":null,"tags":["studio"],"views":13730,"like_count":562,"has_summary":true,"last_poster_username":"jacklollz2","category_id":36,"pinned_globally":false,"featured_link":null,"has_accepted_answer":false,"vote_count":0,"can_vote":false,"user_voted":false,"posters":[{"extras":null,"description":"Автор","user_id":134567,"primary_group_id":41},{"extras":null,"description":"Частый автор","user_id":214043,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":451394,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":393053,"primary_group_id":null},{"extras":"latest","description":"Последний автор","user_id":9518,"primary_group_id":null}]},{"id":877312,"title":"Introducing Plugin Script Modification Permissions","fancy_title":"Introducing Plugin Script Modification Permissions","slug":"introducing-plugin-script-modification-permissions","posts_count":76,"reply_count":28,"highest_post_number":86,"image_url":"https://doy2mn9upadnk.cloudfront.net/uploads/default/optimized/4X/5/a/6/5a645ea86f19c66297c1b763bf4e77541d5ed8ca_2_1024x401.png","created_at":"2020-11-18T18:26:04.109Z","last_posted_at":"2021-01-15T23:17:58.252Z","bumped":true,"bumped_at":"2021-01-15T23:17:58.252Z","archetype":"regular","unseen":false,"pinned":false,"unpinned":null,"visible":true,"closed":false,"archived":false,"bookmarked":null,"liked":null,"tags":["studio"],"views":11452,"like_count":422,"has_summary":true,"last_poster_username":"RuizuKun_Dev","category_id":36,"pinned_globally":false,"featured_link":null,"has_accepted_answer":false,"vote_count":0,"can_vote":false,"user_voted":false,"posters":[{"extras":null,"description":"Автор","user_id":134567,"primary_group_id":41},{"extras":null,"description":"Частый автор","user_id":34253,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":32226,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":317122,"primary_group_id":null},{"extras":"latest","description":"Последний автор","user_id":33762,"primary_group_id":null}]},{"id":874260,"title":"Script Editor - Semantic Highlighting and Temporary Tabs are now in Beta!","fancy_title":"Script Editor - Semantic Highlighting and Temporary Tabs are now in Beta!","slug":"script-editor-semantic-highlighting-and-temporary-tabs-are-now-in-beta","posts_count":201,"reply_count":99,"highest_post_number":205,"image_url":"https://doy2mn9upadnk.cloudfront.net/uploads/default/optimized/4X/5/d/c/5dce483b91353355e69c03ffd023388cfbbbeca2_2_1024x526.jpeg","created_at":"2020-11-16T21:18:47.223Z","last_posted_at":"2021-02-07T08:17:42.638Z","bumped":true,"bumped_at":"2021-02-07T08:17:42.638Z","archetype":"regular","unseen":false,"pinned":false,"unpinned":null,"visible":true,"closed":false,"archived":false,"bookmarked":null,"liked":null,"tags":["studio","beta"],"views":13036,"like_count":1056,"has_summary":true,"last_poster_username":"KrYn0MoRe","category_id":36,"pinned_globally":false,"featured_link":null,"has_accepted_answer":false,"vote_count":0,"can_vote":false,"user_voted":false,"posters":[{"extras":null,"description":"Автор","user_id":237547,"primary_group_id":41},{"extras":null,"description":"Частый автор","user_id":1045,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":27530,"primary_group_id":41},{"extras":null,"description":"Частый автор","user_id":47029,"primary_group_id":null},{"extras":"latest","description":"Последний автор","user_id":231587,"primary_group_id":null}]},{"id":744534,"title":"Studio is Ending Support for Mac OS X 10.10 (Yosemite)","fancy_title":"Studio is Ending Support for Mac OS X 10.10 (Yosemite)","slug":"studio-is-ending-support-for-mac-os-x-10-10-yosemite","posts_count":66,"reply_count":31,"highest_post_number":76,"image_url":null,"created_at":"2020-08-31T17:34:00.000Z","last_posted_at":"2021-01-26T22:14:45.165Z","bumped":true,"bumped_at":"2020-09-28T22:14:43.451Z","archetype":"regular","unseen":false,"pinned":false,"unpinned":null,"visible":true,"closed":true,"archived":false,"bookmarked":null,"liked":null,"tags":["studio"],"views":50641,"like_count":451,"has_summary":true,"last_poster_username":"system","category_id":36,"pinned_globally":false,"featured_link":null,"has_accepted_answer":false,"vote_count":0,"can_vote":false,"user_voted":false,"posters":[{"extras":null,"description":"Автор","user_id":285060,"primary_group_id":41},{"extras":null,"description":"Частый автор","user_id":347486,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":416893,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":33422,"primary_group_id":null},{"extras":"latest","description":"Последний автор","user_id":-1,"primary_group_id":null}]},{"id":746146,"title":"Display All Permissions for Group Games","fancy_title":"Display All Permissions for Group Games","slug":"display-all-permissions-for-group-games","posts_count":12,"reply_count":8,"highest_post_number":20,"image_url":null,"created_at":"2020-08-28T17:31:49.301Z","last_posted_at":"2021-01-22T17:15:00.609Z","bumped":true,"bumped_at":"2020-09-24T17:15:00.254Z","archetype":"regular","unseen":false,"last_read_post_number":20,"unread":0,"new_posts":0,"pinned":false,"unpinned":null,"visible":true,"closed":true,"archived":false,"notification_level":3,"bookmarked":false,"liked":false,"tags":["studio"],"views":43683,"like_count":251,"has_summary":false,"last_poster_username":"coefficients","category_id":36,"pinned_globally":false,"featured_link":null,"has_accepted_answer":false,"vote_count":0,"can_vote":false,"user_voted":false,"posters":[{"extras":"latest","description":"Автор, Последний автор","user_id":112950,"primary_group_id":41},{"extras":null,"description":"Частый автор","user_id":419793,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":57718,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":3052,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":26244,"primary_group_id":null}]},{"id":722215,"title":"Finale of Part Surface Changes: No More Hinges","fancy_title":"Finale of Part Surface Changes: No More Hinges","slug":"finale-of-part-surface-changes-no-more-hinges","posts_count":133,"reply_count":67,"highest_post_number":143,"image_url":"https://doy2mn9upadnk.cloudfront.net/uploads/default/original/4X/d/9/b/d9bdfde1668446e0037867a9dcbd49dcc685b7eb.gif","created_at":"2020-08-13T18:09:27.690Z","last_posted_at":"2020-12-08T19:04:09.193Z","bumped":true,"bumped_at":"2020-12-08T19:04:09.193Z","archetype":"regular","unseen":false,"pinned":false,"unpinned":null,"visible":true,"closed":false,"archived":false,"bookmarked":null,"liked":null,"tags":["building","studio","physics"],"views":25124,"like_count":885,"has_summary":true,"last_poster_username":"TheSenorDuck","category_id":36,"pinned_globally":false,"featured_link":null,"has_accepted_answer":false,"vote_count":0,"can_vote":false,"user_voted":false,"posters":[{"extras":null,"description":"Автор","user_id":119859,"primary_group_id":41},{"extras":null,"description":"Частый автор","user_id":2791,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":11348,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":341046,"primary_group_id":41},{"extras":"latest","description":"Последний автор","user_id":431740,"primary_group_id":null}]},{"id":705528,"title":"Skinned MeshPart Studio Beta","fancy_title":"Skinned MeshPart Studio Beta","slug":"skinned-meshpart-studio-beta","posts_count":345,"reply_count":207,"highest_post_number":358,"image_url":"https://doy2mn9upadnk.cloudfront.net/uploads/default/original/4X/a/8/7/a8786999b226cbb244060442b7e3fc04154267ae.png","created_at":"2020-08-03T22:59:46.002Z","last_posted_at":"2020-12-02T00:04:48.733Z","bumped":true,"bumped_at":"2020-12-01T21:30:40.306Z","archetype":"regular","unseen":false,"pinned":false,"unpinned":null,"visible":true,"closed":true,"archived":false,"bookmarked":null,"liked":null,"tags":["studio","modeling","rendering"],"views":49892,"like_count":2218,"has_summary":true,"last_poster_username":"mothmage","category_id":36,"pinned_globally":false,"featured_link":null,"has_accepted_answer":false,"vote_count":0,"can_vote":false,"user_voted":false,"posters":[{"extras":null,"description":"Автор","user_id":155602,"primary_group_id":41},{"extras":null,"description":"Частый автор","user_id":6350,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":8849,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":241899,"primary_group_id":null},{"extras":"latest","description":"Последний автор","user_id":789,"primary_group_id":null}]},{"id":674209,"title":"Introducing Two Game Security Settings: Third Party Sales & Cross Game Teleports","fancy_title":"Introducing Two Game Security Settings: Third Party Sales &amp; Cross Game Teleports","slug":"introducing-two-game-security-settings-third-party-sales-cross-game-teleports","posts_count":100,"reply_count":28,"highest_post_number":120,"image_url":"https://doy2mn9upadnk.cloudfront.net/uploads/default/original/4X/0/c/7/0c776e4648a634d0c17287869c13fbdb790f7f36.png","created_at":"2020-07-16T00:43:28.114Z","last_posted_at":"2020-11-11T21:06:01.454Z","bumped":true,"bumped_at":"2021-01-22T16:14:45.381Z","archetype":"regular","unseen":false,"pinned":false,"unpinned":null,"visible":true,"closed":false,"archived":false,"bookmarked":null,"liked":null,"tags":["studio"],"views":33642,"like_count":735,"has_summary":true,"last_poster_username":"LuukOriginal","category_id":36,"pinned_globally":false,"featured_link":null,"has_accepted_answer":false,"vote_count":0,"can_vote":false,"user_voted":false,"posters":[{"extras":null,"description":"Автор","user_id":134567,"primary_group_id":41},{"extras":null,"description":"Частый автор","user_id":273497,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":120247,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":38549,"primary_group_id":null},{"extras":"latest","description":"Последний автор","user_id":139902,"primary_group_id":null}]},{"id":663449,"title":"SurfaceAppearance Studio Beta","fancy_title":"SurfaceAppearance Studio Beta","slug":"surfaceappearance-studio-beta","posts_count":415,"reply_count":186,"highest_post_number":437,"image_url":"https://doy2mn9upadnk.cloudfront.net/uploads/default/original/4X/5/f/c/5fca97d93e86876dbb3ee5bd2adfa3b5f699bcfd.png","created_at":"2020-07-09T18:58:00.000Z","last_posted_at":"2021-02-15T21:51:59.958Z","bumped":true,"bumped_at":"2021-02-15T21:51:59.958Z","archetype":"regular","unseen":false,"last_read_post_number":43,"unread":55,"new_posts":339,"pinned":false,"unpinned":null,"visible":true,"closed":false,"archived":false,"notification_level":3,"bookmarked":false,"liked":false,"tags":["studio"],"views":68064,"like_count":4562,"has_summary":true,"last_poster_username":"Plutonem","category_id":36,"pinned_globally":false,"featured_link":null,"has_accepted_answer":false,"vote_count":0,"can_vote":false,"user_voted":false,"posters":[{"extras":null,"description":"Автор","user_id":38606,"primary_group_id":41},{"extras":null,"description":"Частый автор","user_id":31496,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":326221,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":304229,"primary_group_id":null},{"extras":"latest","description":"Последний автор","user_id":357,"primary_group_id":null}]},{"id":662464,"title":"New Beta Feature: LevelOfDetail Property for Models (Enabled Globally)","fancy_title":"New Beta Feature: LevelOfDetail Property for Models (Enabled Globally)","slug":"new-beta-feature-levelofdetail-property-for-models-enabled-globally","posts_count":51,"reply_count":18,"highest_post_number":52,"image_url":"https://doy2mn9upadnk.cloudfront.net/uploads/default/original/4X/d/e/b/deb938a882c680f766fa49d5a3b8a16f2e56b39f.png","created_at":"2020-07-08T05:12:01.996Z","last_posted_at":"2021-01-06T09:49:20.839Z","bumped":true,"bumped_at":"2021-01-06T09:49:20.839Z","archetype":"regular","unseen":false,"pinned":false,"unpinned":null,"visible":true,"closed":false,"archived":false,"bookmarked":null,"liked":null,"tags":["studio","modeling","rendering","networking"],"views":11907,"like_count":502,"has_summary":true,"last_poster_username":"Vasilakious","category_id":36,"pinned_globally":false,"featured_link":null,"has_accepted_answer":false,"vote_count":0,"can_vote":false,"user_voted":false,"posters":[{"extras":null,"description":"Автор","user_id":281177,"primary_group_id":41},{"extras":null,"description":"Частый автор","user_id":1227,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":439104,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":224996,"primary_group_id":null},{"extras":"latest","description":"Последний автор","user_id":92183,"primary_group_id":null}]},{"id":644467,"title":"New RaycastParams Property, Deprecating Old Raycast Functions","fancy_title":"New RaycastParams Property, Deprecating Old Raycast Functions","slug":"new-raycastparams-property-deprecating-old-raycast-functions","posts_count":91,"reply_count":53,"highest_post_number":95,"image_url":"https://doy2mn9upadnk.cloudfront.net/uploads/default/original/4X/d/3/2/d32b1ab64c2f0a4da24ffbe7450e8c6b251010f6.png","created_at":"2020-06-26T00:21:46.173Z","last_posted_at":"2021-01-01T22:29:39.110Z","bumped":true,"bumped_at":"2021-01-01T21:59:42.756Z","archetype":"regular","unseen":false,"pinned":false,"unpinned":null,"visible":true,"closed":true,"archived":false,"bookmarked":null,"liked":null,"tags":["studio","physics"],"views":13036,"like_count":396,"has_summary":true,"last_poster_username":"buildthomas","category_id":36,"pinned_globally":false,"featured_link":null,"has_accepted_answer":false,"vote_count":0,"can_vote":false,"user_voted":false,"posters":[{"extras":null,"description":"Автор","user_id":119859,"primary_group_id":41},{"extras":null,"description":"Частый автор","user_id":431,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":9593,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":7351,"primary_group_id":null},{"extras":"latest","description":"Последний автор","user_id":643,"primary_group_id":null}]},{"id":642684,"title":"Expressive Output Window - Beta","fancy_title":"Expressive Output Window - Beta","slug":"expressive-output-window-beta","posts_count":153,"reply_count":44,"highest_post_number":170,"image_url":null,"created_at":"2020-06-25T19:30:00.000Z","last_posted_at":"2020-12-05T18:24:48.359Z","bumped":true,"bumped_at":"2020-12-05T18:32:03.488Z","archetype":"regular","unseen":false,"last_read_post_number":107,"unread":0,"new_posts":63,"pinned":false,"unpinned":null,"visible":true,"closed":false,"archived":false,"notification_level":3,"bookmarked":false,"liked":false,"tags":["studio","output-window"],"views":23650,"like_count":1181,"has_summary":true,"last_poster_username":"Dummy_Tested","category_id":36,"pinned_globally":false,"featured_link":null,"has_accepted_answer":false,"vote_count":0,"can_vote":false,"user_voted":false,"posters":[{"extras":null,"description":"Автор","user_id":192817,"primary_group_id":41},{"extras":null,"description":"Частый автор","user_id":153142,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":86089,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":220864,"primary_group_id":null},{"extras":"latest","description":"Последний автор","user_id":186756,"primary_group_id":null}]},{"id":643907,"title":"Universal Breakpoints Beta - One Breakpoint to Rule Them All","fancy_title":"Universal Breakpoints Beta - One Breakpoint to Rule Them All","slug":"universal-breakpoints-beta-one-breakpoint-to-rule-them-all","posts_count":18,"reply_count":3,"highest_post_number":21,"image_url":null,"created_at":"2020-06-25T18:28:25.069Z","last_posted_at":"2020-11-26T15:43:44.683Z","bumped":true,"bumped_at":"2020-07-29T15:43:43.770Z","archetype":"regular","unseen":false,"pinned":false,"unpinned":null,"visible":true,"closed":true,"archived":false,"bookmarked":null,"liked":null,"tags":["studio","debugger"],"views":11147,"like_count":140,"has_summary":false,"last_poster_username":"system","category_id":36,"pinned_globally":false,"featured_link":null,"has_accepted_answer":false,"vote_count":0,"can_vote":false,"user_voted":false,"posters":[{"extras":null,"description":"Автор","user_id":192817,"primary_group_id":41},{"extras":null,"description":"Частый автор","user_id":112950,"primary_group_id":41},{"extras":null,"description":"Частый автор","user_id":120247,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":23710,"primary_group_id":null},{"extras":"latest","description":"Последний автор","user_id":-1,"primary_group_id":null}]},{"id":642282,"title":"Additional Game Management in Roblox Studio","fancy_title":"Additional Game Management in Roblox Studio","slug":"additional-game-management-in-roblox-studio","posts_count":88,"reply_count":21,"highest_post_number":92,"image_url":"https://doy2mn9upadnk.cloudfront.net/uploads/default/optimized/4X/e/2/4/e24da11e138f564733aabacad3558b95a720830c_2_1023x638.png","created_at":"2020-06-24T23:21:00.000Z","last_posted_at":"2020-12-22T12:36:54.093Z","bumped":true,"bumped_at":"2020-08-24T12:36:47.186Z","archetype":"regular","unseen":false,"last_read_post_number":82,"unread":2,"new_posts":8,"pinned":false,"unpinned":null,"visible":true,"closed":true,"archived":false,"notification_level":3,"bookmarked":false,"liked":false,"tags":["studio"],"views":12540,"like_count":421,"has_summary":true,"last_poster_username":"system","category_id":36,"pinned_globally":false,"featured_link":null,"has_accepted_answer":true,"vote_count":0,"can_vote":false,"user_voted":false,"posters":[{"extras":null,"description":"Автор","user_id":33422,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":77150,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":306008,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":103015,"primary_group_id":null},{"extras":"latest","description":"Последний автор","user_id":-1,"primary_group_id":null}]},{"id":639903,"title":"Future Is Bright: Phase 3 - Studio Beta","fancy_title":"Future Is Bright: Phase 3 - Studio Beta","slug":"future-is-bright-phase-3-studio-beta","posts_count":1160,"reply_count":657,"highest_post_number":1233,"image_url":"https://doy2mn9upadnk.cloudfront.net/uploads/default/original/4X/e/6/4/e643cf506a8ac153c7720bab4af414a88eaf0a9a.png","created_at":"2020-06-23T09:13:23.197Z","last_posted_at":"2021-02-04T17:43:41.911Z","bumped":true,"bumped_at":"2021-02-04T17:43:41.911Z","archetype":"regular","unseen":false,"pinned":false,"unpinned":null,"visible":true,"closed":false,"archived":false,"bookmarked":null,"liked":null,"tags":["building","studio"],"views":97604,"like_count":12547,"has_summary":true,"last_poster_username":"DoctorNO2106","category_id":36,"pinned_globally":false,"featured_link":null,"has_accepted_answer":false,"vote_count":0,"can_vote":false,"user_voted":false,"posters":[{"extras":null,"description":"Автор","user_id":210201,"primary_group_id":41},{"extras":null,"description":"Частый автор","user_id":12817,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":380713,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":289807,"primary_group_id":null},{"extras":"latest","description":"Последний автор","user_id":317122,"primary_group_id":null}]},{"id":623350,"title":"Plugin Debugging: New Beta Feature!","fancy_title":"Plugin Debugging: New Beta Feature!","slug":"plugin-debugging-new-beta-feature","posts_count":42,"reply_count":13,"highest_post_number":42,"image_url":null,"created_at":"2020-06-12T22:29:13.391Z","last_posted_at":"2020-12-18T17:38:25.942Z","bumped":true,"bumped_at":"2021-02-13T17:57:38.712Z","archetype":"regular","unseen":false,"last_read_post_number":6,"unread":36,"new_posts":0,"pinned":false,"unpinned":null,"visible":true,"closed":false,"archived":false,"notification_level":3,"bookmarked":false,"liked":false,"tags":["studio"],"views":12535,"like_count":287,"has_summary":false,"last_poster_username":"Eternalove_fan32","category_id":36,"pinned_globally":false,"featured_link":null,"has_accepted_answer":false,"vote_count":0,"can_vote":false,"user_voted":false,"posters":[{"extras":null,"description":"Автор","user_id":10734,"primary_group_id":41},{"extras":null,"description":"Частый автор","user_id":363802,"primary_group_id":50},{"extras":null,"description":"Частый автор","user_id":341046,"primary_group_id":41},{"extras":null,"description":"Частый автор","user_id":223,"primary_group_id":null},{"extras":"latest","description":"Последний автор","user_id":224243,"primary_group_id":null}]},{"id":582921,"title":"Script Editor - New Foundation and First Features","fancy_title":"Script Editor - New Foundation and First Features","slug":"script-editor-new-foundation-and-first-features","posts_count":104,"reply_count":42,"highest_post_number":106,"image_url":"https://doy2mn9upadnk.cloudfront.net/uploads/default/original/4X/1/9/1/191215aedf29cd0902640dcd2faffcdcfe1faeda.jpeg","created_at":"2020-06-11T18:09:00.000Z","last_posted_at":"2020-11-18T13:40:56.854Z","bumped":true,"bumped_at":"2020-07-21T13:40:56.784Z","archetype":"regular","unseen":false,"last_read_post_number":6,"unread":94,"new_posts":6,"pinned":false,"unpinned":null,"visible":true,"closed":true,"archived":false,"notification_level":3,"bookmarked":false,"liked":false,"tags":["studio","script-editor"],"views":23750,"like_count":602,"has_summary":true,"last_poster_username":"system","category_id":36,"pinned_globally":false,"featured_link":null,"has_accepted_answer":false,"vote_count":0,"can_vote":false,"user_voted":false,"posters":[{"extras":null,"description":"Автор","user_id":192817,"primary_group_id":41},{"extras":null,"description":"Частый автор","user_id":778,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":12817,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":84276,"primary_group_id":null},{"extras":"latest","description":"Последний автор","user_id":-1,"primary_group_id":null}]},{"id":552810,"title":"Introducing SmoothingAngle property for PartOperation (Enabled Globally)","fancy_title":"Introducing SmoothingAngle property for PartOperation (Enabled Globally)","slug":"introducing-smoothingangle-property-for-partoperation-enabled-globally","posts_count":103,"reply_count":33,"highest_post_number":106,"image_url":"https://doy2mn9upadnk.cloudfront.net/uploads/default/original/4X/0/7/c/07c3ad00b386afbf9cc8924d69c86bceecfe003c.png","created_at":"2020-05-06T21:42:00.000Z","last_posted_at":"2020-09-09T11:12:18.309Z","bumped":true,"bumped_at":"2020-08-04T18:46:27.868Z","archetype":"regular","unseen":false,"pinned":false,"unpinned":null,"visible":true,"closed":true,"archived":false,"bookmarked":null,"liked":null,"tags":["studio","csg","csgv2"],"views":36298,"like_count":855,"has_summary":true,"last_poster_username":"system","category_id":36,"pinned_globally":false,"featured_link":null,"has_accepted_answer":false,"vote_count":0,"can_vote":false,"user_voted":false,"posters":[{"extras":null,"description":"Автор","user_id":281177,"primary_group_id":41},{"extras":null,"description":"Частый автор","user_id":317063,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":14154,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":202896,"primary_group_id":null},{"extras":"latest","description":"Последний автор","user_id":-1,"primary_group_id":null}]},{"id":529077,"title":"New Studio Feature - CollisionFidelity.PreciseConvexDecomposition (Enabled Globally)","fancy_title":"New Studio Feature - CollisionFidelity.PreciseConvexDecomposition (Enabled Globally)","slug":"new-studio-feature-collisionfidelity-preciseconvexdecomposition-enabled-globally","posts_count":140,"reply_count":59,"highest_post_number":146,"image_url":"https://doy2mn9upadnk.cloudfront.net/uploads/default/original/4X/1/f/d/1fd823f35f415e8e12eee67d842f70f638f38c5a.png","created_at":"2020-04-17T14:59:53.209Z","last_posted_at":"2021-01-03T23:10:39.815Z","bumped":true,"bumped_at":"2021-01-03T23:14:21.658Z","archetype":"regular","unseen":false,"last_read_post_number":2,"unread":136,"new_posts":8,"pinned":false,"unpinned":null,"visible":true,"closed":false,"archived":false,"notification_level":3,"bookmarked":false,"liked":false,"tags":["studio"],"views":50555,"like_count":862,"has_summary":true,"last_poster_username":"TheGreat_Scott","category_id":36,"pinned_globally":false,"featured_link":null,"has_accepted_answer":false,"vote_count":0,"can_vote":false,"user_voted":false,"posters":[{"extras":null,"description":"Автор","user_id":201,"primary_group_id":41},{"extras":null,"description":"Частый автор","user_id":300,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":85229,"primary_group_id":null},{"extras":null,"description":"Частый автор","user_id":186768,"primary_group_id":null},{"extras":"latest","description":"Последний автор","user_id":286481,"primary_group_id":null}]}]}})
})

app.get("/my/settings/json", (req, res) => {
    res.json({"PreviousUserNames":"","UserId":1,"Name":"df","UseSuperSafePrivacyMode":false,"IsSuperSafeModeEnabledForPrivacySetting":false,"UseSuperSafeChat":false,"IsAppChatSettingEnabled":true,"IsGameChatSettingEnabled":true,"IsAccountPrivacySettingsV2Enabled":true,"IsSetPasswordNotificationEnabled":false,"ChangePasswordRequiresTwoStepVerification":false,"ChangeEmailRequiresTwoStepVerification":false,"UserEmail":"","IsEmailOnFile":false,"UserEmailMasked":true,"IsEmailVerified":false,"UserEmailVerified":false,"CanHideInventory":false,"CanTrade":false,"MissingParentEmail":false,"IsUpdateEmailSectionShown":false,"IsUnder13UpdateEmailMessageSectionShown":false,"IsUserConnectedToFacebook":false,"IsTwoStepToggleEnabled":false,"AgeBracket":0,"UserAbove13":true,"ClientIpAddress":"123.123.123.123","AccountAgeInDays":0,"IsOBC":false,"IsTBC":false,"IsAnyBC":false,"IsPremium":false,"IsBcRenewalMembership":false,"BcExpireDate":"/Date(-0)/","BcRenewalPeriod":null,"BcLevel":null,"HasCurrencyOperationError":false,"CurrencyOperationErrorMessage":null,"BlockedUsersModel":{"BlockedUserIds":[],"BlockedUsers":[],"MaxBlockedUsers":50,"Total":1,"Page":1},"Tab":null,"ChangePassword":false,"IsAccountPinEnabled":false,"IsAccountRestrictionsFeatureEnabled":true,"IsAccountRestrictionsSettingEnabled":false,"IsAccountSettingsSocialNetworksV2Enabled":false,"IsUiBootstrapModalV2Enabled":true,"IsI18nBirthdayPickerInAccountSettingsEnabled":true,"InApp":false,"MyAccountSecurityModel":{"IsEmailSet":false,"IsEmailVerified":false,"IsTwoStepEnabled":false,"ShowSignOutFromAllSessions":true,"TwoStepVerificationViewModel":{"UserId":1,"IsEnabled":true,"CodeLength":0,"ValidCodeCharacters":null}},"ApiProxyDomain":"https://www.mete0r.xyz","AccountSettingsApiDomain":"https://www.mete0r.xyz","AuthDomain":"https://www.mete0r.xyz","IsDisconnectFbSocialSignOnEnabled":true,"IsDisconnectXboxEnabled":true,"NotificationSettingsDomain":"https://www.mete0r.xyz","AllowedNotificationSourceTypes":["Test","FriendRequestReceived","FriendRequestAccepted","PartyInviteReceived","PartyMemberJoined","ChatNewMessage","PrivateMessageReceived","UserAddedToPrivateServerWhiteList","ConversationUniverseChanged","TeamCreateInvite","GameUpdate","DeveloperMetricsAvailable"],"AllowedReceiverDestinationTypes":["DesktopPush","NotificationStream"],"BlacklistedNotificationSourceTypesForMobilePush":[],"MinimumChromeVersionForPushNotifications":50,"PushNotificationsEnabledOnFirefox":true,"LocaleApiDomain":"https://www.mete0r.xyz","HasValidPasswordSet":true,"IsUpdateEmailApiEndpointEnabled":true,"FastTrackMember":null,"IsFastTrackAccessible":false,"HasFreeNameChange":false,"IsAgeDownEnabled":true,"IsSendVerifyEmailApiEndpointEnabled":true,"IsPromotionChannelsEndpointEnabled":true,"ReceiveNewsletter":false,"SocialNetworksVisibilityPrivacy":6,"SocialNetworksVisibilityPrivacyValue":"AllUsers","Facebook":null,"Twitter":null,"YouTube":null,"Twitch":null})
})

const userinfoClient = require('./routes/userinfoclient.js');

app.use('/',userinfoClient)

app.get('/metrics',async (req, res) => {
    res.set('Content-Type', client.register.contentType)
    res.end(await client.register.metrics())
  })
  
app.disable('etag');

app.get('/currency/balance',requireAuth, (req, res) => {
    return res.json({
        "robux": req.userdocument.coins,
        "tickets": 0
    })
})

app.post('/device/initialize', (req, res) => {
    return res.json({"browserTrackerId":1,"appDeviceIdentifier":null})
})
app.post('/login/v1/', (req, res) => {
        return res.json({
            "userId": "12345"
         })
})
app.get('/my/account/json', (req, res) => {
    return res.json({
        AgeBracket : 0,
        Email :     {
            IsVerified : 1,
            Value : "kmulherin@roblox.com",
        },
        HasPasswordSet : 1,
        Username : "iMightBeLying"
     })
})
app.get('/ab/v1/enroll', (req, res) => {
    return res.json({"baller":"baller"})
})

app.get('/GetAllowedMD5Hashes', (req, res) => {
    return res.json({"data":["7ede9e9841e46b0538c3b684d979f759","268b4bb9ffcc0586cc13fbbb3e4de16f"]})
})

app.get('/GetAllowedSecurityVersions', (req, res) => {
    return res.json({"data":["0.347.0pcplayer"]})
})

app.get('/asset-thumbnail/json', (req, res) => {
    return res.json({"Url":"https://mete0r.xyz/assets/images/lol.png","Final":true,"SubstitutionType":0})
})

app.get('/avatar-thumbnail/json', (req, res) => {
    return res.json({"Url":"https://mete0r.xyz/api/thumbnailrender/?id="+req.query.userId,"Final":true,"SubstitutionType":0})
})

app.get('/v1.1/avatar-fetch',async (req, res) => { // 2018 charapp
    //console.log(req.headers)
    const userid = req.query?.userId
    const placeId = req.query?.placeId??0
    const doc = await user.findOne({userid: userid})
    const placedoc = await games.findOne({idofgame: placeId})
    if (!doc){
        return res.json({status:"error",error:"User not found."})
    }
    if (!placedoc){
        return res.json({status:"error",error:"Place not found."})
    }
    //console.log(doc.colors)
    let json = {"resolvedAvatarType":doc.avatartype??"R6","accessoryVersionIds":[],"equippedGearVersionIds":[],"backpackGearVersionIds":[],"bodyColors":{"HeadColor":parseFloat(doc.colors.find(x => x.name === 'Head').value),"LeftArmColor":parseFloat(doc.colors.find(x => x.name === 'Left Arm').value),"LeftLegColor":parseFloat(doc.colors.find(x => x.name === 'Left Leg').value),"RightArmColor":parseFloat(doc.colors.find(x => x.name === 'Right Arm').value),"RightLegColor":parseFloat(doc.colors.find(x => x.name === 'Right Leg').value),"TorsoColor":parseFloat(doc.colors.find(x => x.name === 'Torso').value)},"animations":{},"scales":{"Width":1.0000,"Height":1.0000,"Head":1.0000,"Depth":1.00,"Proportion":0.0000,"BodyType":0.0000}}
    if (!doc.inventory){
        return res.json(json)
    }
    for (var key of doc.inventory) {
        if (key.Equipped === true){
            if (placedoc.gearallowed??false === true){
            json.accessoryVersionIds.push(parseFloat(key.ItemId))
            }else{
                if (key.Type != "Gears"){
                    json.accessoryVersionIds.push(parseFloat(key.ItemId))
                }
            }
        }
    }
    //console.log(json.accessoryVersionIds)
    return res.json(json)
})

app.get('/v1/avatar-fetch',async (req, res) => { // 2020 charapp
    //console.log(req.headers)
    const userid = req.query?.userId
    const placeId = req.query?.placeId??0
    const doc = await user.findOne({userid: userid})
    const placedoc = await games.findOne({idofgame: placeId})
    if (!doc){
        return res.json({status:"error",error:"User not found."})
    }
    if (!placedoc){
        return res.json({status:"error",error:"Place not found."})
    }
    if (req.headers?.['roblox-game-id'] === "render"){
        // 2020 render needs v1.1 colors
        let json = {"resolvedAvatarType":doc.avatartype??"R6","accessoryVersionIds":[],"equippedGearVersionIds":[],"backpackGearVersionIds":[],"bodyColors":{"HeadColor":parseFloat(doc.colors.find(x => x.name === 'Head').value),"LeftArmColor":parseFloat(doc.colors.find(x => x.name === 'Left Arm').value),"LeftLegColor":parseFloat(doc.colors.find(x => x.name === 'Left Leg').value),"RightArmColor":parseFloat(doc.colors.find(x => x.name === 'Right Arm').value),"RightLegColor":parseFloat(doc.colors.find(x => x.name === 'Right Leg').value),"TorsoColor":parseFloat(doc.colors.find(x => x.name === 'Torso').value)},"animations":{},"scales":{"Width":1.0000,"Height":1.0000,"Head":1.0000,"Depth":1.00,"Proportion":0.0000,"BodyType":0.0000}}
        if (!doc.inventory){
            return res.json(json)
        }
        for (var key of doc.inventory) {
            if (key.Equipped === true){
                json.accessoryVersionIds.push(parseFloat(key.ItemId))
            }
        }
        //console.log(json.accessoryVersionIds)
        return res.json(json)
    }
    //console.log(doc.colors)
    let json = {"resolvedAvatarType":doc.avatartype??"R6","assetAndAssetTypeIds":[],"equippedGearVersionIds":[],"backpackGearVersionIds":[],"bodyColors":{"headColorId":parseFloat(doc.colors.find(x => x.name === 'Head').value),"leftArmColorId":parseFloat(doc.colors.find(x => x.name === 'Left Arm').value),"leftLegColorId":parseFloat(doc.colors.find(x => x.name === 'Left Leg').value),"rightArmColorId":parseFloat(doc.colors.find(x => x.name === 'Right Arm').value),"rightLegColorId":parseFloat(doc.colors.find(x => x.name === 'Right Leg').value),"torsoColorId":parseFloat(doc.colors.find(x => x.name === 'Torso').value)},"animations":{},"scales":{"Width":1.0000,"Height":1.0000,"Head":1.0000,"Depth":1.00,"Proportion":0.0000,"BodyType":0.0000}, "emotes":[]}
    if (!doc.inventory){
        return res.json(json)
    }
    let currentEmotePosition = 1
    for (var key of doc.inventory) {
        if (key.Equipped === true){

            if (key.Type === "Emotes" && currentEmotePosition <= 8){
                json.emotes.push({"assetId":parseFloat(key.ItemId),"assetName":key.ItemName,"position": currentEmotePosition})
                currentEmotePosition += 1
            }
            let gearallowed = placedoc.gearallowed??false

                if ((gearallowed === true) && key.Type != "Emotes"){
                    json.assetAndAssetTypeIds.push({"assetId":parseFloat(key.ItemId),"assetTypeId":8})
                }else if ((gearallowed === false) && key.Type != "Emotes"){
                    if (key.Type != "Gears"){
                        json.assetAndAssetTypeIds.push({"assetId":parseFloat(key.ItemId),"assetTypeId":8})
                    }
                }
        }
    }
    //console.log(json.accessoryVersionIds)
    return res.json(json)
})

app.get('/v2/users/:id/groups/roles',async (req, res) => { // 2020 admin badge
    
    const userid = req.params?.id
    const doc = await user.findOne({userid: userid})
    if (!doc){
        return res.json({status:"error",error:"User not found."})
    }
    if (doc.admin === true){
        return res.json({
            "data": [
              {
                "group": {
                  "id": 1200769,
                  "name": "Official Group of Roblox",
                  "memberCount": 1976,
                  "hasVerifiedBadge": false
                },
                "role": {
                  "id": 41221804,
                  "name": "Team Member",
                  "rank": 20
                }
              }
            ]
          })
    }
    return res.json({
        "data": []
    })



})

app.all('/v1.1/game-start-info/',async (req, res) => { // 2020 game settings
    const placeid = req.query.universeId??0
    const doc = await games.findOne({idofgame: placeid})
    if (!doc){
        return res.json({status:"error",error:"Game not found."})
    }
    const json = {"gameAvatarType":"PlayerChoice","allowCustomAnimations":"True","universeAvatarCollisionType":"OuterBox","universeAvatarBodyType":"Standard","jointPositioningType":"ArtistIntent","message":"","universeAvatarMinScales":{"height":0.90,"width":0.70,"head":0.95,"depth":0.0,"proportion":0.00,"bodyType":0.00},"universeAvatarMaxScales":{"height":1.05,"width":1.00,"head":1.00,"depth":0.0,"proportion":0.00,"bodyType":0.00},"universeAvatarAssetOverrides":[],"moderationStatus":null}

    json.gameAvatarType = doc.avatartype??"PlayerChoice"
    if (doc.avatartype){
        json.gameAvatarType = "MorphTo"+json.gameAvatarType
    }
    return res.json(json)
})

app.all(['//moderation/v2/filtertext','/moderation/v2/filtertext'], (req, res) => {
    const filtered = [
        'faggot',
        'nigger',
        'nigga',
        'sex'
    ]
    let filteredtext = req.body?.text
    if (filtered.includes(filteredtext) === true || filtered.some(substr => filteredtext.toLowerCase().startsWith(substr.toLowerCase())) === true){
        //filteredtext = '#'.repeat(req.body?.text?.length)
        //filteredtext = filteredtext.replaceAll(filtered,"#")
        let regex
        for (var i = 0; i < filtered.length; i++) {
            regex = new RegExp(filtered[i], "g");
            filteredtext = filteredtext.replace(regex, "#".repeat(filtered[i].length));
        }
    }
    //console.log(req.body)
    return res.json({
        "data": {
            "AgeUnder13": filteredtext,
            "Age13OrOver": filteredtext
        },
        "success": true
    })
})

app.post("/v2/login", (req, res) => {
    //console.log(req.body)
    return res.json({
        "user": {
          "id": 1,
          "name": "bruh"
        },
        "isBanned": false
      })
})

app.all('/v1/login', (req, res) => {
    //console.log(req.body)
    res.cookie('.ROBLOSECURITY','_|WARNING:-DO-NOT-SHARE-THIS.--Sharing-this-will-allow-someone-to-log-in-as-you-and-to-steal-your-ROBUX-and-items.|_DGJJD464646464dfgdgdgdCUdgjneth4iht4ih64uh4uihy4y4yuhi4yhuiyhui4yhui4uihy4huiyhu4iyhuihu4hhdghdgihdigdhuigdhuigidhugihugdgidojgijodijogdijogdjoigdjoidijogijodgijdgiojdgijodgijoF')
    res.cookie('.RBXID','_|WARNING:-DO-NOT-SHARE-THIS.--Sharing-this-will-allow-someone-to-log-in-as-you-and-to-steal-your-ROBUX-and-items.|_eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiI2NDA3MGQyNC0zYWR4LTQ5NzMtODAxYy0yOWNhNzUyNTA5NjIiLCJzdWfdijogdoijdijogijodcB6YExhM')
    return res.json({ "user":{ "id":1, "name":"Shit", "displayName":"Shitter" } })
})

app.get('/initialize',async (req, res) => {
    var ip = req.headers['cf-connecting-ip'] || req.socket.remoteAddress
    ip = ip.toString()
    await ipWhiteListRepository.save(ip, {
        ip: ip
      })
    //await ipWhiteListRepository.expire(ip, 24 * 60 * 60 * 7 * 4)
    return res.redirect("/")
})

app.get('/Usapi/:id', async (req,res) => {
    const userid = req.params?.id
    const doc = await user.findOne({userid: userid})
    if (!doc){
        return res.json({status:"error",error:"User not found."})
    }
    
    return res.json({"Id":doc.userid,"Username":doc.username,"AvatarUri":null,"AvatarFinal":false,"IsOnline":false})
}) // TODO remove this

app.get('/assets/ugc/*', async (req,res) => {
    return res.status(404).end()
}) // protect this route

app.use('/assets', express.static('assets'))

app.use(handler)

console.log('here')
if (PROD === "true"){
    app.listen(9000,'localhost')
}else{
    app.listen(80) // don't forget to change to 9000 for production
    const localPrivateKeyPath = process.env.PRIVATEKEYLOCAL
    const localCertificatePath = process.env.LOCALCERTIFICATEPATH
    var privateKey = require('fs').readFileSync( localPrivateKeyPath );
    var certificate = require('fs').readFileSync( localCertificatePath );
    https.createServer({
        key: privateKey,
        cert: certificate
    }, app).listen(443); // remove this for prod
}

const f = {
    "Mode":"Thumbnail",
    "Settings": {
        "Type":"Avatar_R15_Action",
        "PlaceId":1818,
        "UserId":0,
        "BaseUrl":"mete0r.xyz",
        "MatchmakingContextId":1,
        "Arguments": ["https://www.mete0r.xyz","https://api.mete0r.xyz/v1.1/avatar-fetch?userId=0","PNG",420,420]
    },
    "Arguments":{
        "PrefferedPort":53640,
        "MachineAddress":"localhost"
    }
    }