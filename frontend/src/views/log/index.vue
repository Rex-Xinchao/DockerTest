<template>
  <div class="log-main">
    <div class="log-head">
      <div class="fl">
        <div
          class="btn log-btn"
          :class="{active: activeName === 'upDown'}"
          @click="activeName = 'upDown'"
        >{{$i18n('log.menuTag.rel')}}</div>
      </div>
      <div
        class="btn log-btn"
        :class="{active: activeName === 'product'}"
        @click="activeName = 'product'"
      >{{$i18n('log.menuTag.product')}}</div>
    </div>
    <div class="table-main">
      <Product v-if="activeName === 'product'"></Product>
      <UpDown v-if="activeName === 'upDown'"></UpDown>
      <div class="log-table"></div>
    </div>
  </div>
</template>

<script>
import Product from "./coms/productLog.vue";
import UpDown from "./coms/upDownLog.vue";

export default {
  name: "log",
  data() {
    return {
      activeName: "upDown"
    };
  },
  components: { Product, UpDown }
};
</script>

<style lang="scss">
@import "@styles/log.scss";
.tips-font {
  font-size: 12px!important;
}
</style>
