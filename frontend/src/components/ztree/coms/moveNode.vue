<template>
  <el-dialog
    :title="treeType === 'forShow' ? '映射节点' : '移动节点'"
    :visible.sync="dialogVisible"
    width="600px"
    :before-close="dialogClose"
  >
    <span style="display:block; padding: 0;">
      <remarkInput
        ref="remarkInput"
        :node="nodeList[0]"
        :showHis="showHis"
        style="left: 100px; width:460px"
      ></remarkInput>
      <span style="color: #BFC1C3; position: absolute; top: 64px;">注：如未指定父节点，“确认保存”后默认移动至根层级下</span>
      <div style="padding: 20px 0 0 80px;">
        <el-form ref="form" :model="form" label-width="120px" size="small" label-position="left">
          <el-form-item label="父节点变更为：">
            <el-select
              ref="parentSearch"
              v-model="form.parentCode"
              filterable
              remote
              reserve-keyword
              placeholder="请输入父节点名称"
              :remote-method="querySearch"
              :loading="loading"
              :clearable="true"
              @change="selectChange"
            >
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
                <span class="product-li">
                  {{item.label}}
                  <span class="sign">{{item.value}}</span>
                  <span class="sign">{{`层级：${item.level}`}}</span>
                </span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="节点名称：" v-if="nodeList.length === 1 && isShow">
            <el-input
              style="width: 215px"
              v-model="form.productName"
              placeholder="请输入内容"
              @change="inputChange"
            ></el-input>
          </el-form-item>
          <el-form-item label="勾选节点按：" v-if="nodeList.length > 1">
            <el-radio v-model="form.type" label="2" @change="handleData()">保持层级结构</el-radio>
            <el-radio v-model="form.type" label="1" @change="handleData()">保持层级对齐</el-radio>
          </el-form-item>
        </el-form>
      </div>
      <div class="move-node-tree" id="checkTree" style="padding: 0 0 0 60px;">
        <ul ref="treeMove" id="tree" class="ztree checkTree"></ul>
      </div>
    </span>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogClose">取 消</el-button>
      <el-button type="primary" @click="dialogSave">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { mapGetters } from "vuex";
import remarkInput from "@components/remark/remarkInput";
import "@/libs/jquery.ztree.all";
import "@/libs/jquery.ztree.exhide";
export default {
  name: "add-node",
  data() {
    const vm = this;
    return {
      dialogVisible: false,
      form: {
        parentCode: "",
        parentName: "",
        parentLevel: "",
        productCode: "",
        productName: "",
        type: "2"
      },
      isShow: false,
      loading: false,
      options: [],
      nodeList: [], // 被选中的节点list
      result: [], // 最终返回接口的list
      treeData: [], // 由result生成的tree
      treeModel: null,
      treeSetting: {
        edit: {
          enable: false,
          editNameSelectAll: true,
          showRemoveBtn: false,
          showRenameBtn: false
        },
        check: {
          enable: false
        },
        view: {
          showLine: false,
          showIcon: false,
          showTitle: false,
          dblClickExpand: true,
          addDiyDom: vm.addSign
        },
        data: {
          simpleData: {
            enable: true,
            idKey: "parentCode"
          }
        }
      },
      isCheck: false,
      showHis: false,
      treeId:''
    };
  },
  computed: {
    ...mapGetters(["LANGUAGE"])
  },
  props: ["$tree", "treeType", "removeLinkChecked"],
  components: { remarkInput },
  methods: {
    dialogShow(nodeList, isShow, targetNode = null, isMove_Single = false) {
      if (this.removeLinkChecked && nodeList && !isMove_Single) {
        nodeList = nodeList.filter(
          item => item.check_Child_State !== 1 && item.check_Child_State !== 0
        );
      }
      this.isMove_Single = isMove_Single;
      this.dialogVisible = true;
      this.isShow = isShow;
      this.nodeList = nodeList;
      this.showHis = nodeList.length === 1;
      this.form.productName = nodeList[0].name;
      this.form.productCode = nodeList[0].productCode;
      if (targetNode) {
        this.querySearch(targetNode.name);
        this.form.parentCode = targetNode.productCode;
        this.form.parentName = targetNode.name;
        this.form.parentLevel = targetNode.level;
      } else {
        this.form.parentCode = "";
        this.form.parentName = "根层级";
        this.form.parentLevel = 0;
      }
      this.handleData();
    },
    initTree() {
      this.$nextTick(() => {
        let timeStamp = new Date().getTime();
        this.treeId = `ztree${timeStamp}`
        this.$refs.treeMove.setAttribute("id", `ztree${timeStamp}`);
        let $dom = $(`#ztree${timeStamp}`)
        this.treeModel = $.fn.zTree.init(
          $dom,
          Object.assign(this.treeSetting),
          this.treeData
        );
        this.treeModel && this.treeModel.expandAll(true);
      });
    },
    selectChange(data) {
      if (this.nodeList.find(item => item.productCode === data)) {
        this.$message.error("父节点与待移动节点重复，请重新输入");
        this.treeData = [];
        this.initTree();
        return;
      }
      this.options.forEach(item => {
        if (item.productCode === this.form.parentCode) {
          this.form.parentName = item.name;
          this.form.parentLevel = item.level;
        }
      });
      this.handleData();
    },
    inputChange(data) {
      this.handleData();
    },
    handleData() {
      if (this.form.type == 2) {
        this.hierarchicalData();
      } else {
        this.flatData();
      }
      this.getTreeData();
      this.initTree();
    },
    hierarchicalData() {
      this.result = [];
      this.nodeList.forEach(item => {
        let node = this.$tree.getNodeByParam(
          "productCode",
          item.productCode,
          null
        );
        if (node.productCode === this.form.productCode) {
          node.name = this.form.productName;
        }
        if (!this.result.find(i => i.productCode === item.productCode)) {
          let { productCode, name, level, versionId } = { ...node };
          this.result.push(
            Object.assign(
              {},
              { productCode, name, versionId },
              { parentCode: this.form.parentCode, oldLevel: level }
            )
          );
          setChild.call(this, node.children, node.productCode);
        }
      });
    },
    flatData() {
      this.result = [];
      this.nodeList.forEach(item => {
        let node = this.$tree.getNodeByParam(
          "productCode",
          item.productCode,
          null
        );
        let { productCode, name, level, versionId } = { ...node };
        this.result.push(
          Object.assign(
            {},
            { productCode, name, versionId },
            { parentCode: this.form.parentCode, oldLevel: level }
          )
        );
      });
    },
    getTreeData() {
      let treeMap = {};
      let list = this.result.map(item => item);
      list.forEach(item => {
        treeMap[item.productCode] = item;
      });
      list.forEach(item => {
        if (item.parentCode) {
          let parentNode = treeMap[item.parentCode];
          if (parentNode) {
            parentNode.children || (parentNode.children = []);
            parentNode.children.push(item);
          }
        }
      });
      this.treeData = [
        {
          productCode: this.form.parentCode,
          oldLevel: this.form.parentLevel,
          name: this.form.parentName,
          children: list.filter(
            item => item.parentCode === this.form.parentCode
          )
        }
      ];
    },
    dialogSave() {
      this.$emit(
        "change",
        this.form.parentCode,
        this.result,
        this.isMove_Single
      );
      this.dialogClose();
    },
    dialogClose() {
      this.dialogVisible = false;
      this.treeModel = null;
      this.form.parentCode = "";
      this.options = [];
      this.nodeList = [];
      this.result = [];
      this.form.type = "2";
      this.$refs.remarkInput.clearRemark();
    },
    querySearch(queryString) {
      if (queryString && queryString.trim()) {
        this.loading = true;
        this.$get_api("getProductList", { keyword: queryString }).then(res => {
          this.loading = false;
          res.sort((a, b) => {
            return a.level - b.level;
          });
          res.forEach(item => {
            item.value = item.productCode;
            item.label = item.name;
          });
          this.options = res.slice();
        });
      } else {
        this.options = [];
      }
    },
    addSign(treeId, treeNode) {
      const $node = $(`#${treeId}`).find("#" + treeNode.tId);
      const $tagA = $node.find("a").eq(0);
      $tagA.after("<span></span>");
      if (treeNode.productCode === this.form.parentCode) return;
      let parentLevel = this.form.parentLevel
      let level = parentLevel + treeNode.level - 1
      $tagA.after(
        `<span class="product-li">
          <span class="sign">${treeNode.productCode || "--"}</span>
          <span class="sign" title="移动后层级">层级：${level}</span>
          <span class="sign" style="color: #BFC1C3; background-color: #EFEFEF" title="移动前层级">层级：${
            treeNode.oldLevel
          }</span>
        </span>`
      );
    }
  }
};

// 将中间移动之后的节点的子节点绑定到移动节点未移动的祖先节点上
function setChild(childrenList, parentCode) {
  if (!childrenList) return;
  childrenList.forEach(item => {
    let node = this.$tree.getNodeByParam("productCode", item.productCode, null);
    if (this.nodeList.find(i => i.productCode === node.productCode)) {
      let { productCode, name, level, versionId } = { ...node };
      this.result.push(
        Object.assign(
          {},
          { productCode, name, versionId },
          { parentCode: parentCode, oldLevel: level }
        )
      );
      setChild.call(this, node.children, node.productCode);
    } else {
      setChild.call(this, node.children, parentCode);
    }
  });
}
</script>
<style lang="scss" scoped>
.tip {
  margin-left: 8px;
}
#checkTree {
  width: 100%;
  height: 300px;
}
.move-node-list,
.move-node-tree {
  max-height: 300px;
  min-height: 300px;
  width: calc(100% - 80px) !important;
  overflow: auto;
}
</style>