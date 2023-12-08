/**
 * 该文件用来处理一下边角料的功能
*/

/**
 * 获取 <media-gallery ></media-gallery> 元素的高度
 * 当小屏幕时, 左侧 sticky 定位的轮播图片可能么办法显示全, 所以需要计算值来设置 sticky 的 top 值; 目的是将整体向上偏移, 使能够看到底部的分页按钮
*/
((): void => {
  const $parent: HTMLElement | null = document.querySelector('.sticky-top-section')
  if ($parent === null) return
  const $mediaGallery: HTMLElement | null = document.querySelector('.as-gallery-wrapper:not(.d-none)')
  if ($mediaGallery === null) return
  const mediaHeight = $mediaGallery.offsetHeight

  // 最终距离底部留一定间距
  const buffHeight = 8

  // 页头的高度, 默认顶部留白
  const $header: HTMLElement | null = document.querySelector('.as-shopify-header')
  const headerHeight = $header?.offsetHeight ?? 64

  // 当购买按钮 fixed 在底部时
  const $fixedBottomButton: HTMLElement | null = document.querySelector('.as-add-to-cart-wrap')
  const buttonHeight = $fixedBottomButton?.offsetHeight ?? 0

  window.addEventListener('resize', () => {
    handleParentTop()
  })

  const handleParentTop = (): void => {
    const windowHeight = window.innerHeight
    const diff = windowHeight - mediaHeight - buffHeight - buttonHeight
    if (diff < headerHeight) {
      $parent.style.top = `${diff}px`
    } else {
      // 重置为默认值
      $parent.style.top = `${headerHeight}px`
    }
  }

  // 含有贴底加购条的购买页，body加上padding-bottom，其值为加购条的高度
  document.body.style.paddingBottom = `${buttonHeight}px`

  handleParentTop()
})()
