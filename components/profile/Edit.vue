<script setup>
import useVuelidate from "@vuelidate/core";
import {helpers, maxLength, minLength, required, numeric} from "@vuelidate/validators";
import {useToast} from "vue-toastification";
import {useAppStore} from "~/stores/useAppStore";
import {storeToRefs} from "pinia";

const emits = defineEmits(["statusChanged"]);
const {updateProfileInfo} = usePostData();
const appStore = useAppStore();
const {previewImage} = storeToRefs(appStore);
const {profile} = storeToRefs(appStore);
const toast = useToast();

let tagify = null;

onMounted(() => {
  let input = document.getElementById("editSkills");
  tagify = new Tagify(input);
  oldProfileData.skills = tagify.value.length
});

previewImage.value = profile.value?.user?.url_photo;

const oldProfileData = {
  name: profile.value?.user?.name,
  phone: profile.value?.user?.phone,
  jobTitle: profile.value?.user?.job_title,
  location: profile.value?.user?.location,
  skills: null
}

const formData = reactive({
  name: profile.value?.user?.name,
  phone: profile.value?.user?.phone,
  jobTitle: profile.value?.user?.job_title,
  location: profile.value?.user?.location,
  skills: profile.value?.user?.skills
});

const validationErrors = reactive({
  name: null,
  phone: null,
  jobTitle: null,
  location: null,
  skills: null,
});

// custom validation rules
const noSpecialChars = (value) => !/[\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/gi.test(value);
const onlyTwoWords = (value) => value.split(" ").length > 2 ? false : true;

// form validation rules
const rules = {
  name: {
    required: helpers.withMessage('Name Is Required', required),
    minLength: helpers.withMessage('Name must be more than 3 characters', minLength(3)),
    maxLength: helpers.withMessage("Name can't be more than 20 characters", maxLength(20)),
    noSpecialChars: helpers.withMessage("Name can't contains numbers or special characters", noSpecialChars),
    twoWords: helpers.withMessage("Name can't be more than 2 words", onlyTwoWords),
  },
  phone: {
    numeric: helpers.withMessage('Phone contains only numbers.', numeric),
    minLength: helpers.withMessage('Phone must be more than 7 numbers', minLength(7)),
  },
}

const v$ = useVuelidate(rules, formData);

// === methods === //
const handleSubmit = async () => {
  validationErrors.name = null;
  validationErrors.phone = null;
  validationErrors.jobTitle = null;
  validationErrors.location = null;
  validationErrors.skills = null;
  const result = await v$.value.$validate();
  const photoChange = ref(false);

  const fd = new FormData(editProfileForm);

  if (fd.get("photo").name && fd.get("photo").size > 0) {
    photoChange.value = true;
  }

  formData.name = (formData.name).trim();

  const selectedSkills = tagify.value.map(skill => skill.value);
  profile.value.user.skills = tagify.value.map(skill => skill.value);

  if (result) {
    if (oldProfileData.name !== formData.name || oldProfileData.jobTitle !== formData.jobTitle || oldProfileData.phone !== formData.phone || oldProfileData.location !== formData.location || oldProfileData.skills !== tagify.value.length || photoChange.value) {
      fd.delete('skillsInput');
      fd.append("skills", JSON.stringify(selectedSkills));

      appStore.formData = fd;

      await submit();
      appStore.formData = null;
      photoChange.value = false;
      return;
    } else {
      photoChange.value = false;
      emits("statusChanged");
    }
  }

  validationErrors.name = v$.value?.name?.$errors[0]?.$message;
  validationErrors.phone = v$.value?.phone?.$errors[0]?.$message;
  // validationErrors.jobTitle = v$.value?.jobTitle?.$errors[0]?.$message;
  // validationErrors.location = v$.value?.location?.$errors[0]?.$message;
  // validationErrors.skills = v$.value?.skills?.$errors[0]?.$message;
}

const {
  submit,
  inProgress,
  validationErrors: errors,
} = useSubmit(() => updateProfileInfo(profile.value?.user?.identify_number, appStore.formData), {
  onSuccess: async (response) => {
    if (response?.code === 200) {
      toast.success(response?.message);
      await appStore.refreshProfileDetails(profile.value?.user?.identify_number);
      emits("statusChanged");
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
  <div class="card">
    <div class="card-header border-0 cursor-pointer">
      <div class="card-title m-0">
        <h3 class="fw-bold m-0">Edit Profile Details</h3>
      </div>
    </div>
    <div id="kt_account_settings_profile_details" class="collapse show">
      <form @submit.prevent="handleSubmit" id="editProfileForm" class="form">
        <div class="card-body border-top p-9">
          <div class="row mb-10">
            <label class="col-lg-4 col-form-label fw-semibold fs-6">Profile Photo</label>
            <div class="col-lg-8">
              <FormAvatarInput :currentImage="profile?.user?.url_photo" from="user" :formDataError="errors?.photo" name="photo"/>
            </div>
          </div>
          <div class="row mb-10">
            <label class="col-lg-4 col-form-label required fw-semibold fs-6">Full Name</label>
            <div class="col-lg-8">
              <FormInput type="text" autocomplete="off" labelText="Full Name" name="name" placeholder="Full Name"
                         v-model:input="formData.name" :formDataError="validationErrors.name || errors?.name"/>
            </div>
          </div>
          <div class="row mb-10">
            <label class="col-lg-4 col-form-label required fw-semibold fs-6">Job Title</label>
            <div class="col-lg-8">
              <FormInput type="text" autocomplete="off" labelText="Job Title" name="job_title" placeholder="Job Title"
                         v-model:input="formData.jobTitle"
                         :formDataError="validationErrors.jobTitle || errors?.jobTitle"/>
            </div>
          </div>
          <div class="row mb-10">
            <label class="col-lg-4 col-form-label fw-semibold fs-6">
              <span class="required">Phone</span>
            </label>
            <div class="col-lg-8 fv-row">
              <FormInput type="text" autocomplete="off" labelText="Phone" name="phone" placeholder="Phone"
                         v-model:input="formData.phone" :formDataError="validationErrors.phone || errors?.phone"/>
            </div>
          </div>
          <div class="row mb-10">
            <label class="col-lg-4 col-form-label required fw-semibold fs-6">Location</label>
            <div class="col-lg-8">
              <FormInput type="text" autocomplete="off" labelText="Location" name="location" placeholder="Location"
                         v-model:input="formData.location" :formDataError="validationErrors.location || errors?.location"/>
            </div>
          </div>
          <div class="row mb-10">
            <label class="col-lg-4 col-form-label required fw-semibold fs-6">Skills</label>
            <div class="col-lg-8">
              <input id="editSkills" type="text" class="form-control w-100" :value="profile?.user?.skills" name="skillsInput">
            </div>
          </div>
        </div>
        <div class="card-footer d-flex justify-content-end">
          <span @click.prevent="emits('statusChanged')"
                class="btn btn-light btn-active-light-primary me-2">Discard</span>
          <button :disabled="inProgress" type="submit" class="btn btn-primary">
            <Icon v-if="inProgress" name="svg-spinners:180-ring-with-bg" size="16"/>
            <span v-else>Update</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
