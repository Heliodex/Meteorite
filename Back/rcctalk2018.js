const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
let controller = new AbortController();
require('dotenv').config()
const RCC_HOST = process.env.RCC_HOST
var convert = require('xml-js');

 let url = 'http://'+RCC_HOST+':8000'; // change this to rcc soap

async function OpenGame(jobid,port,ip,placeid,creatorid){
    return new Promise(async (resolve, reject) => {
  let json  = {"Mode":"GameServer","GameId":"game1","Settings":{"IsRobloxPlace":false,"PlaceId":1,"CreatorId":1,"GameId":"00000000-0000-0000-0000-000000000132","GsmInterval":50,"MaxPlayers":100,"MaxGameInstances":52,"ApiKey":"egg","GameCode":"AAAAAAAAAAAAAA-a","PreferredPlayerCapacity":10,"DatacenterId":1,"PlaceVisitAccessKey":"rbx_evt_ftp","UniverseId":13058,"PlaceFetchUrl":"https://mete0r.xyz/asset?id=11","MatchmakingContextId":1,"CreatorType":"User","PlaceVersion":123,"BaseUrl":"mete0r.xyz","MachineAddress":"localhost","JobId":"game1","PreferredPort":53640}}
        json.GameId = jobid
        json.Settings.PreferredPort = port
      json.Settings.MachineAddress = ip
      json.Settings.JobId = jobid
      json.Settings.PlaceId = parseFloat(placeid)
      json.Settings.UniverseId = json.Settings.PlaceId
      json.Settings.CreatorId = creatorid
      json.Settings.GameId = jobid

      let xml = `<?xml version = "1.0" encoding = "UTF-8"?>
      <SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:ns2="http://roblox.com/RCCServiceSoap" xmlns:ns1="http://roblox.com/" xmlns:ns3="http://roblox.com/RCCServiceSoap12">
          <SOAP-ENV:Body>
                 <ns1:OpenJob>
                      <ns1:job>
                      <ns1:id>${jobid}</ns1:id>
                      <ns1:expirationInSeconds>60</ns1:expirationInSeconds>
                      <ns1:category>2</ns1:category>
                      <ns1:cores>1</ns1:cores>
                      </ns1:job>
                      <ns1:script>
                          <ns1:name>game1</ns1:name>
                          <ns1:script>${JSON.stringify(json)}</ns1:script>
                      </ns1:script>
                      </ns1:OpenJob>
              </SOAP-ENV:Body>
      </SOAP-ENV:Envelope>`


//console.log(encodeURIComponent(JSON.stringify(json)))
        try {
          const result = await fetch(url+"/opengame/"+jobid+"/"+encodeURIComponent(JSON.stringify(json)))
          const data = await result.text()
          return resolve(
            data
          )
        } catch (error) {
          return reject(error)
        }
    })
}

async function OpenGame2020(jobid,port,ip,placeid,creatorid){
  return new Promise(async (resolve, reject) => {
let json  = {"Mode":"GameServer","GameId":"game1","Settings":{"IsRobloxPlace":false,"PlaceId":1,"CreatorId":1,"GameId":"00000000-0000-0000-0000-000000000132","GsmInterval":50,"MaxPlayers":100,"MaxGameInstances":52,"ApiKey":"egg","GameCode":"AAAAAAAAAAAAAA-a","PreferredPlayerCapacity":10,"DatacenterId":1,"PlaceVisitAccessKey":"rbx_evt_ftp","UniverseId":13058,"PlaceFetchUrl":"https://mete0r.xyz/asset?id=11","MatchmakingContextId":1,"CreatorType":"User","PlaceVersion":123,"BaseUrl":"mete0r.xyz","MachineAddress":"localhost","JobId":"game1","PreferredPort":53640}}
      json.GameId = jobid
      json.Settings.PreferredPort = port
    json.Settings.MachineAddress = ip
    json.Settings.JobId = jobid
    json.Settings.PlaceId = parseFloat(placeid)
    json.Settings.UniverseId = json.Settings.PlaceId
    json.Settings.CreatorId = creatorid
    json.Settings.GameId = jobid
    json.Settings.PlaceFetchUrl = "https://mete0r.xyz/asset?id="+parseFloat(placeid)

    let xml = `<?xml version = "1.0" encoding = "UTF-8"?>
    <SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:ns2="http://roblox.com/RCCServiceSoap" xmlns:ns1="http://roblox.com/" xmlns:ns3="http://roblox.com/RCCServiceSoap12">
        <SOAP-ENV:Body>
               <ns1:OpenJob>
                    <ns1:job>
                    <ns1:id>${jobid}</ns1:id>
                    <ns1:expirationInSeconds>60</ns1:expirationInSeconds>
                    <ns1:category>2</ns1:category>
                    <ns1:cores>1</ns1:cores>
                    </ns1:job>
                    <ns1:script>
                        <ns1:name>game1</ns1:name>
                        <ns1:script>${JSON.stringify(json)}</ns1:script>
                    </ns1:script>
                    </ns1:OpenJob>
            </SOAP-ENV:Body>
    </SOAP-ENV:Envelope>`


//console.log(encodeURIComponent(JSON.stringify(json)))
      try {
        const result = await fetch(url+"/opengame2020/"+jobid+"/"+encodeURIComponent(JSON.stringify(json)))
        const data = await result.text()
        return resolve(
          data
        )
      } catch (error) {
        return reject(error)
      }
  })
}

async function CloseJob(jobid) {
    return new Promise(async (resolve, reject) => {
        var xml = {
            _declaration: { _attributes: { version: '1.0', encoding: 'UTF - 8' } },
            'SOAP-ENV:Envelope': {
              _attributes: {
                'xmlns:SOAP-ENV': 'http://schemas.xmlsoap.org/soap/envelope/',
                'xmlns:SOAP-ENC': 'http://schemas.xmlsoap.org/soap/encoding/',
                'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
                'xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
                'xmlns:ns2': 'http://roblox.com/RCCServiceSoap',
                'xmlns:ns1': 'http://roblox.com/',
                'xmlns:ns3': 'http://roblox.com/RCCServiceSoap12'
              },
              'SOAP-ENV:Body': {
                'ns1:CloseJob': {
                  'ns1:jobID': { _text: 'Test' }
                }
              }
            }
          }
    xml['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ns1:CloseJob']['ns1:jobID']._text = jobid
          const body = convert.js2xml(xml, { compact: true, spaces: 4 })
        
            try {
              const result = await fetch(url+"/closejob/"+jobid)
              const data = await result.text()
              return resolve(
                data
              )
            } catch (error) {
              return reject(error)
            }
          })
}

async function OpenRender(userid,closeup) {
  return new Promise(async (resolve, reject) => {
          try {
            const result = await fetch(url+"/openrender/"+userid+"/"+closeup)
            const data = await result.text()
            //console.log(data)
            if (data === '{"status": "error","error":"Already started"}'){
              return resolve(
                JSON.parse(data)
              )
            }
            const convertedData = convert.xml2js(data, { compact: true, spaces: 4 })
            return resolve(
              convertedData
            )
          } catch (error) {
            return reject(error)
          }
        })
}

async function OpenRenderAsset(assetid,type) {
  return new Promise(async (resolve, reject) => {
          try {
            const result = await fetch(url+"/openrenderasset/"+assetid+"/"+type)
            const data = await result.text()
            //console.log(data)
            if (data === '{"status": "error","error":"Already started"}'){
              return resolve(
                JSON.parse(data)
              )
            }
            const convertedData = convert.xml2js(data, { compact: true, spaces: 4 })
            return resolve(
              convertedData
            )
          } catch (error) {
            return reject(error)
          }
        })
}

async function lol2(){
  const lol = await OpenRender(0)
  console.log(lol['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ns1:OpenJobResponse']['ns1:OpenJobResult'][0]['ns1:value']._text)
}

async function RenewLease(jobid,expiration) {
  return new Promise(async (resolve, reject) => {
      var xml = {
          _declaration: { _attributes: { version: '1.0', encoding: 'UTF-8' } },
          'SOAP-ENV:Envelope': {
            _attributes: {
              'xmlns:SOAP-ENV': 'http://schemas.xmlsoap.org/soap/envelope/',
              'xmlns:ns1': 'http://roblox.com/',
              'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance'
            },
            'SOAP-ENV:Body': {
              'ns1:RenewLease': {
                'ns1:jobID': { _text: 'Test' },
                'ns1:expirationInSeconds': { _text: '100' }
              }
            }
          }
        }
  xml['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ns1:RenewLease']['ns1:jobID']._text = jobid
  xml['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ns1:RenewLease']['ns1:expirationInSeconds']._text = expiration
        const body = convert.js2xml(xml, { compact: true, spaces: 4 })
      
          try {
            const result = await fetch(url+"/renewlease/"+jobid+"/"+expiration)
            const data = await result.text()
            return resolve(
              data
            )
          } catch (error) {
            return reject(error)
          }
        })
}

async function Execute(jobid,json) {
  return new Promise(async (resolve, reject) => {
          try {
            const result = await fetch(url+"/executejson/"+jobid+"/"+encodeURIComponent(JSON.stringify(json)))
            const data = await result.text()
            return resolve(
              data
            )
          } catch (error) {
            return reject(error)
          }
        })
}

async function GetAllJobs() {
  return new Promise(async (resolve, reject) => {
      const xmlData = (xml = {
        _declaration: {
          _attributes: { version: '1.0', encoding: 'UTF - 8' },
        },
        'SOAP-ENV:Envelope': {
          _attributes: {
            'xmlns:SOAP-ENV': 'http://schemas.xmlsoap.org/soap/envelope/',
            'xmlns:SOAP-ENC': 'http://schemas.xmlsoap.org/soap/encoding/',
            'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
            'xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
            'xmlns:ns2': 'http://roblox.com/RCCServiceSoap',
            'xmlns:ns1': 'http://roblox.com/',
            'xmlns:ns3': 'http://roblox.com/RCCServiceSoap12',
          },
          'SOAP-ENV:Body': { 'ns1:GetAllJobsEx': {} },
        },
      })
  
      const body = convert.js2xml(xmlData, { compact: true, spaces: 4 })
  
      try {
        const result = await fetch(url, { method: 'POST', body })
        const data = await result.text()
        const convertedData = convert.xml2js(data, { compact: true, spaces: 4 })
        return resolve(
          convertedData['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ns1:GetAllJobsExResponse']['ns1:GetAllJobsExResult']
        )
      } catch (error) {
        return reject(error)
      }
    })
}

//RenewLease('game2',"69530318916789546987353800")
async function lol(){
let res = await GetAllJobs()
//console.dir(res,{ depth: null })
let exists = false
if (res != "{}"){
  if (Array.isArray(res['ns1:Job']) === false){
    console.log('asd')
    //console.log(res['ns1:Job']['ns1:id']._text)
    if (res['ns1:Job']['ns1:id']._text === 'game2'){
      exists = true
    }
  }else{
    res['ns1:Job'].forEach(element => {
      if (element['ns1:id']?._text === 'game2'){
        exists = true
      }
    })
  }


}
console.log(exists)
}
//lol()
//GetAllJobs()
//OpenGame('game2','3333','127.0.0.1','2')
module.exports = {OpenGame,CloseJob,RenewLease,GetAllJobs,OpenRender,OpenRenderAsset,OpenGame2020,Execute}









