
import smoothscroll from 'smoothscroll-polyfill'
class categoryTab {
  $parent: HTMLElement | null
  $mainElement: any
  $tab: HTMLElement | null
  $sectioneElements: any
  sectionsList: any
  $tabs: any
  tabHeight: any
  constructor ($parent: any) {
    this.$parent = $parent
    if (this.$parent == null) return
    this.$mainElement = this.$parent.parentNode
    this.$sectioneElements = this.$mainElement?.querySelectorAll('.shopify-section')
    this.$tab = this.$parent.querySelector('.as-tabs')
    if (this.$sectioneElements.length === 0) return
    this.tabHeight = this.$tab?.offsetHeight
    this.$tabs = this.$parent.querySelectorAll('.as-tab-item')
    this.sectionsList = this.$tab.dataset.sectionlist.split('&') || []
    this.init()
  }

  init (): void {
    this.handlerSection(this.$tabs[0].dataset.sections, false)
    this.$tab?.addEventListener(('click'), (e) => {
      if (!e.target.dataset || !e.target.classList.contains('tab-item')) return
      Array.prototype.forEach.call(this.$tabs, (item) => {
        e.target?.id === item.id ? item.classList.add('active') : item.classList.remove('active')
      })
      this.handlerSection(e.target?.dataset.sections, true) 
    })
  }

  handlerSection (sections: any, isScroll: boolean): void {
    if (sections.length === 0) return
    const list = sections.split('&')
    try {
      this.sectionsList.forEach((item: any) => {
        if (list.indexOf(item) !== -1) {
          this.$sectioneElements[item].classList.remove('d-none')
        } else {
          this.$sectioneElements[item].classList.add('d-none')
        }
      })
      const elementID = this.$sectioneElements[list[0]].id
      if (elementID.length === 0 || !isScroll) return
      const element = this.$mainElement.querySelector(`#${elementID}`)
      element.style.scrollMarginTop = (this.tabHeight - 1) + 'px'
      smoothscroll.polyfill()
      element.scrollIntoView({ block: 'start', behavior: 'smooth' })
    } catch (error) { }
  }
}

const categoryTabs: NodeListOf<Element> = document.querySelectorAll('.as-category-tab')
if (categoryTabs.length !== 0) {
  categoryTabs.forEach(($item) => {
    new categoryTab($item)
  })
}
