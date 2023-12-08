
class Stair {
  $parent: Element
  widthRateMobil!: number
  widthRateDesktop!: number
  roundedBuffer!: number
  maxWidthDefault!: string
  maxW: any
  wH!: number
  wW!: number
  $img: any
  $textContainer: any
  containerMaxWidth!: number
  targetRect!: number
  $texts!: NodeListOf<Element>
  constructor($parent: Element) {
    this.$parent = $parent
    if (!this.$parent) return
    
    this.$img = this.$parent.querySelector('.as-stairs-img')
    if (!this.$img) return
    
    // 宽度在移动端被裁减的比例 ，（最大宽度为.8wW）
    this.widthRateMobil = 0.2
    // 宽度在桌面端被裁减的比例
    this.widthRateDesktop = 0.5
    // 滚动到距离顶部多少取消圆角的 buffer
    this.roundedBuffer = 20
    // 默认最大宽度，由于图片有最大宽度，所以当 wW 大于一定值时，图片的宽度不再等于屏幕可视区域宽度
    this.maxWidthDefault = '1968'
    this.maxW = this.getMaxWidth()

    this.$texts = this.$parent.querySelectorAll('.as-stair-text')
    this.$textContainer = this.$parent.querySelector('.as-stair-contents-container')

    this.initialize()
    this.init()
  }
  init () {
    this.handledResize()
    this.handleScroll()

    this.run()
  }

  initialize() {
    if (!this.$textContainer) return
    this.wH = document.documentElement.clientHeight
    this.wW = document.documentElement.clientWidth
    this.wW = this.wW > this.maxW ? this.maxW : this.wW

    this.containerMaxWidth = this.$textContainer?.clientWidth - parseInt(getComputedStyle(this.$textContainer).paddingLeft) * 2
    
    // 计算图片放大至安全区域后，文案才开始出现，此时图片上方距离浏览器视窗顶部的距离
    if (this.wW <= 576) {
      this.targetRect = (this.wW - this.containerMaxWidth) / this.widthRateMobil / this.wW * this.wH
    } else {
      this.targetRect = (this.wW - this.containerMaxWidth) / this.widthRateDesktop / this.wW * this.wH
    }
    
    // 由于handleText()方法有处理文字随着图片滚动向上滑动了一段距离，需要调整padding-bottom值保证文字出现和消失前，露出的图片高度相等。
    // 文字滚动至文字上方贴着浏览器视窗底部时，图片上方距离浏览器视窗顶部为this.targetRect / 2
    this.$parent.style.setProperty('--paddingBottom', `${this.wH - this.targetRect / 2 - this.targetRect}px`)
  }

  run() {
    if (this.wW <= 576) {
      this.handleElevatorMobile()
    } else {
      this.handleElevatorDesktop()
    }
    this.handleText()
    this.handleOverlay()
    this.handleImgRounded()
  }

  getMaxWidth() {
    const computedStyle = window.getComputedStyle(this.$parent)
    return parseInt(computedStyle.maxWidth) || this.maxWidthDefault
  }

  handledResize() {
    window.addEventListener('resize', () => {
      this.initialize()
      this.run()
    })
  }

  handleScroll() {
    window.addEventListener('scroll', () => {
      this.run()
    })
  }

  handleText() {
    const parentRect = this.$parent.getBoundingClientRect()
    const tempWidth = (this.wW - parseInt(this.$parent.style.getPropertyValue('--sideClip')))
    if (tempWidth >= this.containerMaxWidth && parentRect.top <= this.wH && parentRect.top >= 0) {
      // 图片宽度大于等于容器安全区域大小
      // 每次图片往上滚动了this.targetRect - parentRect.top距离，文本也往上滚动形成滚动视差
      const translateY = (this.targetRect - parentRect.top) * -1
      this.$parent.style.setProperty('--copyY', `${translateY}px`)
    } else if (parentRect.top > this.wH) {
      this.$parent.style.setProperty('--copyY', `0px`)
    } else if (parentRect.top < 0) {
      const translateY = this.targetRect * -1
      this.$parent.style.setProperty('--copyY', `${translateY}px`)
    }
  }

  handleOverlay() {
    if (!this.$texts && this.$texts.length > 0) return
    const parentRect = this.$parent.getBoundingClientRect()
    let rect = this.$texts[0].getBoundingClientRect()

    let widthRate = 0
    if (this.wW <= 576) {
      widthRate = this.widthRateMobil
    } else {
      widthRate = this.widthRateDesktop
    }

    const topTargetRect = this.wH * widthRate
    if (parentRect.top <= topTargetRect && rect.top <= this.wH && rect.top >= topTargetRect) {
      const opacity = parseFloat((this.wH - rect.top) / (this.wH - topTargetRect) * 0.3).toFixed(2)
      this.$parent.style.setProperty('--overlayOpacity', `${opacity}`)
    } else if (rect.top < topTargetRect) {
      this.$parent.style.setProperty('--overlayOpacity', `0.3`)
    } else if (parentRect.top > topTargetRect) {
      this.$parent.style.setProperty('--overlayOpacity', `0`)
    }
    
    const bottomTargetRect = this.wH * widthRate
    rect = this.$texts[this.$texts.length - 1].getBoundingClientRect()
    if (rect.bottom <= this.wH - bottomTargetRect && rect.bottom >= 0) {
      const opacity = parseFloat(0.3 - (this.wH - bottomTargetRect - rect.bottom) / (this.wH - bottomTargetRect) * 0.3).toFixed(2)
      this.$parent.style.setProperty('--overlayOpacity', `${opacity}`)
    } else if (rect.bottom < 0) {
      this.$parent.style.setProperty('--overlayOpacity', `0`)
    }
  }

  handleElevatorMobile() {
    const rect = this.$parent.getBoundingClientRect() 
    // 目标刚出现在屏幕上 出现宽度缩放功能
    if (rect.top <= this.wH && rect.top > 0) {
      const clip = this.widthRateMobil * this.wW / this.wH * rect.top
      this.$parent.style.setProperty('--sideClip', `${clip}px`)
    } else if (rect.top <= 0) {
      // 目标滚动到 顶部，定住一段时间，通过sticky 来实现定住的效果
      this.$parent.style.setProperty('--sideClip', '0px')
    }

    // 目标底部刚出现在屏幕上时 出现缩小功能
    if (rect.bottom <= this.wH && rect.bottom >= 0) {
      const distance = this.wH - rect.bottom
      const clip = this.widthRateMobil * this.wW / this.wH * distance
      this.$parent.style.setProperty('--sideClip', `${clip}px`)
    } else if (rect.bottom <= 0) {
      this.$parent.style.setProperty('--sideClip', '10vw')
    }
  }

  handleElevatorDesktop() {
    const rect = this.$parent.getBoundingClientRect() 
    // 目标刚出现在屏幕上 出现宽度缩放功能
    if (rect.top <= this.wH && rect.top > 0) {
      const clip = this.widthRateDesktop * this.wW / this.wH * rect.top
      this.$parent.style.setProperty('--sideClip', `${clip}px`)
    } else if (rect.top <= 0) {
      // 目标滚动到 顶部，定住一段时间，通过sticky 来实现定住的效果
      this.$parent.style.setProperty('--sideClip', '0px')
    }

    // 目标底部刚出现在屏幕上时 出现缩小功能
    if (rect.bottom <= this.wH && rect.bottom >= 0) {
      const distance = this.wH - rect.bottom
      const clip = this.widthRateDesktop * this.wW / this.wH * distance
      this.$parent.style.setProperty('--sideClip', `${clip}px`)
    } else if (rect.bottom <= 0) {
      this.$parent.style.setProperty('--sideClip', '50vw')
    }
  }

  handleImgRounded() {
    if (!this.$img) return;
    const imgRect = this.$img?.getBoundingClientRect() 
    // 判断圆角
    if (Math.abs(imgRect.top) <= this.roundedBuffer) {
      this.$parent.classList.add('no-rounded')
    } else {
      this.$parent.classList.remove('no-rounded')
    }
  }
}

let $stairs: NodeListOf<Element> = document.querySelectorAll('.as-stairs')
$stairs.forEach($stair => {
  const $stairContainer = $stair.querySelector('.as-stairs-container')
  $stairContainer && new Stair($stairContainer)
})

export default Stair