<template>
  <div
    :class="{
      'tree-main':true,
      'is-drag': type !== 'forMenu' && permission.dragable,
      'menu-tree' : type === 'forMenu',
      'show-tree' : type === 'forShow',
      'edit-tree': type === 'forEdit', 
      'remove-link-style': !removeLinkChecked, 
    }"
    @mouseleave="hideTitleTip()"
  >
    <Filter-Bar
      :type="type"
      :selectedNum="selectedNum"
      :searchApi="searchApi"
      :paddingCss="paddingCss"
      :showCheck="type !== 'forMenu'"
      @onSearchChange="onSearchChange"
      @onMutiplyCheck="onMutiplyCheck"
      @onRemoveLinkCheck="onRemoveLinkCheck"
    ></Filter-Bar>
    <div
      ref="container"
      class="ztree-container"
      :class="{'active': isActive && type !== 'forShow'}"
      v-loading="treeLoading"
    >
      <div class="list-container scrollbar_box">
        <ul
          ref="tree"
          class="ztree"
          :class="{
          showSign_Add: showStatus && showStatus.existAdd,
          showSign_Rename: showStatus && showStatus.existRename,
          showSign_Move: showStatus && showStatus.existMove,
          showSign_UM: showStatus && showStatus.existUnMap,
          showSign_Delete: showStatus && showStatus.deleteMapped,
          showSign_MM: showStatus && showStatus.mulMapped,
          showSign_Empty: showStatus && showStatus.isEmpty,
          showSign_Source: showStatus && showStatus.isSource,
          showCheck: mutiplyChecked
        }"
        ></ul>
      </div>
    </div>
    <Operation-Bar
      v-if="type !== 'forMenu'"
      :checkList="checkList"
      :type="type"
      :mutiplyChecked="mutiplyChecked"
      @change="onOperationChange"
    ></Operation-Bar>
    <Add-Node ref="addNode" :currentNode="selectedNode" @change="onAddDialogSave"></Add-Node>
    <DelNode ref="delNode" @change="deleteTreeNode"></DelNode>
    <MoveNode
      ref="moveNode"
      :$tree="ztree"
      :treeType="type"
      :removeLinkChecked="removeLinkChecked"
      @change="onMoveDialogSave"
    ></MoveNode>
    <Check-Dialog ref="checkDialog" :type="1" @checkSure="UMTreeNode"></Check-Dialog>
    <div class="tips" ref="hoverTip" v-show="hoverItem.show" @mousemove="hoverItem.show = false">
      <p class="name">{{`${hoverItem.name} 【${hoverItem.productCode} | 层级： ${hoverItem.level}】`}}</p>
      <p v-if="hoverItem.desc" class="desc" style="line-height: 2em;">{{hoverItem.desc || '--'}}</p>
      <br />
      <p
        class="title"
        v-if="hoverItem.mapInfos && hoverItem.mapInfos.length && hoverItem.mapInfos[0].productCode && !ISSZSE"
      >
        {{`${$i18n('ztree.tip.map')}${publisherMap[type === 'forShow' ?
        PUBLISHER : 'CSF']}${$i18n('ztree.tip.title')}`}}
      </p>
      <span v-if="!ISSZSE">
        <span
          v-for="(item, index) in hoverItem.mapInfos"
          class="card"
          :key="index"
          v-show="item.productCode"
        >{{`${item.name || '--'}【${item.productCode || '--'} | 层级： ${item.level || '--'}】`}}</span>
      </span>
    </div>
  </div>
</template>

<script>
import "@/libs/jquery.ztree.all";
import "@/libs/jquery.ztree.exhide";
import { mapActions, mapGetters } from "vuex";
import { treeInit, treeEvent, treeApi } from "@/mixins/zTree";
import FilterBar from "./coms/filterBar";
import OperationBar from "./coms/operationBar";
import AddNode from "./coms/addNode";
import MoveNode from "./coms/moveNode";
import DelNode from "./coms/delNode";
import CheckDialog from "@components/checkDialog";
import PermissionJudge from "@/mixins/permissionJudge";

const deepClone = obj => {
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

export default {
  name: "zTree",
  data() {
    let vm = this;
    return {
      numMap: {
        addCount: undefined,
        renameCount: undefined,
        moveCount: undefined,
        unMapCount: undefined,
        delMappedCnt: undefined,
        mulMappedCnt: undefined
      },
      // filter
      pickUpMoreInterval: null,
      pickUpCheck: {},
      mutiplyChecked: false, // 是否多选
      removeLinkChecked: true,
      // drag
      isActive: false,
      // tip
      hoverItem: {}
    };
  },
  props: {
    type: { type: String, required: true },
    marginTop: { type: Number, default: 0 },
    apiPath: { type: String, default: "getProductTree" },
    showStatus: { require: false }
  },
  mixins: [treeInit, treeEvent, treeApi, PermissionJudge],
  components: {
    FilterBar,
    OperationBar,
    AddNode,
    MoveNode,
    DelNode,
    CheckDialog
  },
  computed: {
    ...mapGetters([
      "sign",
      "signTitle",
      "product",
      "publisherMap",
      "PUBLISHER",
      "LANGUAGE",
      "ISSZSE"
    ]),
    paddingCss() {
      return this.type !== "forMenu" ? "10px 0 10px 10px" : "0 0 10px 0";
    },
    searchApi() {
      return this.type === "forShow" ? "search" : "getProductList";
    }
  },
  watch: {
    product(data) {
      if (!this.$ztree) {
        return;
      }
      const code = data.code;
      let node = this.$ztree.getNodesByFilter(node => node.id === code, true);
      this.$ztree.selectNode(node);
      node && this.$store.dispatch("SetProduct", node);
      this.clearSelectCss();
    },
    showStatus(data) {
      if (!this.$tree) return;
      if (!data || !Object.keys(data).length) return;
      this.pickUpCheck = data;
      this.treeLoading = true;
      setTimeout(() => {
        this.pickUp(data);
      }, 100);
    }
  },
  methods: {
    ...mapActions(["SetProduct"]),
    // filter
    onMutiplyCheck(data) {
      this.mutiplyChecked = data;
      this.onRemoveLinkCheck(true);
      this.$tree.checkAllNodes(false);
      this.initSelected();
    },
    onRemoveLinkCheck(data) {
      this.removeLinkChecked = data;
      this.$tree.setting.check.chkboxType = data
        ? { Y: "ps", N: "ps" }
        : { Y: "", N: "" };
      if (!this.removeLinkChecked) {
        this.$tree.getCheckedNodes(true).forEach(item => {
          if (item.check_Child_State === 1 || item.check_Child_State === 0) {
            this.$tree.checkNode(item, false, false);
          }
        });
      }
    },
    onSearchChange(data) {
      if (!data) return;
      let node = this.$tree.getNodesByFilter(
        node => node.productCode === data,
        true
      );
      this.$tree.selectNode(node);
      this.hideTipAmount();
      this.clearSelectCss();
      this.SetProduct(node);
      this.checkList = [node];
    },
    pickUp(data) {
      this.treeLoading = true;
      this.clearSelectCss();
      this.initSelected();
      let expandList = this.$tree.getNodesByFilter(
        item => item.open === true,
        false,
        null
      );
      expandList.length &&
        expandList.forEach(item => {
          this.$tree.expandNode(item, false, false, false);
        });
      this.pickUpMoreInterval && clearTimeout(this.pickUpMoreInterval);
      this.pickUpMoreInterval = setTimeout(() => {
        let target =
          this.type === "forShow" ? this.pickUp_show() : this.pickUp_edit();
        target.reverse().forEach(item => {
          this.$tree.selectNode(item);
          this.hideTipAmount();
        });
        this.treeLoading = false;
      }, 300);
    },
    pickUp_show() {
      let target = [];
      if (this.pickUpCheck.existUnMap && this.showStatus.existUnMap) {
        target = target.concat(
          this.$tree.getNodesByFilter(item => item.existUnMap)
        );
      }
      if (this.pickUpCheck.existMove && this.showStatus.existMove) {
        target = target.concat(
          this.$tree.getNodesByFilter(item => item.existMove)
        );
      }
      if (this.pickUpCheck.existAdd && this.showStatus.existAdd) {
        target = target.concat(
          this.$tree.getNodesByFilter(item => item.existAdd)
        );
      }
      if (this.pickUpCheck.existRename && this.showStatus.existRename) {
        target = target.concat(
          this.$tree.getNodesByFilter(item => item.existRename)
        );
      }
      return target;
    },
    pickUp_edit() {
      let target = [];
      if (this.pickUpCheck.mulMapped && this.showStatus.mulMapped) {
        target = target.concat(
          this.$tree.getNodesByFilter(item => item.mulMapped)
        );
      }
      if (this.pickUpCheck.deleteMapped && this.showStatus.deleteMapped) {
        target = target.concat(
          this.$tree.getNodesByFilter(item => item.deleteMapped)
        );
      }
      return target;
    },
    // dialog
    showAddDialog(isRoot = true) {
      this.isRoot = isRoot;
      this.editParams = {
        name: null,
        mappings: null,
        type: "add",
        versionId: ""
      };
      this.$refs.addNode.dialogShow(this.isRoot, this.editParams);
    },
    showEditDialog() {
      this.isRoot = false;
      this.editParams = {
        name: this.selectedNode.name,
        mappings: this.selectedNode.mapProductCodes,
        type: "edit",
        versionId: this.selectedNode.versionId
      };
      this.$refs.addNode.dialogShow(this.isRoot, this.editParams);
    },
    onAddDialogSave(form, type) {
      if (!form) return;
      let params = form;
      params.publisher = this.PUBLISHER;
      if (type === "add") {
        this.addTreeNode(params);
      } else {
        delete params.isRoot;
        delete params.isBlank;
        this.editTreeNode(params);
      }
    },
    onMoveDialogSave(code, list, isMove_Single) {
      if (this.moveType === "forEdit") {
        this.moveTreeNode(code, list, isMove_Single);
      }
      if (this.moveType === "forShow") {
        this.mapTreeNode(code, list);
      }
    }
  },
  mounted() {
    this.$eventBus.$on("changeActive", data => {
      this.isActive = data;
    });
    this.$eventBus.$on("updateShowTree", (operationType, mappings) => {
      if (this.type === "forShow") {
        operationType === "add" && this.addMappings(mappings);
        operationType === "del" && this.removeMappings(mappings);
      }
    });
    this.$eventBus.$on("updateEditTree", (list, code) => {
      this.type === "forEdit" && this.updateEditTree(list, code);
    });
    this.$eventBus.$on("updateEditRefresh", (list, code) => {
      this.type === "forEdit" && this.refreshTree();
    });
    this.$eventBus.$on("onSearchChange", (type, code) => {
      this.type === type && this.onSearchChange(code);
    });
    this.init();
  }
};
</script>
<style lang="scss">
.card {
  border-radius: 4px;
  border: 1px solid $color-primary;
  color: $color-primary;
  padding: 4px 8px;
  float: left;
  margin: 4px 4px 0 0;
}
</style>
