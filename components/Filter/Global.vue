<script setup>
import {useProjectStore} from "~/stores/useProjectStore";
import {storeToRefs} from "pinia";
import Avatar from "~/components/Avatar.vue";
import {useGetData} from "~/composables/useGetData";

const props = defineProps(["from", "filterRefresh"]);
const {user} = useAuth();
const {fetchAllProjectsStatuses} = useGetData();
const router = useRouter();
const route = useRoute();

const projectStore = useProjectStore();
const {
  allProjects,
  project,
  acceptedTeam,
  teamMembersYourWork,
  openedSprints,
  projectLabels,
  statuses
} = storeToRefs(projectStore);

// Get the current route path (you should adapt this based on your component structure)
const currentRoutePath = route.path;
// Check if the current route path already ends with a slash
const routePathWithSlash = currentRoutePath.endsWith('/') ? currentRoutePath : currentRoutePath + '/';

const searchText = ref(route.query.search);
const selectedMember = ref(route.query.assignee);
const selectedStatus = ref(route.query.status);
const selectedProject = ref(route.query.project);
const selectedSprint = ref(route.query.sprint);
const selectedLabel = ref(route.query.label);

const statusToShow = ref(null);
const labelToShow = ref(null);
const projectToShow = ref(null);
const sprintToShow = ref(null);
const isSearchLoading = ref(false);
const isFiltering = ref(false);

const filters = reactive({
  search: searchText,
  assignee: selectedMember,
  status: selectedStatus,
  project: selectedProject,
  sprint: selectedSprint,
  label: selectedLabel,
});

const handleFiltering = async () => {
  try {
    const queryParameters = ref([]);

    const addQueryParam = (paramName, filterValue) => {
      if (filters[paramName]) {
        queryParameters.value.push(`${paramName}=${filters[paramName]}`);
      }
      if (filterValue) {
        filterValue.value = filters[paramName];
      }
    };

    addQueryParam('search', searchText);
    addQueryParam('assignee', selectedMember);
    addQueryParam('status', selectedStatus);
    addQueryParam('project', selectedProject);
    addQueryParam('sprint', selectedSprint);
    addQueryParam('label', selectedLabel);

    isSearchLoading.value = true;

    isFiltering.value = queryParameters.value.length !== 0;

    // Refresh the issues based on the search query and filters
    if (queryParameters.value.length === 0) {
      projectStore.isSearchLoading = true;
      if (props.from === 'backlog') {
        await projectStore.refreshProjectBacklog(route.params.id);
      } else if (props.from === 'yourWork') {
        await projectStore.refreshAllIssues(route.params.id);
      } else if (props.from === 'board') {
        await projectStore.refreshProjectBoard(route.params.id);
        await projectStore.refreshAllIssues(route.params.id);
      }
      projectStore.isSearchLoading = false;
      return;
    }

    projectStore.isSearchLoading = true;
    if (props.from === 'backlog') {
      await projectStore.refreshProjectBacklog(route.params.id, queryParameters.value);
    } else if (props.from === 'yourWork') {
      await projectStore.refreshAllIssues(null, queryParameters.value);
    } else if (props.from === 'board') {
      await projectStore.refreshProjectBoard(route.params.id, queryParameters.value);
    }
    projectStore.isSearchLoading = false;

    // Update the list of filtered issues and route query
    await router.push({
      path: routePathWithSlash,
      query: Object.fromEntries(queryParameters.value.map(param => [param.split('=')[0], param.split('=')[1]])),
    });

    isSearchLoading.value = false;
  } catch (error) {
    isSearchLoading.value = false;
  }
}

const handleFilterSelection = async (paramName, paramValue, filterValue) => {
  if (route.query[paramName] == paramValue) {
    filters[filterValue] = '';
    if (paramName === 'status') statusToShow.value = null;
    if (paramName === 'project') projectToShow.value = null;
    if (paramName === 'sprint') sprintToShow.value = null;
    if (paramName === 'label') labelToShow.value = null;
    handleFiltering();
    await router.push({
      query: {
        search: searchText.value || undefined,
        assignee: selectedMember.value || undefined,
        [paramName]: undefined,
      },
    });
    return;
  }
  handleFiltering();
};
const selectMember = async (memberId) => {
  selectedMember.value = memberId;
  await handleFilterSelection('assignee', memberId, 'assignee');
};
const selectStatus = async (statusId) => {
  selectedStatus.value = statusId;
  await handleFilterSelection('status', statusId, 'status');
};
const selectProject = async (projectId) => {
  selectedProject.value = projectId;
  await handleFilterSelection('project', projectId, 'project');
};
const selectSprint = async (sprintId) => {
  selectedSprint.value = sprintId;
  await handleFilterSelection('sprint', sprintId, 'sprint');
};
const selectLabel = async (labelId) => {
  selectedLabel.value = labelId;
  await handleFilterSelection('label', labelId, 'label');
};


const status = ref(null);
if (props.from === 'yourWork') {
  status.value = await fetchAllProjectsStatuses();
  await projectStore.refreshAllYourWorkTeamMembers();
}

onBeforeMount(async () => {
  const {search, assignee, status, project, sprint, label} = route.query;
  const filters = [];

  if (search) filters.push(`search=${search}`);
  if (assignee) filters.push(`assignee=${assignee}`);
  if (status) filters.push(`status=${status}`);
  if (project) filters.push(`project_id=${project}`);
  if (sprint) filters.push(`sprint=${sprint}`);
  if (label) filters.push(`label=${label}`);

  isFiltering.value = filters.length !== 0;

  if (filters.length !== 0) {
    projectStore.isSearchLoading = true;
    if (props.from === 'backlog') {
      await projectStore.refreshProjectBacklog(route.params.id, filters);
    } else if (props.from === 'yourWork') {
      await projectStore.refreshAllIssues(null, filters);
    } else if (props.from === 'board') {
      await projectStore.refreshProjectBoard(route.params.id, filters);
    }
    projectStore.isSearchLoading = false;
  }
})
const clearFilters = () => {
  searchText.value = '';
  selectedMember.value = '';
  selectedStatus.value = '';
  selectedProject.value = '';
  selectedLabel.value = '';
  selectedSprint.value = '';
  statusToShow.value = null;
  labelToShow.value = null;
  projectToShow.value = null;
  sprintToShow.value = null;
  isFiltering.value = false;

  router.push({
    query: {
      search: undefined,
      assignee: undefined,
      status: undefined,
      sprint: undefined,
      project: undefined,
      label: undefined,
    },
  });
  handleFiltering();
}
</script>

<template>
  <div class="position-relative d-flex justify-content-between align-items-center gap-3 bg-body px-4 py-3 rounded-3"
       :class="from === 'yourWork' ? 'mb-12' : ''">
    <div class="position-relative d-flex align-items-center gap-5">
      <div class="position-relative search-input">
        <Icon name="ic:outline-search"
              class="ki-duotone ki-magnifier fs-2 fs-lg-1 text-gray-500 position-absolute top-50 translate-middle-y ms-5"/>
        <input type="text"
               v-model="searchText"
               @input="handleFiltering"
               class="form-control form-control-solid w-200px ps-14"
               name="search"
               placeholder="Search..."
        />
      </div>
      <div v-if="from === 'yourWork'">
        <Dropdown v-model="statusToShow"
                  :options="status.statuses"
                  @change="selectStatus(statusToShow)"
                  optionLabel=""
                  filter
                  placeholder="Filter by status"
                  class="w-full md:w-14rem"
                  overlayVisible="true"
                  :pt="{
                      item: ({ props, state, context }) => ({
                          class: context.selected ? 'bg-primary text-white' : context.focused ? 'bg-blue-100' : undefined
                      })
                  }"
        />
      </div>
      <div v-else>
        <Dropdown v-model="statusToShow"
                  :options="statuses.statuses"
                  @change="selectStatus(statusToShow.id)"
                  optionLabel="name"
                  filter
                  placeholder="Filter by status"
                  class="w-full md:w-14rem"
                  overlayVisible="true"
                  :pt="{
                      item: ({ props, state, context }) => ({
                          class: context.selected ? 'bg-primary text-white' : context.focused ? 'bg-blue-100' : undefined
                      })
                  }"
        />
      </div>

      <div v-if="from === 'yourWork'">
        <Dropdown v-model="projectToShow"
                  :options="allProjects"
                  @change="selectProject(projectToShow?.id)"
                  optionLabel="name"
                  filter
                  placeholder="Filter by project" class="w-full md:w-14rem"
                  :pt="{
                      item: ({ props, state, context }) => ({
                          class: context.selected ? 'bg-primary text-white' : context.focused ? 'bg-blue-100' : undefined
                      })
                  }"
        />
      </div>
      <div v-if="from === 'board'">
        <Dropdown v-model="sprintToShow"
                  :options="openedSprints?.sprints"
                  @change="selectSprint(sprintToShow?.id)"
                  optionLabel="name"
                  filter
                  placeholder="Filter by sprint"
                  class="w-full md:w-14rem"
                  :pt="{
                      item: ({ props, state, context }) => ({
                          class: context.selected ? 'bg-primary text-white' : context.focused ? 'bg-blue-100' : undefined
                      })
                  }"
        />

      </div>
      <div v-if="from !== 'yourWork'">
        <Dropdown v-model="labelToShow"
                  :options="projectLabels"
                  @change="selectLabel(labelToShow)"
                  optionLabel=""
                  filter
                  placeholder="Filter by label"
                  class="w-full md:w-14rem"
                  overlayVisible="true"
                  :pt="{
                      item: ({ props, state, context }) => ({
                          class: context.selected ? 'bg-primary text-white' : context.focused ? 'bg-blue-100' : undefined
                      })
                  }"
        />
      </div>
      <div class="users">
        <div v-if="props.from === 'yourWork'" class="symbol-group symbol-hover flex-nowrap me-5">
          <Avatar :unsigned="null" @click="selectMember('0')"
                  :class="{'active-user' : filters.assignee == '0'}"/>
          <div v-for="(member, index) in teamMembersYourWork?.teamMembers" :key="index">
            <TooltipMain :content="member?.name" placement="top">
              <Avatar :user="member" @click="selectMember(member?.id)"
                      :class="{'active-user' : filters.assignee == member?.id}"/>
            </TooltipMain>
          </div>
        </div>
        <div v-else class="symbol-group symbol-hover flex-nowrap me-5">
          <Avatar :unsigned="null" @click="selectMember('0')"
                  :class="{'active-user' : filters.assignee == '0'}"/>
          <div v-for="(member, index) in acceptedTeam?.teamMember" :key="index">
            <TooltipMain :content="member?.user?.name" placement="top">
              <Avatar :user="member?.user" @click="selectMember(member?.id)"
                      :class="{'active-user' : filters.assignee == member?.id}"/>
            </TooltipMain>
          </div>
        </div>
      </div>
    </div>
    <button :disabled="!isFiltering"
            class="btn btn-light btn-active-light-danger btn-flex btn-center btn-sm cursor-pointer gap-1"
            @click="clearFilters">
      <Icon name="carbon:filter-remove" class="fs-4"/>
      <span class="fs-7">Clear filters</span>
    </button>
  </div>
</template>

<style>
.symbol.active-user {
  position: relative !important;
  z-index: 100 !important;
}

.active-user > span {
  box-shadow: 0 .4rem 1rem rgba(0, 0, 0, .15) !important;
}

.active-user > img {
  border: 2px solid var(--bs-primary);
}
</style>