const selectors = {
  customerAddresses: '.customer-addresses',
  deleteAddressButtons: '.as-address-delete',
  editAddressButtons: '.as-address-edit',
  addressList: '.as-address-list',
  editAddressForm: '.as-edit-address-form',
  addressCountrySelect: '[data-address-country-select]'
};

class CustomerAddresses {
  $elements: Object
  constructor() {
    this.$elements = this._getElements()
    if (Object.keys(this.$elements).length === 0) return
    this._setupCountries()
    this._setupEventListeners()
  }

  _getElements() {
    const container = document.querySelector(selectors.customerAddresses)
    return container ? {
      container,
      deleteButtons: container.querySelectorAll(selectors.deleteAddressButtons),
      editButtons: container.querySelectorAll(selectors.editAddressButtons),
      addressList: container.querySelector(selectors.addressList),
      editAddressForms: container.querySelectorAll(selectors.editAddressForm),
      countrySelects: container.querySelectorAll(selectors.addressCountrySelect)
    } : {};
  }

  _setupCountries() {
    if (Shopify && Shopify.CountryProvinceSelector) {
      // eslint-disable-next-line no-new
      new Shopify.CountryProvinceSelector('AddressCountryNew', 'AddressProvinceNew', {
        hideElement: 'AddressProvinceContainerNew'
      })
      this.$elements.countrySelects.forEach((select) => {
        const formId = select.dataset.formId;
        // eslint-disable-next-line no-new
        new Shopify.CountryProvinceSelector(`AddressCountry_${formId}`, `AddressProvince_${formId}`, {
          hideElement: `AddressProvinceContainer_${formId}`
        });
      });
    }
  }

  _setupEventListeners() {
    this.$elements.deleteButtons.forEach((element) => {
      element.addEventListener('click', this._handleDeleteButtonClick)
    })
    this.$elements.editButtons.forEach((element) => {
      element.addEventListener('click', this._handleEditButtonClick)
    })
  }

  _handleEditButtonClick = ({ currentTarget }) => {
    this.$elements.editAddressForms.forEach(element => {
      if (element.dataset.addressId === currentTarget.dataset.addressId) {
        element.classList.remove('d-none')
        this.$elements.addressList.classList.add('d-none')
        this._scrollToTop()
      }
    })
  }
  _scrollToTop = (() => {
    window.scrollTo(0,0)
  })
  _handleDeleteButtonClick = ({ currentTarget }) => {
    // eslint-disable-next-line no-alert
    Shopify.postLink(currentTarget.dataset.target, {
      parameters: { _method: 'delete' }
    })
  }
}

new CustomerAddresses()
