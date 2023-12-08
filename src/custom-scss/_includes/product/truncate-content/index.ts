class TruncateCountent extends HTMLElement {
  $parent: HTMLElement | null
  $btn: HTMLElement | null
  $arrow: HTMLElement | null
  $showmore: HTMLElement | null
  $showless: HTMLElement | null
  parentH: number = 0
  rows: number = 3
  ellipsisHeight: number = 0
  constructor () {
    super()
    this.$parent = this.querySelector('.as-truncate-content-parent')
    this.$btn = this.querySelector('.as-truncate-content-btn')
    this.$arrow = this.querySelector('.as-truncate-content-arrow')
    this.$showmore = this.querySelector('.as-show-more')
    this.$showless = this.querySelector('.as-show-less')

    if (this.$parent === null) return

    this.init()
  }

  init (): void {
    this.handleTextRows()
    this.handleButtonClick()
  }

  /**
   * @description 计算文本的行数; 如果文本不足三行, 则取消 showmore&showless 文案
  */
  handleTextRows (): void {
    if (this.$parent === null) return
    // 取消掉 ellipsis, 计算总高度
    this.$parent.classList.remove('ellipsis-3')
    this.parentH = this.$parent.clientHeight

    const styles = window.getComputedStyle(this.$parent)
    this.ellipsisHeight = Number(styles.lineHeight.slice(0, -2)) * this.rows
    if (this.parentH > this.ellipsisHeight) {
      this.$btn?.classList.remove('opacity-0')
      this.$parent?.classList.add('ellipsis-3')
      this.$parent.style.height = `${this.ellipsisHeight}px`
    } else {
      this.$btn?.classList.add('d-none')
    }
  }

  handleButtonClick (): void {
    this.$btn?.addEventListener('click', () => {
      if (this.$parent === null) return

      this.$showmore?.classList.toggle('d-none')
      this.$showless?.classList.toggle('d-none')
      this.$arrow?.classList.toggle('rotate-180')
      this.$parent?.classList.toggle('ellipsis-3')
      // 处理文案高度变化动画 (高度丝滑变化)
      if (this.$parent?.classList.value.includes('ellipsis-3')) {
        this.$parent.style.height = `${this.ellipsisHeight}px`
      } else {
        this.$parent.style.height = `${this.parentH}px`
      }
    })
  }
}

if (customElements.get('truncate-content') === undefined) {
  customElements.define('truncate-content', TruncateCountent)
}
