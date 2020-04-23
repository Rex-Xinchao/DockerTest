<template>
  <div class="maintain-main">
    <div class="show-container" v-if="!ISSZSE">
      <div class="title-container">
        <h1>
          {{$i18n('productType.treeTitle_CSF')}}
          <span class="num-show" v-if="permission.pickUpable">
            <el-checkbox v-model="existAdd" class="no-margin" :disabled="!numMap.addCount">
              <span
                :title="$i18n('productType.showMore.addTitle')"
              >{{`${$i18n('productType.showMore.addTxt')}（${numMap.addCount || 0}）`}}</span>
            </el-checkbox>
            <el-checkbox v-model="existRename" class="no-margin" :disabled="!numMap.renameCount">
              <span
                :title="$i18n('productType.showMore.renameTitle')"
              >{{`${$i18n('productType.showMore.renameTxt')}（${numMap.renameCount || 0}）`}}</span>
            </el-checkbox>
            <el-checkbox v-model="existMove" class="no-margin" :disabled="!numMap.moveCount">
              <span
                :title="$i18n('productType.showMore.moveTitle')"
              >{{`${$i18n('productType.showMore.moveTxt')}（${numMap.moveCount || 0}）`}}</span>
            </el-checkbox>
            <el-checkbox v-model="existUnMap" class="no-margin" :disabled="!numMap.unMapCount">
              <span
                :title="$i18n('productType.showMore.UMTitle')"
              >{{`${$i18n('productType.showMore.UMTxt')}（${numMap.unMapCount || 0}）`}}</span>
            </el-checkbox>
          </span>
        </h1>
        <span
          class="top-right"
        >{{`${$i18n('productType.updateTimeTxt')} ${lastHighLightTime || ''}`}}</span>
      </div>
      <div class="tree-container">
        <Tree
          ref="forShow"
          :apiPath="'chinaScopeTree'"
          :type="'forShow'"
          :marginTop="60"
          :showStatus="showStatus"
          @updateNumber="updateNumber"
          @updateTime="getUpdatedInfo"
          @clearTips="clearTips"
        ></Tree>
      </div>
    </div>
    <div class="edit-container">
      <div class="title-container">
        <h1>
          {{`${$i18n('productType.treeTitle_CLIENT')}`}}
          <span
            class="num-show"
            v-if="permission.pickUpable && !ISSZSE"
          >
            <el-checkbox v-model="deleteMapped" class="no-margin" :disabled="!numMap.delMappedCnt">
              <span
                :title="$i18n('productType.showMore.deleteTitle')"
              >{{`${$i18n('productType.showMore.deleteTxt')}（${numMap.delMappedCnt || 0}）`}}</span>
            </el-checkbox>
            <el-checkbox v-model="mulMapped" class="no-margin" :disabled="!numMap.mulMappedCnt">
              <span
                :title="$i18n('productType.showMore.moreTitle')"
              >{{`${$i18n('productType.showMore.moreTxt')}（${numMap.mulMappedCnt || 0}）`}}</span>
            </el-checkbox>
            <el-checkbox v-model="isEmpty" class="no-margin" v-if="false" :disabled="!numMap.isEmpty">
              <span
                :title="$i18n('productType.showMore.emptyTitle')"
              >{{`${$i18n('productType.showMore.emptyTxt')}（${numMap.isEmpty || 0}）`}}</span>
            </el-checkbox>
          </span>
          <div
            class="switch-container"
            :title="$i18n('productType.showMore.resourceSwitchTitle')"
            :class="{active: isSource}"
            v-if="!ISSZSE"
          >
            <el-switch v-if="permission.showable" v-model="isSource" :width="40" active-color="#13ce66" inactive-color="#ccc"></el-switch>
            <span v-if="permission.showable">{{$i18n('productType.showMore.resourceSwitch')}}</span>
          </div>
        </h1>
        <span class="top-right">{{`${$i18n('productType.editTimeTxt')} ${lastUpdateTime || ''}`}}</span>
      </div>
      <div class="tree-container">
        <Tree
          ref="forEdit"
          :type="'forEdit'"
          :marginTop="60"
          :showStatus="showStatusTwo"
          @updateNumber="updateNumber"
          @updateTime="getUpdatedInfo"
          @clearTips="clearTips"
        ></Tree>
      </div>
    </div>
  </div>
</template>

<script>
import Tree from "@components/ztree/zTree";
import { mapGetters } from "vuex";
import { dateTimeFormatter } from "@/utils/index";
import PermissionJudge from "@/mixins/permissionJudge";

export default {
  name: "maintain",
  data() {
    return {
      lastHighLightTime: null,
      lastUpdateTime: null,
      companyName: "申万",
      numMap: {
        addCount: 0,
        renameCount: 0,
        moveCount: 0,
        unMapCount: 0,
        delMappedCnt: 0,
        mulMappedCnt: 0
      },
      existAdd: false,
      existRename: false,
      existMove: false,
      existUnMap: false,
      deleteMapped: false,
      mulMapped: false,
      isEmpty: false,
      isSource: false
    };
  },
  mixins: [PermissionJudge],
  computed: {
    ...mapGetters(["publisherMap", "PUBLISHER", "ISSZSE"]),
    showStatus() {
      return {
        existAdd: this.existAdd,
        existRename: this.existRename,
        existMove: this.existMove,
        existUnMap: this.existUnMap
      };
    },
    showStatusTwo() {
      return {
        deleteMapped: this.deleteMapped,
        mulMapped: this.mulMapped,
        isEmpty: this.isEmpty,
        isSource: this.isSource
      };
    }
  },
  components: { Tree },
  methods: {
    clearTips() {
      this.$msgbox({
        title: this.$i18n("check.productType.clearTitle"),
        message: this.$i18n("check.productType.clearDesc"),
        showCancelButton: true,
        confirmButtonText: this.$i18n("check.sure"),
        cancelButtonText: this.$i18n("check.cancel"),
        beforeClose: (action, instance, done) => {
          if (action === "confirm") {
            this.$put_api("clearTreeStatus", {}).then(data => {
              this.$refs.forShow.init();
              done();
            });
          } else {
            done();
          }
        }
      });
    },
    addRootNode() {
      this.$refs.forEdit.showAddDialog();
    },
    getUpdatedInfo() {
      this.$get_api("getUpdatedInfo", {}).then(res => {
        this.lastHighLightTime = res.csfLastUpdatedTime;
        this.lastUpdateTime = res.clientLastUpdatedTime;
        this.$store.dispatch("SetPUBLISHER", res);
      });
    },
    updateNumber(params) {
      for (let key in params) {
        if (params[key] !== undefined) {
          this.numMap[key] = params[key];
        }
      }
    }
  },
  mounted() {
    this.getUpdatedInfo();
  }
};
</script>

<style lang="scss">
// ztree样式
@import "../../assets/styles/ztree/metroStyle/metroStyle.css";
@import "@styles/productType.scss";
</style>
