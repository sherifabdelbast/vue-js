<script setup>
import moment from "moment";
import {useProjectStore} from "~/stores/useProjectStore";

definePageMeta({
  middleware: [
    "auth",
    "project-permissions"
  ],
});

const route = useRoute();
const projectStore = useProjectStore();
const {projectHistory} = toRefs(projectStore);

await projectStore.refreshProjectHistory(route.params.id);
</script>

<template>
  <div class="app-container container-xxl py-10">
    <div class="card card-flush mb-6 mb-xl-9">
      <!--begin::Card Header-->
      <div class="card-header custom-header-border">
        <!--begin::Card title-->
        <div class="card-title flex-column">
          <h2>Project History</h2>
        </div>
        <!--end::Card title-->
        <!--begin::Card toolbar-->
        <div class="card-toolbar">
        </div>
        <!--end::Card toolbar-->
      </div>

      <div class="card-body">
        <div class="tab-content">
          <div class="card-body p-0 tab-pane fade show active">
            <ProjectHistory/>
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