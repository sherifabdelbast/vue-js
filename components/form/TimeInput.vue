<script setup>
import {useAppStore} from "~/stores/useAppStore";

const appStore = useAppStore();
const emits = defineEmits(["update:input", "submit"]);
const props = defineProps(['inProgress', "time", 'input']);
const {inProgress, time, input} = toRefs(props);

const hasChanges = ref(false);
const isEditing = ref(false);
const oldTime = ref([...time.value]);

const inputComputed = computed({
  get: () => input.value,
  set: (val) => {
    if (JSON.stringify(val) !== JSON.stringify(props.time)) {
      hasChanges.value = true;
    }
    emits("update:input", val);
  },
});

const editInput = () => {
  isEditing.value = true;
};
const closeInput = () => {
  if (inProgress.value) return;
  setTimeout(() => {
    if (!hasChanges.value) {
      inputComputed.value = [...oldTime.value];
    }
    isEditing.value = false;
  }, 0);
};

const handleUpdateTime = () => {
  oldTime.value = [...inputComputed.value]; // Update the oldTime with the current input
  hasChanges.value = false;
  emits('submit');
};

watch(inProgress, (newValue, oldValue) => {
  if (!newValue && oldValue) {
    setTimeout(() => (isEditing.value = false), 0);
  }
});

const vFocus = {
  mounted: (el) => el.focus(),
};
</script>

<template>
  <div class="position-relative select-menu-status drop-down" v-click-outside="closeInput" v-can="{perms: 'edit issue', location: appStore.permissionLocation}">
    <div @click="editInput" :class="{ 'active': isEditing }" id="number">
      <div v-if="!isEditing" class="cursor-pointer">
        <div class="d-flex align-items-center gap-2 rounded-1 reporter-style border">
          <div v-if="time[0] === 0 && time[1] === 0 && time[2] === 0">
            Enter estimate time
          </div>
          <div v-else>
            <div class="d-flex align-items-center gap-2"
                 v-if="time[0] || time[1] || time[2]">
              <div class="badge badge-light-dark" v-if="time[0]">
                {{ time[0] }} d
              </div>
              <div class="badge badge-light-primary" v-if="time[1]">
                {{ time[1] }} h
              </div>
              <div class="badge badge-light-warning" v-if="time[2]">
                {{ time[2] }} m
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="position-relative" id="clickOutSide">
        <div class="input-group input-group-sm custom-input-group-style">
          <span class="input-group-text">D</span>
          <input v-model="inputComputed[0]"
                 type="number"
                 class="form-control"
                 placeholder="Days"
                 @keydown.enter.prevent="handleUpdateTime"
                 @keydown.esc.prevent="closeInput"/>
          <span class="input-group-text">H</span>
          <input v-model="inputComputed[1]"
                 type="number"
                 class="form-control"
                 placeholder="Hours"
                 v-focus
                 @keydown.enter.prevent="handleUpdateTime"
                 @keydown.esc.prevent="closeInput"/>
          <span class="input-group-text">M</span>
          <input v-model="inputComputed[2]"
                 type="number"
                 class="form-control"
                 placeholder="Minutes"
                 @keydown.enter.prevent="handleUpdateTime"
                 @keydown.esc.prevent="closeInput"
          />
        </div>
        <div class="position-absolute d-flex align-items-center z-index-1 gap-1 mt-1"
             style="right: 0">
          <button @click="handleUpdateTime"
                  :disabled="inProgress"
                  type="submit"
                  class="btn btn-light-primary btn-flex btn-center btn-sm cursor-pointer custom-button custom-shadow">
            <div v-if="inProgress" class="text-center">
              <Icon name="svg-spinners:180-ring-with-bg" size="15"/>
            </div>
            <span v-else>Save</span>
          </button>
          <button @click="closeInput" :disabled="inProgress"
                  class="btn btn-light-danger btn-flex btn-center btn-sm cursor-pointer custom-button custom-shadow">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>

<div class="position-relative select-menu-status drop-down" v-can:not="{perms: 'edit issue', location: appStore.permissionLocation}">
    <div class="cursor-pointer">
      <div class="d-flex align-items-center gap-2 rounded-1 reporter-style border">
        <div v-if="time[0] === 0 && time[1] === 0 && time[2] === 0">
          Enter estimate time
        </div>
        <div v-else>
          <div class="d-flex align-items-center gap-2"
               v-if="time[0] || time[1] || time[2]">
            <div class="badge badge-light-dark" v-if="time[0]">
              {{ time[0] }} d
            </div>
            <div class="badge badge-light-primary" v-if="time[1]">
              {{ time[1] }} h
            </div>
            <div class="badge badge-light-warning" v-if="time[2]">
              {{ time[2] }} m
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>