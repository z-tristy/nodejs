const Helpers = require('@scripts/helpers.ts')
import Swiper, { Navigation, Pagination, Thumbs } from 'swiper'
Swiper.use([Navigation, Pagination, Thumbs])

const ImageTab = class {
  slideSize: number
  imageTab: Swiper | undefined
  $swiperContainer: Element
  $indicatorContainer: any
  $indicators: any
  $swiper: any
  constructor($swiperContainer: Element) {
    this.$swiperContainer = $swiperContainer

    this.$swiper = $swiperContainer.querySelector('.as-swiper')
    this.slideSize = this.$swiper && this.$swiper.querySelectorAll('.as-swiper-slide').length || 0
    this.$indicatorContainer = $swiperContainer.querySelector('.as-swiper-indicators')
    this.$indicators = this.$indicatorContainer && this.$indicatorContainer.querySelectorAll('.as-swiper-indicator')
    
    if ($swiperContainer && this.$swiper && this.slideSize <= 1) return

    this.init()
  }

  init() {
    if (!Helpers.isPc()) {
      this.initSwiperForTouchDevice()
    } else {
      this.initSwiperForNotTouchDevice()
    }
  }

  initSwiperForTouchDevice() {
    const $swiperContainer = this.$swiperContainer
    const $swiper = this.$swiper
    const slideSize = this.slideSize
    const $indicatorContainer = this.$indicatorContainer
    const thumbSwiper = new Swiper($indicatorContainer, {
      slidesPerView: 'auto',
      freeMode: true,
      watchSlidesProgress: true,
    })
    const $descContainer = $swiperContainer.querySelector('.as-swiper-desc-container')
    const imageTab = new Swiper($swiper, {
      loop: true,
      loopedSlides: slideSize,
      centeredSlides: false,
      allowTouchMove: true,
      slidesPerView: "auto",
      speed: 600,
      navigation: {
        nextEl: $swiperContainer.querySelector('.as-swiper-indicator-next'),
        prevEl: $swiperContainer.querySelector('.as-swiper-indicator-prev'),
      },
      thumbs: {
        swiper: thumbSwiper,
        slideThumbActiveClass: 'swiper-indicator-active',
      },
      breakpoints: {
        576: {
          centeredSlides: true,
        }
      },
      on: {
        init: function (swiper) {
          $swiperContainer.classList.remove('not-initialized')
          if ($descContainer) {
            $descContainer.style.height = $descContainer.clientHeight + 'px'
            $descContainer.classList.remove('not-initialized')
            $descContainer.querySelector(`.as-swiper-desc-item.active`)?.classList.remove('active')
            $descContainer.querySelector(`.as-swiper-desc-item:nth-child(${swiper.realIndex + 1})`)?.classList.add('active')
          }
        }
      }
    })

    imageTab.on('slideChange', function (swiper) {
      $descContainer?.querySelector(`.as-swiper-desc-item.active`)?.classList.remove('active')
      $descContainer?.querySelector(`.as-swiper-desc-item:nth-child(${swiper.realIndex + 1})`)?.classList.add('active')

      swiper.thumbs.swiper.slideTo(swiper.realIndex)
    })

    this.imageTab = imageTab
  }

  initSwiperForNotTouchDevice() {
    const $swiperContainer = this.$swiperContainer
    const $swiper = this.$swiper
    const slideSize = this.slideSize
    const $indicators = this.$indicators
    const $descContainer = $swiperContainer.querySelector('.as-swiper-desc-container')
    const imageTab = new Swiper($swiper, {
      loop: true,
      loopedSlides: slideSize,
      centeredSlides: true,
      allowTouchMove: true,
      slidesPerView: "auto",
      speed: 600,
      navigation: {
        nextEl: $swiperContainer.querySelector('.as-swiper-indicator-next'),
        prevEl: $swiperContainer.querySelector('.as-swiper-indicator-prev'),
      },
      pagination: {
        el: $swiperContainer.querySelector('.as-swiper-indicators'),
        bulletClass: 'swiper-indicator',
        bulletActiveClass: 'swiper-indicator-active',
        clickable: true,
        renderBullet: function (index, className) {
          return `<div class="${className}">${$indicators[index].innerHTML}</div>`;
        },
      },
      on: {
        init: function (swiper) {
          $swiperContainer.classList.remove('not-initialized')
          if ($descContainer) {
            $descContainer.style.height = $descContainer.clientHeight + 'px'
            $descContainer.classList.remove('not-initialized')
            $descContainer.querySelector(`.as-swiper-desc-item.active`)?.classList.remove('active')
            $descContainer.querySelector(`.as-swiper-desc-item:nth-child(${swiper.realIndex + 1})`)?.classList.add('active')
          }
        }
      }
    })

    imageTab.on('slideChange', function (swiper) {
      $descContainer?.querySelector(`.as-swiper-desc-item.active`)?.classList.remove('active')
      $descContainer?.querySelector(`.as-swiper-desc-item:nth-child(${swiper.realIndex + 1})`)?.classList.add('active')
    })

    this.imageTab = imageTab
  }
}

const $swiperContainers = document.querySelectorAll('.as-image-tab-container')
$swiperContainers && $swiperContainers.forEach(($swiperContainer) => {
  new ImageTab($swiperContainer)
})

export default ImageTab