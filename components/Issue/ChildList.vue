<script setup>
import {useProjectStore} from "~/stores/useProjectStore";
import {useAppStore} from "~/stores/useAppStore";
import {usePostData} from "~/composables/usePostData";
import {useToast} from "vue-toastification";
import {storeToRefs} from "pinia";

const emits = defineEmits(["issueSelect"]);

const toast = useToast()
const {deleteIssue, updateIssueInfo} = usePostData();
const projectStore = useProjectStore();
const appStore = useAppStore();

const {backlog, activeIssue, issueDetails, isDataLoaded, memberPermissions} = storeToRefs(projectStore);
const route = useRoute();
const fetchIssueDetails = async (projectId, issueId) => {
  await projectStore.refreshIssueDetails(projectId, issueId);
  await projectStore.refreshComments(projectId, issueId);
}

const props = defineProps(["issue", "toggleView", "index", "sprintLength", "elementsId", "isActive", "isIssuesSelected"]);
const activateIssue = () => {
  activeIssue.value = props.issue?.id;
};
const handleOpenIssueDetails = async () => {
  // props.toggleView();
  await fetchIssueDetails(route.params.id, props.issue?.id);
}

const handleDeleteSubIssue = () => {
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
      const response = await deleteIssue(issueDetails?.value.project?.project_identify, props.issue?.id);
      if (response?.code === 200) {
        toast.success(response?.message, {
          position: "bottom-left",
          timeout: 2000,
        });
        await projectStore.refreshIssueDetails(issueDetails?.value.project?.project_identify, issueDetails?.value.id);
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
} = useSubmit(() => updateIssueInfo(issueDetails?.value.project?.project_identify, props.issue?.id, {title: editIssueTitle.value.title}), {
      onSuccess: async (response) => {
        if (response.code === 200) {
          toast.success(response.message, {
            position: "bottom-left",
            timeout: 1500,
          });
          await projectStore.refreshIssueDetails(issueDetails?.value.project?.project_identify, issueDetails?.value.id);
          editIssueLoading.value = false;
        }
      }
    }
);

const checked = ref(false);

const checkChange = () => emits("issueSelect", {id: props.issue?.id, checked: checked.value});

const deleteIssueItem = {
  label: 'Delete',
  icon: 'pi pi-fw pi-trash',
  command: () => handleDeleteSubIssue(),
}

const menu = ref();
const items = ref([]);

if (appStore.permissionLocation === "in") {
  if (memberPermissions.value.includes('delete issue')) {
    items.value.push(deleteIssueItem);
  }
} else if (appStore.permissionLocation === "out") {
  if (appStore.permissionsOutsideProjects.includes('delete issue')) {
    items.value.push(deleteIssueItem);
  }
}

const toggle = (event) => menu.value.toggle(event);
const showSubIssueDetails = async () => {
  isDataLoaded.value = false;
  await projectStore.refreshComments(issueDetails?.value.project?.project_identify, props.issue?.id);
  await projectStore.refreshIssueDetails(issueDetails?.value.project?.project_identify, props.issue?.id);
  isDataLoaded.value = true;
}
</script>

<template>
  <div ref="createIssueParent"
       class="issue-container d-flex align-items-center justify-content-between cursor-pointer py-2 ps-4 pe-6 border border-bottom-0 position-relative child-list">
    <div v-if="isEditIssueTitleOpen" v-click-outside="closeIssueTitleEdit"
         v-can="{perms: 'edit issue', location: appStore.permissionLocation}"
         class="issue-title-edit w-75 d-flex align-items-center position-relative" style="z-index: 10000 !important;">
      <FormInput type="text" autocomplete="off" @keyup.enter="handleUpdateIssueTitle" @click.stop
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

    <div v-else class="issue-parent d-flex align-items-center me-4 overflow-hidden">
      <div class="me-2 flex-shrink-0 issueType-style" :style="`z-index: ${1000 - index + 10}`">
        <DropDownMenuChildIssueType
            :projectId="issue?.project_identify"
            :issueId="issue?.id"
            :issueType="issue?.type"
            from="subIssue"
            customStyle="p-1"
        />
      </div>

      <div @mouseenter="showIssueTitleEditIcon" @mouseleave="hideIssueTitleEditIcon"
           v-can="{perms: 'edit issue', location: appStore.permissionLocation}"
           class="d-flex align-items-center title-container overflow-hidden ms-8">

        <span class="fs-7 text-muted me-2 text-uppercase text-nowrap flex-shrink-0">{{ issue?.key }}</span>

        <p ref="issueTitleRef" class="issue-title text-gray-800 me-2 truncate text-nowrap fs-6"
           style="line-height: 1 !important;" @click="showSubIssueDetails(); activateIssue();">
          {{ issue?.title }}
        </p>

        <span v-if="editIssueTitleIcon" @click="openEditIssueTitle" class="text-gray-500 text-hover-gray-800 me-2">
          <Icon name="material-symbols:edit-outline" size="18"/>
        </span>

        <span v-if="editIssueLoading"><Icon name="svg-spinners:180-ring-with-bg" size="16"/></span>
      </div>

      <div class="d-flex align-items-center title-container overflow-hidden ms-2"
           v-can:not="{perms: 'edit issue', location: appStore.permissionLocation}">

        <span class="fs-7 text-muted me-2 text-uppercase text-nowrap flex-shrink-0">{{ issue?.key }}</span>

        <p ref="issueTitleRef" class="issue-title text-gray-800 me-2 truncate text-nowrap fs-6"
           style="line-height: 1 !important;" @click="showSubIssueDetails(); activateIssue();">
          {{ issue?.title }}
        </p>
      </div>

      <div class="d-flex align-items-center gap-2"
           v-if="issue?.estimated_at[0] || issue?.estimated_at[1] || issue?.estimated_at[2]">
        <div class="badge badge-light-dark" v-if="issue?.estimated_at[0]">
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

    <div ref="issueActionsRef" class="issue-info d-flex align-items-center justify-content-between flex-shrink-0">
      <DropDownMenuChildStatuses :assignedStatus="issue?.status"
                                 :issueId="issue?.id"
                                 :projectId="issue?.project_identify"
                                 from="subIssue"
                                 :style="`z-index: ${1000 - index + 10}`"
      />

      <DropDownMenuChildAssignedTo :assignedTo="issue?.team_member"
                                   :issueId="issue?.id"
                                   :projectId="issue?.project_identify"
                                   from="subIssue"
                                   class="ms-10"
                                   :style="`z-index: ${10000 - index + 2}`"/>

      <div @click="toggle" aria-haspopup="true" aria-controls="overlay_menu"
           v-can="{perms: 'delete issue', location: appStore.permissionLocation}"
           class="p-2 rounded-1 text-gray-600 bg-hover-white ms-8"
           style="height: fit-content; transition: all 0.3s ease" :style="`z-index: ${1000 - index + 1}`">
        <Icon name="mdi:dots-horizontal" size="20"/>
        <TieredMenu ref="menu" id="overlay_menu" :model="items" :popup="true"
                    :pt="{
                        root: { class: 'w-125px' },
                    }"
        />
      </div>
    </div>

    <div class="issueOverlay" @click="showSubIssueDetails()"></div>
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

.child-list:first-of-type {
  border-top-right-radius: var(--bs-border-radius-sm) !important;
  border-top-left-radius: var(--bs-border-radius-sm) !important;
}
</style>

<!--:class="{'bg-light-success border-success border-start border-2 border-bottom-0': checked || issue?.id === activeIssue}"-->