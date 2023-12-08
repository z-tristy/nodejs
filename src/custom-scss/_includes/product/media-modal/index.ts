import Swiper, { Navigation, Pagination, Autoplay, EffectFade } from 'swiper'
Swiper.use([Navigation, Pagination, Autoplay, EffectFade])
import { pauseAllMedia } from '@scripts/_utilities'

if (!customElements.get('gallery-modal')) {
  customElements.define('gallery-modal', class galleryModal extends HTMLElement  {
    $insideSwiper: HTMLElement | null
    $currentIndex: Number
    $modalGallerySwiper: any
    constructor() {
      super();
      this.$insideSwiper = this.querySelector('.as-media-swiper-inside')
      this.$modalGallerySwiper
      this.$currentIndex = 0
      this.init()
    }
    init() {
      this.listenModalOpen()
    }
    listenModalOpen() {
      let that = this
      this.addEventListener('show.bs.modal', function(event) {
        that.$currentIndex = Number(event?.relatedTarget?.dataset?.currentIndex)
        if (!that.$modalGallerySwiper) {
          that.initInsideSwiper()
        } else {
          that.updateGalleryIndex()
        }
      })
    }
    initInsideSwiper() {
      let that = this
      let $insideLoop = true
      let $insidePaginationType = 'fraction'
      if (document.querySelector('media-gallery')?.isPc()) {
        $insidePaginationType = 'bullets'
      }
      this.$modalGallerySwiper = this.$insideSwiper && new Swiper(this.$insideSwiper, {
        modules: [Navigation, Pagination],
        spaceBetween: 50,
        effect: "fade",
        loop: $insideLoop,
        // simulateTouch: false,
        navigation: {
          nextEl: this.$insideSwiper?.querySelector('.as-inside-next'),
          prevEl: this.$insideSwiper?.querySelector('.as-inside-prev')
        },
        pagination: {
          el: this.$insideSwiper?.querySelector('.as-inside-pagination'),
          type: $insidePaginationType,
          clickable: true,
        },
        resistanceRatio: 0,
        initialSlide: this.$currentIndex,
        on: {
          slideChange: function(swiper:any) {
            that.dataset.currentIndex = swiper.realIndex
          }
        }
      });
    }
    updateGalleryIndex() {
      this.$modalGallerySwiper && this.$modalGallerySwiper.slideToLoop(this.$currentIndex, 100, false)
    }
  })
}

if (!customElements.get('video-modal')) {
  customElements.define('video-modal', class videoModal extends HTMLElement  {
    $deferredMedia: HTMLElement | null
    constructor() {
      super();
      this.$deferredMedia = this.querySelector('deferred-media')
      this.init()
    }
    init() {
      this.renderModalVideo()
      this.pauseVideo()
    }
    renderModalVideo() {
      this.addEventListener('show.bs.modal', () => {
        this.$deferredMedia && this.$deferredMedia.loadContent(false)
      })
    }
    pauseVideo() {
      this.addEventListener('hidden.bs.modal', () => {
        pauseAllMedia()
      })
    }
  })
}