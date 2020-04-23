<script>
export default {
  name: "RenderParent",
  render: function(h) {
    let beforeData = this.secondData;
    let data = this.firstData;
    let isChanged = beforeData
      ? beforeData.code && beforeData.parent !== data.parent
      : false;
    const name = data.parent ? data[`parentName${this.LANGUAGE}`] : "--";
    const code = data.parent ? data.parent : "--";
    const className = isChanged ? "is-changed" : "";
    let result = [];
    if (name !== "--") {
      result = [
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
              h("p", { class: "name" }, `${name} 【${code}】`)
            ]),
            h(
              "p",
              {
                class: className,
                slot: "reference",
                style: {
                    margin: 0,
                    padding: 0,
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden'
                  }
              },
              name
            )
          ]
        )
      ];
    } else {
      result.push(
        h(
          "span",
          {
            class: className
          },
          name
        )
      );
    }
    let vdom = h("div", result);
    return vdom;
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