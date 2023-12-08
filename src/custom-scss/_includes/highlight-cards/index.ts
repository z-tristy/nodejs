import Swiper, { Navigation } from 'swiper'
Swiper.use([Navigation])
import { debounce } from '@scripts/_utilities'

const HighlightCards = class {
  $swiperContainer: Element
  $swiper: any
  constructor($swiperContainer: Element) {
    this.$swiperContainer = $swiperContainer
    this.$swiper = this.$swiperContainer?.querySelector('.as-swiper')
    this.initSwiper()
  }

  initSwiper() {
    const swiper = new Swiper(this.$swiper, {
      slidesPerView: 'auto',
      allowTouchMove: true,
      spaceBetween: 0,
      navigation: {
        nextEl: this.$swiper?.querySelector('.as-swiper-indicator-next'),
        prevEl: this.$swiper?.querySelector('.as-swiper-indicator-prev')
      },
      speed: 600,
      // breakpoints: {
      //   0: {
      //     slidesPerView: 'auto',
      //     cssMode: false
      //   },
      //   768: {
      //     slidesPerView: 'auto',
      //     cssMode: false
      //   },
      //   960: {
      //     slidesPerView: 'auto',
      //     cssMode: false,
      //     // spaceBetween: 24
      //     // centeredSlides: true
      //     // slidesOffsetBefore: 200,
      //     // slidesOffsetAfter: 300
      //   }
      // },
    })
    // swiper.setProgress(0.5, 600)
  }
}

const $swiperContainers = document.querySelectorAll('.as-highlight-cards-container')
$swiperContainers && $swiperContainers.forEach(($swiperContainer) => {
  new HighlightCards($swiperContainer)
})

export default HighlightCards