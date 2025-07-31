<script setup>
import {useProjectStore} from "~/stores/useProjectStore";
import {useAppStore} from "~/stores/useAppStore";
import {usePostData} from "~/composables/usePostData";
import {useToast} from "vue-toastification";
import {storeToRefs} from "pinia";
import {useFilters} from "~/composables/useFilters";

const emits = defineEmits(["issueSelect"]);

const toast = useToast()
const {deleteIssue, updateIssueInfoFromOutside, copyIssue, moveIssue} = usePostData();
const projectStore = useProjectStore();
const appStore = useAppStore();
const {backlog, activeIssue, memberPermissions} = storeToRefs(projectStore);
const route = useRoute();
const { getFilters } = useFilters();
const filters = getFilters();
const fetchIssueDetails = async (projectId, issueId) => {
  await projectStore.refreshIssueDetails(projectId, issueId);
  await projectStore.refreshComments(projectId, issueId);
}

const props = defineProps(["issue", "toggleView", "index", "sprintLength", "elementsId", "isActive", "isIssuesSelected"]);
const activateIssue = () => {
  activeIssue.value = props.issue?.id;
};
const handleOpenIssueDetails = async () => {
  props.toggleView();
  appStore.permissionLocation = "in";
  await fetchIssueDetails(route.params.id, props.issue?.id);
}

const handleDeleteIssue = () => {
  Swal.fire({
    html: `Are you sure you want to delete <strong><div class="truncate lh-lg" >${props?.issue?.title}</div></strong>`,
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
      const response = await deleteIssue(route?.params?.id, props?.issue?.id);
      if (response?.code === 200) {
        toast.success(response?.message, {
          position: "bottom-right",
          timeout: 2000,
        });
        await projectStore.refreshProjectBacklog(route?.params?.id, filters);
      }
    },
  });
};

const handleCopyIssue = () => {
  Swal.fire({
    html: `Are you sure you want to copy <strong><div class="truncate lh-lg" >${props?.issue?.title}</div></strong>`,
    icon: "warning",
    buttonsStyling: false,
    showCancelButton: true,
    confirmButtonText: "Yes, copy!",
    cancelButtonText: 'No, cancel',
    showLoaderOnConfirm: true,
    customClass: {
      confirmButton: "btn fw-bold btn-danger",
      cancelButton: 'btn fw-bold btn-active-light-primary',
    },
    preConfirm: async () => {
      const response = await copyIssue(route?.params?.id, props?.issue?.id);
      if (response?.code === 200) {
        toast.success(response?.message, {
          position: "bottom-right",
          timeout: 2000,
        });
        await projectStore.refreshProjectBacklog(route?.params?.id, filters);
      }
    },
  });
};

const editIssueTitleIcon = ref(false);
const isEditIssueTitleOpen = ref(false);
const editIssueLoading = ref(false);

const createIssueParent = ref(null);

const oldIssueTitle = {
  title: "",
}

const editIssueTitle = ref({
  title: "",
});

const validationErrors = reactive({
  title: null,
  allValid: true,
});

const closeIssueTitleEdit = () => {
  setTimeout(() => {
    isEditIssueTitleOpen.value = false;
    editIssueTitle.value.title = "";
    oldIssueTitle.title = "";
    validationErrors.title = null;
  }, 0);
};

const showIssueTitleEditIcon = () => editIssueTitleIcon.value = true;
const hideIssueTitleEditIcon = () => editIssueTitleIcon.value = false;
const openEditIssueTitle = () => {
  isEditIssueTitleOpen.value = true;
  hideIssueTitleEditIcon();
  editIssueTitle.value.title = props.issue?.title;
  oldIssueTitle.title = props.issue?.title;

  setTimeout(() => createIssueParent.value.querySelector('input').focus(), 0);
}

const handleUpdateIssueTitle = async () => {
  validationErrors.title = null;
  validationErrors.allValid = true;

  editIssueTitle.value.title = (editIssueTitle.value.title).trim();

  if (!editIssueTitle.value.title) {
    validationErrors.title = "Issue Title Is Required";
    validationErrors.allValid = false;
  } else if (editIssueTitle.value.title.length > 255) {
    validationErrors.title = "Issue title can't be more than 255 characters";
    validationErrors.allValid = false;
  }

  if (validationErrors.allValid) {
    editIssueLoading.value = true;
    closeIssueTitleEdit();

    if (oldIssueTitle.title !== editIssueTitle.value.title) {
      await submit();
    } else {
      editIssueLoading.value = false;
      closeIssueTitleEdit();
    }
  }
}

const {
  submit,
  inProgress,
  validationErrors: errors,
} = useSubmit(() => updateIssueInfoFromOutside(route.params.id, props.issue?.id, {title: editIssueTitle.value.title}), {
      onSuccess: async (response) => {
        if (response.code === 200) {
          toast.success(response.message, {
            position: "bottom-left",
            timeout: 1500,
          });
          await projectStore.refreshProjectBacklog(route.params.id, filters);
          editIssueLoading.value = false;
        }
      }
    }
);

const checked = ref(false);

const checkChange = () => emits("issueSelect", {id: props.issue?.id, checked: checked.value});

const menu = ref();
const items = ref([
  {
    label: 'Preview',
    icon: 'pi pi-fw pi-eye',
    command: () => {
      handleOpenIssueDetails();
      activateIssue();
    },
  }
]);

const projectSprintsList = ref([]);

const refreshSprintsList = () => {
  projectSprintsList.value = [];

  projectSprintsList.value.push({
    label: "Backlog", items: [
      {
        label: "Top",
        command: async () => {
          const res = await moveIssue(route.params.id, props.issue?.id, {sprint_id: null, order: 0, position: 1});

          if (res?.code === 200) {
            await projectStore.refreshProjectBacklog(route.params.id, filters);
          }
        }
      },
      {
        label: "Bottom",
        command: async () => {
          const res = await moveIssue(route.params.id, props.issue?.id, {sprint_id: null, order: 0, position: 0});

          if (res?.code === 200) {
            await projectStore.refreshProjectBacklog(route.params.id, filters);
          }
        }
      },
    ]
  });

  backlog.value?.sprints.forEach((sprint) => projectSprintsList.value.push({
    label: sprint?.name,
    command: async () => {
      const res = await moveIssue(route.params.id, props.issue?.id, {sprint_id: sprint?.id, order: 0, position: 0});

      if (res?.code === 200) {
        await projectStore.refreshProjectBacklog(route.params.id, filters);
      }
    }
  }));
}

refreshSprintsList();

// ======= backlog issue ======= //
const deleteIssueItem = {
  label: 'Delete',
  icon: 'pi pi-fw pi-trash',
  command: () => handleDeleteIssue(),
};
const copyIssueItem = {
  label: 'Copy',
  icon: 'pi pi-fw pi-copy',
  command: () => handleCopyIssue(),
};
const moveIssueItem = {
  label: 'Move',
  icon: 'pi pi-fw pi-arrows-v',
  items: projectSprintsList.value,
};

if (memberPermissions.value.includes('move issue backlog')) {
  items.value.push(moveIssueItem);
}

if (memberPermissions.value.includes('create issue')) {
  items.value.push(copyIssueItem);
}

if (memberPermissions.value.includes('delete issue')) {
  items.value.push(deleteIssueItem);
}

const toggle = (event) => menu.value.toggle(event);
</script>

<template>
  <div ref="createIssueParent"
       :class="{'bg-light-success border-success border-start border-2 border-bottom-0': checked || issue?.id === activeIssue}"
       class="issue-container d-flex align-items-center justify-content-between cursor-pointer py-2 ps-4 pe-6 border-bottom position-relative"
  >
    <div v-if="isEditIssueTitleOpen" v-click-outside="closeIssueTitleEdit"
         class="issue-title-edit w-75 d-flex align-items-center position-relative" style="z-index: 10000 !important;">
      <FormInput type="text" autocomplete="off" @keyup.enter="handleUpdateIssueTitle" @keyup.esc="closeIssueTitleEdit"
                 @click.stop
                 labelText="Issue Title:" name="editIssuetitle" placeholder="Issue Title"
                 v-model:input="editIssueTitle.title" :formDataError="validationErrors.title || errors?.title"
                 :focus="true" class="w-100 m-0"/>

      <div class="position-absolute d-flex align-items-center gap-2" style="right: 0; bottom: -75%">
        <button @click="handleUpdateIssueTitle" class="btn btn-light-primary shadow btn-center btn-sm cursor-pointer">
          <span>Save</span>
        </button>
        <button @click="closeIssueTitleEdit" class="btn btn-light-danger shadow btn-center btn-sm cursor-pointer">
          Cancel
        </button>
      </div>
    </div>

    <div v-else class="d-flex align-items-center overflow-hidden me-4">
      <div class="issue-checkbox invisible me-2 d-flex align-content-center justify-content-center flex-shrink-0"
           v-can="'edit issue'"
           :class="{'active': isIssuesSelected}"
           :style="`z-index: ${1000 - index + 10}`">
        <input type="checkbox" id="checkbox" v-model="checked" @change="checkChange" :data-issues-selected="checked"/>
      </div>

      <div class="ms-6 flex-shrink-0 issueType-style" :style="`z-index: ${1000 - index + 10}`" v-can="'edit issue'">
        <DropDownMenuIssueType
            :projectId="route.params.id"
            :issueId="issue?.id"
            :issueType="issue?.type"
            customStyle="p-1"
        />
      </div>

      <div class="flex-shrink-0" v-can:not="'edit issue'">
        <img v-if="issue?.type === 'task'" src="../../assets/media/svg/types/task.svg" alt="task" width="14">
        <img v-if="issue?.type === 'story'" src="../../assets/media/svg/types/story.svg" alt="story" width="14">
        <img v-if="issue?.type === 'bug'" src="../../assets/media/svg/types/bug.svg" alt="bug" width="14">
      </div>

      <div @mouseenter="showIssueTitleEditIcon" @mouseleave="hideIssueTitleEditIcon" v-can="'edit issue'"
           class="d-flex align-items-center title-container overflow-hidden ms-8">

        <span class="fs-7 text-muted me-2 text-uppercase text-nowrap flex-shrink-0">{{ issue?.key }}</span>

        <p ref="issueTitleRef" class="issue-title text-gray-800 me-2 truncate text-nowrap fs-6" @click="handleOpenIssueDetails(); activateIssue();">
          {{ issue?.title }}
        </p>

        <span v-if="editIssueTitleIcon" @click="openEditIssueTitle" class="text-gray-500 text-hover-gray-800 me-2">
          <Icon name="material-symbols:edit-outline" size="18"/>
        </span>

        <span v-if="editIssueLoading"><Icon name="svg-spinners:180-ring-with-bg" size="16"/></span>
      </div>

      <div class="d-flex align-items-center title-container overflow-hidden" v-can:not="'edit issue'">
        <span class="fs-7 text-muted me-2 text-uppercase text-nowrap flex-shrink-0">{{ issue?.key }}</span>

        <p ref="issueTitleRef" class="issue-title text-gray-800 me-2 truncate text-nowrap fs-6">
          {{ issue?.title }}
        </p>
      </div>

      <div v-if="issue?.estimated_at">
        <div class="d-flex align-items-center gap-2"
             v-if="issue?.estimated_at[0] || issue?.estimated_at[1] || issue?.estimated_at[2]">
          <div class="badge badge-light-dark" v-if="issue.estimated_at[0]">
            {{ issue?.estimated_at[0] }} d
          </div>
          <div class="badge badge-light-primary" v-if="issue?.estimated_at[1]">
            {{ issue?.estimated_at[1] }} h
          </div>
          <div class="badge badge-light-warning" v-if="issue?.estimated_at[2]">
            {{ issue?.estimated_at[2] }} m
          </div>
        </div>
      </div>
    </div>

    <div ref="issueActionsRef" class="issue-info d-flex align-items-center justify-content-between flex-shrink-0">
      <DropDownMenuStatuses :assignedStatus="issue?.status" :issueId="issue?.id" :projectId="route.params.id"
                            :style="`z-index: ${sprintLength - index + 10}`"/>

      <DropDownMenuProirity :selectedPriority="issue?.priority" :issueId="issue?.id" :projectId="route.params.id"
                            :style="`z-index: ${sprintLength - index + 10}`" class="ms-4" from="backlog"/>

      <DropDownMenuAssignedTo :assignedTo="issue?.team_member" :issueId="issue?.id" :projectId="route.params.id"
                              from="backlog" class="ms-4" :style="`z-index: ${sprintLength - index + 2}`"/>

      <div @click="toggle" aria-haspopup="true" aria-controls="overlay_menu"
           v-can="['create issue', 'move issue backlog', 'delete issue']"
           class="p-2 rounded-1 text-gray-600 bg-hover-white ms-6"
           style="height: fit-content; transition: all 0.3s ease" :style="`z-index: ${sprintLength - index + 1}`">
        <Icon name="mdi:dots-horizontal" size="20"/>
        <TieredMenu ref="menu" id="overlay_menu" :model="items" :popup="true"
                    :pt="{
                  root: { class: 'w-125px' },
              }"
        />
      </div>
    </div>
    <div class="issueOverlay" @click="handleOpenIssueDetails(); activateIssue();"></div>
  </div>
</template>

<style scoped>
.issue-container:hover {
  background-color: var(--bs-gray-100);
}

.issue-container:hover .issue-checkbox {
  visibility: visible !important;
}

.issue-checkbox.active {
  visibility: visible !important;
}

.issueOverlay {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: transparent;
  z-index: 1;
}
</style>