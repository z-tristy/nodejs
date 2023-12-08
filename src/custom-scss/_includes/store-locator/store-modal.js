const Helpers = require('@scripts/helpers')

class StoreModal extends HTMLElement {
  constructor() {
    super()

    this.$map = document.querySelector('google-map')
    this.$modal = document.getElementById('as-local-store-modal')
    this.$modalBtn = document.querySelector(`[data-bs-target="#as-local-store-modal"]`)
    this.$localStores = this.querySelectorAll('.as-local-store')

    if (Helpers.checkIsMobile()) {
      this.bindEvent()
    }
  }

  bindEvent() {
    let $lastClickStore
    let $currentClickStore

    this.$map?.addEventListener('map.click.store', (event) => {
      const sn = event.detail
      if (sn) {
        $lastClickStore?.classList.add('d-none')
        $currentClickStore = this.$modal.querySelector(`.as-local-store[data-sn="${sn}"]`)
        $currentClickStore?.classList.remove('d-none')
        $lastClickStore = $currentClickStore
        // 打开弹窗
        this.$modalBtn?.click()
      }
    })

    this.$modal?.addEventListener('hidden.bs.modal', () => {
      this.$map?.zoomOutStoreIcon()
    })
  }

  renderDistance(distancesList) {
    if (Helpers.checkIsMobile()) {
      let $distance
      ![...this.$localStores].forEach(($store) => {
        const sn = $store.getAttribute('data-sn')
        const tmpStore = distancesList?.find(tmpStore => tmpStore?.sn?.toString() === sn.toString()) || null
        
        $distance = $store.querySelector('.as-distance')
        if (tmpStore) {
          if (tmpStore.distance) {
            $distance && ($distance.innerHTML = tmpStore.distance.toLocaleString('en-us', { 'minimumFractionDigits': 2, 'maximumFractionDigits': 2 }))
            $distance?.parentNode?.classList.remove('d-none')
            $store.dataset.distance = tmpStore.distance
          } else {
            $distance?.parentNode?.classList.add('d-none')
          }
        } else {
          $distance?.parentNode?.classList.add('d-none')
        }
      })
    }
  }
}

if (!customElements.get('store-modal')) {
  customElements.define('store-modal', StoreModal)
}