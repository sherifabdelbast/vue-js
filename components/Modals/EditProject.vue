<script setup>
import useVuelidate from "@vuelidate/core";
import {required, helpers, minLength} from "@vuelidate/validators";
import {useAppStore} from "~/stores/useAppStore";
import {useProjectStore} from "~/stores/useProjectStore";
import {storeToRefs} from "pinia";
import {usePostData} from "~/composables/usePostData";
import {useToast} from "vue-toastification";

const {editProject} = usePostData();
const toast = useToast();
const {user} = useAuth();

const router = useRouter();
const route = useRoute();

// === stores === //
const appStore = useAppStore();
const projectStore = useProjectStore();
const {previewImage} = storeToRefs(appStore);
const {project, editProjectFromData, oldEditProjectFromData} = storeToRefs(projectStore);

const isDataChanged = ref(false);

// === data === //
const validationErrors = reactive({
  name: null,
  description: null
});

// custom validation rules
const noSpecialChars = (value) => !/[\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/gi.test(value);

// form validation rules
const rules = {
  name: {
    required: helpers.withMessage('Name Is Required', required),
    minLength: helpers.withMessage('Name must be more than 3 characters', minLength(3)),
    noSpecialChars: helpers.withMessage("Name can't contains numbers or special characters", noSpecialChars),
  }
}

const v$ = useVuelidate(rules, editProjectFromData.value);

// === methods === //
const handleSubmit = async () => {
  validationErrors.name = null;
  validationErrors.description = null;
  const result = await v$.value.$validate();

  editProjectFromData.value.name = (editProjectFromData.value.name).trim();

  if (result) {
    const iconChanged = ref(false);
    const fd = new FormData(editProjectForm);

    if (fd.get("icon").name && fd.get("icon").size > 0) {
      iconChanged.value = true;
    }

    if (oldEditProjectFromData.value.name !== editProjectFromData.value.name || oldEditProjectFromData.value.description !== editProjectFromData.value.description || iconChanged.value) {
      isDataChanged.value = true;

      appStore.formData = fd;

      await submit();
      appStore.formData = null;
      iconChanged.value = false;
      let emptyFile = document.createElement('input');
      emptyFile.type = 'file';
      document.querySelector('#editProjectForm input[type="file"]').files = emptyFile.files;
      previewImage.value = null;
      return;
    } else {
      iconChanged.value = false;
      let emptyFile = document.createElement('input');
      emptyFile.type = 'file';
      document.getElementById("closeEditProjectModal").click();
      previewImage.value = null;
      document.querySelector('#editProjectForm input[type="file"]').files = emptyFile.files;
      return;
    }
  }

  validationErrors.name = v$.value?.name?.$errors[0]?.$message;
  validationErrors.description = v$.value?.description?.$errors[0]?.$message;
}

const {
  submit,
  inProgress,
  validationErrors: errors,
} = useSubmit(() => editProject(appStore.formData, project.value?.project_identify), {
  onSuccess: async (response) => {
    if (response?.code === 200) {
      document.getElementById("closeEditProjectModal").click();
      toast.success(response?.message);
      await projectStore.refreshProjectDetails(project.value?.project_identify);
      await projectStore.refreshProjects();
      if (route.name === "projects-id-project-history") {
        await projectStore.refreshProjectHistory(route.params.id);
      }
    }
  },
  onError: (error) => {
    if (error?.data?.code === 422) {
      toast.error(error?.data?.message);
    }
  }
});
</script>

<template>
  <div class="modal fade" id="kt_modal_edit_project" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog mw-650px">
      <div class="modal-content">
        <div class="modal-header pb-0 border-0 justify-content-end">
          <div class="btn btn-sm btn-icon btn-active-color-primary" data-bs-dismiss="modal" id="closeEditProjectModal">
            <i class="ki-outline ki-cross fs-1"></i>
          </div>
        </div>
        <div class="modal-body scroll-y mx-5 mx-xl-18 pt-0 pb-15">
          <div class="text-center mb-13">
            <h1 class="mb-3">Edit Project Info</h1>
          </div>
          <form @submit.prevent="handleSubmit" class=" text-center" id="editProjectForm">
            <FormAvatarInput :currentImage="editProjectFromData?.icon" from="project" name="icon"
                             :formDataError="errors?.icon"/>

            <FormInput type="text" autocomplete="off" labelText="Project Name" name="name"
                       placeholder="Project Name"
                       v-model:input="editProjectFromData.name"
                       :formDataError="validationErrors?.name || errors?.name" class="mb-7"/>

            <FormTextArea name="description" placeholder="Project Description" :addBg="false"
                          labelText="Project Description" class="mb-7"
                          v-model:input="editProjectFromData.description"
                          :formDataError="validationErrors?.description || errors?.description"/>

            <button :disabled="inProgress" type="submit" class="btn btn-primary w-100 mt-5">
              <img v-if="inProgress" src="~/assets/media/misc/spinner.gif" width="16">
              <span v-else class="indicator-label">Update</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>