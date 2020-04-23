<template>
    <div class="error">
        <div class="error_box">
            <div class="error_img"></div>
            <p>
                {{$i18n('error.errorMsg')}}
                <a @click="getLogin">{{$i18n('error.backTo')}}</a>
            </p>
        </div>
    </div>
</template>
<script>
  import { delCookie } from "@/utils";

  export default {
    data() {
      return {};
    },
    methods: {
      getLogin() {
        delCookie('userId')
        delCookie('userToken')
        this.$router.push('/login')
      }
    }
  };
</script>
