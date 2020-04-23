<template>
  <el-dialog :title="title" :visible.sync="dialogVisible" width="800px" :before-close="dialogClose">
    <span style="display:block;">
      <remarkInput v-show="true" ref="remarkInput" :node="node" :type="this.type" :style="style"></remarkInput>
      <div ref="check"></div>
    </span>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogClose">{{$i18n('common.cancelBtn')}}</el-button>
      <el-button type="primary" @click="dialogSave">{{$i18n('common.sureBtn')}}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import remarkInput from "@components/remark/remarkInput";
const StyleList = {
  1: "left: 224px; width: 550px",
  2: "left: 140px; width: 650px"
};
export default {
  name: "check-dialog",
  data() {
    const h = this.$createElement;
    const vm = this;
    return {
      dialogVisible: false,
      title: "确认",
      msg: undefined,
      index: 1,
      node: {},
      style: ""
    };
  },
  props: {
    type: { type: Number, default: 2 }
  },
  components: { remarkInput },
  methods: {
    dialogShow(title, msg, node, index = 1) {
      this.dialogVisible = true;
      this.title = title;
      this.index = index;
      this.style = StyleList[index];
      this.node = node;
      this.msg = this.__patch__(this.msg, msg, false, false);
      let vm = this;
      this.$nextTick(() => {
        this.$refs.check.append(this.msg);
      });
    },
    dialogSave() {
      this.$emit("checkSure", this.index);
      this.dialogClose();
    },
    dialogClose() {
      this.dialogVisible = false;
      this.title = "确认";
      this.node = {};
      this.index = 1;
      this.msg = undefined;
      this.$refs.remarkInput.clearRemark();
      let nodes = this.$refs.check.childNodes;
      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        this.$refs.check.removeChild(node);
      }
    }
  }
};
</script>
.tip {
  margin-left: 8px;
}
.move-node-list,
.move-node-tree {
  max-height: 300px;
  min-height: 300px;
  width: 100%;
  overflow: auto;
}
</style>