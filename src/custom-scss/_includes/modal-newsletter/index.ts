const Cookies = require('js-cookie')
const Modal = require('bootstrap').Modal
const Helpers = require('../../scripts/helpers.ts')
const ValidateForm = require('../../scripts/validateForm.ts')
import autoModal from '@sections/auto-modal'

class Newsletter extends ValidateForm {
  $parentNewsletter: any
  COOKIE_NAME: any
  CLOSE_COOKIE: any
  $interval: any
  $close: any
  $modal: any
  constructor (newsletter: any) {
    if (newsletter.querySelector('.as-newsletter-form')) {
      super(newsletter.querySelector('.as-newsletter-form'))
    } else {
      super()
    }
    this.$parentNewsletter = newsletter
    if (!this.$parentNewsletter) return
    this.CLOSE_COOKIE = 'close_subscribe_popup'
    this.COOKIE_NAME = 'subscribe'
    this.$interval = Number(this.$parentNewsletter.dataset.interval)
    this.$close = this.$parentNewsletter.querySelector('.as-close')
    this.timer = null
    this.$popupIcon = document.querySelector('.as-subscribe-popup')
    this.newsletterWrap = this.$parentNewsletter.querySelector('.as-newsletter-modal-wrap')
    this.$spinners = this.$parentNewsletter.querySelectorAll('.as-spinner')
    
    this.init()
  }
  init () {
    this.initNewsletter()
  }
  initNewsletter() {
    this.listenShow()
    this.listenClose()
    // 判断是否有cookie
    if (Cookies.get(this.COOKIE_NAME) || Cookies.get(this.CLOSE_COOKIE)){ 
      return
    } else {
      this.handleModal()
      const action = this.$parentNewsletter?.dataset.action
      if (!action) {
        this.initNewsletterForm()
      }
    }
  }
  handleModal() {
    /**  
     * @param 第一个参数： 页面打开后或者当前页面上存在弹窗消失后，过多久时间才出现弹窗的时间参数
     * @param 第二个参数： show auto modal (function)
    */
    new autoModal().init(this.$interval,this.showModal.bind(this))
  }

  showModal() {
    this.$modal = Modal.getOrCreateInstance(this.$parentNewsletter)
    this.$modal.show()
  }
  listenShow() {
    this.$parentNewsletter.addEventListener('show.bs.modal', () => {
      clearTimeout(this.timer)

      // 隐藏侧边栏按钮
      this.$popupIcon?.classList.add('subscribe-open')
      // 订阅成功过，恢复订阅表单为可修改状态
      if (Cookies.get(this.COOKIE_NAME)) {
        this.newsletterWrap?.classList.remove('success')
      }
    })
  }
  listenClose() {
    this.$parentNewsletter.addEventListener('hidden.bs.modal', () => {
      Cookies.set(this.CLOSE_COOKIE, true)

      // 显示侧边栏按钮
      this.$popupIcon?.classList.remove('subscribe-open')
    })
  }
  initNewsletterForm() {
    // 判断url中的customer_posted是否为true
    let customerPost:any = Helpers.getParam('customer_posted')
    let hash: string = Helpers.getHash()
    if (customerPost && hash === '#modal-contact_form') {
      this.showModal()
      this.toggleSuccess(true)
    }
  }
  // 覆盖ValidateForm类中的方法
  toggleSuccess(show) {
    this.newsletterWrap?.classList.toggle('success', Boolean(show))
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
    this.$modal = Modal.getOrCreateInstance(this.$parentNewsletter)
    const closeTimer = setTimeout(() => {
      this.$modal.hide()
      clearTimeout(closeTimer)
    }, 3000)
  }

  clearMessage () {
    // 表单输入时清除提示信息
    this.$parent.addEventListener('input', () => {
      this.toggleError(Boolean(false))
    })
  }

}

(() => {
  let $wrap: any = document.querySelector('.as-tpl-newsletter-modal');
  if(!$wrap) return;
  let html =  Helpers.tpl2html('tpl-newsletter-modal',{});
  if(!html) return;
  $wrap.innerHTML = html;
  let modals: any = document.querySelector('.as-newsletter-modal')
  modals && new Newsletter(modals)
})()
