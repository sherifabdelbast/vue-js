<script setup>
const props = defineProps(["title"]);
</script>

<template>
  <div ref="createIssueParent" class="issue-container d-flex align-items-center justify-content-between cursor-pointer py-4 px-10 border gap-10 position-relative">
    <div class="issue-title d-flex align-items-center me-4 overflow-hidden">
      <span class="d-block text-gray-800 truncate text-nowrap fs-5">{{title}}</span>
    </div>

    <div class="issue-info d-flex align-items-center justify-content-between flex-shrink-0"><Icon name="svg-spinners:180-ring-with-bg" size="20"/></div>
  </div>
</template>

<style scoped>
.issue-container::-webkit-scrollbar {
  height: 2px;
  background-color: transparent;
}

.issue-container::-webkit-scrollbar-thumb {
  background-color: var(--bs-text-gray-200);
  border-radius: 2px;
}

.issue-container:hover {
  background-color: var(--bs-gray-100);
}
</style>