<script setup>
import draggable from 'vuedraggable';
import {usePostData} from "~/composables/usePostData";
import {Collapse} from "vue-collapsed";
import {useProjectStore} from "~/stores/useProjectStore";
import {storeToRefs} from "pinia";
import {useToast} from 'vue-toastification';
import {helpers, maxLength, required, minLength} from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";

const route = useRoute();

const props = defineProps(["status", "index", "totalIssuesLength", "totalStatusesLength", "toggleView"]);

// === stores === //
const projectStore = useProjectStore();
const {project, deleteStatusInfo, board, selectedMoveStatus, memberPermissions} = storeToRefs(projectStore);
const toast = useToast();

const {user} = useAuth();

const {moveBoardIssue, updateStatusInfo, createStatus} = usePostData();

const addedIssueId = ref(null);
const addedIssueOrder = ref(null);

const onIssueChange = async (e) => {
  let issueAdded = e.added;
  let issueMoved = e.moved;

  if (issueMoved) {
    await moveBoardIssue(route.params.id, issueMoved.element.id, {
      status_id: issueMoved.element.status_id,
      order_by_status: issueMoved.newIndex + 1
    });
  }

  if (!issueAdded) return null;

  addedIssueId.value = issueAdded.element.id;
  addedIssueOrder.value = issueAdded.newIndex + 1;
}

const onIssueAdded = async (e) => {
  let toId = e.to.id;

  await handleMoveIssue(toId, addedIssueOrder.value);
}

const handleMoveIssue = async (statusId, newIssueOrder) => {
  await moveBoardIssue(route.params?.id, addedIssueId.value, {status_id: statusId, order_by_status: newIssueOrder});
}

onBeforeMount(() => {
  const collapseSprint = localStorage.getItem(`collapseColumn${props.status?.project_id}-${props.status?.id}-${user.value.id}`);

  if (collapseSprint) {
    isExpanded.value = (collapseSprint === "true");
    return;
  }

  localStorage.setItem(`collapseColumn${props.status?.project_id}-${props.status?.id}-${user.value.id}`, "true");
});

const isExpanded = ref(true);

const handleCollapse = () => {
  isExpanded.value = !isExpanded.value;
  localStorage.setItem(`collapseColumn${props.status?.project_id}-${props.status?.id}-${user.value.id}`, `${isExpanded.value}`);
}

const editStatusItem = {
  label: 'Edit',
  command: () => openEditStatusName(),
}
const limitStatusItem = {
  label: 'Limit',
  command: () => openEditLimit(),
}
const deleteStatusItem = {
  label: 'Delete',
  command: () => {
    deleteStatusInfo.value.changeStatusOptions = [];
    deleteStatusInfo.value.project_id = props.status?.project_id;
    deleteStatusInfo.value.id = props.status?.id;
    deleteStatusInfo.value.name = props.status?.name;
    deleteStatusInfo.value.type = props.status?.type;

    board.value?.board?.forEach((status) => {
      if (status?.id !== props.status?.id) {
        deleteStatusInfo.value.changeStatusOptions.push({name: status?.name, id: status?.id});
      }
    });

    selectedMoveStatus.value = deleteStatusInfo.value.changeStatusOptions[0];

    new bootstrap.Modal("#kt_modal_delete_status").show();
  }
}

const menu = ref();
const items = ref([]);

if (memberPermissions.value.includes('edit status')) {
  items.value.push(editStatusItem);
  items.value.push(limitStatusItem);
}

if (memberPermissions.value.includes('delete status')) {
  items.value.push(deleteStatusItem);
}

const toggle = (event) => menu.value.toggle(event);

const columnHead = ref(null);

const limitInputParent = ref(null);
const editStatusNameParent = ref(null);
const isEditLimit = ref(false);
const closeEditLimit = () => {
  isEditLimit.value = false;
  columnLimit.value = 0;
}
const openEditLimit = () => {
  isEditLimit.value = true;
  columnLimit.value = props.status?.max;
  oldLimitValue.value = props.status?.max;

  setTimeout(() => limitInputParent.value.querySelector('input').focus(), 0);
}

const isEditName = ref(false);
const editStatusData = ref({
  name: props.status?.name,
});
const oldEditStatusData = ref({
  name: props.status?.name,
});
const oldLimitValue = ref(null);
const columnLimit = ref(0);

const openEditStatusName = () => {
  isEditName.value = true;
  editStatusData.value.name = props.status?.name;
  oldEditStatusData.value.name = props.status?.name;
  columnLimit.value = props.status?.max;

  setTimeout(() => editStatusNameParent.value.querySelector('input').focus(), 0);
}
const closeEditStatusName = () => {
  isEditName.value = false;
  validationErrors.name = null;
  columnHead.value.style.height = `66.95px`;
}

const rules = {
  name: {
    required: helpers.withMessage('Status name is required', required),
    maxLength: helpers.withMessage("Status name can't be more than 20 characters", maxLength(20)),
  }
}

const v2$ = useVuelidate(rules, editStatusData.value);

const updateNumberValue = () => {
  if (isNaN(columnLimit.value)) {
    columnLimit.value = 0;
  }

  if (String(columnLimit.value).length > 3) {
    const numbersList = Array.from(String(columnLimit.value));
    columnLimit.value = parseInt((numbersList.slice(0, 3)).join(''), 10);
  }
}

const handleUpdate = async () => {
  validationErrors.name = null;
  const result = await v2$.value.$validate();

  if (result) {
    if (oldLimitValue.value !== columnLimit.value || oldEditStatusData.value.name !== editStatusData.value.name) {
      if (!columnLimit.value) {
        columnLimit.value = 0;
      }

      await submit();
      return;
    } else {
      closeEditLimit();
      closeEditStatusName();
      return;
    }
  }

  validationErrors.name = v2$.value?.name?.$errors[0]?.$message;
  columnHead.value.style.height = `${editStatusNameParent.value.offsetHeight + 25}px`;
}

const {
  submit,
  inProgress,
  validationErrors: errors,
} = useSubmit(() => updateStatusInfo(route.params.id, props.status?.id, {
      name: editStatusData.value.name,
      max: columnLimit.value
    }), {
      onSuccess: async (response) => {
        if (response.code === 200) {
          closeEditLimit();
          closeEditStatusName();
          toast.success(response.message, {
            position: "bottom-left",
            timeout: 1500,
          });
          await projectStore.refreshProjectBoard(route.params.id);
        }
      }
    }
);

const isCreatingStatus = ref(false);
const createStatusParent = ref(null);
const createLoading = ref(false);

const createStatusFormData = ref({
  name: ""
});

const validationErrors = reactive({
  name: null,
});

const v$ = useVuelidate(rules, createStatusFormData.value);

const handleCreateStatus = async () => {
  validationErrors.name = null;

  const result = await v$.value.$validate();

  if (result) {
    try {
      createLoading.value = true;
      const response = await createStatus(route.params.id, {
        name: createStatusFormData.value.name.toUpperCase(),
        order: props.status?.order + 1
      });
      createLoading.value = false;
      if (response?.code === 201) {
        toast.success(response?.message);
        await projectStore.refreshProjectBoard(route.params.id);

        closeCreateStatus();
      }
    } catch (error) {
      toast.error(error?.data);
      createLoading.value = false;
      if (error?.statusCode === 422) {
        validationErrors.name = error?.data?.errors?.name[0];
      }
    }
  }

  validationErrors.name = v$.value?.name?.$errors[0]?.$message;
}

const openCreateStatus = () => {
  isCreatingStatus.value = true;

  setTimeout(() => createStatusParent.value.querySelector('input').focus(), 0);
}

const closeCreateStatus = () => {
  isCreatingStatus.value = false;
  createStatusFormData.value.name = "";
  validationErrors.name = null;
}
</script>

<template>
  <div class="d-flex gap-4">
    <div class="board-column position-relative" style="width: 295px !important; min-width: 295px !important;">
      <div class="bg-white rounded">
        <div ref="columnHead"
             class="column-head rounded-top border-bottom py-5 px-5 d-flex align-items-center justify-content-between position-relative handle"
             :class="status?.max && status?.issues?.length > status?.max ? 'bg-light-danger' : '' "
             :style="!isExpanded ? 'border: none !important' : ''">
          <div @click="handleCollapse" class="card-title d-flex align-items-center fw-bold cursor-pointer"
          >
            <TooltipMain :content="status?.name" placement="top-start" class="fs-8">
              <p class="fs-6 text-uppercase text-nowrap truncate" style="max-width: 100px">{{status?.name}}</p>
            </TooltipMain>
            <div class="me-1 mb-2">
              <Icon v-if="isExpanded" name="ic:outline-keyboard-arrow-up" size="18" class="m-0"/>
              <Icon v-else name="ic:outline-keyboard-arrow-down" size="18" class="m-0"/>
            </div>
            <span class="badge rounded-pill fs-7 m-0" :class="status?.type === 'TO DO' ? 'badge-light-dark' : status?.type === 'DONE' ? 'badge-light-primary' : 'badge-light-success' ">{{status?.issues.length}}</span>
          </div>

          <div v-if="status?.max" class="badge rounded-pill text-uppercase"
               :class="status?.issues?.length > status?.max ? 'badge-danger' : 'badge-light-dark' ">max {{ status?.max }}
          </div>

          <div @click="toggle" aria-haspopup="true" aria-controls="overlay_menu" v-can="['edit status', 'delete status']"
               class="p-2 bg-light rounded-1 text-gray-600 text-hover-gray-800 cursor-pointer"
               style="height: fit-content">
            <Icon name="mdi:dots-horizontal" size="20"/>
            <Menu ref="menu" id="overlay_menu" :model="items" :popup="true"
                  :pt="{
                    root: { class: 'w-125px' },
                }"
            />
          </div>
          <div v-if="isEditLimit" ref="limitInputParent" v-click-outside="closeEditLimit"
               class="issue-title-edit d-flex align-items-center position-absolute px-3"
               style="z-index: 10; left: 0; top: 0 !important; width: 100% !important; height: 100% !important;">
            <FormInput type="number" autocomplete="off" labelText="Set Limit" name="limit"
                       placeholder="Set Limit"
                       v-model:input="columnLimit"
                       @keyup.enter="handleUpdate"
                       @keyup.esc="closeEditLimit"
                       @input="updateNumberValue"
                       :formDataError="errors?.name"/>

            <div class="position-relative mt-13">
              <div class="position-absolute d-flex align-items-center gap-2" style="right: 0;">
                <button @click="handleUpdate"
                        class="btn btn-light-primary shadow btn-center btn-sm cursor-pointer"
                        :disabled="inProgress">
                  <img v-if="inProgress" src="../../assets/media/email/spinner.svg" width="16">
                  <span v-else>Save</span>
                </button>
                <button @click="closeEditLimit" class="btn btn-light-danger shadow btn-center btn-sm cursor-pointer"
                        :disabled="inProgress">
                  Cancel
                </button>
              </div>
            </div>
          </div>
          <div v-if="isEditName" ref="editStatusNameParent" v-click-outside="closeEditStatusName"
               class="issue-title-edit d-flex align-items-center position-absolute px-3"
               style="z-index: 10; left: 0; top: 0 !important; width: 100% !important; height: 100% !important;">
            <FormInput type="text" autocomplete="off" labelText="Status name" name="status_name" class="w-100"
                       placeholder="Edit status"
                       v-model:input="editStatusData.name"
                       @keyup.enter="handleUpdate"
                       @keyup.esc="closeEditStatusName"
                       :uppercase="true"
                       :formDataError="validationErrors.name || errors?.name"/>

            <div class="position-relative mt-13">
              <div class="position-absolute d-flex align-items-center gap-2" style="right: 0; bottom: -45px !important;">
                <button @click="handleUpdate"
                        class="btn btn-light-primary shadow btn-center btn-sm cursor-pointer"
                        :disabled="inProgress">
                  <img v-if="inProgress" src="../../assets/media/email/spinner.svg" width="16">
                  <span v-else>Save</span>
                </button>
                <button @click="closeEditStatusName" class="btn btn-light-danger shadow btn-center btn-sm cursor-pointer"
                        :disabled="inProgress">
                  Cancel
                </button>
              </div>
            </div>
          </div>

        </div>
        <Collapse :when="isExpanded">
          <div v-if="index === 0 && totalIssuesLength <= 0" class="w-100"
               style="min-height: 570px !important; max-height: 570px !important;">
            <div class="px-12 pt-4">
              <img src="../../assets/media/illustrations/misc/empty-board.png" alt="empty board" class="img-fluid">
            </div>
            <div class="text-center">
              <p class="mb-8">Plan and start a sprint to see <br> issues here.</p>
              <NuxtLink :to="`/projects/${route.params.id}/backlog`"
                        class="bg-light-dark text-dark py-3 px-6 rounded-1 fs-7 fw-semibold cursor-pointer bg-hover-secondary"
                        style="transition: all 0.3s ease">Go to backlog
              </NuxtLink>
            </div>
          </div>
          <draggable
              v-can="'move issue board'"
              v-else
              v-model="status.issues"
              group="issues"
              item-key="id"
              :id="status.id"
              drag-class="draging"
              ghost-class="ghost"
              @change="onIssueChange"
              @add="onIssueAdded"
              class="card-body p-3 overflow-y-auto overflow-x-hidden"
              style="min-height: 570px !important; max-height: 570px !important;"
          >
            <template #item="{element: issue, index}">
              <IssueBoard :issue="issue" :toggleView="toggleView" :index="index" :sprintLength="status?.issues.length"/>
            </template>
          </draggable>

          <div v-can:not="'move issue board'" class="card-body p-3 overflow-y-auto overflow-x-hidden" style="min-height: 570px !important; max-height: 570px !important;">
            <IssueBoard v-for="(issue, index) in status.issues" :key="index" :issue="issue" :toggleView="toggleView" :index="index"
                        :sprintLength="status?.issues.length"/>
          </div>
        </Collapse>
      </div>

      <div v-if="!isCreatingStatus" @click="openCreateStatus" v-can="'create status'"
           class="add-columns-between cursor-pointer bg-success text-white position-absolute shadow w-25px h-25px rounded-1 d-flex align-items-center justify-content-center"
           style="height: fit-content; width: fit-content; top: 22px; right: -20px; z-index: 100">
        <Icon name="material-symbols:add" size="14"/>
        <div class="position-absolute w-3px h-600px bg-success rounded"
             style="top: 16px; left: 50%; transform: translateX(-50%)"></div>
      </div>
    </div>

    <div v-if="isCreatingStatus" ref="createStatusParent" class="min-w-250px" style="height: fit-content"
         v-click-outside="closeCreateStatus">
      <div class="w-100">
        <div class="position-relative">
          <input
              type="text"
              class="px-4 rounded border d-block"
              style="width: 100% !important; height: 50px !important; outline: none;"
              name="statusName"
              autocomplete="off"
              placeholder="Status Name"
              v-model="createStatusFormData.name"
              :class="{'border-danger': validationErrors?.name }"
              @keydown.enter="handleCreateStatus"
              @keydown.esc="closeCreateStatus"
          />
          <p class="form-data-error">{{ validationErrors?.name }}</p>

          <div class="position-absolute d-flex align-items-center gap-2" style="right: 0;"
               :style="validationErrors?.name ? 'bottom: -45px;' : 'bottom: -40px;' ">
            <button @click="handleCreateStatus" class="btn btn-light-primary shadow btn-center btn-sm cursor-pointer">
              <img v-if="createLoading" src="../../assets/media/email/spinner.svg" width="16">
              <span v-else>Save</span>
            </button>
            <button @click="closeCreateStatus" class="btn btn-light-danger shadow btn-center btn-sm cursor-pointer">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.board-column {
  transition: all 0.3s ease !important;
}

.add-columns-between {
  transition: all 0.5s ease;
  opacity: 0;
}

.add-columns-between:hover {
//animation-name: fade-create-status; //animation-timing-function: ease; //animation-duration: 0.8s; //animation-iteration-count: 1; opacity: 1;
}

@keyframes fade-create-status {
  0% {
    opacity: 0;
  }
  65% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>