// customers logout
require('../logout.js')
require('../updateRedirect.js')
require('../account.js')
const Form = require('../form.js')
const helpers = require('../customers-helpers.js')
const Params = require('../renderParams.js')
const Visible = require('../visibleControl.js')

const Reset = class {
  constructor () {
    this.$resetPwd = document.querySelector('.as-reset-pwd')
    this.$parent = this.$resetPwd
    if (!this.$parent) return

    // 跳转的页面路径
    this.$path = this.$parent.dataset.nextPage
    this.$resetForm = this.$parent.querySelector('.as-reset-pwd-form')

    this.init()
  }

  init () {
    new Visible()
    this.submitResetPwd()
  }

  submitResetPwd () {
    var that = this
    new Params(this.$resetForm)

    const form = that.$resetForm && new Form(that.$resetForm, {
      done: function (response) {
        if (!response.data) return
        if (response.status_code === 200) {
          // 不自动登录,显示重置成功页面
          // 暂时重定向至登录页面
          if (that.$path && typeof that.$path !== 'undefined') {
            helpers.goToPage(that.$path)
          }
        }
      },
      fail: function (response) {
        if (!form) return
        if (response.status_code === 429) {
          this.showFormError(that.$resetForm.querySelector('.as-frequent-error'))
        } else {
          this.showFormError(that.$resetForm.querySelector('.as-invalid-error'))
        }
      }
    })
  }
}

new Reset()
