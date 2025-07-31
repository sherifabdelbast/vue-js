<script setup>
import moment from "moment";
import {useProjectStore} from "~/stores/useProjectStore";
import Avatar from "~/components/Avatar.vue";

const props = defineProps(["project", "isClosed"]);

const projectStore = useProjectStore();

const favLoading = ref(false);

const markAsFavorite = async (id) => {
  favLoading.value = true;
  await projectStore.makeProjectFav(id);

  await projectStore.refreshProjects();

  favLoading.value = false;
}
</script>

<template>
  <div class="col-md-6 col-xl-4">
    <div class="card border-hover-primary">
      <div class="card-header border-0 px-7 pt-7">
        <div class="card-title m-0">
          <NuxtLink v-if="!isClosed" :to="`/projects/${project?.project_identify}`" class="symbol symbol-50px w-50px">
            <img v-if="project?.url_icon" :src="project?.url_icon" alt="image" class="w-100 object-cover"/>
            <img v-else src="../../assets/media/avatars/project.png" alt="image" class="w-100 object-cover"/>
          </NuxtLink>
          <div v-else="!isClosed" class="symbol symbol-50px w-50px">
            <img v-if="project?.icon" :src="project?.icon" alt="image" class="w-100 object-cover"/>
            <img v-else src="../../assets/media/avatars/project.png" alt="image" class="w-100 object-cover"/>
          </div>
        </div>
        <div class="card-toolbar">
          <TooltipMain v-if="!isClosed" :content="project?.is_favorite ? 'Unmark As Favorite' : 'Mark As Favorite'" placement="top">
            <span @click="markAsFavorite(project?.project_identify)"
                  class="project-fav badge fw-bold me-auto px-4 py-3 cursor-pointer"
                  data-bs
                  :class="[{'badge-light-primary': project?.is_favorite},
                  {'badge-light-danger': !project?.is_favorite}]">
              <img v-if="favLoading" src="~/assets/media/misc/spinner.gif" style="filter: invert(1)" width="16">
              <div v-else>
                <Icon v-if="project?.is_favorite" name="material-symbols:favorite" size="22"/>
                <Icon v-else name="material-symbols:favorite-outline" size="22"/>
              </div>
            </span>
          </TooltipMain>
          <TooltipMain v-else content="Closed" placement="top">
            <span class="badge fw-bold me-auto px-4 py-3 badge-light-danger">
                <Icon name="material-symbols:tab-close-right-outline-sharp" size="22"/>
            </span>
          </TooltipMain>
        </div>
      </div>
      <div class="card-body p-7">
        <NuxtLink v-if="!isClosed" :to="`/projects/${project?.project_identify}`" class="project-name fs-3 fw-bold text-dark">{{ project?.name }} <span class="text-uppercase">({{project?.key}})</span>
          <Icon name="ci:external-link" size="20"/>
        </NuxtLink>
        <div v-else class="fs-3 fw-bold text-dark">{{ project?.name }}</div>
        <p class="text-gray-400 fw-semibold fs-5 mt-1 mb-7 truncate">{{ project?.description }}</p>
        <div class="d-flex flex-wrap mb-5">
          <div class="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-7 mb-3">
            <div class="fs-6 text-gray-800 fw-bold">{{ moment(project?.created_at).format("ll") }}</div>
            <div class="fw-semibold text-gray-400">Create Date</div>
          </div>
          <div class="border border-gray-300 border-dashed rounded min-w-90px py-3 px-4 mb-3">
            <div class="fs-5 text-gray-800 fw-bold text-center">{{ project?.activeIssues }}</div>
            <div class="fw-semibold text-gray-400">Opened Issues</div>
          </div>
        </div>
        <div class="separator d-flex flex-center mb-8">
        <span class="text-uppercase bg-body fs-7 fw-semibold text-muted px-3"><Icon name="ri:team-line"
                                                                                    size="18"/></span>
        </div>
        <div v-if="project?.team_members?.length > 0" class="symbol-group symbol-hover flex-nowrap me-5">
          <div v-for="(member, index) in project?.team_members" :key="index">
            <div v-if="index <= 7 && member.invite_status === 'accept'">
              <TooltipUser :user="member?.user" placement="top">
                <Avatar :user="member?.user"/>
              </TooltipUser>
            </div>
          </div>
        </div>
        <div v-else class="alert bg-light-danger d-flex align-items-center w-100">
          <Icon name="fluent:people-error-16-regular" size="24" class="text-danger me-4"/>

          <div class="w-100 d-flex align-items-center">
            <h5 class="fw-semibold p-0 m-0">No Team Found.</h5>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style setup scoped>
.card {
  transition: all 0.3s ease;
}

.project-name {
  transition: all 0.3s ease;
}

.project-name:hover {
  color: var(--bs-primary) !important;
}
</style>