import https from "https"
import path,{ dirname } from 'path'
import { fileURLToPath } from 'url'
import { writeFileSync, readFileSync } from "fs"


export const httpsGetShopSiteContent = (shopSite, res)=>{
  const __filename = fileURLToPath(import.meta.url); // 将文件URL解码为路径字符串
  const __dirname = dirname(__filename); 
console.log(__dirname)
console.log('__dirname')
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
      const proxyFontCss = path.resolve(__dirname, "./public/proxy/stylesheets/font.css")

      console.log('proxyHtmlPath')
      console.log(proxyHtmlPath)
      console.log('proxyConnectorJs')
      console.log(proxyConnectorJs)

      let connectorJs = readFileSync(proxyConnectorJs).toString()
      let fontCss = readFileSync(proxyFontCss).toString()

      const htmlInit = data.join("")
      const _html = htmlInit.split("</head>")

      const scriptStr = `
        <script>
          ${connectorJs}
        </script>
        <style>
          ${fontCss}
        </style>
      </head>`

      _html.splice(1, 0, scriptStr)

      const html = _html.join("")

      writeFileSync(proxyHtmlPath, html)
      
      res.sendFile(proxyHtmlPath)

    })
  }).on('error', (err) => {
    console.error(err)
  })

}