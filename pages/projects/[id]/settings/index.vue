<script setup>
import {storeToRefs} from "pinia";
import {useProjectStore} from "~/stores/useProjectStore";
import {useAppStore} from "~/stores/useAppStore";
import {useToast} from "vue-toastification";
import useVuelidate from "@vuelidate/core";
import {required, helpers, minLength, maxLength} from "@vuelidate/validators";

definePageMeta({
  middleware: [
    "auth",
    "project-permissions"
  ],
  layout: "project-settings"
});

const route = useRoute();

const toast = useToast();
const {editProject} = usePostData();

const projectStore = useProjectStore();
const appStore = useAppStore();
const {previewImage} = storeToRefs(appStore);
const {project, editProjectInfo, oldEditProjectInfo} = storeToRefs(projectStore);

const isDataChanged = ref(false);

onMounted(async () => {
  appStore.isSettingsLoading = true;
  await projectStore.refreshProjectDetails(route.params.id);
  appStore.isSettingsLoading = false;
});

previewImage.value = project.value?.url_icon;

editProjectInfo.value.name = project.value?.name;
editProjectInfo.value.icon = project.value?.url_icon;
editProjectInfo.value.description = project.value?.description;

oldEditProjectInfo.value.name = project.value?.name;
oldEditProjectInfo.value.icon = project.value?.url_icon;
oldEditProjectInfo.value.description = project.value?.description;

const validationErrors = reactive({
  name: null,
  icon: null,
  description: null,
});

// custom validation rules
const noSpecialChars = (value) => !/[\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/gi.test(value);

// form validation rules
const rules = {
  name: {
    required: helpers.withMessage('Project name is required', required),
    minLength: helpers.withMessage('Project name must be more than 3 characters', minLength(3)),
    maxLength: helpers.withMessage("Project name can't be more than 30 characters", maxLength(30)),
    noSpecialChars: helpers.withMessage("Project name can't contains numbers or special characters", noSpecialChars),
  }
}

const v$ = useVuelidate(rules, editProjectInfo.value);

const handleSubmit = async () => {
  validationErrors.name = null;
  validationErrors.description = null;
  const result = await v$.value.$validate();

  editProjectInfo.value.name = (editProjectInfo.value.name).trim();

  if (result) {
    if (isDataChanged.value) {
      const fd = new FormData(editProjectForm);

      appStore.formData = fd;

      await submit();
      appStore.formData = null;
      let emptyFile = document.createElement('input');
      emptyFile.type = 'file';
      document.querySelector('#editProjectForm input[type="file"]').files = emptyFile.files;
      isDataChanged.value = false;
    }
    return;
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
      toast.success(response?.message);
      await projectStore.refreshProjectDetails(project.value?.project_identify);
      previewImage.value = project.value.url_icon;

      editProjectInfo.value.name = project.value?.name;
      editProjectInfo.value.icon = project.value?.url_icon;
      editProjectInfo.value.description = project.value?.description;

      oldEditProjectInfo.value.name = project.value?.name;
      oldEditProjectInfo.value.icon = project.value?.url_icon;
      oldEditProjectInfo.value.description = project.value?.description;

      await projectStore.refreshProjects();
    }
  }
});

const checkImageChange = (event) => {
  const imageFile = event.target.files[0];

  if (imageFile.size > 0 && imageFile.name && imageFile) {
    isDataChanged.value = true;
    return;
  }

  isDataChanged.value = false;
}

const checkDataChange = () => {
  if (oldEditProjectInfo.value.name !== editProjectInfo.value.name || oldEditProjectInfo.value.description !== editProjectInfo.value.description) {
    isDataChanged.value = true;
    return;
  }

  isDataChanged.value = false;
}
</script>

<template>
  <SkeletonLoaderEditProject v-if="appStore.isSettingsLoading"/>

  <div v-else class="app-container container-xxl">
    <div class="app-main flex-column flex-row-fluid" id="kt_app_main">
      <div class="d-flex flex-column flex-column-fluid">
        <div id="kt_app_content" class="app-content flex-column-fluid">
          <div class="card">
            <div class="card-header">
              <div class="card-title fs-3 fw-bold">Project Details</div>
            </div>
            <form @submit.prevent="handleSubmit" id="editProjectForm" class="form">
              <div class="card-body p-9">
                <div class="row mb-5">
                  <div class="col-xl-3">
                    <div class="fs-6 fw-semibold mt-2 mb-3">Project Icon</div>
                  </div>
                  <div class="col-lg-8" v-can="'edit project'">
                    <FormAvatarInput :currentImage="editProjectInfo?.icon" from="project" name="icon"
                                     :formDataError="errors?.icon"
                                     @change="checkImageChange"/>
                  </div>
                  <div class="w-150px mb-8" v-can:not="'edit project'">
                    <img v-if="project?.url_icon" class="w-100 w-100 rounded" :src="project?.url_icon" alt="image"/>
                    <img v-else class="w-100 w-100 rounded" src="~/assets/media/avatars/project.png" alt="image"/>
                  </div>
                </div>
                <div class="row mb-10">
                  <div class="col-xl-3">
                    <div class="fs-6 fw-semibold mt-2 mb-3">Project Name</div>
                  </div>
                  <div class="col-xl-9 fv-row" v-can="'edit project'">
                    <FormInputUnfloating type="text" autocomplete="off" name="name" placeholder="Project Name"
                                         @input="checkDataChange"
                                         v-model:input="editProjectInfo.name"
                                         :formDataError="validationErrors?.name || errors?.name"/>
                  </div>
                  <div class="col-xl-9 fv-row" v-can:not="'edit project'">
                    <p class="fw-semibold fs-5 border py-4 px-5 rounded border-secondary bg-light">
                      {{ project?.name }}</p>
                  </div>
                </div>
                <div class="row mb-10">
                  <div class="col-xl-3">
                    <div class="fs-6 fw-semibold mt-2 mb-3">Project Key</div>
                  </div>
                  <div class="col-xl-9 fv-row d-flex align-items-center px-3">
                    <p class="bg-gray-200 w-100 py-4 px-5 rounded fw-bold border border-secondary text-uppercase">
                      {{ project?.key }}
                      <span class="ms-3 fw-normal text-gray-600">"Non-Adjustable"</span>
                    </p>
                  </div>
                </div>
                <div class="row mb-10">
                  <div class="col-xl-3">
                    <div class="fs-6 fw-semibold mt-2 mb-3">Project Description</div>
                  </div>
                  <div class="col-xl-9 fv-row" v-can="'edit project'">
                    <FormTextAreaUnfloating name="description" placeholder="Project description"
                                            v-model:input="editProjectInfo.description"
                                            @input="checkDataChange"
                                            :formDataError="validationErrors?.description || errors?.description"/>
                  </div>
                  <div class="col-xl-9 fv-row" v-can:not="'edit project'">
                    <p class="py-4 px-5 border border-secondary rounded bg-light">{{ project?.description }}</p>
                  </div>
                </div>
                <div class="row mb-10">
                  <div class="col-xl-3">
                    <div class="fs-6 fw-semibold mt-2 mb-3">Project Owner</div>
                  </div>
                  <div class="col-xl-9 fv-row">
                    <div class="d-flex align-items-center border border-secondary py-2 px-4 rounded">
                      <NuxtLink to="/profile/" class="m-0 p-0 fw-bold fs-6 text-gray-700 text-hover-success">
                        <Avatar :user="{id: 1, name: 'Nasr Aldaya', email: 'nasr@gmail.com', photo: null}"
                                class="me-2"/>
                        Nasr Aldaya
                        <Icon name="majesticons:external-link-line" size="16"/>
                      </NuxtLink>
                    </div>
                  </div>
                </div>
                <div class="row mb-10">
                  <div class="col-xl-3">
                    <div class="fs-6 fw-semibold mt-2 mb-3">Assign new issues to</div>
                  </div>
                  <div class="col-xl-9 fv-row">
                    team members list
                  </div>
                </div>
                <div class="row">
                  <div class="col-xl-3">
                    <div class="fs-6 fw-semibold mt-2 mb-3">Default issues type</div>
                  </div>
                  <div class="col-xl-9 fv-row">
                    issue types list
                  </div>
                </div>
              </div>
              <div v-can="'edit project'" class="card-footer d-flex justify-content-end py-6 px-9">
                <button :disabled="!isDataChanged || inProgress" type="submit" class="btn btn-primary"
                        id="kt_project_settings_submit">
                  <Icon v-if="inProgress" name="svg-spinners:180-ring-with-bg" size="16"/>
                  <span v-else>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>