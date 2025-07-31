<script setup>
import {usePostData} from "~/composables/usePostData";
import {useProjectStore} from "~/stores/useProjectStore";
import {useToast} from "vue-toastification";
import {storeToRefs} from "pinia"

const route = useRoute();

const {updateMemberRole} = usePostData();
const toast = useToast();

const projectStore = useProjectStore();
const {selectedChangeMemberRole, changeMemberRoleInfo, changeMemberRoleLoading} = storeToRefs(projectStore);

const validationErrors = reactive({
  role: null,
  allValid: true
});

const handleSubmit = async () => {
  validationErrors.role = null;
  validationErrors.allValid = true;

  if (!selectedChangeMemberRole.value) {
    validationErrors.role = "Role is required.";
    validationErrors.allValid = false;
  }

  if (validationErrors.allValid) {
    await submit();
  }
}

const {
  submit,
  inProgress,
  validationErrors: errors,
} = useSubmit(() => updateMemberRole(route.params.id, changeMemberRoleInfo.value?.id, {role_id: selectedChangeMemberRole.value.id}), {
  onSuccess: async (response) => {
    if (response?.code === 200) {
      document.getElementById("closeChangeMemberRole").click();
      toast.success(response?.message);
    }
  }
});
</script>

<template>
  <div class="modal fade" id="kt_modal_change_member_role" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog mw-650px">
      <div class="modal-content rounded-top overflow-hidden">
        <SkeletonLoaderChangeMemberRole v-if="changeMemberRoleLoading"/>

        <div v-else class="modal-body mx-15 py-10">
          <div class="text-center mb-6 d-flex flex-column align-items-center">
            <h1 class="mb-2 fs-2 user-select-none">Change "{{changeMemberRoleInfo?.name}}" role</h1>
            <p class="bg-light-danger p-2 px-3 rounded-1 mt-3 text-dark fw-semibold user-select-none">Be careful when change member role.</p>
          </div>
          <div>
            <div class="mb-7 w-100">
              <label class="d-block mb-2">Change members role to:</label>
              <Dropdown v-model="selectedChangeMemberRole" :options="changeMemberRoleInfo.rolesOptions" optionLabel="name"
                        placeholder="Select a status" class="w-100"
                        :pt="{
                            item: {class: ''}
                        }"/>
            </div>

            <div class="d-flex align-items-center justify-content-center gap-4">
              <button @click="handleSubmit" class="btn btn-sm btn-danger" :disabled="inProgress">
                <img v-if="inProgress" src="~/assets/media/misc/spinner.gif" width="16">
                <span v-else class="indicator-label mr-3">Save</span>
              </button>
              <button type="button" data-bs-dismiss="modal" id="closeChangeMemberRole" class="cancel-button btn btn-sm bg-light-dark fw-bold">
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