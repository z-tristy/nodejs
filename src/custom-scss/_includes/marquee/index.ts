import { debounce } from '@scripts/_utilities'

class Marquee extends HTMLElement {
  root: any
  marqueeElementsDisplayed: any
  marqueeContent: any
  $li: any
  $parent: any
  totalMarqueeElements: any
  stickBottom?: boolean | string
  constructor () {
    super()
    this.$parent = this.querySelector('.as-marquee')
    if (!this.$parent) {
      return
    }
    this.stickBottom = this.$parent?.dataset?.stickBottom
    this.init()
  }

  init () {
    this.handleStickBottom()
    window.addEventListener('resize', this.debounceOnRezie.bind(this))
  }

  /**
   * 防抖处理
   */
  debounceOnRezie = debounce(() => {
    this.handleStickBottom()
  }, 300)

  /**
   * 页面有加购条的情况下，贴底样式变更
   */
  handleStickBottom () {
    const $BuyLine: any = document.querySelector('.as-shop-with-us-wrap .as-add-to-cart-wrap')
    const marqueeHeight = this.$parent.offsetHeight
    if (this.stickBottom === 'true') {
      if ($BuyLine) { // 有购物条
        const buyLineHeight = $BuyLine.offsetHeight
        this.$parent.style.bottom = `${buyLineHeight}px`
        // 贴底时body留空白区域
        document.body.style.paddingBottom = `${marqueeHeight + buyLineHeight}px`
      } else {
        // 贴底时body留空白区域
        document.body.style.paddingBottom = `${marqueeHeight}px`
      }
    }
  }
}

if (customElements.get('custom-marquee') == null) {
  customElements.define('custom-marquee', Marquee)
}
