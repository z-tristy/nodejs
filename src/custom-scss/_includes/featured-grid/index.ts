import Swiper, { Scrollbar } from 'swiper'
Swiper.use([Scrollbar])
const Helpers = require('@scripts/helpers')

const FeaturedGrids = class {
  $swiperContainer: Element
  $pcFlag: any
  $firstInit: Boolean = true
  constructor($swiperContainer: Element) {
    this.$swiperContainer = $swiperContainer
    this.$pcFlag = Helpers.isPc()
    this.init()
  }

  init() {
    if(!this.$pcFlag && this.$firstInit) {
      this.$firstInit = false
      this.initSwiper(this.$swiperContainer)
    }
    this.handledResize()
  }

  handledResize() {
    window.addEventListener('resize', () => {
      this.$pcFlag = Helpers.isPc()
      if(!this.$pcFlag && this.$firstInit) {
        this.$firstInit = false
        this.initSwiper(this.$swiperContainer)
      }
    })
  }

  initSwiper($swiperContainer: Element) {
    let is_destroy = true
    const $swiper = $swiperContainer.querySelector('.as-swiper')
    const slideSize = $swiper && $swiper.querySelectorAll('.as-swiper-slide').length || 0
    if ($swiperContainer && $swiper && slideSize <= 1) return
    
    let initSwiperObject = new Swiper($swiper, {
      slidesPerView: '1.2',
      scrollbar: {
        el: $swiper?.querySelector('.as-swiper-scrollbar'),
        draggable: true,
        hide: false,
      },
      on: {
        init: function (swiper) {
          swiper.el.classList.remove('not-initialized')
        }
      }
    })
    window.addEventListener('resize', () => {
      this.$pcFlag = Helpers.isPc()
      if(this.$pcFlag && is_destroy) {
        initSwiperObject.destroy(true, true)
        is_destroy = false
      }else if(!this.$pcFlag && !is_destroy) {
        is_destroy = true
        initSwiperObject = new Swiper($swiper, {
          slidesPerView: '1.1',
          scrollbar: {
            el: $swiper?.querySelector('.as-swiper-scrollbar'),
            draggable: true,
            hide: false,
          },
          on: {
            init: function (swiper) {
              swiper.el.classList.remove('not-initialized')
            }
          }
        })
      }
    })
  }

  
}

const $swiperContainers = document.querySelectorAll('.as-featured-grid-container')
$swiperContainers && $swiperContainers.forEach(($swiperContainer,index) => {
  new FeaturedGrids($swiperContainer)
})

export default FeaturedGrids