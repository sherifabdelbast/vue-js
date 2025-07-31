<script setup>
import {useProjectStore} from "~/stores/useProjectStore";
import {storeToRefs} from "pinia";
import {useAppStore} from "~/stores/useAppStore";

definePageMeta({
  middleware: "auth"
});
useHead({
  title: "Your Work"
});

const {user} = useAuth();
const router = useRouter();
const route = useRoute();
const isLoading = ref(true);

const appStore = useAppStore();
const projectStore = useProjectStore();
const {allProjects, allIssues, assignedToIssues, issueDetails} = storeToRefs(projectStore);

await projectStore.refreshAllIssues(null);
await projectStore.refreshAllIssues(user.value?.id);
isLoading.value = false;

const activeTab = ref("all");

const cahngeTab = async (tabName) => activeTab.value = tabName;

const fetchIssueDetails = async (projectId, issueId) => {
  await appStore.refreshOutsideProjectsPermissions(projectId);
  appStore.permissionLocation = "out";
  await projectStore.refreshIssueDetails(projectId, issueId);
  await projectStore.refreshComments(projectId, issueId);
}

const refreshYourWork = async () => {
  await projectStore.refreshAllIssues(null);
  await projectStore.refreshAllIssues(user.value?.id);
};

const isOpen = ref(false);
const activeIssue = ref(-1);
const activateIssue = (issueId) => {
  activeIssue.value = issueId;
};
const toggleView = () => {
  isOpen.value = !isOpen.value;

  if (isOpen.value === false) {
    activeIssue.value = -1;
  }
};
</script>

<template>
  <div class="tabs-wrraper w-100 h-80px position-relative">
    <div class="app-container container-xxl h-100 d-flex align-items-end justify-content-between">
      <ul class="nav nav-tabs">
        <li @click="cahngeTab('all')" class="nav-item cursor-pointer fs-4">
          <div class="nav-link" :class="{'active': activeTab == 'all'}">All Issues</div>
        </li>
        <li @click="cahngeTab('assign')" class="nav-item cursor-pointer fs-4">
          <div class="nav-link" :class="{'active': activeTab == 'assign'}">Assigned To Me
            <span class="projects-count" v-if="assignedToIssues.length > 0">({{ assignedToIssues.length }})</span>
          </div>
        </li>
      </ul>
    </div>
  </div>
  <div class="app-container container-xxl">
    <div class="app-main flex-column flex-row-fluid" id="kt_app_main">
      <div class="d-flex flex-column flex-column-fluid">
        <div id="kt_app_content" class="app-content flex-column-fluid">
          <div v-if="activeTab === 'all'">
            <FilterGlobal from="yourWork"/>
          </div>
          <div class="card">
            <div class="card-header py-4">
              <div class="card-title">
                <div class="d-flex align-items-center position-relative my-1">
                  <h2>{{ activeTab == 'all' ? "Worked On" : "Assigned To Me" }}</h2>
                </div>
              </div>
              <div class="card-toolbar">
                <div class="d-flex justify-content-end" data-kt-customer-table-toolbar="base">
                  <span class="fs-5 fw-semibold">You're working on <span
                      class="fw-bold text-primary">({{ allProjects.length }})</span> projects</span>
                </div>
              </div>
            </div>
            <div class="card-body p-0 overflow-hidden">
              <div v-if="activeTab === 'all'">
                <SkeletonLoaderYourworkIssues v-if="isLoading || projectStore.isSearchLoading"/>

                <div v-else>
                  <div v-if="allIssues.length > 0" class="issues-wrraper">
                    <IssueShow @click="fetchIssueDetails(issue?.project_identify, issue?.id); activateIssue(issue?.id)"
                               v-for="(issue, index) in allIssues" :key="index" :index="index"
                               :issue="issue" :toggleView="toggleView"
                               :isActive="issue?.id === activeIssue"
                    />
                  </div>
                  <div v-else class="issues-wrraper">

                    <div class="alert bg-light-danger d-flex flex-column align-items-center flex-sm-row p-5 m-5">
                      <i class="ki-duotone ki-notification-bing fs-2hx text-danger me-4 mb-5 mb-sm-0"><span
                          class="path1"></span><span class="path2"></span><span class="path3"></span></i>

                      <div class="d-flex flex-column">
                        <h4 class="fw-semibold p-0 m-0">No issues found for the projects you works on.</h4>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else>
                <SkeletonLoaderYourworkIssues v-if="isLoading"/>
                <div v-else>
                  <div v-if="assignedToIssues.length > 0" class="issues-wrraper">
                    <IssueShow @click="fetchIssueDetails(issue?.project_identify, issue?.id); activateIssue(issue?.id)"
                               v-for="(issue, index) in assignedToIssues" :key="index" :index="index"
                               :issue="issue" :toggleView="toggleView"
                               :isActive="issue?.id === activeIssue"
                    />
                  </div>
                  <div v-else class="issues-wrraper">
                    <div class="alert bg-light-danger d-flex flex-column align-items-center flex-sm-row p-5 m-5">
                      <i class="ki-duotone ki-notification-bing fs-2hx text-danger me-4 mb-5 mb-sm-0"><span
                          class="path1"></span><span class="path2"></span><span class="path3"></span></i>

                      <div class="d-flex flex-column">
                        <h4 class="fw-semibold p-0 m-0">No issues assigned for you.</h4>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Transition name="issueDetails">
      <IssueDetails v-if="isOpen"
                    :toggleView="toggleView"
                    @issueUpdated="refreshYourWork"
                    :refreshYourWork="refreshYourWork"
                    :projectId="issueDetails?.project_identify"
      />
    </Transition>
  </div>
</template>

<style scoped>
.tabs-wrraper {
  background-color: var(--bs-app-header-base-bg-color);
}

.tabs-wrraper .nav {
  border: none;
}

.tabs-wrraper .nav-link {
  padding: 10px 16px;
}

.tabs-wrraper .nav-link,
.tabs-wrraper .nav-link span {
  border: none;
  font-weight: 500;
  position: relative;
  color: var(--bs-light) !important;
  transition: all 0.3s ease;
}

.tabs-wrraper .nav-link:hover,
.tabs-wrraper .nav-link:hover span {
  color: var(--bs-primary) !important;
  font-weight: 500;
}

.tabs-wrraper .nav-link.active,
.tabs-wrraper .nav-link.active span {
  color: var(--bs-primary) !important;
}

.tabs-wrraper .nav-link.active {
  background: var(--bs-app-bg-color);
}

.issueDetails-enter-active,
.issueDetails-leave-active {
  transition: all 0.3s ease;
}

.issueDetails-enter-from,
.issueDetails-leave-to {
  right: -100% !important;
}

.issues-wrraper > div:last-child {
  border: none !important;
}
</style>