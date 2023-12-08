const Form = require('../form.js')
const helpers = require('../customers-helpers.js')
const Links = require('../renderLinks.js')
const Visible = require('../visibleControl.js')

var Pristine = require('@scripts/pristine.js')

// 控制全局只有一个计时器
var countdown = null

const Router = class {
  constructor () {
    this.$components = document.querySelectorAll('.as-components')
    this.init()
  }

  init () {
    this.updateUrl()
    this.listenFresh()
    window.addEventListener('load', () => {
      this.initRouter()
    })
    window.addEventListener('hashchange', () => {
      this.initRouter()
    })
  }

  listenFresh () {
    if (window.location.hash) {
      const url = window.location.href.replace(window.location.hash, '')
      window.location.href = url
    }
  }

  updateUrl () {
    if (window.location.href.includes('#edit-profile') || window.location.href.includes('#referral-page') || window.location.href.includes('#waiting-list') || window.location.href.includes('#invites')) {
      const url = window.location.href
      const redirect = url.replace('#edit-profile', encodeURIComponent('#edit-profile')).replace('#referral-page', encodeURIComponent('#referral-page')).replace('#waiting-list', encodeURIComponent('#waiting-list')).replace('#invites', encodeURIComponent('#invites'))
      window.location.href = redirect
    }
  }

  initRouter () {
    let hash = window.location.hash
    this.$components.forEach((component) => {
      component.classList.add('d-none')
    })
    if (hash) {
      this.$components.forEach((components) => {
        if (components.dataset.router == hash) {
          components.classList.remove('d-none')
        }
      })
    } else {
      this.$components[0]?.classList.remove('d-none')
      new Register()
    }
  }
}
new Router()

const Register = class {
  constructor () {
    this.$registerSection = document.querySelector('.as-register-section')
    this.$parent = this.$registerSection
    if (!this.$parent) return

    // 跳转的页面路径
    this.$path = this.$parent?.dataset?.nextPage

    // 邮箱输入表单
    this.$emailForm = this.$parent.querySelector('.as-email-form')
    // 订阅checkbox
    this.$subscribeCheckbox = this.$emailForm && this.$emailForm.querySelector('.as-if-subscribe')
    window.$isSubscribe = false

    // email输入
    this.$userEmail = this.$emailForm.querySelector('.as-user-email')

    // 发送验证码表单
    this.$sendEmailForm = this.$parent.querySelector('.as-send-email-form')
    // 发送email参数
    this.$sendEmailParam = this.$sendEmailForm.querySelector('.as-send-email-param')
    // 是否校验注册码 开关
    this.isVerify = document.querySelector('.as-register-data')?.dataset?.isVerify

    this.init()
  }

  init () {
    new Links()
    this.listenEmail()
    this.listenSubscribe()
    // this.sendVerificationCode()
    this.checkEmail()
  }

  // 输入时，更新所有参数
  listenEmail () {
    var that = this
    this.$userEmail.addEventListener('change', () => {
      that.$sendEmailParam.value = that.$userEmail.value
    })
  }

  listenSubscribe () {
    var that = this
    this.$subscribeCheckbox && this.$subscribeCheckbox.addEventListener('change', () => {
      if (this.$subscribeCheckbox.checked === true) {
        window.$isSubscribe = true
      } else {
        window.$isSubscribe = false
      }
    })
  }

  // 发送邮箱验证码
  sendVerificationCode () {
    var that = this
    let form = this.$sendEmailForm && new Form(this.$sendEmailForm, {
      // 先进行email验证，成功后才发送邮箱验证码
      // async: function() {
      //   return new Promise((resolve, reject) => {
      //     that.checkEmail(resolve, reject)
      //   })
      // },
      // email验证失败,显示报错信息
      catch: function (response) {
        this.showFormError(that.$sendEmailForm.querySelector('.as-invalid-error'))
      },
      done: function (response) {
        if (!response.data) return
        if (response.status_code == 200) {
          // // 记录全局值传递
          // window.currentEmail = that.$userEmail.value
          // 切换路由
          window.location.hash = that.$path
          new Verify()
        }
      },
      fail: function (response) {
        if (response.status_code === 429) {
          this.showFormError(that.$sendEmailForm.querySelector('.as-frequent-error'))
        } else if (response.status_code === 422) {
          this.showFormError(that.$sendEmailForm.querySelector('.as-exist-error'))
        } else {
          this.showFormError(that.$sendEmailForm.querySelector('.as-invalid-error'))
        }
      }
    })
    // 火狐兼容性，需要cancelable属性
    that.$sendEmailForm.dispatchEvent(new Event('submit', { cancelable: true }))
  }

  checkEmail () {
    const that = this
    let form = this.$emailForm && new Form(this.$emailForm, {
      done: function (response) {
        if (!response.data) return
        if (response.status_code == 200) {
          // resolve()
          // 记录全局值传递
          window.currentEmail = that.$userEmail.value
          if (that.isVerify === 'true') {
            that.sendVerificationCode()
          } else {
            // 切换路由
            window.location.hash = that.$path
            new Name()
          }
        }
      },
      // email验证失败,显示报错信息
      catch: function (response) {
        this.showFormError(that.$emailForm.querySelector('.as-invalid-error'))
      },
      fail: function (response) {
        // reject(response)
        if (response.status_code === 429) {
          this.showFormError(that.$emailForm.querySelector('.as-frequent-error'))
        } else if (response.status_code === 422) {
          this.showFormError(that.$emailForm.querySelector('.as-exist-error'))
        } else {
          this.showFormError(that.$emailForm.querySelector('.as-invalid-error'))
        }
      }
    })
  }
}
const Verify = class {
  constructor () {
    this.$verifySection = document.querySelector('.as-verify-section')
    this.$parent = this.$verifySection

    // 跳转的页面路径
    this.$path = this.$parent.dataset.nextPage
    this.$prevPath = this.$parent.dataset.prevPage

    // 验证码表单
    this.$verifyForm = this.$parent.querySelector('.as-verification-form')
    this.$renderEmail = this.$parent.querySelector('.as-render-email')
    this.$emailParam = this.$parent.querySelectorAll('.as-email-param')

    // 发送验证码表单
    this.$emailForm = this.$parent.querySelector('.as-email-form')
    // send again and countdown
    this.$sendAgain = this.$parent.querySelector('.as-send-again')
    this.$countdownWrap = this.$parent.querySelector('.as-countdown-wrap')
    this.$countdownNumber = this.$countdownWrap.querySelector('.as-countdown-number')
    // 验证码表单初始化
    this.$form = null

    this.init()
  }

  init () {
    this.renderEmail()
    this.submitVerification()
    this.initCountdown()
    this.addChangeEmailListener()
    this.addSendAgainListener()
  }

  // 如果email参数存在则渲染
  renderEmail () {
    if (window.currentEmail && this.$renderEmail) {
      this.$renderEmail.textContent = window.currentEmail
    }
    window.currentEmail && this.$emailParam && this.$emailParam.forEach((param) => {
      param.value = window.currentEmail
    })
  }

  // 绑定验证码提交事件
  submitVerification () {
    var that = this
    this.$form = this.$verifyForm && new Form(this.$verifyForm, {
      done: function (response) {
        if (!response.data) return
        if (response.status_code === 200) {
          // 切换路由
          window.location.hash = that.$path
          new Name()
        }
      },
      fail: function (response) {
        if (!that.$form) return
        if (response.status_code === 429) {
          this.showFormError(that.$verifyForm.querySelector('.as-frequent-error'))
        } else {
          this.showFormError(that.$verifyForm.querySelector('.as-invalid-error'))
        }
      }
    })
  }

  addChangeEmailListener () {
    const that = this
    const change = this.$parent.querySelector('.as-change')
    change.addEventListener('click', () => {
      // 返回注册页
      // 切换路由
      window.location.hash = that.$prevPath

      // 重置表单
      that.resetForm()
    })
  }

  resetForm () {
    this.clearErrorMessage()
  }

  // 重新发送邮件验证码
  addSendAgainListener () {
    const that = this
    this.$sendAgain.addEventListener('click', () => {
      that.sendVerificationCode()
    })
  }

  // 发送邮箱验证码
  sendVerificationCode () {
    if (!this.$form) return
    const that = this
    let form = this.$emailForm && new Form(this.$emailForm, {
      done: function (response) {
        if (!response.data) return
        if (response.status_code === 200) {
          that.initCountdown()
        }
      },
      fail: function (response) {
        // 展示报错信息
        if (response.status_code === 429) {
          that.$form.showFormError(that.$emailForm.querySelector('.as-frequent-error'))
        } else {
          that.$form.showFormError(that.$emailForm.querySelector('.as-invalid-error'))
        }
      }
    })
    // 提交表单
    that.$emailForm.dispatchEvent(new Event('submit', { cancelable: true }))
  }

  initCountdown () {
    if (countdown) {
      clearInterval(countdown)
    }
    this.$sendAgain.classList.add('d-none')
    this.$countdownWrap.classList.remove('d-none')
    // 发送验证码的间隔时间
    let timer = parseInt(this.$countdownNumber.dataset.interval)
    this.$countdownNumber.innerHTML = timer
    countdown = setInterval(() => {
      timer = timer - 1
      this.$countdownNumber.innerHTML = timer
      if (timer < 1) {
        clearInterval(countdown)
        this.$countdownWrap.classList.add('d-none')
        this.$sendAgain.classList.remove('d-none')
      }
    }, 1000)
  }
}

const Name = class {
  constructor () {
    this.$setName = document.querySelector('.as-set-name-section')
    this.$parent = this.$setName

    this.$path = this.$parent.dataset.nextPage

    this.$setNameForm = this.$parent.querySelector('.as-set-name-form')

    this.$firstName = this.$setNameForm.querySelector('.as-first-name')
    this.$lastName = this.$setNameForm.querySelector('.as-last-name')

    this.$submitName = this.$parent.querySelector('.as-submit')
    this.init()
  }

  init () {
    this.submitName()
  }

  submitName () {
    this.$submitName.addEventListener('click', (event) => {
      const defaultConfig = {
        classTo: 'form-pristine',
        classToInput: 'input-pristine',
        errorClass: 'is-invalid',
        successClass: 'has-success',
        errorTextParent: 'form-pristine',
        errorTextTag: 'div',
        errorTextClass: 'invalid-feedback'
      }
      const valid = new Pristine(this.$setNameForm, defaultConfig).validate()
      if (valid) {
        window.currentFirstName = this.$firstName && this.$firstName.value
        window.currentLastName = this.$lastName && this.$lastName.value
        window.location.hash = this.$path
        new Password()
      }
    })
  }
}

const Password = class {
  constructor () {
    this.$setPwd = document.querySelector('.as-set-pwd')
    this.$parent = this.$setPwd

    this.$setPwdForm = this.$parent.querySelector('.as-set-pwd-form')
    this.$subscribeForm = this.$parent.querySelector('.as-subscribe-form')

    this.$emailParam = this.$parent.querySelectorAll('.as-email-param')
    this.$firstNameParam = this.$setPwdForm.querySelector('.as-first-name-param')
    this.$lastNameParam = this.$setPwdForm.querySelector('.as-last-name-param')
    // 跳转的页面路径
    this.$path = this.$parent.dataset.nextPage

    this.init()
  }

  init () {
    new Visible()
    this.renderParams()
    this.submitSetPwd()
  }

  renderParams () {
    if (window.currentEmail && this.$emailParam) {
      this.$emailParam.forEach((param) => {
        param.value = window.currentEmail
      })
    }
    if (window.currentFirstName && this.$emailParam) {
      this.$firstNameParam.value = window.currentFirstName
    }
    if (window.currentLastName && this.$emailParam) {
      this.$lastNameParam.value = window.currentLastName
    }
  }

  submitSetPwd () {
    const that = this
    const form = this.$setPwdForm && new Form(this.$setPwdForm, {
      // 先订阅，成功后提交注册表单
      async: function () {
        return new Promise((resolve, reject) => {
          that.submitSubscribe(resolve, reject)
        })
      },
      catch: function (response) {
        this.showFormError(that.$setPwdForm.querySelector('.as-other-error'))
      },
      done: function (response) {
        if (!response.data) return
        if (response.status_code === 200) {
          // 注册成功，设置cookie
          response.data.token && helpers.setToken(response.data.token)
          const $multipass = response.data.multipass
          $multipass && helpers.setMultipass($multipass)

          helpers.redirectTo(helpers.getMultipass())
        }
      },
      fail: function (response) {
        if (!form) return
        if (response.status_code === 422 || response.status_code === 403) {
          this.showFormError(that.$setPwdForm.querySelector('.as-other-error'))
        } else {
          this.showFormError(that.$setPwdForm.querySelector('.as-format-error'))
        }
      }
    })
  }

  submitSubscribe (resolve, reject) {
    const that = this
    let form = this.$subscribeForm && new Form(this.$subscribeForm, {
      done: function (response) {
        if (!response) return
        if (response.code === 200) {
          resolve()
        }
      },
      fail: function (response) {
        reject(response)
      }
    })
    if (window.$isSubscribe) {
      // 火狐兼容性，需要cancelable属性
      this.$subscribeForm.dispatchEvent(new Event('submit', { cancelable: true }))
    } else {
      resolve()
    }
  }
}
