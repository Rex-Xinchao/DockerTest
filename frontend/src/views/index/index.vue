<template>
  <div class="container-horizontal index-main">
    <div class="sidebar" id="siderbar" :style="{width: siderWidth +'px'}">
      <div class="sidebar-main">
        <h1 class="sidebar-title">{{`${$i18n('index.menuTitle')}`}}</h1>
        <Tree type="forMenu" apiPath="getTree_menu"></Tree>
      </div>
      <div class="move-w" id="moveW" v-if="false"></div>
      <div class="siderbar-more" @click="widthChange">
        <i></i>
      </div>
    </div>
    <div class="main container-main" id="indexMain">
      <Chart ref="chart"></Chart>
    </div>
  </div>
</template>

<script>
import Tree from "@components/ztree/zTree";
import Chart from "@components/chart/chart";
import { mapGetters } from "vuex";

export default {
  data() {
    return {
      siderWidth: 300
    };
  },
  components: { Tree, Chart },
  computed: {
    ...mapGetters(["publisherMap", "PUBLISHER"])
  },
  methods: {
    getUpdatedInfo() {
      this.$get_api("getUpdatedInfo", {}).then(res => {
        this.lastHighLightTime = res.csfLastUpdatedTime;
        this.lastUpdateTime = res.clientLastUpdatedTime;
        this.$store.dispatch("SetPUBLISHER", res);
      });
    },
    widthChange() {
      let width = parseInt(
        $("#indexMain")
          .css("width")
          .replace("px", "")
      );
      if (this.siderWidth === 300) {
        this.siderWidth = 450;
        $("#indexMain").css({ width: width - 150 + "px" });
      } else {
        this.siderWidth = 300;
        $("#indexMain").css({ width: width + 150 + "px" });
      }
      this.$refs.chart.resize();
    }
  },
  mounted() {
    this.getUpdatedInfo();
    const vm = this;
    $("#moveW").on("mousedown", moveW => {
      moveW.stopPropagation();
      const $ele = $("#siderbar");
      const $ele2 = $("#indexMain");
      document.onmousemove = e => {
        addMoveContentControl($ele, $ele2, e, vm);
      };
    });
  }
};

const space = {
  width: 240, // 默认div的宽度
  min: 240, // div宽度高度不能小于min
  max: 500, // div宽度高度不能小于min
  buttomTarget: null, // 鼠标按下之后的target
  moveTarget: null // 鼠标按下之后移动的target
};

function addMoveContentControl($ele, $ele2, e, vm) {
  if (e.buttons !== 1) {
    space.moveTarget = null;
    return;
  } else if (space.moveTarget === null) {
    space.moveTarget = e.target;
  }
  if (space.moveTarget.className !== "move-w") return;
  new addMoveContentRight($ele, $ele2, e, vm);
}

let interval = null;
function addMoveContentRight($ele, $ele2, e, vm) {
  addMoveContentSuper.apply(this, arguments);
  var width = this.divWidth + this.x;
  var width2 = this.divWidth - this.x;
  if (width < this.min) width = this.min;
  if (width > this.max) width = this.max;
  this.divEle.css({ width: width + "px" });
  this.divEle2.css({ width: width2 + "px" });
  interval && clearTimeout(interval);
  interval = setTimeout(() => {
    vm.$refs.chart.resize();
  }, 200);
}

function addMoveContentSuper(divEle, divEle2, e) {
  this.min = space.min;
  this.max = space.max;
  this.divEle = divEle;
  this.divWidth = this.divEle.css("width");
  this.divEle2 = divEle2;
  this.divWidth2 = this.divEle2.css("width");
  // 鼠标事件event
  this.e = e;
  this.x = e.movementX;
  this.moveTarget = space.moveTarget;
  this.divWidth =
    this.divWidth === ""
      ? space.width
      : parseInt(this.divWidth.replace("px", ""));
}
</script>

<style lang="scss">
@import "../../assets/styles/ztree/metroStyle/metroStyle.css";
@import "@styles/index";
</style>
