<script setup>
import moment from "moment";
import {useAppStore} from "~/stores/useAppStore";
import {storeToRefs} from "pinia";
import {useProjectStore} from "~/stores/useProjectStore";
import {useToast} from "vue-toastification";

useHead({
  title: "Profile"
});

const router = useRouter();
const toast = useToast();

const {user} = useAuth();
const projectStore = useProjectStore();
const route = useRoute();

const appStore = useAppStore();
const {profile} = storeToRefs(appStore);

try {
  await appStore.refreshProfileDetails(route.params?.userId);
} catch (error) {
  toast.error(error?.data?.message);
  await navigateTo("/projects");
}

const activeTab = ref("view");
const profileStatus = ref("show");
const cahngeTab = (tabName) => activeTab.value = tabName;
const changeProfileStatus = (status) => profileStatus.value = status;

const getColor = (index) => {
  return projectStore.getColor(index)
};
</script>

<template>
  <div class="d-flex flex-column flex-root app-root">
    <div class="app-page flex-column flex-column-fluid">
      <div class="app-wrapper flex-column flex-row-fluid">
        <div class="app-container container-xxl">
          <div class="app-main flex-column flex-row-fluid">
            <div class="d-flex flex-column flex-column-fluid">
              <div id="kt_app_content" class="app-content flex-column-fluid">
                <div class="card mb-5 mb-xl-10">
                  <div class="card-body pt-9 pb-0">
                    <div class="d-flex flex-wrap flex-sm-nowrap">
                      <div class="me-7 mb-4">
                        <div class="symbol symbol-100px symbol-lg-160px symbol-fixed position-relative">
                          <img v-if="profile?.user?.url_photo" alt="Logo" :src="profile?.user?.url_photo"/>
                          <span v-else
                                class="symbol-label border border-2 text-primary fw-semibold text-uppercase user-select-none text-inverse-warning"
                                :style="{ backgroundColor: getColor(profile?.user?.id) }" style="font-size: 60px">{{
                              profile?.user?.name[0]
                            }}</span>
                        </div>
                      </div>
                      <div class="flex-grow-1">
                        <div class="d-flex justify-content-between align-items-start flex-wrap mb-2">
                          <div class="d-flex flex-column">
                            <div class="d-flex align-items-center mb-2">
                              <span class="text-gray-900 fs-2 fw-bold me-1">{{ profile?.user?.name }}</span>
                              <span>
                                <i class="ki-outline ki-verify fs-1 text-primary"></i>
                              </span>
                            </div>
                            <div class="d-flex flex-wrap fw-semibold fs-6 mb-4 pe-2">
                              <span v-if="profile?.user?.job_title"
                                    class="d-flex align-items-center text-gray-400 me-5 mb-2">
                                <i class="ki-outline ki-profile-circle fs-4 me-1"></i>{{ profile?.user?.job_title }}</span>
                              <span v-if="profile?.user?.location"
                                    class="d-flex align-items-center text-gray-400 me-5 mb-2">
                                <i class="ki-outline ki-geolocation fs-4 me-1"></i>{{ profile?.user?.location }}</span>
                              <span class="d-flex align-items-center text-gray-400 mb-2">
                                <i class="ki-outline ki-sms fs-4 me-1"></i>{{ profile?.user?.email }}</span>
                            </div>
                          </div>
                          <div class="d-flex my-4">
                            <button disabled class="btn btn-sm btn-primary me-3">
                              <i class="ki-duotone ki-message-notif fs-3">
                                <i class="path1"></i>
                                <i class="path2"></i>
                                <i class="path3"></i>
                                <i class="path4"></i>
                                <i class="path5"></i>
                              </i>
                              Send Message
                            </button>
                          </div>
                        </div>
                        <div class="d-flex flex-wrap flex-stack">
                          <div class="d-flex flex-column flex-grow-1 pe-8">
                            <div class="d-flex flex-wrap">
                              <div
                                  class="border border-gray-300 border-dashed rounded min-w-100px py-3 px-4 me-6 mb-3 text-center">
                                <div class="fs-2 fw-bold">{{ profile?.Projects }}</div>
                                <div class="fw-semibold fs-6 text-gray-400">Projects</div>
                              </div>
                              <div
                                  class="border border-gray-300 border-dashed rounded min-w-100px py-3 px-4 me-6 mb-3 text-center">
                                <div class="fs-2 fw-bold">{{ profile?.ActiveIssues }}</div>
                                <div class="fw-semibold fs-6 text-gray-400">Opened Issues</div>
                              </div>
                              <div
                                  class="border border-gray-300 border-dashed rounded min-w-100px py-3 px-4 me-6 mb-3 text-center">
                                <div class="fs-2 fw-bold">{{ profile?.issuesAssignToMe }}</div>
                                <div class="fw-semibold fs-6 text-gray-400">Assigned to me</div>
                              </div>
                            </div>
                          </div>
                          <div class="mt-3">
                            <span class="d-block py-2 px-4 bg-light-success rounded-1 fw-semibold fs-7 text-success">Joined At: {{ moment(profile?.user?.created_at).format("ll") }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <ul class="nav nav-stretch nav-line-tabs nav-line-tabs-2x border-transparent fs-5 fw-bold">
                      <li @click="cahngeTab('view')" class="nav-item mt-2">
                        <span class="nav-link text-active-primary text-hover-primary ms-0 me-10 py-5 cursor-pointer"
                              :class="{active: activeTab == 'view'}">Overview</span>
                      </li>
                      <li v-if="user.id === profile?.user?.id" @click="cahngeTab('reset')" class="nav-item mt-2">
                        <span class="nav-link text-active-primary text-hover-primary ms-0 me-10 py-5 cursor-pointer"
                              :class="{active: activeTab == 'reset'}">Reset Password</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div v-if="activeTab == 'view'" class="profileInfo">
                  <ProfileDetails v-if="profileStatus == 'show'" @statusChanged="changeProfileStatus('edit')"/>
                  <ProfileEdit v-else @statusChanged="changeProfileStatus('show')"/>
                </div>
                <div v-else>
                  <ProfileResetPass @discard="cahngeTab('view')"/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>