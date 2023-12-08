/* eslint-disable @typescript-eslint/explicit-function-return-type */
import Swiper, { Navigation, Pagination, Autoplay, EffectFade, Thumbs, FreeMode } from 'swiper'
import { debounce, pauseAllMedia, isMdPc } from '@scripts/_utilities'
Swiper.use([Navigation, Pagination, Autoplay, EffectFade, Thumbs, FreeMode])

if (customElements.get('media-gallery') === undefined) {
  customElements.define('media-gallery', class MediaGallery extends HTMLElement {
    $outsideSwiper: HTMLElement | null
    $insideSwiper: HTMLElement | null
    $thumbnailWrap: HTMLElement | null
    $thumbnailSwiper: HTMLElement | null
    innerSwiper: any
    outerSwiper: any
    galleryThumbnailSwiper: any
    mediaTabsArray: any[]
    $videoRealIndex: number
    thumbnailSlidesPerView: number
    thumbnailSpaceBetween: number
    debounceOnRezie: ((...args: any[]) => void) | undefined
    outWindowWidth: number
    outWindowHeight: number
    isPc: boolean
    direction: 'horizontal' | 'vertical'
    totleDistance: number
    perThumbnailDistance: number
    constructor () {
      super()
      this.$outsideSwiper = this.querySelector('.as-media-swiper-outside')
      this.$insideSwiper = this.querySelector('.as-media-swiper-inside')
      this.$thumbnailWrap = this.querySelector('.as-thumbnail-gallery')
      this.$thumbnailSwiper = this.querySelector('.as-gallery-thumnails-swiper')
      this.mediaTabsArray = []
      this.outWindowWidth = window.outerWidth
      this.outWindowHeight = window.outerHeight
      this.debounceOnRezie = debounce(() => {
        this.outerSwiper?.destroy()
        this.innerSwiper?.destroy()
        this.galleryThumbnailSwiper?.destroy()
        this.init()
      }, 300)

      // 判断是pc端
      this.isPc = isMdPc() === true
      // 缩略图同时显示多少个,默认4个
      this.thumbnailSlidesPerView = 4
      // 缩略图 slides 之间的间距,  8
      this.thumbnailSpaceBetween = 8
      this.direction = this.getDirection()
      // 放大状态下 缩略图的总长度
      this.totleDistance = 464
      this.perThumbnailDistance = 64
      this.getTotleDistanceAndPerThumbnailDistance()

      // window.addEventListener('resize', this.debounceOnRezie.bind(this))
      // 这里由于真机有的浏览器会把滑动屏幕也判定为resize事件，所以做了一个屏幕大小的处理
      window.addEventListener('resize', () => {
        if (this.outWindowWidth !== window.outerWidth || this.outWindowHeight !== window.outerHeight) {
          this.outWindowWidth = window.outerWidth
          this.outWindowHeight = window.outerHeight
          this.debounceOnRezie?.bind(this)
        }
      })
      this.$videoRealIndex = 1
      this.init()
    }

    init () {
      this.getMediaTab()
      this.initThumbnailSwiper()
      this.initInsideSwiper()
      this.initOutsideSwiper()
      this.listenModalClose()
      // this.cancle3DTouchMove()
    }

    //  3d 模型的转动和 swpier 的滑动冲突了
    // 取消在 3d 模型的容器上的 touchmove 事件
    // cancle3DTouchMove () {
    //   const $3d = document.querySelectorAll('.as-swiper-3d')
    //   $3d.forEach((event) => {
    //     event.addEventListener('touchstart', (e) => {
    //       e.preventDefault()
    //     }, { passive: false })
    //     event.addEventListener('touchmove', (e) => {
    //       e.preventDefault()
    //     }, { passive: false })
    //   })
    // }

    update () {
      this.outerSwiper?.destroy()
      this.innerSwiper?.destroy()
      this.galleryThumbnailSwiper?.destroy()
      this.init()
    }

    /**
     * 当出现视频和3d 模型时, 获取这部分 tab 代码
    */
    getMediaTab () {
      const $mediaTabsTemplate = this.querySelectorAll('.as-media-tab-template')
      $mediaTabsTemplate.length > 0 && this.mediaTabsArray.push(Array.from($mediaTabsTemplate).map((item) => {
        return ({
          content: item.innerHTML.trim()
        })
      }))
    }

    /**
     * 意外bug, media tab 第一次渲染时, 会先使最后一个 tab active , 再使第一个 tab active; 视觉上能感知到变化
     * 用监听器监听, 达到条件使 去掉 opacity-0
     * @params $paginationEle 被监听的元素
    */
    mutationObservePaginationEle ($paginationEle: HTMLElement) {
      const callback = (mutationsList: any) => {
        for (const mutation of mutationsList) {
          if (mutation.type === 'childList') {
            if (mutation.addedNodes.length > 0 && (Boolean((mutation.addedNodes[0]?.classList.value.includes('swiper-pagination-bullet-active'))))) {
              $paginationEle?.classList.remove('opacity-0')
              // 由于动画时间的缘故, 总是能在视觉上看到变化, 所以动画时间单独加上
              const timer = setTimeout(() => {
                [...mutation.addedNodes].map($val => {
                  $val.classList.add('swiper-pagination-bullet-duration')
                })
                clearTimeout(timer)
              }, 300)
              observer.disconnect()
            }
          }
        }
      }
      const observer = new MutationObserver(callback)
      observer.observe($paginationEle, {
        childList: true
      })
    }

    initOutsideSwiper () {
      if (this.$outsideSwiper === null) return
      const $paginationEle: HTMLElement | null = this.$outsideSwiper.querySelector('.as-outside-pagination')

      if ($paginationEle !== null) {
        this.mutationObservePaginationEle($paginationEle)
      }

      this.outerSwiper = new Swiper(this.$outsideSwiper, {
        modules: [Navigation, Pagination, EffectFade],
        loop: false,
        simulateTouch: false,
        effect: (isMdPc() ?? false) ? 'fade' : 'slide',
        fadeEffect: {
          crossFade: true
        },
        pagination: {
          el: $paginationEle,
          type: 'bullets',
          clickable: true,
          renderBullet: index => {
            return this.mediaTabsArray[0][index]?.content
          }
        },
        on: {
          slideChange: (swiper: any) => {
            pauseAllMedia()
            // 判断不是图片
            // 当不是图片时 隐藏缩略图, 因为缩略图会占位, 让视频下面留出一个 64 + mt-4 的空白; 并且配合使用 d-none visually-hidden 来判断
            let hiddenClass = 'visually-hidden'
            if (this.isPc && this.direction === 'vertical') hiddenClass = 'd-none'
            if (swiper.realIndex !== 0) {
              this.loadActiveMedia(swiper.realIndex)
              this.$thumbnailWrap?.classList.add(hiddenClass)
            } else {
              this.$thumbnailWrap?.classList.remove(hiddenClass)
            }
          }
        }
      })
    }

    loadActiveMedia (realIndex: number) {
      if (this.$outsideSwiper === null) return
      const deferredMedias = this.$outsideSwiper.querySelectorAll(`.as-outer-slide[data-swiper-slide-index="${realIndex}"]`)
      // 目前来看 deferredMedias.length == 0
      if (deferredMedias.length <= 0) {
        const deferredMedia: Element | null = this.$outsideSwiper.querySelectorAll('.as-outer-slide')[realIndex]
        this.activeMedia(deferredMedia)
      } else if (deferredMedias.length > 0) {
        deferredMedias?.forEach((deferredMedia) => {
          this.activeMedia(deferredMedia)
        })
      }
    }

    /**
     * @description 点击播放video
    */
    activeMedia (media: Element) {
      if (media === null) return
      const deferredMedia: HTMLElement | null = media.querySelector('deferred-media')
      if (deferredMedia === null) return
      if (deferredMedia.dataset.type === 'video' && (isMdPc() === false)) return
      const $videoPreview = media.querySelector('video-preview')
      deferredMedia.loadContent(false)
      // 由于添加了自动播放, 这里先暂停, safari 不会播放, 但是chrome 会自动播放
      // 另一种改法是 将 loadContent 放在 click 事件内部
      const $video: any = deferredMedia.querySelector('video')
      if ($video === null) return
      $video.pause()
      if ($videoPreview !== null) {
        media.querySelector('.as-video-play')?.addEventListener('click', () => {
          $video.play()
          media.querySelector('.as-video-poster')?.remove()
        })
      }
    }

    /**
     * 初始化缩略图
    */
    initThumbnailSwiper () {
      if (this.$thumbnailSwiper === null) return

      this.thumbnailSlidesPerView = this.computedThumbnailNumber()

      this.galleryThumbnailSwiper = new Swiper(this.$thumbnailSwiper, {
        modules: [Navigation, Thumbs, FreeMode],
        slidesPerView: this.thumbnailSlidesPerView,
        spaceBetween: this.thumbnailSpaceBetween,
        freeMode: true,
        watchSlidesProgress: true,
        direction: this.direction,
        navigation: {
          nextEl: this.$thumbnailWrap?.querySelector('.as-inside-next') as HTMLElement,
          prevEl: this.$thumbnailWrap?.querySelector('.as-inside-prev') as HTMLElement
        },
        centerInsufficientSlides: true,
        slideToClickedSlide: true,
        on: {
          afterInit: () => {
            this.$thumbnailWrap?.classList.remove('opacity-0')
          }
        }
      })
    }

    getDirection () {
      if (this.isPc && this.$thumbnailWrap?.dataset?.direction === 'vertical') return 'vertical'
      return 'horizontal'
    }

    /**
     * 获取产品轮播图片的总距离(高 or 宽)
    */
    getTotleDistanceAndPerThumbnailDistance () {
      const $insideSwiper: HTMLElement | null = document.querySelector('.as-gallery-wrapper:not(.d-none) .as-media-swiper-inside')
      if ($insideSwiper === null) return
      const $thumbnailSwiperSilder: HTMLElement | null | undefined = document.querySelector('.as-gallery-wrapper:not(.d-none)')?.querySelector('.as-gallery-thumnails-swiper')?.querySelector('.swiper-slide')
      if ($thumbnailSwiperSilder === null || $thumbnailSwiperSilder === undefined) return

      if (this.direction === 'vertical') {
        // 获得缩略图的可用总距离, 求高度时, 目标变的更精确了
        this.totleDistance = $insideSwiper.offsetHeight
        // 获得每个缩略图的长度(高度 or 宽度)
        this.perThumbnailDistance = $thumbnailSwiperSilder.offsetHeight
      } else {
        // 获得缩略图的可用总距离
        this.totleDistance = $insideSwiper.offsetWidth
        // 获得每个缩略图的长度(高度 or 宽度)
        this.perThumbnailDistance = $thumbnailSwiperSilder.offsetWidth
      }
    }

    /**
     * @description 图片宽度受到配置、屏幕宽度的变化而变化; 需要计算图片宽度来处理同时显示多少个 thumbnail image
     * 上一个版本 thumbnail size 写死为6个, 并且左右箭头的判断为 当判断图片数量大于 6 个时, 不加载
     * 当前版本判断依据为: perThumbnailDistance * thumbnailSize + perThumbnailSpace * (thumbnailSize - 1) <= totleWidth
     * !!!!!
     * 注意的是, 每次只有一个thumbnail display, 其他都是none, 所以其他的长度宽度获取都是 0
     * 但是 totleDistance、perThumbnailDistance 是固定不会变的
     * !!!!!
     * @param direction 轮播方向, 用来判断计算 width or height
    */
    computedThumbnailNumber (): number {
      if (this.$thumbnailSwiper === null || this.$thumbnailWrap === null || this.$insideSwiper === null) return this.thumbnailSlidesPerView

      const direction = this.direction
      // 获得缩略图的数量
      const thumbnailSizeString = this.$thumbnailSwiper.dataset?.size
      const thumbnailSize: number = thumbnailSizeString === undefined ? 1 : Number(thumbnailSizeString)

      const $thumbnailSwiperSilder: HTMLElement | null = this.$thumbnailSwiper.querySelector('.swiper-slide')
      if ($thumbnailSwiperSilder === null) return this.thumbnailSlidesPerView

      // let totleDistance,
      //   perThumbnailDistance

      const perThumbnailSpace = this.thumbnailSpaceBetween

      const totleDistance = this.totleDistance
      const perThumbnailDistance = this.perThumbnailDistance
      // 判断是不是需要 arrow icon
      const preIconOffset = 32
      let prevAndNextIconWidth = preIconOffset * 2
      const $insideNext: HTMLElement | null = this.$thumbnailWrap.querySelector('.as-inside-next')
      const $insidePrev: HTMLElement | null = this.$thumbnailWrap.querySelector('.as-inside-prev')
      if (perThumbnailDistance * thumbnailSize + perThumbnailSpace * (thumbnailSize - 1) <= totleDistance) {
        prevAndNextIconWidth = 0
        $insideNext?.classList.add('visually-hidden')
        $insidePrev?.classList.add('visually-hidden')
      } else {
        $insideNext?.classList.remove('visually-hidden')
        $insidePrev?.classList.remove('visually-hidden')
        // 当缩略图在左侧, 并且 icon 存在时, 需要动态添加一个向上的 margin
        // 由于 this.$thumbnailWrap 上添加了 mt-md-0, 故在 this.$thumbnailSwiper 上面添加
        if (direction === 'vertical') {
          this.$thumbnailSwiper.style.marginTop = `${preIconOffset}px`
        }
      }

      // 计算公式
      // x * perThumbnailDistance + (x - 1) * perThumbnailSpace + prevAndNextIconWidth <= totleWidth
      let thumbnailNum = (totleDistance + perThumbnailSpace - prevAndNextIconWidth) / (perThumbnailDistance + perThumbnailSpace)
      thumbnailNum = Math.floor(thumbnailNum)
      // 数量最大为缩略图的size
      thumbnailNum = thumbnailNum >= thumbnailSize ? thumbnailSize : thumbnailNum

      if (direction === 'vertical') {
        this.$thumbnailWrap.style.height = `${thumbnailNum * perThumbnailDistance + (thumbnailNum - 1) * perThumbnailSpace}px`
        this.$thumbnailSwiper.style.height = `${thumbnailNum * perThumbnailDistance + (thumbnailNum - 1) * perThumbnailSpace}px`
      } else {
        this.$thumbnailWrap.style.width = `${thumbnailNum * perThumbnailDistance + (thumbnailNum - 1) * perThumbnailSpace}px`
      }
      return thumbnailNum
    }

    initInsideSwiper () {
      // const thumbnails = this.$insideSwiper?.dataset?.thumbnails
      // 当配置了 thumbs 时, pagination 会失效

      // pc端不会出现 pagination
      let pagination: object | boolean = false
      // pc/mob 端选择了 hide thumbnail 时, thumbs = undefined
      let thumbs: object | undefined = {
        swiper: this.galleryThumbnailSwiper,
        slideThumbActiveClass: 'swiper-gallery-thumb-active'
      }

      if ((this.isPc && this.$thumbnailWrap?.dataset?.pcShow === 'false') || (!this.isPc && this.$thumbnailWrap?.dataset?.mobShow === 'false')) {
        pagination = {
          el: this.$insideSwiper?.querySelector('.as-inside-pagination') as HTMLElement,
          type: 'bullets',
          clickable: true
        }
        thumbs = undefined
      }

      this.innerSwiper = (this.$insideSwiper !== null) && new Swiper(this.$insideSwiper, {
        modules: [Navigation, Pagination, Thumbs, EffectFade],
        loop: this.isPc,
        simulateTouch: false,
        navigation: {
          nextEl: this.$insideSwiper?.querySelector('.as-inside-next') as HTMLElement,
          prevEl: this.$insideSwiper?.querySelector('.as-inside-prev') as HTMLElement
        },
        pagination,
        nested: true,
        resistanceRatio: 0,
        touchMoveStopPropagation: true,
        observeParents: true,
        effect: this.isPc ? 'fade' : 'slide',
        fadeEffect: {
          crossFade: true
        },
        thumbs,
        on: {
          slideChangeTransitionEnd: (swiper: any) => {
            // 初始化时realIndex计算错误，需要重新计算realIndex的值
            if (!(Boolean(this.innerSwiper))) {
              swiper.realIndex = this.getInitRealIndex(this.$insideSwiper, swiper.activeIndex)
            }
            this.changeModalOpenerCurrentIndex(swiper.realIndex)
          }
        }
      })
    }

    /**
     * 修改 modal-opener 自定义属性
    */
    changeModalOpenerCurrentIndex (index: any) {
      const $modalOpeners = this.$insideSwiper?.querySelectorAll('modal-opener')
      $modalOpeners?.forEach((modalOpener: any) => {
        const $trigger = modalOpener?.querySelector('.as-modal-trigger')
        $trigger?.setAttribute('data-current-index', index)
      })
    }

    getInitRealIndex (swiper: any, activeIndex: any) {
      return (Number(swiper?.querySelectorAll('.swiper-slide')[activeIndex].dataset.swiperSlideIndex))
    }

    listenModalClose () {
      const galleryModal: HTMLElement | null = document.querySelector(`gallery-modal#as-gallery-modal-${this.dataset.variantId}`)
      galleryModal?.addEventListener('hide.bs.modal', () => {
        const currentIndex = Number(galleryModal?.dataset?.currentIndex)

        this.innerSwiper.slideToLoop(currentIndex, 0, false)
        this.changeModalOpenerCurrentIndex(currentIndex)
      })
    }
  })
}

if (customElements.get('gallery-modal') === undefined) {
  customElements.define('gallery-modal', class galleryModal extends HTMLElement {
    $insideSwiper: HTMLElement | null
    $thumbnailWrap: HTMLElement | null
    $thumbnailSwiper: HTMLElement | null
    currentIndex: number
    modalGallerySwiper: any
    modalGalleryThumbnailSwiper: any
    isPc: boolean
    constructor () {
      super()
      this.$insideSwiper = this.querySelector('.as-media-swiper-inside')
      this.$thumbnailWrap = this.querySelector('.as-thumbnail-gallery')
      this.$thumbnailSwiper = this.$thumbnailWrap?.querySelector('.as-gallery-modal-thumnails-swiper') ?? null
      this.currentIndex = 1
      // 判断是pc端
      this.isPc = isMdPc() === true
      this.init()
    }

    init () {
      this.listenModalOpen()
    }

    listenModalOpen () {
      this.addEventListener('show.bs.modal', event => {
        this.currentIndex = Number(event?.relatedTarget?.dataset?.currentIndex)
        // that.$currentIndex = Number(event?.relatedTarget?.dataset?.currentIndex)
        if (!(Boolean(this.modalGallerySwiper))) {
          this.initThumbnailSwiper()
          this.initInsideSwiper()
        } else {
          this.updateGalleryIndex()
        }
      })
    }

    initThumbnailSwiper () {
      if (document.querySelector('media-gallery') !== undefined && (isMdPc() ?? false)) {
        this.modalGalleryThumbnailSwiper = (this.$thumbnailSwiper !== null) && new Swiper(this.$thumbnailSwiper, {
          modules: [Navigation, Thumbs, FreeMode],
          slidesPerView: 6,
          spaceBetween: 16,
          freeMode: true,
          watchSlidesProgress: true,
          // watchSlidesVisibility: true,
          navigation: {
            nextEl: this.$thumbnailWrap?.querySelector('.as-inside-next') as HTMLElement,
            prevEl: this.$thumbnailWrap?.querySelector('.as-inside-prev') as HTMLElement
          },
          centerInsufficientSlides: true,
          on: {
            afterInit: () => {
              this.$thumbnailWrap?.classList.remove('opacity-0')
            }
          }
        })
      }
    }

    initInsideSwiper () {
      const that = this
      let insideLoop = true
      const swiperSlideNumber: Number = Number(this.dataset?.swiperNumber)
      if (swiperSlideNumber < 2) insideLoop = false

      let pagination: object | boolean = false
      if (!this.isPc) {
        pagination = {
          el: this.$insideSwiper?.querySelector('.as-inside-pagination'),
          type: 'fraction',
          clickable: true
        }
      }

      this.modalGallerySwiper = this.$insideSwiper !== null && new Swiper(this.$insideSwiper, {
        modules: [Navigation, Pagination, Thumbs, EffectFade],
        loop: insideLoop,
        simulateTouch: false,
        resistanceRatio: 0,
        effect: this.isPc ? 'fade' : 'slide',
        fadeEffect: {
          crossFade: true
        },
        initialSlide: this.currentIndex,
        preventClicksPropagation: false,
        loopedSlides: 7,
        preventClicks: false,
        observer: true,
        observeParents: true,
        navigation: {
          nextEl: this.$insideSwiper?.querySelector('.as-inside-next'),
          prevEl: this.$insideSwiper?.querySelector('.as-inside-prev')
        },
        pagination,
        thumbs: {
          swiper: this.modalGalleryThumbnailSwiper,
          slideThumbActiveClass: 'swiper-gallery-thumb-active'
        },
        on: {
          afterInit: function (swiper: any) {
            // 初始化时realIndex计算错误，需要重新计算realIndex的值
            swiper.realIndex = that.getInitRealIndex(that.$insideSwiper, swiper.activeIndex)
            that.dataset.currentIndex = swiper.realIndex
          },
          slideChange: function (swiper: any) {
            // 每次弹窗出现都会触发 slidechange 方法, 需要重新计算realIndex的值
            swiper.realIndex = that.getInitRealIndex(that.$insideSwiper, swiper.activeIndex)
            that.dataset.currentIndex = swiper.realIndex
          }
        }
      })
    }

    getInitRealIndex (swiper: any, activeIndex: any) {
      return (Number(swiper?.querySelectorAll('.swiper-slide')[activeIndex].dataset.swiperSlideIndex))
    }

    updateGalleryIndex () {
      // slideToLoop需要三个参数。第三个参数runCallbacks默认为true,会产生transition事件,此时可能引起一些奇怪的bug,比如navigation按钮无法触发切换轮播
      this.modalGallerySwiper?.slideToLoop(this.currentIndex, 0, false)
    }
  })
}

if (customElements.get('video-modal') === undefined) {
  customElements.define('video-modal', class videoModal extends HTMLElement {
    $deferredMedia: HTMLElement | null
    constructor () {
      super()
      this.$deferredMedia = this.querySelector('deferred-media')
      this.init()
    }

    init () {
      this.renderModalVideo()
      this.pauseVideo()
    }

    renderModalVideo () {
      this.addEventListener('show.bs.modal', () => {
        this.$deferredMedia?.loadContent(false)
      })
    }

    pauseVideo () {
      this.addEventListener('hidden.bs.modal', () => {
        pauseAllMedia()
      })
    }
  })
}
