const state = {
  NODE_ENV: '',
  PUBLISHER: '',
  PUBLISHERLIST: '',
  ISSZSE: true
}

const getters = {
  NODE_ENV: (state) => {
    return state.NODE_ENV
  },
  PUBLISHER: (state) => {
    return state.PUBLISHER
  },
  PUBLISHERLIST: (state) => {
    return state.PUBLISHERLIST
  },
  ISSZSE: (state) => {
    return state.ISSZSE
  }
}

const mutations = {
  SET_NODE_ENV: (state, data) => {
    state.NODE_ENV = data.NODE_ENV
  },
  SET_PUBLISHER: (state, data) => {
    state.PUBLISHER = data.publisher
  },
  SET_PUBLISHER_LIST: (state, data) => {
    state.PUBLISHERLIST = data.publishers
  }
}

const actions = {
  SetNodeEnv({ commit }, data) {
    commit('SET_NODE_ENV', data)
  },
  SetPUBLISHER({ commit }, data) {
    commit('SET_PUBLISHER', data)
  },
  SetPublisherList({ commit }, data) {
    commit('SET_PUBLISHER_LIST', data)
  }
}

export default {
  state,
  mutations,
  getters,
  actions
}
