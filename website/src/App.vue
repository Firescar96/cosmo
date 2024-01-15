<template>
  <Home />
</template>

<script>
import Home from './components/Home.vue';

export default {
  name: 'App',
  components: {
    Home,
  },
};
</script>

<style lang="scss">
@import './components/shared.scss';
@import 'overlayscrollbars/overlayscrollbars.css';

@font-face {
  font-family: "Roboto";
  src: url("./Roboto-Regular.ttf");
}

html, body {
  height: 100vh;
  margin: 0;
}

body {
  background: url('./background.jpg');
  background-size: cover;
  color: white;
}

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100%;
  width: 100%;
  font-family: Roboto, Georgia,serif;
}
</style>
