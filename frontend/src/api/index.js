import Vue from 'vue'
import store from '../store/index'
import { Message } from 'element-ui'
import { getCookie } from '../utils/index'

const API_PATH = {
  // init
  initInfo: '/init/info',
  initData: '/init/data',
  // user
  login: '/csf-permission/oauth/authorize',
  getKey: '/csf-permission/encryption/key',
  logout_auth: '/csf-permission/logout',
  getUserDetail: '/csf-permission/oauth/userInfo',
  getPermissions: '/csf-permission/oauth/userInfo',
  getCaptcha: '/csf-permission/captcha/state',
  getImage: '/csf-permission/captcha',
  captchaVerify: '/csf-permission/captcha/verify',
  logout: '/api/user/logout',
  search: '/platform/search',
  getUpdatedInfo: '/api/product/updated-info',
  getTree_menu: '/api/product/tree',
  getProductTree: '/api/product/tree-map',
  chinaScopeTree: '/platform/product/tree',
  unmappedProduct: '/api/product/unmapped-product',
  clearTreeStatus: '/api/product/csf-data-time',
  nodeMap: '/api/product/mapping',
  nodeMap_multiply: '/api/product/batch',
  multiplyDel: '/api/product/batch',
  addProduct: '/api/product',
  updateProduct: '/api/product',
  nodeMove: '/api/product/movement',
  multiplyMove: '/api/product/movements',
  nodeUM: '/api/product/mapping',
  nodeDel: '/api/product',
  getTreeNum: '/platform/product/tree/stats',
  getTreeMapNum: '/api/product/tree/stats',
  getNodeInfo_CSF: '/platform/product/{productCode}',
  getNodeInfo: '/api/product/{productCode}',
  // chart
  getChartData: '/api/product/{code}/chain_stream_graph',
  editChart: '/api/product/{code}/chain',
  delChartLink: '/api/product/chain',
  // product
  getProductList: '/api/product',
  getProductByCode: '/api/product/{code}/chain',
  // asyc
  getSyncList: '/mockData/table.json',
  // log
  getLogByProduct: '/api/log/product',
  getLogByChain: '/api/log/chain',
  getLog: '/api/log/remark'
};

const $get = (apiName, params) => {
  return new Promise((res, rej) => {
    $.ajax({
      type: 'GET',
      contentType: 'application/json; charset=UTF-8',
      url: getApiPatch(apiName, params),
      headers: { Authorization: getCookie('userToken'), userName: store.getters.user.username, org: store.getters.user.org },
      dataType: 'json',
      data: params,
      timeout: 10000,
      //请求成功
      success: function (result) {
        res(result)
      },
      //请求失败，包含具体的错误信息
      error: function (e) {
        if (apiName === 'initInfo') return
        error(e.status, e.statusText, e.responseJSON)
        rej(e)
      }
    });
  })
};

const $post = (apiName, params) => {
  let str = `?publisher=${JSON.parse(params).publisher}`
  params = add_remark(params)
  return new Promise((res, rej) => {
    $.ajax({
      type: 'POST',
      contentType: 'application/json; charset=UTF-8',
      url: apiName === 'initData' ? getApiPatch(apiName, params) + str : getApiPatch(apiName, params),
      headers: { Authorization: getCookie('userToken'), userName: store.getters.user.username, org: store.getters.user.org },
      dataType: 'json',
      data: params,
      //请求成功
      success: function (result) {

        res(result)
      },
      //请求失败，包含具体的错误信息
      error: function (e) {
        error(e.status, e.statusText, e.responseJSON)
        rej(e)
      }
    })
  })
};

const $del = (apiName, params, notUrl = false) => {
  let url = getApiPatch(apiName, params)
  let queryString = notUrl ? '' : toQueryString(params)
  if (queryString.length > 0) {
    url = url + (url.indexOf('?') > 0 ? '' : '?') + queryString
  }
  params = add_remark(params)
  return new Promise((res, rej) => {
    $.ajax({
      type: 'DELETE',
      contentType: 'application/json; charset=UTF-8',
      url: url,
      headers: { Authorization: getCookie('userToken'), userName: store.getters.user.username, org: store.getters.user.org },
      dataType: 'json',
      data: params,
      //请求成功
      success: function (result) {

        res(result)
      },
      //请求失败，包含具体的错误信息
      error: function (e) {
        error(e.status, e.statusText, e.responseJSON)
        rej(e)
      }
    })
  })
};

const $patch = (apiName, params) => {
  params = add_remark(params)
  return new Promise((res, rej) => {
    $.ajax({
      type: 'PATCH',
      contentType: 'application/json; charset=UTF-8',
      url: getApiPatch(apiName, params),
      headers: { Authorization: getCookie('userToken'), userName: store.getters.user.username, org: store.getters.user.org },
      dataType: 'json',
      data: params,
      //请求成功
      success: function (result) {

        res(result)
      },
      //请求失败，包含具体的错误信息
      error: function (e) {
        error(e.status, e.statusText, e.responseJSON)
        rej(e)
      }
    })
  })
};

const $put = (apiName, params) => {
  params = add_remark(params)
  return new Promise((res, rej) => {
    $.ajax({
      type: 'PUT',
      contentType: 'application/json; charset=UTF-8',
      url: getApiPatch(apiName, params),
      headers: { Authorization: getCookie('userToken'), userName: store.getters.user.username, org: store.getters.user.org },
      dataType: 'json',
      data: params,
      //请求成功
      success: function (result) {
        res(result)
      },
      //请求失败，包含具体的错误信息
      error: function (e) {
        if (apiName === 'logout_auth') {
          rej(e)
          return
        }
        error(e.status, e.statusText, e.responseJSON)
        rej(e)
      }
    })
  })
};

const add_remark = params => {
  if (typeof params === 'string') {
    params = JSON.parse(params)
    params.remark = store.getters.remark
    params = JSON.stringify(params)
  } else {
    params.remark = store.getters.remark
  }
  return params
}

// 正则替换路径参数
const getApiPatch = (apiName, params) => {
  if (typeof params === 'string') {
    params = JSON.parse(params)
  }
  let api_path = API_PATH[apiName]
  let reg = /\{(.*)\}/
  let test = reg.test(api_path)
  if (test) {
    let key = reg.exec(api_path)[1]
    api_path = api_path.replace(/\{.*\}/, params[key])
  }
  return api_path
}
// 错误code处理
const error = (status, statusText, response) => {
  if (status <= 199) {
    console.info(statusText)
  } else if (status >= 200 && status <= 299) {
    console.info(statusText)
  } else if (status >= 300 && status <= 399) {
    location.href = '/login'
  } else if (status >= 400 && status <= 499) {
    if (response.errorId == '400106 ') {
      Message.error('操作取消，同层级产品节点不可重名')
    } else if (response && response.message) {
      Message.error(`${response.message}`)
    } else {
      Message.error('操作失败，稍后再试')
    }
  } else if (status >= 500 && status <= 599) {
    if (response.errorId == "500151") {
      Message.error('当前操作取消,相关数据已被其他维护人员更新，请刷新页面获取最新数据')
    } else if (response.errorId == '500113') {
      Message.error('不能删除拥有子节点的父节点')
    } else if (response.errorId == '500153') {
      console.info('节点未发生任何变化')
    } else {
      Message.error('Request Error due to ' + (statusText || 'Server Error'))
    }
  } else {
    Message.error('Request Error' + (statusText ? ' due to ' + statusText : ''))
  }
}
// url拼接
const toQueryString = obj => {
  if (obj === null) {
    return ''
  }
  if (typeof obj === 'function') {
    return toQueryString(obj())
  }
  let kv = []
  for (let key of Object.keys(obj)) {
    let val = obj[key]
    if (val instanceof Array) {
      for (let v of val) {
        kv.push(encodeURIComponent(key) + '[]=' + encodeURIComponent(valueOf(v)))
      }
    } else {
      kv.push(encodeURIComponent(key) + '=' + encodeURIComponent(valueOf(val)))
    }
  }
  return kv.join('&')
}
// 获取value
const valueOf = obj => {
  if (obj === null || typeof obj === 'undefined') {
    return ''
  }
  if (typeof obj === 'function') {
    return valueOf(obj())
  }
  return obj.toString()
}

Vue.prototype.$get_api = $get;
Vue.prototype.$post_api = $post;
Vue.prototype.$del_api = $del;
Vue.prototype.$patch_api = $patch;
Vue.prototype.$put_api = $put;