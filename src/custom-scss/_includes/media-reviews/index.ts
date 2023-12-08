import Swiper, { Autoplay } from 'swiper'
Swiper.use([Autoplay])
import { debounce } from '@scripts/_utilities'

const MediaReviews = class {
  $swiperContainer: Element
  $swiper: any
  slideSize: number
  $mainContainer: any
  currentIndex: number
  debounceOnRezie: ((...args: any[]) => void) | undefined
  constructor($swiperContainer: Element) {
    this.$swiperContainer = $swiperContainer

    this.$swiper = $swiperContainer.querySelector('.as-swiper')
    this.slideSize = this.$swiper && this.$swiper.querySelectorAll('.as-swiper-slide').length || 0
    this.$mainContainer = $swiperContainer.querySelector('.as-swiper-indicators')
    this.currentIndex = -1
    
    if ($swiperContainer && this.$swiper && this.slideSize <= 1) return
    
    this.calculateHeight()
    this.debounceOnRezie = debounce(() => {
      this.calculateHeight()
    }, 300)
    window.addEventListener('resize', this.debounceOnRezie.bind(this))
    
    if (this.slideSize == 2) {
      this.initWithoutSwiper()
    } else {
      this.init()
    }
  }

  calculateHeight() {
    this.$swiper.classList.remove('not-initialized')
    const $reviews = this.$swiper.querySelectorAll('.as-reviews')
    if ($reviews) {
      const reviewsArr = Array.prototype.slice.call($reviews)
      const height = Array.from(reviewsArr, $item => $item.clientHeight).reduce((prev, current) => {
        return Math.max(prev, current)
      })
      this.$swiper.style.height = height + 'px'
    }
  }

  initWithoutSwiper() {
    const $slides = this.$mainContainer.querySelectorAll(`.as-swiper-slide`)
    if (!$slides) return

    const slidesArr = Array.prototype.slice.call($slides)
    
    this.$mainContainer.addEventListener('click', (event: { target: { closest: (arg0: string) => any } }) => {
      const $target = event.target.closest('.as-swiper-slide')
      if ($target) {
        this.currentIndex = slidesArr.indexOf($target)

        this.$mainContainer.querySelector(`.as-swiper-slide.swiper-slide-active`)?.classList.remove('swiper-slide-active')
        $target?.classList.add('swiper-slide-active')
      }
    });

    ['transitionstart', 'webkitTransitionStart'].forEach((event) => {
      this.$mainContainer.addEventListener(event, () => {
        this.$swiper.querySelector(`.as-swiper-slide.active`)?.classList.remove('active')
      })
    });

    ['transitionend', 'webkitTransitionEnd'].forEach((event) => {
      this.$mainContainer.addEventListener(event, () => {
        this.$swiper.querySelector(`.as-swiper-slide:nth-child(${this.currentIndex + 1})`)?.classList.add('active')
      })
    });
  }

  init() {
    const $swiper = this.$swiper
    const $mainContainer = this.$mainContainer

    const autoplayDelay = parseInt($mainContainer.dataset.autoplay)
    const autoplayConfig = autoplayDelay > 0 ? {
      autoplay: {
        delay: autoplayDelay,
        disableOnInteraction: false,
        pauseOnMouseEnter: true
      }
    } : {}
    const perRowForWeb = parseInt($mainContainer.dataset.perRow) || 3
    
    const mainSwiper = new Swiper($mainContainer, {
      ...autoplayConfig,
      loop: true,
      slidesPerView: 3,
      spaceBetween: 24,
      speed: 300,
      centeredSlides: true,
      allowTouchMove: true,
      slideToClickedSlide: true,
      breakpoints: {
        // when window width is >= 600px
        600: {
          slidesPerView: perRowForWeb
        },
      },
      on: {
        init: function (swiper) {
          swiper.el.classList.remove('not-initialized')
          if ($swiper) {
            $swiper.querySelector(`.as-swiper-slide.active`)?.classList.remove('active')
            $swiper.querySelector(`.as-swiper-slide:nth-child(${swiper.realIndex + 1})`)?.classList.add('active')
          }
        }
      }
    })

    mainSwiper.on('slideChangeTransitionStart', function () {
      if ($swiper) {
        $swiper.querySelector(`.as-swiper-slide.active`)?.classList.remove('active')
      }
    })

    mainSwiper.on('slideChangeTransitionEnd', function (swiper) {
      if ($swiper) {
        $swiper.querySelector(`.as-swiper-slide:nth-child(${swiper.realIndex + 1})`)?.classList.add('active')
      }
    })
  }
}

const $swiperContainers = document.querySelectorAll('.as-media-reviews-container')
$swiperContainers && $swiperContainers.forEach(($swiperContainer) => {
  new MediaReviews($swiperContainer)
})

export default MediaReviews