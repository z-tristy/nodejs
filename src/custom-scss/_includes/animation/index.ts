import { throttle } from '@scripts/_utilities'

class SimpleAnimation {
  $aosElements: []
  windowHeight: number
  constructor () {
    // Create initial array with elements -> to be fullfilled later with prepare()
    this.$aosElements = this.elements()
    this.windowHeight = window.innerHeight

    window.addEventListener('load', () => {
      this.initializeScroll()
    })
  }

  initializeScroll () {
    // Extend elements objects in $aosElements with their positions
    let $aosElements = this.prepare(this.$aosElements)
    this.$aosElements = $aosElements

    // Perform scroll event, to refresh view and show/hide elements
    this.handleScroll($aosElements)
  
    // Handle scroll event to animate elements on scroll
    window.addEventListener(
      'scroll',
      throttle(() => {
        this.handleScroll($aosElements)
      }, 99)
    )
  }

  elements () {
    const elements = document.querySelectorAll('.as-anim:not(.animated)')
    return Array.prototype.map.call(elements, node => ({ node }))
  }

  getPositionIn (el) {
    let triggerPoint = this.getOffset(el).top - this.windowHeight
    // 当元素底部贴着页面底部时，触发
    // return triggerPoint + el.offsetHeight + 60
    // 当元素顶部贴着页面底部时，触发，元素translateY偏移量60px
    return triggerPoint + 60
  }

  /**
   * Get offset of DOM element
   * like there were no transforms applied on it
   *
   * @param  {Node} el [DOM element]
   * @return {Object} [top and left offset]
   */
   getOffset (el) {
    let _x = 0
    let _y = 0

    while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
      _x += el.offsetLeft - (el.tagName != 'BODY' ? el.scrollLeft : 0)
      _y += el.offsetTop - (el.tagName != 'BODY' ? el.scrollTop : 0)
      el = el.offsetParent
    }
  
    return {
      top: _y,
      left: _x
    }
  }

  isHidden (el) {
    return el.offsetParent === null
  }

  prepare ($elements) {
    $elements.forEach((el) => {
      this.setPosition(el)
    })

    return $elements
  }

  setPosition (el) {
    if (this.isHidden(el.node)) {
      el.position = null
    } else {
      el.position = {
        in: this.getPositionIn(el.node),
        out: 0
      }
    }
  }

  handleScroll ($elements: any[]) {
    $elements.forEach((el) => {
      if (!this.isHidden(el.node)) {
        this.applyClasses(el, window.pageYOffset)
      }
    })
  }

  applyClasses (el, top) {
    const show = () => {
      if (el.animated) return
      el.node.classList.add('animated')
      el.animated = true
    }
    if (el.position) {
      if (top >= el.position.in) {
        // For debug
        // if (!el.animated) {
        //   console.log(el.position, this.getOffset(el.node).top)
        // }
        show()
      }
    } else {
      // Refresh position
      this.prepare(this.$aosElements)
    }
  }
}

new SimpleAnimation()

export default SimpleAnimation