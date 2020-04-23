<template>
  <div class="productLog-container product-log" ref="productLog">
    <LogFilter @search="search"></LogFilter>
    <div class="log-table" v-loading="loading">
      <el-table
        id="table"
        ref="table"
        v-if="showTable"
        :data="tableData"
        :cell-class-name="getCellClass"
        :header-cell-class-name="getHeaderClass"
        style="width: 100%"
        :height="getHeight()"
        :row-class-name="tableRowClassName"
        @cell-mouse-enter="hoverOn"
        @cell-mouse-leave="hoverOff"
      >
        <el-table-column
          prop="operatType"
          :label="$i18n('log.table.type')"
          align="center"
          width="80"
        >
          <template slot-scope="scope">
            <span style="color: #999999;" v-html="getTypeName(scope.row.operatType)"></span>
          </template>
        </el-table-column>
        <el-table-column
          prop="operator"
          :label="$i18n('log.table.user')"
          align="center"
          width="120"
        ></el-table-column>
        <el-table-column align="center" :label="$i18n('log.table.origin')">
          <el-table-column align="left">
            <template slot="header">
              <span>{{$i18n('log.table.node')}}</span>
            </template>
            <template slot-scope="scope">
              <Render-Product :firstData="scope.row.beforeInfo" :LANGUAGE="LANGUAGE"></Render-Product>
            </template>
          </el-table-column>
          <el-table-column align="left" v-if="!ISSZSE">
            <template slot="header">
              <span>{{$i18n('log.table.map')}}</span>
            </template>
            <template slot-scope="scope">
              <Render-MapInfo
                :firstData="scope.row.beforeInfo"
                :LANGUAGE="LANGUAGE"
              ></Render-MapInfo>
            </template>
          </el-table-column>
          <el-table-column align="left">
            <template slot="header">
              <span>{{$i18n('log.table.parent')}}</span>
            </template>
            <template slot-scope="scope">
              <Render-Parent :firstData="scope.row.beforeInfo" :LANGUAGE="LANGUAGE"></Render-Parent>
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column align="center" :label="$i18n('log.table.updated')">
          <el-table-column align="left">
            <template slot="header">
              <span>{{$i18n('log.table.node')}}</span>
            </template>
            <template slot-scope="scope">
              <Render-Product
                :firstData="scope.row.afterInfo"
                :secondData="scope.row.beforeInfo"
                :LANGUAGE="LANGUAGE"
              ></Render-Product>
            </template>
          </el-table-column>
          <el-table-column align="left" v-if="!ISSZSE">
            <template slot="header">
              <span>{{$i18n('log.table.map')}}</span>
            </template>
            <template slot-scope="scope">
              <Render-MapInfo
                :firstData="scope.row.afterInfo"
                :secondData="scope.row.beforeInfo"
                :LANGUAGE="LANGUAGE"
              ></Render-MapInfo>
            </template>
          </el-table-column>
          <el-table-column align="left">
            <template slot="header">
              <span>{{$i18n('log.table.parent')}}</span>
            </template>
            <template slot-scope="scope">
              <Render-Parent
                :firstData="scope.row.afterInfo"
                :secondData="scope.row.beforeInfo"
                :LANGUAGE="LANGUAGE"
              ></Render-Parent>
            </template>
          </el-table-column>
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
          :label="$i18n('log.table.time')"
          align="center"
          width="140"
        >
          <template slot-scope="scope">
            <span>{{dateTimeFormatter(scope.row.createTime)}}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import LogFilter from "./logFiter";
import RenderProduct from "./renderProduct";
import RenderParent from "./renderParent";
import RenderMapInfo from "./renderMapInfo";
import Scroll from "@/mixins/scroll";
import Table from "@/mixins/table";
import { mapGetters } from "vuex";
export default {
  name: "productLog",
  data() {
    return {
      tableApi: "getLogByProduct"
    };
  },
  components: { LogFilter, RenderProduct, RenderParent, RenderMapInfo },
  mixins: [Scroll, Table],
  computed: {
    ...mapGetters(["LANGUAGE", "ISSZSE"])
  },
  methods: {
    getCellClass(e) {
      if (e.columnIndex === 5) {
        let result = "bg-dark-ceil ";
        if (
          (!e.row.beforeInfo[`name${this.LANGUAGE}`] &&
            e.row.afterInfo[`name${this.LANGUAGE}`]) ||
          (e.row.beforeInfo[`name${this.LANGUAGE}`] &&
            !e.row.afterInfo[`name${this.LANGUAGE}`]) ||
          e.row.beforeInfo[`name${this.LANGUAGE}`] !==
            e.row.afterInfo[`name${this.LANGUAGE}`]
        ) {
          result += "is-back-changed ";
        }
        if (
          (!e.row.beforeInfo.desc && e.row.afterInfo.desc) ||
          (e.row.beforeInfo.desc && e.row.afterInfo.desc && e.row.beforeInfo.desc !== e.row.afterInfo.desc)
        ) {
          result += "is-desc-changed ";
        }
        return result;
      }
      if (e.columnIndex === 6) {
        if (
          (!this.getMap(e.row.beforeInfo["mapperInfo"]) &&
            this.getMap(e.row.afterInfo["mapperInfo"])) ||
          (this.getMap(e.row.beforeInfo["mapperInfo"]) &&
            !this.getMap(e.row.afterInfo["mapperInfo"])) ||
          this.getMap(e.row.beforeInfo["mapperInfo"]) !==
            this.getMap(e.row.afterInfo["mapperInfo"])
        ) {
          return "bg-dark-ceil is-back-changed";
        }
        return "bg-dark-ceil";
      }
      if (e.columnIndex === 7) {
        e.row.beforeInfo.parent = e.row.beforeInfo.parent || "";
        e.row.afterInfo.parent = e.row.afterInfo.parent || "";
        if (
          (!e.row.beforeInfo.parent && e.row.afterInfo.parent) ||
          (e.row.beforeInfo.parent && !e.row.afterInfo.parent) ||
          e.row.beforeInfo.parent !== e.row.afterInfo.parent
        ) {
          return "bg-dark-ceil is-back-changed";
        }
        return "bg-dark-ceil";
      }
    },
    getHeaderClass(e) {
      if ([3, 4, 5].indexOf(e.columnIndex) >= 0 && e.rowIndex === 1) {
        return "bg-dark-header";
      } else if ([3].indexOf(e.columnIndex) >= 0 && e.rowIndex === 0) {
        return "bg-dark-header";
      }
    },
    getMap(data) {
      let result = "";
      let vm = this;
      if (data && data.length) {
        data.forEach(item => {
          result +=
            result === "" ? "" : "<span style='color: #999999'> | </span>";
          result += `${vm.i18n(item, "name")}`;
        });
      }
      return result === "" ? "--" : result;
    },
    showRemark(id) {
      this.$eventBus.$emit("remarkDialogShow", id, 1);
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
}
</style>
<style lang="scss">
.is-desc-changed {
  position: relative;
  &::after {
    content: "  ";
    position: absolute;
    top: 4px;
    right: 2px;
    display: block;
    width: 12px;
    height: 12px;
    background-image: url("~@/assets/imgs/desc.svg");
    background-repeat: no-repeat;
    background-size: contain;
  }
}
</style>