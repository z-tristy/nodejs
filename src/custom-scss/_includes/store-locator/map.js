const bus = require('@scripts/events')
const Helpers = require('@scripts/helpers')

class GoogleMap extends HTMLElement {
  constructor() {
    super()
  }

  init(stores) {
    this.stores = stores
    if (!window.google || !stores || !stores.features) return
    
    this.$map = this.querySelector('.as-map')
    const defaultLat = parseFloat(this.querySelector('.as-default-latitude').value) || -1
    const defaultLng = parseFloat(this.querySelector('.as-default-longitude').value) || -1

    if (!this.$map || defaultLat === -1 || defaultLng === -1) return

    // 默认地图中心经纬度，取第一个门店数据
    this.defaultPosition = {
      lat: defaultLat,
      lng: defaultLng,
    }
    // 默认放大倍数
    this.defaultZoom = 11
    this.currentPosMarker
    this.activeFeature
    this.lastFeature
    this.activeInfoWindow

    const mapOptions = {
      minZoom: 3,
      zoom: this.defaultZoom,
      center: this.defaultPosition,
      fullscreenControl: false,
      mapTypeControl: false,
      streetViewControl: false,
      gestureHandling: 'greedy',
      // styles: mapStyle,
      restriction: {
        latLngBounds: {
          east: 180,
          south: -85,
          west: -180,
          north: 85,
        },
        strictBounds: false,
      },
    }

    // Define the custom marker icons, using the store's "category".
    const $initLocatorSvgDefault = this.querySelector('.as-store-marker-default')
    const initLocatorSvgDefault = $initLocatorSvgDefault.src
    this.defaultStyleOptions = {
      icon: {
        url: initLocatorSvgDefault, 
        scaledSize: new google.maps.Size(32, 32),
      },
      zIndex: 1,
      visible: true,
    }
    const $initLocatorSvg = this.querySelector('.as-store-marker')
    const initLocatorSvg = $initLocatorSvg.src
    // 放大门店icon并调高层级
    this.activeStyleOptions = {
      icon: {
        url: initLocatorSvg,
        scaledSize: new google.maps.Size(56, 56),
      },
      zIndex: 2,
      visible: true,
    }

    // 门店缩小为圆点
    const $smLocatorSvg = this.querySelector('.as-store-marker-sm')
    const smLocatorSvg = $smLocatorSvg.src
    this.smStyleOptions = {
      icon: {
        url: smLocatorSvg,
        scaledSize: new google.maps.Size(12, 12),
      },
      zIndex: 1,
      visible: true,
    }

    this.map = new google.maps.Map(this.$map, mapOptions)

    this.loadStores(stores)
    this.bindMapEvent()
    
    this.drawCustomControls()
  }

  loadStores() {
    const map = this.map

    // Load the stores GeoJSON onto the map.
    map.data.addGeoJson(this.stores, {idPropertyName: 'sn'})
    map.data.setStyle(() => {
      return this.smStyleOptions
    })

    const bounds = new google.maps.LatLngBounds()
    map.data.forEach((feature) => {
      feature.setProperty('visible', true)
      bounds.extend(feature.getGeometry().get())
    })
    map.fitBounds(bounds)
  }

  bindMapEvent() {
    const map = this.map

    // 初始化时调用fitBounds方法后，地图有可能缩放，后续用户操作默认放大倍数可能需要重置
    let firstInit = true
    google.maps.event.addListener(map, 'zoom_changed', () => {
      const currentZoom = map.getZoom()
      
      if (firstInit) {
        firstInit = false
        if (currentZoom >= this.defaultZoom) {
          this.defaultZoom = currentZoom
        }
      }

      map.data.forEach((feature) => {
        if (this.activeFeature && feature.getId() === this.activeFeature.getId()) return
        const visible = feature.getProperty('visible')
        if (visible) {
          this.toggleStoreIcon(feature)
        }
      })
    })

    // Show the information for a store when its marker is clicked.
    map.data.addListener('click', (event) => {
      this.activeFeature = event.feature
      this.zoomInStoreIcon()

      // 判断是否为桌面端或Tablet
      if (!Helpers.checkIsMobile()) {
        this.renderStoreInfoWindow(event.feature)
      }
      bus.emit('map.click.store', event.feature.getId(), this)
    })
  }

  // 地图不同放大倍数，门店icon展示不同
  toggleStoreIcon(feature) {
    const currentZoom = this.map.getZoom()
    if (currentZoom >= 7) { 
      this.map.data.overrideStyle(feature, this.defaultStyleOptions) 
    } else {
      this.map.data.overrideStyle(feature, this.smStyleOptions)
    }
  }

  /**
   * 地图上对应门店打开InfoWindow，用于介绍门店信息
   * @param {Object} feature google.maps.Data.Feature对象
   */
  renderStoreInfoWindow(feature) {
    const distancehtml = feature.getProperty('distance')?.toLocaleString('en-us', { 'minimumFractionDigits': 2, 'maximumFractionDigits': 2 }) || ''
    const position = feature.getGeometry().get()
    const contactnos = feature.getProperty('contactno')
    const contacthtml = contactnos !== undefined ? (contactnos.toString().indexOf(',') > -1 ? contactnos.split(',').map((contactno) => {
      return `<a data-id="tel" href="tel:${contactno}">${contactno}</a>`
    }).join(', ') : `<a data-id="tel" href="tel:${contactnos}">${contactnos}</a>`) : ''

    let data = {
      distancehtml,
      storetype: feature.getProperty('storetype') || '',
      category: feature.getProperty('category') || '',
      aspname: feature.getProperty('aspname') || '',
      address: feature.getProperty('address') || '',
      city: feature.getProperty('city') || '',
      province: feature.getProperty('province') || '',
      latitude: position.lat() || '',
      longitude: position.lng() || '',
      workinghours: feature.getProperty('workinghours') || '',
      closedon: feature.getProperty('closedon') || '',
      contacthtml,
    }
    const content = Helpers.tpl2html('tpl-store-content', { data: data })
    const infoWindow = new google.maps.InfoWindow({
      maxWidth: 395,
      minwidth: 395,
    })
    infoWindow.setContent(content)
    infoWindow.setPosition(position)
    infoWindow.setOptions({pixelOffset: new google.maps.Size(0, -59)})
    infoWindow.open(this.map)
    infoWindow.addListener('closeclick', () => {
      this.zoomOutStoreIcon()
    })
    this.activeInfoWindow = infoWindow
  }

  // 缩小门店icon
  zoomOutStoreIcon() {
    this.activeFeature = null
    this.toggleStoreIcon(this.lastFeature)
    this.lastFeature = this.activeFeature
    this.activeInfoWindow && this.activeInfoWindow.close()
  }

  /**
   * 放大门店icon
   * @param {String} id 门店sn
   */
  zoomInStoreIcon(id) {
    if (id) {
      this.activeFeature = this.map.data.getFeatureById(id)
      this.map.setCenter(this.activeFeature.getGeometry().get())
      this.map.setZoom(this.defaultZoom)
    }
    this.toggleStoreIcon(this.lastFeature)
    this.activeFeature && this.map.data.overrideStyle(this.activeFeature, this.activeStyleOptions)
    this.lastFeature = this.activeFeature
    this.activeInfoWindow && this.activeInfoWindow.close()
  }

  /**
   * 调用AutocompleteService获取当前搜索内容的联想输入
   * @param {String} query 搜索内容
   * @returns 
   */
  getPredictList(query) {
    return new google.maps.places.AutocompleteService()
      .getPlacePredictions({
        input: query
      })
  }

  getDetailsByQuery(query) {
    return new Promise((resolve) => {
      new google.maps.places.PlacesService(this.map)
        .findPlaceFromQuery({
          fields: ['formatted_address', 'geometry', 'name', 'place_id'],
          query: query
        }, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            if (results && results.length > 0) {
              resolve(results[0])
            } else {
              resolve(null)
            }
          } else {
            resolve(null)
          }
        })
    })
  }

  /**
   * 以输入的地址为中心点，计算线下门店距离该中心点的距离
   * @param {String} query 需要搜索的地址
   * @param {Object} placeInfo GeocoderGeometry对象（https://developers.google.com/maps/documentation/javascript/reference/geocoder#GeocoderGeometry）
   * @returns [{sn, distance},{}]
   */
  calculateDistances(query, placeInfo) {
    this.activeInfoWindow && this.activeInfoWindow.close()
    return (async () => {
      let distancesList = []
      let result

      if (placeInfo) {
        result = placeInfo
      } else {
        result = await this.getDetailsByQuery(query)
      }
      if (result) {
        this.setPositionByLatLng(result.geometry.location)
    
        this.map.data.forEach((feature) => {
          const sn = feature.getProperty('sn')
          const storeloc = feature.getGeometry().get()
          // 单位：m换算成km
          const distance = google.maps.geometry.spherical.computeDistanceBetween(result.geometry.location, storeloc) * 0.001

          feature.setProperty('distance', distance)
    
          distancesList.push({
            sn,
            distance: distance
          })
        })
      }
      return distancesList
    })()
  }

  /**
   * 控制地图上的门店图标的显示/隐藏
   * @param {Number} id 唯一标识符sn
   * @param {Boolean} flag true则显示Store Icon
   */
  filterStoresById(id, flag) {
    if (id) {
      const feature = this.map.data.getFeatureById(id)
      this.map.data.overrideStyle(feature, {
        visible: flag,
      })
      feature.setProperty('visible', flag)
    }
  }

  filterStoresByTypeOrCategory(queryData) {
    const { storetype, category } = queryData
    let selectList = []
    if (storetype !== '' || category !== '') {
      const storetypeArr = storetype.split('&&');
      const categoryArr = category.split('&&');
      this.map.data.forEach((feature) => {
        const id = feature.getId()
        const tmpstoretype = feature.getProperty('storetype') || ''
        const tmpcategory = feature.getProperty('category') || ''
        for (let i = 0; i <= storetypeArr.length-1; i++) {
          for(let j = 0; j <= categoryArr.length-1; j++) {
            if (storetypeArr[i] !== '' && categoryArr[j] === '' && tmpstoretype === storetypeArr[i]) {
              selectList.push(id)
            } else if (storetypeArr[i] === '' && categoryArr[j] !== '' && tmpcategory === categoryArr[j]) {
              selectList.push(id)
            } else if (storetypeArr[i] !== '' && categoryArr[j] !== '' && tmpstoretype === storetypeArr[i] && tmpcategory === categoryArr[j]) {
              selectList.push(id)
            }
          }
        }
      })
      this.map.data.forEach((ele)=>{
        const id = ele.getId()
        if(selectList.indexOf(id) > -1){
          this.filterStoresById(id, true)
        }else{
          this.filterStoresById(id, false)
        }
      })
    }
  }

  resetStoreIconStyle() {
    this.map.setCenter(this.defaultPosition)
    this.map.setZoom(this.defaultZoom)

    const bounds = new google.maps.LatLngBounds()
    this.map.data.forEach((feature) => {
      feature.setProperty('distance', '')
      feature.setProperty('visible', true)
      this.toggleStoreIcon(feature)
      bounds.extend(feature.getGeometry().get())
    })
    this.map.fitBounds(bounds)

    // 去除地图上的Maker
    this.currentPosMarker && this.currentPosMarker.setMap(null)

    this.activeInfoWindow && this.activeInfoWindow.close()
  }

  drawCustomControls() {
    const $currPosIcon = this.querySelector('.as-position-control')
    $currPosIcon.addEventListener('click', () => {
      bus.emit('map.use.current.location', null, this)
    })
    this.map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push($currPosIcon)
  }

  /**
   * 根据经纬度设置位置
   * @param {Object} pos 经纬度，如{ lat: xxx, lng: xxx }
   */
  setPositionByLatLng(pos) {
    if (!pos) return
    const map = this.map

    // 去除地图上的Maker
    this.currentPosMarker && this.currentPosMarker.setMap(null)
    this.currentPosMarker = null

    var marker = new google.maps.Marker({
      position: pos,
      map: map,
      icon: this.currentLocator
    })
    
    // 将新的Maker定位到地图上
    marker.setMap(map)
    this.currentPosMarker = marker
    
    map.setCenter(pos)
    map.setZoom(this.defaultZoom)
  }

  /**
   * 借助Html5 Geolocation获取当前位置
   * https://developers.google.com/maps/documentation/javascript/examples/map-geolocation
   * @returns 返回Promise对象
   */
  askForGeolocation() {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          var pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          resolve(pos)
        }, function (error) {
          console.error(error.message)
          reject()
        }, {
          timeout: 5000
        })
      } else {
        // 浏览器不支持Html5 Geolocation
        console.error('Do not support navigator.geolocation')
        reject()
      }
    })
    .then((location) => {
      return new google.maps.Geocoder().geocode({
        location
      })
    })
  }
}

if (!customElements.get('google-map')) {
  customElements.define('google-map', GoogleMap)
}