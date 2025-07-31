<script setup>
import {useAppStore} from "~/stores/useAppStore";
import {useToast} from "vue-toastification";

definePageMeta({
  layout: "none"
});
useHead({
  title: "Welcome"
})

// ======= Data ======= //
const {checkIdentify, join} = useAuth()
const toast = useToast();
const appStore = useAppStore();

// ======= hooks ======= //
const route = useRoute();
const router = useRouter();

const isLoading = ref(false);
const requestCount = ref(3);
const identifyNumber = ref(route.query.identify_number);
const welcomeInfo = reactive({
  email: '',
});

const checkIdentifyNumber = async (inum) => {
  isLoading.value = true;

  try {
    const {data, countOfRequest, code} = await checkIdentify({identify_number: inum});
    if (code === 200) {
      welcomeInfo.email = data.email || '';
      requestCount.value = requestCount.value - countOfRequest;
      return;
    }
  } catch (error) {
    if (error.response?.status === 400) {
      toast.error("Invalid identify number!");
      await navigateTo("/join");
    }
  } finally {
    setTimeout(() => {
      isLoading.value = false;
    }, 1000);
  }
};

const {submit, inProgress, validationErrors: errors} = useSubmit(
    () => join({email: welcomeInfo.email}),
    {
      onSuccess: async (response) => {
        if (response.code === 200) {
          requestCount.value--;
          toast.success(response.message, {});
          const identifyNumberToUse = response.identify_number || identifyNumber.value;
          await navigateTo(`/welcome?identify_number=${identifyNumberToUse}`);
        }
      },
      onError: async (error) => {
        if (error.response?.status === 429) {
          toast.error(error.response.data.message, {});
          await navigateTo("/join");
        } else if (error.data?.code === 1400) {
          const errorMsg = error.data.message || "We've previously sent you an email that is still valid. Please check your inbox.";
          toast.warning(errorMsg, {});
        }
      },
    }
);

onBeforeMount(async () => {
  if (!route.query.identify_number) {
    await navigateTo("/login");
  } else {
    checkIdentifyNumber(route.query.identify_number);
  }
});

</script>

<template>
  <PageLoading v-if="isLoading"/>
  <div v-else class="page-background">
    <div class="d-flex flex-column vh-100 mh-100 justify-content-center mx-auto w-500 text-center">
      <div class="d-flex flex-column mx-auto bg-white shadow box-sizing-border-box text-dark"
           style="width: 400px; padding: 25px 40px; border-radius: 3px;">
        <div class="d-flex flex-column align-items-center text-center custom-img">
          <img src="../assets/media/logos/logo-dark.png" width="200">
          <div class="d-flex flex-column pt-24px align-items-center">
            <h5 class="fw-bold text-16 text-gray-700 line-height-20">Check your inbox to log in</h5>
          </div>
          <img src="../assets/media/email/email.svg" style="height: 88px; margin: 8px 0px 16px;">
        </div>
        <div class="text-center info">
          <p class="mb-1">To complete setup and log in, click the verification link in the email we’ve sent to</p>
          <h6 class="mb-0">{{ welcomeInfo?.email }}</h6>
        </div>
        <div v-if="requestCount !== 0" class="resend-button mt-5">
          <button v-if="!inProgress" class="bg-transparent border-0 text-primary" @click="submit">Resend verification
            email
          </button>
          <span v-else>Resending email <img src="~/assets/media/misc/spinner.gif" width="18"></span>
        </div>
        <div class="pt-4 border-top border-gray-600 mt-4">
          <p v-if="requestCount !== 0">You have only <b class="text-primary">{{ requestCount }}</b>
            attempts left to resend the email.</p>
          <p v-else>You have used up all your chances to try sending the email again!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.custom-img img {
  margin: 8px 0px 16px;
}

.resend-button button:hover {
  text-decoration: underline;
}
</style>

<!--"Email sent, Please check your inbox to complete your account!"-->