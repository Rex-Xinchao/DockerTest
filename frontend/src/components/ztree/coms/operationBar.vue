<template>
  <div class="operation-bar">
    <span
      v-if="type === 'forShow' && permission.moveable"
      :class="MoveClickable_show"
      @click="btnClick(MoveClickable_show, 'move_copy')"
    >{{$i18n('ztree.operationBar.moveBtn_UM')}}</span>
    <span
      v-if="!mutiplyChecked && type === 'forShow'"
      :class="PickUpable_left_show"
      :style="{cursor: mapNode ? 'pointer' : 'not-allowed',color: mapNode ? '#3E73E3' :'#999999'}"
      @click="btnClick(PickUpable_left_show, 'pickUpShow')"
    >{{$i18n('ztree.operationBar.pickUpBtn')}}</span>
    <span
      v-if="type === 'forShow' && permission.clearable"
      @click="btnClick('', 'clear')"
    >{{$i18n('ztree.operationBar.clearBtn')}}</span>
    <span
      v-if="!mutiplyChecked && type === 'forEdit' && permission.addable"
      @click="btnClick('', 'add_root')"
    >{{$i18n('ztree.operationBar.addRootBtn')}}</span>
    <span
      v-if="!mutiplyChecked && type === 'forEdit' && permission.addable"
      :class="AddChildClickable_edit"
      @click="btnClick(AddChildClickable_edit, 'add_child')"
    >{{$i18n('ztree.operationBar.addChildBtn')}}</span>
    <span
      v-if="!mutiplyChecked && type === 'forEdit' && permission.editable"
      :class="editClickable_edit"
      @click="btnClick(editClickable_edit, 'edit')"
    >{{$i18n('ztree.operationBar.editBtn')}}</span>
    <span
      v-if="!mutiplyChecked && type === 'forEdit' && !ISSZSE"
      :class="PickUpable_right_show"
      :style="{cursor: mapNode ? 'pointer' : 'not-allowed',color: mapNode ? '#3E73E3' :'#999999'}"
      @click="btnClick(PickUpable_right_show, 'pickUpEdit')"
    >{{$i18n('ztree.operationBar.pickUpBtn')}}</span>
    <span
      v-if="!mutiplyChecked && type === 'forEdit' && permission.umable && !ISSZSE"
      :class="UnMapChildClickable_edit"
      @click="btnClick(UnMapChildClickable_edit, 'release')"
    >{{$i18n('ztree.operationBar.releaseBtn')}}</span>
    <span
      v-if="type === 'forEdit' && permission.moveable"
      :class="MoveClickable_edit"
      @click="btnClick(MoveClickable_edit, 'move')"
    >{{$i18n('ztree.operationBar.moveBtn')}}</span>
    <span
      v-if="type === 'forEdit' && permission.deleteable"
      :class="DeleteClickable_edit"
      @click="btnClick(DeleteClickable_edit, 'delete')"
    >{{$i18n('ztree.operationBar.deleteBtn')}}</span>
  </div>
</template>
<script>
import PermissionJudge from "@/mixins/permissionJudge";
import { mapActions, mapGetters } from "vuex";
export default {
  name: "operationBar",
  data() {
    return {
      mapNode: ""
    };
  },
  props: {
    checkList: { required: true },
    type: { required: true },
    mutiplyChecked: { type: Boolean, default: () => false }
  },
  mixins: [PermissionJudge],
  components: {},
  computed: {
    ...mapGetters([
      "ISSZSE"
    ]),
    PickUpable_left_show() {
      this.mapNode = null;
      if (
        this.type === "forShow" &&
        this.checkList &&
        this.checkList.length === 1
      ) {
        let node = this.checkList[0];
        if (!node.existUnMap) {
          this.getNodeInfo_CSF(node);
          return "btn-disabled";
        }
        return "btn-disabled";
      }
      return "btn-disabled";
    },
    PickUpable_right_show() {
      this.mapNode = null;
      if (
        this.type === "forEdit" &&
        this.checkList &&
        this.checkList.length === 1
      ) {
        let node = this.checkList[0];
        if (!node.deleteMapped && !node.mulMapped) {
          this.getNodeInfo(node);
          return "btn-disabled";
        }
        return "btn-disabled";
      }
      return "btn-disabled";
    },
    MoveClickable_show() {
      if (this.type === "forShow") {
        let list = this.checkList.filter(item => item.existUnMap === false);
        return this.checkList.length && !list.length ? "" : "btn-disabled";
      }
      return;
    },
    AddChildClickable_edit() {
      if (this.type === "forEdit") {
        return this.checkList.length !== 1 ? "btn-disabled" : "";
      }
      return;
    },
    editClickable_edit() {
      if (this.type === "forEdit") {
        return this.checkList.length !== 1 ? "btn-disabled" : "";
      }
      return;
    },
    UnMapChildClickable_edit() {
      if (this.type === "forEdit") {
        let list = this.checkList.filter(
          item => item.mapProductCodes && item.mapProductCodes.length > 0
        );
        return this.checkList.length && list.length ? "" : "btn-disabled";
      }
      return;
    },
    MoveClickable_edit() {
      if (this.type === "forEdit") {
        return this.checkList.length ? "" : "btn-disabled";
      }
      return;
    },
    DeleteClickable_edit() {
      if (this.type === "forEdit") {
        if (this.checkList.length === 1) {
          return this.checkList[0].hasChild ? "btn-disabled" : "";
        }
        return this.checkList.length ? "" : "btn-disabled";
      }
      return;
    }
  },
  watch: {},
  methods: {
    btnClick(className, type) {
      if (type === "pickUpShow" || type === "pickUpEdit") {
        this.$emit("change", type, this.mapNode);
        return
      }
      if (className === "btn-disabled") return;
      this.$emit("change", type, this.mapNode);
    },
    getNodeInfo_CSF(node) {
      this.$get_api("getNodeInfo_CSF", {
        productCode: node.productCode
      }).then(res => {
        if (res.mapInfos && res.mapInfos.length === 1) {
          this.mapNode = res.mapInfos[0];
        }
      });
    },
    getNodeInfo(node) {
      this.$get_api("getNodeInfo", {
        productCode: node.productCode
      }).then(res => {
        if (res.mapInfos && res.mapInfos.length === 1) {
          this.mapNode = res.mapInfos[0];
        }
      });
    }
  },
  mounted() {}
};
</script>