const helpers = require('./customers-helpers.js')

const Params = class {
  constructor ($parent) {
    this.$parent = $parent

    this.$return = document.querySelector('._as-account-url').value

    this.$token = helpers.getParams('token')
    this.$uid = helpers.getParams('uid')

    this.$tokenParam = this.$parent.querySelectorAll('.as-token-param')
    this.$uidParam = this.$parent.querySelectorAll('.as-uid-param')
    // 跳转的页面路径
    this.$returnToParam = this.$parent.querySelectorAll('.as-return-to-param')
    this.init()
  }

  init () {
    this.renderParams()
  }

  renderParams () {
    let currentUrl = new URL(window.self.location.href)
    let search = new URLSearchParams(currentUrl.search)

    // 将return url编码
    this.$returnUrl = encodeURIComponent(this.$return + search)

    this.$returnUrl && this.$returnToParam && Array.prototype.map.call(this.$returnToParam, (param) => {
      param.value = this.$returnUrl
    })

    this.$token && this.$tokenParam && Array.prototype.map.call(this.$tokenParam, (param) => {
      param.value = this.$token
    })
    this.$uid && this.$uid && Array.prototype.map.call(this.$uidParam, (param) => {
      param.value = this.$uid
    })
  }
}

module.exports = Params
