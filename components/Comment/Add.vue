<script setup>
import {QuillEditor, Quill} from "@vueup/vue-quill";
import {useProjectStore} from "~/stores/useProjectStore";
import {usePostData} from "~/composables/usePostData";
import {useToast} from "vue-toastification";
import {storeToRefs} from "pinia";

const route = useRoute();
const toast = useToast();
const props = defineProps(['projectId', 'issueId'])
const projectStore = useProjectStore();
const {acceptedTeam, teamMembersYourWork, issueDetails} = storeToRefs(projectStore);
const {createComment, createSubIssueComment} = usePostData();

const isEditing = ref(false);

const formData = reactive({
  content: "",
});
const openTextEditor = () => {
  isEditing.value = true;
};
const validationErrors = reactive({
  commentContent: null,
});
const closeTextEditor = () => {
  isEditing.value = false;
  formData.content = "";
  validationErrors.commentContent = null;
};

const handleSubmit = async () => {
  const mentionList = document.querySelectorAll(".ql-editor .mention");
  projectStore.mentionedUserIds = Array.from(new Set(
      [...mentionList].map(e => parseInt(e.getAttribute("data-id"), 10))
          .filter(Number.isInteger)
  ));

  if (formData.content.trim() === "") {
    validationErrors.commentContent = "Please ensure that you entered a comment.";
    return;
  }
  formData.mentionList = [...projectStore.mentionedUserIds];
  validationErrors.commentContent = null;
  submit();
}

const {
  submit,
  inProgress,
  validationErrors: errors
} = useSubmit(() => createComment(issueDetails?.value.project?.project_identify, issueDetails.value.id, formData), {
      onSuccess: async (response) => {
        projectStore.addCommentLoading = true;
        projectStore.mentionedUserIds = null;
        if (response.code === 201) {
          closeTextEditor();
          toast.success("Comment added successfully." || response.message, {
            position: "bottom-left"
          });
          await projectStore.refreshComments(issueDetails?.value.project?.project_identify, issueDetails?.value.id);
        }
        projectStore.addCommentLoading = false;
      },
      onError: async (error) => {
        console.log(error);
      }
    }
);

const showUserList = ref(false);
const handleKeyPress = (event) => {
  if (event.shiftKey && event.keyCode === 50) {
    showUserList.value = !showUserList.value;
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyPress);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyPress);
});

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
  <div v-if="!isEditing" @click="openTextEditor"
       class="d-block p-3 rounded-1 border w-100 cursor-pointer comment-outside-style">
    Add comment
  </div>
  <div v-else class="position-relative w-100">
    <QuillEditor
        v-model:content="formData.content"
        :options="editorOptions"
        contentType="html"
        id="quill-editor"
        theme="snow"
        placeholder="Add comment..."
        autoFocus="true"
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
</template>

<style>
.mention-item {
  padding: 4px 10px;
  border-radius: 4px;
}

.mention-selected {
  background: rgb(192, 250, 153);
}
</style>