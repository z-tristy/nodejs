/* eslint-disable @typescript-eslint/no-var-requires */
const money = require('@shopify/theme-currency')

class VariantLists extends HTMLElement {
  variantData: Object
  $number: any
  $data: HTMLInputElement | null
  currentVariant: any
  currentQuantity: number
  sectionId: string
  constructor () {
    super()
    this.variantData = {}
    this.$number = document.querySelector('.as-form-control-number')
    this.currentQuantity = this.$number?.value

    const id = this.dataset?.section
    this.sectionId = id === undefined ? '' : id

    this.$data = document.querySelector('.as-product-variant')
    if (this.$data === null) return

    // 变体改变时触发
    this.$data.addEventListener('change', () => {
      this.onVariantChange()
    })

    this.$number?.addEventListener('change', () => {
      this.onQuantityChange()
    })
  }

  // 输入框的数量发上改变时触发
  onQuantityChange (): void {
    this.currentQuantity = this.$number?.value
    this.updateCartQuantity()
    this.updateTotlePrice()
    this.updateCheckoutUrl(this.currentVariant, this.currentQuantity)
  }

  onVariantChange (): void {
    this.updateCurrentVariant()
    if (Boolean(this.currentVariant)) {
      this.updateMedia()
      this.updateURL()
      this.updateVariantInput()
      this.renderProductInfo()
      this.resetQuantity()
    }
  }

  updateCurrentVariant (): void {
    const currentVariantId = this.$data?.value
    this.currentVariant = this.getVariantData().find((variant: any) => {
      return variant.id === Number(currentVariantId)
    })
  }

  // 处理所有变体数据
  getVariantData (): any {
    const $data = document.querySelector('.as-variants-data')
    if ($data !== null) {
      this.variantData = JSON.parse($data.textContent ?? '[]')
      return this.variantData
    }
  }

  // 更新变体图片
  updateMedia (): void {
    Array.from(document.querySelectorAll('.as-gallery-wrapper')).map((media: any) => {
      if (this.currentVariant.id === Number(media.dataset.variantId)) {
        media.classList.remove('d-none')
      } else {
        media.classList.add('d-none')
      }
    })
  }

  // 更新url
  updateURL (): void {
    window.history.replaceState({ }, '', `${this.dataset.url}?variant=${this.currentVariant.id}`)
  }

  // 更新加购的变体id
  updateVariantInput (): void {
    const productForms = document.querySelectorAll(`#as-product-form-${this.sectionId}, #as-product-form-installment`)
    productForms.forEach((productForm) => {
      let $input: any
      let $inputQuantity: any
      if (productForm.querySelector('.as-go-cart-page') !== null) {
        $input = productForm.querySelector('input[name="id"]')
        $inputQuantity = productForm.querySelector('input[name="quantity"]')
      } else {
        $input = productForm.querySelector('input[name="id"]')
        $inputQuantity = productForm.querySelector('input[name="quantity"]')
      }
      if ($input === null) return
      // 切换变体，当前变体数量重置为1
      $inputQuantity.value = 1
      this.currentQuantity = 1
      // 切换变体，换成当前变体的id
      $input.value = this.currentVariant.id
      $input.dispatchEvent(new Event('change', { bubbles: true }))
    })
  }

  /**
   * @description 数量发生改变时, 同步更新产品总价
  */
  updateTotlePrice (): void {
    const $PriceTotleWrap: HTMLElement | null = document.querySelector(`#price-total-${this.sectionId}`)
    if ($PriceTotleWrap === null) return
    this.handleUpdateTotlePrice($PriceTotleWrap, '.as-price-sale')
    this.handleUpdateTotlePrice($PriceTotleWrap, '.as-price-compare')
    this.handleUpdateTotlePrice($PriceTotleWrap, '.as-price-regular')
  }

  handleUpdateTotlePrice ($parent: HTMLElement, clasName: string): void {
    const $price: HTMLElement | null = $parent.querySelector(clasName)
    if ($price !== null) {
      const price: number = Number($price.dataset?.price) || 1
      $price.innerText = money.formatMoney(price * this.currentQuantity, window.theme.moneyFormat)
    }
  }

  /**
   * @description 更新购买表单中 input[name="quantity"] 的数量
  */
  updateCartQuantity (): void {
    const productForms = document.querySelectorAll(`#as-product-form-${this.sectionId}, #as-product-form-installment`)
    productForms.forEach((productForm) => {
      const $input: HTMLInputElement | null = productForm.querySelector('input[name="quantity"]')
      $input !== null && ($input.value = String(this.currentQuantity))
    })
  }

  /**
   * @description 切换变体时 重新渲染产品信息; 价格、缺货信息
  */
  renderProductInfo (): void {
    fetch(`${this.dataset.url}?variant=${this.currentVariant.id}&section_id=${this.sectionId}`)
      .then((response) => response.text())
      .then((responseText) => {
        const id = `price-${this.sectionId}`
        const html = new DOMParser().parseFromString(responseText, 'text/html')
        const destination = document.getElementById(id)
        const source = html.getElementById(id)

        const priceTotleId = `price-total-${this.sectionId}`
        const $priceTotle = document.getElementById(priceTotleId)
        const $priceTotleSource = html.getElementById(priceTotleId)

        const inventoryId = `inventory-${this.sectionId}`
        const $inventoryDestination = document.getElementById(inventoryId)
        const $inventorySource = html.getElementById(inventoryId)

        const $inventoryQuantity = document.getElementById('as-inventory-quantity')
        const $inventoryQuantityHtml = html.getElementById('as-inventory-quantity')
        

        // 渲染价格
        if (source && destination) destination.innerHTML = source.innerHTML
        // 渲染总价
        if ($priceTotleSource && $priceTotle) $priceTotle.innerHTML = $priceTotleSource.innerHTML
        // 渲染缺货信息
        if ($inventorySource && $inventoryDestination) $inventoryDestination.innerHTML = $inventorySource.innerHTML
        // 渲染可购买数量信息
        if ($inventoryQuantity && $inventoryQuantityHtml) $inventoryQuantity.value = $inventoryQuantityHtml.value


        // 渲染按钮
        this.toggleAddButton(true)
        // 处理checkout
        this.updateCheckoutUrl(this.currentVariant, this.currentQuantity)

        //更新数量选择器
        if (!Boolean(this.currentVariant.available)) {
          this.updateNumberState('disabled')
        } else {
          this.updateNumberState('enable')
        }
      })
  }

  resetQuantity (): void {
    this.$number.value = 1
  }

  // 更新加购按钮
  toggleAddButton (): void {
    const $productForm = document.getElementById(`as-product-form-${this.sectionId}`)?.querySelector('.as-form-button-wrap')
    const addButton = document.getElementById(`as-product-form-${this.sectionId}`)?.querySelector('[name="add"]')
    const unavailableInfo = addButton?.querySelector('.as-unavailable-info')
    const availableInfo = addButton?.querySelector('.as-available-info')
    const $notifyMeInfo = $productForm?.querySelector('.as-notify-me-btn')
    const checkoutBtn = document.querySelector('.as-checkout-btn')
    const buttonWrap = document.querySelector('.as-button-wrap')
    const buyNowButton = $productForm?.querySelector('.as-buy-now-btn')
    if (addButton === null || addButton === undefined) return
    const isNotifyMeAddButton = addButton?.dataset.notifyMe
    // 将当前变体的title赋值给notify me按钮的自定义属性
    if ($notifyMeInfo !== undefined && $notifyMeInfo !== null) {
      $notifyMeInfo.dataset.bsVariantTitle = this.currentVariant.title
    }
    // $notifyMeInfo && $notifyMeInfo.setAttribute('data-bs-variant-title', this.currentVariant.title)
    if (!Boolean(this.currentVariant.available)) {
      addButton?.setAttribute('disabled', true)

      // notify-me按钮的显示
      if (Boolean(isNotifyMeAddButton)) {
        addButton?.classList.add('p-0')
        addButton?.classList.add('border-0')
        $notifyMeInfo?.classList.remove('d-none')
      }
      unavailableInfo?.classList.remove('d-none')
      availableInfo?.classList.add('d-none')
      // 有随手购的购买页的按钮
      if (checkoutBtn) checkoutBtn.classList.add('d-none')
      if (checkoutBtn) checkoutBtn.parentElement?.classList.add('d-none')
      if (buttonWrap) buttonWrap.classList.add('d-none')

      buyNowButton?.classList.add('d-none')
    } else {
      addButton?.removeAttribute('disabled')
      // notify-me按钮的隐藏
      if (isNotifyMeAddButton) {
        addButton.classList.remove('p-0')
        addButton.classList.remove('border-0')
        $notifyMeInfo?.classList.add('d-none')
      }
      unavailableInfo?.classList.add('d-none')
      availableInfo?.classList.remove('d-none')
      if (checkoutBtn) checkoutBtn.classList.remove('d-none')
      if (checkoutBtn) checkoutBtn.parentElement?.classList.remove('d-none')
      if (buttonWrap) buttonWrap.classList.remove('d-none')
      buyNowButton?.classList.remove('d-none')
    }
  }

  updateNumberState (status: any): void {
    const $quantity = document.querySelector('quantity-input')
    if ($quantity === null || !Boolean(status)) return
    const $minus: HTMLInputElement | null = $quantity.querySelector('.as-quantity-btn[name="minus"]')
    const $plus: HTMLInputElement | null = $quantity.querySelector('.as-quantity-btn[name="plus"]')
    if ($minus === null || $plus === null) return
    if (status === 'disabled') {
      $minus.disabled = true
      $plus.disabled = true
    } else if (status === 'enable') {
      $plus.disabled = false
    }
  }

  /**
   * @description 修改 立即购买按钮 的链接
   * v2 版本 是通过 {{ form | payment_button }} 自动生成的, 没有 as-checkout-btn 类名
  */
  updateCheckoutUrl (variant, quantity = 1): void {
    const checkoutBtn = document.querySelector('.as-checkout-btn')
    if (checkoutBtn === null) return
    let shopWithUs = document.querySelector('.as-shop-with-us-wrap')
    if (!variant) {
      checkoutBtn.href = `${checkoutBtn?.href.substr(0, Number(checkoutBtn?.href.lastIndexOf(':')) + 1)}${quantity}`
    } else {
      if(!shopWithUs) {
        checkoutBtn.href = `${checkoutBtn?.dataset?.cartUrl}/${this.currentVariant.id}:${quantity}`
      }else {
        let processUrl = `${checkoutBtn?.dataset?.cartUrl}/${this.currentVariant.id}:${quantity}`
        let pickedItems = document.querySelectorAll('.as-recommendations-btn.picked')
        if (pickedItems) {
          for (let i = 0; i < pickedItems.length; i++) {
            processUrl = processUrl + ',' + pickedItems[i].dataset.id + ':1'
          }
        }
        checkoutBtn.href = processUrl
      }
    }
  }
}

if (customElements.get('variant-lists') === undefined) {
  customElements.define('variant-lists', VariantLists)
}
