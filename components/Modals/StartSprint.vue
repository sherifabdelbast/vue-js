<script setup>
import {useAppStore} from "~/stores/useAppStore";
import {useProjectStore} from "~/stores/useProjectStore";
import {usePostData} from "~/composables/usePostData";
import {useToast} from "vue-toastification";
import {storeToRefs} from "pinia";
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import moment from "moment";

const props = defineProps(["id"]);

const route = useRoute();

// === Data === //
const toast = useToast();
const user = useUser();
const {startSprint} = usePostData();
const appStore = useAppStore();
const projectStore = useProjectStore();
const {project, editSprintFromData, editSprintValidationErrors} = storeToRefs(projectStore);

const startDate = ref("");
const endDate = ref("");

const durationOptions = ref([
  {name: '1 Week', code: '1'},
  {name: '2 Weeks', code: '2'},
  {name: '3 Weeks', code: '3'},
  {name: '4 Weeks', code: '4'}
]);


const handleDateCalc = () => {
  if (editSprintFromData.value.start_date) {
    editSprintFromData.value.start_date = moment(editSprintFromData.value.start_date).format('YYYY-MM-DD hh:mm:ss');
    editSprintFromData.value.end_date = moment(editSprintFromData.value.start_date, 'YYYY-MM-DD hh:mm:ss').add(editSprintFromData.value.duration.code, 'weeks').format('YYYY-MM-DD hh:mm:ss');
  }
}

const handleSubmit = async () => {
  editSprintValidationErrors.value.duration = null;
  editSprintValidationErrors.value.start_date = null;
  editSprintValidationErrors.value.allValid = true;

  if (!editSprintFromData.value.start_date) {
    editSprintValidationErrors.value.start_date = "Start date is required to start the sprint";
    editSprintValidationErrors.value.allValid = false;
  }

  if (editSprintValidationErrors.value.allValid) {
    editSprintFromData.value.duration = editSprintFromData.value.duration.name;

    await submit();
  }
};

const {
  submit,
  inProgress,
  validationErrors: errors
} = useSubmit(() => startSprint(route.params.id, editSprintFromData.value.id, editSprintFromData.value), {
      onSuccess: async (response) => {
        if (response.code === 200) {
          document.getElementById(`closeStartSprintModal${props?.id}`).click();
          toast.success(response.message);
          await navigateTo(`/projects/${route.params.id}`);
        }
      }
    }
);
</script>

<template>
  <div class="modal fade" :id="`kt_modal_start_sprint${id}`" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog mw-650px">
      <div class="modal-content">
        <div class="modal-header pb-0 border-0 justify-content-end">
          <div class="btn btn-sm btn-icon btn-active-color-primary" data-bs-dismiss="modal"
               :id="`closeStartSprintModal${id}`">
            <i class="ki-outline ki-cross fs-1"></i>
          </div>
        </div>
        <div class="modal-body mx-5 mx-xl-18 pt-0 pb-7">
          <div class="text-center mb-6">
            <h1 class="mb-3">Start Sprint: <span class="text-primary">"{{ editSprintFromData?.name }}"</span></h1>
            <p v-if="editSprintFromData?.goal" class="text-start p-3 bg-gray-100 rounded-1"><strong>Goal:</strong>
              {{ editSprintFromData?.goal }}</p>
          </div>
          <form @submit.prevent="handleSubmit" class="mb-4">
            <div>
              <label class="d-block mb-2"
                     :class="{'text-danger': editSprintValidationErrors?.start_date || errors?.start_date}">Start
                date</label>
              <VueDatePicker id="startSprintDate" v-model="editSprintFromData.start_date"
                             @update:model-value="handleDateCalc" @cleared="handleDateCalc"></VueDatePicker>
              <div class="w-100 text-start mt-1">
                <span class="form-data-error">{{ editSprintValidationErrors?.start_date || errors?.start_date }}</span>
              </div>
            </div>

            <div class="w-100">
              <label class="d-block mb-2"
                     :class="{'text-danger': editSprintValidationErrors?.duration || errors?.duration}">Duration</label>
              <Dropdown v-model="editSprintFromData.duration" :options="durationOptions" @update:modelValue="handleDateCalc"
                        optionLabel="name"
                        placeholder="Select a Duration" class="w-100"
                        :class="{'border-danger': editSprintValidationErrors.duration}"
                        :pt="{
                            root: { class: 'h-45px rounded px-1' },
                        }"
              />
              <div class="w-100 text-start mt-1">
                <span class="form-data-error">{{ editSprintValidationErrors?.duration || errors?.duration }}</span>
              </div>
            </div>

            <div :class="{'text-danger': editSprintValidationErrors?.end_date || errors?.end_date}">
              <label class="d-block mb-2">End date</label>
              <VueDatePicker id="startSprintDate" :model-value="editSprintFromData.end_date" disabled></VueDatePicker>
              <div class="w-100 text-start mt-1">
                <span class="form-data-error">{{ editSprintValidationErrors?.end_date || errors?.end_date }}</span>
              </div>
            </div>

            <button class="btn btn-primary w-100 mt-5" :disabled="inProgress">
              <img v-if="inProgress" src="~/assets/media/misc/spinner.gif" width="16">
              <span v-else class="indicator-label mr-3">Start</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
input.dp__pointer ,
input.dp__disabled {
  height: 45px !important;
  border-radius: 10px;
}
</style>