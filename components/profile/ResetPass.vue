<script setup>
import useVuelidate from "@vuelidate/core";
import {required, helpers, minLength} from "@vuelidate/validators";
import {useAuth} from "~/composables/useAuth";
import {useToast} from "vue-toastification";

const toast = useToast();
const route = useRoute();
const router = useRouter();
const {changePassword} = useAuth();

const formData = reactive({
  old_password: "",
  password: "",
  password_confirmation: "",
});

const validationErrors = reactive({
  old_password: null,
  password: null,
  password_confirmation: null,
});

const mustMatch = (value) => formData.password_confirmation === formData.password;
const mustContainsLettersNumbers = (value) => /^(?=.*[a-zA-Z])(?=.*[0-9]).+$/.test(value);

const rules = {
  old_password: {
    required: helpers.withMessage('Old Password Is Required', required),
  },
  password: {
    required: helpers.withMessage('New Password Is Required', required),
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
  validationErrors.old_password = null;
  validationErrors.password = null;
  validationErrors.password_confirmation = null;
  const result = await v$.value.$validate();

  if (result) {
    await submit();
    return;
  }

  validationErrors.old_password = v$.value?.old_password?.$errors[0]?.$message;
  validationErrors.password = v$.value?.password?.$errors[0]?.$message;
  validationErrors.password_confirmation = v$.value?.password_confirmation?.$errors[0]?.$message;
}

const {submit, inProgress, validationErrors: errors} = useSubmit(() => {
  return changePassword(route?.params?.userId, formData)
}, {
  onSuccess: async (response) => {
    if (response?.code === 200) {
      toast.success(response?.message);
      emits('discard');
    }
  },
  onError: (error) => {
    if (error.data.code === 400) {
      validationErrors.old_password = error.data.message
    } else if (error.data.code === 1400) {
      validationErrors.password = error.data.message;
    } else if (error.data.code === 2400) {
      toast.info(error.data.message, {});
      emits('discard');
    }
  },
})
const emits = defineEmits(["discard"]);
</script>

<template>
  <div class="card">
    <div class="card-header border-0 cursor-pointer">
      <div class="card-title m-0">
        <h3 class="fw-bold m-0">Reset Password</h3>
      </div>
    </div>
    <div id="kt_account_settings_profile_details" class="collapse show">
      <form @submit.prevent="handleSubmit" class="form">
        <div class="card-body border-top p-9">
          <div class="row mb-6">
            <label class="col-lg-4 col-form-label required fw-semibold fs-6">Old Password</label>
            <div class="col-lg-8">
              <FormInput type="password" autocomplete="off" labelText="Old Password" name="old_password"
                         placeholder="Old Password"
                         v-model:input="formData.old_password"
                         :formDataError="validationErrors.old_password || errors?.old_password"
              />
            </div>
          </div>
          <div class="row mb-6">
            <label class="col-lg-4 col-form-label required fw-semibold fs-6">New Password</label>
            <div class="col-lg-8">
              <FormInput type="password" autocomplete="off" labelText="New Password" name="password"
                         placeholder="New Password"
                         v-model:input="formData.password"
                         :formDataError="validationErrors.password || errors?.password"
              />
            </div>
          </div>
          <div class="row mb-6">
            <label class="col-lg-4 col-form-label required fw-semibold fs-6">Confirm New Password</label>
            <div class="col-lg-8">
              <FormInput type="password" autocomplete="off" labelText="Confirm New Password"
                         name="password_confirmation"
                         placeholder="Confirm New Password"
                         v-model:input="formData.password_confirmation"
                         :formDataError="validationErrors.password_confirmation || errors?.password_confirmation"
              />
            </div>
          </div>
        </div>
        <div class="card-footer d-flex justify-content-end">
          <button type="button" @click.prevent="emits('discard')" class="btn btn-light btn-active-light-primary me-2">Discard</button>
          <button :disabled="inProgress" type="submit"
                  class="btn btn-primary">
            <img v-if="inProgress" src="~/assets/media/misc/spinner.gif" width="16">
            <span v-else class="indicator-label">Reset Password</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
