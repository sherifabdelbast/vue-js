<template>
  <div class="placeholder">
    &nbsp;
  </div>
</template>

<script setup>
defineProps({
  height: {
    type: String,
  },
  width: {
    type: String,
  },
  borderRadius: {
    type: String,
  },
});
</script>

<style scoped>
@keyframes bgAnimate {
  0% {
    background-position: 50% 0;
  }

  100% {
    background-position: -150% 0;
  }
}
.placeholder {
  height: v-bind(height);
  width: v-bind(width);
  border-radius: v-bind(borderRadius);
  background-image: linear-gradient(
      to right,
      #d6d7d8 0%,
      #e2e3e4 10%,
      #d6d7d8 20%,
      #d6d7d8 100%
  );
  background-size: 200% 100%;
  animation: bgAnimate 1.2s linear infinite;
}
</style>