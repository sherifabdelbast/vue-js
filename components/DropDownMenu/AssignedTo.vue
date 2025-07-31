<script setup>
import {useGetData} from "~/composables/useGetData";
import {usePostData} from "~/composables/usePostData";
import {useProjectStore} from "~/stores/useProjectStore";
import {storeToRefs} from "pinia";

const props = defineProps(["assignedTo", "issueId", "projectId", "from", "issue", "subIssueId"]);

const projectStore = useProjectStore();
const {issueDetails} = storeToRefs(projectStore);
const {getFilters} = useFilters();
const filters = getFilters();

const {fetchProjectAcceptedTeamMembers} = useGetData();
const {updateIssueInfoFromOutside} = usePostData();

const teamMembers = ref(null);
const isLoading = ref(false);
const assignLoading = ref(false);
const assignOpen = ref(false);

const getMembers = async () => {
  assignOpen.value = !assignOpen.value;

  if (assignOpen.value) {
    isLoading.value = true;
    if (!teamMembers.value) {
      const res = await fetchProjectAcceptedTeamMembers(props.projectId);
      if (res?.code === 200) {
        teamMembers.value = res?.teamMember;
      }
    }
    isLoading.value = false;
  }
}

const closeAssign = () => {
  assignOpen.value = false;
};

const handleChangeMember = async (userId) => {
  assignLoading.value = true;
  closeAssign();

  if (props.from === "board") {
    const response = await updateIssueInfoFromOutside(props.projectId, props.issueId, {assign_to: userId});
    if (response?.code === 200) {
      await projectStore.refreshProjectBoard(props.projectId, filters);
    }
    assignLoading.value = false;
    return
  } else if (props.from === "subIssue") {
    const response = await updateIssueInfoFromOutside(props.projectId, props.issueId, {assign_to: userId});
    if (response?.code === 200) {
      await projectStore.refreshIssueDetails(issueDetails?.value.project?.project_identify, issueDetails?.value.id);
    }
    assignLoading.value = false;
    return;
  }
  const response = await updateIssueInfoFromOutside(props.projectId, props.issueId, {assign_to: userId});
  if (response?.code === 200) {
    await projectStore.refreshProjectBacklog(props.projectId, filters);
  }
  assignLoading.value = false;
}
</script>

<template>
  <div class="teamMembersContainer position-relative">
    <div v-can:not="'edit issue'" class="cursor-default me-2">
      <TooltipMain v-if="assignedTo" :content='`Assigned to: "${assignedTo?.user?.name}"`' placement="right"
                   class="text-nowrap">
        <Avatar imgWidth="30" :user="assignedTo?.user"/>
      </TooltipMain>
      <TooltipMain v-else content="Unassigned" placement="right">
        <div class="symbol symbol-circle symbol-50px overflow-hidden">
          <img src="../../assets/media/avatars/blank.png" alt="Unassigned" class="w-30px h-30px"/>
        </div>
      </TooltipMain>
    </div>

    <div v-if="assignLoading">
      <div
          class="symbol symbol-circle symbol-50px overflow-hidden w-35px h-35px d-flex align-items-center justify-content-center">
        <Icon name="svg-spinners:180-ring-with-bg" size="24"/>
      </div>
    </div>

    <div v-else @click="getMembers" v-can="'edit issue'">
      <TooltipMain v-if="assignedTo" :content='`Assigned to: "${assignedTo?.user?.name}"`' placement="right"
                   class="text-nowrap">
        <Avatar imgWidth="30" :user="assignedTo?.user"/>
      </TooltipMain>
      <TooltipMain v-else content="Unassigned" placement="right">
        <div class="symbol symbol-circle symbol-50px overflow-hidden">
          <img src="../../assets/media/avatars/blank.png" alt="Unassigned" class="w-30px h-30px"/>
        </div>
      </TooltipMain>
    </div>

    <Transition name="assignToMenu">
      <div v-if="assignOpen" v-click-outside="closeAssign" v-can="'edit issue'"
           class="assignMenuWrapper position-absolute overflow-hidden bg-light shadow d-flex flex-column rounded z-1"
           :class="from === 'subIssue' ? 'custom-position' : ''"
           style="min-width: 200px;">
        <div v-if="isLoading" class="text-center p-3">
          Loading...
          <Icon name="svg-spinners:180-ring-with-bg" size="16"/>
        </div>

        <div v-else @click="handleChangeMember(null)" class="memberMenuItem py-2 px-4 d-flex align-items-center">
          <div class="symbol symbol-circle symbol-30px overflow-hidden" data-bs-toggle="tooltip"
               data-bs-placement="top"
               data-bs-title="Unassigned">
            <img src="../../assets/media/avatars/blank.png"
                 alt="Unassigned" class=""/>
          </div>
          <div class="m-0 ms-3">Unassigned</div>
        </div>

        <div v-if="!isLoading" v-for="(member, index) in teamMembers" :key="index">
          <div @click="handleChangeMember(member?.id)" v-if="member?.id !== assignedTo?.id"
               class="memberMenuItem py-2 px-4 border-top">
            <div class="h-35px d-flex align-items-center">
              <Avatar :user="member?.user" imgWidth="30"/>
              <div class="m-0 ms-3 truncate" style="max-width: 200px">
                <span class="truncate">{{ member?.user?.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.assignMenuWrapper {
  min-width: 200px;
  max-height: 180px;
  overflow-y: auto !important;
  top: 100%;
}

.assignToMenu-enter-active,
.assignToMenu-leave-active {
  top: 100%;
  opacity: 1;
  transition: all 0.3s ease;
}

.assignToMenu-enter-from,
.assignToMenu-leave-to {
  top: 120%;
  opacity: 0;
}

.memberMenuItem {
  transition: all 0.3s ease;
}

.memberMenuItem:hover {
  background-color: var(--bs-gray-200);
}

.custom-position {
  right: 50%;
  transform: translateX(50%);
}
</style>