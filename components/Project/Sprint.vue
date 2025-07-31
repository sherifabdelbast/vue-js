<script setup>
import {usePostData} from "~/composables/usePostData";
import {useProjectStore} from "~/stores/useProjectStore";
import {storeToRefs} from "pinia";
import {useToast} from "vue-toastification";
import moment from "moment";
import draggable from 'vuedraggable';
import {Collapse} from "vue-collapsed";
import {useFilters} from "~/composables/useFilters";

const route = useRoute();
const router = useRouter();
const {getFilters} = useFilters();
const filters = getFilters();

router.beforeEach(() => {
  clearAllIssues();
  sprintSelectedIssuesList.value = [];
  isIssuesSelected.value = false;
});

const {createIssue, moveIssue, moveMultiIssues, deleteSprint, deleteMultiIssues, updateMultiIssues} = usePostData();
const {user} = useAuth();
const toast = useToast();

const projectStore = useProjectStore();
const {
  project,
  editSprintFromData,
  editSprintValidationErrors,
  oldEditSprintFromData,
  activeIssue,
  completeSprintInfo,
  backlog,
  statuses,
  teamOptions,
  allSelectedIssuesList,
  isAllIssuesSelected,
  memberPermissions,
  newIssueType,
  removedIssueInfo
} = storeToRefs(projectStore)

const props = defineProps(["sprint"]);

const creating = ref(false);
const creatingList = ref([]);
const creatingLoading = ref(false);

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
  const collapseSprint = localStorage.getItem(`collapseSprint${route.params.id}-${props.sprint?.id}-${user.value.id}`);

  if (collapseSprint) {
    isExpanded.value = (collapseSprint === "true");
    return;
  }

  localStorage.setItem(`collapseSprint${route.params.idd}-${props.sprint?.id}-${user.value.id}`, "true");
});

// scroll to create issue input when click on create issue buton at the top of the sprint
const scrollToCreate = () => {
  openCreateIssue();

  const createInput = document.getElementById("createIssueWrapper");
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
  allValid: true,
});

// === methods === //
const handleSubmit = async () => {
  validationErrors.title = null;
  validationErrors.allValid = true;

  createIssueData.value.title = (createIssueData.value.title).trim();

  if (!createIssueData.value.title) {
    validationErrors.title = "Issue title is required";
    validationErrors.allValid = false;
  } else if (createIssueData.value.title.length > 255) {
    validationErrors.title = "Issue title can't be more than 255 characters";
    validationErrors.allValid = false;
  } else if (createIssueData.value.title.length < 3) {
    validationErrors.title = "Issue title must be more than 3 characters";
    validationErrors.allValid = false;
  }

  if (validationErrors.allValid && !creatingLoading.value) {
    creatingLoading.value = true;
    submitCreateIssue.value.title = createIssueData.value.title;
    createIssueData.value.title = "";
    submitCreateIssue.value.sprint_id = props.sprint?.id;
    creatingList.value.push(submitCreateIssue.value);

    submitCreateIssue.value.type = newIssueType.value ?? "story";

    await submit();
  }
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

Element.prototype.insertChildAtIndex = function (child, index) {
  if (!index) index = 0
  if (index >= this.children.length) {
    this.appendChild(child);
  } else {
    this.insertBefore(child, this.children[index]);
  }
}

const onIssueChange = async (e) => {
  let issueAdded = e.added;
  let issueMoved = e.moved;

  if (issueMoved) {
    await moveIssue(route.params.id, issueMoved.element.id, {
      sprint_id: issueMoved.element.sprint_id,
      order: issueMoved.newIndex + 1
    });
  }

  if (!issueAdded) return null;

  addedIssueId.value = issueAdded.element.id;
  addedIssueOrder.value = issueAdded.newIndex + 1;

  removedIssueInfo.value.id = issueAdded.element.id;
  removedIssueInfo.value.newOrder = issueAdded.newIndex + 1;
}

const onIssueAdded = async (e) => {
  let toId = e.to.id;
  let fromId = e.from.id;

  const toSprintStatus = e.to.dataset.sprintStatus;
  const fromSprintStatus = e.from.dataset.sprintStatus;

  if (props.sprint?.status === "IN PROGRESS") {
    Swal.fire({
      html: `<p class="lh-3">Sprint <span class="fw-bold">"${props.sprint?.name}"</span> is active. <br>
            Sprint scope will be affected by this action.</p>`,
      title: "Move Issue",
      icon: "warning",
      iconColor: '#d9214e',
      buttonsStyling: false,
      showCancelButton: true,
      confirmButtonText: "Confirm",
      cancelButtonText: 'Cancel',
      allowOutsideClick: false,
      customClass: {
        confirmButton: "btn btn-primary btn-sm",
        cancelButton: 'btn btn-danger btn-sm'
      },
      allowEscapeKey: false,
      showLoaderOnConfirm: true,
      preConfirm: async () => {
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
      },
    });

    document.querySelector(".swal2-cancel").addEventListener("click", async () => {
      document.querySelector(".swal2-cancel").removeEventListener("click", () => {});

      const issueElement = e.to.children[e.newIndex];

      e.from.insertChildAtIndex(issueElement, e.oldIndex);
      await projectStore.refreshProjectBacklog(route.params.id, filters);
    });
    return;
  }

  if (fromSprintStatus !== "IN PROGRESS") {
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
  let toId = e.to.id;
  let fromId = e.from.id;

  const toSprintStatus = e.to.dataset.sprintStatus;
  const fromSprintStatus = e.from.dataset.sprintStatus;

  if (props.sprint?.status === "IN PROGRESS") {
    Swal.fire({
      html: `<p class="lh-3">Sprint <span class="fw-bold">"${props.sprint?.name}"</span> is active. <br>
            Sprint scope will be affected by this action.</p>`,
      title: "Move Issue",
      icon: "warning",
      iconColor: '#d9214e',
      buttonsStyling: false,
      showCancelButton: true,
      confirmButtonText: "Confirm",
      cancelButtonText: 'Cancel',
      allowOutsideClick: false,
      customClass: {
        confirmButton: "btn btn-primary btn-sm",
        cancelButton: 'btn btn-danger btn-sm'
      },
      allowEscapeKey: false,
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        // if from = null && to = id ==> issue moved from backlog to sprint with id
        // if from = id && to = null ==> issue moved from sprint with id to backlog
        if (!fromId && toId) {
          // console.log(`moved from backlog to sprint ${toId}`);
          await moveIssue(route.params.id, removedIssueInfo.value.id, {
            order: removedIssueInfo.value.newOrder,
            sprint_id: toId
          });
        } else if (fromId && !toId) {
          // console.log(`moved from sprint ${fromId} to backlog`);
          await moveIssue(route.params.id, removedIssueInfo.value.id, {
            order: removedIssueInfo.value.newOrder,
            sprint_id: null
          });
        } else if (fromId && toId) {
          // console.log(`moved from sprint ${fromId} to sprint ${toId}`);
          await moveIssue(route.params.id, removedIssueInfo.value.id, {
            order: removedIssueInfo.value.newOrder,
            sprint_id: toId
          });
        }
      }
    });

    document.querySelector(".swal2-cancel").addEventListener("click", async () => {
      document.querySelector(".swal2-cancel").removeEventListener("click", () => {
      });

      const issueElement = e.to.children[e.newIndex];

      e.from.insertChildAtIndex(issueElement, e.oldIndex);
      await projectStore.refreshProjectBacklog(route.params.id, filters);
    });
  }

  // on move issue from this sprint to another make all issues here unchecked and empty the list
  if (isAllIssuesSelected.value) {
    const allCheckBox = document.querySelectorAll(`#sprint-${e.from.id} .issue-checkbox input[type='checkbox']`);
    allCheckBox.forEach((checkBox) => {
      if (checkBox.getAttribute('data-issues-selected') === 'true') {
        checkBox.click();
      }
    });

    sprintSelectedIssuesList.value = [];
    isIssuesSelected.value = false;
  }
}

const handleMoveIssue = async (sprintId, newIssueOrder) => {
  // move multi issues => all selected issues
  if (isAllIssuesSelected.value) {
    await moveMultiIssues(route.params?.id, {
      sprint_id: sprintId,
      issues_id: allSelectedIssuesList.value,
      order: newIssueOrder
    });

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
  localStorage.setItem(`collapseSprint${route.params.id}-${props.sprint?.id}-${user.value.id}`, `${isExpanded.value}`);
}

const menu = ref();
const items = ref([]);

const editSprintItem = {
  label: 'Edit Sprint',
  icon: 'pi pi-fw pi-pencil',
  command: () => {
    editSprintFromData.value.id = props.sprint?.id;
    editSprintFromData.value.project_id = route.params.id;
    editSprintFromData.value.name = props.sprint?.name;
    editSprintFromData.value.goal = props.sprint?.goal;
    editSprintFromData.value.start_date = props.sprint?.start_date ?? new Date();
    editSprintFromData.value.end_date = props.sprint?.end_date;

    editSprintFromData.value.duration = {name: props.sprint?.duration, code: props.sprint?.duration.split(" ")[0]};

    editSprintFromData.value.start_date = moment(editSprintFromData.value.start_date).format('YYYY-MM-DD hh:mm:ss');
    editSprintFromData.value.end_date = moment(editSprintFromData.value.start_date, 'YYYY-MM-DD hh:mm:ss').add(editSprintFromData.value.duration.code, 'weeks').format('YYYY-MM-DD hh:mm:ss');

    oldEditSprintFromData.value.name = props.sprint?.name;
    oldEditSprintFromData.value.goal = props.sprint?.goal;
    oldEditSprintFromData.value.start_date = props.sprint?.start_date;
    oldEditSprintFromData.value.duration = props.sprint?.duration;
    oldEditSprintFromData.value.end_date = props.sprint?.end_date;

    new bootstrap.Modal(`#kt_modal_edit_sprint${props.sprint?.id}`).show();
  },
}
const deleteSprintItem = {
  label: 'Delete Sprint',
  icon: 'pi pi-fw pi-trash',
  command: () => handleDeleteSprint(),
}

if (memberPermissions.value.includes('edit sprint')) {
  items.value.push(editSprintItem);
}

if (memberPermissions.value.includes('delete sprint') && props.sprint?.status !== "IN PROGRESS") {
  items.value.push(deleteSprintItem);
}

const toggle = (event) => menu.value.toggle(event);

const handleDeleteSprint = async () => {
  Swal.fire({
    html: `Are you sure you want to delete <strong><div class="truncate lh-lg" >${props.sprint?.name}</div></strong>`,
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
      const response = await deleteSprint(route?.params?.id, props?.sprint?.id, {issue_sprint_id: null});
      if (response?.code === 200) {
        toast.success(response?.message, {
          position: "bottom-right",
          timeout: 2000,
        });
        await projectStore.refreshProjectBacklog(route?.params?.id, filters);
      }
    },
  });
}

const openStartSprint = () => {
  editSprintFromData.value.id = props.sprint?.id;
  editSprintFromData.value.project_id = route.params.id;
  editSprintFromData.value.name = props.sprint?.name;
  editSprintFromData.value.goal = props.sprint?.goal;
  editSprintFromData.value.start_date = props.sprint?.start_date ?? new Date();
  editSprintFromData.value.end_date = props.sprint?.end_date;

  editSprintFromData.value.duration = {name: props.sprint?.duration, code: props.sprint?.duration.split(" ")[0]};

  editSprintFromData.value.start_date = moment(editSprintFromData.value.start_date).format('YYYY-MM-DD hh:mm:ss');
  editSprintFromData.value.end_date = moment(editSprintFromData.value.start_date, 'YYYY-MM-DD hh:mm:ss').add(editSprintFromData.value.duration.code, 'weeks').format('YYYY-MM-DD hh:mm:ss');

  editSprintValidationErrors.value.name = null;
  editSprintValidationErrors.value.goal = null;
  editSprintValidationErrors.value.start_date = null;
  editSprintValidationErrors.value.duration = null;
  editSprintValidationErrors.value.end_date = null;
  editSprintValidationErrors.value.allValid = null;

  new bootstrap.Modal(`#kt_modal_start_sprint${props.sprint?.id}`).show();
}

const openCompleteSprint = () => {
  completeSprintInfo.value.canComplete = true;
  completeSprintInfo.value.unCompletedIssuesLength = 0;
  completeSprintInfo.value.completedIssuesLength = 0;
  completeSprintInfo.value.moveIssuesOptions = [
    {name: 'Backlog', id: null},
  ];

  completeSprintInfo.value.id = props.sprint?.id;
  completeSprintInfo.value.project_id = route.params.id;
  completeSprintInfo.value.name = props.sprint?.name;
  completeSprintInfo.value.goal = props.sprint?.goal;

  props.sprint?.issues.forEach((issue) => {
    if (issue?.status?.type !== "DONE") {
      completeSprintInfo.value.canComplete = false;
      completeSprintInfo.value.unCompletedIssuesLength += 1;
    } else {
      completeSprintInfo.value.completedIssuesLength += 1;
    }
  });

  if (!completeSprintInfo.value.canComplete) {
    backlog.value?.sprints?.forEach((sprint) => {
      if (sprint.id !== props.sprint?.id) {
        completeSprintInfo.value.moveIssuesOptions.push({name: sprint?.name, id: sprint?.id});
      }
    });
  }

  new bootstrap.Modal(`#kt_modal_complete_sprint${props.sprint?.id}`).show();
}

const isIssuesSelected = ref(false);
const sprintSelectedIssuesList = ref([]);
const selectedStatus = ref(null);
const selectedMember = ref(null);

const onIssueSelect = (selectIssueInfo) => {
  if (selectIssueInfo.checked) {
    sprintSelectedIssuesList.value.push(selectIssueInfo.id);
    allSelectedIssuesList.value.push(selectIssueInfo.id);
    isIssuesSelected.value = true;
    isAllIssuesSelected.value = true;
    return;
  }

  sprintSelectedIssuesList.value = sprintSelectedIssuesList.value.filter(id => id !== selectIssueInfo.id);
  allSelectedIssuesList.value = allSelectedIssuesList.value.filter(id => id !== selectIssueInfo.id);

  if (sprintSelectedIssuesList.value.length <= 0) {
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
    html: `Are you sure you want to delete <br> <strong>${sprintSelectedIssuesList.value.length} issues</strong>`,
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
      const response = await deleteMultiIssues(route.params.id, {issues_id: sprintSelectedIssuesList.value});
      if (response?.code === 200) {
        toast.success(response?.message, {
          position: "bottom-right",
          timeout: 2000,
        });
        clearAllIssues();
        await projectStore.refreshProjectBacklog(route?.params?.id, filters);
        isIssuesSelected.value = false;
        sprintSelectedIssuesList.value = [];
      }
    },
  });
};

const handleChangeStatusToMultiIssues = async () => {
  Swal.fire({
    html: `Are you sure you want to change the status for <br> <strong>${sprintSelectedIssuesList.value.length} issues</strong>`,
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
      const response = await updateMultiIssues(route.params.id, {
        issues_id: sprintSelectedIssuesList.value,
        status_id: selectedStatus.value.id
      });
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
    html: `Are you sure you want to change assignee to <br> <strong>${sprintSelectedIssuesList.value.length} issues</strong>`,
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
      const response = await updateMultiIssues(route.params.id, {
        issues_id: sprintSelectedIssuesList.value,
        assign_to: selectedMember.value.id
      });
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
  const allCheckBox = document.querySelectorAll(`#sprint-${props.sprint?.id} .issue-checkbox input[type='checkbox']`);

  allCheckBox.forEach((checkBox) => {
    if (checkBox.getAttribute('data-issues-selected') === 'false') {
      checkBox.click();
    }
  });
}

const clearAllIssues = () => {
  const allCheckBox = document.querySelectorAll(`#sprint-${props.sprint?.id} .issue-checkbox input[type='checkbox']`);

  allCheckBox.forEach((checkBox) => {
    if (checkBox.getAttribute('data-issues-selected') === 'true') {
      checkBox.click();
    }
  });
}
</script>

<template>
  <div class="app-content pt-12 pb-0" :id="`sprint-${props.sprint?.id}`">
    <div class="card">
      <div class="card-header py-4" :style="!isExpanded ? 'border: none' : ''">
        <div class="card-title d-flex flex-column">
          <div class="d-flex align-items-center position-relative mb-3">
            <h2 @click="handleCollapse" class="me-3 cursor-pointer">{{ sprint?.name }}
              <Icon v-if="!isExpanded" name="ic:outline-keyboard-arrow-down" size="20"/>
              <Icon v-else name="ic:outline-keyboard-arrow-up" size="20"/>
            </h2>
            <span v-if="sprint?.issues.length > 0"
                  class="fs-6 fw-normal badge badge-light-success text-success px-3 me-3">{{ sprint?.issues.length }} issues</span>
            <div v-if="sprint?.start_date && sprint?.end_date" class="fs-7 text-gray-600 fw-normal me-4">
              <span>{{ moment(sprint?.start_date).format("ll") }}</span> -
              <span>{{ moment(sprint?.end_date).format("ll") }}</span>
            </div>
            <div v-if="sprint?.totalEstimatedTime">
              <div class="d-flex align-items-center gap-2"
                   v-if="sprint?.totalEstimatedTime[0] || sprint?.totalEstimatedTime[1] || sprint?.totalEstimatedTime[2]">
                <div class="badge badge-light-dark" v-if="sprint.totalEstimatedTime[0]">
                  {{ sprint?.totalEstimatedTime[0] }} d
                </div>
                <div class="badge badge-light-primary" v-if="sprint?.totalEstimatedTime[1]">
                  {{ sprint?.totalEstimatedTime[1] }} h
                </div>
                <div class="badge badge-light-warning" v-if="sprint?.totalEstimatedTime[2]">
                  {{ sprint?.totalEstimatedTime[2] }} m
                </div>
              </div>
            </div>
          </div>
          <p v-if="sprint?.goal" class="fs-6 m-0 text-gray-600 fw-normal truncate" style="max-width: 700px;">
            {{ sprint?.goal }}</p>
        </div>
        <div class="card-toolbar">
          <div class="d-flex justify-content-end gap-4" data-kt-customer-table-toolbar="base">
            <button @click="openCompleteSprint" v-if="sprint?.is_open" type="button" v-can="'complete sprint'"
                    class="btn btn-success btn-sm">
              Complete Sprint
            </button>
            <button @click="openStartSprint" v-else type="button" v-can="'start sprint'"
                    class="btn btn-primary btn-sm">
              <Icon name="iconamoon:restart" size="16" class="me-1"/>
              Start Sprint
            </button>
            <button @click="scrollToCreate" type="button" class="btn btn-light-primary btn-sm" v-can="'create issue'">
              <Icon name="material-symbols:arrow-downward-rounded" size="16" class="me-1"/>
              Create Issue
            </button>
            <div @click="toggle" aria-haspopup="true" aria-controls="overlay_menu"
                 v-can="['edit sprint', 'delete sprint']"
                 class="p-2 bg-light rounded-1 text-gray-600 text-hover-gray-800 cursor-pointer"
                 style="height: fit-content">
              <Icon name="mdi:dots-horizontal" size="20"/>
              <Menu ref="menu" id="overlay_menu" :model="items" :popup="true"
                    :pt="{
                        root: { class: 'w-130px' },
                    }"
              />
            </div>
          </div>
        </div>
      </div>

      <SkeletonLoaderBacklogIssue v-if="projectStore.isSearchLoading"/>

      <div v-else class="card-body p-0">
        <Collapse :when="isExpanded">
          <div>
            <div v-if="isIssuesSelected"
                 class="issue-container d-flex align-items-center justify-content-between py-2 px-6 border border-dashed border-success">
              <div class="d-flex align-items-center gap-2">
                <div @click="toggleMultiSelectMenu" aria-haspopup="true" aria-controls="overlay_menu"
                     class="p-2 bg-light rounded-1 text-gray-600 text-hover-gray-800 cursor-pointer"
                     style="height: fit-content">
                  <Icon name="mdi:dots-horizontal" size="20"/>
                  <Menu ref="multiSelectMenu" id="overlay_menu" :model="multiSelectMenuItems" :popup="true"
                        :pt="{
                        root: { class: 'w-125px' },
                    }"
                  />
                </div>
                <p class="fw-bold">{{ sprintSelectedIssuesList.length }} Selected</p>
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

              <div @click="handleDeleteIssues"
                   class="btn btn-light btn-active-light-danger btn-flex btn-center btn-sm cursor-pointer">
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

            <div v-if="sprint?.issues.length > 0" v-can="'move issue backlog'">
              <draggable
                  v-model="sprint.issues"
                  group="issues"
                  item-key="id"
                  :id="sprint.id"
                  :data-sprint-status="sprint?.status"
                  drag-class="draging"
                  ghost-class="ghost"
                  class="issues-wrraper"
                  @change="onIssueChange"
                  @add="onIssueAdded"
                  @remove="onIssuesRemoved"
              >
                <template #item="{element: issue, index}">
                  <IssueMain :index="index" :elementsId="`sprint${index}`" :sprintLength="sprint?.issues.length"
                             :issue="issue" :toggleView="toggleView" @issueSelect="onIssueSelect"
                             :isIssuesSelected="isIssuesSelected"/>
                </template>
              </draggable>

              <IssueNew v-for="(newIssue, index) in creatingList" :key="index" v-if="creatingList.length > 0"
                        v-can="'create issue'"
                        :title="newIssue.title"/>
            </div>

            <div v-if="sprint?.issues.length > 0" class="issues-wrraper" v-can:not="'move issue backlog'">
              <IssueMain v-for="(issue, index) in sprint.issues" :key="index" :index="index"
                         :elementsId="`sprint${index}`"
                         :sprintLength="sprint?.issues.length" :issue="issue" :toggleView="toggleView"
                         @issueSelect="onIssueSelect"
                         :isIssuesSelected="isIssuesSelected"/>


              <IssueNew v-for="(newIssue, index) in creatingList" :key="index" v-if="creatingList.length > 0"
                        v-can="'create issue'"
                        :title="newIssue.title"/>
            </div>

            <div v-show="!sprint?.issues.length > 0"
                 :class="{'alert bg-light-active border-dashed border-2 m-3 p-0 text-center overflow-hidden': !creatingList.length > 0}">
              <div v-if="!creatingList.length > 0" class="d-flex flex-column text-center p-0">
                <h4 class="fw-semibold p-0 m-0 position-absolute empty-sprint-title">No issues in this sprint.</h4>
                <draggable
                    v-model="sprint.issues"
                    group="issues"
                    item-key="id"
                    :id="sprint.id"
                    drag-class="draging"
                    ghost-class="ghost"
                    @change="onIssueChange"
                    @add="onIssueAdded"
                    style="min-height: 75px !important;"
                >
                  <template #item="{element: issue, index}">
                    <IssueMain v-if="!sprint?.issues.length > 0" :index="index" :sprintLength="sprint?.issues.length"
                               :issue="issue"
                               :toggleView="toggleView"/>
                  </template>
                </draggable>
              </div>
              <IssueNew v-else v-for="(newIssue, index) in creatingList" :key="index" :title="newIssue.title"
                        v-can="'create issue'"/>
            </div>

            <div v-if="creating" v-click-outside="closeInput" ref="createIssueParent" v-can="'create issue'"
                 class="createIssue py-3 px-6 cursor-pointer rounded-bottom border-top">
              <div class="position-relative d-flex align-items-center gap-2">
                <DropDownMenuIssueTypeCreate class="z-1"/>

                <FormInput @keyup.enter="handleSubmit" @keyup.esc="closeInput" type="text" autocomplete="off"
                           labelText="Issue Title:" name="title" placeholder="Issue Title"
                           v-model:input="createIssueData.title"
                           class="w-100"
                           :formDataError="validationErrors.title || errors?.title"/>
              </div>
            </div>

            <div v-else @click="openCreateIssue" v-can="'create issue'"
                 class="createIssue py-3 px-6 cursor-pointer rounded-bottom border-top">
              <span class="d-flex align-items-center py-2"><i
                  class="ki-outline ki-plus fs-2 me-1"></i>Create Issue</span>
            </div>
          </div>
        </Collapse>
      </div>
    </div>
  </div>
  <Transition name="issueDetails">
    <IssueDetails v-if="isOpen" :toggleView="toggleView"
                  @issueUpdated="projectStore.refreshProjectBacklog(route.params?.id ?? project.value?.project_identify)"/>
  </Transition>
  <ModalsEditSprint v-can="'edit sprint'" :id="sprint?.id"/>
  <ModalsStartSprint v-can="'start sprint'" v-if="sprint?.status === 'IDLE'" :id="sprint?.id"/>
  <ModalsCompleteSprint v-can="'complete sprint'" v-if="sprint?.status === 'IN PROGRESS'" :id="sprint?.id"/>
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