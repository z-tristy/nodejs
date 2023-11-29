import http from "http";
import { cpSync } from "fs";
const PORT = 3000;

import { fileURLToPath } from 'url';
import path,{ dirname } from 'path';
import { WebSocketServer } from "ws";
import { insertBeforeLine, insertAfterLine } from './src/service/fileService.js';

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

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World! 1');
});

const ws = new WebSocketServer({ server })
ws.on('connection', function connection(socket) {
  console.log('服务端接收到信号')
  socket.on('message', (data)=>{
    console.log(data)
    // socketMessageHandler({ data, ws, socket });
  });

  socket.send('Socket connected asdasdasdasd');
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
