import Swiper, { Navigation } from 'swiper'
Swiper.use([Navigation])
import { debounce } from '@scripts/_utilities'

const CardsSliders = class {
  $swiperContainer: Element
  debounceOnRezie: ((...args: any[]) => void) | undefined
  $swiper: any
  constructor($swiperContainer: Element) {
    this.$swiperContainer = $swiperContainer
    this.$swiper = this.$swiperContainer?.querySelector('.as-swiper')
    this.initSwiper()
    this.updateIndicatorPos()
    this.debounceOnRezie = debounce(() => {
      this.updateIndicatorPos()
    }, 300)
    window.addEventListener('resize', this.debounceOnRezie.bind(this))
  }

  updateIndicatorPos() {
    const slideHeight = this.$swiper?.offsetHeight
    const imgHeight = this.$swiper?.querySelector('.as-slide-img')?.offsetHeight
    const pos = `${Number(Number((imgHeight / 2 / slideHeight)).toFixed(4)) * 100}%`
    this.$swiper.style.setProperty('--indicator-position', pos)
  }
  initSwiper() {
    const perRow = Number(this.$swiper?.dataset.perRow)
    const swiper = new Swiper(this.$swiper, {
      slidesPerView: 4.5,
      spaceBetween: 16,
      navigation: {
        nextEl: this.$swiper?.querySelector('.as-swiper-indicator-next'),
        prevEl: this.$swiper?.querySelector('.as-swiper-indicator-prev')
      },
      speed: 600,
      breakpoints: {
        0: {
          slidesPerView: 2.5,
          cssMode: true
        },
        768: {
          slidesPerView: 3.5,
          cssMode: true
        },
        1152: {
          slidesPerView: perRow,
          cssMode: false
        },
      },
    })
  }
}

const $swiperContainers = document.querySelectorAll('.as-cards-scroller-container')
$swiperContainers && $swiperContainers.forEach(($swiperContainer) => {
  new CardsSliders($swiperContainer)
})

export default CardsSliders