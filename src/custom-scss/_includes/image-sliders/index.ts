import Swiper, { Navigation, Pagination, Autoplay } from 'swiper'
Swiper.use([Navigation, Pagination, Autoplay])
import { debounce } from '@scripts/_utilities'

const ImageSliders = class {
  $swiperContainer: Element
  debounceOnRezie: ((...args: any[]) => void) | undefined
  $swiper: any
  $descContainer: any
  slideSize: any
  constructor($swiperContainer: Element) {
    this.$swiperContainer = $swiperContainer
    this.$descContainer = $swiperContainer?.querySelector('.as-carousel-desc-container')
    this.slideSize = this.$swiperContainer && this.$swiperContainer.querySelectorAll('.as-swiper-slide').length || 0
    
    if ($swiperContainer && this.$descContainer && this.slideSize <= 1) return

    this.calculateHeight()
    this.debounceOnRezie = debounce(() => {
      this.calculateHeight()
    }, 300)
    window.addEventListener('resize', this.debounceOnRezie.bind(this))

    this.initSwiper($swiperContainer)
  }

  calculateHeight() {
    this.$swiperContainer.classList.remove('not-initialized')
    const $descs = this.$swiperContainer.querySelectorAll('.as-carousel-desc-item')
    if ($descs) {
      const descsArr = Array.prototype.slice.call($descs)
      const height = Array.from(descsArr, $item => $item.clientHeight).reduce((prev, current) => {
        return Math.max(prev, current)
      })
      this.$descContainer.style.height = height + 'px'
    }
  }

  initSwiper($swiperContainer: Element) {
    const $swiper = $swiperContainer.querySelector('.as-swiper')
    const slideSize = $swiper && $swiper.querySelectorAll('.as-swiper-slide').length || 0
    if ($swiperContainer && $swiper && slideSize <= 1) return
    const rightwardsConfig = $swiper.dataset.rightwards !== 'yes' ? {
      loop: true,
      loopedSlides: slideSize,
    } : {}
    const autoplayDelay = parseInt($swiper.dataset.autoplay)
    const autoplayConfig = autoplayDelay > 0 ? {
      autoplay: {
        delay: autoplayDelay,
        disableOnInteraction: false,
        pauseOnMouseEnter: true
      }
    } : {}

    const $descContainer = this.$descContainer
    const imageSlider = new Swiper($swiper, {
      ...autoplayConfig,
      ...rightwardsConfig,
      centeredSlides: false,
      slidesPerView: "auto",
      speed: 600,
      pagination: {
        el: $swiperContainer.querySelector('.as-swiper-indicators'),
        bulletClass: 'swiper-indicator',
        bulletActiveClass: 'swiper-indicator-active',
        clickable: true,
      },
      navigation: {
        nextEl: $swiperContainer.querySelector('.as-swiper-indicator-next'),
        prevEl: $swiperContainer.querySelector('.as-swiper-indicator-prev'),
      },
      // Responsive breakpoints
      breakpoints: {
        576: {
          centeredSlides: true,
        }
      },
      on: {
        init: function (swiper) {
          if ($descContainer) {
            $descContainer.classList.remove('not-initialized')
            $descContainer.querySelector(`.as-carousel-desc-item.active`)?.classList.remove('active')
            $descContainer.querySelector(`.as-carousel-desc-item:nth-child(${swiper.realIndex + 1})`)?.classList.add('active')
          }
        }
      }
    })

    imageSlider.on('slideChange', function (swiper) {
      $descContainer?.querySelector(`.as-carousel-desc-item.active`)?.classList.remove('active')
      $descContainer?.querySelector(`.as-carousel-desc-item:nth-child(${swiper.realIndex + 1})`)?.classList.add('active')
    })
  }
}

const $swiperContainers = document.querySelectorAll('.as-image-sliders-container')
$swiperContainers && $swiperContainers.forEach(($swiperContainer) => {
  new ImageSliders($swiperContainer)
})

export default ImageSliders