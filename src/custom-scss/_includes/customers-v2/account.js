const Form = require('./form.js')
const helpers = require('./customers-helpers.js')

const Collapse = require('bootstrap').Collapse
const Name = class {
  constructor () {
    this.$editFile = document.querySelector('.as-edit-file-section')
    this.$parent = this.$editFile
    if (!this.$parent) return
    this.$editFileForm = this.$parent.querySelector('.as-edit-file-form')

    this.init()
  }

  init () {
    this.submitName()
  }

  submitName () {
    const that = this
    const form = this.$editFileForm && new Form(this.$editFileForm, {
      done: function (response) {
        if (!response.data) return
        if (response.status_code === 200) {
          const $token = response.data.token
          $token && helpers.setToken(response.data.token)
          // 修改成功，拿着multipass去登录，并返回account页面
          const $multipass = response.data.multipass
          $multipass && helpers.setMultipass($multipass)
          helpers.redirectTo($multipass)
          // 怎么传参再回来呢
        }
      },
      fail: function (response) {
        if (!form) return
        this.showFormError(that.$editFileForm.querySelector('.as-other-error'))
      }
    })
  }
}

const Account = class {
  constructor () {
    this.$components = document.querySelectorAll('.as-account-components')
    this.$tabs = document.querySelectorAll('.as-account-tabs')

    this.$accordionContent = document.querySelector('#collapseTwo')
    if (this.$components.length < 1 || this.$tabs.length < 1) return
    this.$parent = document.querySelector('.as-account-page')
    this.$LOGIN_URL = `${this.$parent.dataset.loginUrl}?return_to=${encodeURIComponent(window.location.href)}`
    this.init()
  }

  init () {
    window.addEventListener('load', () => {
      this.initRouter()
    })
    window.addEventListener('hashchange', () => {
      this.initRouter()
      this.initSidebarDropdown()
    })
    new Name()
  }

  initRouter () {
    const hash = window.location.hash
    this.$components.forEach((component) => {
      component.classList.add('d-none')
    })
    this.$tabs.forEach((tab) => {
      tab.classList.remove('active')
    })
    if (hash) {
      this.$components.forEach((components) => {
        if (components.dataset.router === hash) {
          components.classList.remove('d-none')
        }
      })
      this.$tabs.forEach((tab) => {
        if (tab.dataset.router === hash) {
          tab.classList.add('active')
        }
      })
    } else {
      this.$components[0].classList.remove('d-none')
      this.$tabs[0].classList.add('active')
      // 移动端、pc重复导航栏
      this.$tabs[this.$tabs.length / 2] && this.$tabs[this.$tabs.length / 2].classList.add('active')
    }
  }

  initSidebarDropdown () {
    if (this.$accordionContent && this.$accordionContent.classList.contains('show')) {
      Collapse.getOrCreateInstance(this.$accordionContent).hide()
    }
  }
}
new Account()

const UserReferral = class {
  constructor () {
    this.$referralPageContent = document.querySelector('.as-referral-page-content')
    if (!this.$referralPageContent) return
    this.$parent = this.$referralPageContent

    this.$emptyContent = this.$parent.querySelector('.as-empty')
    this.$resultsContent = this.$parent.querySelector('.as-results')

    this.fetchUserReferralData()
  }

  fetchUserReferralData () {
    const that = this
    fetch(this.$parent.dataset.api, {
      method: 'get',
      headers: {
        'x-fstln-token': helpers.getToken()
      }
    }).then(response => {
      if (!response.ok) {
        that.renderEmptyContent()
        return
      }
      return response.json()
    }).then(response => {
      that.renderReferralResultsContent(response)
    }).catch(() => {
      that.renderEmptyContent()
    })
  }

  renderReferralResultsContent (response) {
    const $totalNumber = this.$resultsContent.querySelector('.as-total-number')
    const $completedNumber = this.$resultsContent.querySelector('.as-completed-number')
    $totalNumber && ($totalNumber.textContent = response.total)
    $completedNumber && ($completedNumber.textContent = response.completed)
    this.$resultsContent && this.$resultsContent.classList.remove('d-none')
  }

  renderEmptyContent () {
    this.$emptyContent && this.$emptyContent.classList.remove('d-none')
  }
}
new UserReferral()
