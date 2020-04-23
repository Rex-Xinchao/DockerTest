const state = {
    LANGUAGE: 'Zh',
    Zh: {
        common: {
            searchPlaceholder: '请输入产品关键词',
            addBtn: '添加',
            sureBtn: '确定',
            cancelBtn: '取消',
            logout: '退出登录',
            startTime: '开始时间',
            endTime: '结束时间',
            up: '上游',
            up_p: '上游产品',
            down: '下游',
            down_p: '下游产品'
        },
        login: {
            systemName: '产业链维护平台',
            systemDesc: '数库SAM产业链数据集将中国大陆及香港全部上市公司披露的业务分部及产品集全部标准化，确保了上市公司在业务及产品线维度上实现高度可比。',
            username: '用户',
            password: '密码',
            loginBtn: '登录',
            // loginBtn: '系统更新中，请稍候再试',
        },
        error: {
            errorMsg: '没有访问权限，请',
            backTo: '返回登录页',
        },
        index: {
            menuTitle: '产品分类'
        },
        ztree: {
            pickUp: '展开/收起',
            checkTxt_on: '多选',
            checkTxt_off: '取消',
            checkTxt_release: '开启层级联动勾选',
            searchPlaceholder: '请输入产品关键词',
            operationBar: {
                moveBtn_UM: '映射数库节点（未映射节点）',
                moveBtn: '移动节点',
                editBtn: '编辑节点',
                clearBtn: '清除当前更新提示',
                pickUpBtn: '展开映射节点',
                addRootBtn: '新增根节点',
                addChildBtn: '新增子节点',
                releaseBtn: '解除映射节点',
                deleteBtn: '删除节点',
            },
            tip: {
                map: '映射',
                title: '分类节点：'
            },
            tooltip: {
                addBtn: '添加节点',
                editBtn: '编辑节点',
                deleteBtn: '移除节点',
            },
            sign: {
                emptyTxt: '空节点',
                emptyTitle: '节点未映射任何数库产品',
                moreTxt: '映射多节点',
                moreTitle: '节点映射多个数库产品',
                deleteTxt: '映射数库已删除',
                deleteTitle: '映射的产品已被数库删除',
            },
            dialog: {
                title_addRoot: '添加根节点',
                title_addChild: '添加节点',
                title_edit: '编辑节点',
                emptyCheckTxt_add: '仅添加空节点',
                emptyCheckTxt_edit: '仅添加空节点',
                nodeTxt: '节点名称：',
                nodePlaceholder: '请输入节点显示名称',
                productTxt: '映射产品：',
                productPlaceholder: '请输入映射产品关键词（数库分类中[未映射]节点）',
                parentTxt: '父节点：',
                descTxt: '描述：',
                parentPlaceholder: '请输入父节点名称，为空时默认为根层级'
            }
        },
        chart: {
            noDataShow: '该产品没有上下游',
            picExample: {
                title: '图例',
                up: '上游节点',
                down: '下游节点',
                repeated: '重复扩展节点'
            },
            tooltip: {
                showAll: '查看上下游',
                showUp: '加载上游关系',
                showDown: '加载下游关系',
                pickUp: '收起上游关系',
                pickDown: '收起下游关系',
                addUp: '新增上游关系',
                addDown: '新增下游关系',
                editRel: '编辑关系',
                deleteRel: '移除关系'
            },
            dialog: {
                title_add_up: '添加上游',
                title_add_down: '添加下游',
                title_edit: '编辑关系',
                product: '产品名称：',
                rel: '关系属性：',
                productPlaceholder: '请输入产品名称',
                typePlaceholder: '请选择关系类型',
                weightPlaceholder: '请选择关系权重',
                isExsit: '关系已存在！'
            }
        },
        productType: {
            updateTimeTxt: '最后更新：',
            editTimeTxt: '最后编辑：',
            treeTitle_CSF: '数库分类',
            treeTitle_CLIENT: '产品分类',
            showMore: {
                addTxt: '新增',
                addTitle: '数库更新后新增的节点',
                renameTxt: '更名',
                renameTitle: '数库更新后产品名称变更的节点',
                moveTxt: '移动',
                moveTitle: '数库更新后产品父层级变更的节点',
                UMTxt: '未映射',
                UMTitle: '没有被映射到【产品分类】中的产品节点',
                deleteTxt: '映射已删除',
                deleteTitle: '映射的产品已被数库删除',
                moreTxt: '映射多节点',
                moreTitle: '节点映射多个数库产品',
                emptyTxt: '空节点',
                emptyTitle: '节点未映射任何数库产品',
                resourceSwitch: '节点来源',
                resourceSwitchTitle: '产品分类节点数据来源',
            }
        },
        log: {
            menuTag: {
                product: '产品分类维护日志',
                rel: '上下游维护日志'
            },
            filter: {
                time: '维护时间：',
                type: '操作类型：',
                typePlaceholder: '下拉选择类型',
                user: '用户：',
                userPlaceholder: '请输入用户名',
                btnTxt: '查询'
            },
            table: {
                type: '操作类型',
                user: '用户',
                time: '时间',
                origin: '原始',
                updated: '变更后',
                product: '产品',
                node: '节点',
                map: '节点映射',
                parent: '父节点',
                rel: '关系',
                up: '上游',
                down: '下游',
                remark:'备注'
            }
        },
        productStatus: {
            existAdd: {
                name: '新增',
                title: '数库更新后新增的节点'
            },
            existRename: {
                name: '更名',
                title: '数库更新后产品名称变更的节点'
            },
            existMove: {
                name: '移动',
                title: '数库更新后产品父层级变更的节点'
            },
            existUnMap: {
                name: '未映射',
                title: '没有被映射到【产品分类】中的产品节点'
            },
            deleteMapped: {
                name: '映射已删除',
                title: '映射的产品已被数库删除'
            },
            mulMapped: {
                name: '映射多节点',
                title: '节点映射多个数库产品'
            },
            isEmpty: {
                name: '空节点',
                title: '节点未映射任何数库产品'
            }
        },
        publisherMap: {
            'CSF': '数库',
            'SYWG2014': '申万',
            'GB2017': '国标',
        },
        check: {
            login: {
                lessUsername: '请输入用户名称',
                lessPassword: '请输入用户密码',
            },
            index: {

            },
            productType: {
                clearTitle: '是否确认清除更新提示？',
                clearDesc: '确认清除后，当前版本所有【新增】【更名】【移动】提示不再显示'
            },
            ztree: {
                errorMsg1: '数库分类库不可变更',
                errorMsg2: '父节点变更为根节点',
                errorMsg3: '操作取消，移动操作前后父层级无变更',
                errorMsg4: '父节点变更为目标产品',
                errorMsg5: '不能删除有子节点的父节点',
                addNodeMsg1: '是否添加节点',
                moveTitle: '是否确认以下移动操作？',
                deleteTitle: '是否删除以下节点？',
                deleteDesc: '节点',
                mutiplyDeleteTitle: '是否删除以下节点？ （注：节点相关[上下游关系]同时删除）',
                deleteTitle: '是否删除以下节点？ （注：节点相关[上下游关系]同时删除）',
                releaseTitle: '解除映射节点'
            },
            chart: {
                deleteTitle: '是否确认移除当前关系？'
            },
            sure: '确定',
            cancel: '取消',
            noData: '暂无更多数据'
        }
    }
}

const getters = {
    LANGUAGE: (state) => {
        return state.LANGUAGE
    },
    sign: (state) => {
        let signMap = state[state.LANGUAGE].productStatus
        let result = {}
        for (let key in signMap) {
            result[key] = signMap[key].name
        }
        return result
    },
    signTitle: (state) => {
        let signMap = state[state.LANGUAGE].productStatus
        let result = {}
        for (let key in signMap) {
            result[key] = signMap[key].title
        }
        return result
    },
    publisherMap: (state) => {
        return state[state.LANGUAGE].publisherMap
    }
}

export default {
    state,
    getters
}
