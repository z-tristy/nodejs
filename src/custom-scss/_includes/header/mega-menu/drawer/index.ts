import Offcanvas from "bootstrap/js/dist/offcanvas";

class HeaderDrawer extends HTMLElement {
  $submenuTriggers: NodeList
  $submenuContent: NodeList
  constructor() {
    super();
    this.$submenuTriggers = this.querySelectorAll('.as-submenu-trigger')
    this.$submenuContent = this.querySelectorAll('.as-submenu-content')
    this.init()
  }
  init() {
    this.bindEvents()
    this.handleClose()
    this.initStatus()
  }
  bindEvents() {
    Array.from(this.$submenuTriggers).map((trigger, index) => {
      trigger.addEventListener('click', () => {
        this.showSubmenuContent(trigger as HTMLElement)
      })
    })
  }

  showSubmenuContent(trigger: HTMLElement) {
    new Offcanvas(Array.from(this.$submenuContent).find((content) => {
      return `#${content?.id}` === trigger?.dataset?.bsTarget
    }))?.show()
    this.hideDrawerMenu()
  }

  hideDrawerMenu() {
    let offcanvasBody = document.querySelector('.as-drawer-content')
    offcanvasBody?.classList.add('hide')
  }

  showDrawerMenu() {
    let offcanvasBody = document.querySelector('.as-drawer-content')
    offcanvasBody?.classList.remove('hide')
  }

  handleClose() {
    Array.from(this.$submenuContent).map(content => {
      const $closeBtn = content.querySelector('.as-submenu-close')
      $closeBtn?.addEventListener('click', () => {
        Offcanvas.getInstance(content)?.hide()
        this.showDrawerMenu()
      })
    })
  }
  initStatus() {
    const $outerOffcanvas = this.querySelector('.as-outer-offcanvas')
    $outerOffcanvas?.addEventListener('hide.bs.offcanvas', () => {
      this.showDrawerMenu()
    })
  }
}

if (!customElements.get('header-drawer')) {
  customElements.define('header-drawer', HeaderDrawer);
}