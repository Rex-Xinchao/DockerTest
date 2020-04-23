<template>
  <div class="operation-bar_top">
    <div class="search-container" :style="{padding: paddingCss}" v-if="showSearch">
      <ProductSearch :showIcon="true" @change="onSearchChange" :searchApi="searchApi"></ProductSearch>
    </div>
    <div class="check-container" v-if="showCheck && permission.checkable">
      <el-checkbox
        class="multiply-select"
        v-model="mutiplyChecked"
        @change="onMutiplyCheck"
      >{{mutiplyChecked ? $i18n('ztree.checkTxt_off') : $i18n('ztree.checkTxt_on')}}</el-checkbox>
      <el-checkbox
        v-if="mutiplyChecked"
        v-model="removeLinkCheck"
        @change="onRemoveLinkCheck"
      >{{$i18n('ztree.checkTxt_release')}}</el-checkbox>
      <div class="fr selected-num-show" v-if="mutiplyChecked">{{`当前选中项：${selectedNum}`}}</div>
    </div>
  </div>
</template>
<script>
import ProductSearch from "@components/productSearch.vue";
import PermissionJudge from "@/mixins/permissionJudge";
import { mapGetters } from "vuex";
export default {
  name: "filterBar",
  data() {
    return {
      mutiplyChecked: false,
      removeLinkCheck: false,
      checkLink: true
    };
  },
  mixins: [PermissionJudge],
  props: {
    type: { type: String, default: "forMenu" },
    paddingCss: { type: String, default: "0 0 10px 0" },
    searchApi: { type: String, required: false },
    showCheck: { type: Boolean, default: () => true },
    showSearch: { type: Boolean, default: () => true },
    selectedNum: { type: Number, default: 0 }
  },
  components: { ProductSearch },
  computed: {
    ...mapGetters(["LANGUAGE"])
  },
  methods: {
    onSearchChange(data) {
      this.$emit("onSearchChange", data);
    },
    onMutiplyCheck(data) {
      if (data) {
        this.removeLinkCheck = true;
      }
      this.$emit("onMutiplyCheck", data);
    },
    onRemoveLinkCheck(data) {
      this.$emit("onRemoveLinkCheck", data);
    }
  }
};
</script>
<style lang="scss" scoped>
.multiply-select {
  padding-left: 17px;
  padding-left: 17px;
}
.selected-num-show {
  padding-right: 20px;
  font-size: 14px;
  // color: $color-primary;
}
</style>