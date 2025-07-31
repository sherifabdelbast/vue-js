<template>
  <div
      v-if="appStore.isMobile"
      id="mobile-error-view"
      class="landing-hero-bg d-flex align-items-center justify-content-center"
  >
    <Error
        message="Taskat Softwatre Does Not Allowed for mobile devices"
        errType="mobile"
    />
  </div>
  <div v-else>
    <NuxtLoadingIndicator/>
    <NuxtLayout>
      <NuxtPage/>
    </NuxtLayout>
  </div>
  <Transition name="issueDetails">
    <IssueDetails v-if="isOpen" :toggleView="toggleView"/>
  </Transition>
</template>

<script setup>
// if the page have title put it and add "- Taskat", if not
import {useProjectStore} from "~/stores/useProjectStore";

const route = useRoute();
const router = useRouter();
useHead({
  titleTemplate: (title) => (title ? `${title} - Taskat` : "Taskat"),
  script: [
    {
      async: true,
      src: "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js",
      defer: true,
    }
  ]
});

// ====== stores ====== //
import {useAppStore} from "./stores/useAppStore";

const appStore = useAppStore();
const projectStore = useProjectStore();
const {user} = useAuth();
// ====== methods ====== //
// check if the window size is less than 768 to stop the app
const checkScreen = () => {
  if (window.innerWidth <= 768) {
    appStore.isMobile = true;
    return;
  }

  appStore.isMobile = false;
};

// ====== hooks ====== //
onBeforeMount(() => {
  // check screen size before mount the app
  checkScreen();

  // check screen size on resize app window
  window.addEventListener("resize", checkScreen);
});

const isOpen = ref(false);
const toggleView = () => {
  isOpen.value = !isOpen.value;
  if (!isOpen.value) {
    router.push({query: null})
  }
};
onMounted(async () => {
  if (route.query.issue_details && user.value) {
    isOpen.value = true;
    await projectStore.refreshIssueDetails(route.params.id, route.query.issue_details);
  }
})
</script>

<style>
.issueDetails-enter-active,
.issueDetails-leave-active {
  transition: all 0.3s ease;
}

.issueDetails-enter-from,
.issueDetails-leave-to {
  right: -100% !important;
}

#mobile-error-view {
  padding: 0 15px;
  min-height: 100vh;
  min-width: 100%;
  background-image: url("./assets/media/auth/bg14.jpg");
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}

.ghost {
  background-color: var(--bs-gray-200);
}

.ghost > div {
  visibility: hidden;
}
</style>