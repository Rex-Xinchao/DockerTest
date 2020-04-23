import { getCookie } from '../utils/index'
// ztree的初始化
const treeInit = {
    data() {
        let vm = this;
        return {
            treeSetting: {
                // ztree 配置项
                edit: {
                    enable: true,
                    editNameSelectAll: true,
                    showRemoveBtn: false,
                    showRenameBtn: false
                },
                check: {
                    enable: true
                },
                view: {
                    showLine: false,
                    showIcon: false,
                    showTitle: false,
                    addDiyDom: vm.addSign,
                    dblClickExpand: true,
                    addHoverDom: vm.showTitleTip,
                    removeHoverDom: vm.hideTitleTip
                },
                data: {
                    simpleData: {
                        enable: true,
                        idKey: "productCode"
                    },
                    key: {
                        title: "titleShow",
                        name: "name",
                        id: "productCode"
                    }
                },
                callback: {
                    onClick: vm.onLeftClick,
                    beforeDrag: vm.beforeDrag,
                    beforeDrop: vm.beforeDrop,
                    onDrop: function () {
                        vm.$eventBus.$emit("changeActive", false);
                        $(".tree-drag").removeClass("tree-drag");
                    },
                    onCheck: vm.onChecked
                }
            },
            timestamp: new Date().getTime(), // 生产ztree唯一id
            $tree: null, // ztree dom
            treeLoading: true,
        }
    },
    computed: {
        marginHeight() {
            return this.type === "forMenu" ? 260 : 325
        }
    },
    methods: {
        init() {
            // 单个页面存在调用tree组件多次的情况，设置不同的id
            this.$refs.tree.setAttribute("id", `ztree${this.timestamp}`);
            this.$refs.container.setAttribute("id", `container${this.timestamp}`);
            this.initSelected(); // 清空当前选中项
            this.treeLoading = true;
            this.getTreeDate();
            $(`#container${this.timestamp}`).css({ /* 设置容器的高度 */
                height: document.querySelector("body").offsetHeight - this.marginHeight + "px"
            });
        },
        drawTree(data) {
            let zNodes = data.productNodes || data;
            $.fn.zTree.init(
                $(`#ztree${this.timestamp}`),
                Object.assign(this.treeSetting),
                zNodes
            );
            this.$tree = $.fn.zTree.getZTreeObj(`ztree${this.timestamp}`);
            this.ztree = this.$tree
            this.addEventListener();
            this.selectFirstNode();
            this.$emit("updateNumber", this.numMap);
            this.treeLoading = false;
        },
        selectFirstNode() {
            if (this.type !== "forMenu") return
            if (!this.$tree) return
            this.hideTipAmount();
            let nodes = this.$tree.getNodes();
            nodes && this.$tree.selectNode(getChild(nodes[0]));
            this.hideTipAmount()
            nodes && this.SetProduct(getChild(nodes[0]));
            this.clearSelectCss();
            function getChild(node) {
                if (node.children && node.children.length) {
                    return getChild(node.children[0])
                } else {
                    return node
                }
            }
        },
        addEventListener(e) {
            const vm = this;
            $(".ztree li").hover(e => {
                $(e).addClass("hover");
            });
            $(`#ztree${this.timestamp}`)
                .find("li")
                .on("mouseover", e => {
                    let showHoverIcon = false;
                    let id = e.target.id
                        .split("_")
                        .splice(0, 2)
                        .join("_");
                    let node = vm.$tree.getNodesByFilter(node => node.tId === id, true);
                    if (!node) return;
                    if (vm.type === "forEdit") {
                        showHoverIcon = true;
                    } else if (vm.type === "forShow" && node.existUnMap) {
                        showHoverIcon = true;
                    }
                    if ($(e.target)[0].id.indexOf("span") >= 0) {
                        e.target.parentNode.parentNode.classList.add("tree-hover");
                        if (showHoverIcon) {
                            e.target.parentNode.parentNode.classList.add("tree-hover_icon");
                        }
                        return;
                    } else if ($(e.target)[0].id.indexOf("a") >= 0) {
                        e.target.parentNode.classList.add("tree-hover");
                        if (showHoverIcon) {
                            e.target.parentNode.classList.add("tree-hover_icon");
                        }
                        return;
                    }
                    e.stopPropagation();
                    if (
                        e.target.tagName === "UL" ||
                        $(e.target)[0].id.includes("switch") ||
                        $(e.target)[0].id.includes("check")
                    ) {
                        return;
                    }
                    e.target.classList.add("tree-hover");
                    showHoverIcon && e.target.classList.add("tree-hover_icon");
                });
            $(".ztree")
                .find("li")
                .on("mouseout", e => {
                    $(".tree-hover").removeClass("tree-hover");
                    $(".tree-hover_icon").removeClass("tree-hover_icon");
                });
            $(".ztree li").click(e => {
                if (e.target.id.indexOf(vm.timestamp) >= 0) {
                    if (e.target.tagName === "LI") {
                        e.target.children.forEach(item => {
                            if (item.tagName === "A") {
                                item.click();
                            }
                            if (item.tagName === "SPAN" && this.mutiplyChecked) { // 多选模式下，checkbox的触发域调整
                                if (item.getAttribute('id') && item.getAttribute('id').indexOf('check') >= 0) {
                                    item.click();
                                }
                            }
                        });
                    }
                }
            });
        },
        refreshTree(all = false) {
            if (all) {
                this.$emit("updateTime");
                this.updateNumber();
            }
            this.initEditParams();
            this.initSelected();
            this.$tree.refresh();
            this.addEventListener();
        },
        clearSelectCss() {
            $(`#container${this.timestamp}`)
                .find(".tree-active")
                .removeClass("tree-active");
            $(`#container${this.timestamp}`)
                .find(".curSelectedNode")
                .eq(0)
                .parent("li")
                .eq(0)
                .addClass("tree-active");
        },
    }
}
// ztree的交互事件
const SIGNLIST = ['existAdd', 'existRename', 'existMove', 'existUnMap', 'deleteMapped', 'mulMapped']
const treeEvent = {
    data() {
        return {
            selectedNum: 0,
            // drag 相关
            isActive: false,
            // hover 相关
            tipsInterval: null,
            getMsgRequest: null,
            currentTip: null,
            tipHide: false,
            // click 相关
            clickInterval: null,
            selectedNode: null,
            moveType: '', // 区分移动类型，是复制节点还是移动节点
            checkList: [], // ztree原始的返回结构
            // operationBar的按钮事件
            isRoot: true,
            editParams: {
                name: null,
                mappings: null,
                type: "add"
            },
        }
    },
    methods: {
        // tips相关
        showTitleTip(treeId, treeNode) {
            let we = window.event;
            if (!we) return
            if (this.tipHide) return
            if (this.currentTip === treeNode.productCode) return
            this.tipsInterval && clearTimeout(this.tipsInterval);
            this.tipsInterval = setTimeout(() => {
                this.currentTip = treeNode.productCode;
                let path = this.type === "forShow" ? `/platform/product/${treeNode.productCode}` : `/api/product/${treeNode.productCode}`;
                this.getMsgRequest = $.ajax({
                    type: 'GET',
                    contentType: 'application/json; charset=UTF-8',
                    url: path,
                    headers: { Authorization: getCookie('userToken'), userName: this.$store.getters.user.username, org
                    : this.$store.getters.user.org },
                    dataType: 'json',
                    data: null,
                    timeout: 10000,
                    //请求成功
                    success: res => {
                        if (this.tipHide) return
                        res.show = true;
                        res.level = treeNode.level;
                        this.hoverItem = res;
                        this.$refs.hoverTip.style.position = "fixed";
                        let clientY = we.clientY > 500 ? we.clientY - 80 : we.clientY;
                        this.$refs.hoverTip.style.top = `${(clientY || 0) + 10}px`;
                        this.$refs.hoverTip.style.left = `${(we.clientX || 0) + 20}px`;
                    }
                });
            }, 800);
        },
        hideTitleTip(treeId, treeNode) {
            this.tipsInterval && clearTimeout(this.tipsInterval);
            this.getMsgRequest && this.getMsgRequest.abort();
            this.getMsgRequest = null;
            this.currentTip = null;
            this.hoverItem = {};
            this.hoverItem.show = false;
        },
        hideTipAmount() {
            this.tipHide = true;
            setTimeout(e => {
                this.tipHide = false
            }, 1000)
        },
        // 点击事件
        onLeftClick(event, treeId, treeNode, clickFlag) {
            // 重复点击的防范措施
            this.clickInterval && clearTimeout(this.clickInterval);
            this.clickInterval = setTimeout(e => {
                this.$tree.selectNode(treeNode);
                this.hideTipAmount();
                if (this.type === 'forMenu') {
                    this.SetProduct(treeNode);
                } else if (this.mutiplyChecked === false) {
                    // 单选模式下不带上子节点
                    let node = deepClone(treeNode)
                    let hasChild = node.children && node.children.length > 0
                    node.children = []
                    node.hasChild = hasChild
                    this.selectedNode = node
                    this.checkList = [node]
                    if (this.type === "forEdit") {
                        this.getMsgRequest = $.ajax({
                            type: 'GET',
                            contentType: 'application/json; charset=UTF-8',
                            url: `/api/product/${treeNode.productCode}`,
                            headers: { Authorization: getCookie('userToken'), userName: this.$store.getters.user.username, org
                            : this.$store.getters.user.org  },
                            dataType: 'json',
                            data: null,
                            timeout: 10000,
                            //请求成功
                            success: res => {
                                this.selectedNode.mapInfos = res.mapInfos
                                this.selectedNode.desc = res.mapInfos
                            }
                        });
                    }
                }
                this.clearSelectCss()
            }, 300);
        },
        // check事件
        onChecked(event, treeId, treeNode) {
            let list = []
            this.$tree.getCheckedNodes(true).forEach(item => {
                // check_Child_State - 1为部分选中
                if (this.removeLinkChecked) {
                    item.check_Child_State !== 1 && list.push({
                        ...item,
                        parentCode: item.pId || '',
                        children: []
                    })
                } else {
                    list.push({
                        ...item,
                        parentCode: item.pId || '',
                        children: []
                    })
                }
            })
            this.checkList = list
            this.selectedNum = list.length
        },
        // 拖拽事件
        beforeDrag(treeId, treeNodes) {
            if (this.isDragabled(treeNodes[0])) {
                this.$eventBus.$emit("changeActive", true);
                $("#" + treeNodes[0].tId).addClass("tree-drag");
                return true;
            }
            return false;
        },
        isDragabled(editNode) {
            if (!this.permission.dragable) return
            if (this.type === "forShow") {
                return editNode.existUnMap;
            } else if (this.type === "forEdit") {
                return true
            }
            return false;
        },
        beforeDrop(treeId, treeNodes, targetNode, moveType) {
            this.currentParent = treeNodes[0].getParentNode()
            this.$eventBus.$emit("changeActive", false);
            $(".tree-drag").removeClass("tree-drag");
            if (!targetNode) return false;
            const currentTreeId = treeNodes[0].tId.split("_")[0]
            const targetTreeId = targetNode.tId.split("_")[0]
            if (currentTreeId !== targetTreeId) {
                if (this.type === 'forShow') {
                    // 从数库的tree到客户的tree
                    treeNodes[0].id = "add";
                    this.checkMove(treeId, treeNodes, targetNode, moveType, 'copy');
                    this.hideTipAmount()
                } else {
                    this.$message.error(this.$i18n('check.ztree.errorMsg1'));
                }
            } else {
                if (this.type === 'forEdit') {
                    // 从客户的tree到客户的tree
                    treeNodes[0].id = "edit";
                    this.checkMove(treeId, treeNodes, targetNode, moveType, 'move')
                } else {
                    this.$message.error(this.$i18n('check.ztree.errorMsg1'));
                }
            }
            return false; // 不触发ztree的拖拽事件，节点的后续事件手动更新 为了满足各种需求(╯‵□′)╯︵┻━┻zi
        },
        // Diy标签
        addSign(treeId, treeNode) {
            let classNameList = [];
            classNameList = isTextActive(treeNode, classNameList); // 子节点是否有标签
            const $node = $(`#container${this.timestamp}`).find("#" + treeNode.tId);
            const $tagA = $node.find("a").eq(0)
            $tagA.after("<span class='space'></span>");
            SIGNLIST.forEach(sign => {
                if (treeNode[sign]) {
                    classNameList.push(`current_${sign}`)
                    $tagA.after(`<i class='tree-sign sign-${sign}' title=${this.signTitle[sign]}>[${this.sign[sign]}]</i>`);
                }
            })
            switch (treeNode.source) {
                case 'SYWG2014':
                    $tagA.after(`<span class='source-sign sign-sw'>申万</span>`);
                    break;
                case 'GB2017':
                    $tagA.after(`<span class='source-sign sign-sw'>国标</span>`);
                    break;
                case 'CSF':
                    $tagA.after(`<span class='source-sign'>数库</span>`);
                    break;
                default:
                    $tagA.after(`<span class='source-sign sign-udf'>自定义</span>`);
                    break
            }
            new Set(classNameList);
            classNameList.length && $tagA.addClass(classNameList.join(' '));

            function isTextActive(node, list) {
                if (!!node.children) {
                    node.children.forEach(node_c => {
                        SIGNLIST.forEach(sign => {
                            if (node_c[sign] && list.includes(sign)) {
                                list.push(`a_${sign}`)
                            }
                        })
                        list = isTextActive(node_c, list)
                    });
                    return list;
                }
                return list;
            }
        },
        // operationBar的按钮事件
        onOperationChange(data, mapNode) {
            switch (data) {
                case "move_copy":
                    this.moveType = 'forShow'
                    this.$refs.moveNode.dialogShow(this.checkList, true, null, !this.mutiplyChecked)
                    break;
                case "clear":
                    this.$emit("clearTips");
                    break;
                case "add_root":
                    this.showAddDialog();
                    break;
                case "add_child":
                    this.showAddDialog(false);
                    break;
                case "edit":
                    this.showEditDialog();
                    break;
                case "release":
                    let title_r = this.$i18n('check.ztree.releaseTitle');
                    let mainText = this.getReleaseCheckDom()
                    this.$refs.checkDialog.dialogShow(title_r, mainText, this.checkList[0], 2);
                    break;
                case "move":
                    this.moveType = 'forEdit'
                    this.$refs.moveNode.dialogShow(this.checkList, false, null, !this.mutiplyChecked)
                    break;
                case "delete":
                    let title_d = this.$i18n('check.ztree.deleteTitle')
                    this.$refs.delNode.dialogShow(title_d, this.checkList, this.checkList.length === 1)
                    break;
                case "pickUpShow":
                    if (!mapNode) return
                    this.$eventBus.$emit('onSearchChange', 'forEdit', mapNode.productCode)
                    break;
                case "pickUpEdit":
                    if (!mapNode) return
                    this.$eventBus.$emit('onSearchChange', 'forShow', mapNode.productCode)
                    break;
                default:
                    break;
            }
        },
        // common
        initSelected() {
            this.selectedNode = null
            this.checkList = []
            this.selectedNum = 0
        },
        initEditParams() {
            this.editParams = {
                name: null,
                mappings: null,
                type: "add"
            }
        },
        updateNodeParams(treeNode, params) {
            for (let key in params) {
                treeNode[key] = params[key]
            }
        },
        findNode(item, isSingle = true) {
            return this.$tree.getNodesByFilter(function filter(node) {
                return node.productCode === item.productCode;
            }, isSingle);
        },
        getReleaseCheckDom() {
            const h = this.$createElement;
            const selectedNode = this.selectedNode
            return h("div", { style: 'max-height: 500px; overflow: auto;' }, [
                h("p", { class: "product-li" }, [
                    h("span", null, selectedNode.name),
                    h("span", { class: "sign" }, selectedNode.productCode),
                    h("span", { class: "sign" }, `层级： ${selectedNode.level}`)
                ]),
                h("p", getMaplist())
            ])
            function getMaplist() {
                let result = [h("p", { style: 'margin-block-end:0' }, '映射节点：')]
                selectedNode.mapInfos.forEach(item => {
                    result.push(
                        h("span", { class: "card", style: ' font-size: 12px;' }, `${item.name}【${item.productCode} | 层级：${item.level || '--'}】`)
                    )
                })
                return result
            }
        },
        getCheckTreeDom(parentNode, checkList) {
            const h = this.$createElement;
            const vm = this;
            let result = h("div", { class: "checkList" }, [
                h("div", { class: "grandNode_empty" }, [
                    h("div", { class: "parentNode" }, [
                        getNodeMsg(parentNode, 'border-dash', true),
                        ...getNodeList()
                    ])
                ])
            ])
            return result
            function getNodeList() {
                let result = []
                checkList.forEach(node => {
                    result.push(h("div", { class: node.children.length ? "node node-more" : "node" }, [getNodeMsg(node)]))
                })
                return result
            }

            function getNodeMsg(node, className = null, isRoot) {
                if (!node.productCode) {
                    return h("span", { class: "product-li border-dash" }, '根节点')
                } else {
                    node.name = node.label || node.name
                }
                return h("span", { class: "product-li " + className }, [
                    h("span", null, node.name || node[`name${vm.LANGUAGE}`]),
                    h("span", { class: "sign" }, node.productCode),
                    h("span", { class: "sign" }, `层级： ${node.level}`),
                ])
            }
        },
        operateSuccess() {
            this.$tree.checkAllNodes(false)
            this.initSelected()
            this.refreshTree(true)
        },
        getUpdateMappings(checkList) { // 根据checklist删除未映射标签
            let releaseList = []
            let list = checkList || this.checkList
            list.map(item => item.mapProductCodes || null).forEach(itm => {
                itm && itm.forEach(code => {
                    releaseList.push(code)
                })
            })
            this.$eventBus.$emit("updateShowTree", 'del', releaseList);
        },
        getRemoveMappings(oldMapping, newMapping) { // 对比新旧mapInfo获取状态更新的数据
            oldMapping = oldMapping instanceof Array ? oldMapping : []
            newMapping = newMapping instanceof Array ? newMapping : []
            let releaseList = [];
            oldMapping.forEach(oi => {
                if (!newMapping.find(ni => ni === oi)) {
                    releaseList.push(oi);
                }
            });
            return releaseList
        },
        removeMappings(removeList) { // 数库分类树添加未映射标签
            removeList && removeList.forEach(item => {
                let node = this.findNode({ productCode: item });
                if (!node) return
                if (node.level <= 3) return
                node.chkDisabled = false;
                node.checked = false;
                node.existUnMap = true;
            });
            this.refreshTree();
        },
        addMappings(newList) { // 数库分类树去除未映射标签
            newList && newList.forEach(item => {
                let node = this.findNode({ productCode: item });
                if (!node) return
                node.chkDisabled = true;
                node.checked = false;
                node.existUnMap = false;
            });
            this.refreshTree();
        },
        checkMove(treeId, treeNodes, targetNode, moveType, type) {
            let parentNode = null;
            if (moveType === "inner") {
                parentNode = targetNode
            } else {
                if (targetNode) {
                    parentNode = targetNode.getParentNode()
                } else {
                    parentNode = null
                }
            }
            let list = [Object.assign({}, treeNodes[0], { children: [] })]
            this.moveType = type === 'copy' ? 'forShow' : 'forEdit'
            this.$refs.moveNode.dialogShow(list, type === 'copy', parentNode, true)
        },
        updateEditTree(list, code) {
            let pNode = this.findNode({ productCode: code });
            list.forEach(node => {
                changeChild(node);
                this.$tree.addNodes(pNode, [node]);
            });
            function changeChild(node) {
                if (node.children && node.children.length) {
                    changeChild(node.children);
                } else {
                    node.children = null;
                }
            }
        },
        getTreeMap(targetCode, list, chkDisabled = true) {
            let result = list.slice(0)
            const treeMap = {}
            result.forEach(item => {
                treeMap[item.productCode] = item
            })
            result.forEach(item => {
                if (chkDisabled && (item.level <= 3 || !item.existUnMap)) {
                    item.chkDisabled = true
                } else {
                    item.chkDisabled = false
                }
                if (item.parentCode) {
                    let parentNode = treeMap[item.parentCode]
                    if (parentNode) {
                        parentNode.children || (parentNode.children = [])
                        parentNode.children.push(item)
                    }
                }
            })
            return result.filter(node => node.parentCode === targetCode)
        },
    }
}

// ztree的接口数据处理
const treeApi = {
    data() {
        return {
            ztree: []
        }
    },
    methods: {
        getTreeDate() {
            this.$get_api(this.apiPath, { lang: this.LANGUAGE }).then(res => {
                for (let key in this.numMap) {
                    this.numMap[key] = res[key];
                }
                this.$emit("updateNumber", this.numMap);
                if (res.productNodes) {
                    let list = this.getTreeMap('', res.productNodes, this.type === 'forShow')
                    this.drawTree(list);
                }

            });
        },
        updateNumber() {
            this.$get_api('chinaScopeTree', { lang: this.LANGUAGE }).then(res => {
                for (let key in this.numMap) {
                    this.numMap[key] = res[key];
                }
                this.$emit("updateNumber", this.numMap);
            });
            this.$get_api('getProductTree', { lang: this.LANGUAGE }).then(res => {
                for (let key in this.numMap) {
                    this.numMap[key] = res[key];
                }
                this.$emit("updateNumber", this.numMap);
            });
        },
        // 节点操作-api
        addTreeNode(params) {
            // 添加节点
            const node = this.isRoot ? null : this.findNode(this.selectedNode);
            this.$post_api("addProduct", JSON.stringify(params)).then(res => {
                const addNode = this.$tree.addNodes(node, res)[0];
                this.$tree.selectNode(addNode);
                this.hideTipAmount();
                this.$eventBus.$emit("updateShowTree", 'add', res.mapProductCodes);
                this.refreshTree(true);
            });
        },
        editTreeNode(params) {
            // 编辑节点
            params = Object.assign({}, params, { code: this.selectedNode.productCode })
            const oldMapping = deepClone(this.selectedNode.mapProductCodes)
            this.$put_api("updateProduct", JSON.stringify(params)).then(res => {
                if (!res.productCode) return // 为发生节点变更的情况下返回空
                let node = this.findNode(res)
                this.updateNodeParams(node, res)
                this.$tree.updateNode(node);
                if (params.parent !== node.pId) { //父节点变动
                    if (params.parent) {
                        let pNode = this.findNode({ productCode: params.parent })
                        this.$tree.moveNode(pNode, node, "inner");
                    } else {
                        this.$tree.moveNode(null, node, "inner");
                    }
                }
                let releaseList = this.getRemoveMappings(oldMapping, res.mapProductCodes)
                this.$eventBus.$emit("updateShowTree", "add", res.mapProductCodes);
                this.$eventBus.$emit("updateShowTree", "del", releaseList);
                this.refreshTree(true)
            });
        },
        mapTreeNode(code, nodeList) {
            let single = nodeList.length === 1
            let api = single ? 'nodeMap' : 'nodeMap_multiply'
            let params = single ? {
                productCode: nodeList[0].productCode,
                name: nodeList[0].name,
                parentCode: code,
                publisher: this.PUBLISHER
            } : {
                    csfProducts: nodeList,
                    targetParentCode: code,
                    publisher: this.PUBLISHER
                }
            this.$post_api(api, JSON.stringify(params)).then(res => {
                res = single ? [res] : res
                let data = this.getTreeMap(code, res, false)
                this.$eventBus.$emit("updateEditTree", data, code);
                changeList(deepClone(nodeList))
                this.operateSuccess()
            })

            let vm = this
            function changeList(list) {
                if (list && list.length) {
                    list.forEach(item => {
                        let node = vm.findNode({ productCode: item.productCode })
                        node.checked = false
                        node.existUnMap = false
                        node.chkDisabled = true
                        vm.$tree.updateNode(node)
                        if (item.children && item.children.length) {
                            changeList(node.children)
                        }
                    })
                }
            }
        },
        moveTreeNode(code, nodeList, isMove_Single) {
            let apiPath = isMove_Single ? 'nodeMove' : 'multiplyMove'
            let params = isMove_Single ? {
                targetParentCode: code,
                productCode: nodeList[0].productCode,
                versionId: nodeList[0].versionId
            } : {
                    products: nodeList,
                    targetParentCode: code
                };
            this.$put_api(apiPath, JSON.stringify(params)).then(res => {
                res.forEach(node_r => {
                    let node = this.findNode({ productCode: node_r.productCode });
                    node.versionId = res.find(i => i.productCode === node.productCode).versionId;
                    let pNode = this.findNode({ productCode: node_r.parentCode });
                    this.$tree.moveNode(pNode, node, 'inner', true)
                })
                this.$tree.checkAllNodes(false)
                this.operateSuccess()
            })
        },
        UMTreeNode() {
            let params = {
                productCode: this.checkList[0].productCode,
                versionId: this.checkList[0].versionId,
            }
            this.$del_api('nodeUM', JSON.stringify(params), true).then(res => {
                this.getUpdateMappings(this.checkList);
                let node = this.findNode(res);
                this.updateNodeParams(node, res);
                this.$tree.updateNode(node);
                this.operateSuccess();
            })
        },
        deleteTreeNode(checkList) {
            let single = !this.mutiplyChecked
            let list = checkList.map(item => {
                return {
                    productCode: item.productCode,
                    versionId: item.versionId
                }
            })
            let apiPath = single ? 'nodeDel' : 'multiplyDel'
            let params = single ? { productCode: list[0].productCode, versionId: list[0].versionId } : { products: list };
            this.$del_api(apiPath, JSON.stringify(params), true).then(() => {
                this.getUpdateMappings(checkList)
                checkList.forEach(item => {
                    this.$tree.removeNode(this.findNode({ productCode: item.productCode }))
                })
                this.operateSuccess()
            })
        }
    }
}
// common
const deepClone = obj => {
    if (obj == null || obj == undefined) obj = ''
    if (typeof obj !== "object") return;
    let newObj = obj instanceof Array ? [] : {};
    for (let key in obj) {
        if (typeof obj[key] === "object") {
            newObj[key] = deepClone(obj[key]);
        } else {
            newObj[key] = obj[key];
        }
    }
    return newObj;
};
export { treeInit, treeEvent, treeApi }