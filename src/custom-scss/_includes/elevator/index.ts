
class Elevator {
  $parent: any
  $textWrap: any
  $mask: any
  $maxWidth: any
  $img: any
  wH: any
  maxW: any
  maxWidthDefault: any
  wW: any
  widthRateMobil: any
  widthRateDesktop: any
  roundedBuffer: any
  constructor(recommend: any) {
    this.$parent = recommend
    if (!this.$parent) return
    this.$textWrap = this.$parent.querySelector('.as-elevator-text-wrap')
    this.$mask = this.$parent.querySelector('.as-elevator-mask')
    this.$maxWidth = this.$parent.querySelector('.as-elevator-max-width')
    this.$img = this.$parent.querySelector('.as-elevator-img')

    this.widthRateMobil = 0.2 // 宽度在移动端被裁减的比例 ，（最大宽度为.8wW）
    this.widthRateDesktop = 0.5 // 宽度在桌面端被裁减的比例
    this.roundedBuffer = 20 // 滚动到距离顶部多少取消圆角的 buffer
    this.maxWidthDefault = '1968' // 默认最大宽度，由于图片有最大宽度，所以当 wW 大于一定值时，图片的宽度不再等于屏幕可视区域宽度
    this.maxW = this.getMaxWidth()

    this.wH = document.documentElement.clientHeight
    this.wW = document.documentElement.clientWidth
    this.wW = this.wW > this.maxW ? this.maxW : this.wW



    this.init()
  }
  init () {
    this.handledResize()
    this.handleScroll()
    if (this.wW <= 576) {
      this.handleElevatorMobile()
    } else {
      this.handleElevatorDesktop()
    }
  }

  getMaxWidth() {
    const computedStyle = window.getComputedStyle(this.$maxWidth)
    return computedStyle.maxWidth || this.maxWidthDefault
  }
  handledResize() {
    window.addEventListener('resize', () => {
      this.wH = document.documentElement.clientHeight
      this.wW = document.documentElement.clientWidth
      this.wW = this.wW > this.maxW ? this.maxW : this.wW
    })
  }

  handleScroll() {
    window.addEventListener('scroll', () => {
      if (this.wW <= 576) {
        this.handleElevatorMobile()
      } else {
        this.handleElevatorDesktop()
      }
    })
  }

  handleElevatorMobile() {
    const rect = this.$parent.getBoundingClientRect()
    // 目标刚出现在屏幕上 出现宽度缩放功能
    if (rect.top <= this.wH && rect.top > 0) {
      // const distance = this.wH - rect.top
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

    this.handleImgRounded()
  }

  handleElevatorDesktop() {
    const rect = this.$parent.getBoundingClientRect()
    // 目标刚出现在屏幕上 出现宽度缩放功能
    if (rect.top <= this.wH && rect.top > 0) {
      // const distance = this.wH - rect.top
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
    this.handleImgRounded()
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

let $elevator: NodeListOf<Element> = document.querySelectorAll('.as-elevator')
$elevator.forEach($parent => {
  new Elevator($parent)
})
