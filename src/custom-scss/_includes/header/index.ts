import { fetchConfig, debounce } from '@scripts/_utilities'
import { isLgPc } from '@scripts/_utilities'

const StickyHeader = class{
  $parent: any
  $flag: any
  $ifSticky: any
  currentScrollTop: any
  headerBounds: any
  $stickyNavbar: any
  constructor(header:any) {
    this.$parent = header
    if (!this.$parent) return
    // 如果有优先级更高的stick navbar,则取消定位
    this.$stickyNavbar =  document.querySelector('.as-sticky-navbar')
    if (this.$stickyNavbar) return
    this.$flag = this.$parent.querySelector('.as-header-sticky-flag')
    // this.$ifSticky = this.$flag && Boolean(Number(this.$flag.value))
    this.$ifSticky = this.$flag && Number(this.$flag.value)
    this.init()
  }
  init() {
    this.initStickyHeader()
  }
  initStickyHeader() {
    if (this.$ifSticky && this.$ifSticky == 1) {
      this.$parent.classList.add('sticky-top')
    }
    else if (this.$ifSticky && this.$ifSticky == 2)  {
      this.$parent.classList.add('position-static')
    }
    else {
      this.listenScroll()
      this.createObserver()
    }
  }
  createObserver() {
    let observer = new IntersectionObserver((entries, observer) => {
      this.headerBounds = entries[0].intersectionRect;
      observer.disconnect();
    })
    observer.observe(this.$parent);
  }
  listenScroll() {
    var that = this
    this.currentScrollTop = 0
    this.headerBounds = {}
    // window.addEventListener('scroll', that.throttle(that.handleScroll, 80))
    window.addEventListener('scroll', () => {
      that.handleScroll()
    })
  }
  handleScroll() {
    let backDrop = this.$parent.querySelector('.as-dropdown-backdrop')
    let showDropdown = false
    if (backDrop) {
      showDropdown = backDrop.classList.contains('show')
    }
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    if (showDropdown) {
      this.reveal()
    } else {
      if (scrollTop > this.currentScrollTop && scrollTop > this.headerBounds.bottom) {
        this.hide()
      } else if (scrollTop < this.currentScrollTop && scrollTop > this.headerBounds.bottom) {
        this.reveal()
      } else if (scrollTop <= this.headerBounds.top) {
        this.reset()
      }
    }
    this.currentScrollTop = scrollTop
  }
  throttle(func: any, delay: number) {
    let canUse = true
    return (...args: any) => {
      if (canUse) {
        func.apply(this, args)
        canUse = false
        setTimeout(() => (canUse = true), delay)
      }
    }
  }
  hide() {
    this.$parent.classList.add('shopify-section-header-hidden', 'sticky-top')
  }
  reveal() {
    this.$parent.classList.add('sticky-top', 'animate')
    this.$parent.classList.remove('shopify-section-header-hidden')
  }
  reset() {
    this.$parent.classList.remove('shopify-section-header-hidden', 'sticky-top', 'animate')
  }
}

const Header = class{
  $parent: HTMLElement
  $navlink: NodeList | undefined
  $expand: HTMLElement | undefined
  $header: HTMLElement | undefined
  $dropdowns: NodeList | undefined
  Sticky: any
  $notification: HTMLElement | undefined
  $cartIconBubble: HTMLElement | undefined
  constructor (header: any) {
    this.$parent = header as HTMLElement
    if (!this.$parent) return
    this.$header = this.$parent.querySelector('.as-site-header') as HTMLElement
    this.$navlink = this.$header.querySelectorAll('.as-nav-link') as NodeList

    this.$dropdowns = this.$header.querySelectorAll('.as-dropdown') as NodeList
    
    this.$notification = document.querySelector('cart-notification') as HTMLElement
    this.$cartIconBubble = document.querySelector('cart-icon-bubble') as HTMLElement

    this.$expand = this.$header.querySelector('.as-expand') as HTMLElement
    this.Sticky = null
    this.init()
  }

  init () {
    this.Sticky = new StickyHeader(this.$parent)
    this.handleExpand()
    this.initDropdown()
  }

  handleExpand () {
    this.$expand && this.$expand.addEventListener('click', () => {
      // if (this.$expand.classList.value.includes('')) 
      if (this.$header.dataset.expand == 'false') {
        this.$parent.classList.remove('expanded')
        this.$header.dataset.expand = "true"
        // 取消禁止滚动
        document.body.classList.remove('overflow-hidden')
      } else {
        this.$parent.classList.add('expanded')
        this.$header.dataset.expand = "false"
        // 禁止滚动
        document.body.classList.add('overflow-hidden')
      }
      // this.$expand.dataset.expand = this.$expand.dataset.expand == 'false' ? true : false
    })
  }
  initDropdown () {
    let that = this
    if (isLgPc()) {
      // 监听dropdown的hover
      Array.from(this.$dropdowns).map((item: any) => {
        item.addEventListener('mouseover', () => {
          if (item.classList.contains('as-cart-dropdown')) {
            if (that.$notification?.isClosed) {
              that.showDropdownBackdrop()
            }
          } else {
            that.showDropdownBackdrop()
          }
        })
        item.addEventListener('mouseout', () => {
          that.hideDropdownBackdrop()
        })
      })
    }
  }
  showDropdownBackdrop() {
    this.$parent.classList.add('dropdown-backdrop-show')

    let backdrop = this.$parent.querySelector('.as-dropdown-backdrop')
    backdrop.classList.add('show')
  }
  hideDropdownBackdrop() {
    this.$parent.classList.remove('dropdown-backdrop-show')

    let backdrop = this.$parent.querySelector('.as-dropdown-backdrop')
    backdrop.classList.remove('show')    
  }
}
let header: any = document.querySelector('.as-shopify-header')
new Header(header)

class CartIconBubble extends HTMLElement {
  debounceOnMouseenter: any
  $miniCart: HTMLElement
  $cartItem1: HTMLElement
  isInit: boolean
  constructor() {
    super()

    this.isInit = false
    this.$miniCart = document.querySelector('mini-cart') as HTMLElement
    this.$cartItem1 = document.querySelector('cart-items-1') as HTMLElement
    this.bindEvent()
  }

  getSectionsToRender() {
    return [
      {
        id: 'as-cart-icon-bubble-web',
        section: document.getElementById('as-cart-icon-bubble-web')?.dataset.id
      },
      {
        id: 'as-cart-icon-bubble',
        section: document.getElementById('as-cart-icon-bubble')?.dataset.id
      }
    ]
  }

  renderContents(parsedState) {
    this.getSectionsToRender().forEach((section => {
      if (parsedState.sections && parsedState.sections[section.section]) {
        document.getElementById(section.id).innerHTML =
          this.getSectionInnerHTML(parsedState.sections[section.section], section.selector)
      }
    }))
  }

  getSectionInnerHTML(html: string, selector = '.shopify-section') {
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector).innerHTML
  }


  bindEvent() {
    this.debounceOnMouseenter = debounce(() => {
      // 防止请求响应成功后，渲染组件内部结构导致重复触发mouseenter事件
      if (!this.isInit) {
        this.isInit = true
        this.fetchCart({})
      }
    }, 300)
    this.addEventListener('mouseenter', this.debounceOnMouseenter.bind(this))
    this.addEventListener('mouseleave', () => {
      this.isInit = false
    })
  }

  fetchCart(updates: {}) {
    const bubbleSections = this.getSectionsToRender().map((section) => section.section)
    const miniCartSections = this.$miniCart?.getSectionsToRender().map((section) => section.section) || []
    const cartItem1Sections = this.$cartItem1?.getSectionsToRender().map((section) => section.section) || []
    const body = JSON.stringify({
      updates: {...updates},
      sections: bubbleSections.concat(miniCartSections).concat(cartItem1Sections),
      sections_url: window.location.pathname
    })

    fetch(`${routes.cart_update_url}`, {...fetchConfig(), ...{ body }})
      .then((response) => {
        return response.json()
      })
      .then((cartData) => {
        this.renderContents(cartData)

        this.$miniCart?.renderContents(cartData)
        this.$cartItem1?.renderContents(cartData)
      })
      .catch((error) => {
        console.error(error)
      })
  }
}

if (!customElements.get('cart-icon-bubble')) {
  customElements.define('cart-icon-bubble', CartIconBubble)
}