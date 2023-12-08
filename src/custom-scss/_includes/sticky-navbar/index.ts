import { debounce } from '@scripts/_utilities'
const StickyNavbar = class {
  $stickyNavbar: HTMLElement | null
  debounceOnRezie: ((...args: any[]) => void) | undefined
  $nav: HTMLElement | null
  $backdrop: HTMLElement | null
  $tabs: NodeList | null
  $sectionId: any
  $stickyNavbarSectionId: any
  $mainElement: any
  $sectioneElements: any
  heightDifference: any
  constructor (navbar: HTMLElement | null) {
    this.$stickyNavbar = navbar
    if (!this.$stickyNavbar) return
    this.$nav = this.$stickyNavbar.querySelector('.as-nav')
    this.$tabs = this.$stickyNavbar.querySelectorAll('.as-tabs')
    this.$backdrop = this.$stickyNavbar.querySelector('.as-navbar-backdrop')
    this.$sectionId = ''
    this.$stickyNavbarSectionId = this.$stickyNavbar.id
    this.$mainElement = this.$stickyNavbar.parentNode
    this.$sectioneElements = this.$mainElement && this.$mainElement.children
    this.init()
  }

  init (): void {
    this.initCollapse()
    this.debounceOnRezie = debounce(() => {
      this.initCollapseStatus()
    }, 300)
    this.initCollapseStatus()
    this.handleSectionId()
    window.addEventListener('resize', this.debounceOnRezie.bind(this))
    this.listenBackdrop()
    this.moveStickyPosition()
    this.listenSalesChannelModalClose()
  }

  listenBackdrop (): void {
    this.$backdrop?.addEventListener('click', () => {
      this.hideCollapse()
    })
  }

  initCollapseStatus (): void {
    if (Boolean(this.isPc())) {
      this.hideCollapse()
    }
  }

  handleSectionId (): void {
    this.$tabs?.forEach((tab) => {
      const sectionNumber = Number(tab?.dataset.sectionNumber)
      const length = this.$sectioneElements.length
      // tab类型的block中输入的内容需要为数字 且大于0 且数字 <= 当前页面配置的seciton数量
      if (Boolean(sectionNumber) && sectionNumber > 0 && sectionNumber <= length) {
        this.getSectionId(sectionNumber - 1, length)
        this.setSectionId(tab)
      }
    })
  }

  getSectionId (number: number, length: number): void {
    if (number > 0 && number <= length) {
      for (let i = 0; i < length; i++) {
        if (i === number) {
          this.$sectionId = this.$sectioneElements[i].id
        }
      }
    }
  }

  setSectionId (tab: any): void {
    if (this.$stickyNavbarSectionId !== this.$sectionId) {
      if (Boolean(this.$sectionId)) {
        tab.href = '#' + String(this.$sectionId)
      }
    }
  }

  hideCollapse (): void {
    this.$stickyNavbar?.classList.remove('show')
    document.body?.classList.remove('overflow-hidden')
    this.$nav?.classList.remove('show')
  }

  initCollapse (): void {
    const toggle: HTMLElement | null = document.querySelector('.as-collapse-toggle')
    toggle?.addEventListener('click', () => {
      this.toggleCollapse()
      this.$stickyNavbar?.classList.toggle('show')
      document.body?.classList.toggle('overflow-hidden')
    })
  }

  isPc (): boolean | undefined {
    const $pcFlag = this.$stickyNavbar?.querySelector('.as-lg-flag')
    if ($pcFlag == null) return
    const flag = window.getComputedStyle($pcFlag).display === 'none'
    return flag
  }

  toggleCollapse (): void {
    this.$nav?.classList.toggle('show')
  }

  // 点击弹窗按钮，去除sticky navbar 的sticky定位
  moveStickyPosition (): void {
    const $salesChannelModalButton = this.$stickyNavbar?.querySelector('.as-sales-channel-modal-btn')
    const $navbarWrapper = this.$stickyNavbar?.querySelector('.as-navbar-wrapper')
    // const headerHeight = document.querySelector('.as-shopify-header')?.offsetHeight
    $salesChannelModalButton?.addEventListener('click', () => {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
      const navbarTop = this.$stickyNavbar.offsetTop
      this.heightDifference = scrollTop - navbarTop
      this.$stickyNavbar?.classList.remove('position-sticky')
      if (this.heightDifference === 0) {
        $navbarWrapper?.classList.add('opacity-0')
      }
    })
  }

  // 监听弹窗关闭，关闭则恢复sticky navbar的sticky定位
  listenSalesChannelModalClose (): void {
    const $salesChannelModal = this.$stickyNavbar?.querySelector('.as-sales-channel-modal')
    const $navbarWrapper = this.$stickyNavbar?.querySelector('.as-navbar-wrapper')
    $salesChannelModal?.addEventListener('hidden.bs.modal', () => {
      this.$stickyNavbar?.classList.add('position-sticky')
      if (this.heightDifference === 0) {
        $navbarWrapper?.classList.remove('opacity-0')
      }
    })
  }
}

const navbar: HTMLElement | null = document.querySelector('.as-sticky-navbar')
new StickyNavbar(navbar)