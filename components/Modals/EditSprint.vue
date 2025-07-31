<script setup>
import {useAppStore} from "~/stores/useAppStore";
import {useProjectStore} from "~/stores/useProjectStore";
import {usePostData} from "~/composables/usePostData";
import {useToast} from "vue-toastification";
import {storeToRefs} from "pinia";
import {helpers, maxLength, required} from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import moment from "moment";

const route = useRoute();

const props = defineProps(["id"]);

// === Data === //
const toast = useToast();
const user = useUser();
const {updateSprintInfo} = usePostData();
const appStore = useAppStore();
const projectStore = useProjectStore();
const {project, editSprintFromData, oldEditSprintFromData} = storeToRefs(projectStore)

const startDate = ref("");
const endDate = ref("");

const durationOptions = ref([
  {name: '1 Week', code: '1'},
  {name: '2 Weeks', code: '2'},
  {name: '3 Weeks', code: '3'},
  {name: '4 Weeks', code: '4'}
]);

// const selectedDuration = ref(editSprintFromData.value.duration);

const validationErrors = reactive({
  name: null,
  goal: null,
  start_date: null,
  duration: null,
  allValid: true
});

const rules = {
  name: {
    required: helpers.withMessage('Sprint name is required.', required),
    maxLength: helpers.withMessage("Sprint name can't be more than 30 character.", maxLength(30))
  },
  goal: {
    message: helpers.withMessage('Goal too long. Keep it within 255 characters.', maxLength(255))
  }
}
const v$ = useVuelidate(rules, editSprintFromData.value);

const handleDateCalc = () => {
  if (editSprintFromData.value.start_date) {
    editSprintFromData.value.start_date = moment(editSprintFromData.value.start_date).format('YYYY-MM-DD hh:mm:ss');
    editSprintFromData.value.end_date = moment(editSprintFromData.value.start_date, 'YYYY-MM-DD hh:mm:ss').add(editSprintFromData.value.duration.code, 'weeks').format('YYYY-MM-DD hh:mm:ss');
  }
}

const handleSubmit = async () => {
  validationErrors.name = null;
  validationErrors.goal = null;
  validationErrors.duration = null;
  validationErrors.allValid = true;
  const result = await v$.value.$validate();

  if (result && validationErrors.allValid) {
    if (oldEditSprintFromData.value.name !== editSprintFromData.value.name || oldEditSprintFromData.value.goal !== editSprintFromData.value.goal || oldEditSprintFromData.value.start_date !== editSprintFromData.value.start_date || oldEditSprintFromData.value.duration !== editSprintFromData.value.duration.name || oldEditSprintFromData.value.end_date !== editSprintFromData.value.end_date) {
      editSprintFromData.value.duration = editSprintFromData.value.duration.name;

      await submit();
      return;
    } else {
      document.getElementById(`closeEditSprinttModal${props.id}`).click();
      return;
    }
  }

  validationErrors.name = v$.value?.name?.$errors[0]?.$message;
  validationErrors.goal = v$.value?.goal?.$errors[0]?.$message;
};

const {
  submit,
  inProgress,
  validationErrors: errors
} = useSubmit(() => updateSprintInfo(route.params.id, editSprintFromData.value.id, editSprintFromData.value), {
      onSuccess: async (response) => {
        if (response.code === 200) {
          document.getElementById(`closeEditSprinttModal${props.id}`).click();
          toast.success(response.message);
          await projectStore.refreshProjectBacklog(route.params.id);
        }
      }
    }
);
</script>

<template>
  <div class="modal fade" :id="`kt_modal_edit_sprint${id}`" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog mw-650px">
      <div class="modal-content">
        <div class="modal-header pb-0 border-0 justify-content-end">
          <div class="btn btn-sm btn-icon btn-active-color-primary" data-bs-dismiss="modal"
               :id="`closeEditSprinttModal${id}`">
            <i class="ki-outline ki-cross fs-1"></i>
          </div>
        </div>
        <div class="modal-body mx-5 mx-xl-18 pt-0">
          <div class="text-center mb-13">
            <h1 class="mb-3">Edit Sprint: <span class="text-primary">"{{ oldEditSprintFromData?.name }}"</span></h1>
          </div>
          <form @submit.prevent="handleSubmit" class="mb-8">
            <FormInput type="text" autocomplete="off" labelText="Sprint Name" name="name"
                       placeholder="Sprint Name" class="mb-7"
                       v-model:input="editSprintFromData.name" :formDataError="validationErrors.name || errors?.name"/>

            <div class="mb-7">
              <label class="d-block mb-2" :class="{'text-danger': errors?.start_date}">Start date</label>
              <VueDatePicker id="startSprintDate" v-model="editSprintFromData.start_date"
                             @update:model-value="handleDateCalc" @cleared="handleDateCalc"></VueDatePicker>
              <span v-if="errors?.start_date" class="form-data-error">{{ errors?.start_date }}</span>
            </div>

            <div class="mb-7 w-100">
              <label class="d-block mb-2" :class="{'text-danger': validationErrors.duration}">Duration</label>
              <Dropdown v-model="editSprintFromData.duration" :options="durationOptions" @update:modelValue="handleDateCalc"
                        optionLabel="name"
                        placeholder="Select a Duration" class="w-100"
                        :class="{'border-danger': validationErrors.duration}"
                        :pt="{
                            root: { class: 'h-45px rounded px-1' },
                        }"
              />
              <div v-if="validationErrors.duration" class="w-100 text-start mt-1">
                <span class="form-data-error">{{ validationErrors.duration }}</span>
              </div>
            </div>

            <div class="mb-7">
              <label class="d-block mb-2">End date</label>
              <VueDatePicker id="startSprintDate" :model-value="editSprintFromData.end_date" disabled></VueDatePicker>
            </div>

            <FormTextArea name="goal" placeholder="Sprint Goal"
                          labelText="Sprint Goal"
                          class="mb-3"
                          @keydown.enter.prevent="handleSubmit"
                          v-model:input="editSprintFromData.goal"
                          :formDataError="validationErrors.goal || errors?.goal"/>

            <button class="btn btn-primary w-100 mt-5" :disabled="inProgress">
              <img v-if="inProgress" src="~/assets/media/misc/spinner.gif" width="16">
              <span v-else class="indicator-label mr-3">Update</span>
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