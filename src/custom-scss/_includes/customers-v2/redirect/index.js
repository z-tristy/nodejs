const helpers = require('../customers-helpers.js')

const Page = class {
  constructor () {
    // 是否登录 flag
    this.$home = document.querySelector('._as-home')
    this.$path = window.self.location.href

    this.init()
  }

  init () {
    this.saveToken()
    this.handleRedirect()
  }

  saveToken () {
    if (helpers.getParams('token')) {
      helpers.setToken(helpers.getParams('token'))
    }
    // 登录/注册完成
    localStorage.setItem('user_identify_flag', 'true')
  }

  handleRedirect () {
    this.$loginFlag = document.querySelector('._as-login-flag')
    if (this.$loginFlag) {
      // 已经登录
      // 如果有checkout_url,则跳转checkout_url,有return_to则跳转return_to,否则回account
      if (helpers.getParams('checkout_url')) {
        this.$redirect = helpers.getParams('checkout_url')
      } else if (helpers.getParams('return_url')) {
        this.$redirect = helpers.getParams('return_url')
      } else if (helpers.getParams('return_to')) {
        this.$redirect = helpers.getParams('return_to')
      } else {
        this.$redirect = document.querySelector('._as-account-url') && document.querySelector('._as-account-url').value
      }

      // 判断是绝对链接还是相对链接
      if (this.$redirect.includes('https://') || this.$redirect.includes('http://')) {
        if (helpers.isAllowed(this.$redirect)) {
          window.location.href = this.$redirect
        } else if (this.$home) {
          window.location.href = this.$home.value
        }
      } else {
        window.location.href = new URL(window.self.location).origin + this.$redirect
      }
    } else {
      window.location.href = document.querySelector('._as-home').value
    }
  }
}
new Page()
