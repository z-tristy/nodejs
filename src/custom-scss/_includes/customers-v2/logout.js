const helpers = require('./customers-helpers.js')
const global = require('./invites-global.js')
function Logout () {
}

Logout.prototype = {
  constructor: Logout,
  init: function () {
    this.$logoutBtn = document.querySelectorAll('.as-logout-btn')
    this.listenClick()
    this.clearCookie()
  },
  clearCookie: function () {
    let currentUrl = window.self.location.href
    if (currentUrl.includes('/account/logout')) {
      helpers.removeToken()
      helpers.removeMultipass()
      localStorage.removeItem('user_identify_flag')
    }
  },
  listenClick: function () {
    if (this.$logoutBtn.length > 0) {
      this.$logoutBtn.forEach(item => {
        item.addEventListener('click', (event) => {
          helpers.removeToken()
          helpers.removeMultipass()
          localStorage.removeItem('user_identify_flag')
          global.redirectTo(item.dataset.href)
        })
      })
    }
  }
}

new Logout().init()
