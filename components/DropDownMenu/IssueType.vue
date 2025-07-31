<script setup>
import {useProjectStore} from "~/stores/useProjectStore";
import {useAppStore} from "~/stores/useAppStore";
import {usePostData} from "~/composables/usePostData";
import {storeToRefs} from "pinia";

const emits = defineEmits(["issueUpdated"]);
const props = defineProps(["issueType", "projectId", "issueId", "from", "customStyle"]);
const {updateIssueInfo, updateIssueInfoFromOutside} = usePostData();

const route = useRoute();
const {user} = useAuth();
const appStore = useAppStore();
const projectStore = useProjectStore();
const {issueDetails} = storeToRefs(projectStore);
const {getFilters} = useFilters();
const filters = getFilters();

const isActive = ref(false);
const isLoading = ref(false);
const isProgress = ref(false);
const toggleIssueTypeMenu = () => {
  isActive.value = !isActive.value;
};

const closeMenu = () => {
  isActive.value = false;
}

const handalIssueType = async (projectId, issueId) => {
  isLoading.value = true;
  if (projectStore.issueTypes?.type) {
    isLoading.value = false;
    return;
  }
  await projectStore.refreshAllIssueTypes(projectId, issueId);
  isLoading.value = false;
};

const handleChangeIssueType = async (issueTypeName) => {
  isProgress.value = true;
  const response = ref(null);
  if (props.from === "details") {
    isProgress.value = true;
    response.value = await updateIssueInfo(issueDetails?.value.project?.project_identify, issueDetails?.value.id, {type: issueTypeName});
    isProgress.value = false;
  } else {
    response.value = await updateIssueInfoFromOutside(props.projectId, props.issueId, {type: issueTypeName});
  }
  if (response.value && !issueDetails?.value?.parent_id) {
    if (route.name === "your-work") {
      emits('issueUpdated');
      await projectStore.refreshAllIssues(null);
      await projectStore.refreshAllIssues(user.value?.id);
    }
    if (route.name === "projects-id-backlog") {
      await projectStore.refreshProjectBacklog(route.params?.id || issueDetails?.value.project?.project_identify, filters);
    }
    if (route.name === "projects-id") {
      await projectStore.refreshProjectBoard(route.params?.id || issueDetails?.value.project?.project_identify, filters);
    }
    isProgress.value = true;
  }
  isProgress.value = false;
}
</script>

<template>
  <div class="position-relative issueType-menu-parent" v-click-outside="closeMenu" @click="toggleIssueTypeMenu"
       v-can="'edit issue'">
    <div v-if="isProgress" class="d-flex align-items-center gap-1 fs-6 text-center">
      <Icon name="svg-spinners:180-ring-with-bg" size="15"/>
    </div>
    <div v-else class="d-flex align-items-center fs-4 cursor-pointer custom-round type-show"
         @click="handalIssueType(projectId, issueId);" :class="[{ active: isActive }, customStyle ? customStyle : '']">
      <img v-if="from === 'details' || (issueType === 'task' && !isLoading)"
           src="../../assets/media/svg/types/task.svg"
           alt="task" width="14">
      <img v-else-if="from === 'details' || (issueType === 'story' && !isLoading)"
           src="../../assets/media/svg/types/story.svg"
           alt="story" width="14">
      <img v-else-if="from === 'details' || (issueType === 'bug' && !isLoading)"
           src="../../assets/media/svg/types/bug.svg"
           alt="bug" width="14">

      <span class="text-capitalize mx-2" v-if="from === 'details'">{{ issueType }}</span>
      <Icon v-if="isLoading" name="svg-spinners:180-ring-with-bg" size="12"/>
      <i v-else class="fa-solid fa-chevron-down arrow text-black" :class="{ active: isActive}"
         v-if="from === 'details'"></i>
    </div>
    <ul class="position-absolute flex-column bg-white shadow-sm gap-2 mb-0 custom-width options z-5 issueType-menu list-style-none rounded-1"
        :class="{ active: isActive && !isLoading}" v-if="isActive && !isLoading">
      <li v-for="issueType in projectStore.issueTypes?.type">
        <div class="option gap-3 h-35px" @click="handleChangeIssueType(issueType)" v-if="issueType != props.issueType">
          <div class="info truncate" style="max-width: 200px">
            <img v-if="issueType === 'task'" src="../../assets/media/svg/types/task.svg" alt="task" width="15">
            <img v-if="issueType === 'story'" src="../../assets/media/svg/types/story.svg" alt="story" width="15">
            <img v-if="issueType === 'bug'" src="../../assets/media/svg/types/bug.svg" alt="bug" width="15">
            <span class="option-text fs-6 mx-2">{{ issueType }}</span>
          </div>
        </div>
      </li>
    </ul>
  </div>

  <div class="position-relative issueType-menu-parent"
       v-can:not="'edit issue'">
    <div class="d-flex align-items-center fs-4 custom-round">
      <img v-if="from === 'details' || (issueType === 'task' && !isLoading)"
           src="../../assets/media/svg/types/task.svg"
           alt="task" width="14">
      <img v-if="from === 'details' || (issueType === 'story' && !isLoading)"
           src="../../assets/media/svg/types/story.svg"
           alt="story" width="14">
      <img v-if="from === 'details' || (issueType === 'bug' && !isLoading)"
           src="../../assets/media/svg/types/bug.svg"
           alt="bug" width="14">
      <span class="text-capitalize mx-2" v-if="from === 'details'">{{ issueType }}</span>
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
</style>