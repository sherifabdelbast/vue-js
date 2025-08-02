<script setup>
import useVuelidate from "@vuelidate/core";
import { required, helpers, minLength, maxLength } from "@vuelidate/validators";
import { useToast } from "vue-toastification";
import { useAppStore } from "~/stores/useAppStore";
import { useProjectStore } from "~/stores/useProjectStore";
import { storeToRefs } from "pinia";

definePageMeta({
  layout: "none",
  middleware: "guest",
});
useHead({
  title: "Complete Registration",
});

const appStore = useAppStore();
const projectStore = useProjectStore();
const { previewImage } = storeToRefs(appStore);
const router = useRouter();
const route = useRoute();

onMounted(() => {
  previewImage.value = "";
  const fileInput = document.querySelector('#completeForm input[type="file"]');
  if (fileInput) {
    fileInput.value = ""; // Clear file input
  }
});

const { complete, user, checkToken } = useAuth();
const toast = useToast();

onBeforeMount(async () => {
  if (!route.query.token) {
    await navigateTo("/login");
  }
  await check_token(route.query.token);
});

const identifyNumber = ref(null);

const formData = reactive({
  name: "",
  password: "hello1503", // Your provided value
  confirm_password: "hello1503", // Your provided value
  photo: null, // For file input
});

const validationErrors = reactive({
  name: null,
  password: null,
  confirm_password: null,
  photo: null,
});

// Custom validation rules aligned with backend
const noSpecialChars = (value) =>
  !/[\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/gi.test(value);
const onlyTwoWords = (value) =>
  value.split(" ").filter((word) => word.length > 0).length <= 2;
const mustMatch = (value) => formData.confirm_password === formData.password;
const mustContainsLettersNumbers = (value) =>
  /^(?=.*[a-zA-Z])(?=.*[0-9]).+$/.test(value);

const rules = {
  name: {
    required: helpers.withMessage("Name is required", required),
    minLength: helpers.withMessage(
      "Name must be at least 4 characters",
      minLength(4)
    ), // Aligned with backend
    maxLength: helpers.withMessage(
      "Name can't be more than 19 characters",
      maxLength(19)
    ), // Aligned with backend
    noSpecialChars: helpers.withMessage(
      "Name can't contain numbers or special characters",
      noSpecialChars
    ),
    twoWords: helpers.withMessage(
      "Name can't be more than 2 words",
      onlyTwoWords
    ),
  },
  password: {
    required: helpers.withMessage("Password is required", required),
    minLength: helpers.withMessage(
      "Password must be at least 9 characters",
      minLength(9)
    ), // Aligned with backend
    mustContainsLettersNumbers: helpers.withMessage(
      "Password must contain letters and numbers",
      mustContainsLettersNumbers
    ),
  },
  confirm_password: {
    required: helpers.withMessage("Confirm password is required", required),
    sameAs: helpers.withMessage(
      "Confirm password doesn't match the password",
      mustMatch
    ),
  },
};

const v$ = useVuelidate(rules, formData);

const handleSubmit = async () => {
  validationErrors.name = null;
  validationErrors.password = null;
  validationErrors.confirm_password = null;
  validationErrors.photo = null;

  const result = await v$.value.$validate();

  if (!result) {
    validationErrors.name = v$.value?.name?.$errors[0]?.$message;
    validationErrors.password = v$.value?.password?.$errors[0]?.$message;
    validationErrors.confirm_password =
      v$.value?.confirm_password?.$errors[0]?.$message;
    return;
  }

  const fd = new FormData();
  fd.append("identify_number", identifyNumber.value);
  fd.append("name", formData.name.trim());
  fd.append("password", formData.password);
  fd.append("password_confirmation", formData.confirm_password);
  if (formData.photo instanceof File) {
    fd.append("photo", formData.photo);
  }

  appStore.formData = fd;
  await submit();
  appStore.formData = null;
  const fileInput = document.querySelector('#completeForm input[type="file"]');
  if (fileInput) {
    fileInput.value = ""; // Clear file input
  }
};

const check_token = async (token) => {
  try {
    const response = await checkToken({ token });
    if (response?.code === 200) {
      identifyNumber.value = response?.identify_number;
    }
  } catch (error) {
    if (error?.data?.code === 400) {
      await navigateTo("/join");
      toast.error(error?.data?.message);
    }
  }
};

const {
  submit,
  inProgress,
  validationErrors: errors,
} = useSubmit(() => complete(appStore.formData), {
  onSuccess: async (response) => {
    if (response?.code === 200) {
      if (projectStore?.invitationIdentifyNumber) {
        if (projectStore?.userIdentifyNumber === user?.value?.identify_number) {
          toast.success(response?.message);
          await navigateTo(
            `/invitation/?invite_identify=${projectStore?.invitationIdentifyNumber}`
          );
          return;
        } else {
          toast.error("You are not the user invited to this project.");
        }
      } else {
        toast.success(response?.message);
        await navigateTo("/create-project");
      }
    }
  },
  onError: async (error) => {
    if (error?.data?.code === 400) {
      toast.error(error?.data?.message);
      await navigateTo("/join");
    } else if (error?.message) {
      // Display backend validation errors
      const errors = JSON.parse(
        error.message.split("Validation failed: ")[1] || "{}"
      );
      Object.assign(validationErrors, errors);
    }
  },
});
</script>

<template>
  <div>
    <div class="vh-100 d-flex flex-column flex-root" id="kt_app_root">
      <div
        class="d-flex flex-column flex-lg-row flex-column-fluid position-relative"
      >
        <div
          class="d-flex flex-column flex-lg-row-fluid w-lg-50 p-10 order-2 order-lg-1"
        >
          <div class="d-flex flex-center flex-column flex-lg-row-fluid">
            <div class="w-500px p-10 pt-0">
              <form
                class="form w-100 text-center"
                @submit.prevent="handleSubmit"
                id="completeForm"
              >
                <div class="text-center mb-11">
                  <h1 class="text-dark fw-bolder mb-3">
                    Complete registration
                  </h1>
                  <div class="text-gray-500 fw-semibold fs-6">
                    Your Social Campaigns
                  </div>
                </div>

                <FormAvatarInput
                  from="user"
                  :formDataError="errors?.photo"
                  name="photo"
                  @update:file="formData.photo = $event"
                />

                <FormInput
                  type="text"
                  autocomplete="off"
                  labelText="Full Name"
                  name="name"
                  placeholder="e.g., John Doe"
                  v-model:input="formData.name"
                  :formDataError="validationErrors.name || errors?.name"
                  class="mb-7"
                />

                <FormInput
                  type="password"
                  placeholder="Password"
                  autocomplete="off"
                  labelText="Password"
                  name="password"
                  v-model:input="formData.password"
                  :formDataError="validationErrors.password || errors?.password"
                  class="mb-7"
                />

                <FormInput
                  type="password"
                  placeholder="Confirm Password"
                  autocomplete="off"
                  labelText="Confirm Password"
                  name="password_confirmation"
                  v-model:input="formData.confirm_password"
                  :formDataError="
                    validationErrors.confirm_password ||
                    errors?.confirm_password
                  "
                  class="mb-7"
                />

                <div class="d-grid mb-10">
                  <button
                    :disabled="inProgress"
                    type="submit"
                    id="kt_sign_in_submit"
                    class="btn btn-primary btn-hover"
                  >
                    <img
                      v-if="inProgress"
                      src="~/assets/media/misc/spinner.gif"
                      width="16"
                    />
                    <span v-else class="indicator-label"
                      >Complete registration</span
                    >
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div
          class="d-flex flex-lg-row-fluid w-lg-50 bgi-size-cover bgi-position-center order-1 order-lg-2 h-1"
          :style="{ backgroundImage: `url('/auth-bg.png')` }"
        >
          <div
            class="d-flex flex-column flex-center py-7 py-lg-15 px-5 px-md-15 w-100"
          >
            <NuxtLink to="/" class="mb-0 mb-lg-12">
              <img
                alt="Logo"
                src="~/assets/media/logos/logo-light.png"
                class="h-60px h-lg-75px"
              />
            </NuxtLink>
            <img
              class="d-none d-lg-block mx-auto w-275px w-md-50 w-xl-500px mb-10 mb-lg-20"
              src="../assets/media/illustrations/misc/complete.png"
              alt=""
            />
            <h1
              class="d-none d-lg-block text-white fs-2qx fw-bolder text-center mb-7"
            >
              Complete Registration
            </h1>
            <div class="d-none d-lg-block text-white fs-base text-center w-75">
              Doloremque in quam et at corrupti cupiditate quis quibusdam nemo,
              voluptates, voluptatum rem inventore? Nulla quia dolor eos
              reprehenderit atque ipsa ipsum!
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
