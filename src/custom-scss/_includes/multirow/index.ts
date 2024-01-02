import Swiper from 'swiper'
import { isMdPc } from '@scripts/_utilities'

const MultirowSwiper = class {
  $swiperContainer: HTMLElement
  isMdPc: boolean = isMdPc()
  constructor ($swiperContainer: HTMLElement) {
    this.$swiperContainer = $swiperContainer
  }

  init (): void {
    if (!this.isMdPc) {
      // this.addClassName()
      this.initSwiper()
    }
  }

  /**
   * 由于只有移动端有可能有轮播, 所以对应的类名由 js 动态引入
  */
  // addClassName (): void {
  //   const $swiper: HTMLElement | null = this.$swiperContainer.querySelector('.as-swiper')
  //   $swiper?.classList.add('swiper')
  //   const $swiperWrapper: HTMLElement | null = this.$swiperContainer.querySelector('.as-swiper-wrapper')
  //   $swiperWrapper?.classList.add('swiper-wrapper')
  //   const $swiperSlide: NodeListOf<HTMLElement> = this.$swiperContainer.querySelectorAll('.as-swiper-slide')
  //   Array.from($swiperSlide).map($val => {
  //     $val.classList.add('swiper-slide')
  //   })
  // }

  initSwiper (): void {
    const $swiper: HTMLElement | null = this.$swiperContainer.querySelector('.as-swiper')
    if ($swiper === null) return
    const slideSize = $swiper.querySelectorAll('.as-swiper-slide').length
    if (slideSize <= 1) return
    // console.log(slideSize)
    // eslint-disable-next-line no-new
    new Swiper($swiper, {
      slidesPerView: 'auto',
      on: {
        init: function (swiper) {
          swiper.el.classList.remove('not-initialized')
        }
      }
    })
  }
}

;(() => {
  const $swiperContainers: NodeListOf<HTMLElement> = document.querySelectorAll('.as-multirow-swiper')
  Array.from($swiperContainers).map($val => {
    const swiper = new MultirowSwiper($val)
    swiper.init()
  })
})()
