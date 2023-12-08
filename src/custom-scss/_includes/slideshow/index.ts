const Helpers = require('../../scripts/helpers.ts')
const Carousel = class{
  $carousels: NodeListOf<Element>
  constructor (carousels: NodeListOf<Element>) {
    this.$carousels = carousels
    this.init()
  }
  init () {
    Array.from(this.$carousels).map((carousel) => {
      this.initCarousel(carousel)
    })  
  }
  initCarousel(carousel) {
    let isAuto = carousel.dataset.bsRide == 'carousel' ? true : false
    let isPc = Helpers.isPc()
    // if (!isPc && isAuto) {
    //   carousel.dataset.bsInterval = false
    // }
    if (isPc && isAuto) {
      carousel.querySelector('[data-bs-target]')?.classList.remove('active')
      setTimeout(() => {
        carousel.querySelector('[data-bs-target]')?.classList.add('active')
      })
    }
  }
}
let carousels: NodeListOf<Element> = document.querySelectorAll('.as-slideshow')
new Carousel(carousels)