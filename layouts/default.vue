<script setup>
import {useAppStore} from "~/stores/useAppStore";

const route = useRoute();

const appStore = useAppStore();

onMounted(() => {
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
});

const diableProjectHeadList = ref(["projects", "your-work", "profile-userId", "profile"]);
</script>

<template>
  <div>
    <HeaderMain />
    <ProjectHead v-if="!diableProjectHeadList.includes(route.name)"/>
    <slot/>
<!--    <Footer />-->
  </div>
</template>