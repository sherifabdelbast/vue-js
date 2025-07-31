<script setup>
import {helpers, minLength, required} from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import {useAppStore} from "~/stores/useAppStore";
import {useToast} from "vue-toastification";


const {resetPassword} = useAuth();
const appStore = useAppStore();
const route = useRoute();
const toast = useToast();

const storedIdentifyNumber = localStorage.getItem('identifyNumberForgetPassword');
if (storedIdentifyNumber !== route.query.identify_number) {
  navigateTo("/login");
}

const formData = reactive({
  password: null,
  password_confirmation: null,
  identify_number: route.query.identify_number,
});
const validationErrors = reactive({
  password: null,
  password_confirmation: null,
});
const mustMatch = (value) => formData.password_confirmation === formData.password;
const mustContainsLettersNumbers = (value) => /^(?=.*[a-zA-Z])(?=.*[0-9]).+$/.test(value);

const rules = {
  password: {
    required: helpers.withMessage('Password Is Required', required),
    minLength: helpers.withMessage('Password must be more than 8 characters', minLength(8)),
    mustContainsLettersNumbers: helpers.withMessage('Password must contains letters and numbers', mustContainsLettersNumbers),
  },
  password_confirmation: {
    required: helpers.withMessage('Confirm Password Is Required', required),
    sameAs: helpers.withMessage("Confirm password doesn't match the password", mustMatch),
  },
}
const v$ = useVuelidate(rules, formData);

const handleSubmit = async () => {
  validationErrors.password = null;
  validationErrors.password_confirmation = null;
  const result = await v$.value.$validate();

  if (result) {
    await submit();
    return;
  }
  validationErrors.password = v$.value?.password?.$errors[0]?.$message;
  validationErrors.password_confirmation = v$.value?.password_confirmation?.$errors[0]?.$message;
}

const {submit, inProgress, validationErrors: errors} = useSubmit(() => {
  return resetPassword(formData)
}, {
  onSuccess: async (response) => {
    if (response?.code === 200) {
      await navigateTo("/login")
      toast.success(response?.message);
      localStorage.removeItem('operationFinished');
      localStorage.removeItem('identifyNumberForgetPassword');
    }
  },
  onError: (error) => {

  },
})
</script>

<template>
  <div
      class="d-flex flex-column flex-lg-row-fluid w-lg-50 p-10 order-2 order-lg-1"
  >
    <div class="d-flex flex-center flex-column flex-lg-row-fluid">
      <div class="w-500px p-10">
        <form class="form w-100" @submit.prevent="handleSubmit">
          <div class="text-center mb-11">
            <h1 class="text-dark fw-bolder mb-3">Reset Your Password</h1>
          </div>

          <FormInput v-model:input="formData.password" type="password" placeholder="password" autocomplete="off"
                     labelText="Password"
                     name="password"
                     :formDataError="validationErrors.password || errors?.password"
                     class="mb-7"
          />

          <FormInput v-model:input="formData.password_confirmation" type="password" placeholder="Confirm password"
                     autocomplete="off"
                     labelText="Confirm password"
                     name="password"
                     :formDataError="validationErrors.password_confirmation || errors?.password"
                     class="mb-7"
          />
          <div class="d-grid mb-10">
            <button :disabled="inProgress" type="submit" id="kt_sign_in_submit"
                    class="btn btn-primary btn-hover">
              <img v-if="inProgress" src="~/assets/media/misc/spinner.gif" width="16">
              <span v-else class="indicator-label">Change Password</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

