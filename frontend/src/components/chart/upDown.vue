<template>
  <el-dialog :title="title" :visible.sync="dialogVisible" width="800px" :before-close="dialogClose">
    <span style="display:block;">
      <remarkInput
        v-show="true"
        ref="remarkInput"
        :node="object"
        :type="2"
        style="left: 104px; width: 650px"
      ></remarkInput>
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        :label-width="type === 'add' ? '100px' : '0'"
        size="small"
      >
        <el-form-item
          :label="$i18n('chart.dialog.product')"
          prop="productCode"
          v-if="type === 'add'"
        >
          <el-select
            class="inline-input cursor-pointer"
            v-model="form.productCode"
            filterable
            remote
            reserve-keyword
            :placeholder="$i18n('chart.dialog.productPlaceholder')"
            :remote-method="querySearch"
            :loading="loading"
          >
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
              <span class="product-li">
                {{item.label}}
                <span class="sign">{{item.value}}</span>
                <span class="sign">{{`level：${item.level}`}}</span>
              </span>
            </el-option>
          </el-select>
          <span
            class="isExist-tip"
            v-if="type === 'add' && btnDisabledA && btnDisabledB"
          >{{`${direction === -1 ? $i18n('common.up'): $i18n('common.down')}${$i18n('chart.dialog.isExsit')}`}}</span>
        </el-form-item>
        <el-form-item
          :label="`${type === 'add' ? $i18n('chart.dialog.rel') : ''}`"
          style="margin-bottom: 0"
        >
          <ul class="relation-container">
            <li class="operate">
              <div class="left">
                <span>{{nodeA.name}}</span>
                <i class="right-arrow-icon">
                  <span class="tip-text" v-html="getRelText(direction)"></span>
                </i>
                <span
                  :style="{'color': type === 'add' ? '#456EE8' : ''}"
                >{{ nodeB.name || (direction === -1 ? $i18n('common.up_p') : $i18n('common.up_p'))}}</span>
              </div>
              <div class="mid">
                <el-select
                  class="fl"
                  style="width: 150px"
                  ref="rel"
                  v-model="relationA.relationType"
                  size="mini"
                  :placeholder="$i18n('chart.dialog.typePlaceholder')"
                  :disabled="btnDisabledA"
                >
                  <el-option
                    v-for="item in relationTypeOptions"
                    :key="item.value"
                    :label="item[`label${LANGUAGE}`]"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </div>
              <div class="right">
                <el-select
                  class="fl"
                  style="width: 130px"
                  v-model="relationA.weight"
                  size="mini"
                  :placeholder="$i18n('chart.dialog.weightPlaceholder')"
                  :disabled="btnDisabledA"
                >
                  <el-option
                    v-for="item in degreeOptions"
                    :key="item.value"
                    :label="item[`label${LANGUAGE}`]"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </div>
            </li>
          </ul>
          <ul class="relation-container">
            <li class="operate">
              <div class="left">
                <span>{{nodeA.name}}</span>
                <i class="left-arrow-icon">
                  <span class="tip-text" v-html="getRelText(direction * -1)"></span>
                </i>
                <span
                  :style="{'color': type === 'add' ? '#456EE8' : ''}"
                >{{ nodeB.name || (direction === -1 ? $i18n('common.up_p') : $i18n('common.down_p'))}}</span>
              </div>
              <div class="mid">
                <el-select
                  class="fl"
                  style="width: 150px"
                  ref="rel"
                  v-model="relationB.relationType"
                  size="mini"
                  :placeholder="$i18n('chart.dialog.typePlaceholder')"
                  :disabled="btnDisabledB"
                >
                  <el-option
                    v-for="item in relationTypeOptions"
                    :key="item.value"
                    :label="item[`label${LANGUAGE}`]"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </div>
              <div class="right">
                <el-select
                  class="fl"
                  style="width: 130px"
                  v-model="relationB.weight"
                  size="mini"
                  :placeholder="$i18n('chart.dialog.weightPlaceholder')"
                  :disabled="btnDisabledB"
                >
                  <el-option
                    v-for="item in degreeOptions"
                    :key="item.value"
                    :label="item[`label${LANGUAGE}`]"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </div>
            </li>
          </ul>
        </el-form-item>
      </el-form>
    </span>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogClose">{{$i18n('common.cancelBtn')}}</el-button>
      <el-button
        type="primary"
        @click="dialogSave"
        :disabled="btnDisabled"
      >{{`${type === 'add' ? $i18n('common.addBtn') : $i18n('common.sureBtn')}`}}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { mapGetters } from "vuex";
import ProductSearch from "@/mixins/productSearch";
import remarkInput from "@components/remark/remarkInput";

const UP = -1;
const DOWN = 1;
export default {
  name: "up-down",
  data() {
    let vm = this;
    return {
      dialogVisible: false,
      form: {
        productCode: ""
      },
      rules: {
        productCode: [
          { required: true, message: "请输入产品名称", trigger: "change" }
        ]
      },
      searchParams: {},
      nodeA: {},
      nodeB: {},
      relationA: {
        weight: null,
        relationType: null
      },
      btnDisabledA: false,
      relationB: {
        weight: null,
        relationType: null
      },
      btnDisabledB: false,
      object: {}
    };
  },
  mixins: [ProductSearch],
  components: { remarkInput },
  computed: {
    ...mapGetters([
      "degree",
      "relationType",
      "degreeOptions",
      "relationTypeOptions",
      "LANGUAGE"
    ]),
    btnDisabled() {
      if (this.type === "add") {
        if (this.btnDisabledA && this.btnDisabledB) {
          return true;
        }
        if (!this.form.productCode) {
          return true;
        }
      }
      return !(
        this.relationA.relationType &&
        this.relationA.weight &&
        this.relationB.relationType &&
        this.relationB.weight
      );
    }
  },
  props: {
    dialogShow: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      required: false,
      default: "添加上游"
    },
    type: {
      type: String,
      required: false,
      default: "add"
    },
    direction: {
      type: Number,
      required: false,
      default: 1
    },
    link: {
      type: Object
    },
    node: {
      type: Object
    }
  },
  watch: {
    dialogShow(data) {
      if (!data) {
        // false 不继续执行
        return;
      }
      this.dialogVisible = data;
      this.searchParams.direction = this.direction;
      if (this.link) {
        this.searchParams.code = this.link.source.data.startCode;
        this.searchParams.target = this.link.target.data.code;
        this.nodeA = {
          code: this.link.source.data.startCode,
          name: this.link.source.data.startName
        };
        this.nodeB = {
          code: this.link.target.data.code,
          name: this.link.target.data.name
        };
        this.object = this.link.target.data;
      }
      if (this.node) {
        this.searchParams.code = this.node.code;
        this.nodeA = {
          name: this.node.name,
          code: this.node.code
        };
        this.object = null
      }
      if (this.searchParams.target) {
        this.searchRelation();
      }
      this.$refs.form && this.$refs.form.clearValidate();
    },
    "form.productCode"(data) {
      this.searchParams.target = data;
      const obj = this.options.find(item => item.value === data);
      if (!obj) {
        return;
      }
      this.nodeB = {
        name: obj.label ? obj.label : null,
        code: data
      };
      this.searchRelation();
    }
  },
  methods: {
    getRelText(direction) {
      return direction === UP
        ? this.$i18n("common.up")
        : this.$i18n("common.down");
    },
    searchRelation() {
      this.$get_api("getProductByCode", {
        code: this.searchParams.code,
        target: this.searchParams.target,
        direction: this.searchParams.direction
      }).then(res => {
        if (res.length === 0) {
          this.relationA.weight = "";
          this.relationA.relationType = "";
          this.btnDisabledA = false;
          this.relationB.weight = "";
          this.relationB.relationType = "";
          this.btnDisabledB = false;
        }
        res.forEach(item => {
          if (item.direction === this.searchParams.direction) {
            this.relationA.weight = item.weight;
            this.relationA.relationType = item.relationType;
            this.btnDisabledA = this.type === "add"; // 添加关系的情况下已有记录不许编辑
          } else {
            this.relationB.weight = item.weight;
            this.relationB.relationType = item.relationType;
            this.btnDisabledB = this.type === "add";
          }
        });
      });
    },
    dialogSave() {
      this.$refs.form.validate(valid => {
        if (valid || this.type === "edit") {
          let params = {
            source: this.nodeA.code,
            target: this.nodeB.code,
            targetName: this.nodeB.name,
            direction: this.direction,
            upRelation: this.direction === UP ? this.relationA : this.relationB,
            downRelation:
              this.direction === DOWN ? this.relationA : this.relationB
          };
          this.$emit("change", params, this.type);
          this.dialogClose();
        } else {
          return false;
        }
      });
    },
    dialogClose() {
      this.dialogVisible = false;
      this.nodeA = {};
      this.nodeB = {};
      this.form = {
        productCode: null
      };
      this.searchParams = {};
      this.relationA = {
        weight: null,
        relationType: null
      };
      this.btnDisabledA = false;
      this.relationB = {
        weight: null,
        relationType: null
      };
      this.btnDisabledB = false;
      this.options = [];
      this.$refs.remarkInput.clearRemark();
      this.$emit("change");
    }
  }
};
</script>
