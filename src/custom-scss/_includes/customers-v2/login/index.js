
const Form = require('../form.js')
const helpers = require('../customers-helpers.js')
const Links = require('../renderLinks.js')
const Visible = require('../visibleControl.js')

const Login = class {
  constructor () {
    this.$loginTemplate = document.querySelector('.as-login-template-wrap')
    this.initLogin()
  }

  initLogin () {
    document.body.classList.remove('d-none')
    this.$loginTemplate && this.$loginTemplate.classList.remove('d-none')
    new Visible()
    new Links()
    this.submitLogin()
  }

  submitLogin () {
    const that = this
    this.$loginForm = this.$loginTemplate && this.$loginTemplate.querySelector('.as-login-form')
    const form = this.$loginForm && new Form(that.$loginForm, {
      done: function (response) {
        if (!response.data) return
        if (response.status_code === 200) {
          const $token = response.data.token
          const $multipass = response.data.multipass
          $token && helpers.setToken(response.data.token)
          // 重定向至login
          helpers.redirectTo($multipass)
        }
      },
      fail: function (response) {
        if (!form) return
        if (response.status_code === 401 || response.status_code === 404) {
          this.showFormError(that.$loginForm.querySelector('.as-login-error'))
        } else {
          this.showFormError(that.$loginForm.querySelector('.as-other-error'))
        }
      }
    })
  }

  // 重置表单
  resetForm () {
    const $form = this.$loginForm
    $form.reset()
    const $ErrorTips = $form.querySelectorAll('.as-form-errors-wrap')
    const $inputErrorTips = $form.querySelectorAll('.input-pristine')
    if ($ErrorTips.length) {
      $ErrorTips.forEach((el) => {
        el.classList.add('d-none')
      })
    }
    if ($inputErrorTips.length) {
      $inputErrorTips.forEach((el) => {
        el.classList.remove('is-invalid')
      })
    }
  }
}

const ForgotPwd = class {
  constructor () {
    this.$forgotTemplate = document.querySelector('.as-forgot-template-wrap')
    this.$parent = this.$forgotTemplate
    this.$forgotPwd = this.$parent.querySelector('.as-forgot-password')
    this.$successPage = this.$parent.querySelector('.as-success-page')

    this.$forgotPwdform = this.$forgotPwd.querySelector('.as-forgot-pwd-form')

    // record email
    this.$userEmail = this.$forgotPwd.querySelector('.as-user-email')
    this.$renderEmail = this.$successPage.querySelector('.as-render-email')

    this.init()
  }

  init () {
    new Links()
    this.submitForgotPwd()
  }

  submitForgotPwd () {
    const that = this
    const form = this.$forgotPwdform && new Form(this.$forgotPwdform, {
      done: function (response) {
        if (!response.data) return
        if (response.status_code === 200) {
          that.renderSuccessPage()
        }
      },
      fail: function (response) {
        if (!form) return
        if (response.status_code === 404) {
          this.showFormError(that.$forgotPwdform.querySelector('.as-not-exist-error'))
        } else if (response.status_code === 429) {
          this.showFormError(that.$forgotPwdform.querySelector('.as-frequent-error'))
        } else {
          this.showFormError(that.$forgotPwdform.querySelector('.as-invalid-error'))
        }
      }
    })
  }

  renderSuccessPage () {
    this.$forgotPwd.classList.add('d-none')
    this.$successPage.classList.remove('d-none')
    this.renderEmail()
  }

  renderForgotPage () {
    this.$successPage.classList.add('d-none')
    this.$forgotPwd.classList.remove('d-none')
  }

  renderEmail () {
    const email = this.$userEmail.value
    if (this.$renderEmail) {
      this.$renderEmail.innerHTML = email
    }
  }

  // 重置表单
  resetForm () {
    const $form = this.$forgotPwdform
    $form.reset()
    const $ErrorTips = $form.querySelectorAll('.as-form-errors-wrap')
    const $inputErrorTips = $form.querySelectorAll('.input-pristine')
    if ($ErrorTips.length) {
      $ErrorTips.forEach((el) => {
        el.classList.add('d-none')
      })
    }
    if ($inputErrorTips.length) {
      $inputErrorTips.forEach((el) => {
        el.classList.remove('is-invalid')
      })
    }
  }
}
const Page = class {
  constructor () {
    // 是否登录 flag
    this.$loginFlag = document.querySelector('._as-login-flag')
    this.$loginTemplate = document.querySelector('.as-login-template-wrap')
    this.$forgotTemplate = document.querySelector('.as-forgot-template-wrap')
    this.$successPage = document.querySelector('.as-success-page')
    this.init()
  }

  init () {
    this.ifLogin()
  }

  ifLogin () {
    if (this.$loginFlag) {
      // 重定向至登录完成页面（/account)
      helpers.redirectTo()
    } else {
      // 没有登录则初始化登录表单
      this.$Login = new Login()
      this.$ForgotPwd = new ForgotPwd()
      this.toggleForgot()
      this.bindBackToLogin()
      this.bindSuccessPageBackToLogin()
    }
  }

  // click forgot password
  toggleForgot () {
    this.$toggleForgot = this.$loginTemplate && this.$loginTemplate.querySelector('.as-toggle-forgot')
    this.$toggleForgot && this.$toggleForgot.addEventListener('click', () => {
      this.$ForgotPwd?.resetForm()
      this.$loginTemplate.classList.add('d-none')
      this.$forgotTemplate.classList.remove('d-none')
      window.scrollTo(0, 0)
    })
  }

  // click back to login
  bindBackToLogin () {
    this.$backToLogin = this.$forgotTemplate && this.$forgotTemplate.querySelector('.as-back-to-login')
    this.$backToLogin && this.$backToLogin.addEventListener('click', () => {
      this.$Login?.resetForm()
      this.$forgotTemplate.classList.add('d-none')
      this.$loginTemplate.classList.remove('d-none')
      window.scrollTo(0, 0)
    })
  }

  // success page click back to login
  bindSuccessPageBackToLogin () {
    const $backToLogin = this.$successPage && this.$successPage.querySelector('.as-back-to-login')
    $backToLogin && $backToLogin.addEventListener('click', () => {
      this.$Login?.resetForm()
      this.$ForgotPwd?.renderForgotPage()
      this.$forgotTemplate.classList.add('d-none')
      this.$loginTemplate.classList.remove('d-none')
      window.scrollTo(0, 0)
    })
  }
}
new Page()
