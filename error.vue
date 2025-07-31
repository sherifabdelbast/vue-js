<template>
  <div
      id="error-view"
      class="landing-hero-bg d-flex align-items-center justify-content-center"
  >
    <Error
        :statusCode="error.statusCode"
        :message="error.message"
        errType="not-mobile"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  error: Object,
});
</script>

<style scoped>
#error-view {
  padding: 0 15px;
  min-height: 100vh;
  min-width: 100%;
  background-image: url("./assets/media/auth/bg14.jpg");
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}
</style>
