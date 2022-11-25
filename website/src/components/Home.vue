<template>
  <div id="home-page">
    <div id="page-header">
      <h1>Cosmo Daily Journaling</h1>
      <nav>
        <div @click="currentTab='newPost'" class="button" :class="{selected: currentTab=='newPost'}">New Post</div>
        <div @click="currentTab='postHistory'" class="button" :class="{selected: currentTab=='postHistory'}">Existing posts</div>
      </nav>
    </div>
    <PostHistory v-if="currentTab=='postHistory'"></PostHistory>

    <div v-if="currentTab=='newPost'">
      <div id="post-workspace">
        <textarea id="raw-post" placeholder="let your thoughts go" aria-label="postText" v-model="postText"></textarea>
       <div id="parsed-post" v-html="marked.parse(postText)"></div>
      </div>
      <div id="finalize-post-section">
        <div class="button" @click="summarizePost">Process</div>
        <div class="button" @click="generateImage">Make Image</div>
        <div class="button" @click="submitPost">Submit</div>
      </div>
      <div>

        <div v-if="summary.length">
          Summary
          <div>
            {{summary}}
          </div>
        </div>

        <div v-for="image in images" :key="image.imageURL">
          <img :src="image.imageURL">
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import { marked } from 'marked';
import { ref, shallowRef } from 'vue';
import axios from 'axios';
import { Configuration, OpenAIApi } from 'openai';
import secrets from '../../secrets.json';
import PostHistory from './PostHistory.vue';

const strapiAxios = axios.create({
  baseURL: 'http://localhost:1337/api/',
  headers: { Authorization: `Bearer ${secrets.strapi}` },
});
const openaiAxios = axios.create({
  baseURL: 'https://api.openai.com/v1/engines/davinci',
  headers: { Authorization: `Bearer ${secrets.openai}` },
});

const configuration = new Configuration({
  apiKey: secrets.openai,
});
const openai = new OpenAIApi(configuration);

export default {
  name: 'HomePage',
  setup() {
    return {
      postText: ref(''),
      marked,
      summary: shallowRef(''),
      currentTab: ref('newPost'),
      images: shallowRef([]),
    };
  },
  components: { PostHistory },
  methods: {
    async summarizePost() {
      const { data: result } = await openaiAxios({
        method: 'post',
        data: {
          prompt: `${this.postText}\n\ngive 5 concepts to describe the paragraphs:\n`,
          max_tokens: 500,
          temperature: 1,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
          best_of: 1,
        },
        url: '/completions',
        baseURL: 'https://api.openai.com/v1/engines/text-davinci-002',
      });
      const summary = result.choices[0].text
        .match(/[a-zA-Z].*/g);

      [this.summary] = summary.splice(0, 3);
    },

    async generateImage() {
      const { data: openaiData } = await openai.createImage({
        prompt: this.summary,
        n: 2,
        size: '512x512',
      });
      // const openaiData = {
      //   data: [{
      //     url: 'https://oaidalleapiprodscus.blob.core.windows.net/private/org-VsaiMoQpDg5ZiZtAYP0r36Pp/user-AoukX2y6S3JTu0YXuQyoC5q4/img-TjIWDl91pcHtAqMhDtEsDwye.png?st=2022-11-07T03%3A21%3A05Z&se=2022-11-07T05%3A21%3A05Z&sp=r&sv=2021-08-06&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2022-11-07T01%3A53%3A46Z&ske=2022-11-08T01%3A53%3A46Z&sks=b&skv=2021-08-06&sig=AIMTBkz5YH9lsqr0aEmlZacZ6bCcrqVu0CThJdQOXDs%3D',
      //   }],
      // };

      this.images = await Promise.all(openaiData.data.map(async (imageData) => {
        const { data: imageStream } = await axios.post(
          'http://localhost:8000/imageProxy',
          { url: imageData.url },
          { responseType: 'blob' },
        );
        console.log(Object.keys(imageStream));
        const fileName = this.summary.slice(0, 22);
        return {
          imageURL: imageData.url,
          imageStream: new File([imageStream], fileName, { type: 'image/png' }),
          fileName,
        };
      }));

      console.log(this.images);
    },

    clear() {
      this.summary = '';
      this.postText = '';
      this.images = [];
    },

    async submitPost() {
      const formData = new FormData();

      const data = {
        content: this.postText,
        summary: this.summary,
      };
      formData.append('data', JSON.stringify(data));

      this.images.forEach((imageData) => {
        formData.append('files.coverArts', imageData.imageStream, imageData.fileName);
      });

      await strapiAxios.post('/journal-entries', formData);

      this.clear();
    },

  },
};
</script>

<style lang="scss">
@font-face {
    font-family: "Aladin";
    src: url("./Aladin-Regular.ttf");
}

#home-page {
  height: 100vh;
  margin: 0 10px;
  display: flex;
  flex-direction: column;

  #page-header {
    display: flex;
    align-items: center;

    nav {
      display: flex;
      margin: auto;

      .button {
        font-size: 20px;
        padding: 10px 20px;
        margin: auto 10px;
        border: solid 1px $background-2;
        background: transparentize($background-1, .05);

        &.selected {
          box-shadow: 0 0 25px 2px $background-2;
        }
      }
    }
  }

  button {
    outline: none;
    border: none;
  }

  #post-workspace {
    display: grid;
    grid-template-columns: 50% 50%;
    grid-template-rows: 100%;
    column-gap: 10px;

    h1 {
      text-align: center;
    }

    #raw-post {
      flex: 1;
      padding: 10px;
      background: transparentize($background-1, .1);
      color: white;
      height: 70vh;
      max-height: 70vh;
    }

    #parsed-post {
      padding: 10px;
      font-family: 'Aladin';
      font-size: 20px;
      letter-spacing: 2px;
      overflow-y: auto;
      height: 70vh;
      max-height: 70vh;
      border: solid 1px $background-1;
      background: transparentize($background-1, .1);
    }
  }

  #finalize-post-section {
    margin-top: 10px;
    display: flex;
    justify-content: center;

    .button {
      padding: 10px 20px;
      margin: auto 10px;
      border: solid 1px $background-2;
    }
  }
}
</style>
