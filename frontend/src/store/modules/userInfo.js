import { setCookie } from "../../utils";

const state = {
  user: {},
  role: {},
  app: [],
  appId: '4c18904d17034f769aa5677dde051a34',
  permission: [],
  userInfo: {},
  remark:''
}

const getters = {
  user: (state) => {
    return state.user
  },
  userRole: (state) => {
    return state.userRole
  },
  appid: (state) => {
    return state.appId
  },
  userPermissions: (state) => {
    return state.permission
  },
  userInfo: (state) => {
    return state.userInfo
  },
  remark: (state) => {
    return state.remark
  }
}

const mutations = {
  SAVE_USER_INFO: (state, data) => {
    state.user = data
  },
  SAVE_ROLE_INFO: (state, data) => {
    state.role = data
  },
  SAVE_APP_LIST: (state, data) => {
    state.app = data;
  },
  SAVE_APP_PERMISSIONS: (state, data) => {
    state.permission = data;
  },
  SET_USER: (state, data) => {
    setCookie("userId", data.userId)
    setCookie("userToken", data.userToken)
    state.userInfo = data;
  },
  SET_REMARK: (state, data) => {
    state.remark = data;
  }
}

const actions = {
  SaveUserInfo({ commit }, data) {
    commit('SAVE_USER_INFO', data)
  },
  SaveRoleInfo({ commit }, data) {
    commit('SAVE_ROLE_INFO', data)
  },
  SaveAppList({ commit }, data) {
    commit("SAVE_APP_LIST", data)
  },
  SaveUserPermissions({ commit }, data) {
    commit("SAVE_APP_PERMISSIONS", data)
  },
  SetUser({ commit }, data) {
    commit("SET_USER", data)
  },
  SetRemark({ commit }, data) {
    commit("SET_REMARK", data)
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}
