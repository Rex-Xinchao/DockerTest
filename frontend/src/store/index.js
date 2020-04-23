import Vue from 'vue'
import Vuex from 'vuex'
import env from './modules/env'
import lib from './modules/lib'
import userInfo from './modules/userInfo'
import product from './modules/product'
import language from './modules/lan'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: { env, lib, userInfo, product, language }
})
