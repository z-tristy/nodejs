import { Modal } from "bootstrap";

class DetailsModal extends HTMLElement {
  $modalOverlay: HTMLElement | null
  $modal: HTMLElement | null
  $searchInput: HTMLInputElement | null
  constructor() {
    super();
    this.$modalOverlay = this.querySelector('.as-modal-overlay');
    this.$modal = this.querySelector('.as-modal');
    this.$searchInput = this.querySelector('.as-search-input');
    if (!this.$modal) return

    this.$modal?.addEventListener('show.bs.modal', this.onModalShow.bind(this));
    this.$modal?.addEventListener('hide.bs.modal', this.onModalHide.bind(this));
    this.$modalOverlay?.addEventListener('click', this.onOverlayClick.bind(this))
  }

  onModalShow() {
    this.showBackdrop()
    this.showQuickLink()
  }

  onModalHide() {
    this.hideBackdrop()
    this.clearInput()
  }

  onOverlayClick() {
    Modal.getInstance(this.$modal)?.hide()
  }
  
  showQuickLink() {
    this.$modal?.querySelector('predictive-search')?.getQuickLinks()
  }

  showBackdrop() {
    this.$modalOverlay?.classList.add('show')
  }

  clearInput() {
    this.$searchInput && (this.$searchInput.value = '')
  }

  hideBackdrop() {
    this.$modalOverlay?.classList.remove('show')
  }
}
customElements.define('details-modal', DetailsModal);