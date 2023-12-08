
class StickyBox {
  $parent: any
  $stickyList: any
  wH: any
  n: any
  index: any
  rate: any
  preIndex: any
  lastBuffer: any
  firstBuffer: any
  showFirstText: any
  constructor(recommend: any) {
    this.$parent = recommend
    if (!this.$parent) return
    this.rate = .8 // 暂时没用，预想当中是 用来调整 wH 的高度
    this.wH = document.documentElement.clientHeight
    this.lastBuffer = .3 // 最后一屏 停留的距离
    this.firstBuffer = .5 // 第一屏 停留的距离
    this.showFirstText = .5 // 第一屏 文案出现的 位置
    this.$stickyList = this.$parent.querySelectorAll('.as-sticky-box-list')
    
    this.n = this.$stickyList.length
    this.index = 0
    this.preIndex = 0
    
    this.init()
  }
  init () {
    this.setWrapHeight()
    this.handledResize()
    this.handleScroll()
    
  }

  setWrapHeight() {
    // 根据子元素的长度 n 以及前后 buffer 来设置容器的高度
    // 向上取整，避免小数 带来的间距
    const h = `${Math.ceil(this.n * this.wH + this.lastBuffer * this.wH + this.firstBuffer * this.wH)}px`
    this.$parent.style.setProperty('--sticky-box-height', h)
  }

  handledResize() {
    window.addEventListener('resize', () => {
      this.wH = document.documentElement.clientHeight
      this.setWrapHeight()
    })
  }

  handleScroll() {
    window.addEventListener('scroll', () => {
      this.handleElevatorDesktop()
    })
  }

  handleElevatorDesktop() {
    const rect = this.$parent.getBoundingClientRect()
    // 第一屏出来一半，文案添加动画
    if (rect.top <= this.showFirstText * this.wH && rect.top > - this.firstBuffer * this.wH) {
      this.preIndex = this.index
      this.index = 0
      this.changelistActive()
    } else if (rect.top <= - this.firstBuffer * this.wH) {
      
      this.preIndex = this.index
      // 此时 rect.top <= 0， 取绝对值
      this.index = Math.ceil(Math.abs(rect.top + this.firstBuffer * this.wH) / this.wH)
      this.changelistActive()

    } else if (rect.top > this.showFirstText * this.wH) {
      // 主要是为了解决反向滚动时， 第一屏的文案消失问题
      this.$parent.querySelectorAll('.as-sticky-box-list')[0] && this.$parent.querySelectorAll('.as-sticky-box-list')[0].classList.remove('is-text-active')
    }

  }

  changelistActive() {
    if (this.index >= this.n || (this.index > 0 && this.index == this.preIndex)) return

    this.$parent.querySelector('.as-sticky-box-list.is-active') && this.$parent.querySelector('.as-sticky-box-list.is-active').classList.remove('is-active')
    this.$parent.querySelectorAll('.as-sticky-box-list')[this.index] && this.$parent.querySelectorAll('.as-sticky-box-list')[this.index].classList.add('is-active')

    // 两个步骤 
    // 1. 每个 index 添加 active, 其他的删除 index
    // 2. 小于 index 的添加 exit
    this.$parent.querySelector('.as-sticky-box-list.is-text-active') && this.$parent.querySelector('.as-sticky-box-list.is-text-active').classList.remove('is-text-active')
    this.$parent.querySelectorAll('.as-sticky-box-list')[this.index] && this.$parent.querySelectorAll('.as-sticky-box-list')[this.index].classList.add('is-text-active')
    ;[...this.$stickyList].map(($val, i) => {
      if (i < this.index) {
        $val.classList.add('is-text-exit')
      } else {
        $val.classList.remove('is-text-exit')
      }
    })

  }

}

let $elevator: NodeListOf<Element> = document.querySelectorAll('.as-sticky-box')
$elevator.forEach($parent => {
  new StickyBox($parent)
})