<script setup>
import {usePostData} from "~/composables/usePostData";
import {useProjectStore} from "~/stores/useProjectStore";
import {useToast} from "vue-toastification";
import {storeToRefs} from "pinia"

const route = useRoute();

const {deleteStatus} = usePostData();
const toast = useToast();

const projectStore = useProjectStore();
const {deleteStatusInfo, selectedMoveStatus} = storeToRefs(projectStore);

const validationsErrors = reactive({
  selectedMoveStatus: null,
  allValid: true,
});

const handleSubmit = async () => {
  validationsErrors.selectedMoveStatus = null;
  validationsErrors.allValid = true;

  if (!selectedMoveStatus.value) {
    validationsErrors.selectedMoveStatus = "You have to select a status";
    validationsErrors.allValid = false;
  }

  if (validationsErrors.allValid) {
    await submit();
  }
}

const {
  submit,
  inProgress,
  validationErrors: errors,
} = useSubmit(() => deleteStatus(route.params.id, deleteStatusInfo.value?.id, {issues_status_id: selectedMoveStatus.value.id}), {
  onSuccess: async (response) => {
    await projectStore.refreshProjectBoard(route.params?.id);

    if (response?.code === 200) {
      document.getElementById("closeDeleteStatusModal").click();
      toast.success(response?.message);
      validationsErrors.selectedMoveStatus = null;
    }
  }
});
</script>

<template>
  <div class="modal fade" id="kt_modal_delete_status" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog mw-650px">
      <div class="modal-content rounded-top overflow-hidden">
        <div class="modal-body mx-15 pb-2">
          <div class="text-center mb-6 d-flex flex-column align-items-center">
            <div class="text-center mb-4">
              <img class="img-fluid no-select" style="max-width: 80px" src="~/assets/media/illustrations/misc/delete-columns.png" alt="complete sprint">
            </div>
            <h1 class="mb-2 fs-2">Delete Status: <span class="text-danger text-decoration-line-through text-uppercase">"{{deleteStatusInfo?.name}}"</span></h1>
            <p class="bg-light-danger p-2 px-3 rounded-1 mt-3 text-dark fw-semibold">You have to select a new status for any issue with <span class="text-uppercase">"{{deleteStatusInfo?.name}}"</span> status</p>
          </div>
          <div class="mb-8">
            <div class="mb-7 w-100">
              <label class="d-block mb-2">Change issues status to:</label>
              <Dropdown v-model="selectedMoveStatus" :options="deleteStatusInfo?.changeStatusOptions" optionLabel="name"
                        placeholder="Select a status" class="w-100"
                        :pt="{
                            item: {class: 'text-uppercase'}
                        }"/>
            </div>

            <div class="d-flex align-items-center justify-content-center gap-4">
              <button @click="handleSubmit" class="btn btn-sm btn-danger" :disabled="inProgress">
                <img v-if="inProgress" src="~/assets/media/misc/spinner.gif" width="16">
                <span v-else class="indicator-label mr-3">Delete</span>
              </button>
              <button type="button" data-bs-dismiss="modal" id="closeDeleteStatusModal" class="cancel-button btn btn-sm bg-light-dark fw-bold">
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