<script>
export default {
  name: "renderRelDom",
  render: function(h) {
    let beforeData = this.secondData;
    let data = this.firstData;
    const isAfter = beforeData;
    // let list = data.direction === -1 ? [-1, 1] : [1, -1];
    let list = [-1, 1];
    let result = [];
    let isChanged = false;
    list.forEach(val => {
      const productTitle_first = this.getProductName(data, -1, true);
      const productText_first = this.getProductName(data, -1);
      const productTitle_second = this.getProductName(data, 1, true);
      const productText_second = this.getProductName(data, 1);
      const sortClase_first = this.getFirstSortClass(val);
      const sortClase_second = this.getSecondSortClass(val * -1);
      const directionText = val === -1 ? "上游" : "下游";
      const relTypeText = `（${this.getRelationTypeText(data, val)}）`;
      const weightText = this.getWeightText(data, val);
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
            this.getWeightText(beforeData, val) !==
            this.getWeightText(data, val);
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
              h("div", { class: "tips tips-font" }, [
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
              h("div", { class: "tips tips-font" }, [
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
    return vdom;
  },
  methods: {
    getProductName(data, reverse = 1, showTitle = false) {
      let direction = data.direction * reverse;
      let result =
        direction === -1
          ? data[`downStreamName${this.LANGUAGE}`]
          : data[`upStreamName${this.LANGUAGE}`];
      showTitle &&
        (result += direction === -1 ? ` 【${data.downstreamCode}】` : ` 【${data.upstreamCode}】`);
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
    }
  },
  props: {
    firstData: {
      type: Object,
      required: true
    },
    secondData: {
      type: Object,
      required: false,
      default: () => {
        return null;
      }
    },
    LANGUAGE: {
      type: String,
      required: true
    },
    relationTypeOptions: {
      type: Array,
      required: true
    },
    degreeOptions: {
      type: Array,
      required: true
    }
  }
};
</script>
<style lang="scss" scoped>
.isHover {
  .is-changed {
    color: #ff6466 !important;
    &.text-weight {
      background-color: #f6e7ea !important;
    }
  }
}
.tips {
  width: 300px;
  padding: 0;

  .name {
    width: 100%;
    color: $color-primary;
    line-height: 24px;
    font-weight: bold;
    padding: 0 !important;
    margin: 0 !important;
  }

  .desc {
    background-color: $background_main;
    line-height: 2em;
    font-style: italic;
    padding: 0 6px !important;
    margin: 0 !important;
    white-space: normal;
    font-size: 12px;
  }
}
</style>