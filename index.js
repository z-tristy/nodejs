import http from "http";
const PORT = 3000;

import { WebSocketServer } from "ws";


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
    socketMessageHandler({ data, ws, socket });
  });

  socket.send('Socket connected asdasdasdasd');
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
