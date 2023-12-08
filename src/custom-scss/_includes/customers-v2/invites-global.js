const helpers = require('./customers-helpers.js')

const RANKING_CAMPAIGN_ID = 'NT_phone_1_launch'

function handleInvitesData (data, timeDiff) {
  const currentTime = helpers.getClientTime() - timeDiff
  let result = Object.assign({}, data)
  let defauktProps = {
    status: 100,
    valid: false,
    expired: false,
    activated: false,
    available: false,
    purchased: false,
    activated_by_other: false,
    expired_time: null,
    already_expired_time: null,
    time_diff: timeDiff
  }
  let numProps = {active_start: 0, active_end: 0, use_start: 0, use_end: 0, used_num: 0}
  // 铺平
  result.code?.map((code)=> {
    code.sub && code.sub.map((sub) => {
      let single = true
      for (let i = 0; i < result.code.length; i++) {
        if (result.code[i].code === sub.code) {
          single = false
          break
        }
      }
      if (single) {
        sub.isChild = true
        sub.canShare = true
        result.code.push(sub)
      }
    })
  })
  // 判断状态
  result.code?.map((code, index) => {
    for(let p in defauktProps) {
      code[p] = defauktProps[p];
    }
    for(let n in numProps) {
      if (n != 'used_num') {
        if ( String(code[n]).length >= 13 ) {
          code[n] = Number(code[n]) / 1000
        }
      }
      code[n] = Number(code[n]);
    }
    // 待激活
    if (code.active_state == 'INACTIVE' && (code.used_num > 0 || code.isChild) && currentTime >= code.active_start && currentTime < code.active_end) {
      code.valid = true
      code.expired_time = code.active_end
      code.to_expired_time = code.active_end - currentTime
      code.status = 0
    }
    // 已激活待使用
    if (code.active_state == 'ACTIVATED' && code.used_num > 0 && !code.isChild && currentTime < code.use_start) {
      code.activated = true
      code.status = 2
    }
    // 已激活可使用
    if (code.active_state == 'ACTIVATED' && code.used_num > 0 && !code.isChild && currentTime >= code.use_start && currentTime < code.use_end) {
      code.available = true
      code.activated = false
      code.status = 1
    }
    // 已使用
    if (code.active_state == 'ACTIVATED' && currentTime >= code.use_start && code.used_num == 0 ) {
      code.purchased = true
      code.status = 3
    }
    // 待激活已过期
    if (code.active_state == 'INACTIVE' && (code.used_num > 0 || code.isChild) && currentTime >= code.active_end) {
      code.expired = true
      code.already_expired_time = currentTime - code.active_end
      code.status = 4
    }
    // 已激活但过期
    if (code.active_state == 'ACTIVATED' && code.used_num > 0  && currentTime >= code.use_end) {
      code.expired = true
      code.already_expired_time = currentTime - code.use_end
      code.status = 4
    }

    // 已被他人激活
    if (code.active_state == 'ACTIVATED' && code.isChild) {
      code.activated_by_other = true
      code.status = 5
    }
  })
  // 排序
  result.code?.sort((a, b) => {
    if (a.status < b.status) {
      return -1
    } else if (a.status > b.status) {
      return 1
    } else {
      // 待过期时间
      if (a.to_expired_time < b.to_expired_time) {
        return -1
      } else if (a.to_expired_time > b.to_expired_time) {
        return 1
      } else {
        if (a.already_expired_time < b.already_expired_time) {
          return -1
        } else if (a.already_expired_time > b.already_expired_time) {
          return 1
        } else {
          return 0
        }
      }
    }
  })
  // console.log(result)
  // 删除不可用状态
  let newResult = result.code?.filter((code) => {
    return (code.valid || code.expired || code.purchased || code.activated || code.available || code.activated_by_other)
  })
  // console.log(newResult)
  return newResult || null
}

function checkHasActiveCode (data) {
  if (!data) return { hasActiveCode: false }
  const activeList = data.filter((code) => {
    return code.valid
  })
  if (activeList && activeList.length > 0) {
    return { hasActiveCode: true, activeCode: activeList[0].code }
  } else {
    return { hasActiveCode: false }
  }
}

function checkHasExpiredCode (data) {
  if (!data) return false
  const expiredList = data.filter((code) => {
    return code.expired
  })
  if (expiredList && expiredList.length > 0) {
    return true
  } else {
    return false
  }
}

function checkHasToBeUsedCode (data) {
  if (!data) return false
  const availableList = data.filter((code) => {
    return code.available
  })
  if (availableList && availableList.length > 0) {
    return { hasToBeUsedCode: true, toBeUsedCode: availableList.map(item => item.code) }
  } else {
    return { hasToBeUsedCode: false }
  }
}

function redirectTo (url) {
  window.location.href = url
}

function getParams (param) {
  return searchParams().get(param)
}

// 获取当前链接的searchParams
function searchParams () {
  let encodeUrl = new URL(window.self.location.href)
  let search = new URLSearchParams(encodeUrl.search)
  return search
}

window.onSubmit = function (token) {
  if (typeof window.grecaptcha !== 'undefined' && !token) {
    return window.grecaptcha.execute()
  }
  // callback
}

function callReCaptcha (callback) {
  if ((typeof grecaptcha !== 'undefined') && (typeof window.onSubmit === 'function')) {
    window.onSubmit()
  } else {
    loadRecaptchaV2()
  }
}

function loadRecaptchaV2 () {
  var script = document.createElement('script')
  script.src = 'https://www.recaptcha.net/recaptcha/api.js?onload=onSubmit'
  document.body.appendChild(script)
  return ''
}

module.exports = {
  RANKING_CAMPAIGN_ID: RANKING_CAMPAIGN_ID,
  handleInvitesData: handleInvitesData,
  checkHasActiveCode: checkHasActiveCode,
  checkHasExpiredCode: checkHasExpiredCode,
  checkHasToBeUsedCode: checkHasToBeUsedCode,
  redirectTo: redirectTo,
  getParams: getParams,
  callReCaptcha: callReCaptcha
}
