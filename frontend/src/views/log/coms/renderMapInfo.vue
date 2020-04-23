<script>
export default {
  name: "RenderMapInfo",
  render: function(h) {
    const firstMapInfo = this.firstData ? this.firstData.mapperInfo || [] : [];
    const secondMapInfo = this.secondData
      ? this.secondData.mapperInfo || []
      : [];
    let className = this.secondData
      ? this.isChanged(firstMapInfo, secondMapInfo)
      : "";
    if (!this.secondData || (this.secondData&& !this.secondData.code)) {
      className = "";
    }
    let result = [];
    if (firstMapInfo.length) {
      firstMapInfo.forEach(item => {
        let name = item[`name${this.LANGUAGE}`];
        let code = item.code;
        result.push(
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
                  slot: "reference",
                  style: {
                    margin: 0,
                    padding: 0,
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    overflow: "hidden"
                  }
                },
                name
              )
            ]
          )
        );
      });
    } else {
      result = [h("span", "--")];
    }
    let vdom = h(
      "div",
      {
        class: className
      },
      result
    );
    return vdom;
  },
  methods: {
    isChanged(a, b) {
      if (a.length !== b.length) {
        return "is-changed";
      } else {
        for (let i = 0; i < a.length; i++) {
          if (a[i].code !== b[i].code) {
            return "is-changed";
          }
        }
        return "";
      }
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