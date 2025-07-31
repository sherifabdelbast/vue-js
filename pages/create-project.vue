<script setup>
import useVuelidate from "@vuelidate/core";
import {required, helpers, minLength, maxLength} from "@vuelidate/validators";
import {useToast} from "vue-toastification";
import {useAppStore} from "~/stores/useAppStore";
import {useProjectStore} from "~/stores/useProjectStore";
import {usePostData} from "~/composables/usePostData";
import {useGetData} from "~/composables/useGetData";
import {storeToRefs} from "pinia";

definePageMeta({
  layout: "none",
  middleware: "auth"
});
useHead({
  title: "Create Project",
});

const router = useRouter();
const route = useRoute();

// === stores === //
const appStore = useAppStore();
const projectStore = useProjectStore();
const {previewImage} = storeToRefs(appStore);

await projectStore.refreshProjects();

onMounted(() => {
  previewImage.value = '';

  let emptyFile = document.createElement('input');
  emptyFile.type = 'file';
  document.querySelector('#projectForm input[type="file"]').files = emptyFile.files;
});

const {user, refresh} = useAuth();
const {createProject} = usePostData();
const {fetchProjectsKeys} = useGetData();
const toast = useToast();

const projectsKeys = await fetchProjectsKeys();

// === data === //
const formData = reactive({
  name: "",
  description: "",
  key: ""
});

const validationErrors = reactive({
  name: null,
  description: null,
  key: null,
});

// custom validation rules
const noNumbersAndSpecialChars = (value) => !/[\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/gi.test(value);
const noSpecialChars = (value) => !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/gi.test(value);

// form validation rules
const rules = {
  name: {
    required: helpers.withMessage('Name Is Required', required),
    minLength: helpers.withMessage('Name must be more than 3 characters', minLength(3)),
    noSpecialChars: helpers.withMessage("Name can't contains numbers or special characters", noNumbersAndSpecialChars),
    maxLength: helpers.withMessage("Project name can't be more than 30 characters", maxLength(30)),
  },
  key: {
    required: helpers.withMessage('Key Is Required', required),
    noSpecialChars: helpers.withMessage("Key can't contains special characters", noSpecialChars),
    maxLength: helpers.withMessage("Key can't be more than 5 characters", maxLength(5)),
  }
}

const v$ = useVuelidate(rules, formData);

// === methods === //
const handleSubmit = async () => {
  validationErrors.name = null;
  validationErrors.description = null;
  validationErrors.key = null;
  const result = await v$.value.$validate();

  formData.name = (formData.name).trim();

  if (result) {
    const fd = new FormData(projectForm);

    fd.append("user_id", user?.value?.id);

    appStore.formData = fd;

    await submit();
    appStore.formData = null;
    return;
  }

  validationErrors.name = v$.value?.name?.$errors[0]?.$message;
  validationErrors.password = v$.value?.description?.$errors[0]?.$message;
  validationErrors.key = v$.value?.key?.$errors[0]?.$message;
}

const {submit, inProgress, validationErrors: errors,} = useSubmit(() => createProject(appStore.formData), {
  onSuccess: async (response) => {
    if (response?.code == 201) {
      appStore.projectCreated.is = true;
      appStore.projectCreated.id = response?.project_identify;
      toast.success(response.message);
      await navigateTo(`/projects/${response?.project_identify}`);
    }
  },
  onError: async (error) => {
    if (error?.data?.code === 400) {
      toast.error(error?.data?.message);
      await navigateTo(`/projects/${error?.data?.project_identify}`);
    }
  }
});

// generate key when enter project name
const generateProjectKey = () => {
  // take the first letter of each word in the project name
  const projectName = ref(formData.name.split(' '));
  formData.key = projectName.value.map(word => word.charAt(0)).join('').toUpperCase();

  // if the key exist => take the first word (max length 5)
  if (projectsKeys.key.includes(formData.key)) {
    projectName.value = formData.name.split(" ");
    formData.key = projectName.value[0].slice(0, 5).toUpperCase();

    // if the key exist => take the first word and decrease it length < 5
    for (let i = 5; i > 0; i--) {
      if (projectsKeys.key.includes(formData.key)) {
        formData.key = projectName.value[0].slice(0, i).toUpperCase();
      }
    }

    // take the first letter of each word in the project name and add number
    if (projectsKeys.key.includes(formData.key)) {
      projectName.value = formData.name.split(' ');
      for (let i = 1; projectsKeys.key.includes(formData.key); i++) {
        formData.key = projectName.value.map(word => word.charAt(0)).join('').toUpperCase() + i;
      }
    }
  }
}
</script>

<template>
  <div>
    <div class="vh-100 d-flex flex-column flex-root" id="kt_app_root">
      <div class="d-flex flex-column flex-lg-row flex-column-fluid">
        <div class="d-flex flex-column flex-lg-row-fluid w-lg-50 p-10 order-2 order-lg-1">
          <div class="d-flex flex-center flex-column flex-lg-row-fluid">
            <div class="w-500px p-10">
              <form class="form w-100 text-center" id="projectForm" @submit.prevent="handleSubmit">
                <div class="text-center mb-11">
                  <h1 class="text-dark fw-bolder mb-3">Create Project</h1>
                  <div v-if="!projectStore.userProjects.length > 0" class="text-gray-500 fw-semibold fs-6">
                    Create your first project
                  </div>
                </div>

                <FormAvatarInput from="project" :formDataError="errors?.photo" name="icon"/>

                <!-- Start Input Fields -->
                <FormInput type="text" autocomplete="off" labelText="Project Name" name="name"
                           placeholder="Full Name"
                           v-model:input="formData.name" :formDataError="validationErrors?.name || errors?.name"
                           @input="generateProjectKey"
                           class="mb-7"
                />

                <FormTextArea name="description" placeholder="Project Description..."
                              labelText="Project Description"
                              v-model:input="formData.description"
                              :formDataError="validationErrors?.description || errors?.description"
                              class="mb-7"
                />

                <FormInput type="text" autocomplete="off" labelText="Project Key" name="key"
                           placeholder="Project Key"
                           v-model:input="formData.key" :formDataError="validationErrors?.key || errors?.key"
                           class="mb-7"
                />
                <!-- End Input Fields -->

                <div class="d-grid mb-10">
                  <button :disabled="inProgress" type="submit" id="kt_sign_in_submit"
                          class="btn btn-primary btn-hover">
                    <img v-if="inProgress" src="~/assets/media/misc/spinner.gif" width="16">
                    <span v-else class="indicator-label">Create</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          <NuxtLink v-if="!projectStore.userProjects.length > 0" class="text-end text-success fw-bold text-hover-underline d-flex align-items-center" to="/projects">
            <Icon name="material-symbols:arrow-left-alt" size="20"/>
            <span>Skip</span>
          </NuxtLink>

          <NuxtLink v-else class="text-start text-success fw-bold text-hover-underline d-flex align-items-center" to="/projects">
            <Icon name="material-symbols:arrow-left-alt" size="20"/>
            <span>Cancel</span>
          </NuxtLink>
        </div>
        <div class="d-flex flex-lg-row-fluid w-lg-50 bgi-size-cover bgi-position-center order-1 order-lg-2 h-1"
             :style="{ backgroundImage: `url('/auth-bg.png')` }">
          <div class="d-flex flex-column flex-center py-7 py-lg-15 px-5 px-md-15 w-100">
            <NuxtLink to="/" class="mb-0 mb-lg-12">
              <img alt="Logo" src="~/assets/media/logos/logo-light.png" class="h-60px h-lg-75px"/>
            </NuxtLink>

            <img class="d-none d-lg-block mx-auto w-275px w-md-50 w-xl-500px mb-10 mb-lg-20" src="../assets/media/illustrations/misc/create-project.png" alt=""/>
            <h1 class="d-none d-lg-block text-white fs-2qx fw-bolder text-center mb-7">
              Create Project
            </h1>
            <div class="d-none d-lg-block text-white fs-base text-center w-75">
              Doloremque in quam et at corrupti cupiditate quis quibusdam nemo,voluptates, voluptatum rem inventore? Nulla quia dolor eos reprehenderit atque ipsa ipsum!
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scroped>
.text-hover-underline:hover span {
  text-decoration: underline;
}

.text-hover-underline {
  width: fit-content;
}
</style>