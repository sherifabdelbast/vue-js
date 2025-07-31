<script setup>
import {useProjectStore} from "~/stores/useProjectStore";
import {useAppStore} from "~/stores/useAppStore";
import moment from "moment";
import {usePostData} from "~/composables/usePostData";
import {storeToRefs} from "pinia";
import {QuillEditor} from "@vueup/vue-quill";
import {useToast} from "vue-toastification";

const props = defineProps(['comment', 'projectId', "issueId"]);

const route = useRoute();
const appStore = useAppStore();
const projectStore = useProjectStore();
const {deleteComment, editComment, editSubIssueComment, deleteSubIssueComment} = usePostData();
const {user} = useAuth();
const {project, acceptedTeam, teamMembersYourWork, issueDetails, memberPermissions} = storeToRefs(projectStore);
const toast = useToast();
const handleDeleteComment = (commentId) => {
  Swal.fire({
    html: `Are you sure you want to remove your comment?`,
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
      const response = await deleteComment(issueDetails?.value.project?.project_identify, issueDetails?.value.id, commentId);
      if (response.code === 200) {
        await projectStore.refreshComments(issueDetails?.value.project?.project_identify, issueDetails?.value.id);
      }
    },
  });
};

const isEditing = ref(false);
const openTextEditor = () => {
  isEditing.value = true;
  validationErrors.commentContent = null;
};

const oldValue = {
  content: props.comment.content
};
const newValue = reactive({content: props.comment.content});
const validationErrors = reactive({
  commentContent: null,
});

const isContentEmpty = computed(() => {
  // Check if inputComputed.value contains only empty tags
  return /^(<[^>]*>\s*)+$/.test(newValue.content);
});

const closeTextEditor = () => {
  isEditing.value = false;
  if (oldValue.content !== newValue.content) {
    newValue.content = oldValue.content;
  }
};
const handleSubmit = async () => {
  const mentionList = document.querySelectorAll(".ql-editor .mention");
  projectStore.mentionedUserIds = Array.from(new Set(
      [...mentionList].map(e => parseInt(e.getAttribute("data-id"), 10))
          .filter(Number.isInteger)
  ));

  if (isContentEmpty.value) {
    validationErrors.commentContent = "Please ensure that you entered a comment.";
    return;
  }
  if (oldValue.content === newValue.content) {
    isEditing.value = false;
    validationErrors.commentContent = null;
    return;
  }
  newValue.mentionList = [...projectStore.mentionedUserIds];
  validationErrors.commentContent = null;
  oldValue.content = newValue.content;
  submit();
}
const {
  submit,
  inProgress,
  validationErrors: errors
} = useSubmit(() => editComment(issueDetails?.value.project?.project_identify, issueDetails?.value.id, props.comment.id, newValue),
    {
      onSuccess: async (response) => {
        isEditing.value = false;
        toast.success("Comment added successfully." || response.message, {
          position: "bottom-left"
        });
        projectStore.mentionedUserIds = null;
      },
      onError: async (error) => {
        console.log(error)
      }
    }
);

const editCommentItem = {
  label: 'Edit',
  icon: 'pi pi-fw pi-pencil',
  command: () => openTextEditor(),
}
const deleteCommentItem = {
  label: 'Delete',
  icon: 'pi pi-fw pi-trash',
  command: () => handleDeleteComment(props.comment.id),
}

const menu = ref();
const items = ref([]);

if (appStore.permissionLocation === "in") {
  if (memberPermissions.value.includes('edit comment')) {
    items.value.push(editCommentItem);
  }

  if (memberPermissions.value.includes('delete comment')) {
    items.value.push(deleteCommentItem);
  }
} else if (appStore.permissionLocation === "out") {
  if (appStore.permissionsOutsideProjects.includes('edit comment')) {
    items.value.push(editCommentItem);
  }

  if (appStore.permissionsOutsideProjects.includes('delete comment')) {
    items.value.push(deleteCommentItem);
  }
}

const toggle = (event) => menu.value.toggle(event);
const onReady = (editor) => {
  editor.focus();

  const editorElement = document.querySelector('.ql-editor');

  if (editorElement) {
    editorElement.focus();
    const range = document.createRange();
    const selection = window.getSelection();
    range.setStart(editorElement, editorElement.childNodes.length);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }
};
const editorOptions = computed(() => {
  if (route.name === "your-work") {
    return createEditorOptions(teamMembersYourWork);
  }
  return createEditorOptions(acceptedTeam);
});
</script>

<template>
  <div class="w-100">
    <div class="d-flex align-items-start gap-2">
      <Avatar :user="comment?.user" imgWidth="35"/>
      <div class="w-100">
        <div class="d-flex justify-content-between">
          <div class="d-flex align-items-center gap-2">
            <span class="truncate mr-2" style="max-width: 300px">{{ comment?.user?.name }}</span>
            <span class="bg-light-primary px-1 custom-round fs-9"
                  style="height: fit-content;">{{ moment(comment?.created_at).startOf('minutes').fromNow() }}</span>
          </div>
          <div v-if="user.id === project?.user_id || user.id === comment?.user?.id" @click="toggle" aria-haspopup="true"
               v-can="{perms: ['edit comment', 'delete comment'], location: appStore.permissionLocation}"
               aria-controls="overlay_menu"
               class="p-2 bg-light rounded-1 text-gray-600 text-hover-gray-800 cursor-pointer"
               style="height: fit-content">
            <Icon name="mdi:dots-horizontal" size="20"/>
            <Menu ref="menu" id="overlay_menu" :model="items" :popup="true"
                  :pt="{root: { class: 'w-125px' },}"
            />
          </div>
        </div>
        <div v-if="!isEditing" class="mt-2" v-html="newValue.content"></div>
        <div v-else class="w-100 mt-2">
          <QuillEditor
              v-model:content="newValue.content"
              :options="editorOptions"
              contentType="html"
              id="quill-editor"
              theme="snow"
              placeholder="Add comment..."
              style="min-height: 80px"
              @keydown.ctrl.enter.prevent="handleSubmit"
              @keydown.esc.prevent="closeTextEditor"
              @ready="onReady"
          />
          <div class="d-flex justify-content-between">
            <div v-if="validationErrors.commentContent" class="w-100 text-start mt-1">
              <span class="form-data-error m-0">{{ validationErrors.commentContent }}</span>
            </div>
            <div class="w-100 d-flex align-items-center justify-content-end gap-2 mt-2"
                 style="right: 0">
              <button @click="handleSubmit"
                      class="btn btn-primary btn-flex btn-center btn-sm cursor-pointer custom-button">
                <div v-if="inProgress" class="text-center">
                  <Icon name="svg-spinners:180-ring-with-bg" size="15"/>
                </div>
                <span v-else>Save</span>
              </button>
              <button @click="closeTextEditor" id="closePlease"
                      class="btn btn-light-danger btn-flex btn-center btn-sm cursor-pointer custom-button">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.swal2-container {
  z-index: 100000 !important;
}
</style>