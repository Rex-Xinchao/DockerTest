import { dateTimeFormatter, dayTimeFormatter } from "@/utils/index";
const typeMap = { 1: "新增", 2: "编辑", 3: "删除", 4: "移动" };

export default {
    data() {
        return {
            showTable: true,
            loading: false,
            params: {},
            tableData: []
        };
    },
    methods: {
        getHeight() {
            const $obj = document.getElementsByClassName("log-main")[0];
            let height = $obj && $obj.offsetHeight;
            return height - 178 + "px";
        },
        tableRowClassName({ row, rowIndex }) {
            if (rowIndex % 2 === 0) {
                return "odd-row";
            }
            return "even-row";
        },
        getTypeName(type) {
            return typeMap[type] ? typeMap[type] : "未知类型";
        },
        dateTimeFormatter(date) {
            if (!date) {
                return "--";
            }
            return dateTimeFormatter(new Date(date));
        },
        i18n(item, key) {
            return item[key + this.LANGUAGE];
        },
        search(opt, init = true) {
            this.loading = true;
            if (opt) {
                this.params = {
                    startDate: opt.date && dayTimeFormatter(opt.date[0]),
                    endDate: opt.date && dayTimeFormatter(opt.date[1]),
                    operationType: opt.type,
                    productCode: opt.productCode,
                    userName: opt.username.trim()
                };
            }
            if (init) {
                this.params.pageNo = 1;
                this.params.pageSize = this.page.pageSize;
                this.end = false;
                this.showTable = false;
            } else {
                this.params.pageNo = this.page.pageNo;
                this.params.pageSize = this.page.pageSize;
            }
            this.$get_api(this.tableApi, this.params).then(res => {
                this.showTable = true;
                if (res.length === 0) {
                    this.end = true;
                    init && (this.tableData = res);
                    init || this.$message.info(this.$i18n('check.noData'));
                } else {
                    if (init) {
                        this.tableData = res;
                    } else {
                        this.tableData = this.tableData.concat(res);
                    }
                }
                setTimeout(e => {
                    this.loading = false;
                }, 500);
            });
        }

    }
}
