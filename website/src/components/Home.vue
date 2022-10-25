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
        <textarea id="raw-post" aria-label="postText" v-model="postText"></textarea>
       <div id="parsed-post" v-html="marked.parse(postText)"></div>
      </div>
      <div id="finalize-post-section">
        <div v-if="summaries.length">
          Summaries
          <div v-for="(summary, index) in summaries" :key="'summary'+index">
            {{summary}}
          </div>
        </div>

        <div class="button" @click="summarizePost">Process</div>
        <div class="button" @click="submitPost">Submit</div>
      </div>
    </div>
  </div>
</template>

<script>
import { marked } from 'marked';
import { ref, shallowRef } from 'vue';
import axios from 'axios';
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

// eslint-disable-next-line quotes
const markdownExample = `

An h1 header
============

Paragraphs are separated by a blank line.

2nd paragraph. *Italic*, **bold**, and \`monospace\`. Itemized lists
look like:

  * this one
  * that one
  * the other one

Note that --- not considering the asterisk --- the actual text
content starts at 4-columns in.

> Block quotes are
> written like so.
>
> They can span multiple paragraphs,
> if you like.

Use 3 dashes for an em-dash. Use 2 dashes for ranges (ex., "it's all
in chapters 12--14"). Three dots ... will be converted to an ellipsis.
Unicode is supported. ☺



An h2 header
------------

Here's a numbered list:

 1. first item
 2. second item
 3. third item

Note again how the actual text starts at 4 columns in (4 characters
from the left side). Here's a code sample:

    # Let me re-iterate ...
    for i in 1 .. 10 { do-something(i) }

As you probably guessed, indented 4 spaces. By the way, instead of
indenting the block, you can use delimited blocks, if you like:

~~~
define foobar() {
    print "Welcome to flavor country!";
}
~~~

(which makes copying & pasting easier). You can optionally mark the
delimited block for Pandoc to syntax highlight it:

~~~python
import time
# Quick, count to ten!
for i in range(10):
    # (but not *too* quick)
    time.sleep(0.5)
    print(i)
~~~
`;

export default {
  name: 'HomePage',
  setup() {
    return {
      postText: ref(`Today I went to the store. It was good. I did not like the look of someone there. I made a big oopsie at work. I am scared about the future.${markdownExample}`),
      marked,
      summaries: shallowRef([]),
      currentTab: ref('newPost'),
    };
  },
  components: { PostHistory },
  methods: {
    async summarizePost() {
      const { data: result } = await openaiAxios({
        method: 'post',
        data: {
          prompt: `${this.postText}\n\nwhat is the highlight of this text in 5 words or less:\n`,
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
#home-page {
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
    display: flex;

    h1 {
      text-align: center;
    }

    #raw-post {
      flex: 1;
      height: 500px;
      padding: 10px;
      background: $background-2;
      color: white;
      height: 70vh;
      max-height: 70vh;
    }
    #parsed-post {
      flex: 1;
      padding: 0 20px;
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
