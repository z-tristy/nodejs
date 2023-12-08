import "@sections/header/menu/index";
import { isLgPc } from '@scripts/_utilities'

class ImmersionHeader {
  $header: HTMLElement;
  $flag: HTMLElement;
  enableTransparency: boolean;
  $section: HTMLElement;
  $parent: HTMLElement;
  isMouseLeave: boolean;
  isLgPc: boolean | undefined;
  constructor ($parent: HTMLElement) {
    this.$parent = $parent
    this.$header = this.$parent?.querySelector('.as-site-header') as HTMLElement
    this.$flag = this.$parent?.querySelector('.as-header-immersion-flag') as HTMLElement

    // 获取首屏
    const $pageContent = document.querySelector('#main-content') as HTMLElement
    this.$section = $pageContent?.querySelector('.shopify-section') as HTMLElement

    // 是否为透明导航
    this.enableTransparency = true

    // 鼠标不在导航内
    this.isMouseLeave = true

    this.isLgPc = isLgPc()

    if (this.$flag) {
      // 页面首屏为Image banner或者Hero video时，显示为透明导航
      this.initNavbar()
      if (this.isLgPc) {
        this.handleEvent()
      }
    }
  }

  initNavbar () {
    if (this.$section && (this.$section.classList.contains('as-hero-video') || this.$section.classList.contains('as-section-text-over-image'))) {
      this.$header?.classList.add('enable-transparency')
      this.enableTransparency = true
      this.createSectionObserver()
    } else {
      this.$header?.classList.remove('enable-transparency')
      this.enableTransparency = false
    }
  }

  createSectionObserver () {
    // 获取导航和首屏相交区域比例大小
    const targetIntersectionRatio = this.$header?.clientHeight / this.$section?.clientHeight

    const observer = new IntersectionObserver((entries) => {
      const ratio = entries[0].intersectionRatio
      
      if (ratio > targetIntersectionRatio) {
        this.enableTransparency = true
        if ((this.isLgPc && this.isMouseLeave) || !this.isLgPc) {
          this.makeTransparent()
        }
      } else {
        this.enableTransparency = false
        this.makeSolid()
      }
    }, {
      threshold: new Array(100).fill(0.01).map((curr, index) => curr + index * 0.01)
    })

    observer.observe(this.$section)
  }

  makeTransparent () {
    this.$header?.classList.add('enable-transparency')
  }

  makeSolid () {
    this.$header?.classList.remove('enable-transparency')
  }

  handleHover () {
    this.isMouseLeave = false
    if (this.enableTransparency) {
      this.makeSolid()
    }
  }

  handleEvent () {
    // 初始化导航过程中，鼠标一直处在导航结构范围内，预防出现透明导航+带背景色下拉菜单的情况
    const handleHoverFunction = this.handleHover.bind(this)
    this.$header.addEventListener('mouseover', handleHoverFunction)

    this.$header.addEventListener('mouseleave', () => {
      this.$header.removeEventListener('mouseover', handleHoverFunction)
      // 不使用mouseover使用mouseenter，减少频繁触发
      this.$header.addEventListener('mouseenter', handleHoverFunction)
      this.isMouseLeave = true
      if (this.enableTransparency) {
        this.makeTransparent()
      } else {
        this.makeSolid()
      }
    })
  }
}

const header: any = document.querySelector('.as-shopify-header')
if (header) {
  new ImmersionHeader(header)
}