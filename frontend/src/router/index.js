import Vue from 'vue'
import store from '../store'
import Router from 'vue-router'
const Init = () => import("@/views/init/index")
const Index = () => import("@/views/index/index")
const Maintain = () => import("@/views/productType/index")
const Login = () => import("@/views/user/login")
const Error = () => import("@/views/user/error")
const Log = () => import("@/views/log/index")
import { decrypt, getCookie, setCookie, getPermissions, delCookie } from '../utils/index'

Vue.use(Router)

let router = new Router({
  routes: [
    {
      path: '*',
      name: 'index',
      component: Index
    }, {
      path: '/',
      redirect: '/login'
    }, {
      path: '/login',
      name: 'login',
      component: Login
    }, {
      path: '/error',
      name: 'error',
      component: Error
    }, {
      path: '/init',
      name: 'init',
      component: Init,
    }, {
      path: '/index',
      name: 'index',
      component: Index
    }, {
      path: '/maintain',
      name: 'maintain',
      component: Maintain
    }, {
      path: '/log',
      name: 'log',
      component: Log
    }
  ]
})

router.beforeEach((to, from, next) => {
  let _path = to.path
  let _params = to.query && to.query.token && JSON.parse(decrypt(decodeURIComponent(to.query.token)))
  _params && setUserInfo(_params);
  _params || (_params = store.state.userInfo.userInfo);
  if (!_params.userToken && getCookie("userId") && getCookie("userToken")) {
    _params = {
      userId: getCookie("userId"),
      userToken: getCookie("userToken")
    }

  }
  if (_path === "/error") {
    next()
  } else if (_path === '/login') {
    if (_params.userToken) { // 从chinascope登录成功的跳转
      next('index')
    } else {
      next() // 跳转login页面
    }
  } else if (_params.userToken) {
    getUserApi(to, next);
  } else {
    next('login')
  }
})

const logout = () => {
  delCookie('userId')
  delCookie('userToken')
  store.state.userInfo.userInfo = {}
  turnToLogin()
}

const turnToLogin = () => {
  // webpack打包设置的环境变量：1、development 本地环境 2、chinascope 公司内部正式环境 3、client 客户的正式环境
  // chinascope环境下跳转到内部的通用登录页面
  let _to = window.location.origin,
    _devLogin = "http://dev.loginportal.chinascope.net",
    _appId = store.state.userInfo.appId
  if (store.getters.NODE_ENV === 'chinascope') {
    window.location.href = `${_devLogin}/#/?to=${_to}&back=&appId=${_appId}`
  } else {
    window.location.href = _to + '/#/login'
  }
}

const setUserInfo = _json => {
  _json && setCookie("userId", _json.userId)
  _json && setCookie("userToken", _json.userToken)
  store.dispatch('SetUser', {
    userToken: _json.userToken,
    userId: _json.userId
  })
}

const getUserApi = (_to, _next) => {
  let _path = _to.path
  let _permissions = []
  let user = {}
  Vue.prototype.$get_api('getUserDetail', {
    clientId: store.state.userInfo.appId,
    userId: getCookie('userId')
  }).then(res => {
    if (res.code == '401' || res.code == '400' || res.type === 'fail') {
      clearUserInfo()
    } else {
      if (res.user && res.user.id) {
        user = res.user
        store.dispatch('SaveUserInfo', res.user);
      }
      if (res.permissions && res.permissions.length) {
        _permissions = res.permissions
        store.dispatch('SaveUserPermissions', _permissions);
      }
      // 如果不是登录页面且session中确认没有初始化信息
      if (_path === "/init") {
        sessionStorage.removeItem(`ISINITED${user.id}`)
      }
      if (_path !== "/login" && !sessionStorage.getItem(`ISINITED${user.id}`)) {
        Vue.prototype.$get_api("initInfo", {})
          .then(res => {
            if (res.publishers && res.publishers.length) {
              store.dispatch("SetPublisherList", res);
            }
            if (res.initStatus === 0) {
              if (_path !== "/init") {
                _next('init')
              } else {
                JudgePermissions()
              }
            } else {
              sessionStorage.setItem(`ISINITED${user.id}`, res)
              JudgePermissions()
            }
          })
      } else {
        JudgePermissions()
      }
    }
  }).catch(() => {
    clearUserInfo()
  })

  function JudgePermissions() {
    if (_permissions && _permissions.length) {
      if (_path === '/') {
        _next('index');
      } else {
        getPermissions(_path) ? _next() : _next("error");
      }
    } else {
      _next('error');
    }
  }

  function clearUserInfo() {
    delCookie('userId')
    delCookie('userToken')
    store.dispatch('SaveUserInfo', {});
    store.dispatch('SaveUserPermissions', []);
    _next('login')
  }
}

export default router
