const Cookies = require('js-cookie')
const Modal = require('bootstrap').Modal
const Helpers = require('../../scripts/helpers.ts')
const ValidateForm = require('../../scripts/validateForm.ts')

class NotifyMe extends ValidateForm {
  $parentNotifyMe: any
  COOKIE_NAME: any
  $close: any
  $modal: any
  constructor (notifyMe: any) {
    if (notifyMe.querySelector('.as-notify-me-form')) {
      super(notifyMe.querySelector('.as-notify-me-form'))
    } else {
      super()
    }
    this.$parentNotifyMe = notifyMe
    if (!this.$parentNotifyMe) return
    this.COOKIE_NAME = 'notify_me_subscribe'
    this.$close = this.$parentNotifyMe.querySelector('.as-close')
    this.$popupIcon = document.querySelector('.as-subscribe-popup')
    this.notifyMeWrap = this.$parentNotifyMe.querySelector('.as-notify-me-modal-wrap')
    this.$spinners = this.$parentNotifyMe.querySelectorAll('.as-spinner')
    this.init()
  }
  init () {
    this.initNotifyMe()
  }
  initNotifyMe() {
    this.listenShow()
    const action = this.$parentNotifyMe?.dataset.action
    if (!action) {
      this.initNotifyMeForm()
    }
  }
  showModal() {
    this.$modal = Modal.getOrCreateInstance(this.$parentNotifyMe)
    this.$modal.show()
  }
  listenShow() {
    this.$parentNotifyMe.addEventListener('show.bs.modal', (event:any) => {
      //传product-title variant-name到订阅弹窗
      let notifyMeButton:any = event.relatedTarget
      if(!notifyMeButton) return
      let productTitle = notifyMeButton.dataset.bsProductTitle
      let variantName = notifyMeButton.dataset.bsVariantTitle
      let notifyMeTagsInput = this.$parentNotifyMe.querySelector('.as-notify-me-tags')
      if(notifyMeTagsInput) {
        if(variantName) {
          notifyMeTagsInput.value = productTitle + ',' + variantName
        } else{
          notifyMeTagsInput.value = productTitle
        }
        
      }

      // 订阅成功过，恢复订阅表单为可修改状态
      if (Cookies.get(this.COOKIE_NAME)) {
        this.notifyMeWrap?.classList.remove('success')
      }
    })
  }
  // listenClose() {
  //   this.$parentNotifyMe.addEventListener('hidden.bs.modal', () => {
  //     Cookies.set(this.CLOSE_COOKIE, true)
  //   })
  // }

  initNotifyMeForm() {
    // 判断url中的customer_posted是否为true
    let customerPost:any = Helpers.getParam('customer_posted')
    let hash: string = Helpers.getHash()
    if (customerPost && hash === '#notify-me-contact_form') {
      this.showModal()
      this.toggleSuccess(true)
    }
  }
  // 覆盖ValidateForm类中的方法
  toggleSuccess(show) {
    this.notifyMeWrap?.classList.toggle('success', Boolean(show))
    Cookies.set(this.COOKIE_NAME, true, { expires: 730 })
    this.handleClose()
  }
  // 覆盖ValidateForm类中的方法
  freeze () {
    this.$submit && (this.$submit.disabled = true)
    this.$spinners && Array.prototype.forEach.call(this.$spinners, ($spinner) => {
      $spinner?.classList.remove('visually-hidden')
    })
  }
  // 覆盖ValidateForm类中的方法
  unfreeze() {
    this.$submit && (this.$submit.disabled = false)
    this.$spinners && Array.prototype.forEach.call(this.$spinners, ($spinner) => {
      $spinner?.classList.add('visually-hidden')
    })
  }

  handleClose() {
    this.$modal = Modal.getOrCreateInstance(this.$parentNotifyMe)
    const closeTimer = setTimeout(() => {
      this.$modal.hide()
      clearTimeout(closeTimer)
    }, 5000)
  }

  clearMessage () {
    // 表单输入时清除提示信息
    this.$parent.addEventListener('input', () => {
      this.toggleError(Boolean(false))
    })
  }

}
let notifyMes: any = document.querySelector('.as-notify-me-modal')
let notifyMe = notifyMes && new NotifyMe(notifyMes)
