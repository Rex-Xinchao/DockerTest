<template>
  <div class="log-filter">
    <el-form :inline="true" :model="form" size="small">
      <el-form-item :label="$i18n('log.filter.time')">
        <el-date-picker
          class="width_240"
          v-model="form.date"
          type="daterange"
          :editable="false"
          :picker-options="pickerOptions"
          range-separator="-"
          :start-placeholder="$i18n('common.startTime')"
          :end-placeholder="$i18n('common.endTime')"
          @change="clearLimit"
        ></el-date-picker>
      </el-form-item>
      <el-form-item class="cursor-pointer" :label="$i18n('log.filter.type')">
        <el-select
          class="width_180"
          v-model="form.type"
          :placeholder="$i18n('log.filter.typePlaceholder')"
        >
          <el-option
            v-for="item in operateTypeOptions"
            :label="item[`label${LANGUAGE}`]"
            :value="item.value"
            :key="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="产品：" v-if="false">
        <el-select
          v-model="form.productCode"
          filterable
          remote
          reserve-keyword
          placeholder="请输入产品名"
          :remote-method="querySearch"
          :clearable="true"
        >
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
            <span>{{`${item.label} [ ${item.value} | level：${item.level} ]`}}</span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$i18n('log.filter.user')">
        <el-input
          class="width_180"
          v-model="form.username"
          :placeholder="$i18n('log.filter.userPlaceholder')"
          :clearable="true"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="search" class="search-btn">
          <i class="icon-search"></i>
          {{$i18n('log.filter.btnTxt')}}
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import ProductSearch from "@/mixins/productSearch";
import { mapGetters } from "vuex";
export default {
  name: "productLog",
  data() {
    const vm = this;
    return {
      form: {
        username: "",
        productCode: "",
        type: "",
        date: vm.getRecentTwoWeek()
      },
      pickerMinDate: null,
      pickerMaxDate: new Date().getTime(),
      pickerOptions: {
        disabledDate(time) {
          return (
            time.getTime() > vm.pickerMaxDate ||
            time.getTime() < vm.pickerMinDate
          );
        },
        onPick({ maxDate, minDate }) {
          vm.pickerMinDate = new Date(minDate).getTime() - 6 * 3600 * 24 * 1000;
          let time = new Date(minDate).getTime() + 6 * 3600 * 24 * 1000;
          vm.pickerMaxDate =
            time > new Date().getTime() ? new Date().getTime() : time;
        }
      }
    };
  },
  mixins: [ProductSearch],
  computed: {
    ...mapGetters(["operateTypeOptions", "LANGUAGE"])
  },
  methods: {
    getRecentTwoWeek() {
      let now = new Date().getTime();
      return [new Date(now - 1000 * 3600 * 24 * 6), new Date()];
    },
    search() {
      this.loading = true;
      this.$emit("search", this.form);
    },
    clearLimit() {
      (this.pickerMinDate = null), (this.pickerMaxDate = new Date().getTime());
    }
  },
  mounted() {
    this.search();
  }
};
</script>
<style lang="scss" scope>
.icon-search {
  display: inline-block;
  width: 14px;
  height: 14px;
  margin-right: 4px;
  background-image: url(~@/assets/imgs/search-btn.svg);
  background-repeat: no-repeat;
  vertical-align: middle;
}
.search-btn{
  height: 32px;
  box-sizing: border-box;
}
</style>