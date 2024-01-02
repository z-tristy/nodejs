import Swiper, { Navigation, Pagination, Autoplay } from 'swiper'
import { debounce } from '@scripts/_utilities'
Swiper.use([Navigation, Pagination, Autoplay])

const ImageSliders = class {
  $swiperContainer: HTMLElement
  debounceOnRezie: ((...args: any[]) => void) | undefined
  $swiper: any
  $descContainer: any
  slideSize: any
  constructor ($swiperContainer: HTMLElement) {
    this.$swiperContainer = $swiperContainer
    this.$descContainer = $swiperContainer?.querySelector('.as-carousel-desc-container')
    this.slideSize = this.$swiperContainer?.querySelectorAll('.as-swiper-slide').length ?? 0
  }

  init (): void {
    if (this.slideSize <= 1) return

    this.calculateHeight()
    this.debounceOnRezie = debounce(() => {
      this.calculateHeight()
    }, 300)
    window.addEventListener('resize', this.debounceOnRezie.bind(this))

    this.initSwiper(this.$swiperContainer)
  }

  calculateHeight (): void {
    this.$swiperContainer.classList.remove('not-initialized')
    const $descs = this.$swiperContainer.querySelectorAll('.as-carousel-desc-item')
    if (this.$descContainer instanceof HTMLElement) {
      const descsArr = Array.prototype.slice.call($descs)
      const height = Array.from(descsArr, $item => $item.clientHeight).reduce((prev, current) => {
        return Math.max(prev, current)
      })
      this.$descContainer.style.height = `${height}px`
    }
  }

  initSwiper ($swiperContainer: HTMLElement): void {
    const $swiper = $swiperContainer?.querySelector('.as-swiper')
    if ($swiper instanceof HTMLElement) {
      const slideSize = $swiper?.querySelectorAll('.as-swiper-slide').length ?? 0
      if (slideSize <= 1) return
      const rightwardsConfig = $swiper.dataset.rightwards !== 'yes'
        ? {
            loop: true,
            loopedSlides: slideSize
          }
        : {}
      const autoplayDelay = parseInt($swiper.dataset.autoplay ?? '')
      const autoplayConfig = autoplayDelay > 0
        ? {
            autoplay: {
              delay: autoplayDelay,
              disableOnInteraction: false,
              pauseOnMouseEnter: true
            }
          }
        : {}

      const $nextBtn = $swiperContainer.querySelector('.as-swiper-indicator-next')
      const $prevBtn = $swiperContainer.querySelector('.as-swiper-indicator-prev')
      const navigationConfig = $nextBtn instanceof HTMLElement && $prevBtn instanceof HTMLElement
        ? {
            navigation: {
              nextEl: $nextBtn,
              prevEl: $prevBtn
            }
          }
        : {}

      const $pagination = $swiperContainer.querySelector('.as-swiper-indicators')
      const paginationConfig = $pagination instanceof HTMLElement
        ? {
            pagination: {
              el: $pagination,
              bulletClass: 'swiper-indicator',
              bulletActiveClass: 'swiper-indicator-active',
              clickable: true
            }
          }
        : {}

      const $descContainer = this.$descContainer
      const imageSlider = new Swiper($swiper, {
        ...autoplayConfig,
        ...rightwardsConfig,
        centeredSlides: false,
        slidesPerView: 'auto',
        speed: 600,
        ...paginationConfig,
        ...navigationConfig,
        on: {
          init: function (swiper) {
            if (Boolean($descContainer)) {
              $descContainer.classList.remove('not-initialized')
              $descContainer.querySelector('.as-carousel-desc-item.active')?.classList.remove('active')
              $descContainer.querySelector(`.as-carousel-desc-item:nth-child(${swiper.realIndex + 1})`)?.classList.add('active')
            }
          }
        }
      })

      imageSlider.on('slideChange', function (swiper) {
        $descContainer?.querySelector('.as-carousel-desc-item.active')?.classList.remove('active')
        $descContainer?.querySelector(`.as-carousel-desc-item:nth-child(${swiper.realIndex + 1})`)?.classList.add('active')
      })
    }
  }
}

const $swiperContainers = document.querySelectorAll('.as-image-sliders-container')
$swiperContainers?.forEach(($swiperContainer) => {
  if ($swiperContainer instanceof HTMLElement) {
    new ImageSliders($swiperContainer).init()
  }
})

export default ImageSliders
