import Swiper, { Navigation } from 'swiper'

const HighlightCards = class {
  $swiperContainer: Element
  $swiper: any
  constructor ($swiperContainer: Element) {
    this.$swiperContainer = $swiperContainer
    this.$swiper = this.$swiperContainer?.querySelector('.as-swiper')
  }

  initSwiper (): void {
    let navigationOption = {}
    const $prevBtn = this.$swiperContainer?.querySelector('.as-swiper-indicator-prev')
    const $nextBtn = this.$swiperContainer?.querySelector('.as-swiper-indicator-next')
    if (($prevBtn != null) && ($nextBtn != null)) {
      navigationOption = {
        navigation: {
          nextEl: $nextBtn,
          prevEl: $prevBtn
        }
      }
    }
    ;(() => new Swiper(this.$swiper, {
      modules: [Navigation],
      slidesPerView: 'auto',
      allowTouchMove: true,
      spaceBetween: 0,
      ...navigationOption,
      speed: 600
    }))()
  }
}

const $swiperContainers = document.querySelectorAll('.as-highlight-cards-container')
$swiperContainers?.forEach(($swiperContainer) => {
  new HighlightCards($swiperContainer).initSwiper()
})

export default HighlightCards
