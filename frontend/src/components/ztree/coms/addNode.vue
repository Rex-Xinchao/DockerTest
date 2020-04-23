<template>
  <el-dialog
    :title="type === 'add' ? (isRoot ? $i18n('ztree.dialog.title_addRoot') : $i18n('ztree.dialog.title_addChild')) : $i18n('ztree.dialog.title_edit')"
    class="add-node-dialog"
    :visible.sync="dialogVisible"
    width="960px"
    :before-close="dialogClose"
  >
    <span style="display:block;padding: 0 190px">
      <remarkInput
        v-show="true"
        ref="remarkInput"
        :node="currentNode"
        :showHis="type !== 'add'"
        :style="{left: isRoot ? '120px' : '104px', width: '800px'}"
      ></remarkInput>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px" size="small">
        <el-form-item label=" " style="margin-bottom: 0;" prop="isBlank" v-if="!ISSZSE">
          <el-checkbox
            v-model="form.isBlank"
            style="line-height: 1;"
            @change="onCheckChange"
          >{{type === 'add' ? $i18n('ztree.dialog.emptyCheckTxt_add') : $i18n('ztree.dialog.emptyCheckTxt_edit')}}</el-checkbox>
        </el-form-item>
        <el-form-item :label="$i18n('ztree.dialog.nodeTxt')" prop="name">
          <el-input v-model="form.name" :placeholder="$i18n('ztree.dialog.nodePlaceholder')"></el-input>
        </el-form-item>
        <el-form-item :label="$i18n('ztree.dialog.productTxt')" prop="mappings" v-if="!ISSZSE">
          <el-select
            ref="productSearch"
            style="width: 100%;"
            class="cursor-pointer product-search"
            v-model="form.mappings"
            multiple
            filterable
            remote
            reserve-keyword
            :placeholder="$i18n('ztree.dialog.productPlaceholder')"
            :remote-method="querySearch"
            :loading="loading"
            :disabled="form.isBlank"
          >
            <el-option
              v-for="item in options.concat(this.options_d)"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
              <span class="product-li">
                {{item.label}}
                <span class="sign">{{item.value}}</span>
                <span class="sign">{{`层级：${item.level}`}}</span>
              </span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label=" " v-if="form.mappings && form.mappings.length && !ISSZSE">
          <el-tag
            style="margin-right: 6px"
            v-for="item in form.mappings"
            :key="item"
            size="mini"
            closable
            @close="delItem(item)"
          >{{getItemName(item)}}</el-tag>
        </el-form-item>
        <el-form-item :label="$i18n('ztree.dialog.descTxt')" v-if="!descEditShow">
          <span class="text-desc-overflow">{{this.form.desc || '--'}}</span>
          <i class="el-icon-edit edit-btn edit-btn-overflow" @click="descEditShow = true"></i>
        </el-form-item>
        <el-form-item :label="$i18n('ztree.dialog.descTxt')" v-if="descEditShow">
          <textarea class="text-area" v-model="form.desc"></textarea>
        </el-form-item>
        <el-form-item :label="$i18n('ztree.dialog.parentTxt')" v-show="!isRoot && !parentEditShow">
          <span class="product-li">
            {{options_p.filter(item => item.value === form.parent)[0] ? options_p.filter(item => item.value === form.parent)[0].label : '根层级'}}
            <span
              v-if="options_p.filter(item => item.value === form.parent)[0] && options_p.filter(item => item.value === form.parent)[0].productCode"
              class="sign"
            >{{ options_p.filter(item => item.value === form.parent)[0].productCode}}</span>
            <span
              class="sign"
              v-if="options_p.filter(item => item.value === form.parent)[0] && options_p.filter(item => item.value === form.parent)[0].level"
            >{{`层级: ${options_p.filter(item => item.value === form.parent)[0].level}`}}</span>
          </span>
          <i v-if="type === 'edit'" class="el-icon-edit edit-btn" @click="parentEditShow = true"></i>
        </el-form-item>
        <el-form-item :label="$i18n('ztree.dialog.parentTxt')" v-show="!isRoot && parentEditShow">
          <el-select
            ref="parentSearch"
            style="width: 100%;"
            v-model="form.parent"
            filterable
            remote
            reserve-keyword
            :placeholder="$i18n('ztree.dialog.parentPlaceholder')"
            :remote-method="querySearchParent"
            :loading="loading"
            :disabled="type === 'add'"
            :clearable="true"
            @clear="clearOption"
          >
            <el-option
              v-for="item in options_p"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
              <span class="product-li">
                {{item.label}}
                <span class="sign">{{item.value}}</span>
                <span class="sign">{{`层级：${item.level}`}}</span>
              </span>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </span>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogClose">{{$i18n('common.cancelBtn')}}</el-button>
      <el-button type="primary" @click="dialogSave">{{$i18n('common.sureBtn')}}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { mapGetters } from "vuex";
import remarkInput from "@components/remark/remarkInput";
export default {
  name: "add-node",
  data() {
    let vm = this;
    return {
      dialogVisible: false,
      form: {
        isBlank: false,
        name: "",
        parent: "",
        mappings: [],
        desc: "",
        versionId: ""
      },
      rules: {
        name: [{ required: true, message: "请输入节点名称", trigger: "blur" }],
        mappings: [
          {
            validator: (rule, value, callback) => {
              // if (vm.form.isBlank) {
              //   callback();
              // } else if (value.length === 0) {
              //   callback(new Error("请选择产品名称"));
              // } else {
              callback();
              // }
            },
            trigger: "blur"
          }
        ]
      },
      loading: false,
      options: [],
      options_o: [],
      options_d: [],
      options_p: [],
      mappings: null, // 包含节点信息的mapList
      type: null,
      isRoot: true,
      descEditShow: false,
      parentEditShow: false
    };
  },
  components: { remarkInput },
  props: {
    currentNode: {
      required: true
    }
  },
  computed: {
    ...mapGetters(["LANGUAGE", "ISSZSE"])
  },
  watch: {
    "form.mappings"(data) {
      if (data && data.length) {
        setTimeout(e => {
          $(".product-search")
            .eq(0)
            .find("input.el-select__input")
            .attr(
              "placeholder",
              "请输入映射产品关键词（数库分类中[未映射]节点）"
            );
        }, 0);
      } else {
        setTimeout(e => {
          $(".product-search")
            .eq(0)
            .find("input.el-select__input")
            .attr("placeholder", "");
        }, 0);
      }
    }
  },
  methods: {
    getNodeDate(code) {
      this.$get_api("getNodeInfo", { productCode: code }).then(res => {
        this.mappings = res.mapInfos;
        this.form.desc = res.desc;
        if (this.mappings && this.mappings.length) {
          this.mappings.forEach(item => {
            this.form.mappings.push(item.productCode);
          });
          this.options_o.concat(this.mappings);
          this.form.isBlank = false;
        } else {
          this.form.isBlank = true;
        }
      });
    },
    dialogShow(isRoot, params) {
      this.isRoot = isRoot;
      this.dialogVisible = true;
      this.type = params.type;
      this.options_d = [];
      this.options_o = [];
      this.options = [];
      this.mappings = [];
      this.form.mappings = [];
      if (this.type === "add") {
        this.form.isBlank = false;
        this.form.name = "";
        this.form.parent = this.isRoot ? "" : this.currentNode.productCode;
      } else {
        this.form.name = params.name;
        this.form.versionId = params.versionId;
        this.getNodeDate(this.currentNode.productCode);
        this.form.parent = this.currentNode.getParentNode()
          ? this.currentNode.getParentNode().productCode
          : null;
      }
      this.querySearch("");
      this.querySearchParent(this.form.parent);
    },
    dialogSave(formName) {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$emit(
            "change",
            {
              isRoot: this.isRoot,
              // isBlank: this.form.isBlank,
              isBlank: true,
              name: this.form.name,
              parent: this.form.parent,
              // mappings: this.form.mappings,
              mappings: [],
              versionId: this.form.versionId,
              desc: this.form.desc
            },
            this.type
          );
          this.dialogClose();
        } else {
          return false;
        }
      });
    },
    dialogClose() {
      this.isRoot = true;
      this.dialogVisible = false;
      this.descEditShow = false;
      this.parentEditShow = false;
      this.form = {
        isBlank: false,
        name: "",
        parent: "",
        mappings: [],
        desc: "",
        versionId: ""
      };
      this.$refs.form.resetFields();
      this.$refs.remarkInput.clearRemark();
      this.$emit("change");
    },
    onCheckChange(data) {
      if (data) {
        this.form.mappings.forEach(code => {
          let { name, level } = this.getValue(code);
          if (
            !this.options_d.find(item => item.value === code) &&
            this.mappings.find(item => item.productCode === code)
          ) {
            this.options_d.push({
              value: code,
              label: name,
              level: level
            });
          }
        });
        this.form.mappings && (this.form.mappings = []);
        this.$refs.form.clearValidate();
      }
    },
    querySearch(queryString) {
      if (queryString && queryString.trim()) {
        this.loading = true;
        this.$get_api("unmappedProduct", { keyword: queryString }).then(res => {
          this.loading = false;
          res.sort((a, b) => {
            return a.level - b.level;
          });
          res.forEach(item => {
            item.value = item.productCode;
            item.label = item.name;
          });
          res = res.filter(item => item.level > 3);
          this.options_o = this.options_o.concat(res);
          this.options = res.slice();
        });
      } else {
        this.loading = true;
        this.$get_api("unmappedProduct", { keyword: "", limit: 20 }).then(
          res => {
            this.loading = false;
            res.sort((a, b) => {
              return a.level - b.level;
            });
            res.forEach(item => {
              item.value = item.productCode;
              item.label = item.name;
            });
            this.options_o = this.options_o.concat(res);
            this.options = res.slice();
          }
        );
      }
    },
    querySearchParent(queryString) {
      if (queryString && queryString.trim()) {
        this.loading = true;
        this.$get_api("getProductList", { keyword: queryString }).then(res => {
          this.loading = false;
          res.sort((a, b) => {
            return a.level - b.level;
          });
          res.forEach(item => {
            item.value = item.productCode;
            item.label = item.name;
          });
          this.options_p = res.slice();
        });
      } else {
        this.options_p = [];
      }
    },
    clearOption() {
      this.options_p = [];
    },
    getItemName(code) {
      let result = null;
      this.options_o.forEach(e => {
        if (e.value === code) {
          result = `${e.name}[${e.code || e.productCode} | 层级：${e.level ||
            "--"}]`;
        }
      });
      this.mappings &&
        this.mappings.forEach(e => {
          if (e.productCode === code) {
            result = `${e.name}[${e.code || e.productCode} | 层级：${e.level ||
              "--"}]`;
          }
        });
      return result;
    },
    getValue(code) {
      let result = null;
      this.options_o.forEach(e => {
        if (e.value === code) {
          result = { name: e.name, level: e.level };
        }
      });
      this.mappings &&
        this.mappings.forEach(e => {
          if (e.productCode === code) {
            result = { name: e.name, level: e.level };
          }
        });
      return result;
    },
    delItem(code) {
      let index = this.form.mappings.indexOf(code);
      this.form.mappings.splice(index, 1);
      let { name, level } = this.getValue(code);
      if (
        !this.options_d.find(item => item.value === code) &&
        this.mappings.find(item => item.productCode === code)
      ) {
        this.options_d.push({
          value: code,
          label: name,
          level: level
        });
      }
    },
    getDesc() {
      if (!this.form.desc) {
        return "--";
      } else if (this.form.desc.length <= 25) {
        return this.form.desc;
      } else {
        return this.form.desc.substring(0, 28) + "...";
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.edit-btn {
  color: $color-primary;
  font-weight: bolder;
  font-size: 14px;
  margin-left: 8px;
  cursor: pointer;
}
.edit-btn-overflow {
  display: inline-block;
  vertical-align: top;
  line-height: 32px;
}
.text-desc-overflow {
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 400px;
  vertical-align: top;
}
.text-area {
  width: 440px;
  height: 60px;
  box-sizing: border-box;
  font-size: 14px;
  color: #606266;
  padding: 8px 15px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  font-family: Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB,
    Microsoft YaHei, Arial, sans-serif;
}
</style>