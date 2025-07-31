<script setup>
import moment from "moment";
import {useProjectStore} from "~/stores/useProjectStore";
import {useAppStore} from "~/stores/useAppStore";
import {storeToRefs} from "pinia";
import {useGetData} from "~/composables/useGetData";
import {usePostData} from "~/composables/usePostData";
import {useToast} from "vue-toastification";
import Input from "~/components/form/Input.vue";
import {useDropZone} from '@vueuse/core';
import {Collapse} from "vue-collapsed";

const emits = defineEmits(["issueUpdated"]);

// ==== General Data ==== //
const props = defineProps(["isOpen", "toggleView", "refreshYourWork", "projectId"]);
const toast = useToast();
const projectStore = useProjectStore();
const appStore = useAppStore();
const {
  issueDetails,
  issueHistory,
  isDataChange,
  isDataLoaded,
  memberPermissions,
  projectLabels
} = storeToRefs(projectStore);
const {fetchIssueHistory} = useGetData();
const {updateIssueInfo, deleteAttachFile, attachFiles, createLabels, deleteLabel} = usePostData();
const {user} = useAuth();
const route = useRoute();
const router = useRouter();
// ==== General Variable ==== //
const isToggle = ref(false);
const history = ref("");
const updateData = reactive({});
const data = reactive({
  title: null,
  description: null,
  day: 0,
  hour: 0,
  minute: 0,
});
const validationErrors = reactive({
  title: null,
  description: null,
  time: null
});
const historyLoading = ref(false);
const loadMoreHistoryLoading = ref(false);
const isChange = ref(false);
const pageCount = ref(null);

watch(issueDetails, () => {
  if (issueDetails.value === issueDetails.value) {
    isChange.value = true;
  }
});
// ==== Validation Rules ==== //
const issueValue = issueDetails?._value;
if (issueValue) {
  data.title = issueValue.title;
  data.description = issueValue.description;
  if (Array.isArray(issueValue.estimated_at) && issueValue.estimated_at.length >= 3) {
    data.day = issueValue.estimated_at[0];
    data.hour = issueValue.estimated_at[1];
    data.minute = issueValue.estimated_at[2];
  } else {
    data.day = null;
    data.hour = null;
    data.minute = null;
  }
}

// ==== Methods ==== //
const toggleDateDisplay = () => {
  return isToggle.value = !isToggle.value
};
const handelCLoseModal = () => {
  document.getElementById("close-button").click();
}

const toggleDescription = () => {
  projectStore.showDescription = !projectStore.showDescription
}
// ==== Get Data "API" ==== //
const handalHistory = async (projectId, issueId, query) => {
  if (query) {
    loadMoreHistoryLoading.value = true;
    const response = await fetchIssueHistory(projectId, issueId, query);
    history.value = response;
    pageCount.value = response?.current_page;
    historyLoading.value = false;
    loadMoreHistoryLoading.value = false;
    return;
  }
  if (history.value) {
    historyLoading.value = false;
    return;
  }
  historyLoading.value = true;
  const response = await fetchIssueHistory(projectId, issueId);
  history.value = response;
  pageCount.value = response?.current_page;
  historyLoading.value = false;
};

// ==== Validation ==== //
const handleUpdate = async (fieldToUpdate) => {
  if (fieldToUpdate === "title") {
    if (data.title !== issueDetails.value.title) {
      data.title = issueDetails.value.title;
      updateData.title = issueDetails.value.title;
      if (updateData.title.trim() === "") {
        validationErrors.title = "Issue Title Is Required!"
        return;
      } else if (updateData.title.length >= 256 || updateData.title.length < 3) {
        validationErrors.title = "The issue title should be between 3 and 255 characters in length."
        return;
      }
      validationErrors.title = null
      submit();
    }
  } else if (fieldToUpdate === "description") {
    if (data.description !== issueDetails.value.description) {
      data.description = issueDetails.value.description;
      updateData.description = issueDetails.value.description;
      const mentionList = document.querySelectorAll(".ql-editor .mention");
      projectStore.mentionedUserIds = Array.from(new Set(
          [...mentionList].map(e => parseInt(e.getAttribute("data-id"), 10))
              .filter(Number.isInteger)
      ));

      updateData.mentionList = [...projectStore.mentionedUserIds];
      submit();
    }
  } else if (fieldToUpdate === "time") {
    if (data.day === issueDetails.value.estimated_at[0] && data.hour === issueDetails.value.estimated_at[1] && data.minute === issueDetails.value.estimated_at[2]) {
      return;
    }

    if (issueDetails.value.estimated_at[0] > 30) {
      toast.error("Please ensure that the value of the day is below 30.", {
        position: "bottom-left"
      });
      return;
    } else if (issueDetails.value.estimated_at[1] > 24) {
      toast.error("Please ensure that the value of the hour is below 24.", {
        position: "bottom-left"
      });
      return;
    } else if (issueDetails.value.estimated_at[2] > 60) {
      toast.error("Please ensure that the value of the minute is below 60.", {
        position: "bottom-left"
      });
      return;
    }
    updateData.estimated_at = [issueDetails.value.estimated_at[0] || 0, issueDetails.value.estimated_at[1] || 0, issueDetails.value.estimated_at[2] || 0];
    submit();
  }
}
const {
  submit,
  inProgress,
  validationErrors: errors,
} = useSubmit(() => updateIssueInfo(
    issueDetails.value.project_identify,
    issueDetails.value.id,
    updateData
), {
  onSuccess: async (response) => {
    if (response.code === 200) {
      if (!issueDetails?.value.parent_id) {
        toast.success(response.message, {
          position: "bottom-left",
          timeout: 1500,
        });
        projectStore.closeEditing = true;
        emits('issueUpdated');
        return;
      } else {
        toast.success(response.message, {
          position: "bottom-left",
          timeout: 1500,
        });
        await projectStore.refreshIssueDetails(
            issueDetails?.value.project_identify,
            issueDetails?.value.id
        );
      }
      projectStore.mentionedUserIds = null;
    }
  },
  onError: async (error) => {
    console.log(error.response);
  },
});

const activeTab = ref("comments");
const changeTab = async (tabName) => activeTab.value = tabName;

const dropZoneRef = ref();
const filesData = ref([]);
const fileInputRef = ref(null);
const galleryVisible = ref(false);
const currentFileIndex = ref(0);
const MAX_FILES = 5;
const MAX_VIDEO_SIZE_MB = 25;
const MAX_IMAGE_SIZE_MB = 5;
const MAX_PDF_SIZE_MB = 10;
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};
const uploadedFileNames = new Set();
const formData = new FormData();
const isLoadingFiles = ref(false);

const onDrop = async (files) => {
  if (!files || files.length === 0) {
    return;
  }

  // Calculate the total number of files (local + backend)
  const totalFiles = filesData.value.length + (issueDetails?.value.issue_files.length || 0);

  if (totalFiles + files.length > MAX_FILES) {
    toast.error("You can upload a maximum of 5 files.");
    return;
  }

  isLoadingFiles.value = true;
  const promises = [];

  // Create a new formData object for each upload operation
  const formData = new FormData();

  for (const file of files) {
    const fileType = file.type;
    const fileSizeMB = file?.size / (1024 * 1024);

    if (uploadedFileNames.has(file.name)) {
      continue;
    }

    if (
        (fileType.includes('video') && fileSizeMB <= MAX_VIDEO_SIZE_MB) ||
        (fileType.includes('image') && fileSizeMB <= MAX_IMAGE_SIZE_MB) ||
        (fileType.includes('pdf') && fileSizeMB <= MAX_PDF_SIZE_MB)
    ) {
      formData.append("files[]", file);

      const fileData = {
        name: file.name,
        size: file.size,
        type: fileType,
        url_file: '',
      };

      if (fileType.includes('video')) {
        fileData.isVideo = true;
      } else if (fileType.includes('pdf')) {
        fileData.isPdf = true;
      } else if (fileType.includes('image')) {
        fileData.isImage = true;
      }

      promises.push(new Promise((resolve) => {
        const reader = new FileReader();
        reader.addEventListener('load', (e) => {
          fileData.url_file = e.target.result;
          filesData.value.push(fileData);
          uploadedFileNames.add(file.name);
          resolve();
        });
        reader.readAsDataURL(file);
      }));
    } else {
      toast.error('Invalid file type or size exceeded. Please check your file.');
    }
  }
  await Promise.all(promises);
  // Ensure the total number of files (local + backend) doesn't exceed the limit
  const newTotalFiles = filesData.value.length + (issueDetails?.value.issue_files.length || 0);

  if (newTotalFiles <= MAX_FILES) {
    const response = await attachFiles(issueDetails?.value.project?.project_identify, issueDetails?.value.id, formData);
    if (response) {
      await projectStore.refreshIssueDetails(issueDetails?.value.project?.project_identify, issueDetails?.value.id);
      filesData.value.length = 0;
    }
  } else {
    toast.error("You can upload a maximum of 5 files.");
  }
  isLoadingFiles.value = false;
};

let isOverDropZone = false; // Declare isOverDropZone variable outside the if block

if (appStore.permissionLocation === "in") {
  if (memberPermissions.value.includes('edit issue')) {
    const dropZoneResult = useDropZone(dropZoneRef, onDrop);
    isOverDropZone = dropZoneResult.isOverDropZone; // Update isOverDropZone inside the if block
  }
} else if (appStore.permissionLocation === "out") {
  if (appStore.permissionsOutsideProjects.includes('edit issue')) {
    const dropZoneResult = useDropZone(dropZoneRef, onDrop);
    isOverDropZone = dropZoneResult.isOverDropZone; // Update isOverDropZone inside the if block
  }
}

const attachFile = () => {
  fileInputRef.value.click();
};
const handleFileInputChange = (event) => {
  const files = event.target.files;
  if (files) {
    onDrop(files);
  }
};

const removeFile = async (fileId, fileName) => {
  Swal.fire({
    html: `Are you sure you want to delete <strong><div class="truncate lh-lg" >${fileName}</div></strong> File`,
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
      const response = await deleteAttachFile(issueDetails?.value.project?.project_identify, issueDetails?.value.id, fileId);
      if (response.code === 200) {
        await projectStore.refreshIssueDetails(issueDetails?.value.project?.project_identify, issueDetails?.value.id);
      }
    },
  });
};
const openGallery = (index) => {
  currentFileIndex.value = index;
  galleryVisible.value = true;
};
const closeGallery = () => {
  galleryVisible.value = false;
};

const fileContainers = ref(null)
const prevFile = () => {
  if (currentFileIndex.value > 0) {
    currentFileIndex.value--;
    fileContainers.value[currentFileIndex.value].focus();
  } else {
    currentFileIndex.value = issueDetails?.value.issue_files.length - 1;
  }
};
const nextFile = () => {
  if (currentFileIndex.value < issueDetails?.value.issue_files.length - 1) {
    currentFileIndex.value++;
    fileContainers.value[currentFileIndex.value].focus();
  } else {
    currentFileIndex.value = 0;
  }
};
const currentFile = computed(() => {
  return issueDetails?.value.issue_files[currentFileIndex.value];
});

const merged = computed(() => {
  return [...filesData.value, ...(issueDetails.value?.issue_files || [])];
});

const refreshMainIssueDetails = async () => {
  isDataLoaded.value = false;
  router.push({query: null})
  await projectStore.refreshIssueDetails(issueDetails?.value.project?.project_identify, issueDetails?.value.parent_id);
  isDataLoaded.value = true;
};

const openInput = () => {
  document.getElementById("createSubIssue").click();
}

const isExpanded = ref(true);

const handleCollapse = () => {
  isExpanded.value = !isExpanded.value;
  // localStorage.setItem(`collapseSprint${route.params.id}-${props.sprint?.id}-${user.value.id}`, `${isExpanded.value}`);
}
</script>

<template>
  <div ref="dropZoneRef" class="bg-white position-fixed p-0"
       style="width: 650px !important; height: 100% !important; right: 0; top: 0; overflow-y: auto; z-index: 10000">
    <div v-if="isOverDropZone" style="z-index: 100000000000;" class="drawer-overlay" v-can="'edit issue'"></div>
    <div v-if="isDataChange && isChange && isDataLoaded || projectStore.openIssueModal" class="card w-100 rounded-0"
         style="height: 100%">
      <div class="card-header pe-5">
        <div class="card-title">
          <DropDownMenuSprints
              v-if="!issueDetails?.parent_id"
              :sprintName="issueDetails?.sprint?.name"
              :projectId="issueDetails?.project?.project_identify"
              :issueId="issueDetails?.id"
          />
          <div v-else @click="refreshMainIssueDetails"
               class="d-flex align-items-center gap-1 cursor-pointer px-2 custom-round back-to">
            <Icon name="bx:arrow-back"/>
            <span>Back to main issue</span>
          </div>
          <span class="fs-2 mx-2">/</span>
          <DropDownMenuChildIssueType
              :issueType="issueDetails?.type"
              :projectId="issueDetails?.project?.project_identify"
              :issueId="issueDetails?.id"
              from="details"
              customStyle="px-2"
          />
        </div>
        <div class="card-toolbar">
          <div @click="toggleView" class="btn btn-sm btn-icon btn-active-light-primary"
               id="close-button">
            <i class="ki-duotone ki-cross fs-2"><span class="path1"></span><span class="path2"></span></i>
          </div>
        </div>
      </div>
      <div class="card-body hover-scroll-overlay-y pb-0 overflow-x-hidden">
        <div class="d-flex flex-column gap-2 mb-8 fv-row">
          <FormEditableTextarea v-model:input="issueDetails.title"
                                :issueTitle="issueDetails?.title"
                                placeholder="Type issue iitle"
                                :inProgress="inProgress"
                                @submit="handleUpdate('title')"
                                :index="1"
                                :vErrors="validationErrors.title || errors?.title"
                                v-can="{perms: 'edit issue', location: appStore.permissionLocation}"
          />

          <h2 v-can:not="{perms: 'edit issue', location: appStore.permissionLocation}" class="fs-1">
            {{ issueDetails?.title }}</h2>

          <div class="d-flex align-items-center" style="font-size: 10px !important;">
            <button @click="attachFile" v-can="{perms: 'edit issue', location: appStore.permissionLocation}"
                    class="btn btn-primary fs-8 custom-round d-flex align-items-center py-1 px-2 gap-1 me-3">
              <Icon name="typcn:attachment" size="18"/>
              <span>Attach Files</span>
            </button>
            <input
                ref="fileInputRef"
                id="files"
                type="file"
                accept="image/*, video/*, application/pdf"
                multiple
                style="display: none"
                @change="handleFileInputChange"
                v-can="{perms: 'edit issue', location: appStore.permissionLocation}"
            />
            <button @click="openInput" v-can="{perms: 'edit issue', location: appStore.permissionLocation}"
                    v-if="!issueDetails?.parent_id"
                    class="btn btn-primary fs-8 custom-round d-flex align-items-center py-1 px-2 gap-1 me-3">
              <Icon name="tabler:binary-tree-2" size="18"/>
              <span>Create Sub Issue</span>
            </button>
          </div>
        </div>
        <div class="d-flex flex-column mb-8 fv-row">
          <label class="d-flex align-items-center fs-4 fw-bold mb-2">
            <span class="fw-bolder">Description</span>
          </label>
          <FormTextEditor v-model:input="issueDetails.description"
                          :issueDescription="issueDetails?.description"
                          :inProgress="inProgress"
                          @submit="handleUpdate('description')"
                          placeholder="Type issue description"
                          v-can="{perms: 'edit issue', location: appStore.permissionLocation}"
          />
          <div v-can:not="{perms: 'edit issue', location: appStore.permissionLocation}"
               v-html="issueDetails?.description"
               class="form-control form-control-solid overflow-hidden rounded-1 w-full outside-description"></div>
        </div>
        <div class="mb-8" v-if="merged.length > 0">
          <form id="attachmentForm" class="d-flex justify-content-start items-center mb-6 gallery" @submit.prevent>
            <div v-for="(file, index) in merged" :key="index" class="file-container" @keydown.left="prevFile"
                 @keydown.right="nextFile" tabindex="0" ref="fileContainers">
              <div v-if="file.type.includes('video')" @click="openGallery(index)" class="overlay cursor-pointer">
                <div class="overlay-wrapper bgi-position-center bgi-size-cover card-rounded image-container">
                  <img src="/project.png" alt="" class="gallery-img rounded">
                  <img src="/video-play.svg" class="position-absolute top-50 start-50 translate-middle"
                       style="width: 60px !important; height: 60px !important;" alt="">
                  <Icon v-if="isLoadingFiles" name="svg-spinners:180-ring-with-bg" size="20"
                        class="position-absolute top-50 start-50 translate-middle text-inverse-warning"/>
                </div>
                <div
                    class="overlay-layer card-rounded flex-column bg-dark bg-opacity-25 shadow overlay-style justify-content-start"
                    @click="openGallery(index)" v-if="!isLoadingFiles">
                  <div @click.stop class="d-flex align-items-center justify-content-between toolbar-actions w-100">
                    <span class="text-white fs-7 m-2">{{ formatFileSize(file.size) }}</span>
                    <div class="d-flex align-items-center gap-1 text-white m-2 actions">
                      <div v-can="{perms: 'edit issue', location: appStore.permissionLocation}"
                           @click="removeFile(file?.id, file.name)"
                           class="bg-dark bg-opacity-75 cursor-pointer">
                        <Icon name="mdi:delete-forever" size="20"/>
                      </div>
                      <div class="bg-dark bg-opacity-75">
                        <a :href="file.url_file" :download="file.name" class="text-white">
                          <Icon name="basil:cloud-download-solid" size="20"/>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else-if="file.type.includes('image')" @click="openGallery(index)" class="overlay cursor-pointer">
                <div class="overlay-wrapper bgi-position-center bgi-size-cover card-rounded image-container">
                  <img :src="file?.url_file" class="card-rounded">
                  <Icon v-if="isLoadingFiles" name="svg-spinners:180-ring-with-bg" size="20"
                        class="position-absolute top-50 start-50 translate-middle"/>
                </div>
                <div v-if="!isLoadingFiles"
                     class="overlay-layer card-rounded flex-column bg-dark bg-opacity-25 shadow overlay-style justify-content-start">
                  <div @click.stop class="d-flex align-items-center justify-content-between toolbar-actions w-100">
                    <span class="text-white fs-7 m-2">{{ formatFileSize(file.size) }}</span>
                    <div class="d-flex align-items-center gap-1 text-white m-2 actions">
                      <div v-can="{perms: 'edit issue', location: appStore.permissionLocation}"
                           @click="removeFile(file.id, file.name)"
                           class="bg-dark bg-opacity-75 cursor-pointer">
                        <Icon name="mdi:delete-forever" size="20"/>
                      </div>
                      <div class="bg-dark bg-opacity-75">
                        <a :href="file.url_file" :download="file.name" class="text-white">
                          <Icon name="basil:cloud-download-solid" size="20"/>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else-if="file.type.includes('pdf')" @click="openGallery(index)"
                   class="overlay card-body d-flex justify-content-center text-center flex-column card-rounded custom-shadow py-4 cursor-pointer">
                <div class="overlay-wrapper text-gray-800 text-hover-primary d-flex flex-column">
                  <div class="symbol symbol-35px mb-5">
                    <img src="/pdf.svg" alt="">
                  </div>
                  <Icon v-if="isLoadingFiles" name="svg-spinners:180-ring-with-bg" size="20"
                        class="position-absolute top-50 start-50 translate-middle"/>
                  <div class="fs-5 fw-bold mb-2 truncate" style="max-width: 100px;">{{ file.name }}</div>
                  <div class="fs-7 fw-semibold text-gray-400">{{ formatFileSize(file.size) }}</div>
                </div>
                <div v-if="!isLoadingFiles"
                     class="overlay-layer card-rounded flex-column bg-dark bg-opacity-25 overlay-style justify-content-start"
                     @click="openGallery(index)" style="height: 100% !important;">
                  <div @click.stop class="d-flex align-items-center justify-content-center toolbar-actions w-100">
                    <div class="d-flex align-items-center gap-1 text-white m-2 actions">
                      <div v-can="{perms: 'edit issue', location: appStore.permissionLocation}"
                           @click="removeFile(file?.id, file.name)"
                           class="bg-dark bg-opacity-75 cursor-pointer">
                        <Icon name="mdi:delete-forever" size="20"/>
                      </div>
                      <div class="bg-dark bg-opacity-75">
                        <a :href="file.url_file" :download="file.name" class="text-white">
                          <Icon name="basil:cloud-download-solid" size="20"/>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="galleryVisible" class="preview-overlay">
              <div class="position-relative d-flex justify-content-between align-items-center w-100">
                <div class="d-flex justify-content-between w-100 position-fixed top-0">
            <span class="fs-4 text-white ps-3 pt-3 truncate">{{
                currentFile.name
              }} / ({{ formatFileSize(currentFile.size) }})</span>
                  <div class="bg-dark bg-opacity-25 rounded-bottom rounded-end-0 close-button">
                    <div class="cursor-pointer" title="Close" @click="closeGallery">
                      <Icon name="iconamoon:close-light" size="40" class="text-white"/>
                    </div>
                  </div>
                </div>
              </div>
              <div class="gallery-view" @click="closeGallery">
                <div
                    @click.stop
                    @click="prevFile"
                    class="cursor-pointer text-white bg-dark bg-opacity-25 ms-2 rounded"
                >
                  <Icon name="ic:twotone-arrow-back-ios" size="50" class="p-3"/>
                </div>
                <img v-if="currentFile.type.includes('image')" @click.stop :src="currentFile.url_file"/>
                <video
                    @click.stop
                    v-else-if="currentFile.type.includes('video')"
                    :src="currentFile.url_file"
                    controls
                    width="1000"
                ></video>
                <embed
                    @click.stop
                    v-else-if="currentFile.type.includes('pdf')"
                    :src="currentFile.url_file"
                    type="application/pdf"
                    width="1200"
                    height="600"
                />
                <div
                    @click.stop
                    @click="nextFile"
                    class="cursor-pointer text-white bg-dark bg-opacity-25 me-2 rounded"
                >
                  <Icon name="ic:twotone-arrow-forward-ios" size="50" class="p-3"/>
                </div>
              </div>
            </div>
          </form>
        </div>
        <div class="border rounded-1 mb-8">
          <div @click="handleCollapse"
               class="d-flex align-items-center justify-content-between border-bottom rounded-top-1 p-3 fs-5 cursor-pointer"
               :class="{'rounded-bottom-1 border-bottom-0' : !isExpanded}">
            <span class="user-select-none">Details</span>
            <i class="fa-solid fa-chevron-down details-arrow"
               :class="{'details-arrow-active' : isExpanded}"></i>
          </div>
          <Collapse :when="isExpanded">
            <div class="d-flex flex-column row-gap-4 p-5 right">
              <div class="d-flex align-items-center justify-content-between gap-3 right-content">
                <label class="fs-5 fw-semibold">Assignee To</label>
                <div class="position-relative select-menu-members drop-down">
                  <DropDownMenuMembers :projectId="issueDetails?.project?.project_identify"
                                       :issueId="issueDetails?.id"
                                       :assignTo="issueDetails?.team_member"
                                       @issueUpdated="refreshYourWork"
                  />
                </div>
              </div>
              <div class="d-flex align-items-center justify-content-between gap-3 right-content">
                <label class="fs-5 fw-semibold">Status</label>
                <div class="position-relative select-menu-status drop-down">
                  <DropDownMenuStatus :status="issueDetails.status"
                                      :issueId="issueDetails.id"
                                      :projectId="issueDetails?.project?.project_identify"
                                      @issueUpdated="refreshYourWork"
                  />
                </div>
              </div>
              <div class="d-flex align-items-center justify-content-between gap-3 right-content">
                <label class="fs-5 fw-semibold">Estimate Time</label>
                <FormTimeInput
                    v-model:input="issueDetails.estimated_at"
                    @submit="handleUpdate('time')"
                    :time="issueDetails?.estimated_at"
                    :inProgress="inProgress"
                />
              </div>
              <div class="d-flex align-items-center justify-content-between gap-3 right-content">
                <label class="fs-5 fw-semibold">Labels</label>
                <div class="position-relative select-menu-status drop-down">
                  <div v-can="{perms: 'edit issue', location: appStore.permissionLocation}" class="cursor-pointer">
                    <input id="editLabels"
                           type="text"
                           :value="issueDetails?.labelNames"
                           class="editLabels border rounded-1 form-control w-100"
                           placeholder="Select Label"
                           v-tagify="projectLabels">
                  </div>

                  <div v-can:not="{perms: 'edit issue', location: appStore.permissionLocation}" class="cursor-pointer">
                    <input id="editLabels"
                           type="text"
                           :value="issueDetails?.labelNames"
                           class="editLabels border rounded-1 form-control w-100"
                           placeholder="Select Label"
                           readonly
                           v-tagify="projectLabels">
                  </div>
                </div>
              </div>
              <div class="d-flex align-items-center justify-content-between gap-3 right-content">
                <label class="fs-5 fw-semibold">Reporter</label>
                <div class="position-relative select-menu-status drop-down">
                  <div class="d-flex align-items-center gap-2 reporter-style p-0">
                    <Avatar :user="issueDetails?.user" imgWidth="25"/>
                    <span>{{ issueDetails?.user?.name }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="separator d-flex flex-center mt-4">
                <span class="text-uppercase bg-body fs-7 fw-semibold text-muted px-3">
                    <i class="fa-solid fa-calendar-days"></i>
                </span>
            </div>
            <div class="d-flex align-items-center p-5 gap-3 right-content-custom">
              <div class="d-flex flex-column right-content-filed">
                <div class="custom-input-content">
                    <span class="form-label m-0">Created <span @click="toggleDateDisplay"
                                                               class="text-hover-primary cursor-pointer">{{
                        isToggle ? moment(issueDetails?.created_at).startOf('minutes').fromNow() : moment(issueDetails?.created_at).calendar()
                      }}</span></span>
                </div>
                <div class="custom-input-content">
                    <span class="form-label m-0">Updated <span @click="toggleDateDisplay"
                                                               class="text-hover-primary cursor-pointer">{{
                        isToggle ? moment(issueDetails?.updated_at).startOf('minutes').fromNow() : moment(issueDetails?.updated_at).calendar()
                      }}</span></span>
                </div>
              </div>
            </div>
          </Collapse>
        </div>
        <IssueChild
            v-if="!issueDetails?.parent_id"
            :projectId="issueDetails?.project?.project_identify"
            :issueId="issueDetails?.id"
            :sprintId="issueDetails?.sprint_id"
        />
        <div class="separator d-flex flex-center mb-4 mt-8">
            <span class="text-uppercase bg-body fs-7 fw-semibold text-muted px-3">
                <i class="fa-solid fa-clock-rotate-left"></i>
            </span>
        </div>
        <div class="d-flex flex-column fv-row">
          <span class="fs-4 fw-bold mb-2">Activity</span>
          <div class="d-flex align-items-center column-gap-2">
            <span class="fs-5 mb-3">Show:</span>
            <ul class="d-flex align-items-center gap-3 w-100 m-0 p-0 list-style-none custom-tab-style mb-3">
              <li @click="changeTab('comments');"
                  class="cursor-pointer fs-4">
                <div class="bg-light-primary px-2 rounded-1"
                     :class="{'bg-primary text-white': activeTab === 'comments'}">Comments
                </div>
              </li>
              <li v-can="{perms: 'show issue history', location: appStore.permissionLocation}"
                  @click="changeTab('history'); handalHistory(issueDetails?.project?.project_identify, issueDetails?.id)"
                  class="cursor-pointer fs-4">
                <div class="bg-light-primary px-2 rounded-1 d-flex align-items-center gap-2"
                     :class="{'bg-primary text-white': activeTab === 'history'}">History
                </div>
              </li>
            </ul>
          </div>
          <div v-can="{perms: 'show issue history', location: appStore.permissionLocation}"
               v-if="activeTab === 'history'" class="mt-5 mb-5">
            <IssueHistory :history="history?.issue_history"
                          :handelCLoseModal="handelCLoseModal"
                          :isToggle="isToggle"
                          :toggleDateDisplay="toggleDateDisplay"
            />
            <SkeletonLoaderIssueHistory v-if="historyLoading || loadMoreHistoryLoading"/>
            <button v-if="history && history?.total_pages != history?.current_page"
                    @click="handalHistory(issueDetails?.project?.project_identify, issueDetails?.id, ++pageCount)"
                    class="btn btn-primary btn-flex justify-content-center cursor-pointer rounded-1 custom-button gap-2 w-100  mb-5"
            >
              <span>Load More</span>
            </button>
          </div>

          <div v-if="activeTab === 'comments'" class="mt-5 mb-5">
            <div class="d-flex align-items-start flex-column gap-3">
              <div class="d-flex align-items-start gap-4 w-100"
                   v-can="{perms: 'create comment', location: appStore.permissionLocation}">
                <Avatar :user="user" imgWidth="40"/>
                <CommentAdd
                    :issueId="issueDetails?.id"
                    :projectId="issueDetails?.project?.project_identify"
                />
              </div>
              <div class="d-flex flex-column gap-5 mt-5 w-100">
                <SkeletonLoaderComment v-if="projectStore.addCommentLoading"/>
                <CommentList
                    :issueId="issueDetails?.id"
                    :projectId="issueDetails?.project?.project_identify"
                    v-for="comment in projectStore?.allComments?.comments"
                    :key="comment?.id"
                    :comment="comment"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <SkeletonLoaderIssueDetailsModal v-else/>
    <div @click="toggleView();" style="z-index: -1;" class="drawer-overlay"></div>
  </div>
</template>

<style>
.tagify {
  background-color: transparent !important;
  padding: 15px 10px;
  min-height: 42px !important;
}

.tagify__dropdown {
  z-index: 100000 !important;
}

.back-to:hover {
  background: #f2f2f2 !important;
  transition: all 0.3s;
}

.preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  z-index: 99999;
}

.gallery-view {
  max-width: 100%;
  max-height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  text-align: center;
  overflow: hidden;
  position: relative;
}

.gallery-view img {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
}

.close-button {
  top: 0;
  right: 0;
}

.actions {
  margin: 10px;
}

.actions div {
  padding: 2px;
  border-radius: 5px;
}

.right-content > label {
  width: 40%;
}

.right-content > div {
  width: 60%;
}

.info-color {
  color: var(--bs-info);
}

.details-container,
.description-container {
  overflow: hidden;
  height: 0;
  display: none !important;
  transition: all 0.3s ease-out;
}

.details-container.open,
.description-container.open {
  height: auto;
  display: flex !important;
  opacity: 1;
  border-bottom: 0 !important;
}

.details-arrow-active,
.description-arrow-active {
  transform: rotate(-180deg);
}

.reporter-style {
  background-color: transparent !important;
  padding: 15px 10px;
  height: 42px !important;
}

.custom-symbol-style > img {
  width: 24px !important;
  height: 24px !important;
}

.custom-input-group-style span,
.custom-input-group-style input {
  height: 42px;
}

.ql-toolbar {
  display: flex;
  align-items: center !important;
  flex-wrap: wrap;
  border-radius: 0 !important;
  gap: 4px;
}

.ql-formats {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 4px !important;
}

.ql-toolbar.ql-snow .ql-formats {
  margin-right: 0 !important;
}

.ql-formats .ql-picker .ql-picker-label {
  display: flex !important;
  justify-content: center !important;
  align-items: center;
}

.ql-picker .ql-picker-options {
  flex-direction: column;
  padding: 6px !important;
}

.ql-picker .ql-picker-options span {
  padding-left: 4px !important;

}

.ql-picker .ql-picker-options span:not(:last-of-type) {
  margin-bottom: 4px !important;
  margin-right: 4px !important;
}

.ql-toolbar span button,
.ql-toolbar span > span {
  border-radius: 2px;
  padding: 0 !important;
  margin: 0 !important;
  transition: all .8s;
}

.ql-toolbar span button {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.ql-toolbar span button,
.ql-formats .ql-color-picker .ql-picker-label,
.ql-formats .ql-picker,
.ql-formats .ql-picker .ql-picker-label,
.ql-formats .ql-color-picker .ql-picker-label,
.ql-toolbar span button > svg,
.ql-formats .ql-color-picker .ql-picker-label > svg,
.ql-header .ql-picker-label > svg {
  width: 20px !important;
  height: 20px !important;
}

.ql-formats .ql-color-picker .ql-picker-label {
  margin: 0 !important;
}

.ql-formats .ql-picker:not(:first-of-type),
.ql-formats:not(:first-of-type) button:first-of-type {
  margin-left: 4px !important;
}

.ql-align-center {
  text-align: center !important;
}

.ql-align-right {
  text-align: right !important;
}

.ql-toolbar {
  position: sticky;
  top: -26px;
  z-index: 100;
  background-color: white;
}

.custom-style-textarea,
.editing-custom-style {
  background-color: transparent !important;
  font-size: 18px !important;
  font-weight: bolder !important;
}

.ql-active,
.ql-snow.ql-toolbar button.ql-active .ql-fill,
.ql-snow.ql-toolbar button.ql-active .ql-stroke,
.ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke,
.ql-picker-item:hover,
.ql-picker-item.ql-selected,
.ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke {
  background-color: #f3f4f6 !important;
  color: #50CD89 !important;
  stroke: #50CD89 !important;
}

.ql-snow.ql-toolbar button.ql-active .ql-fill {
  fill: #50CD89 !important;
}

.ql-toolbar .ql-formats {
  position: relative !important;
}

.ql-toolbar .ql-formats:not(:last-of-type)::after {
  content: "";
  position: absolute;
  right: -4px;
  width: 1px;
  height: 90%;
  background-color: #b7b7b7;
}

.ql-picker-options,
.ql-tooltip {
  z-index: 100;
}

.ql-header {
  position: relative !important;
}

.ql-snow .ql-picker.ql-font,
.ql-snow .ql-picker.ql-header {
  width: fit-content !important;
}

.ql-snow .ql-picker.ql-font > .ql-picker-label,
.ql-snow .ql-picker.ql-header > .ql-picker-label {
  position: relative !important;
  width: fit-content !important;
}

.ql-snow .ql-picker.ql-font > .ql-picker-label::before,
.ql-snow .ql-picker.ql-header > .ql-picker-label::before {
  padding-left: 5px;
  padding-right: 5px;
  margin-right: 25px !important;
}

.ql-snow .ql-picker.ql-font > .ql-picker-label,
.ql-snow .ql-picker.ql-align > .ql-picker-label {
  margin-left: 4px !important;
}

blockquote {
  background: #f9f9f9 !important;
  border-left: 3px solid var(--bs-primary) !important;
  margin: 1.5em 10px !important;
  padding: 0.5em 10px !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
}

blockquote:before {
  color: #ccc !important;
  font-size: 4em !important;
  line-height: 0.1em !important;
  margin-right: 0.25em !important;
  vertical-align: -0.4em !important;
}

blockquote p {
  display: inline !important;
}

pre {
  font-family: "Courier New", monospace !important;
  background-color: #f4f4f4 !important;
  color: var(--bs-heading-color) !important;
  border: 1px solid #ddd !important;
  border-radius: 5px !important;
  padding: 15px !important;
  overflow-x: auto !important;
  white-space: pre-wrap !important;
}

.ql-font-monospace {
  font-family: Monaco, Courier New, monospace !important;
}

.ql-font-serif {
  font-family: Georgia, Times New Roman, serif !important;
}

.ql-snow .ql-picker.ql-expanded .ql-picker-options > .ql-picker-item {
  padding-left: 0 !important;
}

.ql-picker-item {
  display: flex !important;
}
</style>
<!--.comment-outside-style:hover {-->
<!--background-color: gray !important;-->
<!--opacity: .1 !important;-->
<!--}-->