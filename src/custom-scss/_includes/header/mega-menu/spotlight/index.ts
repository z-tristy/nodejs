class MegaDropdown extends HTMLElement {
  $triggerLinks: NodeList
  $targetContent: NodeList
  constructor() {
    super();
    this.$triggerLinks = this.querySelectorAll('.as-megamenu-link')
    this.$targetContent = this.querySelectorAll('.as-megamenu-info')
    this.init()
  }
  init() {
    this.handleEvent()
  }
  handleEvent() {
    Array.from(this.$triggerLinks).map((link, index) => {
      link.addEventListener('mouseover', () => {
        this.open(index)
      })
      link.addEventListener('focusin', () => {
        this.open(index)
      })
    })
  }
  open(index:any) {
    this.hideAll()
    this.showTarget(index)
  }
  hideAll() {
    Array.from(this.$targetContent).map((content) => {
      content?.classList?.add('d-none')
    })
  }
  showTarget(index: Number) {
    Array.from(this.$targetContent)[index]?.classList?.remove('d-none')
  }

}

if (!customElements.get('mega-dropdown')) {
  customElements.define('mega-dropdown', MegaDropdown);
}