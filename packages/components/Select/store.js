export const store = {}
export const updateSelectOptions = (type) => {
  if(!type) {
    console.error('参数type不能为空')
    return
  }
  if(!store[type]?.update) {
    console.error(`没有找到类型为 ${type} 的VSelect组件`)
    return
  }
  store[type].update()
}