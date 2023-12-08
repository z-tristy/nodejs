var bus = require('@scripts/events.js')
class ProductCard {
  $parent: any
  $productCard: any
  $addToCart: any
  constructor(recommend: any) {
    this.$parent = recommend
    if (!this.$parent) return
    this.$productCard = this.$parent.querySelectorAll('.as-product-card')
    this.init()
  }
  init() {
    this.getRecommendations()
  }
  getRecommendations() {
    let $recommendations = this.$parent.querySelector('.as-get-recommendations')
    if (!$recommendations) {
      this.getdateSelected()
    } else {
      fetch($recommendations.dataset.link)
        .then(response => response.text())
        .then((text) => {
          const html = document.createElement('div');
          html.innerHTML = text;
          const recommendations = html.querySelector('.as-get-recommendations');
          if (recommendations && recommendations.innerHTML.trim().length) {
            $recommendations.innerHTML = recommendations.innerHTML;
          }
          this.getdateSelected()
        })
        .catch(e => {
          console.error(e)
        })
    }
  }
  // 获取select选项
  getdateSelected() {
    this.$productCard && this.$productCard.forEach((productCard) => {
      let variantSelect = productCard.querySelector('.as-variant-select')
      if (!variantSelect) return
      let selectFigure = productCard.querySelectorAll('figure')
      let price  = productCard.querySelectorAll('.as-variant-price')
      let badge = productCard.querySelectorAll('.as-variant-badge')
      variantSelect.addEventListener('change', (event: any) => {
        for(let i = 0; i < selectFigure.length; i++) {
          selectFigure[i].classList.add('d-none')
          price[i].classList.add('d-none')
          badge[i].classList.add('d-none')
          if(selectFigure[i].dataset.variantId == event.target.value ) {
            selectFigure[i].classList.remove('d-none')
            price[i].classList.remove('d-none')
            badge[i].classList.remove('d-none')
          }
        }
      })
    })   
  }
}

let productCards: NodeListOf<Element> = document.querySelectorAll('.as-featured-collection')
productCards.forEach((featured) => {
  new ProductCard(featured)
})

export default ProductCard


