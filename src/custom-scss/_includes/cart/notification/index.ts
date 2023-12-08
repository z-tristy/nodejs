var bus = require('@scripts/events.js')

class CartNotification extends HTMLElement {
  timeout: NodeJS.Timeout
  time: number
  $notification: any
  $backdrop: any
  $miniCart: any
  onBodyClick: (evt: {
    target: any
  }) => void
  cartItems: any
  debounceOnRezie: ((...args: any[]) => void) | undefined
  isClosed: boolean
  constructor () {
    super()
    this.isClosed = true
    // this.timeout =
    this.time = this.dataset !== undefined ? Number(this.dataset.interval) : -1
    this.$notification = this.querySelector('.as-cart-notification')
    this.$backdrop = this.querySelector('.as-modal-backdrop')
    this.$miniCart = document.querySelector('mini-cart')
    this.onBodyClick = this.handleBodyClick.bind(this)
    this.bindEvent()
  }

  bindEvent (): void {
    document.addEventListener(bus.EVENT.ADD_ITEM_TO_CART, () => {
      this.clearCloseTimeout()
      this.startCloseTimeout()
    })

    this.querySelector('.as-close')?.addEventListener('click', () => {
      this.clearCloseTimeout()
      this.close()
    })

    this.addEventListener('mouseenter', () => {
      this.clearCloseTimeout()
    })

    this.addEventListener('mouseleave', () => {
      this.startCloseTimeout()
    })

    // this.$notification?.addEventListener('keyup', (evt) => evt.code === 'Escape' && this.close())
  }

  clearCloseTimeout (): void {
    if (this.time > 0) clearTimeout(this.timeout)
  }

  startCloseTimeout (): void {
    if (this.time > 0) {
      this.timeout = setTimeout(() => {
        this.close()
      }, this.time)
    }
  }

  getSectionsToRender() {
    return [
      {
        class: '.cart-notification-product',
        section: this.querySelector('.cart-notification-product')?.dataset.id,
        selectors: this.cartItems?.map(item => {
          return `.as-product-${item.id}`
        }) || []
      }
    ]
  }

  renderContents(responseData: any, postData: any[]) {
    this.cartItems = responseData.items
    this.getSectionsToRender().forEach((section => {
      var html = ''
      if (responseData.sections && responseData.sections[section?.section]) {
        section.selectors.forEach(selector => {
          html += this.getSectionInnerHTML(responseData.sections[section?.section], selector)
        })
      }
      const $elementToReplace = this.querySelector(section?.class)
      $elementToReplace && ($elementToReplace.innerHTML = html)
    }))

    const $checkout = this.querySelector('.as-btn-cart-checkout')
    const permalink = postData.map(item => `/${item.id}:${item.quantity}`)
    $checkout && ($checkout.href = `${$checkout?.dataset.origin}${permalink}`)

    this.open()
  }

  getSectionInnerHTML(html, selector) {
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector).innerHTML
  }

  open() {
    this.classList.add('show')
    this.$backdrop?.classList.add('show')
    document.body.addEventListener('click', this.onBodyClick)

    this.isClosed = false

    this.$miniCart?.disable()
  }

  close() {
    this.classList.remove('show')
    this.$backdrop?.classList.remove('show')
    document.body.removeEventListener('click', this.onBodyClick)

    this.isClosed = true

    this.$miniCart?.enable()
  }

  handleBodyClick(evt: { target: any }) {
    const target = evt.target
    if (target !== this.$notification && !target.closest('.as-cart-notification') && !target.closest('.as-cart-dropdown')) {
      this.close()
    }
  }
}

customElements.define('cart-notification', CartNotification)
