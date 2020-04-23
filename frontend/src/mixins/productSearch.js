export default {
  data() {
    return {
      loading: false,
      options: [],
      options_o: []
    }
  },
  methods: {
    querySearch(queryString) {
      let api = this.searchApi || 'getProductList'
      if (queryString.trim()) {
        this.loading = true;
        this.$get_api(api, { keyword: queryString.trim() }).then(res => {
          this.loading = false;
          res.sort((a, b) => {
            return a.level - b.level
          })
          res.forEach(item => {
            item.value = item.code || item.productCode
            item.label = item.name
          })
          this.options_o = res
          this.options = this.options_o.slice()
        })
      } else {
        this.options_o = []
        this.options = this.options_o.slice()
      }
    }
  }
}
