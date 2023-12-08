import { fetchConfig } from '@scripts/_utilities'

class MiniCart extends HTMLElement {
  $cartIconBubble: any
  constructor () {
    super()
    this.$cartIconBubble = document.querySelector('cart-icon-bubble')
    this.bindEvent()
  }

  getSectionsToRender() {
    return [
      {
        id: 'mini-cart-items',
        section: document.getElementById('mini-cart-items')?.dataset.id,
        selectors: ['.as-cart-count', '.as-cart-items-list', '.as-cart-summary', '.as-cart-checkout', '.as-shiping-and-delivery-wrap'],
      }
    ]
  }

  updateCart (updates: {}) {
    const bubbleSections = this.$cartIconBubble?.getSectionsToRender().map((section) => section.section) || []
    const miniCartSections = this.getSectionsToRender().map((section) => section.section) || []
    const body = JSON.stringify({
      updates: {...updates},
      sections: bubbleSections.concat(miniCartSections),
      sections_url: window.location.pathname
    })

    fetch(`${routes.cart_update_url}`, {...fetchConfig(), ...{ body }})
      .then((response) => {
        return response.json()
      })
      .then((parsedState) => {
        this.renderContents(parsedState)
        
        this.$cartIconBubble?.renderContents(parsedState)
      })
      .catch((error) => {
        console.error(error)
      })
  }

  renderContents(cartData) {
    
    this.querySelector('.as-cart-with-items')?.classList.toggle('is-empty', cartData.item_count === 0)

    cartData.sections && this.getSectionsToRender().forEach((section => {
      
      section.selectors.forEach(selector => {
        const $elementToReplace =
          document.getElementById(section?.id)?.querySelector(selector) || document.getElementById(section.id)

        $elementToReplace.innerHTML =
          this.getSectionInnerHTML(cartData.sections[section?.section], selector)
        })
    }))
  }

  getSectionInnerHTML(html, selector) {
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector)?.innerHTML
  }

  bindEvent () {
    this.addEventListener('click', (event) => {
      const $target = event.target
      
      if ($target?.classList.contains('as-remove-cart-item') || $target?.classList.contains('as-remove-link')) {
        event.preventDefault()
        const obj = {}
        obj[$target?.dataset.variantId] = 0
        this.updateCart(obj)
      }
    })
  }

  disable() {
    this.classList.add('d-none')
  }

  enable() {
    this.classList.remove('d-none')
  }
}

customElements.define('mini-cart', MiniCart)