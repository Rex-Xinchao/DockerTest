const state = {
  product: {}
}

const getters = {
  product: (state) => {
    return state.product
  }
}

const mutations = {
  SET_PRODUCT: (state, data) => {
    let name = data && data.name;
    let productCode = data && data.productCode;
    let code = data && data.code;
    let level = data && data.level;
    let parent = data && data.getParentNode && data.getParentNode()
    let grandParent = parent && parent.getParentNode && parent.getParentNode()
    state.product = { name, productCode, code, parent: parent, grandParent: grandParent, level: level }
  }
}

const actions = {
  SetProduct({ commit }, data) {
    commit('SET_PRODUCT', data)
  },
}

export default {
  state,
  mutations,
  getters,
  actions
}
