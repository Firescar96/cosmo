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
       <div id="parsed-post" v-html="marked.parse(previewText)"></div>
      </div>

      <label>
        Upload image
        <input type="file" accept="image/*" style="position: fixed; top: -100%" multiple="true" @change="imageUploaded">
      </label>

      <div v-for="image in uploadedImages" :key="image.name" class="upload-row">
        <span
          @click="uploadedImages.splice(uploadedImages.findIndex(x => x == image), 1)"
          class="material-icons clickable">close
        </span>
        <span>{{image.name }}</span>
        <span
          @click="navigator.clipboard.writeText(`\n\n![${image.name}](${image.name})\n<figcaption></figcaption>\n\n`)"
          class="material-icons clickable">content_copy
        </span>
      </div>

      <div id="finalize-post-section">
        <div class="button" @click="processPost">Process</div>
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

        {{ coverArts.length }}
        <div v-for="image in coverArts" :key="image.imageURL">
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
  baseURL: 'https://api.openai.com/v1/',
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
      coverArts: shallowRef([]),
      uploadedImages: shallowRef([]),
      URL,
      navigator,
    };
  },
  computed: {
    previewText() {
      let result = this.postText;
      this.uploadedImages.forEach((image) => {
        result = result.replace(`(${image.name})`, `(${URL.createObjectURL(image)})`);
      });
      return result;
    }
    ,
  },
  components: { PostHistory },
  methods: {
    async processPost() {
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
        url: '/engines/text-davinci-002/completions',
      });
      const summary = result.choices[0].text
        .match(/[a-zA-Z].*/g);

      [this.summary] = summary.splice(0, 3);

      this.generateImage();
    },

    async generateImage() {
      const { data: openaiData } = await openaiAxios({
        method: 'post',
        data: {
          prompt: this.summary,
          n: 2,
          size: '512x512',
        },
        url: '/images/generations',
      });

      this.coverArts = await Promise.all(openaiData.data.map(async (imageData) => {
        console.log('imageData', imageData);
        const { data: imageStream } = await axios.post(
          'http://localhost:8000/imageProxy',
          { url: imageData.url },
          { responseType: 'blob' },
        );
        console.log(imageStream);
        const fileName = this.summary.slice(0, 22);
        return {
          imageURL: imageData.url,
          imageStream: new File([imageStream], fileName, { type: 'image/png' }),
          fileName,
        };
      }));
      console.log(this.coverArts.length);
    },

    clear() {
      this.summary = '';
      this.postText = '';
      this.coverArts = [];
      this.uploadedImages = [];
    },

    async submitPost() {
      const formData = new FormData();

      const data = {
        content: this.postText,
        summary: this.summary,
      };
      formData.append('data', JSON.stringify(data));

      this.coverArts.forEach((imageData) => {
        formData.append('files.coverArts', imageData.imageStream, imageData.fileName);
      });
      this.uploadedImages.forEach((imageData) => {
        console.log('imageData', imageData);
        formData.append('files.documents', imageData, imageData.fileName);
      });

      await strapiAxios.post('/journal-entries', formData);

      this.clear();
    },

    imageUploaded(event) {
      this.uploadedImages.push(...event.target.files);
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

  .upload-row {
    display: flex;
    align-items: center;
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
