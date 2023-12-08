
class PredictiveSearch extends HTMLElement {
  $input: HTMLInputElement | null
  $form: HTMLFormElement | null
  $cachedResults: any
  $results: HTMLElement | null
  $searchResults: HTMLElement | null
  $quickLinkResults: HTMLElement | null
  $clearBtn: HTMLElement | null
  $showOverlay: boolean
  $overlay: HTMLElement | null
  $env: string | undefined
  constructor() {
    super();
    this.$cachedResults = {}
    this.$env = this.dataset.env
    this.$form = this.querySelector('form')
    this.$input = this.querySelector('input[name="q"]')
    this.$results = this.querySelector('.as-predictive-links')
    this.$searchResults = this.querySelector('.as-predictive-results')
    this.$quickLinkResults = this.querySelector('.as-quick-links-results')
    this.$clearBtn = this.querySelector('.as-clear-btn')
    this.$showOverlay = Boolean(Number(this.dataset.showOverlay))
    this.$overlay = this.querySelector('.as-search-form-overlay')
    this.init()
  }

  init () {
    this.listenInput()
    this.listenSubmit()
    this.listenClear()

    this.handleUrlParamsType()
  }
  listenSubmit() {
    this.$form?.addEventListener('submit', this.onFormSubmit.bind(this));
  }
  onFormSubmit(event: any) {
    if (!this.getQuery()?.length || this.querySelector('[aria-selected="true"] a')) event.preventDefault();
  }
  listenInput() {
    this.$input?.addEventListener('input', this.debounce(() => {
      this.onChange();
    }, 300).bind(this));
    this.$input?.addEventListener('focus', this.onChange.bind(this));
    if (this.$env && this.$env == 'page') {
      this.addEventListener('focusout', this.onFocusOut.bind(this));
    }

    // 键盘选择处理
    this.addEventListener('keyup', this.onKeyup.bind(this));
    this.addEventListener('keydown', this.onKeydown.bind(this));
  }
  listenClear() {
    this.$clearBtn?.addEventListener('click', () => {
      this.$input && (this.$input.value = '')
      this.$input && (this.$input.focus())
      this.$input?.dispatchEvent(new CustomEvent('change'))
      this.$input?.dispatchEvent(new CustomEvent('focus'))
    })
  }
  onChange() {
    const searchTerm = this.getQuery();
    if (!searchTerm?.length) {
      this.hideClear()
      // 渲染快捷链接
      this.getQuickLinks()
      return;
    }
    this.showClear()
    if (searchTerm?.length == 1) this.close()
    if (searchTerm?.length > 1) this.getSearchResults(searchTerm)
  }

  onFocusOut() {
    setTimeout(() => {
      if (!this.contains(document.activeElement)) this.close();
    })
  }

  toggleOverlay(show: boolean) {
    this.$overlay?.classList.toggle("show", show)
  }

  onKeyup(event:any) {
    event.preventDefault()
    switch (event?.code) {
      case 'ArrowUp':
        this.switchOption('up')
        break;
      case 'ArrowDown':
        this.switchOption('down');
        break;
      case 'Enter':
        this.selectOption();
        break;
    }
  }
  onKeydown(event:any) {
    // Prevent the cursor from moving in the input when using the up and down arrow keys
    if (
      event.code === 'ArrowUp' ||
      event.code === 'ArrowDown'
    ) {
      event.preventDefault()
    }
  }

  switchOption(direction: string) {
    const moveUp = direction === 'up';
    const selectedElement = this.querySelector('[aria-selected="true"]');
    const allElements = this.querySelectorAll('li');
    let activeElement = this.querySelector('li');

    if (moveUp && !selectedElement) return;

    if (!moveUp && selectedElement) {
      activeElement = selectedElement?.nextElementSibling || selectedElement?.parentNode?.nextElementSibling?.nextElementSibling?.nextElementSibling?.firstElementChild || allElements[0];
    } else if (moveUp) {
      activeElement = selectedElement?.previousElementSibling || selectedElement?.parentNode?.previousElementSibling?.previousElementSibling?.previousElementSibling?.lastElementChild || allElements[allElements.length - 1];
    }

    if (activeElement === selectedElement) return;

    activeElement?.setAttribute('aria-selected', true);
    if (selectedElement) selectedElement.setAttribute('aria-selected', false);
  }

  selectOption() {
    const selectedLink:any = this.querySelector('[aria-selected="true"] a, [aria-selected="true"] button');
    if (selectedLink) selectedLink.click();
  }

  debounce(fn: Function, wait: any) {
    let t: any;
    return (...args: any) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  handleUrlParamsType () {
    if (!this.$form) return
    const $inputType: HTMLInputElement = this.$form.querySelector('[name="type"]') as HTMLInputElement
    if (this.$env && this.$env == 'page') {
      const url = new URL(window.location.href)
      const searchParams = url.searchParams
      const paramType = searchParams.get('type')
      if (paramType === null) return
      $inputType && ($inputType.value = paramType)
    }
  }

  getSearchResults(searchTerm: any) {
    const queryKey = searchTerm.replace(" ", "-").toLowerCase()

    // loading状态
    this.toggleLoadingState(true)

    // 如果缓存中存在，则渲染缓存数据
    if (this.$cachedResults[queryKey]) {
      this.renderSearchResults(this.$cachedResults[queryKey]);
      return;
    }

    fetch(`/search/suggest?q=${encodeURIComponent(searchTerm)}&${encodeURIComponent('resources[type]')}=${this.$form?.querySelector('[name="type"]')?.value}&${encodeURIComponent('resources[limit]')}=5&section_id=predictive-search`)
      .then((response) => {
        if (!response.ok) {
          const error = new Error(`${response.status}: ${response.text()}`);
          this.close()
          throw error
        }
        return response.text();
      })
      .then((text) => {
        const resultsMarkup = new DOMParser().parseFromString(text, 'text/html')?.querySelector('.as-predictive-search-results')?.innerHTML;
        if (!resultsMarkup) {
          this.close()
          return
        }
        this.$cachedResults[queryKey] = resultsMarkup;
        this.renderSearchResults(resultsMarkup);
      })
      .catch((error) => {
        this.close();
        throw error;
      });
  }

  toggleLoadingState(status: boolean) {
    if (status) {
      this.$results?.classList.add('loading')
      this.open()
    } else {
      this.$results?.classList.remove('loading')
    }
  }

  getQuickLinks() {
    const resultsMarkup = this.$quickLinkResults?.innerHTML
    resultsMarkup ? this.renderSearchResults(resultsMarkup) : this.close()
  }
  renderSearchResults(resultsMarkup: any) {
    const newresultsHtml = resultsMarkup.replace('search-form', 'search-form' + '-' + this.$env)
    this.$searchResults && (this.$searchResults.innerHTML = newresultsHtml)
    this.toggleLoadingState(false)
    this.open()
  }

  getQuery() {
    return this.$input?.value.trim();
  }
  open() {
    this.$results?.classList.remove('d-none')
    this.$showOverlay ? this.toggleOverlay(true) : null
  }
  close() {
    this.$results?.classList.add('d-none')
    this.$showOverlay ? this.toggleOverlay(false) : null
  }
  showClear() {
    this.$clearBtn?.classList.add('active')
  }
  hideClear() {
    this.$clearBtn?.classList.remove('active')
  }
}
if (!customElements.get('predictive-search')) {
  customElements.define('predictive-search', PredictiveSearch)
}
