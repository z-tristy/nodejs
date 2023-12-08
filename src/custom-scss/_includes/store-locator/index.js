const Helpers = require('@scripts/helpers')
const bus = require('@scripts/events')

require('./store-select')
require('./map')
require('./store-modal')

class StoreLocator {
  constructor($parent) {
    if (!$parent) return
    this.$parent = $parent
    
    this.currentPosition

    this.$currentPos = this.$parent?.querySelector('.as-current-position')

    this.$switch = this.$parent?.querySelector('.as-use-current-location-switch')
    this.$switchInput = this.$parent?.querySelector('.as-use-current-location-switch-input')
    this.$searchForm = this.$parent?.querySelector('.as-search-form')
    this.$searchInput = this.$searchForm?.querySelector('.as-search-input')
    this.$searchBtn = this.$searchForm?.querySelector('.as-search-btn')

    this.$predictList = this.$searchForm?.querySelector('.as-predict-list')

    this.$localStoresWrapper = this.$parent?.querySelector('.as-local-store-wrapper')
    this.$localstoresList = this.$localStoresWrapper?.querySelector('.as-local-store-list')
    this.$localStores = this.$localStoresWrapper?.querySelectorAll('.as-local-store')

    this.originalData = window?.metafields_store_locator_local || []

    this.enableFilterByRegion = this.$parent?.dataset.enableFilterByRegion === 'true' ? true : false

    this.$map = this.$parent?.querySelector('google-map')
    // this.geoJSON = this.generateGeoJSON()
    // this.$map?.init(this.geoJSON)

    this.$storeModal = document.querySelector('store-modal')

    this.filterGeoJSON().then((res) => {
      this.$map?.init(this.generateGeoJSON())
      this.filterStoreList()

      this.bindSearchInputEvent()
      this.bindSwtichTabEvent()
      this.bindStoreListEvent()
      this.bindEvent()
    })

  }

  async filterGeoJSON() {
    if (this.enableFilterByRegion) {
      return await this.getFilteredData()
    } else {
      return this.originalData
    }
  }
 

  filterStoreList() {
    const storeList = document.querySelectorAll('.as-local-store-list')
    if (storeList.length > 0) {
      [...storeList].forEach(store => {
        let list = store.querySelectorAll('.as-local-store')
        list.forEach(item => {
          if (this.originalData.find(data => String(data.sn) == item.dataset.sn)) {
            item.style.display = 'block'
          } else {
            item.remove()
          }
        })
      })
    }
  }

  // 处理门店数据，生成Google Maps所需数据格式
  // 数据格式标准：https://geojson.org/
  // 数据格式参照https://developers.google.com/codelabs/maps-platform/google-maps-simple-store-locator?hl=zh-cn#3
  generateGeoJSON() {
    return {
      "type": "FeatureCollection",
      "features": this.originalData.map(store => {
        return {
          "geometry": {
            "type": "Point",
            "coordinates": [store.longitude, store.latitude]
          },
          "type": "Feature",
          "properties": {
            "category": store.category,
            "storetype": store.storetype,
            "workinghours": store.workinghours,
            "address": store.address,
            "city": store.city,
            "province": store.province,
            "aspname": store.aspname,
            "contactno": store.contactno,
            "sn": store.sn,
            "closedon": store.closedon,
          }
        }
      })
    }
  }



  /**
   * 过滤与用户IP匹配的store locator数据
   */
  async getFilteredData() {
    const allRegions = [...new Set(this.originalData.map(item => item?.countryhandle?.toLowerCase()).filter(Boolean))]
    if (allRegions.length > 0) {
      let location_code = ''
      const data = await (await fetch('/browsing_context_suggestions.json')).json()
      location_code = data?.detected_values?.country?.handle?.toLowerCase()
      if (location_code && allRegions.includes(location_code)) {
        this.originalData = this.originalData.filter(item => item.countryhandle?.toLowerCase() === location_code)
      }
      return this.originalData
    } else {
      return this.originalData
    }
  }

  /**
   * 获取用户IP所在地区
   * @returns {promise}
   */
  async getUserLocation () {
    return await fetch('/browsing_context_suggestions.json')
  }

  /**
   * 控制搜索输入框是否可编辑内容、获取当前位置转换器是否可用、下拉框是否可用
   * @param {Boolean} flag 值为true则为不可使用状态，值为false则为可使用状态
   */
  toggleEditable(flag) {
    this.$switch?.classList.toggle('disabled', flag)
    if (flag) {
      this.$searchBtn?.setAttribute('disabled', 'disabled')
      this.$searchInput?.setAttribute('disabled', 'disabled')
      this.$switchInput?.setAttribute('disabled', 'disabled')
    } else {
      this.$searchBtn?.removeAttribute('disabled')
      this.$searchInput?.removeAttribute('disabled')
      this.$switchInput?.removeAttribute('disabled')
    }
  }

  processForm() {
    const pattern = this.$searchForm?.querySelector('[name="q"]')?.value || ''
    const storetype = this.$searchForm?.querySelector('[name="store_type"]')?.value || ''
    const category = this.$searchForm?.querySelector('[name="category"]')?.value || ''

    return {
      pattern,
      storetype,
      category,
    }
  }
  
  /**
   * 默认按照维护顺序展示。当搜索框内的值不为空时，优先展示配置了优先级的门店，剩余门店按照由近及远的顺序展示
   * @param {Object} distances 距离数据（单位km），形如{"sn":1,"distance":88.8888}
   */
  sortLocalStores(distances) {
    if (distances && distances.length > 0) {
      [...this.$localstoresList.children]
        .sort((a, b) => {
          // 先按照优先级排序
          if (typeof a.dataset.priority === 'undefined' && typeof b.dataset.priority === 'string') {
            return 1
          } else if (typeof a.dataset.priority === 'string' && typeof b.dataset.priority === 'undefined') {
            return -1
          } else {
            return 0
          }
        })
        .sort((a, b) => {
          // 按照距离排序
          if ((typeof a.dataset.priority === 'string' && typeof b.dataset.priority === 'string') || (typeof a.dataset.priority === 'undefined' && typeof b.dataset.priority === 'undefined')) {
            const aDistance = distances.find(tmpStore => tmpStore.sn.toString() === a.dataset.sn).distance
            const bDistance = distances.find(tmpStore => tmpStore.sn.toString() === b.dataset.sn).distance
            if (aDistance > bDistance) {
              return 1
            } else {
              return -1
            }
          }
          return 0
        })
        .forEach(node => this.$localstoresList.appendChild(node))
    } else {
      [...this.$localstoresList.children]
        .sort((a, b) => parseInt(a.dataset.sn) > parseInt(b.dataset.sn) ? 1 : -1)
        .forEach(node => this.$localstoresList.appendChild(node))
    }
  }

  bindSwtichTabEvent() {
    // Local Stores 和 Online Stores Tab切换
    const $ribbon = this.$parent.querySelector('.as-local-store-ribbon')
    const $tabEls = this.$parent.querySelectorAll('.as-nav-tab')
    const toggleTab = ($target, flag) => {
      let idStr = $target?.getAttribute('data-bs-target')
      if (idStr) {
        let $aside = this.$parent?.querySelector(`.as-store-aside[data-id="${idStr.substr(1)}"]`)
        $aside?.classList.toggle('show', flag)
        $aside?.classList.toggle('active', flag)
      }
    }
    $tabEls && $tabEls.length > 1 && Array.prototype.forEach.call($tabEls, ($tabEl) => {
      $tabEl.addEventListener('show.bs.tab', (event) => {
        const $target = event.target
        $ribbon?.classList.toggle('d-none', $target?.getAttribute('data-bs-target') === '#as-online-stores-tab')

        // newly activated tab
        toggleTab($target, true)
        
        // previous active tab
        toggleTab(event.relatedTarget, false)
      })
    })
  }

  bindSearchInputEvent() {
    const getPredictList = () => {
      const { pattern } = this.processForm()
      
      if (pattern.replaceAll(/\s/g, '') !== '') {
        ;(async () => {
          const results = await this.$map?.getPredictList(pattern)
          const predictions = results.predictions || []
          this.renderPredictList(predictions)
        })();
      } else {
        this.renderPredictList([])
      }
    }
    this.$searchInput?.addEventListener('focus', getPredictList)

    let initQuery
    this.$searchInput?.addEventListener('input', () => {
      initQuery = this.$searchInput.value
      getPredictList()
      this.$switchInput && (this.$switchInput.checked = false)
    })

    let $prev, $current
    this.$searchInput?.addEventListener('keydown', (event) => {
      const key = event.keyCode
      const $list = this.$predictList.querySelectorAll('.as-predict-item')
      const length = $list.length
      const $active = this.$predictList.querySelector('.as-predict-item.active')
      let index
      if (key === 40) {
        // Down
        if ($active) {
          $prev = $active
          // 不是最后一个
          if ($active === $list[length - 1]) {
            // 列表最后一个
            $current = $list[0]
          } else {
            index = [...$list].indexOf($active)
            $current = $list[index + 1]
          }
        } else {
          $current = $list[0]
        }
      } else if (key === 38) {
        // Up
        if ($active) {
          $prev = $active
          if ($active === $list[0]) {
            $current = $list[length - 1]
          } else {
            index = [...$list].indexOf($active)
            $current = $list[index - 1]
          }
        } else {
          $current = $list[length - 1]
        }
      }

      if (key === 40 || key === 38) {
        $prev && $prev?.classList.remove('active')

        if (($active && [...$list].indexOf($active) === 0 && key === 38) || ($active && [...$list].indexOf($active) === length - 1 && key === 40)) {
          $current && this.$searchInput && (this.$searchInput.value = initQuery)
        } else {
          $current && $current?.classList.add('active')
  
          $current && this.$searchInput && (this.$searchInput.value = $current.innerText)
        }
      }
    })

    const handleBodyClick = (event) => {
      let $target = event.target

      if ($target.classList.contains('as-predict-item')) {
        // 收起输入联想列表
        this.togglePredictList(false)
        
        // 选中联想输入中的列表项
        this.$searchInput && (this.$searchInput.value = $target.innerText)
        this.$placeIdInput && (this.$placeIdInput.value = $target.getAttribute('data-place-id'))
        this.$searchForm.dispatchEvent(new Event('submit', { bubbles: true }))
      } else if ($target !== this.$searchInput) {
        // 收起输入联想列表
        this.togglePredictList(false)
      }
    }
    document.body.addEventListener('click', handleBodyClick.bind(this))
  }

  bindEvent() {
    this.$searchForm?.addEventListener('submit', (event) => {
      const placeInfo = event.detail || ''
      ;(async () => {
        const queryData = this.processForm()
        if (queryData.pattern.replaceAll(/\s/g, '') !== '') {
          // 以输入的地址为中心点，计算线下门店距离该中心点的距离（km）
          this.$map?.calculateDistances(queryData.pattern, placeInfo)
            .then((distancesList) => {
              // 筛选
              let filteredStore = this.filterStoresByDistance(this.originalData, distancesList)
              filteredStore = this.filterStoresByTypeOrCategory(filteredStore, queryData)

              // 排序
              this.sortLocalStores(distancesList)

              // 渲染门店列表
              this.resetActiveLocalStore()
              this.renderLocalStores(filteredStore)

              return distancesList
            })
            .then((distancesList) => {
              // 地图相关筛选
              distancesList && distancesList.forEach((distanceObj) => {
                if (distanceObj.distance <= 50) {
                  this.$map?.filterStoresById(distanceObj.sn, true)
                } else {
                  this.$map?.filterStoresById(distanceObj.sn, false)
                }
              })
              this.$map?.filterStoresByTypeOrCategory(queryData)
              
              return distancesList
            })
            .then((distancesList) => {
              // 弹窗内门店距离渲染
              this.$storeModal?.renderDistance(distancesList)
            })
        } else {
          // 筛选
          let filteredStore = this.filterStoresByTypeOrCategory(this.originalData, queryData)

          // 排序
          this.sortLocalStores()

          // 渲染门店列表
          this.resetActiveLocalStore()
          this.renderLocalStores(filteredStore)

          // 重置地图样式
          this.$map?.resetStoreIconStyle()
          // 地图相关筛选
          this.$map?.filterStoresByTypeOrCategory(queryData)

          // 弹窗内门店距离渲染
          this.$storeModal?.renderDistance()
        }
      })()
      
      bus.emit(bus.EVENT.GLOBAL_EVENT, {
        event: 'store_locator_search',
      })

      event.preventDefault()
    })

    this.$searchForm?.addEventListener('change', (event) => {
      const $target = event.target
      if ($target !== this.$searchInput) {
        if ($target.getAttribute('name') === 'use_current_location' && $target.checked) {
          this.useCurrentLocation()
        } else {
          this.$searchForm.dispatchEvent(new Event('submit', { bubbles: true }))
        }
      }
    })

    this.$map?.addEventListener('map.use.current.location', () => {
      this.$switchInput.checked = true
      this.$switchInput.dispatchEvent(new Event('change', { bubbles: true }))
    })
  }

  bindStoreListEvent() {
    let $lastStore
    this.$localstoresList?.addEventListener('click', (event) => {
      let $target = event.target
      if (!$target.classList.contains('as-local-store')) {
        $target = $target.closest('.as-local-store')
      }
      $lastStore && $lastStore.classList.remove('active')
      $target.classList.add('active')
      $lastStore = $target
      this.$map?.zoomInStoreIcon($target.dataset.sn)
    })

    this.$map?.addEventListener('map.click.store', () => {
      $lastStore && $lastStore.classList.remove('active')
      $lastStore = null
    })
  }

  useCurrentLocation() {
    this.toggleEditable(true)
          
    ;(async () => {
      this.$map?.askForGeolocation()
        .then((res) => {
          const results = res?.results
          if (results && results.length > 0) {
            this.$searchInput && (this.$searchInput.value = results[0].formatted_address)
            const submitEvent = new Event('submit', { bubbles: true })
            submitEvent.detail = results[0]
            this.$searchForm.dispatchEvent(submitEvent)
          }
        })
        .catch(() => {
          this.$switchInput.checked = false
        })
        .finally(() => {
          this.toggleEditable(false)
        })
    })()
  }

  /**
   * 根据门店类型或分类对门店进行筛选
   * @param {Object} data 门店数据
   * @param {Object} queryData 搜索内容
   * @returns 返回筛选后的门店数据
   */
  filterStoresByTypeOrCategory(data, queryData) {
    const { storetype, category } = queryData
    let filteredResults = this.deepClone(data)

    // 筛选店铺类型
    if (storetype !== '') {
      let storeArr = storetype.split('&&'),storeList = [];
      storeArr.forEach((item,index)=>{
        storeList = [...storeList, ...(filteredResults.filter((data) => data?.storetype === item)
        )]
      }) 
      filteredResults = storeList
    }

    // 筛选商品品类
    if (category !== '') {
      let categoryArr = category.split('&&'),categoryList = [];
      categoryArr.forEach((item,index)=>{
        categoryList = [...categoryList, ...(filteredResults.filter((data) => data?.category === item)
        )]
      }) 
      filteredResults = categoryList
    }

    return filteredResults
  }

  /**
   * 根据门店距离筛选门店
   * @param {Object} data 门店数据
   * @param {Object} distances 门店距离数据
   * @returns 返回筛选后的门店数据
   */
  filterStoresByDistance(data, distances) {
    let tmpData = this.deepClone(data)
    let filteredResults = []

    // 当输入框内容不为空时，插入距离数据
    if (tmpData && distances && distances.length > 0) {
      filteredResults = tmpData.filter((store) => {
        store.distance = distances.find(tmpStore => tmpStore.sn === store.sn).distance
        return store.distance <= 50
      })
    }

    return filteredResults
  }

  /**
   * 深拷贝数据
   * @param {Object} obj JSON数据
   * @returns JSON数据
   */
  deepClone(obj) {
    var _obj = JSON.stringify(obj)
    return JSON.parse(_obj)
  }

  // 取消高亮门店
  resetActiveLocalStore() {
    const $activeStore = this.$localstoresList?.querySelector('.as-local-store')
    $activeStore?.classList.remove('active')

    const sn = $activeStore?.dataset.sn || ''
    this.$map?.zoomOutStoreIcon(sn)
  }

  /**
   * 根据每个门店的sn序号进行展示
   * @param {Array} filteredStore 需要展示的门店数据
   */
  renderLocalStores(filteredStore) {
    if (!filteredStore) return
    let $distance
    if (filteredStore.length <= 0) {
      this.$localStoresWrapper?.classList?.add('empty')
    } else {
      this.$localStoresWrapper?.classList?.remove('empty')
      Array.prototype.forEach.call(this.$localStores, ($store) => {
        const sn = $store.getAttribute('data-sn')
        const tmpStore = filteredStore.find(tmpStore => tmpStore?.sn?.toString() === sn.toString())
        
        // 取消高亮
        $store.classList.remove('active')
        this.$map?.zoomOutStoreIcon($store.dataset.sn)
        
        if (tmpStore) {
          $distance = $store.querySelector('.as-distance')
          if (tmpStore.distance) {
            $distance && ($distance.innerHTML = tmpStore.distance.toLocaleString('en-us', { 'minimumFractionDigits': 2, 'maximumFractionDigits': 2 }))
            $distance?.parentNode?.classList.remove('d-none')
            $store.dataset.distance = tmpStore.distance
          } else {
            $distance?.parentNode?.classList.add('d-none')
          }
          $store.classList.remove('d-none')
        } else {
          $store.classList.add('d-none')
        }
      })
    }
  }

  /**
   * 渲染联想输入列表
   * @param {Object} results 模版渲染所需数据
   */
  renderPredictList(results) {
    const $list = this.$predictList
    if ($list && this.$searchForm && results.length > 0) {
      $list.innerHTML = Helpers.tpl2html('tpl-predict-item', { data: results })
      
      this.togglePredictList(true)
    } else {
      this.togglePredictList(false)
    }
  }

  /**
   * 显示/隐藏联想输入列表
   * @param {Boolean} flag true则展示联想输入列表
   */
  togglePredictList(flag) {
    this.$searchForm?.classList.toggle('predict', flag)
    this.$predictList?.classList.toggle('d-block', flag)
  }
}

new StoreLocator(document.querySelector('.as-store-locator-container'))