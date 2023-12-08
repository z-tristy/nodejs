
class WaterfallsCollapse extends HTMLElement {
  $triggerBtn: HTMLInputElement | null
  $hideContent: NodeList | null
  constructor() {
    super();
    this.$triggerBtn = this.querySelector('.as-view-all-btn')
    this.$hideContent = this.querySelectorAll('.as-hide-item')
    this.init()
  }

  init () {
    this.onClick()
  }
  onClick() {
    this.$triggerBtn?.addEventListener('click', this.showContent.bind(this));
  }
  showContent() {
    this.$hideContent?.forEach((content) => {
      content.classList.remove('d-none')
      this.removeTrigger()
    })
  }
  removeTrigger() {
    this.$triggerBtn?.parentElement?.remove()
  }

}
customElements.define('waterfalls-collapse', WaterfallsCollapse);