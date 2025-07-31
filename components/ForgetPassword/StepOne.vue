<script setup>
import {email, helpers, required} from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import {useToast} from "vue-toastification";
import {useAppStore} from "~/stores/useAppStore";

const toast = useToast();
const {forgotPassword} = useAuth();
const router = useRouter();
const route = useRoute();
const appStore = useAppStore();

const formData = reactive({
  email: ""
});
const validationErrors = reactive({
  email: ""
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

const {submit, inProgress, validationErrors: errors} = useSubmit(async () => forgotPassword(formData), {
      onSuccess: async (response) => {
        if (response.code === 200) {
          localStorage.setItem('identifyNumberForgetPassword', response.identify_number);
          await router.push({
            path: "/forget-password/",
            query: {
              identify_number: response.identify_number,
            }
          })
          toast.success("We sent to you an email containing a verification code." || response.message, {});
        }
      },
      onError: async (error) => {
        if (error.data.code === 400) {
          toast.error("Email not valid. Please make sure to provide an valid email address." || error.data.message, {});
        } else if (error.data.code === 429) {
          toast.error(error.data.message, {});
          await navigateTo("/login")
        } else if (error.data.code === 1400) {
          localStorage.setItem('identifyNumberForgetPassword', error.data.identify_number);
          await router.push({
            path: "/forget-password/",
            query: {
              identify_number: error.data.identify_number,
            }
          })
          toast.info("We have sent you a previous email containing a verification code." || error.data.message, {});
        }
      }
    }
);

const storedIdentifyNumber = localStorage.getItem('identifyNumberForgetPassword');
if (storedIdentifyNumber) {
  router.push({
    path: "/forget-password/",
    query: {
      identify_number: storedIdentifyNumber,
    }
  })
} else {
  router.push({
    query: {
      identify_number: undefined,
    }
  })
}
</script>

<template>
  <div
      class="d-flex flex-column flex-lg-row-fluid w-lg-50 p-10 order-2 order-lg-1"
      v-if="!route.query.identify_number && !storedIdentifyNumber"
  >
    <div class="d-flex flex-center flex-column flex-lg-row-fluid">
      <div class="w-500px p-10">
        <form class="form w-100" @submit.prevent="handleSubmit">
          <div class="text-center mb-11">
            <h1 class="text-dark fw-bolder mb-3">Forget Password</h1>
          </div>

          <FormInput v-model:input="formData.email" type="text" placeholder="test@test.com" autocomplete="off"
                     labelText="Email address"
                     name="email"
                     :formDataError="validationErrors.email || errors?.email"
                     class="mb-7"
          />
          <div class="d-grid mb-5">
            <button :disabled="inProgress" type="submit" id="kt_sign_in_submit"
                    class="btn btn-primary btn-hover">
              <img v-if="inProgress" src="~/assets/media/misc/spinner.gif" width="16">
              <span v-else class="indicator-label">Send</span>
            </button>
          </div>
          <div class="text-gray-500 text-center fw-semibold fs-6">
            <nuxt-link to="/login" class="link-primary">Go back to login?</nuxt-link>
          </div>
        </form>
      </div>
    </div>
  </div>
  <ForgetPasswordStepTwo v-if="route.query.identify_number"/>
</template>
