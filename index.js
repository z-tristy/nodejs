import http from "http"
import https from "https"
import ejs from "ejs"
import express from "express"
import { cpSync, writeFileSync, readFileSync } from "fs"
const PORT = 3000

import { fileURLToPath } from 'url'
import path,{ dirname } from 'path'
import { WebSocketServer } from "ws"
import { socketMessageHandler } from "./src/service/socketMessageHandler.js"
import { insertBeforeLine, insertAfterLine } from './src/service/fileService.js'

const __filename = fileURLToPath(import.meta.url); // 将文件URL解码为路径字符串
const __dirname = dirname(__filename); 

console.log('__filename')
console.log(__filename)
console.log('__dirname')
console.log(__dirname)

const nodeModulesPath = path.resolve(__dirname,"./node_modules");
console.log('nodeModulesPath')
console.log(nodeModulesPath)

const srcPath = path.resolve(__dirname, "./src/bootstrap");

// copy bootstrap to workspace from node_modules
cpSync(path.resolve(nodeModulesPath, "bootstrap"), srcPath, {
  recursive: true,
  force: true,
})

console.log('bootstrap 文件被写入的位置')
console.log(path.resolve(srcPath, "scss/bootstrap.scss"))

insertBeforeLine( 
  path.resolve(srcPath, "scss/bootstrap.scss"), 
  `@import "functions";
@import "../../custom-scss/functions";
@import "custom-variables";
@import "../../custom-scss/variables";
@import "../../custom-scss/extra-variables";`
);

insertAfterLine(
  path.resolve(srcPath, "scss/bootstrap.scss"), 
  '@import "../../custom-scss/index";'
)

// 创建一个 Express 应用程序实例
const app = express()

// 修改服务器的路由处理部分，使用 Express 的路由方法（如 app.get）来处理请求和响应：
app.get('/', (req, res) => {
  const shopSite = "https://iplayground.myshopify.com"

  https.get(shopSite, {
    headers: {
      "content-type": "text/html",
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

      console.log('proxyHtmlPath')
      console.log(proxyHtmlPath)

      const htmlInit = data.join("")
      const _html = htmlInit.split("</head>")

      const scriptStr = `<script src="/proxy/javascripts/connector.js"></script></head>`

      _html.splice(1, 0, scriptStr)

      const html = _html.join("")

      writeFileSync(proxyHtmlPath, html);

      res.sendFile(proxyHtmlPath);

      // const template = readFileSync(proxyHtmlPath)
      // const render = ejs.render(template, { content: data })

      // res.writeHead(200, { 'Content-Type': 'text/html' });
      // res.write(rendered);
      // res.end();

    });
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
    socketMessageHandler({ data, ws, socket });
  });

  socket.send('Socket connected asdasdasdasd');
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
