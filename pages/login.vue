<script setup>
import {useToast} from "vue-toastification";
import {useAppStore} from "~/stores/useAppStore";
import useVuelidate from "@vuelidate/core";
import {required, email, helpers} from "@vuelidate/validators";
import {useProjectStore} from "~/stores/useProjectStore";

definePageMeta({
  layout: "none",
  middleware: "guest"
});
useHead({
  title: "Login",
});


// === Data === //
const toast = useToast();

// === stores === //
const appStore = useAppStore();

const router = useRouter();
const route = useRoute();
const projectStore = useProjectStore();

const {login, user} = useAuth();

// === Validation === //
const formData = reactive({
  email: "",
  password: "",
});
const validationErrors = reactive({
  email: null,
  password: null,
});

// // form validation rules
const rules = {
  email: {
    required: helpers.withMessage('Please make sure to provide an email address.', required),
    email: helpers.withMessage('The provided email is not valid. Please enter a valid email address.', email)
  },
  password: {
    required: helpers.withMessage('Please make sure to provide a password.', required),
  },
}

const v$ = useVuelidate(rules, formData);

const handleSubmit = async () => {
  validationErrors.email = null;
  validationErrors.password = null;
  const result = await v$.value.$validate();

  if (result) {
    submit();
    return;
  }

  validationErrors.email = v$.value?.email?.$errors[0]?.$message;
  validationErrors.password = v$.value?.password?.$errors[0]?.$message;
};

const status = ref((route.query.reset ?? "").length > 0 ? atob(route.query.reset) : "");

const {submit, inProgress, validationErrors: errors} = useSubmit(() => {
      status.value = "";
      return login(formData);
    },
    {
      onSuccess: async (response) => {
        if (response?.code === 200) {
          if (projectStore?.invitationIdentifyNumber) {
            if (projectStore?.userIdentifyNumber === user?.value?.identify_number) {
              await navigateTo(`/invitation?invite_identify=${projectStore.invitationIdentifyNumber}`);
              return;
            }
          }
          if (user.value?.project_identify) {
            await navigateTo(`/projects/${user.value?.project_identify}`);
          } else {
            await navigateTo(`/projects/`);
          }
          toast.success("Successful login! Welcome back." || response.message, {});
          OneSignal.Slidedown.promptPush({force: true});
          return;
        } else if (response.code === 1200) {
          await navigateTo(`/welcome?identify_number=${response?.data?.identify_number}`);
          toast.success("Finalize your account. Instructions are waiting in your inbox." || response.message, {});
          return;
        }
      },
      onError: (error) => {
        if (error.data.code === 400) {
          toast.error("Incorrect email or password. Please verify your credentials!", {});
        } else if (error.data.code === 429) {
          toast.error("Maximum attempts reached. Please retry later." || error.data.message, {})
        } else if (error.data.code === 1400) {
          toast.warning("We've previously sent you an email that is still valid. Please check your inbox." || error.data.message, {});
        }
      },
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
                  <h1 class="text-dark fw-bolder mb-3">Log in</h1>
                  <div class="text-gray-500 fw-semibold fs-6">
                    Your Social Campaigns
                  </div>
                </div>

                <FormInput v-model:input="formData.email" type="text" placeholder="test@test.com" autocomplete="off"
                           labelText="Email address"
                           name="email"
                           :formDataError="validationErrors.email || errors?.email"
                           class="mb-7"
                />

                <FormInput v-model:input="formData.password" type="password" placeholder="password" autocomplete="off"
                           labelText="Password"
                           name="password"
                           :formDataError="validationErrors.password || errors?.password"
                />
                <div class="text-end">
                  <NuxtLink to="/forget-password"
                            class="d-inline-block mt-1 mb-7 text-muted text-end cursor-pointer user-select-none forget-password-style">
                    Forget password?
                  </NuxtLink>
                </div>

                <div class="d-grid mb-10">
                  <button :disabled="inProgress" type="submit" id="kt_sign_in_submit"
                          class="btn btn-primary btn-hover">
                    <img v-if="inProgress" src="~/assets/media/misc/spinner.gif" width="16">
                    <span v-else class="indicator-label">Log in</span>
                  </button>
                </div>
                <div class="text-gray-500 text-center fw-semibold fs-6">
                  Not a Member yet?
                  <nuxt-link to="/join" class="link-primary">Join us</nuxt-link>
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
                src="../assets/media/illustrations/misc/login.svg"
                alt="join photo"
            />
            <h1
                class="d-none d-lg-block text-white fs-2qx fw-bolder text-center mb-7"
            >
              Fast, Efficient and Productive
            </h1>
            <div class="d-none d-lg-block text-white fs-base text-center w-75">
              Welcome back to Taskat! Your tasks and goals await. Log in now to access your personalized
              workspace, streamline your to-dos, and experience a new level of productivity. Let's continue this journey
              together.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.forget-password-style:hover {
  text-decoration: underline !important;
}
</style>
