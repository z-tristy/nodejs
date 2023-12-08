class autoModal {
  $modalList: NodeListOf<Element>
  interval: number = 0
  callback: () => void
  isOnlyOnce: boolean = true
  timer: number = 0
  constructor () {
    // 找到当前页面上所有的手动触发的弹窗按钮
    this.$modalList = document.querySelectorAll('[data-bs-toggle="modal"]')
  }

  /**
   * 初始化给手动弹窗绑定 show hidden 方法监听
   * 页面打开先执行一次自动弹窗出现方法
   * @param interval 自动弹窗出现时间
   * @param fun 回调函数
   */
  init (interval: number = 5000, callback: () => void = () => {}): void {
    this.interval = Number(interval)
    this.callback = callback
    this.initHandleAutoModal()
    // 此处需要初始化给页面所有弹窗绑定监听事件，否则会有以下问题
    // 在第一次初始化自动弹窗前的倒计时内触发又关闭了弹窗后，不会过规定的时间再出现自动弹窗
    this.handleModalEventListener()
  }

  /**
   * 第一次监听
  */
  initHandleAutoModal (): void {
    this.timer = Number(setTimeout(() => {
      if (!this.checkModalExist()) {
        this.runFun()
        this.isOnlyOnce = false
      }
      clearTimeout(this.timer)
    }, this.interval))
  }

  /**
   * 倒计时控制自动弹窗出现
   */
  handleAutoModal (interval: number): void {
    this.timer = Number(setTimeout(() => {
      if (!this.checkModalExist()) {
        this.runFun()
        this.isOnlyOnce = false
      }
      clearTimeout(this.timer)
    }, interval))
  }

  runFun (): void {
    this.callback()
  }

  /**
   * 判断页面上是否用弹窗存在
   */
  checkModalExist (): boolean {
    // 先通过页面上的手动弹窗按钮的 bstarget 找到对应的弹窗
    // 再去判断对应弹唱是否展示了， 拥有 show 类名是显示，反之隐藏了；
    const isExistModal: boolean = Array.prototype.some.call(this.$modalList, (item) => {
      if (item.dataset.bsTarget[0] === '#') {
        const target = document.querySelector(item.dataset.bsTarget)
        return target?.classList.contains('show')
      }
    })
    return isExistModal
  }

  /**
   * 给页面上所有手动弹窗添加监听事件
   */
  handleModalEventListener (): void {
    Array.prototype.forEach.call(this.$modalList, (item) => {
      ((item) => {
        if (item.dataset.bsTarget[0] !== '#') return
        const target = document.querySelector(item.dataset.bsTarget)
        // 触发 show 事件时，结束之前已经触发 setTimeout
        // 如果不调用 clearTimeout，会导致在倒计时内关掉了手动弹窗，就不会在设置的倒计时内出现自动弹窗以及多次点击手动弹窗后会出现问题；
        target?.addEventListener('show.bs.modal', () => {
          if (!this.isOnlyOnce) return
          clearTimeout(this.timer)
        })
        target?.addEventListener('hidden.bs.modal', () => {
          // 如果自动弹窗已经出现了一次， 就不再执行 handleAutoModal 函数；
          if (!this.isOnlyOnce) return
          this.handleAutoModal(this.interval)
        })
      })(item)
    })
  }
}

export default autoModal
