const UpdateRedirect = class {
  constructor () {
    this.$links = document.querySelectorAll('.as-update-redirect')

    this.$lang = document.querySelector('._as-lang')
    this.$store = document.querySelector('._as-store')
    this.$callback = document.querySelector('._as-callback')
    this.init()
  }

  init () {
    this.updateLinks()
  }

  updateLinks () {
    var that = this
    // 将当前页面查询参数与redirect_url拼接
    let redirectPage = document.querySelector('._as-return-to') && document.querySelector('._as-return-to').dataset.link
    let encodeUrl = new URL(window.self.location.href.replace('#edit-profile', encodeURIComponent('#edit-profile')).replace('#referral-page', encodeURIComponent('#referral-page')).replace('#waiting-list', encodeURIComponent('#waiting-list')).replace('#invites', encodeURIComponent('#invites')))
    var search = encodeUrl.search

    this.$return_to = redirectPage + search

    that.$links && Array.prototype.map.call(that.$links, (link) => {
      if (link.classList.contains('as-update-social') && that.$lang && that.$store) {
        link.href = link.dataset.link + '?source=store' + '&store=' + that.$store.value + '&lang=' + that.$lang.value + '&callback=' + this.$callback.value + '&return_to=' + this.$return_to
      } else {
        link.value = this.$return_to
      } 
    })
  }
}

new UpdateRedirect()