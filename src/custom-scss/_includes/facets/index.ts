import { debounce } from '@scripts/_utilities'
class FacetFiltersForm extends HTMLElement {
  debouncedOnSubmit: Function
  constructor() {
    super();
    this.onActiveFilterClick = this.onActiveFilterClick.bind(this);

    this.debouncedOnSubmit = debounce((event) => {
      this.onSubmitHandler(event);
    }, 500);

    this.querySelector('form').addEventListener('input', this.debouncedOnSubmit.bind(this));

    // this.querySelector('.as-facets-wrapper')?.addEventListener('keyup', onKeyUpEscape);
  }

  static setListeners() {
    const onHistoryChange = (event) => {
      const searchParams = event.state ? event.state.searchParams : FacetFiltersForm.searchParamsInitial;
      if (searchParams === FacetFiltersForm.searchParamsPrev) return;
      FacetFiltersForm.renderPage(searchParams, null, false);
    }
    window.addEventListener('popstate', onHistoryChange);
  }

  static toggleActiveFacets(disable = true) {
    document.querySelectorAll('.js-facet-remove').forEach((element) => {
      element.classList.toggle('disabled', disable);
    });
  }

  static renderPage(searchParams, event, updateURLHash = true) {
    FacetFiltersForm.searchParamsPrev = searchParams;
    const sections = FacetFiltersForm.getSections();
    const countContainer = document.querySelector('.as-product-count-mob');
    const countContainerDesktop = document.querySelector('.as-product-count');
    const countContainerButton = document.querySelector('.as-product-count-button');
    
    document.querySelector('.as-product-grid-container')?.querySelector('.as-results-content')?.classList.add('loading');
    
    if (countContainer){
      countContainer.classList.add('loading');
    }
    if (countContainerDesktop){
      countContainerDesktop.classList.add('loading');
    }
    if (countContainerButton){
      countContainerButton.classList.add('loading');
    }

    sections.forEach((section) => {
      const url = `${window.location.pathname}?section_id=${section.section}&${searchParams}`;
      const filterDataUrl = element => element.url === url;

      FacetFiltersForm.filterData.some(filterDataUrl) ?
      FacetFiltersForm.renderSectionFromCache(filterDataUrl, event) :
      FacetFiltersForm.renderSectionFromFetch(url, event);
    });

    if (updateURLHash) FacetFiltersForm.updateURLHash(searchParams);
  }

  static renderSectionFromFetch(url, event) {
    fetch(url)
      .then(response => response.text())
      .then((responseText) => {
        const html = responseText;
        FacetFiltersForm.filterData = [...FacetFiltersForm.filterData, { html, url }];
        FacetFiltersForm.renderFilters(html, event);
        FacetFiltersForm.renderProductGridContainer(html);
        FacetFiltersForm.renderProductCount(html);
      });
  }

  static renderSectionFromCache(filterDataUrl, event) {
    const html = FacetFiltersForm.filterData.find(filterDataUrl).html;
    FacetFiltersForm.renderFilters(html, event);
    FacetFiltersForm.renderProductGridContainer(html);
    FacetFiltersForm.renderProductCount(html);
  }

  static renderProductGridContainer(html) {
     document.querySelector('.as-product-grid-container').innerHTML = new DOMParser().parseFromString(html, 'text/html').querySelector('.as-product-grid-container')?.innerHTML;
  }

  static renderProductCount(html) {
    const countPc = new DOMParser().parseFromString(html, 'text/html')?.querySelector('.as-product-count')?.innerHTML
    const countMob = new DOMParser().parseFromString(html, 'text/html')?.querySelector('.as-product-count-mob')?.innerHTML
    const countBtn = new DOMParser().parseFromString(html, 'text/html')?.querySelector('.as-product-count-button')?.innerHTML
    const container = document.querySelector('.as-product-count-mob');
    const containerDesktop = document.querySelector('.as-product-count');
    const containerButton = document.querySelector('.as-product-count-button');
    container.innerHTML = countMob;
    container.classList.remove('loading');
    if (containerDesktop) {
      containerDesktop.innerHTML = countPc;
      containerDesktop.classList.remove('loading');
    }
    if (containerButton) {
      containerButton.innerHTML = countBtn;
      containerButton.classList.remove('loading');
    }
  }

  static renderFilters(html, event) {
    const parsedHTML = new DOMParser().parseFromString(html, 'text/html');

    const facetDetailsElements =
      parsedHTML.querySelectorAll('.as-facets-form .js-filter, .as-facets-form-mob .js-filter');
    
    
    
    const matchesIndex = (element) => {
      const jsFilter = event ? event.target.closest('.js-filter') : undefined;
      return jsFilter ? element.dataset.index === jsFilter.dataset.index : false;
    }

    const handleElement = (element) => {
      if (!element.querySelector('.as-collapse-toggle')) return element
      element.querySelector('.as-collapse-toggle').ariaExpanded =  document.querySelector(`.js-filter[data-index="${element.dataset.index}"]`)?.querySelector('.as-collapse-toggle')?.ariaExpanded
      document.querySelector(`.js-filter[data-index="${element.dataset.index}"]`)?.querySelector('.as-collapse-content')?.classList.contains('show') ?  element.querySelector('.as-collapse-content').classList.add('show') : element.querySelector('.as-collapse-content')?.classList.remove('show')
      return element
    }

    const facetsToRender = Array.from(facetDetailsElements).filter(element => !matchesIndex(element))

    const handleFacets = Array.from(facetsToRender).map(element => handleElement(element))

    handleFacets.forEach((element) => {
      document.querySelector(`.js-filter[data-index="${element.dataset.index}"]`).innerHTML = element.innerHTML;
    });

    FacetFiltersForm.renderActiveFacets(parsedHTML);
    // FacetFiltersForm.renderAdditionalElements(parsedHTML);


    FacetFiltersForm.renderCounts(html);
  }

  static renderActiveFacets(html) {
    const activeFacetElementSelectors = ['.as-active-facets', '.as-active-facets-mob'];

    activeFacetElementSelectors.forEach((selector) => {
      const activeFacetsElement = html.querySelector(selector);
      if (!activeFacetsElement) return;
      document.querySelector(selector).innerHTML = activeFacetsElement.innerHTML;
    })

    FacetFiltersForm.toggleActiveFacets(false);
  }

  // static renderAdditionalElements(html) {
  //   const mobileElementSelectors = ['.mobile-facets__open', '.mobile-facets__count', '.sorting'];

  //   mobileElementSelectors.forEach((selector) => {
  //     if (!html.querySelector(selector)) return;
  //     document.querySelector(selector).innerHTML = html.querySelector(selector).innerHTML;
  //   });

  //   document.getElementById('FacetFiltersFormMobile').closest('menu-drawer').bindEvents();
  // }

  static renderCounts(html) {
    const filterCount = new DOMParser().parseFromString(html, 'text/html')?.querySelector('.as-active-filter-count')?.outerHTML
    
    const containers = document.querySelectorAll('.as-active-filter-count');
    containers.forEach((container) => {
      container.outerHTML = filterCount
    })
  }

  static updateURLHash(searchParams) {
    history.pushState({ searchParams }, '', `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`);
  }

  static getSections() {
    return [
      {
        section: document.querySelector('.as-product-grid-container')?.dataset?.id,
      }
    ]
  }

  onSubmitHandler(event) {
    event.preventDefault();
    const formData = new FormData(event.target.closest('form'));
    const searchParams = new URLSearchParams(formData).toString();
    FacetFiltersForm.renderPage(searchParams, event);
  }

  onActiveFilterClick(event) {
    event.preventDefault();
    FacetFiltersForm.toggleActiveFacets();
    const url = event.currentTarget.href.indexOf('?') == -1 ? '' : event.currentTarget.href.slice(event.currentTarget.href.indexOf('?') + 1);
    FacetFiltersForm.renderPage(url);
  }
}

FacetFiltersForm.filterData = [];
FacetFiltersForm.searchParamsInitial = window.location.search.slice(1);
FacetFiltersForm.searchParamsPrev = window.location.search.slice(1);
customElements.define('facet-filters-form', FacetFiltersForm);
FacetFiltersForm.setListeners();

class FacetRemove extends HTMLElement {
  constructor() {
    super();
    this.querySelector('a').addEventListener('click', (event) => {
      event.preventDefault();
      const form = this.closest('facet-filters-form') || document.querySelector('facet-filters-form');
      form.onActiveFilterClick(event);
    });
  }
}

customElements.define('facet-remove', FacetRemove);
