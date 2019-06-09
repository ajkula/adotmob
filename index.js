const env = typeof process.env.NODE_ENV === 'undefined' ? 'development' : process.env.NODE_ENV
global.__env = env
global.__DEV = env === 'development'
global.__TEST = env === 'test'
global.__PROD = env === 'production'
global.filePath = __dirname + '/store-mock.json'

const config = {LISTEN_PORT: 3500}
const logule = require('logule').init(module)
const Server = require('./Server')
console.log();
logule.info("\x1b[33mCONFIG:", JSON.stringify(config, null, 6) + "\x1b[0m")

let server = new Server()
let app = server.app
app.set("PORT", 3500)

let port = Number(parseInt(config.LISTEN_PORT) || 3500)
app.listen(port, function () {
  logule.info('\x1b[36m[EXPRESS] Listening on port ' + app.get("PORT") + "\x1b[0m")
  return true
})


