<script setup>
import {storeToRefs} from "pinia";
import {useProjectStore} from "~/stores/useProjectStore";
import {useAppStore} from "~/stores/useAppStore";
import {useAuth} from "~/composables/useAuth";
import {Collapse} from "vue-collapsed";

const route = useRoute();
const diableProjectHeadList = ref([
  "projects",
  "your-work",
  "profile-userId",
  "profile",
  "create-project",
  "projects-id-settings",
  "projects-id-settings-roles",
  "projects-id-settings-issues",
  "projects-id-settings-sprints",
  "projects-id-settings-files",
  "projects-id-settings-team",
  "projects-id-settings-history",
]);

const {user} = useAuth();

const projectStore = useProjectStore();
const appStore = useAppStore();
const {project, rolesOptions, roleLoading} = storeToRefs(projectStore);

onMounted(async () => {
  appStore.isLoading = true;
  if (!diableProjectHeadList.value.includes(route.name)) {
    if (route.params?.id) {
      await projectStore.refreshProjectDetails(route.params?.id);
    } else if (user.value?.project_identify) {
      await projectStore.refreshProjectDetails(user.value?.project_identify);
    }
  }
  appStore.isLoading = false;
});

// if (appStore.projectCreated.is) {
//   await projectStore.refreshProjectDetails(route.params?.id ?? appStore.projectCreated.id);
//   appStore.projectCreated.is = false;
//   appStore.projectCreated.id = null;
// }

// change site title for the project pages
const siteTitle = computed(() => {
  if (route.name == "projects-id") {
    return project.value?.name + " - Board";
  } else if (route.name == "projects-id-team") {
    return project.value?.name + " - Team";
  } else if (route.name == "projects-id-backlog") {
    return project.value?.name + " - Backlog";
  }
})

useHead({
  title: siteTitle,
});

onBeforeMount(() => {
  const collapseProjectHead = localStorage.getItem(`collapseProjectHead${route.params.id}-${user.value?.id}`);

  if (collapseProjectHead) {
    isExpanded.value = (collapseProjectHead === "true");
    return;
  }

  localStorage.setItem(`collapseProjectHead${route.params.id}-${user.value?.id}`, "true");
});

const isExpanded = ref(false);
const showCollapseButton = ref(false);

const handleCollapse = () => {
  isExpanded.value = !isExpanded.value;
  localStorage.setItem(`collapseProjectHead${route.params.id}-${user.value?.id}`, `${isExpanded.value}`);
}

const projectSettingsPages = ref([
  'projects-id-settings',
  'projects-id-settings-issues',
  'projects-id-settings-files',
  'projects-id-settings-sprints',
  'projects-id-settings-roles',
  'projects-id-settings-team',
  'projects-id-settings-history'
]);

const openInviteModal = async () => {
  roleLoading.value = true;
  await projectStore.refreshRolesOptions(route.params.id);
  await projectStore.refreshTeamMembersPage(route.params.id);
  roleLoading.value = false;
}
</script>

<template>
  <SkeletonLoaderProjectHead v-if="appStore.isLoading || appStore.isSettingsLoading"/>

  <div v-else @mouseenter="showCollapseButton = true" @mouseleave="showCollapseButton = false"
       class="flex-column flex-row-fluid" id="kt_app_wrapper">
    <div id="kt_app_toolbar" class="app-toolbar">
      <div id="kt_app_toolbar_container" class="app-container container-xxl d-flex align-items-start">
        <div class="d-flex flex-column flex-row-fluid">
          <Collapse :when="isExpanded">
            <div class="page-title d-flex align-items-center me-3 mb-4 pt-9 pt-lg-12 mb-lg-10">
              <div class="btn btn-icon h-65px w-65px me-6 overflow-hidden object-fit-cover">
                <img v-if="project?.url_icon" alt="project icon" :src="project?.url_icon"
                     class="min-w-65px min-h-65px"/>
                <img v-else alt="Logo" src="~/assets/media/avatars/project.png" class="min-w-65px min-h-65px"/>
              </div>
              <h1 class="page-heading d-flex text-white fw-bolder fs-2 flex-column justify-content-center my-0 position-relative">
              <span class="d-flex align-items-center gap-2">
                <span>{{ project?.name }} <span class="text-uppercase">({{ project?.key }})</span></span>
              </span>
                <span class="page-desc fs-6 fw-bold pt-4">
                <span v-if="project?.description" class="fs-6 truncate" style="max-width: 550px">{{
                    project?.description
                  }}</span>
                  <!--                <span v-else class="fs-6 truncate" style="max-width: 550px">Add description...</span>-->
              </span>
              </h1>
            </div>
          </Collapse>
          <div class="d-flex justify-content-between flex-wrap gap-4 gap-lg-10 position-relative"
               :class="{'mt-6': !isExpanded}">
            <div class="app-toolbar-menu menu menu-rounded menu-gray-800 menu-state-bg flex-wrap fs-5 fw-semibold">
              <div class="menu-item pb-xl-8 pb-4 mt-5 mt-lg-0">
                <NuxtLink :to="`/projects/${route.params.id}`" class="menu-link"
                          :class="{'active': route.name === 'projects-id'}">
                  <span class="menu-title">Board</span>
                </NuxtLink>
              </div>
              <div class="menu-item pb-xl-8 pb-4 mt-5 mt-lg-0">
                <NuxtLink :to="`/projects/${route.params.id}/backlog`" class="menu-link"
                          :class="{'active': route.name === 'projects-id-backlog'}">
                  <span class="menu-title">Backlog</span>
                </NuxtLink>
              </div>
              <div class="menu-item pb-xl-8 pb-4 mt-5 mt-lg-0">
                <NuxtLink :to="`/projects/${route.params.id}/team`" class="menu-link"
                          :class="{'active': route.name === 'projects-id-team'}">
                  <span class="menu-title">Team</span>
                </NuxtLink>
              </div>
              <div class="menu-item pb-xl-8 pb-4 mt-5 mt-lg-0">
                <NuxtLink :to="`/projects/${route.params.id}/settings`" class="menu-link"
                          :class="{'active': projectSettingsPages.includes(route.name)}">
                  <span class="menu-title">Settings</span>
                </NuxtLink>
              </div>
            </div>
            <div class="d-flex flex-align-items flex-wrap gap-3 gap-xl-0 mb-4 mt-n1">
              <div v-if="!project?.team_members?.length > 0"
                   class="h-100 bg-danger text-light rounded px-4 py-1 me-4 d-flex align-items-center"><span>No Team Members</span>
              </div>
              <div v-else class="symbol-group symbol-hover flex-nowrap me-5">
                <div v-for="(member, index) in project.team_members" :key="index">
                  <div v-if="index <= 7 && member.invite_status === 'accept'">
                    <TooltipUser :user="member?.user" placement="top">
                      <Avatar :user="member?.user"/>
                    </TooltipUser>
                  </div>
                </div>
              </div>
              <div class="d-flex align-items-center flex-shrink-0">
                <button v-can="'invite team'" @click="openInviteModal" class="btn btn-sm btn-flex btn-primary px-3"
                        data-bs-toggle="modal" data-bs-target="#kt_modal_invite_friends">
                  <i class="ki-outline ki-plus-square fs-2"></i>Invite
                </button>
                <button class="btn btn-sm btn-flex btn-light ms-5" data-bs-toggle="modal" v-can="'create issue'"
                        data-bs-target="#kt_modal_create_issue">
                  Create Issue
                </button>
              </div>
            </div>

            <Transition name="collapseButton">
              <div @click="handleCollapse" v-if="showCollapseButton" id="headCollapseButton"
                   style="left: 50%; transform: translateX(-50%)"
                   class="cursor-pointer text-gray-400 text-hover-gray-600 bg-light-primary fs-4 position-absolute h-25px d-flex align-items-center justify-content-center w-45px rounded-top">
                <Icon v-if="!isExpanded" name="ic:outline-keyboard-arrow-down" size="22"/>
                <Icon v-else name="ic:outline-keyboard-arrow-up" size="22"/>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </div>
  </div>
  <ModalsCreateIssue v-can="'create issue'"/>
</template>

<style scoped>
.edit-icon i {
  transition: all 0.3s ease;
}

.edit-icon:hover i {
  color: var(--bs-light) !important;
}

.edit-input input {
  background: transparent;
  padding: 5px;
  border: none;
  border-bottom: 1px solid #fff;
  outline: none;
  color: var(--bs-light);
  font-family: inherit;
}

.edit-input .check {
  bottom: -25px;
  right: 50%;
}

.projectActionsMenu {
  min-width: 170px;
  z-index: 900;
  bottom: -155px;
  right: -100px;
}

.projectActionsMenu-enter-active,
.projectActionsMenu-leave-active {
  transition: all 0.3s ease;
}

.projectActionsMenu-enter-from,
.projectActionsMenu-leave-to {
  opacity: 0;
  bottom: -180px;
}

#headCollapseButton {
  bottom: 0;
}

.collapseButton-enter-active,
.collapseButton-leave-active {
  transition: all 0.3s ease;
}

.collapseButton-enter-from,
.collapseButton-leave-to {
  opacity: 0;
  bottom: -15px !important;
}
</style>