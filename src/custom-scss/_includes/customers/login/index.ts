const ValidateForm = require('@scripts/validateForm.ts')
const Pristine = require('@scripts/pristine.js')
const Cookie = require('js-cookie')

class ExtendValidateForm extends ValidateForm {
  $parent: any
  constructor ($parent: any) {
    if ($parent) {
      super($parent)
    } else {
      super()
    }

    this.$parent = $parent
    if (!this.$parent) return

    this.init()
  }

  init (): void {

  }

  resetForm (): void {
    this.$parent.reset()
    let $ErrorTips:any = this.$parent.querySelectorAll('.as-email-errors-wrap')
    let $inputErrorTips:any = this.$parent.querySelectorAll('.input-pristine')
    if ($ErrorTips.length) {
      $ErrorTips.forEach((el: HTMLElement) => {
        el.classList.add('d-none')
      })
    }
    if ($inputErrorTips.length) {
      $inputErrorTips.forEach((el: HTMLElement) => {
        el.classList.remove('is-invalid')
      })
    }
  }
}

class LoginWrapper {
  $recoverForm: any
  $asEmail: any
  $renderRecoverEmail: any
  $LoginForm: any
  $RecoverEmailForm: any

  constructor () {
    this.$recoverForm = document.querySelector('.as-recover-email-form')
    this.$asEmail = this.$recoverForm?.querySelector('.as-email')
    this.$renderRecoverEmail = document.querySelector('.as-render-recover-email')

    let $asloginForm: any = document.querySelector('.as-login-form')
    this.$LoginForm = $asloginForm && new ExtendValidateForm($asloginForm)
    let $asRecoverEmailForm: any = document.querySelector('.as-recover-email-form')
    this.$RecoverEmailForm = $asRecoverEmailForm && new ExtendValidateForm($asRecoverEmailForm)

    this.init()
  }

  init (): void {
    window.addEventListener('hashchange', () => {
      this.scrollToTop()
      this.handleResetForm()
    })
    this.bindEmailChange()
    this.renderRecoverEmail()
  }

  handleResetForm (): void {
    this.$LoginForm?.resetForm()
    this.$RecoverEmailForm?.resetForm()
  }

  renderRecoverEmail (): void {
    const recoverEmail = Cookie.get('recoverEmail')
    if (recoverEmail) {
      this.$renderRecoverEmail && (this.$renderRecoverEmail.innerText = recoverEmail)
    }
  }

  scrollToTop (): void {
    window.scrollTo(0, 0)
  }

  bindEmailChange (): void {
    if (this.$asEmail) {
      this.$asEmail.addEventListener('input', (e: any) => {
        Cookie.set('recoverEmail', e.target.value)
      }
      )
    }
  }
}
new LoginWrapper()
