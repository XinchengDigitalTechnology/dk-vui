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
    if (scrollRef.value) {
      scrollRef.value.scrollTop = val
    }
    await 1
    scrolling.value = false
  }
)

</script>
<template>
  <div v-if="bodyRect.scrollWidth !== bodyRect.clientWidth" class="v-HScroll"
    :style="{ '--scrollWidth': (bodyRect.scrollWidth + 12) + 'px', '--clientWidth': (bodyRect.clientWidth + 6) + 'px', '--ratio': ((bodyRect.clientWidth + scrollTop) / (bodyRect.scrollWidth + 12)).toFixed(2) * 100 + '%', '--scrollTop': scrollTop + 'px', '--mouseOffset': ((bodyRect.clientWidth > 600 ? 0 : (510 - bodyRect.clientWidth) / 2) - bodyRect.mouseOffset) + 'px' }">
    <div class="v-HScroll-wrapper">
      <div class="v-HScroll-mouse">
        <svg class="v-HScroll-mouse-icon" width="24px" height="24px" viewBox="0 0 24 24" version="1.1"
          xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
          <title>shubiao</title>
          <g id="权限" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
            <g id="鼠标滑动滚轮内容横向移动-收起效果" transform="translate(-1036.000000, -1048.000000)" fill="#666666"
              fill-rule="nonzero">
              <g id="编组-7" transform="translate(1035.000000, 1046.000000)">
                <g id="编组-3" transform="translate(0.998143, 1.998143)">
                  <path
                    d="M11.5236609,0.68920725 L11.6024149,0.745610033 L11.9790726,1.06994903 C12.2948404,1.34185582 12.4913444,1.72408189 12.5311136,2.13491208 L12.5386069,2.29015462 L12.5386069,3.43157621 L12.5363798,3.44960451 C16.5947598,3.72427762 19.8016275,7.10331017 19.8016275,11.2313468 L19.8016275,18.2036819 C19.8016275,20.5751927 17.8791381,22.4976821 15.5076272,22.4976821 L8.49608657,22.4976821 C6.1245757,22.4976821 4.2020863,20.5751927 4.2020863,18.2036819 L4.2020863,11.2313468 C4.2020863,7.10325289 7.40904298,3.72418384 11.4675029,3.44959307 L11.4651069,3.43157621 L11.4651069,2.29015462 C11.4651069,2.16514329 11.4215238,2.04509719 11.3434632,1.9498731 L11.2785954,1.88341943 L10.9019377,1.55908043 C10.677304,1.36564899 10.6520096,1.02674027 10.8454411,0.802106628 C11.0173801,0.602432275 11.3042642,0.560260548 11.5236609,0.68920725 Z M12.0018569,4.50507628 C8.36959174,4.50507628 5.4097761,7.38417491 5.28002245,10.9847597 L5.27558636,11.2313468 L5.27558636,18.2036819 C5.27558636,19.9187924 6.61630203,21.320762 8.30685772,21.418715 L8.49608657,21.4241821 L15.5076272,21.4241821 C17.2227378,21.4241821 18.6247074,20.0834664 18.7226604,18.3929107 L18.7281274,18.2036819 L18.7281274,11.2313468 C18.7281274,7.51653017 15.7166735,4.50507628 12.0018569,4.50507628 Z M12.0018569,7.5815898 C12.5947346,7.5815898 13.075357,8.06221215 13.075357,8.65508987 L13.075357,10.80209 C13.075357,11.3949677 12.5947346,11.8755901 12.0018569,11.8755901 C11.4089792,11.8755901 10.9283568,11.3949677 10.9283568,10.80209 L10.9283568,8.65508987 C10.9283568,8.06221215 11.4089792,7.5815898 12.0018569,7.5815898 Z"
                    id="形状结合"></path>
                </g>
              </g>
            </g>
          </g>
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
  left: calc(50%);
  transform: translateX(-50%);

  &:hover {
    width: 100%;

    .v-HScroll-slither {
      top: 0;
      cursor: default;
      opacity: 1;
    }

    .v-HScroll-mouse {
      top: 110%;
      opacity: 0;
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
    left: 0;
    top: 110%;
    opacity: 0;
    background: transparent;
    transition: opacity .1s;
    overflow: hidden;

    &-over {
      position: absolute;
      left: 0;
      top: 0;
      direction: rtl;
      transform: rotate(-90deg);
      overflow-x: hidden;
      overflow-y: auto;
      width: var(--clientWidth);
      height: var(--clientWidth);
      background-color: rgba(#000, .06);
      color: #fff;
      opacity: 1;
      background-image: url('./1.png'), linear-gradient(to bottom, rgba(#000, .1) var(--ratio), transparent 0%);
      background-size: auto, 100%;
      background-position: calc(100% - 14px) center, left;
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
    position: absolute;
    transition: opacity .1s;
    bottom: 6px;
    opacity: 1;
    width: 26px;
    height: 28px;
    border-radius: 12px 12px 9px 9px;
    background-color: rgba(#000, .06);
    background-image: linear-gradient(to right, rgba(#000, .1) var(--ratio), transparent 0%);
    background-size: 100% 100%;
    background-position: left;
    transform: translateX(var(--mouseOffset));

    // &-icon {
    //   animation: scale 1.5s infinite;
    // }
  }
}

@keyframes scale {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(.9);
  }

  100% {
    transform: scale(1);
  }
}</style>