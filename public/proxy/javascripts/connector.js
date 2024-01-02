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

    // 默认就替换一次, 因为要解决 slides 这种单独会有样式文件的问题
    // 目前的解决方案是将所有的这种类型的文件都合并到 base.min 里面大宝
    this.flushCustomedBootstrapCss()
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

if (window.location.href.indexOf("nodejs-production-89c8") > -1) {
  new EditorConnector("wss://nodejs-production-89c8.up.railway.app")
} else {
  new EditorConnector("ws://192.168.11.121:3000/")
}
