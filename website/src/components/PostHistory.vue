<template>
  <div id="existingPostPage">
    <div>Existing posts</div>
    <main>
      <div v-for="post in posts" :key="post.createdAt" @click="selectedPost=post">
        {{dayjs(post.createdAt).format('YYYY-MM-DD')}}
      </div>
      <div v-if="selectedPost">
        {{selectedPost.content}}
      </div>
    </main>
  </div>
</template>

<script>
import { ref } from 'vue';
import dayjs from 'dayjs';
import axios from 'axios';
import secrets from '../../secrets.json';

const strapiAxios = axios.create({
  baseURL: 'http://localhost:1337/api/',
  headers: { Authorization: `Bearer ${secrets.strapi}` },
});
export default {
  setup() {
    return {
      posts: ref([]),
      dayjs,
      selectedPost: ref(null),
    };
  },
  async created() {
    const { data } = await strapiAxios.get('/journal-entries');
    this.posts = data.data.map((x) => x.attributes);
  },
  methods: {
  },
};
</script>

<style lang="scss">
#existingPostPage {
  main {
    display: flex;

    >div {
      flex: 1;
    }
  }
}
</style>
