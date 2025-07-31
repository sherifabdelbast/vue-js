<script setup>
import moment from "moment";
import {useToast} from "vue-toastification";
import {useProjectStore} from "~/stores/useProjectStore";
import {usePostData} from "~/composables/usePostData";
import {useAuth} from "~/composables/useAuth";

definePageMeta({
  layout: "none",
});
useHead({
  title: "Invitation",
});

const {refresh, user} = useAuth();

// === Data === //
const {invitation, acceptInvitation} = usePostData();

const route = useRoute();
const router = useRouter();
const toast = useToast();
const projectStore = useProjectStore();

// === Handling Operation === //
const responseMessage = ref(null);
const info = ref(null);
const isLoading = ref(false);

const checkIdentifyNumber = async (inum) => {
  isLoading.value = true;
  try {
    const {data, code} = await invitation({invite_identify: inum});
    info.value = data;

    if (code === 200) {
      console.log("from 200");
      return;
    }
  } catch (error) {
    if (error?.data?.code === 1404) {
      responseMessage.value = "This invitation not found!" || error?.data?.message;
    } else if (error?.data?.code === 2400) {
      responseMessage.value = "Invitation Expired: This invitation has already been used and is no longer valid." || error?.data?.message;
    } else if (error?.data?.code === 1400) {
      responseMessage.value = "Invitation Expired: This invitation has already been used and is no longer valid." || error?.data?.message;
    } else if (error?.data?.code === 400) {
      projectStore.invitationIdentifyNumber = inum;
      projectStore.userIdentifyNumber = error?.data?.identify_number;
      toast.success("Please complete your account to accept the invitation." || error?.data?.message);
      await navigateTo(`/complete-registration?token=${error?.data?.token}`);
    } else if (error?.data?.code === 401) {
      projectStore.invitationIdentifyNumber = inum;
      projectStore.userIdentifyNumber = error?.data?.identify_number;
      toast.success("You need to be logged in to accept the invitation. Please log in to proceed." || error?.data?.message);
      await navigateTo("/login");
    }
  } finally {
    setTimeout(() => {
      isLoading.value = false;
    }, 2000);
  }
};

const data = reactive({
  accept: null,
  invite_identify: route?.query?.invite_identify,
});
const handalLoading = reactive({
  reject: false,
  accept: false,
});

// === methods === //
const handelAccept = (acceptValue) => {
  handalLoading.accept = true;
  data.accept = acceptValue;
  submit();
};
const handelReject = (acceptValue) => {
  handalLoading.reject = true;
  data.accept = acceptValue;
  submit();
};

const {submit, inProgress, validationErrors: errors} = useSubmit(() => acceptInvitation(data), {
      onSuccess: async (response) => {
        handalLoading.reject = false;
        handalLoading.accept = false;

        await refresh();

        if (response.code === 200) {
          const successMessage = response.message;
          toast.success(successMessage, {});

          await refresh();

          if (data.accept === 1) {
            isLoading.value = true;
            await navigateTo(`/projects/${response?.project?.project_identify}`);
            return;
          } else if (data.accept === 0) {
            isLoading.value = true;
            await navigateTo("/projects");
            return;
          }
        }
      },
      onError: async (error) => {
        handalLoading.reject = false;
        handalLoading.accept = false;
        if (error.response.status === 400) {
          toast.error("Bad Request!");
          await navigateTo("/projects");
          return;
        }
      },
    }
);

// === hooks === //
onBeforeMount(async () => {
  if (!route.query.invite_identify) {
    await navigateTo("/login");
  }
  checkIdentifyNumber(route.query.invite_identify);
});
</script>

<template>
  <PageLoading v-if="isLoading"/>
  <BaseLayout v-else-if="responseMessage" :message="responseMessage"/>
  <div v-else class="page-background">
    <div class="d-flex flex-column flex-root vh-100" id="kt_app_root">
      <div class="d-flex flex-column flex-center flex-column-fluid">
        <div class="d-flex flex-column flex-center text-center p-10">
          <div class="card card-flush mb-10 w-md-650px">
            <div class="card-header pt-9">
              <div class="d-flex align-items-center">
                <div class="symbol symbol-50px me-5">
                  <img :src="info?.project?.url_icon ? info?.project?.url_icon : '/blank-project.png'">
                </div>
                <div class="flex-grow-1 text-start">
                  <div class="text-gray-800 text-hover-primary fs-4 fw-bold">{{ info?.project?.name }}</div>
                  <div class="text-gray-400 fw-semibold d-block">{{
                      moment(info?.created_at).format("lll")
                    }}
                  </div>
                </div>
              </div>
              <div class="card-toolbar">
                <div class="m-0">
                  <button class="btn btn-icon btn-color-gray-400 btn-active-color-primary me-n4"
                          data-toggle="tooltip" data-placement="top" :title="info?.project?.name || '-'">
                    <i class="ki-outline ki-information fs-1"></i>
                  </button>
                </div>
              </div>
            </div>
            <div v-if="info?.project?.description" class="card-body">
              <div class="fs-6 fw-normal text-gray-700 text-start border-bottom pb-6">
                {{ info?.project?.description }}
              </div>
            </div>
            <div class="card-footer pt-0" :class="{'mt-10': !info?.project?.description }">
              <div class="collapse show" id="kt_social_feeds_comments_2" style="">
                <div class="d-flex gap-2">
                  <Avatar :user="info?.user" imgWidth="45"/>
                  <div class="d-flex flex-column flex-row-fluid">
                    <div class="d-flex align-items-center flex-wrap mb-0">
                      <div class="text-gray-800 text-hover-primary fw-bold me-6">{{ info?.user?.name }}</div>
                      <a href="#" class="ms-auto text-gray-400 text-hover-primary fw-semibold fs-7">{{
                          // moment(info?.project?.created_at, "YYYYMMDD").fromNow()
                          info?.user?.email
                        }}</a>
                    </div>
                    <span class="text-gray-800 fs-7 fw-normal pt-1 text-start">{{ info?.message }}</span>
                  </div>
                </div>
              </div>
              <div class="mt-8 border-top pt-6">
                <button @click="handelReject(0)" :disabled="handalLoading.accept" type="submit"
                        id="kt_sign_in_submit"
                        class="btn btn-light-danger btn-flex btn-center btn-sm cursor-pointer">
                  <img v-if="handalLoading.reject" src="../assets/media/misc/spinner.gif" width="16"
                       style="filter: invert(1)">
                  <div class="d-flex align-items-center gap-1" v-else>
                    <i class="ki-duotone ki-abstract-11">
                      <i class="path1"></i>
                      <i class="path2"></i>
                    </i>
                    <span>Reject</span>
                  </div>
                </button>
                <button @click="handelAccept(1)"
                        :disabled="handalLoading.accept" type="submit"
                        id="kt_sign_in_submit"
                        class="btn btn-light-primary btn-flex btn-center btn-sm cursor-pointer ms-5">
                  <img v-if="handalLoading.accept" src="../assets/media/misc/spinner.gif" width="16"
                       style="filter: invert(1)">
                  <div class="d-flex align-items-center gap-1" v-else>
                    <i class="ki-duotone ki-double-check">
                      <i class="path1"></i>
                      <i class="path2"></i>
                    </i>
                    <span>Accept</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>