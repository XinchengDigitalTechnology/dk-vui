import { defineComponent, ref, onMounted, watch } from 'vue'
import GlobalConfig from '~/packages/config'

export default defineComponent({
  name: 'VLoadDom',
  props: {
    delay: {
      type: Number,
      default: 500
    }
  },
  setup(props, { slots }) {
    const keepStore = GlobalConfig.keepStore()
    const router = GlobalConfig.useRouter()
    const routerName = router?.currentRoute?.value?.name

    const loaded = ref(false)

    onMounted(() => {
      setTimeout(() => {
        loaded.value = true
      }, props.delay)
    })

    watch(
      () => keepStore?.currentKeepAliveList,
      (val) => {
        if (!val.includes(routerName)) {
          loaded.value = false
        }
      }
    )

    return () => (loaded.value ? <div>{slots.default?.()}</div> : null)
  }
})
