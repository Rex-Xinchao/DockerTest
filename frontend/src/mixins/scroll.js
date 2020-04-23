export default {
    data() {
        return {
            page: {
                pageNo: 1,
                pageSize: 50
            },
            end: false
        }
    },
    methods: {
        handleScroll: function () {
            // 设备/屏幕高度
            let scrollObj = $('#table').find('.el-table__body-wrapper')[0]; // 滚动区域
            if (!scrollObj) {
                return
            }
            let scrollTop = scrollObj.scrollTop; // div 到头部的距离
            let scrollHeight = scrollObj.scrollHeight; // 滚动条的总高度
            let clientHeight = scrollObj.clientHeight;
            //滚动条到底部的条件
            if (scrollTop + clientHeight == scrollHeight && !this.end) {
                this.page.pageNo = this.page.pageNo + 1
                this.search(null, false)
            }
        }
    },
    mounted() {
        window.addEventListener("scroll", this.handleScroll, true); // 监听（绑定）滚轮滚动事件
    },
    destroyed() {
        window.removeEventListener("scroll", this.handleScroll, true); //  离开页面清除（移除）滚轮滚动事件
    }
}
