class CustomMilestone extends HTMLElement {
  constructor () {
    super()

    this.$btn = this.querySelector('.as-more-btn')
    this.$items = this.querySelectorAll('.as-text-content')

    if (this.$btn && this.$items) {
      this.bindEvent()
    }
  }

  bindEvent () {
    this.$btn.addEventListener('click', () => {
      this.$btn.remove()
      Array.prototype.forEach.call(this.$items, ($item) => {
        let $parent = $item.parentNode
        if ($parent.classList.contains('d-none')) {
          $parent.classList.remove('d-none') 
        }
      })
    })
  }
}

if (!customElements.get('custom-milestone')) {
  customElements.define('custom-milestone', CustomMilestone)
}

export default CustomMilestone