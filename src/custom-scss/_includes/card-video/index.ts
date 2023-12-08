
const SectionCardVideo = class {
  $parent: HTMLElement
  constructor ($parent: HTMLElement) {
    this.$parent = $parent
  }

  init (): void {
    this.initMp4Video()
    this.initYoutube()
  }

  initMp4Video (): void {
    const $video: HTMLVideoElement | null = this.$parent.querySelector('.as-video')
    const $videoControl: HTMLElement | null = this.$parent.querySelector('.as-video-control')
    if ($video === null) return
    if ($videoControl === null) return
    $videoControl.addEventListener('click', () => {
      if ($video.paused) {
        const $videoPoster: HTMLElement | null = this.$parent.querySelector('.as-video-poster')
        if ($videoPoster !== null) $videoPoster.remove()
        void $video.play()
      } else {
        $video.pause()
      }
      $videoControl.classList.toggle('play')
    })
  }

  initYoutube (): void {
    const $offcanvasWrap: HTMLElement | null = this.$parent.querySelector('.as-offcanvas-video')
    if ($offcanvasWrap === null) return
    const $iframe: HTMLIFrameElement | null = $offcanvasWrap.querySelector('.as-youtube-iframe')
    if ($iframe === null) return
    const src: string | undefined = $iframe.dataset?.src
    if (src === undefined) return
    $offcanvasWrap.addEventListener('hidden.bs.offcanvas', () => {
      $iframe.setAttribute('src', '')
    })
    $offcanvasWrap.addEventListener('shown.bs.offcanvas', () => {
      $iframe.setAttribute('src', src)
    })
  }
}

;(() => {
  const $cardVideoWraps: NodeListOf<HTMLElement> = document.querySelectorAll('.as-section-card-video-wrap')
  Array.from($cardVideoWraps).map($val => {
    const video = new SectionCardVideo($val)
    video.init()
  })
})()
