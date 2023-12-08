import { fetchConfig } from '@scripts/_utilities'

var bus = require('@scripts/events')
var money = require('@shopify/theme-currency')
class ComplementaryProducts extends HTMLElement {
  $toggleRecommendationsButtonWrap: any
  $number: HTMLInputElement | null
  $showMoreButton: any
  $showLessButton: any
  $RecommendationsCol: any
  $recommendationsBtns: any
  $recommendationsAdd: NodeList
  $data: HTMLInputElement | null
  variantData: Object
  currentVariant: any
  currentQuantity: any
  _$prices: any
  _$compareAtPrices: any
  cartAddNewItem: any
  constructor () {
    super()
    this.$number = document.querySelector('.as-form-control-number')
    this.initCurrentQuantity()
    this.variantData = this.getVariantData()
    this.$data = document.querySelector('.as-product-variant')

    this.getRecommendations()
  }

  /**
   * fetch 调用 recommendations 数据
   * https://shopify.dev/docs/themes/product-merchandising/recommendations/show-product-recommendations
  */
  getRecommendations (): void {
    const url = this.dataset.url
    if (url === undefined) return
    fetch(url)
      .then(response => response.text())
      .then((text) => {
        const html = document.createElement('div')
        const reg = /<complementary-mark[\s\S]*<\/complementary-mark>/
        const filterArr = text.match(reg)
        if (filterArr === null) return
        const filterText = filterArr[0]
        html.innerHTML = filterText
        const $recommendationsNew = html.querySelector('complementary-mark')
        if ($recommendationsNew === null) return
        if ($recommendationsNew.innerHTML.trim().length) {
          this.innerHTML = $recommendationsNew.innerHTML
        }
        this.initialization()
      })
      .catch(e => {
        console.error(e)
      })
  }

  initialization (): void {
    this.$toggleRecommendationsButtonWrap = document.querySelector('.as-toggle-recommendations-btn')
    this.$RecommendationsCol = document.querySelectorAll('.as-recommendations-col')
    this.$showMoreButton = this.$toggleRecommendationsButtonWrap?.querySelector('.as-show-more')
    this.$showLessButton = this.$toggleRecommendationsButtonWrap?.querySelector('.as-show-less')
    this.$recommendationsBtns = document.querySelectorAll('.as-recommendations-btn')
    this.$recommendationsAdd = document.querySelectorAll('.as-recommendations-add')
    this._$prices = document.querySelectorAll('.as-product-price')
    this._$compareAtPrices = document.querySelectorAll('.as-product-compare-at-price')

    // 用来记录随手购新加购的产品及现有数量
    this.cartAddNewItem = []

    // 变体改变时触发
    this.$data?.addEventListener('change', () => {
      this.onVariantChange()
    })

    this.$number?.addEventListener('change', () => {
      this.onQuantityChange()
    })

    this.init()
  }

  init (): void {
    this.updateCurrentVariant()
    this.updateTotalPrice()
    this.toggleRecommendations()
    this.listenerRecommendationsBtnClick()
    this.listenerRecommendationsAddClick()
    this.updateSaleOutText()
  }

  /**
   * @description 初始化数量
  */
  initCurrentQuantity (): void {
    if (this.$number !== null) {
      this.currentQuantity = this.$number.value
    } else {
      this.currentQuantity = 1
    }
  }

  onVariantChange (): void {
    this.initCurrentQuantity()
    this.updateCurrentVariant()
    this.hideRecommendations()
    this.updateSaleOutText()
    this.deletePickedrecommendationsBtn()
    this.updateTotalPrice()
  }

  // 更新当前变体
  updateCurrentVariant (): void {
    const currentVariantId = this.$data?.value
    this.currentVariant = this.variantData.find((variant: any) => {
      return variant.id === Number(currentVariantId)
    })
  }

  // 处理所有变体数据
  getVariantData (): any {
    const $data = document.querySelector('.as-variants-data')
    if ($data !== null) {
      this.variantData = JSON.parse($data.textContent ?? '[]')
      return this.variantData
    } else {
      return []
    }
  }

  onQuantityChange (): void {
    this.updateCurrentVariant()
    this.initCurrentQuantity()
    this.updateTotalPrice()
  }

  // 点击show more按钮切换剩余配件的显示或隐藏
  toggleRecommendations (): void {
    if (this.$toggleRecommendationsButtonWrap !== null) {
      this.$toggleRecommendationsButtonWrap.addEventListener('click', () => {
        this.$showMoreButton.classList.toggle('d-none')
        this.$showLessButton.classList.toggle('d-none')
        Array.prototype.forEach.call(this.$RecommendationsCol, (item) => {
          item.classList.toggle('d-none')
        })
      })
    }
  }

  listenerRecommendationsBtnClick (): void {
    Array.prototype.forEach.call(this.$recommendationsBtns, recommendationsBtn => {
      recommendationsBtn.addEventListener('click', () => {
        recommendationsBtn.classList.toggle('picked')
        recommendationsBtn.parentNode.classList.toggle('picked')
        this.updateCartAddInput(recommendationsBtn)
        // this.updateCurrentVariant()
        this.updateTotalPrice()
        this.updateCheckoutUrl()
      })
    })
  }

  /**
   * @description 按钮不置底时, 点击add 按钮, 直接加购产品到购物车
  */
  listenerRecommendationsAddClick (): void {
    if (this.$recommendationsAdd.length > 0) {
      Array.from(this.$recommendationsAdd).map(($val) => {
        $val.addEventListener('click', () => {
          if ($val.classList.contains('picked')) return
          this.enableBtnLoading($val)
          // if ($val.classList.contains('picked')) {
          // this.handleRemoveRecommendations($val)
          // } else {
          this.handleAddRecommendations($val)
          // }
        })
      })
    }
  }

  /**
   * @description 删除刚买的配件
  */
  handleRemoveRecommendations ($demo): void {
    fetch(`${window.routes.cart_url}.js`)
      .then((response) => response.json())
      .then((parsedState) => {
        const items = parsedState.items
        items.map(val => {
          if (val.id == $demo.dataset?.id) {
            const quantity = val.quantity - 1
            if (quantity >= 0) {
              const updates = {
                [val.id]: quantity
              }
              const body = JSON.stringify({ updates })
              this.handleUpdateRecommendations($demo, body)
            }
          }
        })
      })
      .catch((error) => {
        console.error(error)
      })
  }

  handleUpdateRecommendations ($demo, body): void {
    fetch(`${window.routes.cart_update_url}.js`, { ...fetchConfig(), ...{ body } })
      .then((response) => response.json())
      .then((parsedState) => {
        bus.emit(bus.EVENT.ADD_ITEM_TO_CART)
      })
      .catch((error) => {
        console.error(error)
      })
      .finally(() => {
        this.disableBtnLoading($demo)
        this.updateAddBtn($demo)
      })
  }

  /**
   * @description 购买一个配件
  */
  handleAddRecommendations ($demo): void {
    const items = []
    items.push({
      id: $demo.dataset?.id,
      quantity: '1'
    })
    const body = JSON.stringify({ items })
    fetch(`${window.routes.cart_add_url}.js`, { ...fetchConfig(), ...{ body } })
      .then((response) => response.json())
      .then((parsedState) => {
        parsedState.items.map(val => {
          this.cartAddNewItem.push({
            id: val.id,
            quantity: val.quantity
          })
        })
        bus.emit(bus.EVENT.ADD_ITEM_TO_CART)
      })
      .catch((error) => {
        console.error(error)
      })
      .finally(() => {
        this.disableBtnLoading($demo)
        this.updateAddBtn($demo)
      })
  }

  /**
   * @description 按钮loading
  */
  enableBtnLoading ($demo: HTMLElement): void {
    $demo?.classList.add('disabled')
    $demo?.classList.add('loading')
  }

  /**
   * @description 按钮取消 loading
  */
  disableBtnLoading ($demo: HTMLElement): void {
    $demo?.classList.remove('disabled')
    $demo?.classList.remove('loading')
  }

  /**
   * @description
  */
  updateAddBtn ($demo: HTMLElement): void {
    $demo.classList.toggle('picked')
    $demo.parentNode.parentNode.classList.toggle('picked')
    if ($demo.classList.contains('picked')) {
      $demo.innerText = $demo.dataset.added
      $demo.classList.add('is-active')
    } else {
      $demo.innerText = $demo.dataset.add
    }
  }

  // 更新无货提示文案
  updateSaleOutText (): void {
    const saleOutText: HTMLElement | null = document.querySelector('.as-sale-out-text')
    if (saleOutText !== null) {
      if (Boolean(this.currentVariant.available)) {
        saleOutText.classList.add('d-none')
      } else {
        saleOutText.classList.remove('d-none')
      }
    }
  }

  // 隐藏随手购配件
  hideRecommendations (): void {
    const recommendations: HTMLElement | null = document.querySelector('.as-recommendations')
    if (recommendations !== null) {
      if (Boolean(this.currentVariant.available)) {
        recommendations.classList.remove('d-none')
      } else {
        recommendations.classList.add('d-none')
      }
    }
  }

  // 如果点击add to cart跳转到购物车页面，选择配件，添加对应的input到表单，取消配件，从表单中删除对应的input
  updateCartAddInput (recommendationsBtn: HTMLElement): void {
    const $inputsWaper: HTMLElement | null = document.querySelector('.as-go-cart-page')
    if ($inputsWaper !== null) {
      if (recommendationsBtn?.classList.contains('picked')) {
        const variantInput = document.createElement('input')
        const quantityInput = document.createElement('input')
        variantInput.setAttribute('type', 'hidden')
        variantInput.setAttribute('name', `items[${recommendationsBtn.dataset.index}]id`)
        variantInput.setAttribute('value', `${recommendationsBtn.dataset.id}`)
        quantityInput.setAttribute('type', 'hidden')
        quantityInput.setAttribute('name', `items[${recommendationsBtn.dataset.index}]quantity`)
        quantityInput.setAttribute('value', '1')
        $inputsWaper.appendChild(variantInput)
        $inputsWaper.appendChild(quantityInput)
      } else {
        const deleteVariantInput = document.querySelector(`input[name="items[${recommendationsBtn.dataset.index}]id"]`)
        const deleteQuantityInput = document.querySelector(`input[name="items[${recommendationsBtn.dataset.index}]quantity"]`)
        deleteVariantInput !== null && $inputsWaper.removeChild(deleteVariantInput)
        deleteQuantityInput !== null && $inputsWaper.removeChild(deleteQuantityInput)
      }
    }
  }

  // 总价格
  updateTotalPrice (): void {
    // 获取所有选中的随手购
    const pickedRecommendationsBtns = document.querySelectorAll('.as-recommendations-btn.picked')
    let variantPrice,
      variantComparePrice,
      totalPrice: Number,
      totalComparePrice: Number | undefined

    if (Boolean(this.currentVariant)) {
      variantPrice = this.currentVariant.price * this.currentQuantity
      variantComparePrice = this.currentVariant.compare_at_price * this.currentQuantity
      totalPrice = Number(variantPrice)
      totalComparePrice = Number(variantComparePrice)
    }
    // 当前变体可售时，累加配件价格
    if (pickedRecommendationsBtns.length > 0) {
      for (let i = 0; i < pickedRecommendationsBtns.length; i++) {
        // 现价
        totalPrice = Number(totalPrice) + Number(pickedRecommendationsBtns[i].dataset?.price)

        if (pickedRecommendationsBtns[i].dataset?.compared !== undefined) {
          // 对比价
          totalComparePrice += (pickedRecommendationsBtns[i].dataset.compared - 0)
        } else {
          totalComparePrice += (pickedRecommendationsBtns[i].dataset.price - 0)
        }
      }
    }

    Array.prototype.forEach.call(this._$prices, function ($price) {
      $price.innerText = money.formatMoney(totalPrice, window.theme.moneyFormat)
    })

    Array.prototype.forEach.call(this._$compareAtPrices, function ($compareAtPrice) {
      if (parseInt(totalComparePrice) > parseInt(totalPrice)) {
        $compareAtPrice.classList.remove('d-none')
        // $compareAtPrice.classList.add('d-inline-block')
        $compareAtPrice.innerText = money.formatMoney(totalComparePrice, window.theme.moneyFormat)
      } else {
        // $compareAtPrice.classList.remove('d-inline-block')
        $compareAtPrice.classList.add('d-none')
      }
    })
  }

  // 更新buy now按钮的链接参数
  updateCheckoutUrl (): void {
    const variant = this.currentVariant
    const quantity = this.currentQuantity
    const checkoutBtn: HTMLLinkElement | null = document.querySelector('.as-checkout-btn')
    const recommendations = document.querySelector('.as-recommendations')
    if (checkoutBtn !== null) {
      if (!Boolean(variant)) {
        checkoutBtn.href = `${checkoutBtn?.href.substr(0, Number(checkoutBtn?.href.lastIndexOf(':')) + 1)}${quantity}`
      } else {
        if (recommendations === null) {
          checkoutBtn.href = `${checkoutBtn?.dataset?.cartUrl}/${this.currentVariant.id}:${quantity}`
        } else {
          let processUrl = `${checkoutBtn?.dataset?.cartUrl}/${this.currentVariant.id}:${quantity}`
          let pickedRecommendationsBtns = document.querySelectorAll('.as-recommendations-btn.picked')
          if (pickedRecommendationsBtns.length > 0) {
            for (let i = 0; i < pickedRecommendationsBtns.length; i++) {
              processUrl = processUrl + ',' + pickedRecommendationsBtns[i].dataset.id + ':1'
            }
          }
          checkoutBtn.href = processUrl
        }
      }
    }
  }

  // 切换变体，清除所用配件选中状态
  deletePickedrecommendationsBtn (): void {
    const pickedRecommendationsBtns = document.querySelectorAll('.as-recommendations-btn.picked')
    Array.prototype.forEach.call(pickedRecommendationsBtns, (recommendationsBtn) => {
      recommendationsBtn.classList.remove('picked')
      recommendationsBtn.parentNode.classList.remove('picked')
    })
  }
}

if (customElements.get('complementary-products') === undefined) {
  customElements.define('complementary-products', ComplementaryProducts)
}
