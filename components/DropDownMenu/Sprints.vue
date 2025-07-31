<script setup>
import {useProjectStore} from "~/stores/useProjectStore";
import {usePostData} from "~/composables/usePostData";
import {useAppStore} from "~/stores/useAppStore";
import {useFilters} from "~/composables/useFilters";

const emits = defineEmits(["issueUpdated"]);
const props = defineProps(["sprintName", "projectId", "issueId"]);
const {updateIssueInfo} = usePostData();
const {getFilters} = useFilters();
const filters = getFilters();

const route = useRoute();
const projectStore = useProjectStore();
const appStore = useAppStore();
const isActive = ref(false);
const isLoading = ref(false);
const isProgress = ref(false);
const toggleMenu = () => {
  isActive.value = !isActive.value;
};

const closeMenu = () => {
  isActive.value = false;
}

const handalIssueType = async (projectId) => {
  isLoading.value = true;
  if (projectStore.allSprints?.sprints) {
    isLoading.value = false;
    return;
  }
  await projectStore.refreshAllSprints(projectId);
  isLoading.value = false;
};

const handleChangeIssueType = async (sprintId) => {
  isProgress.value = true;
  const response = await updateIssueInfo(props.projectId, props.issueId, {sprint_id: sprintId});
  if (response) {
    if (route.name === "your-work") {
      emits('issueUpdated');
    }
    if (route.name === "projects-id-backlog") {
      await projectStore.refreshProjectBacklog(route.params?.id || project.value?.id, filters);
    }
    if (route.name === "projects-id") {
      await projectStore.refreshProjectBoard(route.params?.id || project.value?.id, filters);
    }
    isProgress.value = true;
  }
  isProgress.value = false;
}
</script>

<template>
  <div class="position-relative issueType-menu-parent" v-click-outside="closeMenu" @click="toggleMenu" v-can="{perms: 'edit issue', location: appStore.permissionLocation}">
    <div v-if="isProgress" class="d-flex align-items-center gap-1 mx-2 fs-6 text-center">
      <Icon name="svg-spinners:180-ring-with-bg" size="15"/>
    </div>
    <div v-else class="d-flex align-items-center gap-2 fs-4 px-2 cursor-pointer custom-round type-show"
         @click="handalIssueType(projectId);" :class="{ active: isActive }">
      <span class="text-capitalize">{{ sprintName || "Backlog" }}</span>
      <Icon v-if="isLoading" name="svg-spinners:180-ring-with-bg" size="12"/>
      <i v-else class="fa-solid fa-chevron-down arrow text-black" :class="{ active: isActive}"></i>
    </div>
    <ul class="position-absolute flex-column bg-white shadow-sm gap-2 mb-0 custom-width options issueType-menu list-style-none rounded-1"
        :class="{ active: isActive && !isLoading}" v-if="isActive && !isLoading">
      <li>
        <div class="option h-30px" @click="handleChangeIssueType(null)" v-if="sprint?.name != props.sprintName">
          <div class="info truncate" style="max-width: 200px">
            <span class="option-text fs-6">Backlog</span>
          </div>
        </div>
      </li>
      <li v-for="sprint in projectStore.allSprints?.sprints">
        <div class="option h-30px" @click="handleChangeIssueType(sprint?.id)"
             v-if="sprint?.name != props.sprintName">
          <div class="info truncate" style="max-width: 200px">
            <span class="option-text fs-6">{{ sprint?.name }}</span>
          </div>
        </div>
      </li>
    </ul>
  </div>

  <div class="position-relative issueType-menu-parent" v-can:not="{perms: 'edit issue', location: appStore.permissionLocation}">
    <div class="d-flex align-items-center gap-2 fs-4 px-2 custom-round">
      <span class="text-capitalize">{{ sprintName || "Backlog" }}</span>
    </div>
  </div>
</template>

<style scoped>
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

.active-issueType {
  background: #f2f2f2 !important;
  border-radius: 5px;
}

.member-custom,
.symbol-label-custom {
  width: 32px !important;
  height: 32px !important;
}

.issueType-menu {
  padding: 5px;
  z-index: 100;
}

.issueType-menu li:empty {
  display: none;
}

.type-show.active {
  background: #f2f2f2 !important;
}

.type-show:hover {
  background: #f2f2f2 !important;
  transition: all 0.3s;
}

.arrow {
  line-height: inherit !important;
}

.arrow.active {
  transform: rotate(-180deg);
}

.issueType-menu{
  max-height: 170px;
  overflow-y: auto;
}
</style>