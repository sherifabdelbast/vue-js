<script setup>
import {helpers, maxLength, required} from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import {usePostData} from "~/composables/usePostData";
import {useProjectStore} from "~/stores/useProjectStore";
import {storeToRefs} from "pinia";
import {useToast} from "vue-toastification";

const route = useRoute();

const {createIssue} = usePostData();
const {user} = useAuth();
const toast = useToast();

const projectStore = useProjectStore();
const {project} = storeToRefs(projectStore);

const createIssueData = ref({
  title: "",
  sprint_id: null,
});

const validationErrors = reactive({
  title: null,
});


// form validation rules
const rules = {
  title: {
    required: helpers.withMessage('Issue Title Is Required', required),
    maxLength: helpers.withMessage("Issue title can't be more than 255 characters", maxLength(255)),
  }
}

const v$ = useVuelidate(rules, createIssueData.value);

// === methods === //
const handleSubmit = async () => {
  validationErrors.title = null;
  const result = await v$.value.$validate();

  createIssueData.value.title = (createIssueData.value.title).trim();

  if (result) {
    await submit();
  }

  validationErrors.title = v$.value?.title?.$errors[0]?.$message;
}

const {
  submit,
  inProgress,
  validationErrors: errors,
} = useSubmit(() => createIssue(createIssueData.value, project.value?.project_identify), {
  onSuccess: async (response) => {
    if (response?.code === 201) {
      document.getElementById("closeCreateIssueModal").click();
      await projectStore.refreshProjectBacklog(route.params?.id || project.value?.project_identify);
      validationErrors.title = null;
      createIssueData.value.title = "";

      toast.success(response?.message);
    }
  },
  onError: (error) => {
    if (error?.data?.code === 422) {
      toast.error(error?.data?.message);
      return;
    }
    document.getElementById("closeCreateIssueModal").click();
    validationErrors.title = null;
    createIssueData.value.title = "";
  }
});
</script>

<template>
  <div class="modal fade" id="kt_modal_create_issue" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog mw-650px">
      <div class="modal-content">
        <div class="modal-header pb-0 border-0 justify-content-end">
          <div class="btn btn-sm btn-icon btn-active-color-primary" data-bs-dismiss="modal" id="closeCreateIssueModal">
            <i class="ki-outline ki-cross fs-1"></i>
          </div>
        </div>
        <div class="modal-body scroll-y mx-5 mx-xl-18 pt-0 pb-15">
          <div class="text-center mb-13">
            <h1 class="mb-3">Create Issue</h1>
          </div>
          <form @submit.prevent="handleSubmit" class=" text-center">
            <FormInput type="text" autocomplete="off" labelText="Issue Title" name="title"
                       placeholder="Project Name"
                       v-model:input="createIssueData.title"
                       :formDataError="validationErrors?.title || errors?.title"/>

            <button :disabled="inProgress" type="submit" class="btn btn-primary w-100 mt-5">
              <img v-if="inProgress" src="~/assets/media/misc/spinner.gif" width="16">
              <span v-else class="indicator-label">Create</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>