
import { WebSocket } from "ws"
import { compileBootstrap } from "./compileBootstrapService.js"

import { fileURLToPath } from 'url'
import path,{ dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export const socketMessageHandler = (arg)=>{
  const { data, ws, socket } = arg;
  const dataObj = JSON.parse( data.toString() );
  console.log(dataObj)
  console.log('dataObj')
  const miniDistPath = path.resolve(__dirname, "../../public/proxy/stylesheets/bootstrap/bootstrap.mini.css");
  try {
    compileBootstrap(miniDistPath, dataObj);
  } catch (error) {
    console.log(error)
  }

  ws.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
console.log(data)
console.log(client.readyState)
console.log(WebSocket.OPEN)
console.log('data')
      client.send(data, { binary: false });

    }
  });

}
