import smoothscroll from 'smoothscroll-polyfill'
import { isMdPc, debounce } from '@scripts/_utilities'
const Collapse = require('bootstrap').Collapse

class FAQListStacked extends HTMLElement {
  navLinkPrefix: string
  faqType: any
  $navs: any
  $anchor: any
  $currentNav: any
  sectionId: string
  $tabPanes: any
  $accordionButton: any
  $mobNavBtn: any
  $highLine: any
  $menuNavs: any
  $scrollContents: any
  $shopifyHeader: any
  constructor () {
    super()
    this.sectionId = String(this.dataset.sectionId)
    this.faqType = String(this.dataset.faqType)
    this.navLinkPrefix = `as-link-${this.sectionId}-`
    this.$navs = this.querySelectorAll('.as-nav')
    this.$anchor = this.querySelector('.as-anchor')
    this.$menuNavs = this.querySelectorAll(`.as-nav-link-${isMdPc() === false ? 'mob' : 'pc'}`)
    if (this.$menuNavs.length === 0) return
    this.$tabPanes = this.querySelectorAll('.as-tab-pane')
    this.$accordionButton = this.querySelector('.as-accordion-button')
    this.$mobNavBtn = this.querySelector(`#as-accordion-nav-mob-${this.sectionId}`)
    this.$scrollContents = this.querySelectorAll('.as-scroll-content')
    this.$highLine = this.querySelector('.as-high-line')
    this.$shopifyHeader = document.querySelector('.as-shopify-header')
    this.init()
  }

  init (): void {
    this.initActiveNav()
    this.faqType === 'flatted' ? this.initFlattedBindEvent() : this.initStackedBindEvent()
  }

  initActiveNav (hash = window.location.hash): void {
    let target: any = null
    if (hash.length > 0) {
      const suffix = hash.replace('#', '')
      target = this.querySelector(`[id^="${this.navLinkPrefix}${suffix}-${isMdPc() === false ? 'mob' : 'pc'}"]`)
      if(target === null) target = this.$menuNavs[0];
    } else {
      target = this.$menuNavs[0]
    }
    this.faqType === 'flatted' ? this.handleFlattedTabActive(target) : this.handleStackedTabActive(target)
  }

  initStackedBindEvent (): void {
    ;[...this.$navs].forEach(($nav) => {
      $nav.addEventListener('click', (event: any) => {
        if (event.target.closest('.as-nav-item')) {
          let item: any;
          if(event.target.classList.contains('nav-link')) {
            item = event.target
          } else {
            item = event.target.closest('.nav-link')
          }
          this.updateURL(item.href)
          if (this.$accordionButton !== null && isMdPc() === false && item.dataset.text) {
            this.$accordionButton.innerHTML = `<span class="pe-3">${item.dataset.text}</span>`
            this.$mobNavBtn.classList.remove('fade-in')
            this.$mobNavBtn.classList.add('fade-out')
            // this.toggleCollapse(this.$mobNavBtn)
          }
        }
      })
    })

    if (this.$tabPanes.length <= 0) return
    ;[...this.$tabPanes].forEach(($tabPane) => {
      $tabPane.addEventListener('click', (event: any) => {
        const $target = event.target
        if ($target !== null && $target.classList.contains('as-view-more') === true) {
          const $currentPane = $target.closest('.as-tab-pane')
          const $items = $currentPane.querySelectorAll('.accordion-item')
          if ($items.length === 0) return
          ;[...$items].forEach($item => {
            $item.classList.remove('d-none')
          })
          $target.classList.add('d-none')
        }
      })
    })

    this.$accordionButton.addEventListener('click', () => {
      if (this.$mobNavBtn.classList.contains('fade-in') !== false) {
        this.$mobNavBtn.classList.remove('fade-in')
        this.$mobNavBtn.classList.add('fade-out')
      } else {
        this.$mobNavBtn.classList.add('fade-in')
        this.$mobNavBtn.classList.remove('fade-out')
      }
    })
  }

  initFlattedBindEvent (): void {
    ;[...this.$menuNavs].forEach($item => {
      $item.addEventListener('click', () => {
        this.handleFlattedTabActive($item)
        this.updateURL($item.href)
        const translateY = (isMdPc() === false ? (+(this.$accordionButton?.offsetHeight)) : 0) + (+(this.isHeaderSticky()))
        this.handleScrollPane($item.dataset.targetId, translateY)
        if (isMdPc() === false) {
          this.toggleCollapse(this.$mobNavBtn)
        }
      })
    })

    window.addEventListener(
      'scroll',
      debounce(() => {
        this.hanleeScrollListener()
      }, 100)
    )
    if (isMdPc() === false) {
      setTimeout(() => {
        const $faqListFlattedMenu: any = this.querySelector('.as-faq-list-flatted-menu')
        if ($faqListFlattedMenu != null) {
          $faqListFlattedMenu.style.top = String(this.isHeaderSticky()) + 'px'
        }
      }, 100)
    }
  }

  isHeaderSticky (): any {
    if (this.$shopifyHeader !== null && this.$shopifyHeader.classList.contains('sticky-top') === true) {
      return Number(this.$shopifyHeader.offsetHeight)
    }
    return 0
  }

  handleStackedTabActive ($target: any): void {
    const { levelsClass = null, text = null } = $target.dataset
    if (levelsClass !== null) {
      const $collapse = this.querySelector(`.${levelsClass}`)
      this.toggleCollapse($collapse)
    }
    if (isMdPc() === false && text !== null && this.$accordionButton !== null) {
      this.$accordionButton.innerHTML = `<span class="pe-3">${text}</span>`
    }
    $target.click()
  }

  handleFlattedTabActive ($target: any): void {
    const $lastActiveTab = this.querySelector(`.as-nav-link-${isMdPc() === false ? 'mob' : 'pc'}.active`)
    $lastActiveTab?.classList.remove('active')
    $target?.classList.add('active')
    const { offsetHeight, offsetTop } = $target
    this.$highLine.setAttribute('style', `transform:translateY(${offsetTop}px);height:${offsetHeight}px`)
    if (isMdPc() === false && $target.dataset.text !== null && this.$accordionButton !== null) {
      this.$accordionButton.innerHTML = `<span class="pe-3">${$target.dataset.text}</span>`
    }
  }

  hanleeScrollListener (): void {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
    const windowHeight = document.documentElement.clientHeight || document.body.clientHeight
    const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight
    let $target: any
    const translateY: any = (isMdPc() === false ? (+(this.$accordionButton?.offsetHeight)) + 2 : 2) + (+(this.isHeaderSticky()))
    if (scrollTop < this.$scrollContents[0].offsetTop) {
      $target = this.$menuNavs[0]
    } else if (scrollTop + windowHeight >= scrollHeight) {
      $target = this.$menuNavs[this.$menuNavs.length - 1]
    } else {
      this.$scrollContents.forEach((item: any, index: any) => {
        if (item.offsetTop - translateY <= scrollTop) {
          $target = this.$menuNavs[index]
        }
      })
    }
    this.handleFlattedTabActive($target)
    this.updateURL($target)
  }

  handleScrollPane (elementID: any, scrollMarginTop: any = 0): void {
    if (elementID.length === 0) return
    const element = this.querySelector(`#${elementID}`)
    if (element === null) return
    element.style.scrollMarginTop = String(scrollMarginTop) + 'px'
    smoothscroll.polyfill()
    element?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }

  updateURL (url: any): void {
    window.history.replaceState({}, '', url)
  }

  toggleCollapse ($collapse: any = null): void {
    if ($collapse !== null) {
      const $bsCollapse = Collapse.getOrCreateInstance($collapse)
      $bsCollapse.toggle()
    }
  }
}
class FAQListFlatted extends FAQListStacked {}

customElements.define('faq-list-stacked', FAQListStacked)
customElements.define('faq-list-flatted', FAQListFlatted)
