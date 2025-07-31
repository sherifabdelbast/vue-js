<script setup>
import {usePostData} from "~/composables/usePostData";
import {useProjectStore} from "~/stores/useProjectStore";
import {useToast} from "vue-toastification";
import {storeToRefs} from "pinia"

const route = useRoute();

const {deleteRole} = usePostData();
const toast = useToast();

const projectStore = useProjectStore();
const {deleteRoleInfo, selectedChangeRole} = storeToRefs(projectStore);

const validationsErrors = reactive({
  selectedMoveStatus: null,
  allValid: true,
});

const handleSubmit = async () => {
  validationsErrors.selectedMoveStatus = null;
  validationsErrors.allValid = true;

  if (!selectedChangeRole.value) {
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
} = useSubmit(() => deleteRole(route.params.id, deleteRoleInfo.value?.id, {new_role_id: selectedChangeRole.value.id}), {
  onSuccess: async (response) => {
    await projectStore.refreshAllRoles(route.params?.id);

    if (response?.code === 200) {
      document.getElementById("closeDeleteRoleModal").click();
      toast.success(response?.message);
      validationsErrors.selectedMoveStatus = null;
    }
  }
});

const checkConfirm = () => {
  if (deleteRoleInfo.value.confirmText === deleteRoleInfo.value?.name) {
    deleteRoleInfo.value.isConfirmed = true;
    return;
  }

  deleteRoleInfo.value.isConfirmed = false;
}
</script>

<template>
  <div class="modal fade" id="kt_modal_delete_role" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog mw-650px">
      <div class="modal-content rounded-top overflow-hidden">
        <div class="modal-body mx-15 py-10">
          <div class="text-center mb-6 d-flex flex-column align-items-center">
            <h1 class="mb-2 fs-2 user-select-none">Delete Role: <span class="text-danger text-decoration-line-through">"{{deleteRoleInfo?.name}}"</span></h1>
            <p class="bg-light-danger p-2 px-3 rounded-1 mt-3 text-dark fw-semibold user-select-none">You have to select a new role for any member with <span>"{{deleteRoleInfo?.name}}"</span> role</p>
          </div>
          <div>
            <div class="mb-7 w-100">
              <label class="d-block mb-2">Change members role to:</label>
              <Dropdown v-model="selectedChangeRole" :options="deleteRoleInfo?.changeRoleOptions" optionLabel="name"
                        placeholder="Select a status" class="w-100"
                        :pt="{
                            item: {class: ''}
                        }"/>
            </div>

            <div class="mb-5">
              <p class="bg-light-danger p-2 px-3 rounded-1 fw-semibold mb-3 user-select-none">To confirm, type <span class="fw-bold">"{{deleteRoleInfo?.name}}"</span> in the box below.</p>

              <FormInputUnfloating type="text" autocomplete="off" name="confirmDelete" placeholder="Type to confirm"
                                   @input="checkConfirm" v-model:input="deleteRoleInfo.confirmText"/>
            </div>

            <div class="d-flex align-items-center justify-content-center gap-4">
              <button @click="handleSubmit" class="btn btn-sm btn-danger" :disabled="inProgress || !deleteRoleInfo.isConfirmed">
                <img v-if="inProgress" src="~/assets/media/misc/spinner.gif" width="16">
                <span v-else class="indicator-label mr-3">Delete</span>
              </button>
              <button type="button" data-bs-dismiss="modal" id="closeDeleteRoleModal" class="cancel-button btn btn-sm bg-light-dark fw-bold">
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