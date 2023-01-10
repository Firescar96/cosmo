<template>
  <div id="existingPostPage">
    <div id="postList">
      <div
      class="clickable postSummary" v-for="post in posts" :key="post.createdAt"
      @click="selectedPost=post">
        {{dayjs(post.createdAt).format('YYYY-MM-DD')}}
        {{post.summary}}
      </div>
    </div>
    <div v-if="selectedPost" id="parsedPost">
      <div v-html="marked.parse(selectedPost.content)"></div>

      <div v-for="image in selectedPost.coverArts.data" :key="image.id">
          <img :src="'http://localhost:1337'+image.attributes.url">
        </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import dayjs from 'dayjs';
import { marked } from 'marked';
import axios from 'axios';
import secrets from '../../secrets.json';

const strapiAxios = axios.create({
  baseURL: 'http://localhost:1337/api/',
  headers: { Authorization: `Bearer ${secrets.strapi}` },
});

export default {
  setup() {
    return {
      marked,
      posts: ref([]),
      dayjs,
      selectedPost: ref(null),
    };
  },
  async created() {
    const { data } = await strapiAxios.get('/journal-entries?populate=*');
    this.posts = data.data.map((x) => {
      const post = x.attributes;

      if (post.documents.data) {
        post.documents.data.forEach((image) => {
          post.content = post.content.replace(`(${image.attributes.name})`, `(http://localhost:1337${image.attributes.url})`);
        });
      }
      return post;
    });
  },
  methods: {
  },
};
</script>

<style lang="scss">
#existingPostPage {
  display: flex;
  overflow-y: hidden;

  >div {
    flex: 1;
  }

  #postList {
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    .postSummary {
      margin: 10px;
      padding: 10px 20px;
      background: transparentize(#000000, .5);
      display: inline-block;
      font-size: 20px;
    }
  }

  #parsedPost {
    padding: 10px 20px;
    background: transparentize(#000000, .5);
    overflow-y: auto;

    p {
      display: flex;
      flex-direction: column;
      margin: 0;
    }

    img {
      width: 50%;
      margin: 5px auto;
    }

    figcaption {
      text-align: center;
    }
  }
}
</style>
