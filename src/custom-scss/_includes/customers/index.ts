const Visible = class{
  $visibleWrap: any
  constructor () {
    this.$visibleWrap = document.querySelectorAll('.as-pwd-wrap')  
    this.init()
  }
  init () {
    this.addPwdVisibleEventListener()
  }
  addPwdVisibleEventListener() {
    var that = this
    that.$visibleWrap && Array.prototype.map.call(that.$visibleWrap, ($visibleWrap) => {
      let $visiblePwd = $visibleWrap.querySelector('.as-pwd-input')
      let $visibleControl = $visibleWrap.querySelector('.as-visible-control')
      // let $pwdTip = $visibleWrap.querySelector('.as-pwd-tip')
      // let $pristineError = $visibleWrap.querySelector('.pristine-error')
      $visibleControl && $visibleControl.addEventListener('click', function () {
        $visibleControl.classList.toggle('content-invisible')
        var typeAttr = document.createAttribute('type')
        if ($visibleControl.classList.contains('content-invisible')) {
          typeAttr.value = 'password'
        } else {
          typeAttr.value = 'text'
        }
        $visiblePwd && $visiblePwd.setAttributeNode(typeAttr)                
      })
    })
  }
}
const HiddenPwdTip = class {
  constructor() {
    this.hidden()
  }
  hidden() {
    let $hiddenTip:any = document.querySelector('.as-hidden-tip')
    let $pwdTip:any = document.querySelector('.as-pwd-tip')
    $hiddenTip && $hiddenTip.addEventListener('click', function () {
    $pwdTip.classList.add('d-none')
  })
  }
}
const ShowPwdTip = class  {
  constructor() {
    this.show()
  }
  show() {
    let $pweInput:any = document.querySelector('.as-pwd-input')
    let $pwdTip:any = document.querySelector('.as-pwd-tip')
    $pweInput && $pweInput.addEventListener('blur', function() {
    let $pwdWrap:any = document.querySelector('.as-pwd-wrap')
    let $inputErrors:any = $pwdWrap.querySelector('.pristine-error')
    if ($inputErrors && $inputErrors.style.display == 'none') {
      $pwdTip.classList.remove('d-none')
    }
    })
  }
}


module.exports = {Visible, HiddenPwdTip,ShowPwdTip}
new Visible()
new HiddenPwdTip()
new ShowPwdTip()