import http from "http"
import https from "https"
import fs from "fs"
import express from "express"
import { cpSync } from "fs"
const PORT = 3000

import { fileURLToPath } from 'url'
import path,{ dirname } from 'path'
import { WebSocketServer } from "ws"
import { socketMessageHandler } from "./src/service/socketMessageHandler.js"
import { handleBootstrapScss } from './src/service/fileService.js'
import { httpsGetShopSiteContent } from './httpsGetShopSiteContent.js'

const __filename = fileURLToPath(import.meta.url); // 将文件URL解码为路径字符串
const __dirname = dirname(__filename); 

// const deleteBootstrapCssPath = path.resolve(__dirname, "./public/proxy/stylesheets/bootstrap/bootstrap.mini.css");
// fs.unlink(deleteBootstrapCssPath, (err) => {
//   if (err) {
//     console.error(err);
//     return;
//   }
//   console.log('文件已成功删除');
// });

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
console.log('static')
console.log(path.join(__dirname, 'public'))

// 修改服务器的路由处理部分，使用 Express 的路由方法（如 app.get）来处理请求和响应：
const roots = {
  home: '/',
  contact: '/pages/contact',
  blogs: '/blogs/news',
  article: '/blogs/news/article',
}
Object.values(roots).map(root => {
  app.get(root, (req, res) => {
    const shopSite = `https://iplayground.myshopify.com${root}`
    httpsGetShopSiteContent(shopSite, res)
  })
})

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
