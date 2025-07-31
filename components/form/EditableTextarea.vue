<script setup>
import {useProjectStore} from "~/stores/useProjectStore";
import {storeToRefs} from "pinia";

const emits = defineEmits(["update:input", "submit"]);

const projectStore = useProjectStore();
const props = defineProps(["issueTitle", "placeholder", "input", "index", "inProgress", "submit", "vErrors"]);
const {placeholder, index, input, inProgress, vErrors} = toRefs(props);
const isEditingTextarea = ref(false);

const {issueDetails, isDataLoaded} = storeToRefs(projectStore);
// ==== computed ==== //
const hasChanges = ref(false);
const issueTitle = ref(props.issueTitle);

const inputComputed = computed({
  get: () => input.value,
  set: (val) => {
    if (val !== props.issueTitle) {
      hasChanges.value = true;
    }
    emits("update:input", val);
  },
});
const editInput = () => {
  isEditingTextarea.value = true;
};
const closeTextarea = () => {
  if (inputComputed.value.trim() === "" && inputComputed.value.length < 3 || inputComputed.value.length > 255) {
    inputComputed.value = issueTitle.value;
    isEditingTextarea.value = false;
    return;
  }
  if (inProgress.value) return;
  isEditingTextarea.value = false;
  setTimeout(() => {
    if (inputComputed !== props.issueTitle) {
      inputComputed.value = issueTitle.value;
    }
    isEditingTextarea.value = false;
  }, 0);
};
const vFocus = {
  mounted: (el) => el.focus()
};
const handleSaveButtonClick = () => {
  if (inputComputed.value.trim() === "" && inputComputed.value.length < 3 || inputComputed.value.length > 255) {
    inputComputed.value = issueTitle.value;
    isEditingTextarea.value = false;
    return;
  }
  if (!hasChanges.value) {
    setTimeout(() => isEditingTextarea.value = false, 0)
    return;
  }

  issueTitle.value = inputComputed.value;
  hasChanges.value = false;
  emits('submit');
};

watch(inProgress, (newValue, oldValue) => {
  if (!newValue && oldValue) {
    setTimeout(() => isEditingTextarea.value = false, 0)
  }
});
</script>

<template>
  <div @click="editInput" :class="{ 'active': isEditingTextarea }"
       :id="`tested${index}`" class="editable-text-area">
    <div v-if="!isEditingTextarea" class="cursor-pointer outside-title">
      <div
          class="form-control form-control-solid custom overflow-x-hidden custom-style-textarea rounded-1 fw-bolder p-0">
        {{ issueDetails.title }}
      </div>
    </div>
    <div v-else class="position-relative grow-wrap" id="handalClickOutSide">
        <textarea class="form-control form-control-solid resize-none rounded-1 editing-custom-style p-0"
                  :class="{'input-error': vErrors }"
                  v-focus
                  :placeholder="placeholder"
                  v-model="inputComputed"
                  @keydown.enter.prevent="handleSaveButtonClick"
                  @keydown.esc.prevent="closeTextarea"
                  autofocus
        ></textarea>
      <div v-if="vErrors" class="w-100 text-start mt-1">
        <span class="form-data-error m-0">{{ typeof vErrors === "string" ? vErrors : vErrors[0] }}</span>
      </div>
      <div class="d-flex align-items-center justify-content-end gap-2 mt-2"
           style="right: 0">
        <button @click="handleSaveButtonClick"
                class="btn btn-primary btn-flex btn-center btn-sm cursor-pointer custom-button"
                :disabled="inProgress"
        >
          <div v-if="inProgress" class="text-center">
            <Icon name="svg-spinners:180-ring-with-bg" size="15"/>
          </div>
          <span v-else>Save</span>
        </button>
        <button @click="closeTextarea" :id="`close-${index}`" id="closeButton"
                class="btn btn-light-danger btn-flex btn-center btn-sm cursor-pointer custom-button"
                :disabled="inProgress">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.editable-text-area .custom,
.editable-text-area textarea {
  height: 115px !important;
  background-color: transparent !important;
  color: var(--bs-dark) !important;
  font-size: 20px !important;
  border: 0 !important;
}

.editable-text-area .custom {
  height: auto !important;
}

.input-error {
  border-color: var(--bs-danger);
}

.form-data-error {
  color: var(--bs-danger);
  margin-left: 10px;
}
</style>
//background-color: var(--bs-gray-200) !important;
<!--.custom-style-textarea:hover {-->
<!--background-color: #fbfbfb !important;-->
<!--transition: all 0.3s;-->
<!--}-->