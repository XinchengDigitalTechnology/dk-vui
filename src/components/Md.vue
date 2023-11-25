<script setup>
import 'bytemd/dist/index.css'
import { Editor, Viewer } from "@bytemd/vue-next"
import breaks from "@bytemd/plugin-breaks"
import frontmatter from "@bytemd/plugin-frontmatter"
import gemoji from "@bytemd/plugin-gemoji"
import gfm from "@bytemd/plugin-gfm"
import highlight from "@bytemd/plugin-highlight"
import math from "@bytemd/plugin-math"
import mediumZoom from "@bytemd/plugin-medium-zoom"
import mermaid from "@bytemd/plugin-mermaid"
import "highlight.js/styles/atom-one-dark.css"
import { $copyToClipboard } from "@xqsit94/vue3-copy-to-clipboard"
import { ElMessage } from "element-plus"

const props = defineProps({
  modelValue: { type: String, default: '' },
  view: Boolean,
})
const emit = defineEmits(['update:modelValue'])

const handleChange = val => {
  emit('update:modelValue', val)
}

// 复制功能 plugins
const copyIt = (msg) => {
  $copyToClipboard(msg)
  ElMessage.success("复制成功")
}
const copyCode = () => {
  return {
    viewerEffect({ markdownBody }) {
      const codes = markdownBody.querySelectorAll("code")
      codes.forEach((code) => {
        const btn = document.createElement("span")
        btn.setAttribute("class", "copy-code-button")
        code.insertAdjacentElement("beforebegin", btn)
        btn.addEventListener("click", () => {
          copyIt(code.innerText)
        })
      })
    }
  }
}

const plugins = [breaks(), frontmatter(), gemoji(), gfm(), copyCode(), highlight(), math(), mediumZoom(), mermaid()]

</script>

<template>
  <component :is="view ? Viewer : Editor" :value="modelValue" :plugins="plugins" class="md" @change="handleChange" />
</template>

<style lang="scss" scope>
.bytemd, .md{
  table{
    border: 1px solid #ddd;
    width: 100%;
  }
}
.peer {
  .peer-hover {
    width: 0;
    opacity: 0;
  }

  &:hover {
    .peer-hover {
      width: 30px;
      opacity: 1;
    }
  }
}

pre {
  position: relative;

  .copy-code-button {
    position: absolute;
    right: 10px;
    top: 1em;
    cursor: pointer;
    padding: 0 5px;
    background-color: #303030;
    color: #fff;
    border: 1px solid #dedede;
    border-radius: 10px;
    transform: translateX(10px);
    pointer-events: none;
    opacity: 0;
    transition: all 0.3s ease;

    &::after {
      content: "copy";
    }
  }

  &:hover {
    .copy-code-button {
      pointer-events: all;
      transform: translateX(0);
      opacity: 0.5;
    }
  }
}

.group {
  .btns {
    transition: all 0.3s ease;
    transform: translateY(10px) scale(0.8);
  }

  &:hover {
    .btns {
      transform: translateY(0) scale(1);
    }
  }
}
</style>