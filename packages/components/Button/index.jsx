const VButton = (props, { slots, emit, attrs }) => {
  const permission = (val) => {
    return !val || (window.BTN_AUTH || []).includes(val)
  }
  const { auth } = props
  return permission(auth) ? <el-button>{slots}</el-button> : ''
}

VButton.props = {
  auth: { type: String, default: '' },
}
export default VButton