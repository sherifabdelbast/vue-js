<script setup>
import {useToast} from "vue-toastification";
import {email, helpers, required} from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";

definePageMeta({
  layout: "none",
  middleware: ["guest"]
});
useHead({
  title: "Join",
});

// === Data === //
const toast = useToast();

const router = useRouter();
const {join} = useAuth();

// === Validation === //
const formData = reactive({
  email: "",
});
const validationErrors = reactive({
  email: null,
});
const rules = {
  email: {
    required: helpers.withMessage('Please make sure to provide an email address.', required),
    email: helpers.withMessage('The provided email is not valid. Please enter a valid email address.', email)
  }
}
const v$ = useVuelidate(rules, formData);

const handleSubmit = async () => {
  validationErrors.email = null;
  const result = await v$.value.$validate();

  if (result) {
    submit();
    return;
  }

  validationErrors.email = v$.value?.email?.$errors[0]?.$message;
};

const {submit, inProgress, validationErrors: errors} = useSubmit(() => join(formData), {
      onSuccess: async (response) => {
        if (response.code === 200) {
          await navigateTo(`/welcome?identify_number=${response.identify_number}`);
          toast.info("Finalize your account. Instructions are waiting in your inbox." || response.message, {});
          return;
        } else if (response.code === 201) {
          await navigateTo(`/welcome?identify_number=${response.identify_number}`);
          toast.success("Welcome aboard! Please check your inbox to finalize your account setup." || response.message, {});
          return;
        }
      },
      onError: async (error) => {
        if (error.data.code === 400) {
          await navigateTo("/login");
          toast.info("Email already in use. Please choose another email." || error.data.message, {});
          return;
        } else if (error.data.code === 429) {
          toast.error("Maximum join attempts reached. Please retry later." || error.data.message, {});
        } else if (error.data.code === 1400) {
          toast.warning("We've previously sent you an email that is still valid. Please check your inbox." || error.data.message, {});
        }
      }
    }
);
</script>

<template>
  <div>
    <div class="vh-100 d-flex flex-column flex-root" id="kt_app_root">
      <div class="d-flex flex-column flex-lg-row flex-column-fluid">
        <div
            class="d-flex flex-column flex-lg-row-fluid w-lg-50 p-10 order-2 order-lg-1"
        >
          <div class="d-flex flex-center flex-column flex-lg-row-fluid">
            <div class="w-500px p-10">
              <form class="form w-100" @submit.prevent="handleSubmit">
                <div class="text-center mb-11">
                  <h1 class="text-dark fw-bolder mb-3">Join us</h1>
                  <div class="text-gray-500 fw-semibold fs-6">
                    Your Social Campaigns
                  </div>
                </div>
                <FormInput v-model:input="formData.email" type="text" placeholder="name@example.com" autocomplete="off"
                           labelText="Email address"
                           name="email"
                           :formDataError="validationErrors.email || errors?.email"
                           class="mb-7"
                />

                <div class="d-grid mb-10">
                  <button :disabled="inProgress" type="submit" id="kt_sign_in_submit"
                          class="btn btn-primary btn-hover">
                    <img v-if="inProgress" src="~/assets/media/misc/spinner.gif" width="16">
                    <span v-else class="indicator-label">Join</span>
                  </button>
                </div>
                <div class="text-gray-500 text-center fw-semibold fs-6">
                  Already have an account?
                  <nuxt-link to="/login" class="link-primary">Log In</nuxt-link>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div
            class="d-flex flex-lg-row-fluid w-lg-50 bgi-size-cover bgi-position-center order-1 order-lg-2 h-1"
            style="background-image: url(/auth-bg.png);"
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
                src="~/assets/media/illustrations/misc/join.png"
                alt="join photo"
            />
            <h1
                class="d-none d-lg-block text-white fs-2qx fw-bolder text-center mb-7"
            >
              Join
            </h1>
            <div class="d-none d-lg-block text-white fs-base text-center w-75">
              Join our community of achievers at Taskat! Discover a smarter way to manage tasks, enhance productivity,
              and collaborate seamlessly. Whether you're a professional or student, together we'll conquer goals and
              stay organized. Join now for a more efficient tomorrow.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>