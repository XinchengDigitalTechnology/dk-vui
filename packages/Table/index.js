import index from './src/index.vue'

index.install = (vue) => {
  vue.component(index.name, index)
}

export default index