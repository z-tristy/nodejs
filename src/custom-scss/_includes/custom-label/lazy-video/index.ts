import { isMdPc } from '@scripts/_utilities'

/**
 * 没有处理 resize :
 * 1、在pc端切换到移动端时不会自动切换到不同断点的视频
 * 2、移动端页头 url 输入栏的显影对 rootMagin 的影响并不大
 *
 * 在 hero-video/_index.ts 中被引入
*/
class LazyVideo extends HTMLElement {
  $video: HTMLVideoElement | null
  observer: any
  isMdPc: boolean = isMdPc()
  cH: number = document.documentElement.clientHeight
  RATIO: number = 0.7
  constructor () {
    super()
    this.$video = this.querySelector('.as-video')
    if (this.$video === null) return

    this.setIntersectionObserve()
  }

  /**
   * 设置 intersectionObserve 监听 video 是否可见
   * 可见范围由 rootMargin 设定
   */
  setIntersectionObserve (): void {
    this.observer = new IntersectionObserver(this.callback.bind(this), {
      root: null,
      rootMargin: `${this.cH * this.RATIO}px 0px ${this.cH * this.RATIO}px 0px`
    })
    this.observer.observe(this.$video)
  }

  callback (entries: IntersectionObserverEntry[]): void {
    entries.forEach((entry: IntersectionObserverEntry) => {
      if (Boolean(entry.isIntersecting)) {
        this.lazyLoadingVideo()
        this.observer.disconnect()
      }
    })
  }

  /**
   * 动态加载 视频
   */
  lazyLoadingVideo (): void {
    if (this.$video === null) return
    if (this.isMdPc) {
      this.$video.src = this.$video.dataset?.pcVideo as string
    } else {
      this.$video.src = this.$video.dataset?.mobVideo as string
    }
  }
}

if (customElements.get('lazy-video') === undefined) {
  customElements.define('lazy-video', LazyVideo)
}
