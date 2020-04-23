<template>
  <el-row class="login-container">
    <el-col :span="11" class="login-left">
      <img class="logo" src="~@/assets/imgs/logo.png" />
      <div class="text-container" v-if="false">
        <p class="title">数库产业链维护平台</p>
        <p class="sub-title">ChinaScope Industrial Chain</p>
        <p class="instruction">{{$i18n('login.systemDesc')}}</p>
      </div>
    </el-col>
    <el-col :span="13" class="login-right" @keydown.13.native="submit">
      <div class="form-container">
        <h1 style="text-align: center;">{{$i18n('login.systemName')}}</h1>
        <div class="login-form_conatiner">
          <span class="type-check" :class="{active: type === 1}" v-if="!ISSZSE" @click="type = 1">LDAP</span>
          <span class="type-check" :class="{active: type === 2}" v-if="!ISSZSE" @click="type = 2">Standard</span>
          <el-form
            ref="form"
            label-position="top"
            :model="form"
            label-width="80px"
            class="login-form"
            size="small"
          >
            <el-form-item class="login-input" :label="$i18n('login.username')">
              <i class="login-icon el-icon-user-solid"></i>
              <el-input v-model="form.username"></el-input>
            </el-form-item>
            <el-form-item class="login-input" :label="$i18n('login.password')">
              <i class="login-icon el-icon-lock"></i>
              <el-input type="password" v-model="form.password"></el-input>
            </el-form-item>
            <el-form-item v-if="captchaState" class="login-input" label="验证码">
              <el-input v-model="form.captcha" prefix-icon="el-icon-key" style="width: 196px"></el-input>
              <span
                @click="getCaptchaImg"
                style="display: inline-block;vertical-align: bottom; cursor:pointer;"
                title="点击切换图片"
              >
                <img :src="captchaSrc" style="vertical-align: bottom" />
              </span>
            </el-form-item>
            <el-form-item>
              <el-button class="login-btn" @click="submit">{{$i18n('login.loginBtn')}}</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-col>
  </el-row>
</template>
<script>
import { mapGetters } from "vuex";
import forge from "node-forge";
import { encrypt } from "../../utils/index";
const TYPE = 2;
export default {
  name: "login",
  data() {
    return {
      form: {
        username: "",
        password: "",
        captcha: ""
      },
      captchaSrc: "",
      captchaState: false,
      salt: "",
      type: TYPE
    };
  },
  computed: {
    ...mapGetters(["user", "appid", 'ISSZSE'])
  },
  methods: {
    submit() {
      if (!this.form.username) {
        this.$message.error(this.$i18n("check.login.lessUsername"));
        return;
      }
      if (!this.form.password) {
        this.$message.error(this.$i18n("check.login.lessPassword"));
        return;
      }

      if (this.captchaState) {
        //验证 验证码
        if (!this.form.captcha) {
          this.$message.error("请输入验证码");
          return;
        }
        this.$get_api("captchaVerify", { captcha: this.form.captcha }).then(
          res => {
            this.login();
          }
        );
      } else {
        this.login();
      }
    },
    login() {
      let password =
        this.type === 1
          ? this.encrypt(this.form.password)
          : this.encrypt(this.$md5(this.form.password));
      let params = {
        emailOrUsername: this.form.username,
        password: password,
        type: this.type,
        clientId: this.appid,
        captcha: this.form.captcha
      };
      this.$post_api("login", JSON.stringify(params)).then(res => {
        if (res.userToken) {
          this.$store.dispatch("SetUser", res);
          this.$router.push("/index");
        }
      });
    },
    checkOauthCaptchaState() {
      if (this.appid) {
        //查看是否需要验证码
        this.$get_api("getCaptcha", { appId: this.appid }).then(res => {
          this.captchaState = res.captchaState;
          if (res.captchaState) {
            this.getCaptchaImg();
          }
        });
      }
    },
    getCaptchaImg() {
      //获取图片验证码
      this.captchaSrc = `/csf-permission/captcha?appId=${
        this.appid
      }&_v=${Math.random()}`;
    },
    encrypt(str) {
      let data = this.salt.encrypt(str, "RSA-OAEP", {
        md: forge.md.sha1.create(),
        mgf1: {
          md: forge.md.sha1.create()
        }
      });
      if (data) {
        return forge.util.encode64(data);
      }
      return null;
    },
    getSalt() {
      this.$get_api("getKey", { appId: this.appid })
        .then(res => {
          console.log(res);
        })
        .catch(e => {
          this.salt = forge.pki.publicKeyFromPem(
            "-----BEGIN PUBLIC KEY-----\n" +
              e.responseText +
              "\n-----END PUBLIC KEY-----"
          );
        });
    },
    logout() {
      this.$put_api("logout_auth", {})
        .then(res => {
          this.getSalt();
        })
        .catch(e => {
          this.getSalt();
        });
    }
  },
  mounted() {
    this.checkOauthCaptchaState();
    this.logout();
  }
};
</script>
<style lang="scss">
@import "@styles/login.scss";
.login-form_conatiner {
  width: auto;
  height: auto;
  border-radius: 4px;
  border: 1px solid #cccccc;
  margin-top: 30px;

  .type-check {
    display: inline-block;
    width: 50%;
    height: 48px;
    line-height: 48px;
    text-align: center;
    font-size: 16px;
    font-weight: bold;
    border-bottom: 2px solid #d8dce6;
    cursor: pointer;
  }

  .active {
    border-bottom: 2px solid #3e73e3;
  }

  .login-form {
    padding: 20px 33px;
  }
}
</style>
