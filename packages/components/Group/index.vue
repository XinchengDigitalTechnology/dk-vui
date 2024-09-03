<template name="VGroup">
  <div class="v-group">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'VGroup'
}
</script>

<style lang="scss">
.v-group {
  display: flex;

  >* {
    margin-right: -1px;
  }

  .el-input__wrapper,
  .el-select__wrapper,
  .el-button,
  .el-select-v2__wrapper,
  .v-group-item {
    position: relative;
    border-radius: 0;

    &:hover,
    &.is-focus,
    &.is-active {

      &.el-input__wrapper,
      .el-input__wrapper,
      .el-select__wrapper,
      .el-input__suffix {
        z-index: 1;
      }
    }

    &:hover {

      .el-input-number__decrease,
      .el-input-number__increase {
        z-index: 2;
      }
    }
  }

  >:first-child {

    &.el-input__wrapper,
    .el-input__wrapper,
    .el-select__wrapper,
    .el-button,
    .el-select-v2__wrapper,
    &.v-group-item {
      border-top-left-radius: 4px;
      border-bottom-left-radius: 4px;
    }
  }

  >:last-child {
    margin-right: 0;

    &.el-input__wrapper,
    .el-input__wrapper,
    .el-select__wrapper,
    .el-button,
    .el-select-v2__wrapper,
    &.v-group-item {
      border-top-right-radius: 4px;
      border-bottom-right-radius: 4px;
    }
  }

  .v-group-item {
    display: flex;
    align-items: center;
    padding: 0 10px;
    font-size: 14px;
    color: #3A4259;
    white-space: nowrap;
    box-shadow: 0 0 0 1px var(--el-input-border-color, var(--el-border-color)) inset;
  }

  .el-button-group {
    display: flex;
  }

  .el-select__tags,
  .el-input-number__decrease,
  .el-input-number__increase {
    z-index: 2;
  }
}
</style>