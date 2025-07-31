<script setup>
import {storeToRefs} from "pinia";
import {useProjectStore} from "~/stores/useProjectStore";
import {useAppStore} from "~/stores/useAppStore";
import moment from "moment";
import {useToast} from "vue-toastification";
import {useGetData} from "~/composables/useGetData";

const route = useRoute();

const toast = useToast();
const {closeProject} = useGetData();

const appStore = useAppStore();
const projectStore = useProjectStore();
const {project} = storeToRefs(projectStore);

onMounted(async () => {
  appStore.isSettingsLoading = true;
  if (route.name !== "projects-id-settings") {
    await projectStore.refreshProjectDetails(route.params.id);
  }
  appStore.isSettingsLoading = false;
});

const menu = ref();
const items = ref([
  {
    label: 'Close Project',
    icon: 'pi pi-fw pi-times',
    style: {color: 'var(--bs-danger) !important'},
    command: () => handleCloseProject(),
  }
]);
const toggle = (event) => menu.value.toggle(event);

const handleCloseProject = async () => {
  Swal.fire({
    title: '<strong class="text-danger fs-1">Warning</strong>',
    html: `<div class="fs-2 lh-lg">Are you sure you want to <span class="text-danger fw-bold">close</span> <strong class="fs-2">"${project.value?.name}"</strong> project?
           <div class="text-center mt-5 p-2 bg-danger text-light rounded fs-5">You can't open this project anymore!</div>
           </div>`,
    icon: "warning",
    iconColor: "#f1416c",
    buttonsStyling: false,
    showCancelButton: true,
    confirmButtonText: "Yes, close!",
    cancelButtonText: 'No, cancel',
    showLoaderOnConfirm: true,
    customClass: {
      confirmButton: "btn fw-bold btn-light-danger",
      cancelButton: 'btn fw-bold btn-light-primary',
    },
    preConfirm: async () => {
      const response = await closeProject(route.params.id);
      Swal.hideLoading();
      if (response?.code === 200) {
        toast.success(response?.message);
        Swal.close();
        await navigateTo("/projects");
      }
    },
  });
};
</script>

<template>
  <SkeletonLoaderProjectDetails v-if="appStore.isSettingsLoading"/>

  <div v-else class="app-container container-xxl">
    <div class="app-main flex-column flex-row-fluid">
      <div class="d-flex flex-column flex-column-fluid">
        <div class="app-content flex-column-fluid pb-0">
          <div class="card">
            <div class="card-body pt-9 pb-0">
              <div class="d-flex flex-wrap flex-sm-nowrap mb-6">
                <div
                    class="d-flex flex-center flex-shrink-0 rounded overflow-hidden w-100px h-100px w-lg-150px h-lg-150px me-7 mb-4">
                  <img v-if="project?.url_icon" class="w-100 w-100" :src="project?.url_icon" alt="image"/>
                  <img v-else class="w-100 w-100" src="~/assets/media/avatars/project.png" alt="image"/>
                </div>
                <div class="flex-grow-1">
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <div class="d-flex flex-column">
                      <div class="d-flex align-items-center mb-1">
                        <h2 href="#" class="text-gray-800 fs-2 fw-bold me-3">{{ project?.name }}
                          <span class="text-uppercase fs-2 fw-bold">({{ project?.key }})</span>
                        </h2>
                      </div>
                      <div class="d-flex flex-wrap fw-semibold mb-4 fs-5 text-gray-400">{{ project?.description }}</div>
                    </div>
                    <div class="d-flex mb-4">
                      <button disabled class="btn btn-sm btn-primary me-3 text-nowrap">
                        <i class="ki-duotone ki-message-notif fs-3">
                          <i class="path1"></i>
                          <i class="path2"></i>
                          <i class="path3"></i>
                          <i class="path4"></i>
                          <i class="path5"></i>
                        </i>
                        Project Chat
                      </button>
                      <div class="me-0" v-can="'close project'">
                        <button class="btn btn-sm btn-icon btn-bg-light btn-active-color-primary" @click="toggle">
                          <i class="ki-solid ki-dots-horizontal fs-2x"></i>
                        </button>
                        <Menu ref="menu" id="overlay_menu" :model="items" :popup="true"
                              :pt="{
                              content: { class: 'py-1' }
                            }"/>
                      </div>
                    </div>
                  </div>
                  <div class="d-flex flex-wrap justify-content-start">
                    <div class="d-flex flex-wrap">
                      <div class="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                        <div class="fs-4 fw-bold">{{ moment(project?.created_at).format('ll') }}</div>
                        <div class="fw-semibold fs-6 text-gray-400">Create Date</div>
                      </div>
                      <div class="border border-gray-300 border-dashed rounded py-3 px-4 me-6 mb-3 text-center">
                        <div class="fs-4 fw-bold">{{ project?.all_issues }}</div>
                        <div class="fw-semibold fs-6 text-gray-400">All Issues</div>
                      </div>
                      <div class="border border-gray-300 border-dashed rounded py-3 px-4 me-6 mb-3 text-center">
                        <div class="fs-4 fw-bold">{{ project?.open_issues }}</div>
                        <div class="fw-semibold fs-6 text-gray-400">Open Issues</div>
                      </div>
                      <div class="border border-gray-300 border-dashed rounded py-3 px-4 me-6 mb-3 text-center">
                        <div class="fs-4 fw-bold">{{ project?.all_sprints }}</div>
                        <div class="fw-semibold fs-6 text-gray-400">Sprints</div>
                      </div>
                      <div class="border border-gray-300 border-dashed rounded py-3 px-4 me-6 mb-3 text-center">
                        <div class="fs-4 fw-bold">{{ project?.open_sprints }}</div>
                        <div class="fw-semibold fs-6 text-gray-400">Active Sprints</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="separator"></div>
              <ul class="nav nav-stretch nav-line-tabs nav-line-tabs-2x border-transparent fs-5 fw-bold">
                <li class="nav-item cursor-pointer">
                  <NuxtLink :to="`/projects/${route.params.id}/settings`" class="nav-link text-active-primary py-5 me-6"
                            :class="{active: route.name === 'projects-id-settings'}">Details
                  </NuxtLink>
                </li>
                <li class="nav-item cursor-pointer">
                  <NuxtLink :to="`/projects/${route.params.id}/settings/issues`"
                            class="nav-link text-active-primary py-5 me-6"
                            :class="{active: route.name === 'projects-id-settings-issues'}">Issues
                  </NuxtLink>
                </li>
                <li class="nav-item cursor-pointer">
                  <NuxtLink :to="`/projects/${route.params.id}/settings/sprints`"
                            class="nav-link text-active-primary py-5 me-6"
                            :class="{active: route.name === 'projects-id-settings-sprints'}">Sprints
                  </NuxtLink>
                </li>
                <li class="nav-item cursor-pointer" v-can="'show role'">
                  <NuxtLink :to="`/projects/${route.params.id}/settings/roles`"
                            class="nav-link text-active-primary py-5 me-6"
                            :class="{active: route.name === 'projects-id-settings-roles'}">Roles
                  </NuxtLink>
                </li>
                <li class="nav-item cursor-pointer">
                  <NuxtLink :to="`/projects/${route.params.id}/settings/team`"
                            class="nav-link text-active-primary py-5 me-6"
                            :class="{active: route.name === 'projects-id-settings-team'}">Team
                  </NuxtLink>
                </li>
                <li class="nav-item cursor-pointer">
                  <NuxtLink :to="`/projects/${route.params.id}/settings/files`"
                            class="nav-link text-active-primary py-5 me-6"
                            :class="{active: route.name === 'projects-id-settings-file'}">Files
                  </NuxtLink>
                </li>
                <li v-can="'show project history'" class="nav-item cursor-pointer">
                  <NuxtLink :to="`/projects/${route.params.id}/settings/history`"
                            class="nav-link text-active-primary py-5 me-6"
                            :class="{active: route.name === 'projects-id-settings-history'}">History
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>