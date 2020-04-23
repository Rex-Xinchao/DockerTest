<template>
  <el-dialog
    class="remark-dialog"
    title="备注详情"
    :visible.sync="dialogVisible"
    width="1000px"
    :before-close="dialogClose"
  >
    <span>
      <el-table v-if="tableData.length" :data="tableData" style="width: calc(100% - 42px); margin: 21px 21px 42px 21px;" :row-class-name="tableRowClassName" :header-row-class-name="headerClassName">
        <el-table-column prop="time" label="时间" width="180"></el-table-column>
        <el-table-column prop="msg" label="备注信息"></el-table-column>
        <el-table-column prop="remarker" label="备注人" width="180"></el-table-column>
      </el-table>
      <div v-else class="no-data_show">
        <p>暂无数据</p>
      </div>
    </span>
    <span slot="footer" class="dialog-footer"></span>
  </el-dialog>
</template>

<script>
export default {
  name: "remarkDialog",
  data() {
    const vm = this;
    return {
      dialogVisible: false,
      selectedId: false,
      tableData: []
    };
  },
  methods: {
    dialogShow(id, type = 1) {
      this.dialogVisible = true;
      this.selectedId = id;
      if (id === -1) {
        return;
      }
      this.$get_api("getLog", { type: type, objectId: id }).then(res => {
        this.tableData = res.map(item => {
          return {
            id: item.objectId,
            time: item.createTime,
            remarker: item.operator,
            msg: item.remark
          };
        });
      });
    },
    dialogClose() {
      this.dialogVisible = false;
      this.selectedId = false;
      this.tableData = [];
    },
    tableRowClassName({ row, rowIndex }) {
      if (row.id === this.selectedId) {
        return "selected-row";
      }
      return "";
    },
    headerClassName (data) {
      return 'table-header'
    }
  }
};
</script>
<style lang="scss">
.selected-row {
  // background-color: #ebf1fc !important;
  color: #3e73e3;
  td:nth-of-type(1) {
    border-left: 3px solid #3e73e3;
  }
}
.remark-dialog {
  position: relative;
  .el-dialog__body {
    padding: 0;
  }
}

.table-header{
  color: #444444;
}

.no-data_show{
  height: 160px;
  line-height: 160px;
  text-align: center;
  color: #52575A;
}
</style>
