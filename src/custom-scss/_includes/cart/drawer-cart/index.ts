import { debounce, fetchConfig } from '@scripts/_utilities'
var bus = require('@scripts/events')
const Offcanvas = require('bootstrap').Offcanvas

class CartRemoveButton extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('click', (event) => {
      event.preventDefault();
      this.closest('cart-items-1')?.updateQuantity(this.dataset.index, 0);
    });
  }
}

customElements.define('cart-remove-button-1', CartRemoveButton);

class CartItems extends HTMLElement {
  $lineItemStatus: HTMLElement | null;
  $errors: HTMLElement | null;
  // currentItemCount: number;
  debouncedOnChange: (...args: any[]) => void;
  $cartIconBubble: any;
  $offcanvas: any
  $offcanvasParent: any
  constructor() {
    super();

    this.$lineItemStatus = document.getElementById('shopping-cart-line-item-status');
    this.$errors = document.getElementById('cart-errors')
    this.$offcanvasParent = document.querySelector('.as-drawer-cart-offcanvas')

    // this.currentItemCount = Array.from(this.querySelectorAll('[name="updates[]"]'))
    //   .reduce((total, quantityInput) => total + parseInt(quantityInput.value), 0);

    this.$cartIconBubble = document.querySelector('cart-icon-bubble')

    this.debouncedOnChange = debounce((event: Event) => {
      this.onChange(event);
    }, 300);

    this.addEventListener('change', this.debouncedOnChange.bind(this));

    document.addEventListener(bus.EVENT.ADD_ITEM_TO_CART, () => {
      this.updateCart({})
    })
  }

  onChange(event: Event) {
    this.updateQuantity(event.target.dataset.index, event.target.value, document.activeElement.getAttribute('name'));
  }

  getSectionsToRender() {
    return [
      {
        id: 'drawer-main-cart-items',
        section: document.getElementById('drawer-main-cart-items')?.dataset.id,
        selectors: ['.as-cart-count', '.as-cart-items-list', '.as-cart-summary', '.as-cart-ctas', '.as-shiping-and-delivery-wrap'],
      }
    ];
  }

  updateCart (updates: {}) {
    const bubbleSections = this.$cartIconBubble?.getSectionsToRender().map((section) => section.section) || []
    const cartSections = this.getSectionsToRender().map((section) => section.section) || []

    const body = JSON.stringify({
      updates: {...updates},
      sections: bubbleSections.concat(cartSections),
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

  updateQuantity(line, quantity, name) {
    this.enableLoading(line)

    const bubbleSections = this.$cartIconBubble?.getSectionsToRender().map((section) => section.section) || []
    const cartSections = this.getSectionsToRender().map((section) => section.section) || []

    const body = JSON.stringify({
      line,
      quantity,
      sections: cartSections.concat(bubbleSections),
      sections_url: window.location.pathname
    });

    fetch(`${routes.cart_change_url}`, {...fetchConfig(), ...{ body }})
      .then((response) => {
        return response.text();
      })
      .then((state) => {
        
        const cartData = JSON.parse(state);
        if (cartData.errors) {
          const $lineItemError = document.getElementById(`line-item-error-${line}`)
          const $quantityElement = document.getElementById(`quantity-${line}`)
          if (!$lineItemError || !$quantityElement) return
          $lineItemError.classList.remove('d-none')
          const inventory_quantity = $quantityElement.getAttribute('data-inventory-quantity') || 0
          const value = $quantityElement.getAttribute('value') || 0
          $lineItemError.querySelector('.cart-item-error-text').innerHTML = window.cartStrings.quantityError.replace('[quantity]',inventory_quantity);
          $quantityElement.value = value;
          return;
        }
        
        this.renderContents(cartData)

        cartData.item_count && this.updateLiveRegions(line, cartData.item_count);
        document.getElementById(`cart-item-${line}`)?.querySelector(`[name="${name}"]`)?.focus();
        this.disableLoading();

        this.$cartIconBubble?.renderContents(cartData)
      }).catch((error) => {
        console.error(error)
        this.querySelectorAll('.loading-overlay')?.forEach((overlay) => overlay.classList.add('hidden'));
        this.$errors.textContent = window.cartStrings.error;
        this.disableLoading();
      });
  }

  renderContents(cartData) {
    this.closest('.as-cart-with-items')?.classList.toggle('is-empty', cartData.item_count === 0)

    cartData.sections && this.getSectionsToRender().forEach((section => {
      section.selectors.forEach(selector => {
        const $elementToReplace =
          document.getElementById(section?.id)?.querySelector(selector) || document.getElementById(section.id)

        $elementToReplace.innerHTML =
          this.getSectionInnerHTML(cartData.sections[section?.section], selector)
        })
    }))
  }

  updateLiveRegions(line:any, itemCount: number) {
    // const $input = document.getElementById(`quantity-${line}`)
    // const $plus = $input?.parentNode?.querySelector('.as-quantity-btn[name="plus"]')
    // if (this.currentItemCount === itemCount) {
    //   const $lineItemError = document.getElementById(`line-item-error-${line}`)
    //   if (!$lineItemError) return
    //   $lineItemError.classList.remove('d-none')
    //   $lineItemError.querySelector('.cart-item-error-text')
    //     .innerHTML = window.cartStrings.quantityError.replace('[quantity]', document.getElementById(`quantity-${line}`)?.value);
      
    //   $plus && ($plus.disabled = true)
    // } else {
    //   $plus && ($plus.disabled = false)
    // }

    // this.currentItemCount = itemCount;
    this.$lineItemStatus?.setAttribute('aria-hidden', true);

    const $cartStatus = document.getElementById('cart-live-region-text');
    $cartStatus?.setAttribute('aria-hidden', false);

    setTimeout(() => {
      $cartStatus?.setAttribute('aria-hidden', true);
    }, 1000);
  }

  getSectionInnerHTML(html, selector) {
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector)?.innerHTML;
  }

  enableLoading(line) {
    // document.getElementById('main-cart-items').classList.add('cart__items--disabled');
    // this.querySelectorAll('.loading-overlay')[line - 1].classList.remove('hidden');
    // document.activeElement.blur();
    // this.$lineItemStatus.setAttribute('aria-hidden', false);
  }

  disableLoading() {
    document.getElementById('drawer-main-cart-items').classList.remove('cart__items--disabled');
  }
  showOffcanvas() {
    this.$offcanvas = Offcanvas.getOrCreateInstance(this.$offcanvasParent)
    this.$offcanvas.show()
  }

  // listenShow() {
  //   this.$offcanvasParent.addEventListener('show.bs.offcanvas', () => {

  //   })
  // }
  // listenClose() {
  //   this.$offcanvasParent.addEventListener('hidden.bs.offcanvas', () => {

  //   })
  // }

}

customElements.define('cart-items-1', CartItems);

// class drawerCart extends HTMLElement {
//   $offcanvas: any
//   $offcanvasParent: any
//   constructor() {
//     super();
//   }
//   showOffcanvas() {
//     this.$offcanvasParent = document.querySelector('.as-drawer-cart-offcanvas')
//     this.$offcanvas = Offcanvas.getOrCreateInstance(this.$offcanvasParent)
//     this.$offcanvas.show()
//   }
// }

// customElements.define('drawer-cart', drawerCart);