// const Collapse = require('bootstrap').Collapse
const Helpers = require('../../scripts/helpers.ts')

const Footer = class{
  $form: HTMLElement | null
  constructor (footer: HTMLElement | null) {
    this.$form = footer
    if (!this.$form) return
    this.init()
  }
  init () {
    this.ifSubmit()
    // new Collapse()
  }
  ifSubmit() {
    // 判断url中的customer_posted是否为true
    let customerPost:any = Helpers.getParam('customer_posted')
    let hash: string = Helpers.getHash()
    if (customerPost && hash === '#footer-contact_form') {
      this.showSuccess()
    }
  }
  showSuccess() {
    let successTips: HTMLElement | null = this.$form && this.$form.querySelector('.as-success-tips')
    successTips && successTips.classList.remove('d-none')
  }
}

let footer: HTMLElement | null = document.querySelector('.as-newsletter-footer')
new Footer(footer)