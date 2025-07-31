<script setup>
import {helpers, maxLength, required, minLength} from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import {usePostData} from "~/composables/usePostData";
import {useProjectStore} from "~/stores/useProjectStore";
import {storeToRefs} from "pinia";
import {useToast} from "vue-toastification";
import draggable from 'vuedraggable';
import {Collapse} from "vue-collapsed"
import {useFilters} from "~/composables/useFilters";

const route = useRoute();
const router = useRouter();

router.beforeEach(() => {
  clearAllIssues();
  backlogSelectedIssuesList.value = [];
  isIssuesSelected.value = false;
});

const {createIssue, moveIssue, moveMultiIssues, createSprint, updateMultiIssues, deleteMultiIssues, createSprintWithIssues} = usePostData();
const {user} = useAuth();
const toast = useToast();
const { getFilters } = useFilters();
const filters = getFilters();


const projectStore = useProjectStore();
const {project, backlog, activeIssue, statuses, teamOptions, allSelectedIssuesList, isAllIssuesSelected, newIssueType} = storeToRefs(projectStore);

const creating = ref(false);
const creatingList = ref([]);
const isLoading = ref(false);
const creatingLoading = ref(false);
const sprintCreating = ref(false);

const createIssueParent = ref(null);

const openCreateIssue = () => {
  creating.value = true;

  setTimeout(() => createIssueParent.value.querySelector('input').focus(), 0);
}

const closeInput = () => {
  setTimeout(() => {
    creating.value = false;
    validationErrors.title = "";
  }, 0);
};

onBeforeMount(() => {
  const collapseSprint = localStorage.getItem(`collapseBacklog${project.value?.project_identify}-${user.value.id}`);

  if (collapseSprint) {
    isExpanded.value = (collapseSprint === "true");
    return;
  }

  localStorage.setItem(`collapseBacklog${project.value?.project_identify}-${user.value.id}`, "true");
});

// scroll to create issue input when click on create issue buton at the top of the sprint
const scrollToCreate = () => {
  openCreateIssue();

  const createInput = document.getElementById("createBacklogIssueWrapper");
  if (createInput) {
    window.scrollTo({
      top: createInput.offsetTop,
      behavior: 'smooth' // For smooth scrolling
    });
  }
}

const createIssueData = ref({
  title: "",
  sprint_id: null,
});

const submitCreateIssue = ref({
  title: "",
  type: "",
  sprint_id: null,
});

const validationErrors = reactive({
  title: null,
});


// form validation rules
const rules = {
  title: {
    required: helpers.withMessage('Issue Title Is Required', required),
    maxLength: helpers.withMessage("Issue title can't be more than 255 characters", maxLength(255)),
    minLength: helpers.withMessage("Issue title must be more than 3 characters", minLength(3)),
  }
}

const v$ = useVuelidate(rules, createIssueData.value);

// === methods === //
const handleSubmit = async () => {
  validationErrors.title = null;
  const result = await v$.value.$validate();

  createIssueData.value.title = (createIssueData.value.title).trim();

  if (result && !creatingLoading.value) {
    creatingLoading.value = true;
    submitCreateIssue.value.title = createIssueData.value.title;
    createIssueData.value.title = "";
    submitCreateIssue.value.sprint_id = createIssueData.value.sprint_id;
    creatingList.value.push(submitCreateIssue.value);

    submitCreateIssue.value.type = newIssueType.value ?? "story";

    await submit();
    return;
  }

  validationErrors.title = v$.value?.title?.$errors[0]?.$message;
}

const {
  submit,
  inProgress,
  validationErrors: errors,
} = useSubmit(() => createIssue(submitCreateIssue.value, project.value?.project_identify), {
  onSuccess: async (response) => {
    await projectStore.refreshProjectBacklog(route.params?.id || project.value?.project_identify, filters);
    creatingList.value.shift();
    creatingLoading.value = false;

    if (response?.code === 201) {
      toast.success(response?.message)
    }
  },
  onError: (error) => {
    if (error?.data?.code === 422) {
      toast.error(error?.data?.message);
      return;
    }
    closeInput();
  }
});

const isOpen = ref(false);
const toggleView = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value === false) {
    activeIssue.value = -1;
  }
};

const addedIssueId = ref(null);
const addedIssueOrder = ref(null);

const onIssueChange = async (e) => {
  let issueAdded = e.added;
  let issueMoved = e.moved;

  if (issueMoved) {
    await moveIssue(route.params.id, issueMoved.element.id, {
      sprint_id: null,
      order: issueMoved.newIndex + 1
    });
  }

  if (!issueAdded) return null;

  addedIssueId.value = issueAdded.element.id;
  addedIssueOrder.value = issueAdded.newIndex + 1;
}

const onIssueAdded = async (e) => {
  let toId = e.to.id;
  let fromId = e.from.id;

  const toSprintStatus = e.to.dataset.sprintStatus;
  const fromSprintStatus = e.from.dataset.sprintStatus;

  if (fromSprintStatus !== "IN PROGRESS") {
    // if from = null && to = id ==> issue moved from backlog to sprint with id
    // if from = id && to = null ==> issue moved from sprint with id to backlog
    if (!fromId && toId) {
      // console.log(`moved from backlog to sprint ${toId}`);
      await handleMoveIssue(toId, addedIssueOrder.value);
    } else if (fromId && !toId) {
      // console.log(`moved from sprint ${fromId} to backlog`);
      await handleMoveIssue(null, addedIssueOrder.value);
    } else if (fromId && toId) {
      // console.log(`moved from sprint ${fromId} to sprint ${toId}`);
      await handleMoveIssue(toId, addedIssueOrder.value);
    }
  }
}

const onIssuesRemoved = (e) => {
  // one move issue from this sprint to another make all issues here unchecked and empty the list
  if (isAllIssuesSelected.value) {
    const allCheckBox = document.querySelectorAll(`#backlog .issue-checkbox input[type='checkbox']`);
    allCheckBox.forEach((checkBox) => {
      if (checkBox.getAttribute('data-issues-selected') === 'true') {
        checkBox.click();
      }
    });

    backlogSelectedIssuesList.value = [];
    isIssuesSelected.value = false;
  }
}

const handleMoveIssue = async (sprintId, newIssueOrder) => {
  // move multi issues => all selected issues
  if (isAllIssuesSelected.value) {
    await moveMultiIssues(route.params?.id, {sprint_id: sprintId, issues_id: allSelectedIssuesList.value, order: newIssueOrder});

    const allCheckBox = document.querySelectorAll(`.issue-checkbox input[type='checkbox']`);
    allCheckBox.forEach((checkBox) => {
      if (checkBox.getAttribute('data-issues-selected') === 'true') {
        checkBox.click();
      }
    });

    isAllIssuesSelected.value = false;
    allSelectedIssuesList.value = [];
    await projectStore.refreshProjectBacklog(route.params.id, filters);
    return;
  }

  // move one issue
  await moveIssue(route.params?.id, addedIssueId.value, {sprint_id: sprintId, order: newIssueOrder});
}

const isExpanded = ref(true);

const handleCollapse = () => {
  isExpanded.value = !isExpanded.value;
  localStorage.setItem(`collapseBacklog${project.value?.project_identify}-${user.value.id}`, `${isExpanded.value}`);
};

const handleCreateSprint = async () => {
  sprintCreating.value = true;
  if (isIssuesSelected.value) {
    const response = await createSprintWithIssues(route.params.id, {issues_id: backlogSelectedIssuesList.value});
    if (response?.code === 200) {
      toast.success(response?.message);
    }
    clearAllIssues();
    isIssuesSelected.value = false;
    backlogSelectedIssuesList.value = [];
  } else {
    const response = await createSprint(route.params.id);
    if (response?.code === 200) {
      toast.success(response?.message);
    }
  }

  await projectStore.refreshProjectBacklog(route.params.id, filters);
  sprintCreating.value = false;
}

const isIssuesSelected = ref(false);
const backlogSelectedIssuesList = ref([]);
const selectedStatus = ref(null);
const selectedMember = ref(null);

const onIssueSelect = (selectIssueInfo) => {
  if (selectIssueInfo.checked) {
    backlogSelectedIssuesList.value.push(selectIssueInfo.id);
    allSelectedIssuesList.value.push(selectIssueInfo.id);
    isIssuesSelected.value = true;
    isAllIssuesSelected.value = true;
    return;
  }

  backlogSelectedIssuesList.value = backlogSelectedIssuesList.value.filter(id => id !== selectIssueInfo.id);
  allSelectedIssuesList.value = allSelectedIssuesList.value.filter(id => id !== selectIssueInfo.id);

  if (backlogSelectedIssuesList.value.length <= 0) {
    isIssuesSelected.value = false;
  }
  if (allSelectedIssuesList.value.length <= 0) {
    isIssuesSelected.value = false;
    isAllIssuesSelected.value = false;
  }
}

const multiSelectMenu = ref();
const multiSelectMenuItems = ref([
  {
    label: 'Select all',
    command: () => selectAllIssues(),
  },
  {
    label: 'Clear all',
    command: () => clearAllIssues(),
  }
]);

const toggleMultiSelectMenu = (event) => {
  multiSelectMenu.value.toggle(event);

  if (multiSelectMenu.value) {
    window.addEventListener("scroll", hideMenuOnscroll);
  }
}
const hideMenuOnscroll = () => {
  if (multiSelectMenu.value) {
    multiSelectMenu.value.hide();
  }
}

const handleDeleteIssues = async () => {
  Swal.fire({
    html: `Are you sure you want to delete <br> <strong>${backlogSelectedIssuesList.value.length} issues</strong>`,
    icon: "warning",
    buttonsStyling: false,
    showCancelButton: true,
    confirmButtonText: "Yes, remove!",
    cancelButtonText: 'No, cancel',
    showLoaderOnConfirm: true,
    customClass: {
      confirmButton: "btn fw-bold btn-danger",
      cancelButton: 'btn fw-bold btn-active-light-primary',
    },
    preConfirm: async () => {
      const response = await deleteMultiIssues(route.params.id, {issues_id: backlogSelectedIssuesList.value});
      if (response?.code === 200) {
        toast.success(response?.message, {
          position: "bottom-right",
          timeout: 2000,
        });
        clearAllIssues();
        await projectStore.refreshProjectBacklog(route?.params?.id, filters);
        isIssuesSelected.value = false;
        backlogSelectedIssuesList.value = [];
      }
    },
  });
};

const handleChangeStatusToMultiIssues = async () => {
  Swal.fire({
    html: `Are you sure you want to change the status for <br> <strong>${backlogSelectedIssuesList.value.length} issues</strong>`,
    icon: "warning",
    buttonsStyling: false,
    showCancelButton: true,
    confirmButtonText: "Yes, update!",
    cancelButtonText: 'No, cancel',
    showLoaderOnConfirm: true,
    customClass: {
      confirmButton: "btn fw-bold btn-success",
      cancelButton: 'btn fw-bold btn-active-light-primary',
    },
    preConfirm: async () => {
      const response = await updateMultiIssues(route.params.id, {issues_id: backlogSelectedIssuesList.value, status_id: selectedStatus.value.id});
      if (response?.code === 200) {
        toast.success(response?.message, {
          position: "bottom-right",
          timeout: 2000,
        });
        await projectStore.refreshProjectBacklog(route?.params?.id, filters);
        selectedStatus.value = null;
        clearAllIssues();
      }
    },
  });
}

const handleChangeAssigneeToMultiIssues = async () => {
  Swal.fire({
    html: `Are you sure you want to change assignee to <br> <strong>${backlogSelectedIssuesList.value.length} issues</strong>`,
    icon: "warning",
    buttonsStyling: false,
    showCancelButton: true,
    confirmButtonText: "Yes, update!",
    cancelButtonText: 'No, cancel',
    showLoaderOnConfirm: true,
    customClass: {
      confirmButton: "btn fw-bold btn-success",
      cancelButton: 'btn fw-bold btn-active-light-primary',
    },
    preConfirm: async () => {
      const response = await updateMultiIssues(route.params.id, {issues_id: backlogSelectedIssuesList.value, assign_to: selectedMember.value.id});
      if (response?.code === 200) {
        toast.success(response?.message, {
          position: "bottom-right",
          timeout: 2000,
        });
        await projectStore.refreshProjectBacklog(route?.params?.id, filters);
        selectedMember.value = null;
        clearAllIssues();
      }
    },
  });
}

const selectAllIssues = () => {
  const allCheckBox = document.querySelectorAll("#backlog .issue-checkbox input[type='checkbox']");

  allCheckBox.forEach((checkBox) => {
    if (checkBox.getAttribute('data-issues-selected') === 'false') {
      checkBox.click();
    }
  });
}

const clearAllIssues = () => {
  const allCheckBox = document.querySelectorAll("#backlog .issue-checkbox input[type='checkbox']");

  allCheckBox.forEach((checkBox) => {
    if (checkBox.getAttribute('data-issues-selected') === 'true') {
      checkBox.click();
    }
  });
}
</script>

<template>
  <div class="app-content pt-12 pb-0" id="backlog">
    <div class="card">
      <div class="card-header py-4" :style="!isExpanded ? 'border: none' : ''">
        <div class="card-title d-flex flex-column">
          <div class="d-flex align-items-center position-relative">
            <h2 @click="handleCollapse" class="me-3 cursor-pointer">Backlog
              <Icon v-if="!isExpanded" name="ic:outline-keyboard-arrow-down" size="20"/>
              <Icon v-else name="ic:outline-keyboard-arrow-up" size="20"/>
            </h2>
            <span v-if="backlog.backlog.length > 0" class="fs-6 fw-normal badge badge-light-success text-success px-3">{{
                backlog?.backlog.length
              }} issues</span>
          </div>
        </div>
        <div class="card-toolbar">
          <div class="d-flex justify-content-end gap-4" data-kt-customer-table-toolbar="base">
            <button type="button" class="btn btn-primary btn-sm" @click="handleCreateSprint" :disabled="sprintCreating" v-can="'create sprint'">
              <Icon v-if="sprintCreating" name="svg-spinners:180-ring-with-bg" size="16"/>
              <span v-else>
                <Icon name="fluent:arrow-sprint-16-filled" size="20" class="me-1"/>
                Create Sprint
              </span>
            </button>
            <button @click="scrollToCreate" type="button" class="btn btn-light-primary btn-sm" v-can="'create issue'">
              <Icon name="material-symbols:arrow-downward-rounded" size="16" class="me-1"/>Create Issue
            </button>
          </div>
        </div>
      </div>

      <SkeletonLoaderBacklogIssue v-if="projectStore.isSearchLoading"/>

      <div v-else class="card-body p-0">
        <Collapse :when="isExpanded">
          <div>
            <div v-if="isIssuesSelected" class="issue-container d-flex align-items-center justify-content-between py-2 px-6 border border-dashed border-success">
              <div class="d-flex align-items-center gap-2">
                <div @click="toggleMultiSelectMenu" aria-haspopup="true" aria-controls="overlay_menu" class="p-2 bg-light rounded-1 text-gray-600 text-hover-gray-800 cursor-pointer"
                     style="height: fit-content">
                  <Icon name="mdi:dots-horizontal" size="20"/>
                  <Menu ref="multiSelectMenu" id="overlay_menu" :model="multiSelectMenuItems" :popup="true"
                        :pt="{
                        root: { class: 'w-125px' },
                    }"
                  />
                </div>
                <p class="fw-bold">{{backlogSelectedIssuesList.length}} Selected</p>
              </div>

              <div class="d-flex align-items-center gap-10">
                <div>
                  <Dropdown v-model="selectedStatus"
                            :options="statuses?.statuses"
                            @change="handleChangeStatusToMultiIssues"
                            optionLabel="name"
                            placeholder="Change issues status"
                            class="min-w-200px"
                            overlayVisible="true"
                  />
                </div>

                <div>
                  <Dropdown v-model="selectedMember" :options="teamOptions" @change="handleChangeAssigneeToMultiIssues"
                            optionLabel="name" placeholder="Change issues assignee" class="min-w-200px">
                    <template #value="slotProps">
                      <div v-if="slotProps.value" class="d-flex align-items-center gap-2">
                        <Avatar :user="slotProps.value" imgWidth="25"/>
                        <div>{{ slotProps.value.name }}</div>
                      </div>
                      <span v-else>{{ slotProps.placeholder }}</span>
                    </template>
                    <template #option="slotProps">
                      <div v-if="slotProps.option?.isUnassigned" class="d-flex align-items-center gap-2">
                        <div class="symbol symbol-circle symbol-30px overflow-hidden" data-bs-toggle="tooltip"
                             data-bs-placement="top"
                             data-bs-title="Unassigned">
                          <img src="~/assets/media/avatars/blank.png"
                               alt="Unassigned" class=""/>
                        </div>
                        <div>{{ slotProps.option.name }}</div>
                      </div>
                      <div v-else class="d-flex align-items-center gap-2">
                        <Avatar :user="slotProps.option" imgWidth="25"/>
                        <div>{{ slotProps.option.name }}</div>
                      </div>
                    </template>
                  </Dropdown>
                </div>
              </div>

              <div @click="handleDeleteIssues" class="btn btn-light btn-active-light-danger btn-flex btn-center btn-sm cursor-pointer">
                <i class="ki-duotone ki-trash fs-5">
                  <span class="path1"></span>
                  <span class="path2"></span>
                  <span class="path3"></span>
                  <span class="path4"></span>
                  <span class="path5"></span>
                </i>
                <span style="line-height: 15px;">Delete</span>
              </div>
            </div>

            <div v-if="backlog?.backlog?.length > 0" v-can="'move issue backlog'">
              <draggable
                  v-model="backlog.backlog"
                  group="issues"
                  item-key="id"
                  drag-class="draging"
                  ghost-class="ghost"
                  class="project-backlog issues-wrraper"
                  @change="onIssueChange"
                  @add="onIssueAdded"
                  @remove="onIssuesRemoved"
              >
                <template #item="{element: issue, index}">
                  <IssueMain :index="index" :elementsId="`backlog${index}`" :sprintLength="backlog?.backlog?.length"
                             :issue="issue" :toggleView="toggleView" @issueSelect="onIssueSelect" :isIssuesSelected="isIssuesSelected"/>
                </template>
              </draggable>
              <IssueNew v-for="(newIssue, index) in creatingList" :key="index" v-if="creatingList?.length > 0" :title="newIssue.title"/>
            </div>

            <div v-if="backlog?.backlog?.length > 0" class="issues-wrraper" v-can:not="'move issue backlog'">
              <IssueMain v-for="(issue, index) in backlog?.backlog" :index="index" :elementsId="`backlog${index}`" :sprintLength="backlog?.backlog?.length"
                         :issue="issue" :toggleView="toggleView" @issueSelect="onIssueSelect" :isIssuesSelected="isIssuesSelected"/>

              <IssueNew v-for="(newIssue, index) in creatingList" :key="index" v-if="creatingList?.length > 0" :title="newIssue.title"/>
            </div>

            <div v-show="!backlog?.backlog?.length > 0"
                 :class="{'alert bg-light-active border-dashed border-2 p-0 m-3 text-center': !creatingList?.length > 0}"
            >
              <div v-if="!creatingList?.length > 0" class="d-flex flex-column text-center p-0">
                <h4 class="fw-semibold p-0 m-0 position-absolute empty-sprint-title">Your backlog is empty.</h4>
                <draggable
                    v-model="backlog.backlog"
                    group="issues"
                    item-key="id"
                    drag-class="draging"
                    ghost-class="ghost"
                    class="project-backlog"
                    @change="onIssueChange"
                    @add="onIssueAdded"
                    style="min-height: 75px !important;"
                >
                  <template #item="{element: issue, index}">
                    <IssueMain v-if="!backlog?.backlog?.length > 0" :index="index" :sprintLength="backlog?.backlog?.length" :issue="issue"
                               :toggleView="toggleView"/>
                  </template>
                </draggable>
              </div>
              <IssueNew v-else v-for="(newIssue, index) in creatingList" :key="index" :title="newIssue.title"/>
            </div>

            <div v-if="creating" v-click-outside="closeInput" ref="createIssueParent" v-can="'create issue'"
                 class="createIssue py-3 px-6 cursor-pointer rounded-bottom border-top">
              <div class="position-relative d-flex align-items-center gap-2">
                <DropDownMenuIssueTypeCreate class="z-1"/>

                <FormInput @keyup.enter="handleSubmit"  @keyup.esc="closeInput" type="text" autocomplete="off"
                           labelText="Issue Title:" name="title" placeholder="Issue Title"
                           v-model:input="createIssueData.title"
                           class="w-100"
                           :formDataError="validationErrors.title || errors?.title"/>
              </div>
            </div>

            <div v-else @click="openCreateIssue" v-can="'create issue'" class="createIssue py-3 px-6 cursor-pointer rounded-bottom border-top">
              <span class="d-flex align-items-center py-2"><i class="ki-outline ki-plus fs-2 me-1"></i>Create Issue</span>
            </div>
          </div>
        </Collapse>
      </div>
    </div>
  </div>
  <Transition name="issueDetails">
    <IssueDetails v-if="isOpen" :toggleView="toggleView"/>
  </Transition>
</template>

<style scoped>
.createIssue {
  transition: all 0.3s ease;
}

.createIssue:hover {
  background: var(--bs-gray-200);
}

.issueDetails-enter-active,
.issueDetails-leave-active {
  transition: all 0.3s ease;
}

.issueDetails-enter-from,
.issueDetails-leave-to {
  right: -100% !important;
}

.empty-sprint-title {
  top: 38%;
  left: 50%;
  transform: translate(-50%);
  z-index: 1000;
  pointer-events: none;
}

.issues-wrraper > div:last-child {
  border-bottom: none !important;
}
</style>