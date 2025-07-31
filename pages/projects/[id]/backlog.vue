<script setup>
import {useProjectStore} from "~/stores/useProjectStore";
import {useAppStore} from "~/stores/useAppStore";
import {storeToRefs} from "pinia";
import {useToast} from "vue-toastification";

definePageMeta({
  middleware: [
    "auth",
    "project-permissions"
  ],
});

const route = useRoute();
const toast = useToast();

// === stores === //
const appStore = useAppStore();
const projectStore = useProjectStore();
const {project, backlog} = storeToRefs(projectStore);

onMounted(async () => {
  appStore.isBacklogLoading = true;
  await projectStore.refreshProjectStatuses(route.params.id);
  await projectStore.refreshAllAcceptedTeam(route.params.id);
  await projectStore.refreshAllLabels(route.params.id);
  await projectStore.refreshProjectBacklog(route.params?.id || project.value?.project_identify);
  appStore.isBacklogLoading = false;
});
</script>

<template>
  <SkeletonLoaderBacklog v-if="appStore.isBacklogLoading"/>

  <div v-else class="app-container container-xxl">
    <div class="app-main flex-column flex-row-fluid" id="kt_app_main">
      <div class="d-flex flex-column flex-column-fluid py-10">
        <FilterGlobal from="backlog"/>

        <ProjectSprint v-for="(sprint, index) in backlog?.sprints" :key="index" :sprint="sprint"/>
        <ProjectBacklog/>
      </div>
    </div>
  </div>
</template>

<style>
.custom-p-style {
  padding: 30px;
}
</style>
