<script setup>
const props = defineProps({
  bodyRect: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['scroll'])

const scrollTop = ref(0)
const scrolling = ref(false)
const handleScroll = (el) => {
  scrollTop.value = el.scrollTop
  if (scrolling.value) return
  emit('scroll', scrollTop.value)
}

const scrollRef = ref()
watch(
  () => props.bodyRect.scrollLeft,
  async (val) => {
    scrolling.value = true
    scrollRef.value.scrollTop = val
    await 1
    scrolling.value = false
  }
)

</script>
<template>
  <div v-if="bodyRect.scrollWidth !== bodyRect.clientWidth" class="v-HScroll"
    :style="{ '--scrollWidth': (bodyRect.scrollWidth + 14) + 'px', '--clientWidth': (bodyRect.clientWidth + 7) + 'px', '--ratio': ((bodyRect.clientWidth + scrollTop) / bodyRect.scrollWidth).toFixed(2) * 100 + '%', '--scrollTop': scrollTop + 'px' }">
    <div class="v-HScroll-wrapper">
      <div class="v-HScroll-mouse">
        <svg t="1708234887719" class="v-HScroll-mouse-icon" viewBox="0 0 1024 1024" version="1.1"
          xmlns="http://www.w3.org/2000/svg" p-id="4317" xmlns:xlink="http://www.w3.org/1999/xlink" width="18"
          height="18">
          <path
            d="M228.8 193.92C283.392 105.984 374.464 53.376 512 53.376s228.608 52.608 283.2 140.672C848 279.04 864 393.152 864 512c0 118.784-16 232.896-68.8 318.08-54.592 88-145.664 140.608-283.2 140.608s-228.608-52.608-283.2-140.672C176 744.96 160 630.784 160 512c0-118.784 16-232.832 68.8-317.952z m54.4 33.792C240 297.344 224 396.544 224 512c0 115.392 16 214.656 59.2 284.288 41.408 66.752 110.336 110.4 228.8 110.4 118.464 0 187.392-43.648 228.8-110.4 43.2-69.632 59.2-168.896 59.2-284.288 0-115.456-16-214.656-59.2-284.288C703.36 167.232 643.2 125.696 544 118.4v106.624c5.76 0.768 11.776 2.048 17.92 4.608 18.304 7.552 32.832 22.08 40.384 40.384 3.52 8.512 4.672 16.832 5.248 24.384 0.448 7.04 0.448 15.488 0.448 24.576v87.232c0 9.152 0 17.536-0.512 24.576a75.968 75.968 0 0 1-5.12 24.384 74.688 74.688 0 0 1-40.448 40.448 76.032 76.032 0 0 1-24.384 5.12c-7.04 0.512-15.488 0.512-24.576 0.512h-1.92c-9.088 0-17.536 0-24.576-0.448a76.032 76.032 0 0 1-24.32-5.184 74.688 74.688 0 0 1-40.448-40.448 75.968 75.968 0 0 1-5.248-24.32C416 423.744 416 415.36 416 406.208V319.104c0-9.152 0-17.6 0.512-24.64 0.512-7.552 1.664-15.872 5.12-24.32 7.68-18.368 22.144-32.896 40.448-40.448 6.144-2.56 12.16-3.84 17.92-4.608V118.464c-99.2 7.232-159.296 48.768-196.8 109.248z m203.264 61.184a10.688 10.688 0 0 0-5.568 5.568 27.264 27.264 0 0 0-0.576 4.352A353.92 353.92 0 0 0 480 320v85.312c0 10.368 0 16.64 0.32 21.184a27.264 27.264 0 0 0 0.576 4.352c1.024 2.56 3.072 4.48 5.568 5.632a27.392 27.392 0 0 0 4.352 0.512c4.608 0.32 10.816 0.32 21.184 0.32s16.576 0 21.12-0.32a27.392 27.392 0 0 0 4.48-0.512 10.688 10.688 0 0 0 5.504-5.632 27.392 27.392 0 0 0 0.576-4.352 353.92 353.92 0 0 0 0.32-21.12V320c0-10.368 0-16.576-0.32-21.12a27.392 27.392 0 0 0-0.576-4.48 10.688 10.688 0 0 0-5.568-5.504 27.264 27.264 0 0 0-4.352-0.576A353.92 353.92 0 0 0 512 288c-10.368 0-16.576 0-21.12 0.32a27.264 27.264 0 0 0-4.48 0.576z"
            fill="#fff" p-id="4318"></path>
        </svg>
      </div>
      <div class="v-HScroll-slither">
        <div ref="scrollRef" class="v-HScroll-slither-over" @scroll="e => handleScroll(e.target)">
          <div class="v-HScroll-slither-item"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.v-HScroll {
  position: absolute;
  z-index: 0;
  width: 40px;
  height: 100%;
  left: 50%;
  transform: translateX(-50%);

  &:hover {
    width: 100%;

    .v-HScroll-slither {
      position: relative;
      top: -20px;
      cursor: default;
      opacity: 1;
    }
    .v-HScroll-mouse{
      top: 110%;
      opacity: 0;
    }

    .v-HScroll-mouse {
      display: none;
    }
  }

  &-wrapper {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .v-HScroll-slither {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 110%;
    opacity: 0;
    background: transparent;
    transition: opacity .1s;

    &-over {
      position: absolute;
      left: 0;
      transform: rotate(-90deg);
      overflow-x: hidden;
      overflow-y: auto;
      width: 100%;
      height: var(--clientWidth);
      background-color: rgba(#888, .6);
      color: #fff;
      opacity: 1;
      background-image: url('./7.png'), linear-gradient(to bottom, rgba(#333, .4) var(--ratio), transparent 0%);
      background-size: auto, 100%;
      background-position: calc(100% - 34px) center, left;
      background-repeat: no-repeat, repeat;
    }

    &-item {
      width: 1px;
      height: var(--scrollWidth);
    }
  }


  &-mouse {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    transition: opacity .1s;
    top: 0;
    opacity: 1;
    height: 32px;
    width: 32px;
    border-radius: 8px 8px 0 0;
    background-color: rgba(#888, .6);
    background-image: linear-gradient(to right, rgba(#333, .4) var(--ratio), transparent 0%);
    background-size: 100% 100%;
    background-position: left;

    &-icon {
      animation: scale 1.5s infinite;
    }
  }
}

@keyframes scale {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.2);
  }

  100% {
    transform: scale(1);
  }
}
</style>