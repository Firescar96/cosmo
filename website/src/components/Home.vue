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
      <div>
        Summaries
        <div v-for="(summary, index) in summaries" :key="'summary'+index">
          {{summary}}
        </div>
      </div>

      <button class="clickable" @click="summarizePost">Summarize</button>
      <button class="clickable" @click="submitPost">Submit</button>
    </div>
  </div>
</template>

<script>
import { marked } from 'marked';
import { ref, shallowRef } from 'vue';
import axios from 'axios';
import secrets from '../../secrets.json';

const strapiAxios = axios.create({
  baseURL: 'http://localhost:1337/api/',
  headers: { Authorization: `Bearer ${secrets.strapi}` },
});
const openaiAxios = axios.create({
  baseURL: 'https://api.openai.com/v1/engines/davinci',
  headers: { Authorization: `Bearer ${secrets.openai}` },
});

export default {
  name: 'HomePage',
  setup() {
    return {
      postText: ref('Today I went to the store. It was good. I did not like the look of someone there. I made a big oopsie at work. I am scared about the future.'),
      marked,
      summaries: shallowRef([]),
    };
  },
  methods: {
    async summarizePost() {
      const { data: result } = await openaiAxios({
        method: 'post',
        data: {
          prompt: `${this.postText}\n\nThree line bullet point summary, each with three words:\n`,
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
      const summaries = result.choices[0].text
        .match(/[a-zA-Z].*/g);

      this.summaries = summaries.splice(0, 3);
    },

    async submitPost() {
      console.log('hello');
      await strapiAxios.post({ url: '/journal-entries' }, {
        data: {
          content: this.postText,
          summaries: this.summaries,
          date: new Date(),
        },
      });
    },

  },
};
</script>

<style lang="scss">
.clickable {
  cursor: pointer;
}

button {
  outline: none;
  border: none;
}

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