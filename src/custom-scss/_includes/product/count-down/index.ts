import { fetchConfig, getDayHourMinSecond } from '@scripts/_utilities'

class Countdown extends HTMLElement {
  nowTime: number
  startTime: number
  endTime: number
  $timeWrap: HTMLElement | null
  $days: HTMLElement | null
  $hours: HTMLElement | null
  $minutes: HTMLElement | null
  $seconds: HTMLElement | null
  $text: HTMLElement | null
  textStart: string | undefined
  endStart: string | undefined
  constructor () {
    super()
    this.nowTime = 0

    this.$timeWrap = this.querySelector('.as-countdown-time-wrap')
    this.$days = this.querySelector('.as-countdown-days')
    this.$hours = this.querySelector('.as-countdown-hours')
    this.$minutes = this.querySelector('.as-countdown-minutes')
    this.$seconds = this.querySelector('.as-countdown-seconds')
    this.$text = this.querySelector('.as-countdown-text')

    this.$text !== null && (this.textStart = this.$text.dataset?.start)
    this.$text !== null && (this.endStart = this.$text.dataset?.end)

    // 如果开始时间比结束时间晚, 则无效开始时间
    this.startTime = this.dataset?.startTime === undefined ? 0 : Number(this.dataset?.startTime)
    this.endTime = this.dataset?.endTime === undefined ? 0 : Number(this.dataset?.endTime)
    if (this.endTime <= this.startTime) this.startTime = 0

    this.init()
  }

  init (): void {
    this.getCurrentTime()
  }

  /**
   * @description 调用接口获取当前时间戳, 单位: s
  */
  getCurrentTime (): void {
    fetch('https://now.fastgrowth.app/', { ...fetchConfig() })
      .then(response => {
        return response.json()
      })
      .then(data => {
        if (data?.code === '200') {
          this.nowTime = data.data?.now_time
          this.handleCountdown(this.nowTime)

          this.$timeWrap?.classList.remove('inactive')
        }
      })
      .catch((error) => {
        console.error(error)
      })
  }

  /**
   * @description 获取当前时间后, 基于开始时间和结束时间处理逻辑
   * @nowTime 当前时间 / 倒计时过程中的当前时间
  */
  handleCountdown (nowTime: number): void {
    // 默认活动已结束 倒计时全部展示为 0
    let diffTime = 0

    if (this.startTime > 0 && nowTime < this.startTime) {
      // 活动未开始 展示活动开始倒计时
      this.$text !== null && (this.$text.innerHTML = String(this.textStart))
      diffTime = this.startTime - nowTime
    } else if (this.endTime > 0 && nowTime < this.endTime) {
      // 活动进行中 展示距离活动结束的倒计时
      this.$text !== null && (this.$text.innerHTML = String(this.endStart))
      diffTime = this.endTime - nowTime
    }

    if (diffTime > 0) {
      this.handleOverTime(diffTime)

      setTimeout(() => {
        this.handleCountdown(++nowTime)
      }, 1000)
    } else {
      // 活动结束
      this.$text !== null && (this.$text.innerHTML = String(this.endStart))
    }
  }

  /**
   * @description 将时间差处理成时分秒
   * @param diffTime 时间差
  */
  handleOverTime (diffTime: number): void {
    const d = Math.floor(diffTime / 60 / 60 / 24)
    const h = Math.floor(diffTime / 60 / 60 % 24)
    const m = Math.floor(diffTime / 60 % 60)
    const s = Math.floor(diffTime % 60)

    this.changeDaysStyle(d)

    this.$days !== null && (this.$days.innerHTML = this.handleSingleDigit(`${d}`))
    this.$hours !== null && (this.$hours.innerHTML = this.handleSingleDigit(`${h}`))
    this.$minutes !== null && (this.$minutes.innerHTML = this.handleSingleDigit(`${m}`))
    this.$seconds !== null && (this.$seconds.innerHTML = this.handleSingleDigit(`${s}`))
  }

  /**
   * @description 当 number 大于2位数时, 修改 days block 的样式
  */
  changeDaysStyle (number: number): void {
    if (number > 99) {
      this.$days?.classList.add('w-auto')
      this.$days?.classList.add('px-1')
    } else {
      this.$days?.classList.remove('w-auto')
      this.$days?.classList.remove('px-1')
    }
  }

  /**
   * @description 在小于10的数前面拼接字符串 0
   * @param number
  */
  handleSingleDigit (number: string): string {
    return Number(number) > 9 ? number : `0${number}`
  }
}

if (customElements.get('count-down') === undefined) {
  customElements.define('count-down', Countdown)
}
