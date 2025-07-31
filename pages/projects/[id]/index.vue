<script setup>
import {useProjectStore} from "~/stores/useProjectStore";
import {useAppStore} from "~/stores/useAppStore";
import {storeToRefs} from "pinia";
import draggable from 'vuedraggable';

definePageMeta({
  middleware: [
    "auth",
    "project-permissions"
  ],
});

const route = useRoute();
const {moveStatus} = usePostData();

// === stores === //
const projectStore = useProjectStore();
const appStore = useAppStore();
const {project, board, activeIssue} = storeToRefs(projectStore);

onMounted(async () => {
  appStore.isBoardLoading = true;
  await projectStore.refreshOpenedSprints(route.params?.id);
  await projectStore.refreshProjectStatuses(route.params.id);
  await projectStore.refreshAllAcceptedTeam(route.params.id);
  await projectStore.refreshAllLabels(route.params.id);
  await projectStore.refreshProjectBoard(route.params?.id);

  for (let i = 0; i < board.value?.board?.length; i++) {
    issuesLists.value.push(board.value?.board[i].issues);
  }

  for (const array of issuesLists.value) {
    totalIssuesLength.value += array.length;
  }

  appStore.isBoardLoading = false;
});

const visible = ref(true);

let totalIssuesLength = ref(0);
const issuesLists = ref([]);

const isOpen = ref(false);
const toggleView = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value === false) {
    activeIssue.value = -1;
  }
};

const onStatusChange = async (e) => {
  let statusMoved = e.moved;

  if (statusMoved) {
    await moveStatus(route.params.id, statusMoved.element.id, {order: statusMoved.newIndex + 1});
  }
}
</script>

<template>
  <SkeletonLoaderBoard v-if="appStore.isBoardLoading"/>

  <div v-else class="app-container container-xxl custom-p-style">
    <div class="board-header d-flex flex-column mb-5">
      <h2 v-if="board?.sprint.length === 1" class="mb-2">{{ board?.sprint[0]?.name }}</h2>
      <h2 v-else class="mb-6">
        <p v-if="board?.sprint.length === 0">No active sprints</p>
        <p v-else>{{ board?.sprint.length }} Active sprints</p>
      </h2>
      <span v-if="board?.sprint.length === 1" class="mb-5 text-gray-600">{{ board?.sprint[0]?.goal }}</span>
      <FilterGlobal from="board"/>
    </div>
    <main class="content">
      <div class="p-0 pt-6">
        <draggable
            v-can="'move status'"
            v-model="board.board"
            group="columns"
            item-key="id"
            ghost-class="ghost"
            class="columns-wrraper d-flex gap-5"
            handle=".handle"
            @change="onStatusChange"
        >
          <template #item="{element: status, index}">
            <ProjectBoardColumn :status="status" :index="index" :toggleView="toggleView"
                                :totalIssuesLength="totalIssuesLength" :totalStatusesLength="board?.board.length"/>
          </template>
        </draggable>

        <div v-can:not="'move status'" class="columns-wrraper d-flex gap-5">
          <ProjectBoardColumn v-for="(status, index) in board.board" :key="index" :status="status" :index="index" :toggleView="toggleView"
                              :totalIssuesLength="totalIssuesLength" :totalStatusesLength="board?.board.length"/>
        </div>
      </div>
    </main>
  </div>

  <ModalsDeleteStatus v-can="'delete status'"/>
  <Transition name="issueDetails">
    <IssueDetails v-if="isOpen" :toggleView="toggleView"
                  @issueUpdated="projectStore.refreshProjectBoard(route.params?.id)"/>
  </Transition>
</template>

<style scoped>
.card {
  margin-bottom: 1.5rem;
  box-shadow: 0 .25rem .5rem rgba(0, 0, 0, .025)
}

.columns-wrraper {
  overflow-x: auto;
  overflow-y: hidden;
}

.add-columns {
  transition: all 0.3s ease;
}

.add-columns:hover {
  background-color: var(--bs-gray-300) !important;
}

.issueDetails-enter-active,
.issueDetails-leave-active {
  transition: all 0.3s ease;
}

.issueDetails-enter-from,
.issueDetails-leave-to {
  right: -100% !important;
}
</style>