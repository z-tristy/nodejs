class DetailsDisclosure extends HTMLElement {
  $mainDetailsToggle: HTMLElement | null
  $mainDetailsContent: HTMLElement | null
  constructor() {
    super();
    this.$mainDetailsToggle = this.querySelector('.as-details-toggle');
    this.$mainDetailsContent = this.querySelector('.as-details-content');

    this.$mainDetailsToggle?.addEventListener('mouseover', this.onMouseOver.bind(this));
    this.$mainDetailsToggle?.addEventListener('mouseout', this.onMouseOut.bind(this));
    this.$mainDetailsToggle?.addEventListener('keydown', this.onKeyDown.bind(this));
    this.$mainDetailsContent?.addEventListener('focusout', this.onFocusOut.bind(this));
  }

  onFocusOut(event: { target: { classList: { contains: (arg0: string) => any; }; }; }) {
    if (event.target.classList.contains('as-last')) {
      this.close()
    }
  }

  onKeyDown(event: { key: string; }) {
    if (event.key === 'Space' || event.key === 'Enter' ) {
      this.open()
    }
  }
  onMouseOver() {
    this.open()
  }

  onMouseOut() {
    this.close()
  }
  
  open() {
    this.$mainDetailsToggle?.setAttribute('open', '')
  }

  close() {
    this.$mainDetailsToggle?.removeAttribute('open')
  }
}

if (!customElements.get('details-disclosure')) {
  customElements.define('details-disclosure', DetailsDisclosure);
}