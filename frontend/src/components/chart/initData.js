// 对于树形图的数据处理
const UP = -1 // 上游
const DOWN = 1 // 下游
let LevelLimit = null
let Root_Node = null
let Up_List = []
let Down_List = []
let LAN
const initData = (data, root_code, root_name, maxLevel = 1, UpList = [], DownList = [], language) => {
  LAN = language
  LevelLimit = maxLevel
  const relationships = deepClone(data.relationships)
  changeNodes(data.nodes)
  const nodes = deepClone(data.nodes)
  if (relationships.length === 0) {
    let Root_Node = {
      name: root_name,
      code: root_code
    }
    return [{
      name: Root_Node.name,
      code: Root_Node.code,
      root: true,
      direction: UP,
      children: []
    }, {
      name: Root_Node.name,
      code: Root_Node.code,
      root: true,
      direction: DOWN,
      children: []
    }]
  }
  Root_Node = setRootNode(nodes, root_code)
  Up_List = UpList.concat({
    name: Root_Node.name,
    code: Root_Node.code,
    root: true,
    direction: Root_Node.direction,
    id: `${Root_Node.code}-1-undefined`
  })
  Down_List = DownList.concat({
    name: Root_Node.name,
    code: Root_Node.code,
    root: true,
    direction: Root_Node.direction,
    id: `${Root_Node.code}-1-undefined`
  })
  let upList = relationships.filter(item => item.direction === UP)
  let downList = relationships.filter(item => item.direction === DOWN)
  let downNodes = getNodes(downList, nodes, Object.assign({}, Root_Node, { direction: DOWN }))
  let upNodes = getNodes(upList, nodes, Object.assign({}, Root_Node, { direction: UP }))
  return [upNodes, downNodes]
}

const getNodes = (links, nodes, targetNode, level = 1) => {
  let isRepeated = false
  let isHide = false
  targetNode.name = targetNode[`name${LAN}`]
  targetNode.id = `${targetNode.code}-${level}-${targetNode.fatherCode}`
  if (targetNode.direction === UP) {
    let item = Up_List.find(item => item.code === targetNode.code && item.id === targetNode.id)
    if (item) {
      targetNode.isRepeated = false
      if (item.hide === true) {
        isHide = true
      }
    } else if (Up_List.find(item => item.code === targetNode.code)) {
      targetNode.isRepeated = true
      isRepeated = true
    }
  } else {
    let item = Down_List.find(item => item.code === targetNode.code && item.id === targetNode.id)
    if (item) {
      targetNode.isRepeated = false
      if (item.hide === true) {
        isHide = true
      }
    } else if (Down_List.find(item => item.code === targetNode.code)) {
      targetNode.isRepeated = true
      isRepeated = true
    }
  }
  if (LevelLimit >= level && !isRepeated && !isHide) {
    targetNode.children = getChildrenNodes(links, nodes, targetNode, level)
  } else {
    targetNode.children = []
  }
  return targetNode
} // 获取目标node的子元素集合

const getTypeNodes = (links, targetNode) => {
  let filterList = links.filter(item => item.startCode === targetNode.code)
  let typeNodes = []
  filterList.forEach(item => {
    if (!typeNodes.find(tn => tn.name === item.typeName)) {
      let { direction, typeCode, typeName, weight, startCode, endCode } = { ...item }
      typeNodes.push(Object.assign(
        {},
        { direction, startCode, weight, endCode },
        {
          startName: item[`startName${LAN}`],
          endName: item[`endName${LAN}`],
          code: item.typeCode,
          name: item.typeName,
          nodeType: 'productType',
          children: []
        }))
    }
  })
  return typeNodes
} // 获取中间节点（关系类型）

// 通过LevelLimit限制递归死循环
const getChildrenNodes = (links, nodes, targetNode, level) => {
  let typeNodes = getTypeNodes(links, targetNode)
  let filterList = links.filter(item => item.startCode === targetNode.code)
  typeNodes.forEach(tn => {
    let list = filterList.filter(link => link.typeCode === tn.code)
    list.forEach(item => {
      let childNode = deepClone(nodes.find(node => node.code === item.endCode))
      childNode.children = []
      childNode.level = level
      childNode.direction = tn.direction
      childNode.nodeType = 'product'
      childNode.objectId = item.id
      childNode.fatherCode = tn.code + tn.startCode
      childNode = getNodes(links, nodes, childNode, level + 1)
      tn.children.push(childNode)
    })
  })
  return typeNodes
} // 设置不同关系类型节点下的产品节点

const setRootNode = (nodes, root_code) => {
  let node = nodes.find(node => node.productCode === root_code)
  return {
    ...node,
    root: true,
    children: []
  }
}

const changeNodes = (nodes) => {
  nodes.forEach(item => {
    item.code = item.productCode
    item.children && getNodes(item.children)
  })
}

const deepClone = obj => {
  return JSON.parse(JSON.stringify(obj))
}

export default initData
