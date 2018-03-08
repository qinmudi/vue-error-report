<template>
  <div id="app">
    <button type="button" @click="sendError">发送自定义错误</button>
    <button type="button" @click="sendAjax">发送Ajax请求</button>
    <img src="./assets/logo.png">
    <img :src="imgsrc" alt="未知图片">
    <!-- {{user.name}} -->
    <HelloWorld/>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld'
import $ from 'webpack-zepto'

function aaa (flag) {
  return new Promise(function (resolve, reject) {
      if (flag) {
          resolve("Hello!!!!!!");
      } else {
          reject("bye bye!!!!!!");
      }
  });
}

export default {
  name: 'App',
  components: {
    HelloWorld
  },
  data(){
    var a = [];
    // console.log(a.b.c)
    return {
      imgsrc: 'https://qinmudi.cn/1.jpg'
    }
  },
  mounted(){
    this.$wiierror.send({message: '自定义错误2', stack: '错误栈信息2!'},this)
    user.test()
  },
  methods:{
    sendError(){
      this.imgsrc = 'https://qinmudi.cn/2.jpg'
      this.$wiierror.send({message: '自定义错误', stack: '错误栈信息!'},this)
    },
    sendAjax(){
      $.ajax({
        url: '/wmu/test/get_list',
        type: 'GET',
        dataType: 'json',
        data: {
          param1: 'value1'
        },
        success: function(res) {
          console.log(res)
        },
        error: function(error) {
          console.log(error)
        }
      })
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
