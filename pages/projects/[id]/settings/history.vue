<script setup>
import {useProjectStore} from "~/stores/useProjectStore";
import {useAppStore} from "~/stores/useAppStore";

definePageMeta({
  middleware: [
    "auth",
    "project-permissions"
  ],
  layout: "project-settings"
});

const route = useRoute();
const appStore = useAppStore();
const projectStore = useProjectStore();
const {projectHistory} = toRefs(projectStore);

onMounted(async () => {
  appStore.isHistoryLoading = true;
  await projectStore.refreshProjectHistory(route.params.id);
  appStore.isHistoryLoading = false;
});
</script>

<template>
  <SkeletonLoaderProjectHistory v-if="appStore.isHistoryLoading"/>

  <div v-else class="app-container container-xxl py-10">
    <div class="card card-flush mb-6 mb-xl-9">
      <div class="card-header custom-header-border">
        <div class="card-title flex-column">
          <h2>Project History</h2>
        </div>
        <div class="card-toolbar">
        </div>
      </div>

      <div class="card-body">
        <div class="tab-content">
          <div class="card-body p-0 tab-pane fade show active">
            <ProjectHistory />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.card .card-header.custom-header-border {
  border-bottom: 1px solid var(--bs-card-border-color) !important;
}
</style>