<script setup>
import {useProjectStore} from "~/stores/useProjectStore";
import moment from "moment";

const projectStore = useProjectStore();
const {projectHistory} = toRefs(projectStore);

const displayOldData = ref(false);

const toggleOldData = () => {
  displayOldData.value = !displayOldData.value;
}
</script>

<template>
  <div class="timeline">
    <div v-if="projectHistory?.projectHistory.length === 0"
         class="alert bg-light-info d-flex flex-column align-items-center flex-sm-row p-5 m-0">
      <i class="ki-duotone ki-notification-bing fs-2hx text-info me-4"><span
          class="path1"></span><span class="path2"></span><span class="path3"></span></i>
      <div class="d-flex flex-column">
        <h4 class="fw-semibold p-0 m-0">Your project currently lacks a documented history or background.</h4>
      </div>
    </div>
    <div v-else class="timeline-item rounded-1 py-2" v-for="history in projectHistory?.projectHistory">
      <div class="timeline-line w-40px"></div>
      <div class="timeline-icon symbol symbol-circle symbol-40px bg-light-danger">
        <div class="symbol-label bg-light">
          <Icon
              v-if="history?.action === 'invite'"
              name="material-symbols:person-add-outline"
              class="fs-2 text-primary"
          />
          <Icon
              v-else-if="history?.action === 'remove'"
              name="material-symbols:person-remove-outline"
              class="fs-2 text-danger"
          />
          <Icon
              v-else-if="history?.action === 'create'"
              name="mdi:creation-outline"
              class="fs-2 text-primary"
          />
          <Icon
              v-else-if="history?.action === 'edit' || history?.action === 'update'"
              name="material-symbols:edit-outline-sharp"
              class="fs-2 text-success"
          />
          <Icon
              v-else-if="history?.action === 'delete'"
              name="ic:outline-delete-outline"
              class="fs-2 text-danger"
          />
          <Icon
              v-else-if="history?.action === 'complete'"
              name="carbon:ai-status-complete"
              class="fs-2 text-primary"
          />
          <Icon
              v-else-if="history?.action === 'start'"
              name="solar:restart-linear"
              class="fs-2 text-success"
          />
        </div>
      </div>
      <div v-if="history?.action === 'edit' || history?.action === 'update'" class="timeline-content">
        <div class="pe-3">
          <div class="d-flex align-items-center justify-content-between gap-2 fs-5 fw-semibold mb-2">
            <div class="d-flex align-items-center gap-2">
              <span>{{ history?.status }} by</span>
              <TooltipUser :user="history?.user" placement="top">
                <Avatar :user="history?.user" imgWidth="30"/>
              </TooltipUser>
            </div>
            <div>
              <span class="badge badge-light-info mx-2 fs-7 custom-round text-capitalize">{{ history?.type }}</span>
              <span class="badge badge-light px-1 fs-7 custom-round">{{
                  moment(history?.updated_at).format('LLL')
                }} by</span>
            </div>
          </div>
          <div class="overflow-auto">
            <div class="d-flex align-items-center mt-1 fs-6">
              <div class="d-flex align-items-center gap-2 text-muted fs-7">
                <div class="d-flex align-items-center gap-1">
                  <span v-if="history?.old_data"
                        class="bg-body p-1 custom-round"
                        :class="{ 'bg-body p-1 custom-round': history?.status !== 'Update sprint start date' && history?.status !== 'Update sprint end date' }">
                    {{
                      history?.status === 'Update sprint start date' || history?.status === 'Update sprint end date' ? moment(history?.old_data).format('LLL') : history?.old_data || history?.sprint_which_received_action?.name
                    }}
                  </span>
                  <i v-if="history?.old_data && history?.new_data" class="ki-duotone ki-black-right fs-1"></i>
                  <span v-if="history?.new_data"
                        class="bg-body p-1 custom-round"
                        :class="{ 'bg-body p-1 custom-round': history?.status !== 'Update sprint start date' && history?.status !== 'Update sprint end date' }">
                        {{
                      history?.status === 'Update sprint start date' || history?.status === 'Update sprint end date' ? moment(history?.new_data).format('LLL') : history?.new_data
                    }}
                  </span>
                  <!--                  <TooltipUser :user="history?.user_who_received_action" placement="top">-->
                  <!--                    <Avatar :user="history?.user_who_received_action" :imgWidth="30"/>-->
                  <!--                  </TooltipUser>-->
                  <!--                  <span>{{ history?.user_who_received_action?.name || history?.user_who_received_action?.email }}</span>-->
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="history?.action === 'delete' || history?.action === 'create' || history?.action === 'complete' || history?.action === 'start'"
          class="timeline-content">
        <div class="pe-3">
          <div class="d-flex align-items-center justify-content-between gap-2 fs-5 fw-semibold mb-2">
            <div class="d-flex align-items-center gap-2">
              <span>{{ history?.status }} by</span>
              <TooltipUser :user="history?.user" placement="top">
                <Avatar :user="history?.user" :imgWidth="30"/>
              </TooltipUser>
            </div>
            <div>
              <span class="badge badge-light-info mx-2 fs-7 custom-round text-capitalize">{{ history?.type }}</span>
              <span class="badge badge-light px-1 fs-7 custom-round">{{ moment(history?.issue?.updated_at).format('LLL') }}</span>
            </div>
          </div>
          <div class="overflow-auto">
            <div v-if="history?.issue"
                 class="d-flex justify-content-between align-items-center bg-body rounded border p-3 w-full">
              <div class="d-flex align-items-center gap-3">
                <span class="truncate">{{ history?.issue?.title }}</span>
                <div v-if="history?.issue?.estimated_at">
                  <div class="d-flex align-items-center gap-2"
                       v-if="history?.issue?.estimated_at[0] || history?.issue?.estimated_at[1] || history?.issue?.estimated_at[2]">
                    <div class="badge badge-light-dark" v-if="history?.issue?.estimated_at[0]">
                      {{ history?.issue?.estimated_at[0] }} d
                    </div>
                    <div class="badge badge-light-primary" v-if="history?.issue?.estimated_at[1]">
                      {{ history?.issue?.estimated_at[1] }} hr
                    </div>
                    <div class="badge badge-light-warning" v-if="history?.issue?.estimated_at[2]">
                      {{ history?.issue?.estimated_at[2] }} min
                    </div>
                  </div>
                </div>
              </div>
              <div class="d-flex align-items-center gap-2">
                <div class="py-1 px-2 rounded-1 fs-8"
                     :class="history?.issue?.status?.name == 'TO DO' ? 'bg-light-active' : history?.issue?.status?.name == 'DONE' ? 'bg-light-primary text-primary' : 'bg-light-success text-success'">
                  {{ history?.issue?.status?.name }}
                </div>
                <TooltipUser v-if="history?.issue?.assign_to" :user="history?.user" placement="top">
                  <Avatar :user="history?.issue?.team_member?.user" imgWidth="25"/>
                </TooltipUser>
                <Avatar v-else :unsigned="null" imgWidth="25"/>
              </div>
            </div>
            <div v-else-if="history?.status_which_received_action || history?.project || history?.sprint_which_received_action || history?.role"
                 class="d-flex justify-content-between align-items-center bg-body rounded border p-3 w-25">
              <div class="d-flex align-items-center gap-3">
                <span class="truncate">{{
                    history?.status_which_received_action?.name || history?.project?.name || history?.sprint_which_received_action?.name || history?.role?.key
                  }}</span>
              </div>
              <div v-if="history?.status_which_received_action?.type" class="d-flex align-items-center gap-2">
                <div class="py-1 px-2 rounded-1 fs-8"
                     :class="history?.status_which_received_action?.type == 'TO DO' ? 'bg-light-active' : history?.status_which_received_action?.type == 'DONE' ? 'bg-light-primary text-primary' : 'bg-light-success text-success'">
                  {{ history?.status_which_received_action?.type }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="history?.action === 'invite' || history?.action === 'remove'" class="timeline-content">
        <div class="pe-3">
          <div class="d-flex align-items-center justify-content-between gap-2 fs-5 fw-semibold mb-2">
            <div class="d-flex align-items-center gap-2">
              <span>{{ history?.status }} by</span>
              <TooltipUser :user="history?.user" placement="top">
                <Avatar :user="history?.user" imgWidth="30"/>
              </TooltipUser>
            </div>
            <div>
              <span class="badge badge-light-info mx-2 fs-7 custom-round text-capitalize">{{ history?.type }}</span>
              <span class="badge badge-light px-1 fs-7 custom-round">{{
                  moment(history?.updated_at).format('LLL')
                }} by</span>
            </div>
          </div>
          <div class="overflow-auto">
            <div class="d-flex align-items-center mt-1 fs-6">
              <div class="d-flex align-items-center gap-2 text-muted fs-7">
                <div class="d-flex align-items-center gap-1">
                  <TooltipUser :user="history?.user_who_received_action" placement="top">
                    <Avatar :user="history?.user_who_received_action" :imgWidth="30"/>
                  </TooltipUser>
                  <span>{{ history?.user_who_received_action?.name || history?.user_who_received_action?.email }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.timeline-item:hover {
  transition: all .5s;
  background-color: var(--bs-gray-100);
}
</style>