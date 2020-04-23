<template>
  <div class="productLog-container upDown-log">
    <LogFilter @search="search"></LogFilter>
    <div class="log-table" v-loading="loading">
      <el-table
        id="table"
        ref="table"
        v-if="showTable"
        :data="tableData"
        :cell-class-name="getCellClass"
        :header-cell-class-name="getHeaderClass"
        :border="true"
        style="width: 100%"
        :height="getHeight()"
        :row-class-name="tableRowClassName"
        @cell-mouse-enter="hoverOn"
        @cell-mouse-leave="hoverOff"
      >
        <el-table-column
          prop="operateType"
          :label="$i18n('log.table.type')"
          align="center"
          width="120"
        >
          <template slot-scope="scope">
            <span style="color: #999999;" v-html="getTypeName(scope.row.operateType)"></span>
          </template>
        </el-table-column>
        <el-table-column
          prop="operator"
          :label="$i18n('log.table.user')"
          align="center"
          width="120"
        ></el-table-column>
        <el-table-column align="left" min-width="440">
          <template slot="header">
            <span>
              {{$i18n('log.table.rel')}}
              <span class="sign">{{`（${$i18n('log.table.origin')}）`}}</span>
            </span>
          </template>
          <template slot-scope="scope">
            <span v-if="!scope.row.beforeInfo || !scope.row.beforeInfo.direction">- -</span>
            <RenderDom
              v-else
              :firstData="scope.row.beforeInfo"
              :relationTypeOptions="relationTypeOptions"
              :degreeOptions="degreeOptions"
              :LANGUAGE="LANGUAGE"
            ></RenderDom>
          </template>
        </el-table-column>
        <el-table-column align="left" min-width="440">
          <template slot="header">
            <span>
              {{$i18n('log.table.rel')}}
              <span class="sign">{{`（${$i18n('log.table.updated')}）`}}</span>
            </span>
          </template>
          <template slot-scope="scope">
            <span v-if="!scope.row.afterInfo || !scope.row.afterInfo.direction">- -</span>
            <RenderDom
              v-else
              :firstData="scope.row.afterInfo"
              :relationTypeOptions="relationTypeOptions"
              :degreeOptions="degreeOptions"
              :secondData="scope.row.beforeInfo"
              :LANGUAGE="LANGUAGE"
            ></RenderDom>
          </template>
        </el-table-column>
        <el-table-column
          prop="objectId"
          :label="$i18n('log.table.remark')"
          align="center"
          width="140"
        >
          <template slot-scope="scope">
            <a class="remark-link" @click="showRemark(scope.row.objectId)">
              <img width="16px" height="auto" src="../../../assets/imgs/remark/remark.svg" />
            </a>
          </template>
        </el-table-column>
        <el-table-column
          prop="createdTime"
          width="140"
          :label="$i18n('log.table.time')"
          align="center"
        >
          <template slot-scope="scope">
            <span>{{dateTimeFormatter(scope.row.createdTime)}}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import RenderDom from "./renderRelDom";
import LogFilter from "./logFiter";
import Scroll from "@/mixins/scroll";
import Table from "@/mixins/table";
export default {
  name: "upDownLog",
  data() {
    return {
      tableApi: "getLogByChain"
    };
  },
  computed: {
    ...mapGetters(["degreeOptions", "relationTypeOptions", "LANGUAGE"])
  },
  components: { LogFilter, RenderDom },
  mixins: [Scroll, Table],
  methods: {
    getCellClass(e) {
      if ([3].indexOf(e.columnIndex) >= 0) {
        if (
          (!e.row.beforeInfo.direction && e.row.beforeInfo.direction) ||
          (e.row.beforeInfo.direction && !e.row.beforeInfo.direction) ||
          e.row.beforeInfo.upstreamType !== e.row.afterInfo.upstreamType ||
          e.row.beforeInfo.downstreamType !== e.row.afterInfo.downstreamType ||
          e.row.beforeInfo.upStreamWeight !== e.row.afterInfo.upStreamWeight ||
          e.row.beforeInfo.downStreamWeight !== e.row.afterInfo.downStreamWeight
        ) {
          return "bg-dark-ceil is-back-changed";
        }
        return "bg-dark-ceil";
      }
    },
    getHeaderClass(e) {
      if ([3].indexOf(e.columnIndex) >= 0) {
        return "bg-dark-header";
      }
    },
    getProductName(data, reverse = 1, showTitle = false) {
      let direction = data.direction * reverse;
      let result =
        direction === -1
          ? this.i18n(data, "downStreamName")
          : this.i18n(data, "upStreamName");
      showTitle &&
        (result += direction === -1 ? data.downstreamCode : data.upstreamCode);
      return result;
    },
    getFirstSortClass(reverse = 1) {
      return reverse === -1 ? "left-line-icon_short" : "left-arrow-icon_short";
    },
    getSecondSortClass(reverse = 1) {
      return reverse === -1
        ? "right-line-icon_short"
        : "right-arrow-icon_short";
    },
    getRelationTypeText(data, reverse = 1) {
      if (!data) {
        return "- -";
      }
      let direction = data.direction * reverse;
      let type = direction === -1 ? data.upstreamType : data.downstreamType;
      let text = null;
      this.relationTypeOptions.forEach(item => {
        if (item.value === type) {
          text = item[`label${this.LANGUAGE}`];
        }
      });
      return text;
    },
    getWeightText(data, reverse = 1) {
      let direction = data.direction * reverse;
      let weight =
        direction === -1 ? data.upStreamWeight : data.downStreamWeight;
      if (!weight) {
        return "- -";
      }
      let text = null;
      this.degreeOptions.forEach(item => {
        if (item.value === weight) {
          text = item[`label${this.LANGUAGE}`];
        }
      });
      return text;
    },
    showRemark(id) {
      this.$eventBus.$emit("remarkDialogShow", id, 2);
    },
    getRelDom(data, beforeData) {
      const isAfter = beforeData;
      const h = this.$createElement;
      let list = data.direction === -1 ? [-1, 1] : [1, -1];
      let result = [];
      let isChanged = false;
      list.forEach(val => {
        const productTitle_first = this.getProductName(data, -1, true);
        const productText_first = this.getProductName(data, -1);
        const productTitle_second = this.getProductName(data, 1, true);
        const productText_second = this.getProductName(data, 1);
        const sortClase_first = this.getFirstSortClass(val);
        const sortClase_second = this.getSecondSortClass(val * -1);
        const directionText =
          data.direction === val
            ? this.$i18n("log.table.up")
            : this.$i18n("log.table.down");
        const relTypeText = `（${this.getRelationTypeText(data, val)}）`;
        const weightText = this.getWeightText(data, val * -1);
        let relTypeChanged = false;
        let weightChanged = false;
        if (isAfter) {
          if (
            this.getRelationTypeText(beforeData, val) &&
            this.getRelationTypeText(data, val)
          ) {
            relTypeChanged =
              this.getRelationTypeText(beforeData, val) !==
              this.getRelationTypeText(data, val);
            weightChanged =
              this.getWeightText(beforeData, val * -1) !==
              this.getWeightText(data, val * -1);
          }
          if (relTypeChanged || relTypeChanged) {
            isChanged = true;
          }
        }
        result.push(
          h("p", [
            h(
              "el-popover",
              {
                props: {
                  placement: "top-start",
                  width: "300",
                  trigger: "hover"
                }
              },
              [
                h("div", { class: "tips" }, [
                  h("p", { class: "name" }, productTitle_first)
                ]),
                h(
                  "span",
                  {
                    class: "text-name",
                    slot: "reference"
                  },
                  productText_first
                )
              ]
            ),
            h("i", { class: sortClase_first }),
            h("span", { class: "text" }, directionText),
            h(
              "span",
              { class: relTypeChanged ? "sub-text is-changed" : "sub-text" },
              relTypeText
            ),
            h(
              "span",
              {
                class: weightChanged ? "text-weight is-changed" : "text-weight"
              },
              weightText
            ),
            h("i", { class: sortClase_second }),
            h(
              "el-popover",
              {
                props: {
                  placement: "top-start",
                  width: "300",
                  trigger: "hover"
                }
              },
              [
                h("div", { class: "tips" }, [
                  h("p", { class: "name" }, productTitle_second)
                ]),
                h(
                  "span",
                  {
                    class: "text-name",

                    slot: "reference"
                  },
                  productText_second
                )
              ]
            )
          ])
        );
      });
      let vdom = h("div", result);
      let dom = this.__patch__(null, vdom, false, false);
      return dom.innerHTML;
    },
    hoverOn(row, column, cell, event) {
      $(cell)[0].parentNode.classList.add("isHover");
    },
    hoverOff(row, column, cell, event) {
      $(cell)[0].parentNode.classList.remove("isHover");
    }
  }
};
</script>
<style lang="scss" scoped>
.remark-link {
  display: block;
  margin: 0 auto;
  text-align: center;
  height: 20px;

  img {
    cursor: pointer;
  }
}

.isHover {
  .is-changed {
    color: #ff6466 !important;
    &.text-weight {
      background-color: #f6e7ea !important;
    }
  }

  .back-change {
    background-color: #fff3f3 !important;
  }
}
</style>