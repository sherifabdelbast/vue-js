<script setup>
import {usePostData} from "~/composables/usePostData";
import {useToast} from "vue-toastification";
import {useProjectStore} from "~/stores/useProjectStore";
import {useAppStore} from "~/stores/useAppStore";
import {storeToRefs} from "pinia";

const route = useRoute();

const {user} = useAuth();
const toast = useToast();

const props = defineProps(["issue", "toggleView", "sprintLength", "index", "isActive"]);

const appStore = useAppStore();
const projectStore = useProjectStore();
const {activeIssue, memberPermissions} = storeToRefs(projectStore);
const {updateIssueInfoFromOutside, deleteIssue} = usePostData();

const fetchIssueDetails = async (projectId, issueId) => {
  await projectStore.refreshIssueDetails(projectId, issueId);
  await projectStore.refreshComments(projectId, issueId);
}

const activateIssue = () => {
  activeIssue.value = props.issue?.id;
};
const handleOpenIssueDetails = async () => {
  props.toggleView();
  appStore.permissionLocation = "in";
  await fetchIssueDetails(route.params.id, props.issue?.id);
}

const isEditing = ref(false);

const createIssueParent = ref(null);

const closeIssueTitleEdit = () => {
  isEditing.value = false;
  editIssue.value.title = "";
  validationErrors.title = null;
  oldIssueTitle.title = null;
}

const editIssueItem = {
  label: 'Edit',
  icon: 'pi pi-fw pi-pencil',
  command: () => {
    isEditing.value = true;
    editIssue.value.title = props.issue?.title;
    oldIssueTitle.title = props.issue?.title;

    setTimeout(() => createIssueParent.value.querySelector('textarea').focus(), 0);
  },
}
const deleteIssueItem = {
  label: 'Delete',
  icon: 'pi pi-fw pi-trash',
  command: () => handleDeleteIssue(),
}

const menu = ref();
const items = ref([]);

if (memberPermissions.value.includes('edit issue')) {
  items.value.push(editIssueItem);
}

if (memberPermissions.value.includes('delete issue')) {
  items.value.push(deleteIssueItem);
}

const toggle = (event) => menu.value.toggle(event);

const oldIssueTitle = {
  title: "",
}

const editIssue = ref({
  title: ""
});

const validationErrors = reactive({
  title: null,
  allValid: true,
});

const handleUpdateIssueTitle = async () => {
  validationErrors.title = null;
  validationErrors.allValid = true;

  editIssue.value.title = (editIssue.value.title).trim();

  if (!editIssue.value) {
    validationErrors.title = "Issue title is required";
    validationErrors.allValid = false;
  } else if (editIssue.value.length > 255) {
    validationErrors.title = "Issue title can't be more than 255 characters";
    validationErrors.allValid = false;
  }

  if (validationErrors.allValid) {
    if (oldIssueTitle.title !== editIssue.value.title) {
      await submit();
      return;
    } else {
      closeIssueTitleEdit();
      return;
    }
  }
}

const {
  submit,
  inProgress,
  validationErrors: errors,
} = useSubmit(() => updateIssueInfoFromOutside(route.params.id, props.issue?.id, {title: editIssue.value.title}), {
      onSuccess: async (response) => {
        if (response.code === 200) {
          isEditing.value = false;
          toast.success(response.message, {
            position: "bottom-left",
            timeout: 1500,
          });
          await projectStore.refreshProjectBoard(route.params.id);
        }
      },
      onError: async (error) => {
      },
    }
);

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
        await projectStore.refreshProjectBoard(route?.params?.id);
      }
    },
  });
};
</script>

<template>
  <div class="card mb-3 bg-light rounded-1 cursor-pointer border"
       :class="issue?.id === activeIssue ? 'active-issue-board' : ''">
    <div class="card-body p-3">
      <div style="z-index: 10 !important;" ref="createIssueParent" class="position-relative">
        <div v-if="isEditing" v-click-outside="closeIssueTitleEdit">
          <FormTextArea name="editTitle" placeholder="Edit Issue Title"
                        labelText="Edit Issue Title"
                        :addBg="true"
                        @keydown.enter.prevent="handleUpdateIssueTitle"
                        @keyup.esc="closeIssueTitleEdit"
                        v-model:input="editIssue.title"
                        :formDataError="validationErrors?.title || errors?.title"/>

          <div class="position-relative mt-3">
            <div class="position-absolute d-flex align-items-center gap-2" style="right: 0;">
              <button @click="handleUpdateIssueTitle"
                      class="btn btn-light-primary shadow btn-center btn-sm cursor-pointer"
                      :disabled="inProgress">
                <img v-if="inProgress" src="/assets/media/email/spinner.svg" width="16">
                <span v-else>Save</span>
              </button>
              <button @click="closeIssueTitleEdit" class="btn btn-light-danger shadow btn-center btn-sm cursor-pointer"
                      :disabled="inProgress">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!isEditing" class="d-flex justify-content-between">
        <p>{{ issue?.title }}</p>
        <div @click="toggle" aria-haspopup="true" aria-controls="overlay_menu" v-can="['edit issue', 'delete issue']"
             class="p-2 bg-light rounded-1 text-gray-600 text-hover-gray-800"
             style="height: fit-content" :style="`z-index: ${sprintLength - index + 1}`">
          <Icon name="mdi:dots-horizontal" size="20"/>
          <Menu ref="menu" id="overlay_menu" :model="items" :popup="true"
                :pt="{
                  root: { class: 'w-125px' },
              }"
          />
        </div>
      </div>

      <div class="d-flex align-items-center justify-content-between mt-4">
        <DropDownMenuAssignedTo :assignedTo="issue?.team_member" :issueId="issue?.id" :projectId="route.params.id"
                                from="board" :style="`z-index: ${sprintLength - index + 10}`"/>
        <div class="d-flex align-items-center">
          <span class="me-2 flex-shrink-0" style="z-index: 10;" v-can="'edit issue'">
            <DropDownMenuIssueType
                :projectId="route.params.id"
                :issueId="issue?.id"
                :issueType="issue?.type"
            />
          </span>

          <span class="ms-3 me-2 flex-shrink-0" v-can:not="'edit issue'">
            <img v-if="issue?.type === 'task'" src="../../assets/media/svg/types/task.svg" alt="task" width="14">
            <img v-if="issue?.type === 'story'" src="../../assets/media/svg/types/story.svg" alt="story" width="14">
            <img v-if="issue?.type === 'bug'" src="../../assets/media/svg/types/bug.svg" alt="bug" width="14">
          </span>

          <span class="fs-7 text-muted text-uppercase text-nowrap flex-shrink-0 me-2">{{ issue?.key }}</span>

          <div v-if="issue?.estimated_at">
            <div class="d-flex align-items-center gap-2 me-2"
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

          <DropDownMenuProirity :selectedPriority="issue?.priority" :issueId="issue?.id" :projectId="route.params.id"
                                :style="`z-index: ${sprintLength - index + 20}`"
                                from="board"
          />
        </div>
      </div>

      <div class="issueOverlay rounded-1" @click="handleOpenIssueDetails(); activateIssue();"></div>
    </div>
  </div>
</template>

<style scoped>
.card {
  margin-bottom: 1.5rem;
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, .025);
}

.card {
  position: relative;
  display: -ms-flexbox;
  display: flex;
  -ms-flex-direction: column;
  flex-direction: column;
  word-wrap: break-word;
  transition: all 0.3s ease !important;
}

.card:hover {
  background-color: var(--bs-gray-200) !important;
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