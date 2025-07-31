<script setup>
import draggable from 'vuedraggable';
import moment from "moment";
import {Collapse} from "vue-collapsed";
import {useToast} from "vue-toastification";
import {usePostData} from "~/composables/usePostData";
import {useProjectStore} from "~/stores/useProjectStore";
import {useAppStore} from "~/stores/useAppStore";
import {storeToRefs} from "pinia";
import {useGetData} from "~/composables/useGetData";

// ROTE VARIABLES
const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();
const appStore = useAppStore();
const {issueDetails, newIssueType} = storeToRefs(projectStore);
const toast = useToast();
const {moveIssue, createIssue} = usePostData();
const props = defineProps(['projectId', 'issueId', 'sprintId', 'subIssues', "openCreateIssue"]);
// VARIABLES
const creating = ref(false);
const creatingList = ref([]);
const creatingLoading = ref(false);

const createIssueParent = ref(null);


// === METHODS === //
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
const scrollToCreate = () => {
  openCreateIssue();

  const createInput = document.getElementById("createIssueWrapper");
  if (createInput) {
    window.scrollTo({
      top: createInput.offsetTop,
      behavior: 'smooth'
    });
  }
}
const createIssueData = ref({
  title: "",
});
const submitCreateIssue = reactive({
  type: "",
  title: "",
});
const validationErrors = reactive({
  title: null,
  allValid: true,
});

const handleSubmit = async () => {
  validationErrors.title = null;
  validationErrors.allValid = true;

  submitCreateIssue.parent_id = props.issueId;
  submitCreateIssue.sprint_id = issueDetails?.value.sprint_id;
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
    submitCreateIssue.title = createIssueData.value.title;
    createIssueData.value.title = "";
    creatingList.value.push(submitCreateIssue);

    submitCreateIssue.type = newIssueType.value ?? 'story'

    await submit();
  }
}

const {
  submit,
  inProgress,
  validationErrors: errors,
} = useSubmit(() => createIssue(submitCreateIssue, props.projectId), {
  onSuccess: async (response) => {
    await projectStore.refreshIssueDetails(props.projectId, props.issueId);
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

const onIssueChange = async (e) => {
  let issueMoved = e.moved;

  if (issueMoved) {
    await moveIssue(route.params.id, issueMoved.element.id, {
      order: issueMoved.newIndex + 1
    });
  }
}
</script>

<template>
  <div>
    <div>
      <div class="d-flex align-items-center justify-content-between fs-4 mb-2 toolbar-options">
        <span class="d-block fs-5 fw-bold">Sub issues</span>
        <button @click="scrollToCreate" id="createSubIssue" type="button" class="d-none"></button>
      </div>
      <!--  When     -->
      <!--      @change="onIssueChange"-->
      <draggable
          v-can="{perms: 'move issue backlog', location: appStore.permissionLocation}"
          v-model="issueDetails.sub_issues"
          group="subIssues"
          item-key="id"
          drag-class="draging"
          ghost-class="ghost"
      >
        <template #item="{element: issue, index}">
          <IssueChildList :index="index" :elementsId="`sprint${index}`" :issue="issue"/>
        </template>
      </draggable>

      <div>
        <IssueChildList v-for="(issue, index) in issueDetails.sub_issues" :key="index"
                        v-can:not="{perms: 'move issue backlog', location: appStore.permissionLocation}"
                        :index="index" :elementsId="`sprint${index}`" :issue="issue"/>
      </div>

      <IssueNew v-can="{perms: 'create issue', location: appStore.permissionLocation}"
                v-for="(newIssue, index) in creatingList" :key="index" v-if="creatingList.length > 0"
                :title="newIssue.title"
      />
    </div>
    <div v-can="{perms: 'create issue', location: appStore.permissionLocation}" @click="openCreateIssue()"
         ref="createIssueParent"
         class="createIssue py-3 px-2 cursor-pointer border"
         :class="issueDetails?.sub_issues.length > 0 ? 'rounded-bottom-1' : 'rounded'"
    >
      <div v-if="creating" v-click-outside="closeInput" class="position-relative">
        <div class="position-relative d-flex align-items-center gap-2">
          <DropDownMenuIssueTypeCreate class="z-1"/>
          <FormInput @keyup.enter="handleSubmit" type="text" autocomplete="off"
                     labelText="Issue Title:" name="title" placeholder="Issue Title"
                     v-model:input="createIssueData.title"
                     :formDataError="validationErrors.title || errors?.title"
                     class="w-100"
          />
        </div>
      </div>
      <span v-else class="d-flex align-items-center">
        <i class="ki-outline ki-plus fs-2 me-1"></i>Create Sub Issue
      </span>
    </div>
  </div>
</template>

<style>
.createIssue:hover {
  background-color: var(--bs-gray-100);
}
</style>