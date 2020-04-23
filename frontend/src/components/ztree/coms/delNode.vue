<template>
  <el-dialog title="删除节点" width="800px" :before-close="dialogClose" :visible.sync="dialogVisible">
    <span style="display:block;padding: 0;max-height: 450px; overflow: auto;">
      <remarkInput
        v-show="true"
        ref="remarkInput"
        :node="nodeList[0]"
        :showHis="isDelelte_Single"
        style="left: 104px; width: 650px"
      ></remarkInput>
      <p>{{title}}</p>
      <p class="product-li" v-for="(node, index) in nodeList" :key="index">
        <span>{{node.name}}</span>
        <span class="sign">{{node.productCode}}</span>
        <span class="sign">层级: {{node.level}}</span>
      </p>
    </span>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogClose">{{$i18n('common.cancelBtn')}}</el-button>
      <el-button type="primary" @click="dialogSave">{{$i18n('common.sureBtn')}}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import remarkInput from "@components/remark/remarkInput";
export default {
  name: "add-node",
  data() {
    return {
      dialogVisible: false,
      isDelelte_Single: false,
      title: null,
      nodeList: []
    };
  },
  components: { remarkInput },
  watch: {},
  methods: {
    dialogShow(title, list, isDelelte_Single = false) {
      this.isDelelte_Single = isDelelte_Single
      this.dialogVisible = true;
      this.title = title;
      this.nodeList = list;
    },
    dialogClose() {
      this.dialogVisible = false;
      this.title = null;
      this.nodeList = [];
      this.$refs.remarkInput.clearRemark();
    },
    dialogSave() {
      this.$emit("change", this.nodeList);
      this.dialogClose();
    }
  }
};
</script>
<style lang="scss" scoped>
.checkbox {
  float: left;
  line-height: 40px;
}
</style>