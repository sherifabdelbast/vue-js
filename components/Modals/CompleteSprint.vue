<script setup>
import {useAppStore} from "~/stores/useAppStore";
import {useProjectStore} from "~/stores/useProjectStore";
import {usePostData} from "~/composables/usePostData";
import {useToast} from "vue-toastification";
import {storeToRefs} from "pinia";

const props = defineProps(["id"]);

const route = useRoute();

// === Data === //
const toast = useToast();
const {completeSprint} = usePostData();
const appStore = useAppStore();
const projectStore = useProjectStore();
const {completeSprintInfo} = storeToRefs(projectStore)

const selectedMoveSprint = ref({name: 'Backlog', id: null});

const handleSubmit = async () => {
  await submit();
};

const {
  submit,
  inProgress,
  validationErrors: errors
} = useSubmit(() => completeSprint(route.params.id, props.id, {issue_sprint_id: selectedMoveSprint.value.id}), {
      onSuccess: async (response) => {
        if (response.code === 200) {
          document.getElementById(`closeCompleteSprintModal${props?.id}`).click();
          toast.success(response.message);
          await projectStore.refreshProjectBacklog(route.params.id);
        }
      }
    }
);
</script>

<template>
  <div class="modal fade" :id="`kt_modal_complete_sprint${id}`" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog mw-650px">
      <div class="modal-content rounded-top overflow-hidden">
        <div class="w-100">
          <img class="img-fluid no-select" src="~/assets/media/illustrations/misc/complete-sprint.png"
               alt="complete sprint">
        </div>
        <div class="modal-body mx-15 pb-2">
          <div class="text-center mb-6">
            <h1 class="mb-3 fs-2">Complete Sprint: <span class="text-primary">"{{ completeSprintInfo?.name }}"</span>
            </h1>
            <p v-if="completeSprintInfo?.goal" class="text-start p-3 bg-gray-100 rounded-1"><strong>Goal:</strong>
              {{ completeSprintInfo?.goal }}</p>
          </div>
          <div class="mb-8">
            <div class="mb-6">
              <ul class="list-group">
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  Completed Issues
                  <span
                      class="badge bg-light-dark text-dark rounded-pill">{{
                      completeSprintInfo?.completedIssuesLength
                    }}</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  Open Issues
                  <span
                      class="badge bg-light-dark text-dark rounded-pill">{{
                      completeSprintInfo?.unCompletedIssuesLength
                    }}</span>
                </li>
              </ul>
              <p v-if="completeSprintInfo?.canComplete"
                 class="bg-light-primary p-2 px-3 rounded-1 mt-3 text-dark fw-semibold">Great job! No open issues.</p>
              <p v-else class="bg-light-danger p-2 px-3 rounded-1 mt-3 text-dark fw-semibold">You have
                {{ completeSprintInfo?.unCompletedIssuesLength }} open issues</p>
            </div>

            <div v-if="!completeSprintInfo?.canComplete" class="mb-7 w-100">
              <label class="d-block mb-2">Move open issues to:</label>
              <Dropdown v-model="selectedMoveSprint" :options="completeSprintInfo?.moveIssuesOptions" optionLabel="name"
                        placeholder="Select a sprint" class="w-100"/>
            </div>

            <div class="d-flex align-items-center justify-content-center gap-4">
              <button @click="handleSubmit" class="btn btn-sm btn-primary" :disabled="inProgress">
                <img v-if="inProgress" src="~/assets/media/misc/spinner.gif" width="16">
                <span v-else class="indicator-label mr-3">Complete</span>
              </button>
              <button type="button" data-bs-dismiss="modal" :id="`closeCompleteSprintModal${id}`"
                      class="cancel-button btn btn-sm bg-light-dark fw-bold">
                <span class="indicator-label mr-3">Cancel</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cancel-button:hover {
  background-color: var(--bs-gray-300) !important;
}
</style>