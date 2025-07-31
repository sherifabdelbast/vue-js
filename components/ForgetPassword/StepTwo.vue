<script setup>
import VOtpInput from "vue3-otp-input";
import {useAppStore} from "~/stores/useAppStore";
import {useToast} from "vue-toastification";

const {checkForgotPasswordCode} = useAuth();
const appStore = useAppStore();
const route = useRoute();
const router = useRouter();
const toast = useToast();

const storedValue = localStorage.getItem('operationFinished');
const operationFinished = ref(storedValue ? JSON.parse(storedValue) : false);
const storedIdentifyNumber = localStorage.getItem('identifyNumberForgetPassword');

if (storedIdentifyNumber !== route.query.identify_number) {
  navigateTo("/login");
}

const formData = reactive({
  code: null,
  identify_number: route.query.identify_number,
});

const otpInput = ref(null);
const bindModal = ref("");

const handleOnComplete = (value) => {
  formData.code = value;
};

const handleSubmit = async () => {
  submit();
};

const {submit, inProgress, validationErrors: errors} = useSubmit(async () => checkForgotPasswordCode(formData), {
      onSuccess: async (response) => {
        if (response.code === 200) {
          operationFinished.value = true;
          localStorage.setItem('operationFinished', JSON.stringify(operationFinished.value));
        }
      },
      onError: async (error) => {
        if (error.data.code === 400) {
          toast.error("Verification code not valid. Please make sure to provide an verification code." || error.data.message, {});
        } else if (error.data.code === 1400) {
          toast.error("Verification Code Already Used, Please wait 15 minutes and try again." || error.data.message, {});
          localStorage.removeItem('operationFinished');
          localStorage.removeItem('identifyNumberForgetPassword');
          await navigateTo("/login");
        }
      }
    }
);
</script>

<template>
  <div class="d-flex flex-column flex-lg-row-fluid w-lg-50 p-10 order-2 order-lg-1"
       v-if="route.query.identify_number && !operationFinished"
  >
    <div class="d-flex flex-center flex-column flex-lg-row-fluid">
      <div class="w-500px p-10">
        <form class="form w-100" @submit.prevent="handleSubmit">
          <div class="d-flex align-items-center justify-content-center flex-column gap-5 mb-11">
            <div class="rounded-circle bg-primary p-5" style="width:fit-content">
              <Icon name="bxs:check-shield" class="text-white" size="80"/>
            </div>
            <h1 class="text-dark fw-bolder mb-3">Verification Code</h1>
          </div>
          <div class="d-flex justify-content-center mb-7">
            <v-otp-input
                ref="otpInput"
                v-model:value="bindModal"
                input-classes="otp-input"
                :num-inputs="5"
                separator=""
                :should-auto-focus="true"
                input-type="letter-numeric"
                :conditionalClass="['one', 'two', 'three', 'four', 'five']"
                @on-complete="handleOnComplete"
            />
          </div>
          <div class="d-grid mb-10">
            <button :disabled="inProgress" type="submit" id="kt_sign_in_submit"
                    class="btn btn-primary btn-hover">
              <img v-if="inProgress" src="~/assets/media/misc/spinner.gif" width="16">
              <span v-else class="indicator-label">Send</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <ForgetPasswordStepThree v-if="route.query.identify_number && operationFinished"/>
</template>

<style>
.otp-input {
  width: 60px;
  height: 60px;
  padding: 5px;
  margin: 0 10px;
  font-size: 25px;
  border-radius: 4px;
  border: 2px solid gray;
  text-align: center;
  outline: none;
}

.otp-input.is-complete {
  background-color: #ffffff;
}

.otp-input::-webkit-inner-spin-button,
.otp-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.otp-input::placeholder {
  font-size: 25px;
  text-align: center;
  font-weight: 600;
}

.otp-input:focus {
  border: 3px solid var(--bs-primary);
}
</style>