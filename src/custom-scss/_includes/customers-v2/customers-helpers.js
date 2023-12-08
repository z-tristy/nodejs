
const Cookie = require('js-cookie')

function ajax (options) {
  if (!options) return

  const xhr = new XMLHttpRequest()
  xhr.open(options.method, options.url)
  // xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
  xhr.setRequestHeader('Accept', 'application/json, text/javascript, */*')

  if (options.needAuthorization) {
    const token = getToken()
    token && xhr.setRequestHeader('Authorization', 'Bearer ' + token)
  }
  xhr.withCredentials = true
  xhr.onload = function () {
    (typeof options.always === 'function') && options.always()

    if (xhr.status === 200 && xhr.responseText) {
      const response = JSON.parse(xhr.responseText)

      if (!response.error) {
        if (typeof options.done === 'function') options.done(response)
      } else if (response.error === 403) {
        // 需要登录, 发出请求登录事件
        // (typeof options.fail === 'function') && options.fail(response)
        // emit('sign-in-required')
      } else if (response.error) {
        if (typeof options.fail === 'function') options.fail(response)
      }
    } else if (xhr.responseText, xhr.status) {
      let response = ''
      try {
        response = JSON.parse(xhr.responseText)
      } catch {
        console.error('json parse error!')
      }

      const status = xhr.status
      if (typeof options.fail === 'function') options.fail(response, status)
    }

    // bus.emit(bus.EVENT.HIDE_PROGRESS)
  }

  xhr.addEventListener("progress", function (event) {
    if (event.lengthComputable) {
      var percentComplete = event.loaded / event.total
    }
  }, false)

  if (options.method.toUpperCase() === 'GET') {
    // 如果是 get 请求,无视参数直接发送
    xhr.send()
  } else {
    // 如果是 post 请求, 转化下
    xhr.send(decodeURI(options.param))
  }

  // bus.emit(bus.EVENT.SHOW_PROGRESS)
}

// 存储JWT
function setToken ($token) {
  Cookie.set('login_token', $token, { expires: 1 })
  setUserId($token)
}

// 获取JWT
function getToken () {
  return Cookie.get('login_token')
}

// 删除JWT
function removeToken () {
  Cookie.remove('login_token')
}
// 存储userid
function setUserId ($token) {
  if (!$token) return
  const strings = $token.split('.')
  const userinfo = JSON.parse(decodeURIComponent(escape(window.atob(strings[1].replace(/-/g, "+").replace(/_/g, "/"))))) || {};
  if (!userinfo.uuid) return
  Cookie.set('user_id', userinfo.uuid, { expires: 365 * 2 })
}
// 存储Multipass
function setMultipass ($token) {
  Cookie.set('mtp', $token)
}

// 获取Multipass
function getMultipass () {
  return Cookie.get('mtp')
}

// 删除Multipass
function removeMultipass () {
  Cookie.remove('mtp')
}

// 查询参数
function getParams (param) {
  return searchParams().get(param)
}

// 获取当前链接的searchParams
function searchParams () {
  const encodeUrl = new URL(window.self.location.href.replace('#edit-profile', encodeURIComponent('#edit-profile')).replace('#referral-page', encodeURIComponent('#referral-page')).replace('#invites', encodeURIComponent('#invites')).replace('#waiting-list', encodeURIComponent('#waiting-list')).replace('&allow_verify_code', encodeURIComponent('&allow_verify_code')).replace('&allow_participate', encodeURIComponent('&allow_participate')).replace('?allow_participate', encodeURIComponent('?allow_participate')).replace('?allow_verify_code', encodeURIComponent('?allow_verify_code')).replace('&accessory', encodeURIComponent('&accessory')).replace('&step', encodeURIComponent('&step')).replace('&has_invites', encodeURIComponent('&has_invites')))
  const search = new URLSearchParams(encodeUrl.search)
  return search
}

// 重定向至callback链接
function redirectTo ($multipass) {
  const url = spliceParams($multipass)
  window.location.href = url
}
// 拼接url
function spliceParams ($multipass) {
  let redirect_to = getParams('redirect_to')
  let change = getParams('change')

  if (redirect_to && change) {
    if ($source && callback && isAllowed(callback)) {
      var redirectUrl = redirect_to + '?source=' + $source + "&callback=" + callback + "&change=" + change
      if (return_to && isAllowed(return_to)) {
        var redirectUrl = redirect_to + '?source=' + $source + "&callback=" + callback + "&change=" + change + "&return_to" + return_to
      }
    }
    else {
      var redirectUrl = redirect_to
    }
  } else {
    if ($multipass) {
      var redirectUrl = document.querySelector('._as-callback').value + "/multipass/" + $multipass
    } else {
      // 调转至中转页面
      var redirectUrl = document.querySelector('._as-return-to').value
    }
  }
  return redirectUrl
}

// 判断是否是白名单域名
function isAllowed (url) {
  const link = new URL(url)
  if (link.host.endsWith('nothing.tech') || link.host.endsWith('nothing-tech.myshopify.com') || link.host.endsWith('nothing-dev.myshopify.com')) {
    return true
  } else {
    return false
  }
}

// 跳转至下个页面（path, param）
function goToPage (path, param) {
  const url = getUrl(path, param)
  window.location.href = url
}

function getUrl (path, param) {
  const search = searchParams()
  // 遍历参数
  for (key in param) {
    search.set(key, param[key])
  }
  const origin = window.self.location.origin
  if (path && path.includes('https://')) {
    var url = path + '?' + search
  } else {
    var url = origin + path + '?' + search
  }
  return url
}

function getClientTime () {
  return (Math.floor((new Date().getTime()) / 1000))
}

module.exports = {
  ajax,
  setToken: setToken,
  getToken: getToken,
  removeToken: removeToken,
  setUserId: setUserId,
  getParams: getParams,
  redirectTo: redirectTo,
  goToPage: goToPage,
  getUrl: getUrl,
  setMultipass: setMultipass,
  getMultipass: getMultipass,
  removeMultipass: removeMultipass,
  searchParams: searchParams,
  isAllowed: isAllowed,
  getClientTime: getClientTime
}
