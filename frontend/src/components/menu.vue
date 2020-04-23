<template>
  <div class="menu">
    <div class="menu-logo"></div>
    <div class="menu-nav">
      <el-menu
        v-if="$route.name !== 'init'"
        :default-active="activeIndex"
        mode="horizontal"
        text-color="#fff"
        active-text-color="#fff"
        background-color="#222F76"
        @select="pageTo"
        style="padding: 0"
      >
        <el-menu-item
          v-for="(item, index) in menuTag"
          name="item.to"
          :key="index"
          :index="item.to"
          v-show="showMenu(item.to)"
        ><i class="menu-icon" :style="{backgroundImage: `url(${item.image})`}"></i>{{item[`name${LANGUAGE}`]}}</el-menu-item>
      </el-menu>
    </div>
    <div class="menu-user">
      <div class="logout" @click="logout">{{$i18n('common.logout')}}</div>
      <div class="user-pic" :title="user.username || ''"></div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import {
  delCookie,
  getCookie,
  logout,
  encrypt,
  getPermissions
} from "@/utils/index";

export default {
  name: "menuTag",
  data() {
    const vm = this;
    return {
      activeIndex: vm.$route.name
    };
  },
  computed: {
    ...mapGetters(["menuTag", "user", "userInfo", "LANGUAGE"])
  },
  methods: {
    logout() {
      delCookie("userId");
      delCookie("userToken");
      this.$store.state.userInfo.userInfo = {};
      logout();
    },
    pageTo(path) {
      if (path === "manage") {
        let _token = encodeURIComponent(
          encrypt(
            JSON.stringify({
              userToken: getCookie("userToken"),
              userId: getCookie("userId")
            })
          )
        );
        let path = "";
        let _host = window.location.host.split(":")[0];
        let _domain = _host.split(".");
        let _len = _host.split(".").length;
        if (_domain[0] == "dev") {
          path = "http://dev.accessportal.chinascope.net/";
        } else if (_domain[0] == "qa") {
          path = "http://qa-szse.accessportal.chinascope.net/";
        } else if (_domain[_len - 1] == "com") {
          path = "http://access-portal.chinascope.com/";
        } else {
          path = "http://dev.accessportal.chinascope.net/";
        }
        window.open(`${path}/#/?token=${_token}`);
      } else {
        this.activeIndex = path;
        this.$router.push("/" + path);
      }
    },
    showMenu(to) {
      return getPermissions("/" + to);
    }
  },
  beforeUpdate() {
    this.activeIndex = this.$route.name;
  }
};
</script>
