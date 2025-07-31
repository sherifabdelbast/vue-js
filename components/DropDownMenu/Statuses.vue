<script setup>
import {useGetData} from "~/composables/useGetData";
import {usePostData} from "~/composables/usePostData";
import {useProjectStore} from "~/stores/useProjectStore";
import {storeToRefs} from "pinia";

const props = defineProps(["assignedStatus", "issueId", "projectId", "from"]);

const projectStore = useProjectStore();
const {issueDetails} = storeToRefs(projectStore);
const { getFilters } = useFilters();
const filters = getFilters();

const {fetchProjectStatuses} = useGetData();
const {updateIssueInfoFromOutside} = usePostData();

const statuses = ref(null);
const isLoading = ref(false);
const statusLoading = ref(false);
const statusesOpen = ref(false);

const getStatuses = async () => {
  statusesOpen.value = !statusesOpen.value;

  if (statusesOpen.value) {
    isLoading.value = true;
    if (!statuses.value) {
      const res = await fetchProjectStatuses(props.projectId);
      if (res?.code === 200) {
        statuses.value = res?.statuses;
      }
    }
    isLoading.value = false;
  }
}

const closeStatuses = () => {
  statusesOpen.value = false;
};

const handleChangeStatus = async (statusId) => {
  statusLoading.value = true;
  closeStatuses();
  if (props.from === "subIssue") {
    const response = await updateIssueInfoFromOutside(props.projectId, props.issueId, {status_id: statusId});
    if (response?.code === 200) {
      await projectStore.refreshIssueDetails(issueDetails?.value.project?.project_identify, issueDetails?.value.id);
    }
    statusLoading.value = false;
    return
  }
  const response = await updateIssueInfoFromOutside(props.projectId, props.issueId, {status_id: statusId});
  if (response?.code === 200) {
    await projectStore.refreshProjectBacklog(props.projectId, filters);
  }
  statusLoading.value = false;
}
</script>

<template>
  <div class="position-relative">
    <div class="py-1 px-3 rounded-1 fw-bold fs-8 text-uppercase text-nowrap cursor-default" v-can:not="'edit issue'"
         :class="assignedStatus?.type == 'TO DO' ? 'bg-light-active' : assignedStatus?.type == 'DONE' ? 'bg-light-primary text-primary' : 'bg-light-success text-success'">
      {{ assignedStatus?.name }}
    </div>

    <div v-if="statusLoading" class="py-1 px-3 rounded-1 fw-bold fs-8"
         :class="assignedStatus?.type == 'TO DO' ? 'bg-light-active' : assignedStatus?.type == 'DONE' ? 'bg-light-primary text-primary' : 'bg-light-success text-success'">
      <Icon name="svg-spinners:180-ring-with-bg" size="20"/>
    </div>

    <div v-else @click="getStatuses" v-can="'edit issue'"
         class="py-1 px-3 rounded-1 fw-bold fs-8 text-uppercase text-nowrap"
         :class="assignedStatus?.type == 'TO DO' ? 'bg-light-active' : assignedStatus?.type == 'DONE' ? 'bg-light-primary text-primary' : 'bg-light-success text-success'">
      {{ assignedStatus?.name }}
      <Icon v-if="statusesOpen" name="ic:outline-keyboard-arrow-up" size="17" class="m-0"/>
      <Icon v-else name="ic:outline-keyboard-arrow-down" size="17" class="m-0"/>
    </div>

    <Transition name="statusesMenu">
      <div v-click-outside="closeStatuses" v-if="statusesOpen" v-can="'edit issue'"
           class="statusesMenuWrapper position-absolute bg-light shadow p-3 d-flex flex-column gap-2 rounded-1 overflow-y-auto z-1"
           style="min-width: 130px !important; width: max-content !important; max-height: 138px !important; right: 0;">
        <div v-if="isLoading" class="text-center">
          Loading...
          <Icon name="svg-spinners:180-ring-with-bg" size="16"/>
        </div>

        <div v-else @click="handleChangeStatus(status?.id)" v-for="(status, index) in statuses" :key="index" class="status--item">
          <div v-if="status?.id !== assignedStatus?.id" class="py-1 px-3 rounded-1 text-uppercase fs-7 truncate"
               style="max-width: 150px"
               :class="status?.type == 'TO DO' ? 'bg-light-active' : status?.type == 'DONE' ? 'bg-light-primary text-primary' : 'bg-light-success text-success'">
            {{ status?.name }}
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.statusesMenuWrapper {
  transition: all 0.3s ease;
  top: 115%;
}

.statusesMenu-enter-active,
.statusesMenu-leave-active {
  top: 115%;
  opacity: 1;
  transition: all 0.3s ease;
}

.statusesMenu-enter-from,
.statusesMenu-leave-to {
  top: 130%;
  opacity: 0;
}

.status--item:empty {
  display: none;
}
</style>