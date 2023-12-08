class QuantityInput extends HTMLElement {
  changeEvent: Event
  $input!: HTMLInputElement | null
  constructor () {
    super()
    this.$input = this.querySelector('input')
    this.changeEvent = new Event('change', { bubbles: true })

    if (this.$input === null) return

    this.querySelectorAll('button').forEach(
      button => button.addEventListener('click', this.onButtonClick.bind(this))
    )

    this.$input?.addEventListener('change', () => {
      this.onQuantityChange()
    })
  }

  /**
   * @description 监听数量选择器input 数量发生变化, 并发送事件控制 加减两个按钮 是否添加 disabled 属性
  */
  onQuantityChange (): void {
    if (this.$input?.value === this.$input?.min) {
      // disabled -
      this.disabledButtons(true, false)
    } else if (this.$input?.value === this.$input?.max) {
      // disable +
      this.disabledButtons(false, true)
    } else {
      this.disabledButtons(false, false)
    }
  }

  disabledButtons (disableMinus: boolean, disablePlus: boolean): void {
    const minus: HTMLInputElement | null = document.querySelector('.as-quantity-btn[name="minus"]')
    const plus: HTMLInputElement | null = document.querySelector('.as-quantity-btn[name="plus"]')
    minus !== null && (minus.disabled = disableMinus)
    plus !== null && (plus.disabled = disablePlus)
  }

  onButtonClick (event: Event): void {
    event.preventDefault()
    const previousValue = this.$input?.value

    const { name } = event.target as HTMLButtonElement
    name === 'plus' ? this.$input?.stepUp() : this.$input?.stepDown()
    if (previousValue !== this.$input?.value) this.$input?.dispatchEvent(this.changeEvent)
  }
}

if (customElements.get('quantity-input') === undefined) {
  customElements.define('quantity-input', QuantityInput)
}
