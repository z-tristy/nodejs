import http from "http"
import https from "https"
import express from "express"
import { cpSync, writeFileSync } from "fs"
const PORT = 3000

import { fileURLToPath } from 'url'
import path,{ dirname } from 'path'
import { WebSocketServer } from "ws"
import { socketMessageHandler } from "./src/service/socketMessageHandler.js"
import { handleBootstrapScss } from './src/service/fileService.js'
import { httpsGetShopSiteContent } from './httpsGetShopSiteContent.js'
import { getRoutes } from './Routes.js'

import { initCompileBootstrap } from './src/service/compileBootstrapService.js'

const __filename = fileURLToPath(import.meta.url); // 将文件URL解码为路径字符串
const __dirname = dirname(__filename); 

// 清空 自定义数据
const customVariablesPath = path.resolve(__dirname, "./src/custom-scss/styles/customize/_variables.scss");
writeFileSync(customVariablesPath, '')

const customUtilitiesPath = path.resolve(__dirname, "./src/custom-scss/styles/customize/_utilities.scss");
writeFileSync(customUtilitiesPath, '')

const customBootstrapCssPath = path.resolve(__dirname, "./public/proxy/stylesheets/bootstrap/bootstrap.mini.css");
writeFileSync(customBootstrapCssPath, '')

// copy bootstrap scss to workspace from node_modules
// 抓取一次就好, 没必要每次都抓取
const srcPath = path.resolve(__dirname, "./src/bootstrap-scss")
const nodeModulesPath = path.resolve(__dirname,"./node_modules/bootstrap/scss")
console.log(nodeModulesPath)
cpSync(nodeModulesPath, srcPath, {
  recursive: true,
  force: true,
})

const baseMinPath = path.resolve(__dirname, "./src/custom-scss/styles/base.min.scss")
const basePath = path.resolve(__dirname, "./src/custom-scss/styles/_base.scss")
handleBootstrapScss(baseMinPath, basePath)

// 创建一个 Express 应用程序实例
const app = express()

app.use(express.static(path.join(__dirname, 'public')))

// 初始化 bootstrap.mini.css
// public/proxy/stylesheets/bootstrap/bootstrap.mini.css
initCompileBootstrap()

// 修改服务器的路由处理部分，使用 Express 的路由方法（如 app.get）来处理请求和响应：
const routes = getRoutes()
Object.values(routes).map(route => {
  app.get(route, (req, res) => {
    const shopSite = `https://iplayground.myshopify.com${route}`
    httpsGetShopSiteContent(shopSite, res)
  })
})

// 监听路由切换, 但是下面的代码打开之后页面会崩掉
// app.use((req) => {
  // console.log('Route changed to: ' + req.url);
  // next();
// });

// window is not defined
// const urlParams = new URLSearchParams(window.location.search)
// const href = urlParams.get('href');
// console.log(href)

// app.get('/', (req, res) => {
//   const shopSite = "https://iplayground.myshopify.com"
//   httpsGetShopSiteContent(shopSite, res)
// })

// app.get('/pages/contact', (req, res) => {
//   const shopSite = "https://iplayground.myshopify.com/pages/contact"
//   httpsGetShopSiteContent(shopSite, res)
// })

// 创建一个 HTTP 服务器实例，并将 Express 应用程序实例作为回调函数传递给 http.createServer 方法：
const server = http.createServer(app)

const ws = new WebSocketServer({ server })
ws.on('connection', function connection(socket) {
  console.log('服务端接收到信号')
  socket.on('message', (data)=>{
    console.log(data)
    socketMessageHandler({ data, ws, socket })
  })

  socket.send('Socket connected asdasdasdasd')
})

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`)
})
