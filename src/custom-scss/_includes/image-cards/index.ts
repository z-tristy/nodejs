import Swiper, { Scrollbar } from 'swiper'
Swiper.use([Scrollbar])

const ImageCards = class {
  $swiperContainer: Element
  constructor($swiperContainer: Element) {
    this.$swiperContainer = $swiperContainer

    this.initSwiper($swiperContainer)
  }

  initSwiper($swiperContainer: Element) {
    const $swiper = $swiperContainer.querySelector('.as-swiper')
    const slideSize = $swiper && $swiper.querySelectorAll('.as-swiper-slide').length || 0
    if ($swiperContainer && $swiper && slideSize <= 1) return
    new Swiper($swiper, {
      slidesPerView: 'auto',
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
}

const $swiperContainers = document.querySelectorAll('.as-image-cards-container')
$swiperContainers && $swiperContainers.forEach(($swiperContainer) => {
  new ImageCards($swiperContainer)
})

export default ImageCards