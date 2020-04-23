<template>
  <el-select
    size="small"
    :class="{'search-input': showIcon}"
    filterable
    remote
    reserve-keyword
    v-model="searchKey"
    :loading="loading"
    :placeholder="$i18n('ztree.searchPlaceholder')"
    :remote-method="querySearch"
    :clearable="true"
  >
    <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
      <span class="product-li">
        {{item.label}}
        <span class="sign">{{item.value}}</span>
        <span class="sign">{{`层级：${item.level}`}}</span>
      </span>
    </el-option>
  </el-select>
</template>
<script>
export default {
  data() {
    return {
      searchKey: null,
      loading: false,
      options: [],
      options_o: []
    };
  },
  props: {
    showIcon: { type: Boolean, default: () => false },
    searchApi: { type: String, default: "getProductList" }
  },
  watch: {
    searchKey(data) {
      this.$emit("change", data);
    }
  },
  methods: {
    querySearch(queryString) {
      let api = this.searchApi;
      if (queryString.trim()) {
        this.loading = true;
        this.$get_api(api, { keyword: queryString.trim() }).then(res => {
          this.loading = false;
          res.sort((a, b) => {
            return a.level - b.level;
          });
          res.forEach(item => {
            item.value = item.code || item.productCode;
            item.label = item.name;
          });
          this.options_o = res;
          this.options = this.options_o.slice();
        });
      } else {
        this.options_o = [];
        this.options = this.options_o.slice();
      }
    }
  }
};
</script>