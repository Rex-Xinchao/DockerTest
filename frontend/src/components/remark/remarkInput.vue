<template>
  <div class="remark-input">
    <span class="text">备注</span>
    <i v-if="!formShow" title="添加备注" class="icon icon-edit" @click="formShow = true"></i>
    <i
      v-if="!formShow && showHis && (node && node.objectId)"
      title="查看备注历史"
      class="icon icon-clock"
      @click="showHistory"
    ></i>
    <div class="form" v-if="formShow">
      <el-input v-model="remark" placeholder="请输入备注信息" class="check-msg-input"></el-input>
      <div class="btn-box">
        <span class="cancel-btn" @click="cancel">取消</span>
        <span>|</span>
        <span class="check-btn" @click="submit">确定</span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "remarkInput",
  data() {
    const vm = this;
    return {
      remark: "",
      formShow: false
    };
  },
  props: {
    node: {},
    type: { type: Number, default: 1 },
    showHis: { type: Boolean, default: () => true }
  },
  methods: {
    ...mapActions(["SetRemark"]),
    submit() {
      if (this.remark) {
        this.formShow = false;
        this.SetRemark(this.remark);
        this.$emit("onremarkChange", this.remark);
      } else {
        this.$message.error("备注不能为空");
      }
    },
    cancel() {
      this.formShow = false;
      this.remark = "";
    },
    showHistory() {
      let id = this.node ? this.node.objectId : -1;
      this.$eventBus.$emit("remarkDialogShow", id, this.type);
    },
    clearRemark() {
      this.remark = "";
      this.formShow = false;
      this.SetRemark("");
    }
  }
};
</script>
<style lang="scss">
.check-msg-input {
  input {
    padding-right: 100px;
  }
}
</style>
<style lang="scss" scoped>
.remark-input {
  position: absolute;
  top: 12px;
  left: 0;
}

.text {
  display: inline-block;
  vertical-align: top;
  line-height: 14px;
  margin-top: 12px;
  padding-left: 10px;
  border-left: 1px solid #cccccc;
}

.remark-input span {
  display: inline-block;
  vertical-align: top;
  line-height: 14px;
  margin-top: 12px;
}
.icon {
  margin-left: 8px;
  cursor: pointer;
  display: inline-block;

  vertical-align: top;
  width: 14px;
  height: 40px;
  background-repeat: no-repeat;
  background-size: contain;
  background-position-y: 12px;
}

.icon-edit {
  background-image: url("../../assets/imgs/remark/edit.svg");
}

.icon-clock {
  background-image: url("../../assets/imgs/remark/clock.svg");
}

.form {
  width: calc(100% - 120px);
  position: relative;
  display: inline-block;
  margin-left: 8px;

  .btn-box {
    position: absolute;
    right: 8px;
    top: 0;
    color: $color-primary;
    cursor: pointer;

    span {
      display: inline-block;
      margin: 12px 4px;
      color: #999999;
    }

    .check-btn {
      color: #3e73e3;
    }
  }
}
</style>
