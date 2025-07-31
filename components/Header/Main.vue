<script setup>
import {useAppStore} from "~/stores/useAppStore";
import {useProjectStore} from "~/stores/useProjectStore";
import {storeToRefs} from "pinia";
import {useGetData} from "~/composables/useGetData";

const route = useRoute();

// === stores === //
const appStore = useAppStore();
const projectStore = useProjectStore();
const {allIssues} = storeToRefs(projectStore);
const {user} = useAuth();

await projectStore.refreshProjects();

const isAccountMenu = ref(false);
const isProjectMenu = ref(false);
const isNotificationsOpen = ref(false);
const isSearchOpen = ref(false);
const isLoadingIssue = ref(false);
const isSearching = ref(false);
const filteredIssues = ref([]);
const searchText = ref('');
const isOpen = ref(false);

const toggleNotifications = async () => {
  isNotificationsOpen.value = !isNotificationsOpen.value;

  if (isNotificationsOpen.value) {
    appStore.isNotificationsLoading = true;
    await appStore.refreshUserNotifications(false);
    appStore.isNotificationsLoading = false;
  }
}

const closeNotifications = () => isNotificationsOpen.value = false;

const toggleSearch = async () => {
  isLoadingIssue.value = true;

  isSearchOpen.value = !isSearchOpen.value;

  if (issuesToDisplay.value.length !== 0 && isSearchOpen.value === false) {
    isLoadingIssue.value = false;
    return;
  }

  await projectStore.refreshAllIssues(null);
  isLoadingIssue.value = false;
};
const handleSearchInput = event => {
  searchText.value = event.target.value;
  filterIssues();
};
const filterIssues = () => {
  const searchTerm = searchText.value.toLowerCase();
  filteredIssues.value = allIssues.value.filter(issue =>
      issue.title.toLowerCase().includes(searchTerm)
  );
};

const issuesToDisplay = computed(() =>
    searchText.value ? filteredIssues.value : allIssues.value
)
const fetchIssueDetails = async (projectId, issueId) => {
  await appStore.refreshOutsideProjectsPermissions(projectId);
  appStore.permissionLocation = "out";
  await projectStore.refreshIssueDetails(projectId, issueId);
};
const handleScroll = () => {
  isSearchOpen.value = false;
};

const closeSearchInput = () => isSearchOpen.value = false;

const toggleView = () => {
  isOpen.value = !isOpen.value;
  searchText.value = "";
};
const refreshYourWork = async () => {
  await projectStore.refreshAllIssues(null);
};

onMounted(() => window.addEventListener('scroll', handleScroll));
</script>

<template>
  <div class="d-flex flex-column flex-root app-root sticky-top" id="kt_app_root">
    <div class="app-page flex-column flex-column-fluid" id="kt_app_page">
      <div id="kt_app_header" class="app-header h-70px" data-kt-sticky="true">
        <div class="app-container container-xxl d-flex align-items-stretch justify-content-between"
             id="kt_app_header_container">
          <div class="d-flex align-items-center d-lg-none ms-n2 me-2" title="Show sidebar menu">
            <div class="btn btn-icon btn-active-color-primary w-35px h-35px" id="kt_app_header_menu_toggle">
              <i class="ki-outline ki-abstract-14 fs-2 text-white"></i>
            </div>
          </div>
          <div class="d-flex align-items-center flex-grow-1 flex-lg-grow-0 me-lg-15">
            <NuxtLink to="/projects">
              <img alt="Logo" src="~/assets/media/logos/logo-light.png" class="logo-sticky h-20px h-lg-35px h-sm-35px"/>
            </NuxtLink>
          </div>
          <div class="d-flex align-items-stretch justify-content-between flex-lg-grow-1" id="kt_app_header_wrapper">
            <div class="app-header-menu app-header-mobile-drawer align-items-stretch">
              <div
                  class="menu menu-rounded menu-active-bg menu-state-primary menu-column menu-lg-row menu-title-gray-700 menu-icon-gray-500 menu-arrow-gray-500 menu-bullet-gray-500 my-5 my-lg-0 align-items-stretch fw-semibold px-2 px-lg-0"
                  id="kt_app_header_menu" data-kt-menu="true">
                <div :class="{'here': route.name !== 'your-work'}"
                     class="menu-item menu-here-bg menu-lg-down-accordion me-0 me-lg-2 position-relative"
                     @mouseover="isProjectMenu = true" @mouseleave="isProjectMenu = false">
                  <span class="menu-link">
                    <span class="menu-title me-1 fw-bold">Projects</span>
                    <span><Icon name="ic:outline-keyboard-arrow-down" size="22"/></span>
                  </span>
                  <HeaderProjectsMenu :isProjectMenu="isProjectMenu"/>
                </div>
                <div :class="{'here': route.name == 'your-work'}" class="menu-item menu-here-bg me-0 me-lg-2">
                  <NuxtLink to="/your-work" class="menu-link">
                    <span class="menu-title me-1 fw-bold">Your Work</span>
                  </NuxtLink>
                </div>
              </div>
            </div>
            <div class="app-navbar flex-shrink-0">
              <div class="app-navbar-item ms-5 position-relative">
                <div v-if="route.name !== 'your-work'" v-click-outside="closeSearchInput" id="searchMenu" class="d-flex align-items-center">
                  <div class="d-flex d-lg-none align-items-center position-relative">
                    <div class="btn btn-icon btn-active-light-primary"></div>
                  </div>
                  <form class="d-none d-lg-block w-100 position-relative mb-5 mb-lg-0" @submit.prevent>
                    <Icon name="ic:outline-search"
                          class="ki-duotone ki-magnifier fs-2 fs-lg-1 text-gray-500 position-absolute top-50 translate-middle-y ms-5"/>
                    <input type="text" @input="handleSearchInput" @click="toggleSearch"
                           class="form-control form-control-solid w-250px ps-14 custom-search-input text-white"
                           name="search"
                           :value="searchText"
                           :class="{'show' : isSearchOpen}"
                           id="inputValue"
                           autocomplete="off"
                           placeholder="Search..."
                    />
                    <div v-if="isLoadingIssue" class="text-center position-absolute top-50 translate-middle-y me-5"
                         style="right: 0;">
                      <Icon name="svg-spinners:180-ring-with-bg" class="text-white" size="15"/>
                    </div>
                    <div v-if="isSearching" class="text-center position-absolute top-50 translate-middle-y me-5"
                         style="right: 0;">
                      <Icon name="svg-spinners:180-ring-with-bg" size="15"/>
                    </div>
                    <span class="position-absolute top-50 end-0 translate-middle-y lh-0 d-none me-6"
                          data-kt-search-element="spinner">
                        <span class="spinner-border h-15px w-15px align-middle text-gray-400"></span>
                    </span>
                    <span
                        class="btn btn-flush btn-active-color-primary position-absolute top-50 end-0 translate-middle-y lh-0 me-5 d-none"
                        data-kt-search-element="clear">
                    </span>
                  </form>
                  <div v-if="!isLoadingIssue"
                       class="menu menu-sub menu-sub-dropdown w-300px w-md-400px py-7 px-5 test overflow-hidden"
                       :class="{'show' : isSearchOpen}"
                       style="z-index: 107; position: fixed; top: 70px; margin: 0px;"
                  >
                    <div class="wrapper">
                      <div class="categories border-bottom">
                        <div class="btn btn-primary rounded-pill mb-2 me-1 py-2 px-4">All Issue</div>
<!--                        <div class="btn btn-light-primary rounded-pill mb-2 me-1 py-2 px-4">Members</div>-->
                      </div>
                      <div class="recently-viewed mt-4">
                        <div class="scroll-y mh-200px mh-lg-325px">
                          <SearchGlobal @click="fetchIssueDetails(issue?.project?.project_identify, issue?.id)"
                                        v-for="(issue, index) in issuesToDisplay" :key="index" :index="index"
                                        :issue="issue"
                                        :toggleView="toggleView"
                                        :isOpen="isOpen"
                                        :toggleSearch="toggleSearch"
                          />
                          <div v-if="issuesToDisplay.length === 0">
                            <div class="alert d-flex flex-column justify-content-center align-items-center text-center flex-sm-row p-3 m-0">
                              <Icon name="ic:sharp-search-off"
                                    class="ki-duotone ki-notification-bing fs-2hx me-3 mb-5 mb-sm-0"/>
                              <div class="d-flex flex-column">
                                <h4 class="fw-semibold text-muted p-0 m-0">No issue found with the provide title.</h4>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="preferences"></div>
                  </div>
                </div>
                <div v-click-outside="closeNotifications" class="position-relative d-flex align-items-center justify-content-center px-6">
                  <div @click="toggleNotifications">
                    <div class="btn btn-icon btn-color-white btn-active-color-primary w-35px h-35px w-md-40px h-md-40px position-relative">
                      <i class="ki-outline ki-notification-on fs-1" :class="{'text-primary': isNotificationsOpen}"></i>
                      <span v-if="user?.count_of_notifications > 0 && user?.count_of_notifications <= 99" class="position-absolute translate-middle badge badge-danger rounded-pill" style="top: 8px; left: 10px;">
                        {{ user?.count_of_notifications }}
                      </span>
                      <span v-else-if="user?.count_of_notifications > 99" class="position-absolute translate-middle badge badge-danger rounded-pill" style="top: 8px; left: 10px;">
                        +99
                      </span>
                    </div>
                  </div>

                  <HeaderNotifications :isNotificationsOpen="isNotificationsOpen"/>
                </div>

                <div class="position-relative h-100 d-flex align-items-center justify-content-end"
                     @mouseover="isAccountMenu = true" @mouseleave="isAccountMenu = false">
                  <Avatar :user="user" imgWidth="40" :class="user?.url_photo ? 'border border-3 border-primary' : '' "/>
                  <HeaderAccountMenu :user="user" :isAccountMenu="isAccountMenu"/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <ModalsSendInvitation v-can="'invite team'"/>
  <Transition name="issueDetails">
    <IssueDetails v-if="isOpen" :toggleView="toggleView" @issueUpdated="refreshYourWork"/>
  </Transition>
</template>

<style scoped>
.menu-item .menu-link span {
  transition: all 0.3s ease !important;
}

.items:last-of-type {
  margin-bottom: 0 !important;
}

.items .item {
  width: 100% !important;
}

.items .item span,
.items .item div {
  height: fit-content;
}

.items .item:hover {
  background-color: var(--bs-gray-100);
}

.form-control.custom-search-input {
  background: var(--bs-app-header-search-bg-color) !important;
  border-color: var(--bs-app-header-search-border-color) !important;
}
</style>