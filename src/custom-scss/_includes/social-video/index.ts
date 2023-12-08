class SocialVideo{
  parent!: NodeListOf<Element>;
  constructor($parent: NodeListOf<Element>) {
    if (!$parent) return
    this.parent = $parent
    this.init();
  }
  init(){
    this.pauseVideo();
  }
  pauseVideo(){
    // 当弹窗关闭时，关掉 YouTube 视频
    document.addEventListener('hidden.bs.modal', () => {
      this.parent.forEach((element: { querySelectorAll: (arg0: string) => any; }) => {
        let $youtubes = element.querySelectorAll('.as-youtube-video')
        $youtubes.forEach((youtubes: { contentWindow: { postMessage: (arg0: string, arg1: string) => void; }; }) => {
          youtubes.contentWindow.postMessage('{"event":"command","func":"stopVideo","args":""}', '*')
        });
      });
      
    })
  }
}
// new SocialVideo(document.querySelector('.as-social-video'))
let socialVideo: NodeListOf<Element> = document.querySelectorAll('.as-social-video')
new SocialVideo(socialVideo)

