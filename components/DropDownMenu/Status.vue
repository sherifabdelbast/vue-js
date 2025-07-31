<script setup>
import {useGetData} from "~/composables/useGetData";
import {useProjectStore} from "~/stores/useProjectStore";
import {useAppStore} from "~/stores/useAppStore";
import {usePostData} from "~/composables/usePostData";
import {storeToRefs} from "pinia";
import {useFilters} from "~/composables/useFilters";

const emits = defineEmits(["issueUpdated"]);
const props = defineProps(["status", "projectId", "issueId"])
const projectStore = useProjectStore();
const appStore = useAppStore();
const {issueDetails} = storeToRefs(projectStore);

const {fetchProjectStatuses} = useGetData();
const {updateIssueInfo} = usePostData();
const route = useRoute();
const {getFilters} = useFilters();
const filters = getFilters();

const isActive = ref(false);
const selectedStatus = ref(null);
const selectedStatusId = ref(props.status?.id);
const statusLoading = ref(false);
const status = ref("");
const toggleMenu = () => {
  isActive.value = !isActive.value;
};
const selectOption = (status) => {
  selectedStatus.value = status.name;
  isActive.value = false;
};
const closeMenuOnClickOutside = (event) => {
  const menuElement = document.querySelector('.select-menu-status');
  if (menuElement && !menuElement.contains(event.target)) {
    isActive.value = false;
  }
};
const handalStatus = async () => {
  statusLoading.value = true;
  if (status.value) {
    selectedStatusId.value = props.status.id;
    statusLoading.value = false;
  }
  status.value = await fetchProjectStatuses(props?.projectId);
  statusLoading.value = false;
};
const handleChangeStatus = async (statusId) => {
  statusLoading.value = true;
  if (selectedStatusId.value === statusId) {
    statusLoading.value = false;
    return;
  }
  const response = await updateIssueInfo(issueDetails?.value.project?.project_identify, issueDetails?.value.id, {status_id: statusId});
  if (response && !issueDetails?.value?.parent_id) {
    if (route.name === "your-work") {
      emits('issueUpdated');
    }
    if (route.name === "projects-id-backlog") {
      await projectStore.refreshProjectBacklog(route.params?.id || project.value?.project_identify, filters);
    }
    if (route.name === "projects-id") {
      await projectStore.refreshProjectBoard(route.params?.id || project.value?.project_identify, filters);
    }
    statusLoading.value = true;
  }
  statusLoading.value = false;
}

onMounted(() => {
  window.addEventListener('click', closeMenuOnClickOutside);
});
onUnmounted(() => {
  window.removeEventListener('click', closeMenuOnClickOutside);
});
</script>

<template>
  <div @click="handalStatus" v-can="{perms: 'edit issue', location: appStore.permissionLocation}">
    <div class="select-menu" :class="{ active: isActive }" @click="toggleMenu">
      <div class="d-flex justify-content-between align-items-center selected rounded-1 border"
           :class="props.status?.type === 'TO DO' ? 'bg-light-active' : props.status?.type === 'DONE' ? 'bg-light-primary text-primary' : 'bg-light-success text-success'">
        <div class="option">
          <div class="info truncate" style="max-width: 200px">
            <span class="option-text text-uppercase">{{ props.status?.name }}</span>
          </div>
        </div>

        <div v-if="statusLoading" class="text-center">
          <Icon name="svg-spinners:180-ring-with-bg" size="12"/>
        </div>
        <i v-else class="fa-solid fa-chevron-down arrow"></i>
      </div>
    </div>
  </div>

  <div v-can:not="{perms: 'edit issue', location: appStore.permissionLocation}">
    <div class="select-menu">
      <div class="d-flex justify-content-between align-items-center selected rounded-1 border"
           :class="props.status?.type === 'TO DO' ? 'bg-light-active' : props.status?.type === 'DONE' ? 'bg-light-primary text-primary' : 'bg-light-success text-success'">
        <div class="option">
          <div class="info truncate" style="max-width: 200px">
            <span class="option-text text-uppercase">{{ props.status?.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <ul class="position-absolute flex-column custom-width list-style-none statuses-list options rounded-1"
      v-can="{perms: 'edit issue', location: appStore.permissionLocation}"
      :class="{ active: isActive && statusLoading === false }">
    <li v-for="(status, index) in status.statuses" :key="index" :data-status="status.name"
        @click="handleChangeStatus(status.id)">
      <div class="option h-36px" @click="selectOption(status)" v-if="status.id !== selectedStatusId">
        <div style="width: 100%; height: fit-content">
          <span class="option-text text-uppercase">{{ status.name }}</span>
        </div>
      </div>
    </li>
  </ul>
</template>

<style>
.selected .arrow {
  font-size: 12px;
  transition: 0.3s;
}

.select-menu.active .selected .arrow {
  transform: rotate(-180deg);
}

.select-menu .options {
  position: relative;
  max-height: 200px;
  overflow-y: auto;
  flex-direction: column;
  gap: 8px !important;
  padding: 5px;
  margin-top: 10px;
  border-radius: 5px;
  background: #fff;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.1);
  display: none;
}

.select-menu.active .options {
  display: flex;
}

.active-status {
  background: #f2f2f2 !important;
  border-radius: 5px;
}

.statuses-list li:empty {
  display: none;
}
</style>