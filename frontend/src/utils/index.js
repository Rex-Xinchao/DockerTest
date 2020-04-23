import store from '../store'
import Cookies from 'js-cookie';
import CryptoJS from 'crypto-js'

const expires = 1; //有效期
const domain = window.location.hostname || 'localhost'
const COOKIE_OPT = {
  expires,
  domain
}

let _host = window.location.host.split(":")[0];
let _domain = _host.split("."),
  _len = _host.split(".").length;

let _ENV = 'dev'; //默认dev环境


const _permissionMap = {
  '/init': 'scm-portal.init.view',
  '/index': 'scm-portal.index.view',
  '/maintain': 'scm-portal.product.view',
  '/log': 'scm-portal.audit.view',
  '/manage': 'scm-portal.manage.view',
}
function getPermissions(resources) { //获取对应权限
  let _permi = false,
    _permission = store.state.userInfo.permission;
  if (_permission && _permission.length) {
    if (_permission.findIndex(v => (v.resources == _permissionMap[resources] || v.resources == resources)) !== -1) {
      _permi = true;
    }
  }
  return _permi;
}

function setCookie(key, value) {
  Cookies.set(`${key}`, value, COOKIE_OPT)
}

function delCookie(key) {
  return Cookies.remove(`${key}`, COOKIE_OPT)
}

function getCookie(key) {
  let value = Cookies.get(`${key}`)
  return (value && value !== 'undefined' && value !== 'null') ? value : null
}

function encrypt($str) { //加密
  let _key = CryptoJS.enc.Latin1.parse('jSt3SttxMbBml3tc'),
    _iv = CryptoJS.enc.Latin1.parse('IzMoaK3jSeBgDKQR')
  return CryptoJS.AES.encrypt($str, _key, {
    iv: _iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.ZeroPadding
  }).toString()
}

function decrypt($str) { //解密
  let _key = CryptoJS.enc.Latin1.parse('jSt3SttxMbBml3tc'),
    _iv = CryptoJS.enc.Latin1.parse('IzMoaK3jSeBgDKQR')
  return CryptoJS.AES.decrypt($str, _key, {
    iv: _iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.ZeroPadding
  }).toString(CryptoJS.enc.Latin1)
}

function logout() {
  let _to = window.location.origin
  window.location.href = _to + '/#/login'
}

function dateTimeFormatter(t) {
  if (!t) return ''
  t = new Date(t).getTime()
  t = new Date(t)
  var year = t.getFullYear()
  var month = (t.getMonth() + 1)
  month = checkAddZone(month)

  var date = t.getDate()
  date = checkAddZone(date)

  var hour = t.getHours()
  hour = checkAddZone(hour)

  var min = t.getMinutes()
  min = checkAddZone(min)

  var se = t.getSeconds()
  se = checkAddZone(se)

  return year + '-' + month + '-' + date + ' ' + hour + ':' + min + ':' + se
}

function dayTimeFormatter(t) {
  if (!t) return ''
  t = new Date(t).getTime()
  t = new Date(t)
  var year = t.getFullYear()
  var month = (t.getMonth() + 1)
  month = checkAddZone(month)

  var date = t.getDate()
  date = checkAddZone(date)

  return year + '-' + month + '-' + date
}

function checkAddZone(num) {
  return num < 10 ? '0' + num.toString() : num
}


export {
  getPermissions,
  setCookie,
  delCookie,
  getCookie,
  encrypt,
  decrypt,
  logout,
  dateTimeFormatter,
  dayTimeFormatter
}
