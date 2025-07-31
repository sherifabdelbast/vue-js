<script setup>
import {useProjectStore} from "~/stores/useProjectStore";
import {useAppStore} from "~/stores/useAppStore";
import {storeToRefs} from "pinia";
import {useGetData} from "~/composables/useGetData";

const route = useRoute();
const router = useRouter();

// === stores === //
const appStore = useAppStore();
const projectStore = useProjectStore();
const {allProjects, project} = storeToRefs(projectStore);

const props = defineProps(["isProjectMenu"]);

// refresh project data in the store when switch project
const handleSwitch = async (projectId) => {
  appStore.isLoading = true;
  if (projectId != project.value?.project_identify) {
    await projectStore.refreshProjectDetails(projectId);
  }
  appStore.isLoading = false;
}

const diableProjectHeadList = ["projects", "your-work", "profile-userId", "profile"];

// put the active project on the top of the projects menu
const sortedProjects = computed(() => {
  if (diableProjectHeadList.includes(route.name)) {
    return allProjects.value;
  }
  const activeProject = allProjects.value.find(project => project?.project_identify == route.params?.id);
  const otherProjects = allProjects.value.filter(project => project?.project_identify != route.params?.id);
  return [activeProject, ...otherProjects];
});
</script>

<template>
  <Transition name="projectsMenu">
    <div v-if="isProjectMenu" class="bg-light rounded-2 shadow position-absolute p-0 w-100 w-lg-300px projects-menu"
         style="z-index: 10000 !important;">
      <div class="menu-state-bg overflow-hidden">
        <!--begin:Row-->
        <div class="row">
          <!--begin:Col-->
          <div class="p-6">
            <!--begin:Row-->
            <div>
              <div v-if="sortedProjects?.length > 0" class="mb-3" style="overflow-y: scroll; max-height: 190px">
                <div v-for="(project, index) in sortedProjects" :key="index" class="menu-item p-0 mb-3">
                  <!--begin:Menu link-->
                  <NuxtLink @click="handleSwitch(project?.project_identify)" :to="`/projects/${project?.project_identify}`"
                            class="menu-link overflow-x-hidden"
                            :class="{ active: route?.params?.id == project?.project_identify }">
                    <span class="d-flex flex-center rounded me-3 rounded-1">
                      <img v-if="project?.url_icon" :src="project?.url_icon" alt="" width="35" height="35" class="rounded-1"/>
                      <img v-else src="~/assets/media/avatars/project.png" alt="" width="35" height="35" class="rounded-1"/>
                    </span>
                    <span class="d-flex flex-column">
                      <span class="fs-6 fw-bold text-gray-800 truncate" id="project-name" style="max-width: 210px;">{{ project?.name }} <span class="text-uppercase">({{project?.key}})</span></span>
                      <span class="fs-7 fw-semibold text-muted truncate"
                            style="max-width: 210px;">{{ project?.description }}</span>
                    </span>
                  </NuxtLink>
                  <!--end:Menu link-->
                </div>
              </div>
              <div v-else class="menu-item text-gray-800 d-flex align-items-center">
                <div class="alert bg-light-primary d-flex flex-column align-items-center flex-sm-row w-100">
                  <i class="ki-duotone ki-notification-bing fs-2hx text-primary me-4"><span
                      class="path1"></span><span class="path2"></span><span class="path3"></span></i>

                  <div class="d-flex flex-column w-100">
                    <h6 class="fw-semibold">You don't have any project.</h6>
                  </div>
                </div>
              </div>
            </div>
            <!--end:Row-->
            <div class="separator separator-dashed my-3"></div>
            <!--begin:Landing-->
            <NuxtLink
                to="/projects"
                class="links d-flex flex-stack flex-wrap flex-lg-nowrap px-5 py-3 text-gray-800 rounded-1"
            >
              View All Projects
            </NuxtLink>
            <!--end:Landing-->
          </div>
          <!--end:Col-->
        </div>
        <!--end:Row-->
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.projects-menu {
  top: 70px;
  left: 0;
}

.projects-menu .links:hover {
  background-color: #f5f5f5;
}

.projectsMenu-enter-active,
.projectsMenu-leave-active {
  transition: all 0.3s ease;
}

.projectsMenu-enter-from,
.projectsMenu-leave-to {
  opacity: 0;
  pointer-events: none;
  top: 110px;
}

.menu-item .menu-link.active #project-name {
  color: var(--bs-primary) !important;
}

.menu-item .menu-link.active {
  background-color: #f5f5f5 !important;
}

.menu-item a {
  transition: all 0.3s ease;
}

.menu-item a:hover {
  background-color: #f5f5f5 !important;
}
</style>