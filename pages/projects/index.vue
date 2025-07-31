<script setup>
import {storeToRefs} from "pinia";
import {useProjectStore} from "~/stores/useProjectStore";
import {useAppStore} from "~/stores/useAppStore";

definePageMeta({
  middleware: "auth"
});
useHead({
  title: "Projects"
});

// === stores === //
const projectStore = useProjectStore();
const appStore = useAppStore();
const {allProjects, favioratesProjects, userProjects, invitedToProjects, closedProjects} = storeToRefs(projectStore);

onMounted(async () => {
  appStore.isProjectsLoading = true;
  await projectStore.refreshProjects();
  appStore.isProjectsLoading = false;
});

// === data === //
const activeTab = ref("all");

// === methods === //
const cahngeTab = (tabName) => activeTab.value = tabName;

// === computed === //
const avtiveProjects = computed(() => {
  if (activeTab.value === "all") {
    return allProjects.value;
  } else if (activeTab.value === "fav") {
    return favioratesProjects.value;
  } else if (activeTab.value === "my") {
    return userProjects.value;
  } else if (activeTab.value === "invite") {
    return invitedToProjects.value;
  } else if (activeTab.value === "closed") {
    return closedProjects.value;
  }
});
</script>

<template>
  <div class="tabs-wrraper w-100 h-80px">
    <div class="app-container container-xxl h-100 d-flex align-items-end justify-content-between">
      <ul class="nav nav-tabs">
        <li @click="cahngeTab('all')" class="nav-item cursor-pointer fs-4">
          <div class="nav-link" :class="{'active': activeTab == 'all'}">All
            <span class="projects-count" v-if="allProjects.length > 0">({{ allProjects.length }})</span></div>
        </li>
        <li @click="cahngeTab('fav')" class="nav-item cursor-pointer fs-4">
          <div class="nav-link" :class="{'active': activeTab == 'fav'}">Favorites
            <span class="projects-count" v-if="favioratesProjects?.length > 0">({{ favioratesProjects?.length }})</span></div>
        </li>
        <li @click="cahngeTab('my')" class="nav-item cursor-pointer fs-4">
          <div class="nav-link" :class="{'active': activeTab == 'my'}">My Projects
            <span class="projects-count" v-if="userProjects?.length > 0">({{ userProjects?.length }})</span></div>
        </li>
        <li @click="cahngeTab('invite')" class="nav-item cursor-pointer fs-4">
          <div class="nav-link" :class="{'active': activeTab == 'invite'}">Invited To
            <span class="projects-count" v-if="invitedToProjects?.length > 0">({{ invitedToProjects?.length }})</span></div>
        </li>
        <li @click="cahngeTab('closed')" class="nav-item cursor-pointer fs-4">
          <div class="nav-link" style="color: var(--bs-text-gray-400)!important;" :class="{'active': activeTab == 'closed'}">Closed
            <span class="projects-count" style="color: var(--bs-text-gray-400)!important;" v-if="closedProjects?.length > 0">({{ closedProjects?.length }})</span></div>
        </li>
      </ul>
      <NuxtLink to="/create-project" class="btn-primary app-bg-color text-gray-600 text-hover-gray-800 fw-semibold py-3 px-5 rounded-top">
        <Icon name="material-symbols:add" size="18"/>
        Create Project</NuxtLink>
    </div>
  </div>

  <SkeletonLoaderProjects v-if="appStore.isProjectsLoading"/>

  <div v-else class="app-container container-xxl">
    <div class="app-main flex-column flex-row-fluid" id="kt_app_main">
      <div class="d-flex flex-column flex-column-fluid">
        <div id="kt_app_content" class="app-content flex-column-fluid">
          <div class="row" v-if="allProjects?.length > 0">
            <div v-if="!avtiveProjects?.length > 0">
              <div class="alert bg-light-primary d-flex flex-column align-items-center flex-sm-row p-5 mb-10">
                <i class="ki-duotone ki-notification-bing fs-2hx text-primary me-4 mb-5 mb-sm-0"><span
                    class="path1"></span><span class="path2"></span><span class="path3"></span></i>

                <div class="d-flex flex-column">
                  <h4 class="fw-semibold p-0 m-0">You don't have any projects here.</h4>
                </div>
              </div>
            </div>
            <ProjectCard v-else v-for="(project, index) in avtiveProjects" :key="index" :project="project" :isClosed="activeTab == 'closed' ? true : false"
                         class="mb-10"/>
          </div>
          <div v-else class="d-flex flex-center flex-column">
            <div>
              <img src="~/assets/media/illustrations/misc/no-projects.png" alt="no projects" class="img-fluid">
            </div>
            <div class="text-center">
              <h2 class="fs-1 text-gray-700 mb-8 text-capitalize">You don't have any projects yet!</h2>
              <NuxtLink to="/create-project" class="btn btn-primary">Create Project</NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tabs-wrraper {
  background-color: var(--bs-app-header-base-bg-color);
}

.tabs-wrraper .nav {
  border: none;
}

.tabs-wrraper .nav-link {
  padding: 10px 16px;
}

.tabs-wrraper .nav-link,
.tabs-wrraper .nav-link span {
  border: none;
  font-weight: 500;
  position: relative;
  color: var(--bs-light) !important;
  transition: all 0.3s ease;
}

.tabs-wrraper .nav-link:hover,
.tabs-wrraper .nav-link:hover span {
  color: var(--bs-primary) !important;
  font-weight: 500;
}

.tabs-wrraper .nav-link.active,
.tabs-wrraper .nav-link.active span {
  color: var(--bs-primary) !important;
}

.tabs-wrraper .nav-link.active {
  background: var(--bs-app-bg-color);
}

.app-bg-color {
  background: var(--bs-app-bg-color);
}
</style>