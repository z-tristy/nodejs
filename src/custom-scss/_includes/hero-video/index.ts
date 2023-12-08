
import { isMdPc } from '@scripts/_utilities'
import '@sections/custom-label/lazy-video'

const HeroVideo = class {
  $parent: HTMLElement
  loading: boolean = false
  $mdFullScreen: HTMLElement | null
  $fullScreen: HTMLElement | null
  isMdPc: boolean = isMdPc()
  constructor ($parent: HTMLElement) {
    this.$parent = $parent
    this.$fullScreen = this.$parent.querySelector('.as-full-screen')
    this.$mdFullScreen = this.$parent.querySelector('.as-md-full-screen')
  }

  init (): void {
    this.initVideoPlay()
    this.initFullScreen()
  }

  /**
   * 全屏时 需要计算 header group 的高度, 并重新设定 video 的高度
   * 只有一种情况需要做这种判断, 1、该 section 是 main 下面的第一个section
  */
  initFullScreen (): void {
    const isCutNavHeight: string | undefined = this.$parent.dataset?.cutNavHeight
    if (isCutNavHeight === undefined) return

    const fullHeight: number = window.innerHeight
    const $main: HTMLElement | null = document.querySelector('#main-content')
    if ($main === null) return
    const mainHeight = fullHeight - $main.offsetTop
    if (this.$fullScreen !== null && !this.isMdPc) {
      this.$fullScreen.style.setProperty('--calculate-height', `${mainHeight}px`)
    }
    if (this.$mdFullScreen !== null && this.isMdPc) {
      this.$mdFullScreen.style.setProperty('--calculate-height', `${mainHeight}px`)
    }
  }

  /**
   * 初始化mp4视频播放
  */
  initVideoPlay (): void {
    const $video: HTMLVideoElement | null = this.$parent.querySelector('.as-video')
    const $videoControl: HTMLElement | null = this.$parent.querySelector('.as-video-control')
    if ($video === null) return
    if ($videoControl === null) return

    $videoControl.addEventListener('click', () => {
      if ($video.paused) {
        void $video.play()
      } else {
        $video.pause()
      }
      $videoControl.classList.toggle('play')
    })
  }
}

;(() => {
  const $videos: NodeListOf<HTMLElement> = document.querySelectorAll('.as-video-wrap')
  Array.from($videos).map($val => {
    const video = new HeroVideo($val)
    video.init()
  })
})()
