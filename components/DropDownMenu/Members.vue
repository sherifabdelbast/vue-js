<script setup>
import {useProjectStore} from "~/stores/useProjectStore";
import {useAppStore} from "~/stores/useAppStore";
import {storeToRefs} from "pinia"
import {useAuth} from "~/composables/useAuth";
import {useGetData} from "~/composables/useGetData";
import {usePostData} from "~/composables/usePostData";
import {useFilters} from "~/composables/useFilters";

const emits = defineEmits(["issueUpdated"]);
const props = defineProps(["projectId", "assignTo", "issueId"]);

const appStore = useAppStore();
const projectStore = useProjectStore();
const {issueDetails} = storeToRefs(projectStore);

const {fetchProjectAcceptedTeamMembers} = useGetData();
const {updateIssueInfo} = usePostData();
const {project} = storeToRefs(projectStore);
const {user} = useAuth();
const { getFilters } = useFilters();
const filters = getFilters();

const isActive = ref(false);
const selectedMember = ref("");
const selectedMemberId = ref(props.assignTo?.id || null);
const selectedMemberPhoto = ref("");
const assignLoading = ref(false);
const route = useRoute();
// Methods
const toggleMenu = () => {
  isActive.value = !isActive.value;
};

const selectMember = (member) => {
  selectedMember.value = member?.user?.name;
  selectedMemberPhoto.value = member?.user?.photo;
  isActive.value = false;
};
const closeMenuOnClickOutside = (event) => {
  const menuElement = document.querySelector('.select-menu-members');
  if (menuElement && !menuElement.contains(event.target)) {
    isActive.value = false;
  }
};

onMounted(() => {
  window.addEventListener('click', closeMenuOnClickOutside);
});

onUnmounted(() => {
  window.removeEventListener('click', closeMenuOnClickOutside);
});

const members = ref("");
const handalMembers = async () => {
  assignLoading.value = true;
  if (members.value) {
    selectedMemberId.value = props.assignTo?.id || null;
    assignLoading.value = false;
    return;
  }
  const res = await fetchProjectAcceptedTeamMembers(props?.projectId);
  members.value = res;
  assignLoading.value = false;
};
const handleChangeMember = async (userId) => {
  assignLoading.value = true;
  if (selectedMemberId.value === userId) {
    assignLoading.value = false;
    return;
  }
  const response = await updateIssueInfo(issueDetails?.value.project?.project_identify, issueDetails?.value.id, {assign_to: userId});
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
    assignLoading.value = true;
  }
  assignLoading.value = false;
}
</script>
<template>
  <div @click="handalMembers" class="select-menu" :class="{ active: isActive }" v-can="{perms: 'edit issue', location: appStore.permissionLocation}">
    <div
        class="select-btn h-35px custom-width box-hover rounded-1 selected border"
        @click="toggleMenu"
    >
      <div class="d-flex justify-content-center align-items-center gap-2">
        <Avatar v-if="assignTo?.user" :user="assignTo?.user" imgWidth="25"/>
        <Avatar v-else :unsigned="null" imgWidth="25"/>
        <span class="m-0 truncate" style="max-width: 200px; line-height: initial;">
          {{ assignTo?.user?.name || selectedMember || "Unassigned" }}
        </span>
      </div>
      <div v-if="assignLoading" class="text-center">
        <Icon name="svg-spinners:180-ring-with-bg" size="12"/>
      </div>
      <i v-else class="fa-solid fa-chevron-down arrow"></i>
    </div>
  </div>

  <div class="select-menu" v-can:not="{perms: 'edit issue', location: appStore.permissionLocation}">
    <div class="select-btn h-35px custom-width rounded-1 selected border">
      <div class="d-flex justify-content-center align-items-center gap-2">
        <Avatar v-if="assignTo?.user" :user="assignTo?.user" imgWidth="25"/>
        <Avatar v-else :unsigned="null" imgWidth="25"/>
        <span class="m-0 truncate" style="max-width: 200px; line-height: initial;">
          {{ assignTo?.user?.name || selectedMember || "Unassigned" }}
        </span>
      </div>
    </div>
  </div>

  <ul v-can="{perms: 'edit issue', location: appStore.permissionLocation}" class="position-absolute flex-column gap-2 mb-0 custom-width options members-list list-style-none rounded-1"
      :class="{ active: isActive && assignLoading === false }">
    <li @click="selectMember(null)" v-if="assignTo?.user?.id !== undefined">
      <div class="option gap-3 h-35px" @click="handleChangeMember(null)">
        <Avatar :unsigned="null" imgWidth="30"/>
        <div class="info truncate" style="max-width: 200px">
          <span class="option-text">Unassigned</span>
        </div>
      </div>
    </li>
    <li v-for="(member, index) in members?.teamMember" :key="index" @click="selectMember(member)">
      <div class="option gap-3 h-35px" @click="handleChangeMember(member?.id)"
           v-if="member?.user?.id !== assignTo?.user?.id">
        <Avatar :user="member?.user" imgWidth="30"/>
        <div class="info truncate" style="max-width: 200px">
                <span class="option-text">{{ member?.user?.name }}
                    <span v-if="member?.user?.id === user.id" class="text-muted fs-8">(Assign to me)</span>
                </span>
        </div>
      </div>
    </li>
  </ul>
</template>

<style>
.member-custom,
.symbol-label-custom {
  width: 32px !important;
  height: 32px !important;
}

.members-list li:empty {
  display: none;
}

.selected .arrow {
  font-size: 12px;
  transition: 0.3s;
}

.select-menu.active .selected .arrow {
  transform: rotate(-180deg);
}
</style>