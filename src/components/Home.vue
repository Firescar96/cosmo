<template>
  <div class="hello">
    <h1 id="">Cosmo Daily Journaling</h1>
    <div>New Post</div>

    <div>
      <h2>New Post Page</h2>
      <div id="post-workspace">
        <textarea id="raw-post" aria-label="postText" v-model="postText"></textarea>
       <div id="parsed-post" v-html="marked.parse(postText)"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { marked } from 'marked';
import { ref } from 'vue';

export default {
  name: 'HomePage',
  setup() {
    return {
      postText: ref('postText'),
      marked,
    };
  },
  newPost() {
    console.log('hello');
  },
};
</script>

<style lang="scss">
#post-workspace {
  display: flex;

  h1 {
    text-align: center;
  }

  #raw-post {
    flex: 1;
    height: 500px;
    padding: 10px;
  }
  #parsed-post {
    flex: 1;
    padding: 0 20px;
  }
}
</style>
