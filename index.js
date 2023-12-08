import http from "http"
import https from "https"
import fs from "fs"
import express from "express"
import { cpSync, writeFileSync, readFileSync } from "fs"
const PORT = 3000

import { fileURLToPath } from 'url'
import path,{ dirname } from 'path'
import { WebSocketServer } from "ws"
import { socketMessageHandler } from "./src/service/socketMessageHandler.js"
import { handleBootstrapScss } from './src/service/fileService.js'

const __filename = fileURLToPath(import.meta.url); // 将文件URL解码为路径字符串
const __dirname = dirname(__filename); 

const deleteBootstrapCssPath = path.resolve(__dirname, "./public/proxy/stylesheets/bootstrap/bootstrap.mini.css");
fs.unlink(deleteBootstrapCssPath, (err) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log('文件已成功删除');
});

// copy bootstrap to workspace from node_modules
// 抓取一次就好, 没必要每次都抓取
const srcPath = path.resolve(__dirname, "./src/bootstrap")
const nodeModulesPath = path.resolve(__dirname,"./node_modules")
cpSync(path.resolve(nodeModulesPath, "bootstrap"), srcPath, {
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
app.get('/', (req, res) => {
  const shopSite = "https://iplayground.myshopify.com"

  https.get(shopSite, {
    headers: {
      "content-type": "text/html, application/javascript",
      // "X-Shopify-Access-Token": token,
      "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36"
    }
  }, response => {
    let data = []
    response.on('data', chunk => {
      const buffStr = chunk.toString('utf8')
      data.push(buffStr)
    })

    response.on('end', () => {
      const proxyHtmlPath = path.resolve(__dirname, "./src/views/proxy.html")
      const proxyConnectorJs = path.resolve(__dirname, "./public/proxy/javascripts/connector.js")

      console.log('proxyHtmlPath')
      console.log(proxyHtmlPath)
      console.log('proxyConnectorJs')
      console.log(proxyConnectorJs)

      const htmlInit = data.join("")
      const _html = htmlInit.split("</head>")

      const scriptStr = `<script>
      class EditorConnector {

        ws = null;
      
        constructor(socketServerAddress) {
          console.log("Custom js injected 1 !");
          console.log(socketServerAddress);
          console.log("Custom js injected 2 !");
      
          if (!socketServerAddress) {
            throw new Error("socketServerAddress is required!");
          }
      
          this.ws = new WebSocket(socketServerAddress);
      
          window.addEventListener('DOMContentLoaded', (event) => {
            console.log('asd')
            this.ws.onopen = (e) => {
              console.log("socket opened this.ws.onopen");
            }
      
            this.ws.onmessage = (e) => {
              const msg = JSON.parse(e.data);
              console.log(msg)
              console.log('msg')
              if (msg) {
                this.flushCustomedBootstrapCss();
              }
            }
      
          })
        }
      
        flushCustomedBootstrapCss() {
      
          const BOOTSTRAP_CSS_PATH_BASE = "/assets/base.min.css"
          // const BOOTSTRAP_CSS_PATH_BASE = "/assets/base.css"
          const BOOTSTRAP_CSS_PATH_INDEX = "/assets/index.ae38f710.js"
      console.log(window.__bootstraplink__)
      console.log('hhhhhhhhhhhhhhhhhhhhhhhhhhhhh')
          if (!window.__bootstraplink__) {
            const $link = [...document.querySelectorAll("link")]
            console.log($link)
            const bootstrap = $link.find(item => (item.href.indexOf(BOOTSTRAP_CSS_PATH_BASE) > -1 || item.href.indexOf(BOOTSTRAP_CSS_PATH_INDEX) > -1));
            console.log(bootstrap)
            window.__bootstraplink__ = bootstrap;
          }
      
          // console.log(bootstrap);
          window.__bootstraplink__ && (window.__bootstraplink__.href = '/proxy/stylesheets/bootstrap/bootstrap.mini.css?v=' + new Date().getTime())
      
          console.log("Customed bootstrap flushed 1");
        }
      
      }
      
      // new EditorConnector("wss://nodejs-production-89c8.up.railway.app")
      new EditorConnector("ws://192.168.11.113:3000/")
      </script>
      </head>`

      _html.splice(1, 0, scriptStr)

      const html = _html.join("")

      writeFileSync(proxyHtmlPath, html)

      res.sendFile(proxyHtmlPath)

    })
  }).on('error', (err) => {
    console.error(err)
  })
})

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
