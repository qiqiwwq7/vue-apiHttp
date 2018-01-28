<template>
  <div class="home">
    <h1>测试各环境的环境接口</h1>
    <h2></h2>
    <p>
      {{info}}
    </p>
  </div>
</template>
<script>
import api from './home.api';

export default {
  data() {
    return {
      info: {}
    };
  },
  methods: {
    getData() {
      //
      const self = this;
      api.getCommonData({
        onSuccess(response) {
          console.log('****responseSuccess', response);
          self.info = response;
        },
        onFail(response) {
          console.log('****response', response);
        }
      });
    }
  },
  mounted() {
    this.getData();
  }
};
</script>
