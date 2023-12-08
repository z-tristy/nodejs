
// import { fetchConfig } from '@scripts/_utilities'
// const Modal = require('bootstrap').Modal
const ValidateForm = require('@scripts/validateForm.ts')
const axios = require('axios')
const serialize = require('@scripts/serialize.js')
const Helpers = require('@scripts/helpers')

class SubscribeBanner extends ValidateForm {
  $parent: any
  $submitBtn: any
  constructor($parent: Element) {
    if ($parent) {
      super($parent)
    } else {
      super()
    }
    this.$parent = $parent
    if(!this.$parent) return
    this.$submitBtn = this.$parent.querySelectorAll('.as-submit-btn')
    this.init()
  }
  init() {
    this.setEmailInputPadding()
    this.inputOfcus()
  }

  setEmailInputPadding() {
    const $input = this.$parent.querySelector('.as-email-input')
    const $submitBtnWrapper = this.$parent.querySelector('.as-submit-btn-wrapper')
    const submitBtnWidth = ($submitBtnWrapper?.offsetWidth) / 16
    $input ? $input.style.paddingRight = `${submitBtnWidth}rem` : ''
    if($input.classList.contains('as-split')) {
      $input?.classList.add('input-padding-button')
    }
  }
  //点击email输入框，光标跳转到文案最后面（文案也跟随跳转）  //当 文案宽度 > (输入框宽度-左右padding)，光标会忽略右padding，跳到输入框最右边
  inputOfcus() {
    const $input = this.$parent.querySelector('.as-email-input')
    $input.onclick = function() {
      if(!Helpers.isPc()) {
        let val = $input.value
        $input.blur()
        $input.value = ''
        $input.value = val
        $input.focus()
      }
      
    }
  }

  // 处理默认提交表单事件
  handleSubmit () {
    this.$parent.addEventListener('submit', (event: any) => {
      this.clearMessage()
      const status = this.validateForm(this.$parent)
      const action = this.$parent?.dataset.action 
      if (!status) {
        event.stopImmediatePropagation()
        event.preventDefault()
        // 隐藏后端返回提示语
        this.hideErrors()
      } else {
        this.freeze()
        // 如果配置了后台接口，则提交数据至后台接口
        if (action) {
          event.stopImmediatePropagation()
          event.preventDefault()
          this.enableBtnLoading()
          axios.post(action, serialize(this.$parent))
            .then((response:any) => {
              // 表单提交成功后，显示提交成功提示语
              this.toggleSuccess(Boolean(true))
              this.unfreeze()
            })
            .catch(() => {
              // 提交失败，显示失败提示语
              this.toggleError(Boolean(true))
              this.unfreeze()
            })
            .finally(() => {
              this.disableBtnLoading()
            })
        } 
      }
    })
  }

  enableBtnLoading() {
    if (!this.$submitBtn) return
    this.$submitBtn.forEach((btn:Element) => {
      btn.classList.add('loading')
      btn && (btn.disabled = true)
    });
  }

  disableBtnLoading() {
    if (!this.$submitBtn) return
    this.$submitBtn.forEach((btn:Element) => {
      btn.classList.remove('loading')
      btn && (btn.disabled = false)
    });
  }
}

const $parents = document.querySelectorAll('.as-subscribe-banner-form')
$parents && $parents.forEach(($parent) => {
  new SubscribeBanner($parent)
})
export default SubscribeBanner