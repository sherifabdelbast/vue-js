<script setup>
import moment from "moment";
import {useProjectStore} from "~/stores/useProjectStore";
import {useGetData} from "~/composables/useGetData";

const projectStore = useProjectStore();
const props = defineProps(["issue", "index", "toggleView", "isActive"]);
</script>

<template>
  <div class="issue-container d-flex align-items-center justify-content-between cursor-pointer py-2 px-8 border-bottom gap-5"
      @click="toggleView"
      :class="{ 'selected-active-issue': isActive }"
  >
    <div class="issue-title d-flex align-items-center overflow-hidden">
      <span class="me-2 flex-shrink-0">
        <img v-if="issue?.type === 'task'" src="../../assets/media/svg/types/task.svg" alt="task" width="14">
        <img v-if="issue?.type === 'story'" src="../../assets/media/svg/types/story.svg" alt="story" width="14">
        <img v-if="issue?.type === 'bug'" src="../../assets/media/svg/types/bug.svg" alt="bug" width="14">
      </span>

      <span class="fs-7 text-muted me-2 text-uppercase text-nowrap flex-shrink-0">{{ issue?.key }}</span>

      <p class="d-block text-gray-800 me-2 truncate text-nowrap fs-5">{{ issue?.title }}</p>

      <div v-if="issue?.estimated_at">
        <div class="d-flex align-items-center gap-2"
             v-if="issue?.estimated_at[0] || issue?.estimated_at[1] || issue?.estimated_at[2]">
          <div class="badge badge-light-dark" v-if="issue?.estimated_at[0]">
            {{ issue?.estimated_at[0] }} d
          </div>
          <div class="badge badge-light-primary" v-if="issue?.estimated_at[1]">
            {{ issue?.estimated_at[1] }} h
          </div>
          <div class="badge badge-light-warning" v-if="issue?.estimated_at[2]">
            {{ issue?.estimated_at[2] }} m

          </div>
        </div>
      </div>
    </div>

    <div class="issue-info d-flex align-items-center justify-content-between flex-shrink-0">
      <div class="py-1 px-3 rounded-1 fw-bold fs-8 text-uppercase text-nowrap me-2"
           :class="issue?.status?.type == 'TO DO' ? 'bg-light-active' : issue?.status?.type == 'DONE' ? 'bg-light-primary text-primary' : 'bg-light-success text-success'"
      >
        {{ issue?.status?.name }}
      </div>

      <TooltipMain :content="issue?.priority" placement="top">
        <div class="py-1 px-3 me-2 rounded-1 fw-bold fs-8 text-uppercase text-nowrap">
          <Icon v-if="issue?.priority === 'Highest'" name="mingcute:arrows-up-line" size="20" class="m-0"
                :class="{'text-danger': issue?.priority === 'Highest'}"/>
          <Icon v-else-if="issue?.priority === 'High'" name="material-symbols:keyboard-arrow-up-rounded" size="20" class="m-0"
                :class="{'text-danger': issue?.priority === 'High'}"/>
          <Icon v-else-if="issue?.priority === 'Medium'" name="iconamoon:sign-equal-fill" size="20" class="m-0"
                :class="{'text-warning': issue?.priority === 'Medium'}"/>
          <Icon v-else-if="issue?.priority === 'Low'" name="material-symbols:keyboard-arrow-down-rounded" size="20" class="m-0"
                :class="{'text-success': issue?.priority === 'Low'}"/>
          <Icon v-else-if="issue?.priority === 'Lowest'" name="mingcute:arrows-down-line" size="20" class="m-0"
                :class="{'text-success': issue?.priority === 'Lowest'}"/>
        </div>
      </TooltipMain>

      <div class="d-flex align-items-center me-8">
        <NuxtLink
            @click.stop
            :to="`/projects/${issue?.project_identify}`"
            class="text-gray-600 text-hover-primary me-2 text-nowrap truncate"
            style="max-width: 100px;">
          {{ issue?.project?.name }}
        </NuxtLink>
        <span class="py-1 px-3 bg-light-dark rounded-pill text-gray-600 fs-9 text-nowrap">{{
            moment(issue?.created_at).format("ll")
          }}</span>
      </div>

      <div class="text-end d-flex align-items-center">
        <TooltipMain v-if="issue?.team_member" :content='`Assigned to: "${issue?.team_member?.user?.name}"`'
                     placement="top"
                     class="text-nowrap">
          <Avatar imgWidth="30" :user="issue?.team_member?.user"/>
        </TooltipMain>
        <TooltipMain v-else content="Unassigned" placement="top">
          <div class="symbol symbol-circle symbol-50px overflow-hidden">
            <img src="../../assets/media/avatars/blank.png" alt="Unassigned" class="w-30px h-30px"/>
          </div>
        </TooltipMain>
      </div>
    </div>
  </div>
</template>

<style scoped>
.issue-container {
  overflow-x: scroll;
  transition: background-color 0.3s ease;
}

.issue-container::-webkit-scrollbar {
  height: 2px;
  background-color: transparent;
}

.issue-container::-webkit-scrollbar-thumb {
  background-color: var(--bs-text-gray-200);
  border-radius: 2px;
}

.issue-container:hover {
  background-color: var(--bs-gray-100);
}
</style>