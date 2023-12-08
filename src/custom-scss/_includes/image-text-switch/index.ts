import Swiper, { Thumbs, Pagination } from 'swiper'
Swiper.use([Thumbs, Pagination])
const Helpers = require('@scripts/helpers')
const ImageTextSwitch = class {
  $switchWrapper!: NodeListOf<Element>
  $pcFlag!: boolean
  constructor (switchWrapper: NodeListOf<Element>) {
    if (!switchWrapper) return
    this.$switchWrapper = switchWrapper
    this.$pcFlag = Helpers.isPc()
    this.init()
  }

  init (): void {
    if (!this.$pcFlag) {
      this.$switchWrapper.forEach((item) => {
        this.initSwiper(item)
      })
    } else {
      this.$switchWrapper.forEach((item) => {
        this.reasonHoverEvent(item)
      })
    }
  }

  reasonHoverEvent (item: any): void {
    const $cardWrapper = item.querySelector('.as-card-wrapper')
    const $textContentWrapper = item.querySelector('.as-text-content-wrapper')
    const $imgsWrap = item.querySelector('.as-desktop-image-wrap')
    const $reasonWraps = item.querySelectorAll('.as-choose-reason-wrap')
    const imgs = $imgsWrap.querySelectorAll('.as-choose-reason-img')
    const descs = item.querySelectorAll('.as-choose-reason-desc')
    const hideDescs = item.querySelectorAll('.as-hide-choose-reason-desc')
    const $firstDesc = item.querySelector('.as-first-choose-reseon-desc')
    const $firsHidetDesc = item.querySelector('.as-first-hide-choose-reseon-desc')
    if (!$reasonWraps) return
    // 默认给第一个block的正文的高度赋值
    $firstDesc && ($firstDesc.style.height = $firsHidetDesc?.offsetHeight + 'px')
    // pc端切换效果
    $reasonWraps.forEach(($reasonWrap, index) => {
      $reasonWrap.addEventListener('click', () => {
        // 排他
        for (let i = 0; i < $reasonWraps.length; i++) {
          $reasonWraps[i].classList.remove('active')
          imgs[i].classList.remove('active')
          descs[i] && (descs[i].style.height = 0)
        }
        const $desc = $reasonWrap.querySelector('.as-choose-reason-desc')
        const $img = item.querySelectorAll('.as-choose-reason-img')[index]
        const $hideDesc = item.querySelectorAll('.as-hide-choose-reason-desc')[index]
        const descsHeight = $hideDesc?.offsetHeight + 'px'
        $reasonWrap?.classList.add('active')
        $desc && ($desc.style.height = descsHeight)
        $img?.classList.add('active')
        $imgsWrap.style.setProperty('--image-padding-bottom', $reasonWrap.dataset.imageRatio)
      })
    })

    const textContetnHeight = $textContentWrapper?.offsetHeight
    const firstDescsHeight = $firstDesc?.offsetHeight || 0
    const hideDescsHeightArr = []
    // 获取每个block下正文的高度
    for (let j = 0; j < hideDescs.length; j++) {
      hideDescsHeightArr.push(hideDescs[j].offsetHeight)
    }
    // 获取所有block下正文的最大高度
    let MaxHideDescsHeight = 0
    if (hideDescsHeightArr.length > 0) {
      MaxHideDescsHeight = Math.max(...hideDescsHeightArr)
    }
    // 给外层盒子（包含block文案和图片的）一个最小高度
    $cardWrapper && ($cardWrapper.style.minHeight = textContetnHeight + MaxHideDescsHeight - firstDescsHeight + 1 +'px')
  }

  initSwiper (item: any): void {
    const $textSwiper = item.querySelector('.textSwiper')
    const $imgSwiper = item.querySelector('.imgSwiper')
    const $swiperReasonAll = item.querySelectorAll('.as-swiper-reason')
    const $swiperReasonDescAll = item.querySelectorAll('.as-swiper-reason-desc')
    const $hideSwiperReasonDescAll = item.querySelectorAll('.as-hide-swiper-reason-desc')
    const $firstSwiperReasonDesc = item.querySelector('.as-first-swiper-reason-desc')
    const $firstHideSwiperReasonDesc = item.querySelector('.as-first-hide-swiper-reason-desc')

    $firstSwiperReasonDesc && ($firstSwiperReasonDesc.style.height = $firstHideSwiperReasonDesc?.offsetHeight + 'px')
    const textSwiper = new Swiper($textSwiper, {
      allowTouchMove: false
    })
    const imgSwiper = new Swiper($imgSwiper, {
      thumbs: {
        swiper: textSwiper
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true
      },
      on: {
        slideChange: function () {
          for (let num = 0; num < $swiperReasonAll.length; num++) {
            if ($swiperReasonDescAll[num]) {
              $swiperReasonDescAll[num].style.height = 0
            }
          }
          // 给当前正文赋值高度
          $swiperReasonDescAll[this.activeIndex] && ($swiperReasonDescAll[this.activeIndex].style.height = $hideSwiperReasonDescAll[this.activeIndex]?.offsetHeight + 'px')
        }
      }
    })
  }
}
const switchWrapper: NodeListOf<Element> = document.querySelectorAll('.as-image-text-switch-container')
new ImageTextSwitch(switchWrapper)
export default ImageTextSwitch
