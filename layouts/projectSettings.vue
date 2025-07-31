<script setup>
const route = useRoute();

const diableProjectHeadList = ref(["projects", "your-work", "profile-userId", "profile"]);
</script>

<template>
  <div>
    <HeaderMain />
    <ProjectHead v-if="!diableProjectHeadList.includes(route.name)"/>
    <ProjectDetails />
    <slot/>
    <!--    <Footer />-->
  </div>
</template>