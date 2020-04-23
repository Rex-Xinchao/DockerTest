import { mapGetters } from 'vuex';
<template>
  <div class="init-main" v-loading="loading" element-loading-text="正在初始化中，请稍等～">
    <h1 class="init-title">请选择行业分类</h1>
    <ul class="type-select-container">
      <li class="CSF" :class="{active: active === 'CSF'}" @click="active = 'CSF'">
        <img src="~@/assets/imgs/init/CSF.png" width="392" />
      </li>
      <li class="SW" :class="{active: active === 'SYWG'}" @click="active = 'SYWG'">
        <img src="~@/assets/imgs/init/SW.png" width="392" />
      </li>
      <li class="GB" :class="{active: active === 'GB'}" @click="active = 'GB'">
        <img src="~@/assets/imgs/init/GB.png" width="392" />
      </li>
    </ul>
    <el-button type="primary" class="sure-btn" @click="init">确定</el-button>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "init",
  data() {
    return {
      active: null,
      loading: false
    };
  },
  computed: {
    ...mapGetters(["PUBLISHERLIST"])
  },
  methods: {
    init() {
      if (!this.active) {
        this.$message.error("请选择一个行业分类");
        return;
      }
      this.loading = true;
      let publisher = "CSF";
      this.PUBLISHERLIST &&
        this.PUBLISHERLIST.forEach(item => {
          if (item.indexOf(this.active) >= 0) {
            publisher = item;
          }
        });
      this.$post_api("initData", JSON.stringify({ publisher: publisher })).then(
        res => {
          sessionStorage.clear();
          this.$router.push("/index");
          this.loading = false;
        }
      );
    }
  }
};
</script>

<style lang="scss">
.init-main {
  padding: 120px 90px;

  .init-title {
    text-align: center;
    font-size: 32px;
    font-weight: 500;
    color: rgba(68, 68, 68, 1);
    line-height: 45px;
    letter-spacing: 1px;
    margin: 0;
  }

  .type-select-container {
    display: block;
    width: 100%;
    height: 240px;
    box-sizing: border-box;
    overflow: hidden;
    margin: 40px 0 80px 0;
    padding: 0;

    li {
      display: inline-block;
      width: calc((100% - 80px) / 3);
      height: 100%;

      &:nth-child(2) {
        margin: 0 40px;
      }

      img {
        display: block;
        margin: 0 auto;
        cursor: pointer;
      }

      &.active {
        img {
          display: block;
          border-radius: 12px;
          box-sizing: border-box;
          border: 2px solid rgba(62, 115, 227, 1);
        }
      }
    }
  }

  .sure-btn {
    display: block;
    padding: 12px 32px;
    margin: 0 auto;
  }
}
</style>
