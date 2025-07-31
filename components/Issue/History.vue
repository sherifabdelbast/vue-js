<script setup>
import {useProjectStore} from "~/stores/useProjectStore";
import moment from "moment";
import {useGetData} from "~/composables/useGetData";
import Avatar from "~/components/Avatar.vue";

const props = defineProps(["history", "handelCLoseModal", "isToggle", "toggleDateDisplay"]);
const projectStore = useProjectStore();
const getColor = (index) => {
  return projectStore.getColor(index);
};
</script>

<template>
  <div class="d-flex flex-column gap-4 border-gray-300 py-2 overflow-hidden">
    <div v-for="issueHistory in history" :key="issueHistory.id"
         class="d-flex align-items-start border-bottom">
      <Avatar :user="issueHistory?.user" imgWidth="35"/>
      <div class="ms-2">
        <div class="d-flex align-items-center gap-3">
          <nuxt-link :to="`/profile/${issueHistory?.user?.id}`" @click="handelCLoseModal">
          <span class="fs-6 fw-medium text-hover-primary text-black cursor-pointer">{{
              issueHistory?.user?.name
            }}</span>
          </nuxt-link>
          <span class="fs-7 text-gray-900 fs-6 text-gray-900 bg-light-primary px-2 custom-round">
            {{ issueHistory?.status }}
          </span>
          <span @click="toggleDateDisplay" class="fs-7 text-gray-900 bg-light-warning px-2 custom-round cursor-pointer">{{
              isToggle ? moment(issueHistory?.updated_at).endOf('minutes').fromNow() : moment(issueHistory?.updated_at).calendar()
            }}</span>
        </div>
        <div class="fw-semibold text-muted truncate history-info mb-2 mt-2">
          <div v-if="issueHistory?.type === 'status'" class="d-flex align-items-center gap-2">
            <div class="d-flex align-items-center gap-3 px-2 custom-round"
                 :class="issueHistory?.old_data === 'TO DO' ? 'bg-light-active' : issueHistory?.old_data === 'DONE' ? 'bg-light-primary text-primary' : 'bg-light-success text-success'">
              <div class="info truncate" style="max-width: 200px">
                <span class="option-text text-uppercase">{{ issueHistory?.old_data }}</span>
              </div>
            </div>
            <i class="ki-duotone ki-black-right fs-1"></i>
            <div class="d-flex align-items-center gap-3 px-2 custom-round"
                 :class="issueHistory?.new_data === 'TO DO' ? 'bg-light-active' : issueHistory?.new_data === 'DONE' ? 'bg-light-primary text-primary' : 'bg-light-success text-success'">
              <div class="info truncate" style="max-width: 200px">
                <span class="option-text text-uppercase">{{ issueHistory?.new_data }}</span>
              </div>
            </div>
          </div>
          <div v-else-if="issueHistory?.type === 'assignee'" class="d-flex align-items-center gap-2">
            <div v-if="issueHistory?.assign_from_team_member === null" class="bg-light-danger px-2 custom-round">
              Unassigned
            </div>
            <div v-else class="d-flex align-items-center gap-2">
              <div class="symbol symbol-circle symbol-20px overflow-hidden">
                <Avatar :user="issueHistory?.assign_from_team_member?.user" imgWidth="25" symbolMinWidth="25"/>
              </div>
              <div class="info truncate" style="max-width: 200px">
                <span class="option-text">{{ issueHistory?.assign_from_team_member?.user?.name }}</span>
              </div>
            </div>
            <i class="ki-duotone ki-black-right fs-1"></i>
            <div v-if="issueHistory?.assign_to_team_member === null" class="bg-light-danger px-2 custom-round">
              Unassigned
            </div>
            <div v-else class="d-flex align-items-center gap-2">
              <Avatar :user="issueHistory?.assign_to_team_member?.user" imgWidth="25" symbolMinWidth="25"/>
              <div class="info truncate" style="max-width: 200px">
                <span class="option-text">{{ issueHistory?.assign_to_team_member?.user?.name }}</span>
              </div>
            </div>
          </div>
          <div v-else-if="issueHistory?.type === 'estimated_at'" class="d-flex align-items-center gap-2">
            <div class="d-flex align-items-center gap-2"
                 v-if="issueHistory?.old_estimated_at[0] || issueHistory?.old_estimated_at[1] || issueHistory?.old_estimated_at[2]">
              <div class="badge badge-light-dark" v-if="issueHistory?.old_estimated_at[0]">
                {{ issueHistory?.old_estimated_at[0] }} d
              </div>
              <div class="badge badge-light-primary" v-if="issueHistory?.old_estimated_at[1]">
                {{ issueHistory?.old_estimated_at[1] }} hr
              </div>
              <div class="badge badge-light-warning" v-if="issueHistory?.old_estimated_at[2]">
                {{ issueHistory?.old_estimated_at[2] }} min
              </div>
            </div>
            <div class="d-flex align-items-center gap-2" v-else>
              <div class="badge badge-light-dark">
                {{ issueHistory?.old_estimated_at[0] }} d
              </div>
              <div class="badge badge-light-primary">
                {{ issueHistory?.old_estimated_at[1] }} hr
              </div>
              <div class="badge badge-light-warning">
                {{ issueHistory?.old_estimated_at[2] }} min
              </div>
            </div>
            <i class="ki-duotone ki-black-right fs-1"></i>
            <div class="d-flex align-items-center gap-2"
                 v-if="issueHistory?.new_estimated_at[0] || issueHistory?.new_estimated_at[1] || issueHistory?.new_estimated_at[2]">
              <div class="badge badge-light-dark" v-if="issueHistory?.new_estimated_at[0]">
                {{ issueHistory?.new_estimated_at[0] }} d
              </div>
              <div class="badge badge-light-primary" v-if="issueHistory?.new_estimated_at[1]">
                {{ issueHistory?.new_estimated_at[1] }} hr
              </div>
              <div class="badge badge-light-warning" v-if="issueHistory?.new_estimated_at[2]">
                {{ issueHistory?.new_estimated_at[2] }} min
              </div>
            </div>
            <div class="d-flex align-items-center gap-2" v-else>
              <div class="badge badge-light-dark">
                {{ issueHistory?.new_estimated_at[0] }} d
              </div>
              <div class="badge badge-light-primary">
                {{ issueHistory?.new_estimated_at[1] }} hr
              </div>
              <div class="badge badge-light-warning">
                {{ issueHistory?.new_estimated_at[2] }} min
              </div>
            </div>
          </div>
          <div v-else-if="issueHistory?.type === null" class="d-flex align-items-center gap-2">
            <div class="bg-light-primary px-2 custom-round text-gray-900">Issue Creation</div>
          </div>
          <div v-else class="d-flex align-items-center gap-2 history-custom-style">
            <span v-if="issueHistory?.old_data === null" class="text-wrap">None</span>
            <span v-else class="text-wrap" v-html="issueHistory?.old_data"></span>
            <i v-if="issueHistory?.type !== null" class="ki-duotone ki-black-right fs-1"></i>
            <span v-if="issueHistory?.new_data === null" class="text-wrap">None</span>
            <span class="text-wrap" v-html="issueHistory?.new_data"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.history-info span {
  max-width: 45%;
}

.history-info i {
  max-width: 10%;
}

.history-custom-style span img {
  max-width: 200px;
  max-height: 200px;
  object-fit: contain;
}
</style>
