import https from "https"
import path,{ dirname } from 'path'
import { fileURLToPath } from 'url'
import { writeFileSync, readFileSync } from "fs"
// import { initCompileBootstrap } from "./src/service/compileBootstrapService"

const clearCode = htmlInit => {
  let html = htmlInit

  let regex = /<script.*?assets\/customers-v1-global.*?<\/script>/gi;
  html = html.replace(regex, "")

  regex = /<script.*?checkouts\/internal\/preloads.*?<\/script>/gi;
  html = html.replace(regex, "")

  regex = /<script class=\"analytics[\s\S]*?<\/script>/gi;
  html = html.replace(regex, "")

  regex = /<script class=\"boomerang[\s\S]*?<\/script>/gi;
  html = html.replace(regex, "")

  regex = /<script id="web-pixels-manager-setup">[\s\S]*?"\/wpm"[\s\S]*?<\/script>/gi;
  html = html.replace(regex, "")

  regex = /<script>\(function\(\)[\s\S]*?<\/script>/gi;
  html = html.replace(regex, "")

  // ^asd(?!.*base\.min).*?min.*?zxc$

  // regex = /<link href="\/\/iplayground.myshopify.com[\s\S]*?milestone.min.css[\s\S]*?\/>/gi;
  // html = html.replace('<link href="//iplayground.myshopify.com/cdn/shop/t/6/assets/milestone.min.css?v=131223138466315144061701938322" rel="stylesheet" type="text/css" media="all" />', "")

  return html
}

export const httpsGetShopSiteContent = (shopSite, res)=>{
  const __filename = fileURLToPath(import.meta.url); // 将文件URL解码为路径字符串
  const __dirname = dirname(__filename); 
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

      let connectorJs = readFileSync(proxyConnectorJs).toString()
      let fontCss = readFileSync(proxyFontCss).toString()

      let htmlInit = data.join("")

      // 排除 htmlInit 中 不需要的代码
      htmlInit = clearCode(htmlInit)

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