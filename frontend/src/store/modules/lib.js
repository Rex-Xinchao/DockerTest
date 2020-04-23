const state = {
  standard: [
    {
      labelZh: '数库',
      labelEn: 'SCF',
      value: 1
    },
    {
      labelZh: '申万',
      labelEn: 'SW',
      value: 2
    },
    {
      labelZh: '国标',
      labelEn: 'GB',
      value: 3
    }
  ],
  menuTag: [
    {
      nameZh: '上下游维护',
      nameEn: 'Index',
      to: 'index',
      show: false,
      image: require(`@/assets/imgs/menu/index.svg`)
    },
    {
      nameZh: '产品分类维护',
      nameEn: 'Maintain',
      to: 'maintain',
      show: false,
      image: require(`@/assets/imgs/menu/product.svg`)
    },
    {
      nameZh: '维护日志',
      nameEn: 'Log',
      to: 'log',
      show: false,
      image: require(`@/assets/imgs/menu/log.svg`)
    },
    {
      nameZh: '用户管理',
      nameEn: 'Manage',
      to: 'manage',
      show: false,
      image: require(`@/assets/imgs/menu/manage.svg`)
    }
  ],
  degree: [
    {
      labelZh: '最强',
      labelEn: '最强',
      value: 4
    },
    {
      labelZh: '较强',
      labelEn: '较强',
      value: 3
    },
    {
      labelZh: '较弱',
      labelEn: '较弱',
      value: 2
    },
    {
      labelZh: '最弱',
      labelEn: '最弱',
      value: 1
    }
  ],
  relationType: [
    {
      labelZh: '生产设备',
      labelEn: '生产设备',
      value: 'A'
    },
    {
      labelZh: '销售渠道',
      labelEn: '销售渠道',
      value: 'D'
    },
    {
      labelZh: '生产环境',
      labelEn: '生产环境',
      value: 'E'
    },
    {
      labelZh: '辅助设备',
      labelEn: '辅助设备',
      value: 'F'
    },
    {
      labelZh: '生产原料',
      labelEn: '生产原料',
      value: 'M'
    },
    {
      labelZh: '产品/业务',
      labelEn: '产品/业务',
      value: 'P'
    },
    {
      labelZh: '辅助材料',
      labelEn: '辅助材料',
      value: 'R'
    },
    {
      labelZh: '技术服务',
      labelEn: '技术服务',
      value: 'T'
    },
    {
      labelZh: '暂不定义',
      labelEn: '暂不定义',
      value: 'UDF'
    }
  ],
  operateType: [
    { labelZh: "全部", labelEn: "全部", value: "" },
    { labelZh: "新增", labelEn: "新增", value: 1 },
    { labelZh: "编辑", labelEn: "编辑", value: 2 },
    { labelZh: "删除", labelEn: "删除", value: 3 }
  ]
}

const getters = {
  menuTag: (state) => {
    return state.menuTag
  },
  standardOptions: (state) => {
    return state.standard
  },
  degreeOptions: (state) => {
    return state.degree
  },
  relationTypeOptions: (state) => {
    return state.relationType
  },
  operateTypeOptions: (state) => {
    return state.operateType
  },
}

const mutations = {
}

const actions = {
}

export default {
  state,
  mutations,
  getters,
  actions
}
