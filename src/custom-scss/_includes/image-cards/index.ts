import Swiper, { Scrollbar } from 'swiper'

const ImageCards = class {
  $swiperContainer: Element
  constructor ($swiperContainer: Element) {
    this.$swiperContainer = $swiperContainer
  }

  init (): void {
    this.initSwiper(this.$swiperContainer)
  }

  initSwiper ($swiperContainer: Element): void {
    const $swiper = $swiperContainer?.querySelector('.as-swiper')
    const $scrollBar = $swiperContainer?.querySelector('.as-swiper-scrollbar')
    const slideSize = $swiper?.querySelectorAll('.as-swiper-slide').length ?? 0
    if (slideSize <= 1) return
    if ($swiper instanceof HTMLElement) {
      let scrollBarOptions = {}
      if ($scrollBar instanceof HTMLElement) {
        scrollBarOptions = {
          modules: [Scrollbar],
          scrollbar: {
            el: $scrollBar,
            draggable: true,
            hide: false
          }
        }
      }
      ;(() => new Swiper($swiper, {
        ...scrollBarOptions,
        slidesPerView: 'auto',
        on: {
          init: function (swiper) {
            swiper.el.classList.remove('not-initialized')
          }
        }
      }))()
    }
  }
}

const $swiperContainers = document.querySelectorAll('.as-image-cards-container')
$swiperContainers?.forEach(($swiperContainer) => {
  new ImageCards($swiperContainer).init()
})

export default ImageCards
