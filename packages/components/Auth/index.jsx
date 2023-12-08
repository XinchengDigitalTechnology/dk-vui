const permission = (val) => {
  return !val || (window.BTN_AUTH || []).includes(val)
}
const VButton = (props, { slots, emit, attrs }) => {
  const { auth } = props
  return permission(auth) ? <div class='v-auth'>{slots.default()}</div> : ''
}

VButton.props = {
  auth: { type: String, default: '' },
}

export default VButton