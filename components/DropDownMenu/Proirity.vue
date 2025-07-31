<script setup>
import {usePostData} from "~/composables/usePostData";
import {useProjectStore} from "~/stores/useProjectStore";

const props = defineProps(["selectedPriority", "issueId", "projectId", "from"]);

const projectStore = useProjectStore();
const { getFilters } = useFilters();
const filters = getFilters();

const {updateIssuePriority} = usePostData();

const priorityLoading = ref(false);
const priorityOpen = ref(false);

const openPriority = () => priorityOpen.value = !priorityOpen.value;

const closePriority = () => priorityOpen.value = false;

const handleChangePriority = async (priority) => {
  priorityLoading.value = true;
  closePriority();
  const response = await updateIssuePriority(props.projectId, props.issueId, {priority: priority});
  if (response?.code === 200) {
    if (props.from === 'backlog') {
      await projectStore.refreshProjectBacklog(props.projectId, filters);
    } else if (props.from === 'board') {
      await projectStore.refreshProjectBoard(props.projectId, filters);
    }
  }
  priorityLoading.value = false;
}

const priorityOptions = ref([
  { name: "Highest" },
  { name: "High" },
  { name: "Medium" },
  { name: "Low" },
  { name: "Lowest" },
]);
</script>

<template>
  <div class="position-relative">
    <TooltipMain :content="selectedPriority" :placement="from === 'board' ? 'top' : 'right'">
      <div class="py-1 rounded-1 fw-bold fs-8 text-uppercase text-nowrap cursor-default" v-can:not="'edit issue'">
        <Icon v-if="selectedPriority === 'Highest'" name="mingcute:arrows-up-line" size="20" class="m-0"
              :class="{'text-danger': selectedPriority === 'Highest'}"/>
        <Icon v-else-if="selectedPriority === 'High'" name="material-symbols:keyboard-arrow-up-rounded" size="20" class="m-0"
              :class="{'text-danger': selectedPriority === 'High'}"/>
        <Icon v-else-if="selectedPriority === 'Medium'" name="iconamoon:sign-equal-fill" size="20" class="m-0"
              :class="{'text-warning': selectedPriority === 'Medium'}"/>
        <Icon v-else-if="selectedPriority === 'Low'" name="material-symbols:keyboard-arrow-down-rounded" size="20" class="m-0"
              :class="{'text-success': selectedPriority === 'Low'}"/>
        <Icon v-else-if="selectedPriority === 'Lowest'" name="mingcute:arrows-down-line" size="20" class="m-0"
              :class="{'text-success': selectedPriority === 'Lowest'}"/>
      </div>
    </TooltipMain>

    <TooltipMain v-if="priorityLoading" content="Loading" :placement="from === 'board' ? 'top' : 'right'">
      <div class="py-1 px-3 rounded-1 fw-bold fs-8">
        <Icon name="svg-spinners:180-ring-with-bg" size="16"/>
      </div>
    </TooltipMain>

    <TooltipMain v-else :content="selectedPriority" :placement="from === 'board' ? 'top' : 'right'">
      <div @click="openPriority" v-can="'edit issue'" class="priority-button py-1 px-2 rounded-1 fw-bold fs-8 text-uppercase text-nowrap">
        <Icon v-if="selectedPriority === 'Highest'" name="mingcute:arrows-up-line" size="20" class="m-0"
              :class="{'text-danger': selectedPriority === 'Highest'}"/>
        <Icon v-else-if="selectedPriority === 'High'" name="material-symbols:keyboard-arrow-up-rounded" size="20" class="m-0"
              :class="{'text-danger': selectedPriority === 'High'}"/>
        <Icon v-else-if="selectedPriority === 'Medium'" name="iconamoon:sign-equal-fill" size="20" class="m-0"
              :class="{'text-warning': selectedPriority === 'Medium'}"/>
        <Icon v-else-if="selectedPriority === 'Low'" name="material-symbols:keyboard-arrow-down-rounded" size="20" class="m-0"
              :class="{'text-success': selectedPriority === 'Low'}"/>
        <Icon v-else-if="selectedPriority === 'Lowest'" name="mingcute:arrows-down-line" size="20" class="m-0"
              :class="{'text-success': selectedPriority === 'Lowest'}"/>
      </div>
    </TooltipMain>

    <Transition name="priorityMenu">
      <div v-click-outside="closePriority" v-if="priorityOpen" v-can="'edit issue'"
           class="priorityMenuWrapper position-absolute bg-light shadow px-3 p-2 d-flex flex-column gap-3 rounded-1"
           style="min-width: 125px !important; width: max-content !important; right: 0;">

        <div v-for="(proir, index) in priorityOptions" :key="index"
             class="priority-item p-1"
             @click="handleChangePriority(proir.name)"
             :class="{'border-danger': proir.name === 'High' || proir.name === 'Highest'},
             {'border-success': proir.name === 'Low' || proir.name === 'Lowest'},
             {'border-warning': proir.name === 'Medium'}"
        >
          <div v-if="proir.name !== selectedPriority">
            <Icon v-if="proir.name === 'Highest'" name="mingcute:arrows-up-line" size="20" class="m-0"
                  :class="{'text-danger': proir.name === 'Highest'}"/>
            <Icon v-else-if="proir.name === 'High'" name="material-symbols:keyboard-arrow-up-rounded" size="20" class="m-0"
                  :class="{'text-danger': proir.name === 'High'}"/>
            <Icon v-else-if="proir.name === 'Medium'" name="iconamoon:sign-equal-fill" size="20" class="m-0"
                  :class="{'text-warning': proir.name === 'Medium'}"/>
            <Icon v-else-if="proir.name === 'Low'" name="material-symbols:keyboard-arrow-down-rounded" size="20" class="m-0"
                  :class="{'text-success': proir.name === 'Low'}"/>
            <Icon v-else-if="proir.name === 'Lowest'" name="mingcute:arrows-down-line" size="20" class="m-0"
                  :class="{'text-success': proir.name === 'Lowest'}"/>

            <span class="ms-2">{{proir.name}}</span>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.priorityMenuWrapper {
  transition: all 0.3s ease;
  top: 115%;
}

.priorityMenu-enter-active,
.priorityMenu-leave-active {
  top: 115%;
  opacity: 1;
  transition: all 0.3s ease;
}

.priorityMenu-enter-from,
.priorityMenu-leave-to {
  top: 130%;
  opacity: 0;
}

.priority-item {
  border-left: 2px solid;
  transition: all 0.3s ease;
}

.priority-item:empty {
  display: none !important;
}

.priority-item:hover {
  background-color: var(--bs-gray-200);
}

.priority-button {
  transition: all 0.3s ease;
}

.priority-button:hover {
  background-color: var(--bs-gray-200);
}
</style>