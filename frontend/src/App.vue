<template>
  <div
    class="container-vertical app-main"
    :style="{'padding-bottom': $route.name === 'login' ? 0 : '32px'}"
  >
    <div class="header" v-if="showHeader">
      <menuTag></menuTag>
    </div>
    <remark ref="remarkDialog"></remark>
    <router-view class="main"></router-view>
    <div
      v-if="$route.name !== 'login' && false"
      class="powerBy"
    >© 2020 数库隶属于数库（上海）科技有限公司 ChinaScope Limited All Rights Reserved</div>
  </div>
</template>
<script>
import { mapGetters, mapActions } from "vuex";
import menuTag from "@components/menu";
import remark from "@components/remark/remarkDialog";
export default {
  name: "index",
  components: { menuTag, remark },
  computed: {
    showHeader() {
      return ["login", "error"].indexOf(this.$route.name) === -1;
    }
  },
  mounted() {
    this.$eventBus.$on("remarkDialogShow", (id, type = 1) => {
      this.$refs.remarkDialog.dialogShow(id, type);
    });
  }
};
</script>
<style lang="scss">
@import "@styles/main";
.el-table--enable-row-hover .el-table__body tr:hover > td.is-back-changed {
  background-color: #fff3f3 !important;
}
</style>
