import Swiper, { Navigation, Pagination, Autoplay } from 'swiper'
Swiper.use([Navigation, Pagination, Autoplay])
const Helpers = require('@scripts/helpers')

class Slider{
  $parent: Node
  $slider: HTMLElement | null
  $pcFlag: any
  indicatorCircleHTML: string
  constructor ($parent: Node) {
    this.$parent = $parent
    if (!this.$parent) return
    this.$slider = (this.$parent as HTMLElement).querySelector('.as-testimonials-swiper')
    if (!this.$slider) return
    this.$pcFlag = Helpers.isPc()
    this.indicatorCircleHTML = (this.$parent as HTMLElement).querySelector('.as-swiper-indicator-circle')?.innerHTML || ''

    this.init()
  }
  init () {
    this.initSwipers()
  }
  initSwipers() {
    this.initSwiper(this.$slider)
    this.updateStyle(this.$slider)
    this.updateVariable()   
  }
  initSwiper(slider: any) {
    var that = this
    var auto: boolean = Boolean(Number(slider.dataset.auto))
    var perPage: number = Number(slider.dataset.perPage)
    var interval: number = Number(slider.dataset.carouselInterval)
    if (auto && !this.$pcFlag) {
      auto = false
    }
    if (auto && this.$pcFlag) {
      var options: object = {
        slidesPerView: 1,
        slidesPerGroup: 1,
        spaceBetween: 24,
        loop: true,
        watchOverflow: true,
        autoplay: {
          delay: interval,
          pauseOnMouseEnter: true,
          disableOnInteraction: false
        },
        pagination: {
          el: ".swiper-pagination",
          clickable: true,
          renderBullet: function (index: number, className: string) {
            return `<div class="${className}">${that.indicatorCircleHTML}</div>`;
          },
        },
        breakpoints: {
          0: {
            slidesPerView: 1,
            slidesPerGroup: 1,
          },
          1024: {
            slidesPerView: perPage,
            slidesPerGroup: perPage
          }
        },
        on: {
          init: function (swiper) {
            swiper.pagination.bullets[0].classList.remove('swiper-pagination-bullet-active')
          },
          afterInit: function (swiper) {
            setTimeout(() => {
              swiper.pagination.bullets[0].classList.add('swiper-pagination-bullet-active')
            })
          }
        },
      }
    } else {
      var options: object = {
        slidesPerView: 1,
        slidesPerGroup: 1,
        spaceBetween: 24,
        loop: false,
        autoplay: false,
        watchOverflow: true,
        pagination: {
          el: ".swiper-pagination",
          clickable: true,
          renderBullet: function (index: number, className: string) {
            return `<div class="${className}">${that.indicatorCircleHTML}</div>`;
          },
        },
        breakpoints: {
          0: {
            slidesPerView: 1,
            slidesPerGroup: 1,
          },
          1024: {
            slidesPerView: perPage,
            slidesPerGroup: perPage
          }
        }
      }
    }
    let swiper = new Swiper(slider, options)
  }
  updateStyle(slider: any) {
    let pagination = slider.querySelectorAll('.swiper-pagination-bullet')
    if (pagination && pagination.length == 1) {
      slider.classList.remove('pagination-active')
    }
  }
  updateVariable() {
    (Window as any)._loadSwiper = true
  }
}

let testimonials: NodeList = document.querySelectorAll('.as-testimonials')

if (!(Window as any)._loadSwiper) {
  testimonials && Array.from(testimonials).map((testimonial: Node) => {
    new Slider(testimonial)
  })
}

export default Slider