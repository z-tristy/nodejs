// Fastlane 用户系统

const Cookie = require('js-cookie')
const helpers = require('@scripts/helpers.ts')

const IF_LOGIN = document.querySelector('._as-login-flag')

const SSO_LOGIN_URL = (<HTMLInputElement>document.querySelector('._as-sso-login'))?.value
const SSO_SOURCE_PARAM = (<HTMLInputElement>document.querySelector('._as-source'))?.value
const SSO_STORE_PARAM = (<HTMLInputElement>document.querySelector('._as-store'))?.value
const SSO_CALLBACK_PARAM = (<HTMLInputElement>document.querySelector('._as-callback-url'))?.value
const SSO_RETURN_TO_PARAM = (<HTMLInputElement>document.querySelector('._as-return-to'))?.value

const SHOPIFY_ACCOUNT_URL = (<HTMLInputElement>document.querySelector('._as-account-url'))?.value
const SHOPIFY_HOME_URL = (<HTMLInputElement>document.querySelector('._as-home'))?.value

const $LOGOUT_BUTTONS = document.querySelectorAll('._as-logout')

const CURRENT_URL = window.self.location.href

const LOGIN_TOKEN_COOKIE_NAME = 'login_token'

const Account = class {
  constructor () {
    this.init()
    this.setUserName()
  }

  // 获取username 更新接口
  setUserName (): void {
    const Token: any = Cookie.get('login_token')
    const apiHost: any = document.querySelector('._as-account-api-host')?.value
    const $headerUsername = document.querySelector('.as-header-username')
    if (Token) {
      fetch(`${apiHost}/auth/me`, {
        method: 'get',
        headers: {
          'Authorization': `Bearer${Token}`
        }
      }).then(response => {
        return response.json()
      }).then((res: any) => {
        if (res.data?.username) {
          $headerUsername && ($headerUsername.innerText = res.data.username)
        } else {
          $headerUsername?.dataset.customerName && ($headerUsername.innerText = $headerUsername?.dataset.customerName)
        }
      }).catch(() => {
      })
    }
  }

  init (): void {
    if (CURRENT_URL.includes('/account/login')) {
      this.initLoginPage()
    }
    this.onLogout()
  }

  initLoginPage (): void {
    if (IF_LOGIN) {
      window.location.href = SHOPIFY_ACCOUNT_URL
    } else {
      this.redirectToLogin()
    }
  }

  redirectToLogin (): void {
    const PROCESSED_SSO_LOGIN_URL = `${SSO_LOGIN_URL}?source=${SSO_SOURCE_PARAM}&store=${SSO_STORE_PARAM}&callback=${SSO_CALLBACK_PARAM}&return_to=${SSO_RETURN_TO_PARAM}`
    window.location.href = PROCESSED_SSO_LOGIN_URL
  }

  onLogout (): void {
    $LOGOUT_BUTTONS.forEach((logoutBtn) => {
      logoutBtn.addEventListener('click', () => {
        Cookie.remove(LOGIN_TOKEN_COOKIE_NAME)
      })
    })
  }
}
new Account()

const RedirectPage = class {
  constructor () {
    this.init()
  }

  init() {
    if (CURRENT_URL.includes('/pages/redirect')) {
      this.saveToken()
      this.handleRedirect()
    }
  }

  saveToken() {
    if (helpers.getParam('token')) {
      Cookie.set(LOGIN_TOKEN_COOKIE_NAME, helpers.getParam('token'), { expires: 1 })
    }
  }

  handleRedirect() {
    if (IF_LOGIN) {
      // 已经登录
      // 如果有checkout_url,则跳转checkout_url,有return_to则跳转return_to,否则回account
      const REDIRECT_URL = helpers.getParam('checkout_url') ?? helpers.getParam('return_url') ?? helpers.getParam('return_to') ?? SHOPIFY_ACCOUNT_URL
      if (REDIRECT_URL.includes('https://')) {
        window.location.href = REDIRECT_URL
      } else {
        window.location.href = new URL(CURRENT_URL).origin + REDIRECT_URL
      }
    } else {
      window.location.href = SHOPIFY_HOME_URL
    }
  }
}
new RedirectPage()