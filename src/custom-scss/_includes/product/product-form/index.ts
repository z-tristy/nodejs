import { fetchConfig } from '@scripts/_utilities'
var bus = require('@scripts/events')

class ProductForm extends HTMLElement {
  $purchaseForm: any
  $cartNotifications: any
  postSections: any
  $addToCart: any
  $cartIconBubble: any
  $miniCart: any
  $drawerCart: any
  $cartItem1: any
  $errorMessageWrapper: any
  $errorMessage: any
  $shopWithUs: HTMLElement | null
  $inventoryQuantity: any
  $quantity: any
  constructor () {
    super()
    this.$purchaseForm = this.querySelector('.as-async-add-form')
    this.$purchaseForm?.addEventListener('submit', this.onSubmitHandler.bind(this))

    this.$quantity = this.$purchaseForm?.querySelector('.as-form-quantity')
    this.$quantity?.addEventListener('change', this.onChangeHandler.bind(this))

    this.$inventoryQuantity = this.$purchaseForm?.querySelector('#as-inventory-quantity')

    this.$cartNotifications = document.querySelectorAll('cart-notification')
    this.$cartIconBubble = document.querySelector('cart-icon-bubble')
    this.$miniCart = document.querySelector('mini-cart')
    this.$drawerCart = document.querySelector('drawer-cart')
    this.$cartItem1 = document.querySelector('cart-items-1')

    // this.$shopWithUs 这个dome节点是js 加载出来的, 现在 == null, 之后提交的时候需要再次定义
    this.$shopWithUs = document.querySelector('.as-shop-with-us-wrap')
  }

  onChangeHandler (): void {
    this.toggleErrorMessage(true)
  }

  onSubmitHandler (event): void {
    event.preventDefault()

    const formId = this.$purchaseForm?.getAttribute('id')
    this.$addToCart = formId && document.querySelector(`button[form=${formId}], #${formId} button[type=submit]`)

    this.$shopWithUs = document.querySelector('.as-shop-with-us-wrap')
    this.$errorMessageWrapper = this.$addToCart?.parentElement?.querySelector('.as-product-form__error-message-wrapper')
    this.$errorMessage = this.$addToCart?.parentElement?.querySelector('.as-product-form__error-message')
    // 针对购买页贴底加购条的情况
    if (this.$errorMessageWrapper == null || this.$errorMessage == null) {
      this.$errorMessageWrapper = this.querySelector('.as-product-form__error-message-wrapper')
      this.$errorMessage = this.querySelector('.as-product-form__error-message')
    }

    const obj = {}
    const formData = new FormData(this.$purchaseForm)

    // 处理加购单个产品
    formData.forEach(function(value, key) {
      if (key === 'id' || key === 'quantity') {
        obj[key] = value
      }
    })

    if (this.$shopWithUs === null) {
      this.add2cart([obj])
    } else {
      // 将随手购加到购物车数据中
      let items:any = []
      let pickedRecommendationsBtns = document.querySelectorAll('.as-recommendations-btn.picked')

      if (pickedRecommendationsBtns) {
        items.push(obj)
        for (let i = 0; i < pickedRecommendationsBtns.length; i++) {
          items.push({
            id: pickedRecommendationsBtns[i].dataset.id,
            quantity: '1'
          })
        }

        this.add2cart(items)
      } else {
        this.add2cart([obj])
      }
    }
  }

  add2cart(items: {}[]) {
    const notifySections = this.$cartNotifications[0]?.getSectionsToRender().map((section) => section.section) || []
    const bubbleSections = this.$cartIconBubble?.getSectionsToRender().map((section) => section.section) || []
    const miniCartSections = this.$miniCart?.getSectionsToRender().map((section) => section.section) || []
    const cartItem1Sections = this.$cartItem1?.getSectionsToRender().map((section) => section.section) || []
    let isSuccess = false

    this.postSections = {
      sections: notifySections.concat(bubbleSections).concat(miniCartSections).concat(cartItem1Sections) || []
    }

    const body = JSON.stringify({
      items: items,
      ...this.postSections,
      sections_url: window.location.pathname
    })

    this.enableBtnLoading()
    this.toggleErrorMessage(true)

    fetch(`${routes.cart_add_url}.js`, {...fetchConfig(), ...{ body }})
    .then((response) => response.json())
    .then((parsedState) => {
      if (parsedState.status) {
        this.handleErrorMessage(window.cartStrings.quantityError.replace('[quantity]',this.$inventoryQuantity.value || 0))
        return
      }
      if(this.$purchaseForm.dataset?.carType === 'page'){
        const $quantity = this.$purchaseForm.querySelector('input[name="quantity"]')
        if($quantity)$quantity.value = 0;
        this.$purchaseForm.submit()
        return
      } 

      isSuccess = true
      const postData = items.map(item => {
        return {
          quantity: item.quantity || 1,
          id: item.id
        }
      })
      // 发布全局事件
      bus.emit(bus.EVENT.ADD_ITEM_TO_CART)
      this.$cartNotifications && Array.prototype.forEach.call(this.$cartNotifications, ($cartNotification) => {
        $cartNotification?.renderContents(parsedState, postData)
      })
      // this.$cartNotification?.renderContents(parsedState, postData)
      this.$cartIconBubble?.renderContents(parsedState)
      this.$miniCart?.renderContents(parsedState)
      // this.$cartItem1?.renderContents(parsedState)
      this.$cartItem1?.showOffcanvas()
    })
    .catch((error) => {
      console.error(error)
    })
    .finally(() => {
      this.disableBtnLoading(isSuccess)
    })
  }

  enableBtnLoading() {
    if (!this.$addToCart) return
    this.$addToCart.classList.add('disabled')
    this.$addToCart.classList.add('loading')
  }

  disableBtnLoading(isSuccess:boolean) {
    if (!this.$addToCart) return
    this.$addToCart.classList.remove('loading')
    if(isSuccess) {
      this.$addToCart.classList.add('success')
    }else {
      this.$addToCart.classList.add('error')
    }
    setTimeout(() => {
      this.$addToCart.classList.remove('disabled')
      if(isSuccess) {
        this.$addToCart.classList.remove('success')
      }else {
        this.$addToCart.classList.remove('error')
      }
    }, 1000)
    this.$addToCart.blur()
  }

  handleErrorMessage(errorMessage = false) {
    if (errorMessage && this.$errorMessage) {
      this.$errorMessage.textContent = errorMessage
      this.toggleErrorMessage(false)
    }
  }

  toggleErrorMessage(flag: boolean) {
    this.$errorMessageWrapper?.toggleAttribute('hidden', flag)
  }
}

customElements.define('product-form', ProductForm)
