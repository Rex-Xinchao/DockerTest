<template>
  <div class="chart-container" v-loading="chartLoading">
    <div class="chart-menu">
      <a
        v-if="product &&product.grandParent"
        @click="selectNode(product.grandParent)"
      >{{`${product.grandParent.name}`}}</a>
      <span v-if="product &&product.grandParent" style="padding: 0 16px">></span>
      <a
        v-if="product &&product.parent"
        @click="selectNode(product.parent)"
      >{{`${product.parent.name}`}}</a>
      <span v-if="product &&product.parent" style="padding: 0 16px">></span>
      <span v-if="product.productCode" class="product-li">
        {{product.name}}
        <span class="sign">{{product.productCode}}</span>
        <span class="sign">{{`层级：${product.level}`}}</span>
      </span>
    </div>
    <div class="pic-example">
      <ul>
        <li class="title">{{$i18n('chart.picExample.title')}}</li>
        <li>
          <i class="circle" style="background-color: #A49FFF"></i>
          {{$i18n('chart.picExample.up')}}
        </li>
        <li>
          <i class="circle" style="background-color: #83BFFF"></i>
          {{$i18n('chart.picExample.down')}}
        </li>
        <li>
          <i class="circle" style="background-color: #999999"></i>
          {{$i18n('chart.picExample.repeated')}}
        </li>
      </ul>
    </div>
    <div class="no-data" v-show="noData">{{$i18n('chart.noDataShow')}}</div>
    <div class="graph-box" @click="hideMenu">
      <svg id="graph-box-svg" />
    </div>
    <el-dropdown
      placement="bottom-start"
      trigger="click"
      ref="menuBox"
      class="graph-menu-card"
      @command="handleCommand"
    >
      <div></div>
      <el-dropdown-menu slot="dropdown" :divided="true" class="graph-menu-item">
        <el-dropdown-item
          v-if="isAllShow"
          command="all"
          class="showAll_before"
        >{{$i18n('chart.tooltip.showAll')}}</el-dropdown-item>
        <el-dropdown-item
          v-if="isUpShow"
          command="up"
          class="showUp_before"
        >{{$i18n('chart.tooltip.showUp')}}</el-dropdown-item>
        <el-dropdown-item
          v-if="isPickUpShow"
          command="pickUp"
          class="pickUp_before"
        >{{$i18n('chart.tooltip.pickUp')}}</el-dropdown-item>
        <el-dropdown-item
          v-if="isUpAdd"
          command="add_up"
          class="addUp_before"
        >{{$i18n('chart.tooltip.addUp')}}</el-dropdown-item>
        <el-dropdown-item
          v-if="isDownShow"
          command="down"
          class="showDown_before"
        >{{$i18n('chart.tooltip.showDown')}}</el-dropdown-item>
        <el-dropdown-item
          v-if="isPickUpDownShow"
          command="pickUp"
          class="pickUp_before"
        >{{$i18n('chart.tooltip.pickDown')}}</el-dropdown-item>
        <el-dropdown-item
          v-if="isDownAdd"
          command="add_down"
          class="addDown_before"
        >{{$i18n('chart.tooltip.addDown')}}</el-dropdown-item>
        <el-dropdown-item
          v-if="isLinkEdit"
          command="edit"
          class="editLink_before"
        >{{$i18n('chart.tooltip.editRel')}}</el-dropdown-item>
        <el-dropdown-item
          v-if="isLinkDel"
          command="remove"
          class="delLink_before"
        >{{$i18n('chart.tooltip.deleteRel')}}</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <Check-Dialog ref="checkDialog" @checkSure="checkSure"></Check-Dialog>
    <UpDown
      ref="upDown"
      :title="dialogTitle"
      :direction="direction"
      :type="dialogType"
      :node="currentClickNode"
      :link="currentClickLink"
      :dialogShow="dialogShow"
      @change="dialogSave"
    ></UpDown>
  </div>
</template>

<script>
import * as d3 from "d3";
import UpDown from "./upDown";
import { mapGetters, mapActions } from "vuex";
import PermissionJudge from "@/mixins/permissionJudge";
import CheckDialog from "@components/checkDialog";
import initData from "./initData";

const UP = -1; // 上游
const UP_COLOR = "#A49FFF"; // 上游
const UP_COLOR_ACTIVE = "#7B74FF"; // 上游
const DOWN = 1; // 下游
const DOWN_COLOR = "#83BFFF"; // 下游
const DOWN_COLOR_ACTIVE = "#3697FF"; // 下游
const REPEATED_COLOR = "#999999"; // 重复节点
const ROUTE_COLOR = "#3E73E3"; // 根节点

const INDEX = {
  start: 0,
  middle: 15,
  end: 100
};

export default {
  name: "myChart",
  data() {
    return {
      code: null,
      treeData: null,
      d3TreeBox: {
        margin: { top: 0, right: 0, bottom: 55, left: 0 },
        width: 0,
        height: 0,
        dx: 0,
        dy: 0
      },
      d3Zoom: null,
      svgInstance: null, // svg
      visInstance: null, // g
      params: {
        width: "",
        height: ""
      },
      currentClickNode: null,
      currentClickLink: null,
      dialogShow: false,
      dialogTitle: null,
      dialogType: null,
      originData: null,
      direction: null,
      noData: false,
      chartLoading: true,
      viewBox: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      },
      highLightNode: null,
      upList: [],
      downList: [],
      currentProduct: null,
      clientWidth: 360
    };
  },
  computed: {
    ...mapGetters([
      "product",
      "relationTypeOptions",
      "degreeOptions",
      "LANGUAGE"
    ]),
    isAllShow() {
      return this.currentClickNode && !this.currentClickNode.root;
    },
    isUpShow() {
      // 当前选择的是关系为上游的产品节点  并且 上游数量不为0 并且 不是重复节点
      return (
        this.currentClickNode &&
        this.currentClickNode.nodeType === "product" &&
        this.currentClickNode.direction === UP &&
        this.currentClickNode.usCnt > 0 &&
        !this.currentClickNode.isRepeated &&
        this.currentClickNode.children.length === 0
      );
    },
    isDownShow() {
      // 当前选择的是关系为下游的产品节点 并且 上游数量不为0 并且 不是重复节点
      return (
        this.currentClickNode &&
        this.currentClickNode.nodeType === "product" &&
        this.currentClickNode.direction === DOWN &&
        this.currentClickNode.dsCnt > 0 &&
        !this.currentClickNode.isRepeated &&
        this.currentClickNode.children.length === 0
      );
    },
    isPickUpShow() {
      return (
        this.currentClickNode &&
        this.currentClickNode.nodeType === "product" &&
        this.currentClickNode.direction === UP &&
        this.currentClickNode.usCnt > 0 &&
        !this.currentClickNode.isRepeated &&
        this.currentClickNode.children.length > 0
      );
    },
    isPickUpDownShow() {
      return (
        this.currentClickNode &&
        this.currentClickNode.nodeType === "product" &&
        this.currentClickNode.direction === DOWN &&
        this.currentClickNode.dsCnt > 0 &&
        !this.currentClickNode.isRepeated &&
        this.currentClickNode.children.length > 0
      );
    },
    isUpAdd() {
      // 1、有添加节点的权限 并且 当前选择的是关系为上游的产品节点 并且 不是重复节点
      // 2、根节点
      return (
        this.permission.addNode &&
        this.currentClickNode &&
        ((this.currentClickNode.nodeType === "product" &&
          this.currentClickNode.direction === UP &&
          !this.currentClickNode.isRepeated) ||
          this.currentClickNode.root)
      );
    },
    isDownAdd() {
      // 1、有添加节点的权限 并且 当前选择的是关系为下游的产品节点 并且 不是重复节点
      // 2、根节点
      return (
        this.permission.addNode &&
        this.currentClickNode &&
        ((this.currentClickNode.nodeType === "product" &&
          this.currentClickNode.direction === DOWN &&
          !this.currentClickNode.isRepeated) ||
          this.currentClickNode.root)
      );
    },
    isLinkDel() {
      return this.permission.delLink && this.currentClickLink;
    },
    isLinkEdit() {
      return this.permission.editLink && this.currentClickLink;
    }
  },
  mixins: [PermissionJudge],
  components: {
    UpDown,
    CheckDialog
  },
  watch: {
    product(data) {
      if (this.currentProduct === data) {
        return;
      }
      this.currentProduct = data;
      this.currentClickNode = {
        name: data.name,
        code: data.code || data.productCode,
        root: true
      };
      this.maxLevel = 1;
      this.getChain();
    }
  },
  methods: {
    ...mapActions(["SetProduct"]),
    resize() {
      this.$nextTick(() => {
        this.clientWidth = $("#siderbar")[0].clientWidth + 60;
        this.getChain(null, true);
      });
    },
    getChain(direction = null, append = false) {
      if (!direction) {
        this.upList = [];
        this.downList = [];
      }
      let params = {
        weight: "",
        bound: "",
        preLevel: 1,
        direction: direction
      };
      this.chartLoading = true;
      this.originData = append ? this.originData : {};
      let code = this.currentClickNode && this.currentClickNode.code;
      this.code = append ? this.code : code;
      this.name = append
        ? this.name
        : this.currentClickNode && this.currentClickNode.name;
      params.code = code;
      this.$get_api("getChartData", params).then(res => {
        if (append) {
          const originData = JSON.parse(JSON.stringify(this.originData));
          const links = originData.relationships || [];
          const nodes = originData.nodes || [];
          changeNodes(nodes);
          let linkList = [];
          res.relationships.forEach(link => {
            let targetLink = links.find(item => item.id === link.id);
            if (!targetLink) {
              linkList.push(link);
            } else {
              targetLink.typeCode = link.typeCode;
              targetLink.typeName = link.typeName;
              targetLink.weight = link.weight;
            }
          });
          this.originData.relationships = links.concat(linkList);
          let nodeList = [];
          res.nodes.forEach(node => {
            let targetNode = nodes.find(item => item.code === node.productCode);
            if (!targetNode) {
              nodeList.push(node);
            } else {
              targetNode.usCnt = node.usCnt; // 旧节点数量更新
              targetNode.dsCnt = node.dsCnt;
            }
          });
          this.originData.nodes = nodes.concat(nodeList);
        } else {
          this.originData = res;
        }
        this.chartLoading = false;
        this.initTreeChart(this.originData);
      });

      const changeNodes = nodes => {
        nodes.forEach(item => {
          item.code = item.productCode;
          item.children && getNodes(item.children);
        });
      };
    },
    initTreeChart(res) {
      this.noData = false;
      let maxLevel = this.currentClickNode
        ? this.currentClickNode.level
          ? this.currentClickNode.level + 1
          : 1
        : null;
      if (!this.maxLevel) {
        this.maxLevel = maxLevel;
      } else if (maxLevel) {
        this.maxLevel = maxLevel >= this.maxLevel ? maxLevel : this.maxLevel;
      }
      let data = initData(
        JSON.parse(JSON.stringify(res)),
        this.code,
        this.name,
        this.maxLevel,
        this.upList,
        this.downList,
        this.LANGUAGE
      );
      let $graphBox = document.querySelector(".graph-box");
      this.params.width = $graphBox && $graphBox.offsetWidth;
      this.params.height = $graphBox && $graphBox.offsetHeight;
      $graphBox.innerHTML = ""; // 清空tree图
      this.initChartOptions();
      this.initSvg();
      if (!data || !data.length) {
        return false;
      }
      data[0].children.length > 0 && this.graphTree(data[0]);
      data[1].children.length > 0 && this.graphTree(data[1]);
      if (!data[0].children.length && !data[1].children.length) {
        this.graphTree(data[0]);
      }
      this.treeData = data;
      this.rootNode(data[1].children.length > 0);
    },
    initChartOptions() {
      this.d3TreeBox.width =
        this.params.width -
        this.d3TreeBox.margin.right -
        this.d3TreeBox.margin.left;
      this.d3TreeBox.height =
        this.params.height -
        this.d3TreeBox.margin.top -
        this.d3TreeBox.margin.bottom;
      this.viewBox = {
        x: 0,
        y: 0,
        width: this.d3TreeBox.width,
        height: 100
      };
      this.d3TreeBox.dx = 25; // 节点间距
      this.d3TreeBox.dy = this.d3TreeBox.width / this.d3TreeBox.height;
      this.d3Zoom = d3.zoom().scaleExtent([0.1, 10]); // 缩放比例
    },
    initSvg() {
      let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.id = "graph-box-svg";
      document.querySelector(".graph-box").appendChild(svg);
      // svg对象
      this.svgInstance = d3
        .select("#graph-box-svg")
        .attr(
          "width",
          this.params.width -
            this.d3TreeBox.margin.right -
            this.d3TreeBox.margin.left
        )
        .attr(
          "height",
          this.params.height -
            this.d3TreeBox.margin.top -
            this.d3TreeBox.margin.bottom
        )
        .style("font-size", "12px")
        .style("user-select", "none")
        .call(
          this.d3Zoom.on("zoom", () => {
            this.visInstance.attr("transform", d3.event.transform.toString());
          })
        )
        .on("dblclick.zoom", null);
      // g对象
      this.visInstance = this.svgInstance.append("g").attr("cursor", "pointer");
    },
    rootNode(hasDown) {
      //中心点
      let vm = this;
      let rootNode = null;
      if (hasDown) {
        rootNode = this.visInstance.select("g.isRoot.down");
        this.visInstance.select("g.up.isRoot").attr("display", "none");
      } else {
        rootNode = this.visInstance.select("g.isRoot");
        this.visInstance.select("g.down.isRoot").attr("display", "none");
      }
      rootNode.on("click", d => {
        vm.showMenu(d3.event, { ...d.data }, null);
      });
      rootNode.select("text").remove();
      let colorLiner = this.svgInstance
        .append("linearGradient")
        .attr("id", "colorLiner")
        .attr("x1", "0")
        .attr("y1", "0")
        .attr("x2", "0")
        .attr("y2", "100%");
      colorLiner
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#3E73E3");
      colorLiner
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#1F337C");
      rootNode
        .append("rect")
        .attr("width", 130)
        .attr("height", 42)
        .attr("fill", ROUTE_COLOR)
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("x", -65)
        .attr("y", -20)
        .attr("text-anchor", "middle");
      rootNode.append("title").text(d => `${d.data.name} [${d.data.code}]`);
      rootNode
        .append("text")
        .attr("fill", "#fff")
        .attr("x", 0)
        .attr("y", 5)
        .attr("text-anchor", "middle")
        .style("font", "12px sans-serif")
        .style("font-weight", "bold")
        .append("tspan")
        .text(d => {
          return vm._substring(d.data.name, 14, true);
        });
    },
    graphTree(data) {
      let root = d3.hierarchy(data);
      let $pos = data.direction === UP;
      root.x0 = this.d3TreeBox.width / 2;
      root.y0 = this.d3TreeBox.height / 2;
      root.descendants().forEach((d, i) => {
        d.id = d.id || ($pos ? "up_" : "down_") + i;
        if (d.children) {
          d._children = d.children;
        }
      });
      this.updateTree(root, root, $pos);
    },
    updateTree(source, originData, $pos) {
      let vm = this;
      let d3TreeData = d3
        .tree() /*.size([this.d3TreeBox.width, this.d3TreeBox.height])*/
        .nodeSize([this.d3TreeBox.dx, 0])(originData);
      let diagonal = d3
        .linkHorizontal()
        .x(d => d.y)
        .y(d => d.x);
      let duration = d3.event && d3.event.altKey ? 2500 : 250;
      let nodes = d3TreeData.descendants().reverse();
      let links = d3TreeData.links();
      nodes.forEach(d => {
        //上游在左侧，下游在右侧
        d.y = ($pos ? UP : DOWN) * d.depth * 180 + this.d3TreeBox.width / 2;
      });
      if (this.currentClickNode) {
        source.eachBefore(node => {
          // 根据当前选择的节点去更新图表的定位
          if (
            node.data.id === this.currentClickNode.id &&
            !this.currentClickNode.root
          ) {
            vm.viewBox.y = node.y - vm.d3TreeBox.height;
            vm.viewBox.x = node.x;
          }
        });
      }
      let transition = this.svgInstance
        .transition()
        .duration(duration)
        .attr("viewBox", [
          vm.viewBox.y,
          vm.viewBox.x,
          vm.viewBox.width,
          vm.viewBox.height
        ])
        .tween(
          "resize",
          window.ResizeObserver
            ? null
            : () => () => this.svgInstance.dispatch("toggle")
        );
      let node = this.visInstance.selectAll("g.node").data(nodes, d => d.id);
      let nodeEnter = node
        .enter()
        .append("g")
        .attr("class", d => {
          let className = d.data.nodeType === "productType" ? "no-circle " : "";
          className += d.data.root ? "isRoot " : "";
          className += $pos ? "up " : "down ";
          className += "node " + d.data.code;
          className += d.data.isRepeated ? " isRepeated " : "";
          return className;
        })
        .attr("transform", () => `translate(${source.y0},${source.x0})`)
        .on("click", d => {
          if (d.data.nodeType === "product") {
            vm.showMenu(d3.event, { ...d.data }, null);
          }
        })
        .on("mouseover", d => {
          vm.setHighLight(true, d.data);
        })
        .on("mouseout", d => {
          vm.setHighLight(false, d.data);
        });
      nodeEnter
        .append("circle")
        .attr("r", 10)
        .attr("style", d => {
          if (d.data.isRepeated) {
            return `fill: ${REPEATED_COLOR}`;
          } else {
            return $pos ? `fill: ${UP_COLOR}` : `fill: ${DOWN_COLOR}`;
          }
        });
      nodeEnter
        .append("text")
        .attr("dy", "0.35em")
        .attr("x", d =>
          $pos ? (d._children ? 16 : -16) : d._children ? -16 : 16
        )
        .attr("text-anchor", d =>
          $pos ? (d._children ? "start" : "end") : d._children ? "end" : "start"
        )
        .text(d => d.data.name);
      nodeEnter
        .append("text")
        .attr("dy", "0.35em")
        .attr("x", d => {
          let len = ($pos ? d.data.usCnt : d.data.dsCnt) || 0;
          return len > 9 ? -7 : -2.9;
        })
        .attr("text-anchor", "start")
        .attr("fill", "white")
        .text(d => {
          let text = $pos ? d.data.usCnt : d.data.dsCnt;
          return text || "";
        });
      nodeEnter
        .append("svg:title")
        .text(d => `${d.data.name} [${d.data.code}]`);
      let nodeUpdate = nodeEnter
        .transition(transition)
        .attr("transform", d => `translate(${d.y},${d.x})`);
      nodeUpdate.select("circle").attr("r", 10);
      nodeUpdate.select("text").style("fill-opacity", 1);
      let link = this.visInstance
        .selectAll("path.link")
        .data(links, d => d.target.id);
      let linkEnter = link
        .enter()
        .insert("path", "g")
        .attr("class", "link " + ($pos ? "up" : "down"))
        .attr("style", d => {
          if (!d.source.data.startCode && !d.source.data.endCode) {
            return "cursor: default";
          }
        })
        .attr("d", d => {
          let o = { x: source.x0, y: source.y0 };
          return diagonal({ source: o, target: o });
        })
        .on("click", d => {
          if (!!d.source.data.startCode && !!d.source.data.endCode) {
            vm.showMenu(d3.event, null, d);
          }
        });
      linkEnter.transition(transition).attr("d", diagonal);
      nodes.forEach(function(d) {
        d.x0 = d.x;
        d.y0 = d.y;
      });
      // 次级节点去除circle
      let noCircle = d3
        .selectAll(".no-circle")
        .attr("style", "cursor: default");
      noCircle.selectAll("circle").remove();
      noCircle
        .selectAll("text")
        .attr("dy", -4)
        .attr("x", 0);
      d3.selectAll("path")
        .append("title")
        .text(d => {
          if (d.source.data.name && d.source.data.weight) {
            let list = vm.originData.relationships.filter(item => {
              if (
                d.source.data.typeCode === item.code &&
                d.source.data.startCode === item.startCode &&
                d.target.data.code === item.endCode
              ) {
                return true;
              }
              return false;
            });
            let rel = list && list[0];
            let weight = vm.degreeOptions.filter(
              item => item.value === rel.weight
            );
            return `${rel.typeName} [ ${weight[0][`label${vm.LANGUAGE}`]} ]`;
          }
        });
    },
    setHighLight(isHighLight, data) {
      const vm = this;
      if (data.root) {
        setHigh("up");
        setHigh("down");
      } else {
        const direction = data.direction === -1 ? "up" : "down";
        setHigh(direction);
      }
      function setHigh(direction) {
        const nodes = vm.visInstance.selectAll(`g.${direction}.${data.code}`);
        if (isHighLight) {
          nodes.selectAll("circle").attr("style", d => {
            if (d.data.direction === -1) {
              return "fill: " + UP_COLOR_ACTIVE;
            } else {
              return "fill: " + DOWN_COLOR_ACTIVE;
            }
          });
        } else {
          nodes.selectAll("circle").attr("style", d => {
            if (d.data.isRepeated) {
              return `fill: ${REPEATED_COLOR}`;
            } else {
              return d.data.direction === -1
                ? `fill: ${UP_COLOR}`
                : `fill: ${DOWN_COLOR}`;
            }
          });
        }
      }
    },
    deleteLink(opt) {
      let params = {
        upstreamCode: opt.startCode,
        downstreamCode: opt.endCode
      };
      this.$del_api("delChartLink", params).then(e => {
        let direction = null;
        // 删除联系
        this.originData.relationships.forEach((item, index) => {
          let list = [item.startCode, item.endCode];
          if (
            (opt.startCode === item.startCode &&
              opt.endCode === item.endCode) ||
            (opt.startCode === item.endCode && opt.endCode === item.startCode)
          ) {
            direction = item.direction;
            // 更改上下游数字
            this.originData.nodes.forEach(item => {
              if (item.code === opt.startCode) {
                if (direction === UP) {
                  item.usCnt = item.usCnt - 1;
                } else {
                  item.dsCnt = item.dsCnt - 1;
                }
              }
              if (item.code === opt.endCode) {
                if (direction === DOWN) {
                  item.dsCnt = item.dsCnt - 1;
                } else {
                  item.usCnt = item.usCnt - 1;
                }
              }
            });
          }
        });
        this.originData.relationships = this.originData.relationships.filter(
          item =>
            (opt.startCode !== item.startCode ||
              opt.endCode !== item.endCode) &&
            (opt.startCode !== item.endCode || opt.endCode !== item.startCode)
        );
        // todo 删除的节点为重复扩展节点会有问题
        this.initTreeChart(this.originData);
        this.$message.success("删除成功");
      });
    },
    checkSure() {
      let params = {
        startCode: this.currentClickLink.target.data.code,
        endCode:
          this.currentClickLink.source.data.startCode ||
          this.currentClickLink.source.data.code
      };
      this.deleteLink(params);
    },
    // common
    _substring(str, n, $dot) {
      let r = /[^\x00-\xff]/g;
      if (!str) {
        return str;
      }
      if (str.replace(r, "mm").length <= n) {
        return str;
      }
      let m = Math.floor(n / 2);
      for (let i = m; i < str.length; i++) {
        if (str.substr(0, i).replace(r, "mm").length >= n) {
          return str.substr(0, i) + ($dot ? "..." : "");
        }
      }
      return str;
    },
    showMenu(event, clickNode, link) {
      this.currentClickNode = clickNode;
      this.currentClickLink = link;
      if (
        this.currentClickLink &&
        !this.permission.delLink &&
        !this.permission.editLink
      ) {
        return;
      }
      if (
        this.currentClickNode &&
        this.currentClickNode.root &&
        !this.permission.addNode
      ) {
        return;
      }
      this.hideMenu();
      setTimeout(() => {
        this.$refs.menuBox.$el.style.display = "block";
        this.$refs.menuBox.$el.style.top = `${event.pageY - 90}px`;
        this.$refs.menuBox.$el.style.left = `${event.pageX -
          this.clientWidth}px`;
        this.$refs.menuBox.show();
      }, 100);
    },
    hideMenu() {
      this.$refs.menuBox.hide();
      this.$refs.menuBox.$el.style.display = "none";
    },
    handleCommand(command) {
      if (command === "all" && this.currentClickNode) {
        this.SetProduct(this.currentClickNode);
      } else if (command === "up" && this.currentClickNode) {
        let item = this.upList.find(
          item => item.code === this.currentClickNode.code
        );
        if (item) {
          item.hide = false;
        } else {
          this.upList.push(this.currentClickNode);
        }
        this.getChain(UP, true);
      } else if (command === "down" && this.currentClickNode) {
        let item = this.downList.find(
          item => item.code === this.currentClickNode.code
        );
        if (item) {
          item.hide = false;
        } else {
          this.downList.push(this.currentClickNode);
        }
        this.getChain(DOWN, true);
      } else if (command === "add_up" && this.currentClickNode) {
        this.dialogTitle = this.$i18n("chart.dialog.title_add_up");
        this.direction = UP;
        this.dialogType = "add";
        this.dialogShow = true;
      } else if (command === "add_down" && this.currentClickNode) {
        this.dialogTitle = this.$i18n("chart.dialog.title_add_down");
        this.direction = DOWN;
        this.dialogType = "add";
        this.dialogShow = true;
      } else if (command === "remove" && this.currentClickLink) {
        this.$get_api("getProductByCode", {
          code: this.currentClickLink.source.data.startCode,
          target: this.currentClickLink.target.data.productCode,
          direction: this.currentClickLink.source.data.direction
        }).then(res => {
          const h = this.$createElement;
          let keyName = `name${this.LANGUAGE}`;
          let relationTypeA = this.relationTypeOptions.find(
            item => item.value === res[0].relationType
          )[`label${this.LANGUAGE}`];
          let weightA = this.degreeOptions.find(
            item => item.value === res[0].weight
          )[`label${this.LANGUAGE}`];
          let relationTypeB = this.relationTypeOptions.find(
            item => item.value === res[1].relationType
          )[`label${this.LANGUAGE}`];
          let weightB = this.degreeOptions.find(
            item => item.value === res[1].weight
          )[`label${this.LANGUAGE}`];
          let msg = h("div", { style: "height: 68px; text-align: center;" }, [
            h("p", { class: "line" }, [
              h(
                "span",
                {
                  class: "text-name",
                  title: `${res[0].nodeA[keyName]}${res[0].nodeA.productCode}`
                },
                `${res[0].nodeA[keyName]}`
              ),
              h("i", { class: "left-line-icon_short" }),
              h(
                "span",
                { class: "text" },
                res[0].direction === -1 ? "上游" : "下游"
              ),
              h("span", { class: "sub-text" }, `（${relationTypeA}）`),
              h("span", { class: "text-weight" }, weightA),
              h("i", { class: "right-arrow-icon_short" }),
              h(
                "span",
                {
                  class: "text-name",
                  title: `${res[0].nodeB[keyName]}${res[0].nodeB.productCode}`
                },
                `${res[0].nodeB[keyName]}`
              )
            ]),
            h("p", { class: "line" }, [
              h(
                "span",
                {
                  class: "text-name",
                  title: `${res[0].nodeA[keyName]}${res[0].nodeA.productCode}`
                },
                `${res[0].nodeA[keyName]}`
              ),
              h("i", { class: "left-arrow-icon_short" }),
              h(
                "span",
                { class: "text" },
                res[0].direction === 1 ? "上游" : "下游"
              ),
              h("span", { class: "sub-text" }, `（${relationTypeB}）`),
              h("span", { class: "text-weight" }, weightB),
              h("i", { class: "right-line-icon_short" }),
              h(
                "span",
                {
                  class: "text-name",
                  title: `${res[0].nodeB[keyName]}${res[0].nodeB.productCode}`
                },
                `${res[0].nodeB[keyName]}`
              )
            ])
          ]);
          let node = this.currentClickLink.target.data;
          this.$refs.checkDialog.dialogShow(
            this.$i18n("check.chart.deleteTitle"),
            msg,
            node
          );
        });
      } else if (command === "edit" && this.currentClickLink) {
        this.dialogTitle = this.$i18n("chart.dialog.title_edit");
        this.direction = this.currentClickLink.source.data.direction;
        this.dialogType = "edit";
        this.dialogShow = true;
      } else if (command === "pickUp") {
        if (this.currentClickNode) {
          let node = this.currentClickNode;
          let data =
            node.direction === UP ? this.treeData[0] : this.treeData[1];
          this.removeTargetChildren(data.children, node);
          if (
            node.direction === UP &&
            this.upList.find(item => item.code === node.code)
          ) {
            this.upList.find(item => item.code === node.code).hide = true;
          }
          if (
            node.direction === DOWN &&
            this.downList.find(item => item.code === node.code)
          ) {
            this.downList.find(item => item.code === node.code).hide = true;
          }
          let $graphBox = document.querySelector(".graph-box");
          this.params.width = $graphBox && $graphBox.offsetWidth;
          this.params.height = $graphBox && $graphBox.offsetHeight;
          $graphBox.innerHTML = ""; // 清空tree图
          this.initChartOptions();
          this.initSvg();
          this.graphTree(this.treeData[0]);
          this.graphTree(this.treeData[1]);
          this.rootNode(this.treeData[1].children.length > 0);
        }
      }
    },
    removeTargetChildren(data, node) {
      data.forEach(item => {
        if (item.code === node.code) {
          item.children = [];
        }
        item.children &&
          item.children.length &&
          this.removeTargetChildren(item.children, node);
      });
    },
    dialogSave(params, type) {
      this.dialogShow = false;
      if (!params || params === undefined) {
        return;
      }
      if (type === "add") {
        if (params.direction === UP) {
          let item = this.upList.find(
            item => item.code === this.currentClickNode.code
          );
          if (item) {
            item.hide = false;
          } else {
            this.upList.push(this.currentClickNode);
          }
        } else {
          let item = this.downList.find(
            item => item.code === this.currentClickNode.code
          );
          if (item) {
            item.hide = false;
          } else {
            this.downList.push(this.currentClickNode);
          }
        }
        this.$post_api(
          "editChart",
          JSON.stringify(Object.assign(params, { code: params.source }))
        ).then(data => {
          // data 数据需要返回up和down的数量
          this.$message.success("编辑成功");
          this.getChain(params.direction, true);
        });
      }
      if (type === "edit") {
        // 编辑关系选中的是线，但图表更新需要code，这时候要手动指定一下code
        this.currentClickNode = {
          code: this.currentClickLink.source.data.startCode,
          name: this.currentClickLink.source.data.startName
        };
        this.$put_api(
          "editChart",
          JSON.stringify(Object.assign(params, { code: params.source }))
        ).then(data => {
          // data 数据需要返回up和down的数量
          this.$message.success("编辑成功");
          this.getChain(params.direction, true);
        });
      }
    },
    getMenu() {
      let menuText = "";
      menuText +=
        (this.product &&
          this.product.grandParent &&
          this.product.grandParent.name +
            "&nbsp;&nbsp;&nbsp;&nbsp;>&nbsp;&nbsp;&nbsp;&nbsp;") ||
        "";
      menuText +=
        (this.product &&
          this.product.parent &&
          this.product.parent.name +
            "&nbsp;&nbsp;&nbsp;&nbsp;>&nbsp;&nbsp;&nbsp;&nbsp;") ||
        "";
      menuText +=
        this.product &&
        `${this.product.name} [ ${this.product.productCode} | level：${this.product.level} ]`;
      menuText = menuText === "undefined" ? "" : menuText;
      return menuText;
    },
    selectNode(node) {
      this.SetProduct(node);
    }
  },
  mounted() {}
};
</script>
