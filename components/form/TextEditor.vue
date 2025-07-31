<script setup>
import {QuillEditor, Quill} from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import {useProjectStore} from "~/stores/useProjectStore";
import "quill-mention";

const route = useRoute();
const emits = defineEmits(["update:input", "submit"]);
const props = defineProps(['issueDescription', "inProgress", "submit", 'placeholder', 'input']);
const {placeholder, input, inProgress} = toRefs(props);
const projectStore = useProjectStore();
const {acceptedTeam, teamMembersYourWork} = toRefs(projectStore);
// ==== General Variable ==== //
const isEditing = ref(false);
const hasChanges = ref(false);

const issueDescription = ref(props.issueDescription);

// ==== computed ==== //
const inputComputed = computed({
  get: () => input.value,
  set: (val) => {
    if (val !== props.issueDescription) {
      hasChanges.value = true;
      emits("update:input", val);
    }
  },
});

const isContentEmpty = computed(() => {
  // Check if inputComputed.value contains only empty tags
  return /^(<[^>]*>\s*)+$/.test(inputComputed.value);
});
// ==== Methods ==== //
const openTextEditor = () => {
  isEditing.value = true;
};
const closeTextEditor = () => {
  if (inProgress.value) return;
  isEditing.value = false;
  setTimeout(() => {
    if (inputComputed !== props.issueDescription) {
      inputComputed.value = issueDescription.value;
    }
    isEditing.value = false;
  }, 0);
};
watch(inProgress, (newValue, oldValue) => {
  if (!newValue && oldValue) {
    setTimeout(() => isEditing.value = false, 0)
  }
});
const handleSaveButtonClick = () => {
  if (!hasChanges.value) {
    setTimeout(() => isEditing.value = false, 0)
    return;
  }
  issueDescription.value = inputComputed.value;
  hasChanges.value = false;

  const mentionList = document.querySelectorAll(".mention");
  projectStore.mentionedUserIds = Array.from(new Set(
      Array.from(mentionList, e => parseInt(e.getAttribute("data-id"), 10))
          .filter(dataId => !isNaN(dataId))
          .filter(Number.isInteger)
  ));

  emits('submit');
};
const quillEditorRef = ref(null);

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
  <div @click="openTextEditor" :class="{ 'active': isEditing}">
    <div v-if="!isEditing" class="cursor-pointer">
      <div v-if="isContentEmpty || inputComputed === null"
           class="form-control form-control-solid overflow-hidden rounded-top-1 w-full outside-description">
        Add a description
      </div>
      <div v-else v-html="inputComputed"
           class="form-control form-control-solid overflow-hidden rounded-1 w-full outside-description"></div>
    </div>
    <div v-else class="position-relative" ref="quillEditorRef" id="handalClickOutSide">
      <QuillEditor
          :options="editorOptions"
          v-model:content="inputComputed"
          :content-type="'html'"
          :theme="'snow'"
          :placeholder="placeholder"
          style="min-height: 80px"
          @keydown.ctrl.enter.prevent="handleSaveButtonClick"
          @keydown.esc.prevent="closeTextEditor"
          @ready="onReady"
      />
      <div class="d-flex align-items-center justify-content-end gap-2 mt-2"
           style="right: 0">
        <button @click="handleSaveButtonClick"
                class="btn btn-primary btn-flex btn-center btn-sm cursor-pointer custom-button"
                :disabled="inProgress">
          <div v-if="inProgress" class="text-center">
            <Icon name="svg-spinners:180-ring-with-bg" size="15"/>
          </div>
          <span v-else>Save</span>
        </button>
        <button @click="closeTextEditor" id="closePlease" :disabled="inProgress"
                class="btn btn-light-danger btn-flex btn-center btn-sm cursor-pointer custom-button">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<style>
.ql-mention-list {
  list-style: none;
  background-color: white;
  box-shadow: 0 .125rem .25rem rgba(0, 0, 0, .075);
  padding: 10px;
  border-radius: 8px;
  max-height: 150px;
  overflow-y: auto;
  z-index: 100;
  position: relative;
}

.ql-mention-list li {
  cursor: pointer;
  border-radius: 6px;
  padding: 6px;
  transition: all 0.1s;
}

.ql-mention-list li.selected {
  background-color: #f2f2f2;
}

.ql-mention-list li:hover {
  background-color: #f2f2f2;
}

.ql-mention-list li:not(:last-of-type) {
  margin-bottom: 8px;
}

.mention-item {
  padding: 0;
}

.mention-photo {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  object-fit: cover;
}

.mention {
  color: rgb(0, 102, 204);
}
</style>

<!--.ql-editor {-->
<!--max-height: fit-content;-->
<!--height: 80px !important;-->
<!--}-->