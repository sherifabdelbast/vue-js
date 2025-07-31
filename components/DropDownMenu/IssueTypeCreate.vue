<script setup>
import {useProjectStore} from "~/stores/useProjectStore";
import {storeToRefs} from "pinia";

const route = useRoute();

const projectStore = useProjectStore();
const {newIssueType} = storeToRefs(projectStore);

const isActive = ref(false);
const isLoading = ref(false);

const toggleIssueTypeMenu = () => {
  isActive.value = !isActive.value;
};

const closeMenu = (newType) => {
  isActive.value = false;
  newIssueType.value = newType;
}

const issueTypes = ref(["story", "task", "bug"]);
</script>

<template>
  <div class="position-relative issueType-menu-parent">
    <TooltipMain content="Issue type" placement="top">
      <div @click="toggleIssueTypeMenu" class="d-flex align-items-center fs-4 cursor-pointer custom-round type-show">
        <div class="d-flex align-items-center">
          <img v-if="newIssueType === 'task'" src="../../assets/media/svg/types/task.svg" alt="task" width="14">
          <img v-else-if="newIssueType === 'story'" src="../../assets/media/svg/types/story.svg" alt="story" width="14">
          <img v-else-if="newIssueType === 'bug'" src="../../assets/media/svg/types/bug.svg" alt="bug" width="14">
        </div>
        <Icon v-if="isActive" name="ic:baseline-keyboard-arrow-up" size="18"/>
        <Icon v-else name="ic:baseline-keyboard-arrow-down" size="18"/>
      </div>
    </TooltipMain>

    <Transition name="statusesMenu">
      <ul v-if="isActive" class="position-absolute flex-column bg-white shadow-sm gap-2 mb-0 custom-width options z-5 issueType-menu list-style-none rounded-1">
        <li v-for="(type, index) in issueTypes" :key="index" @click="closeMenu(type)">
          <div class="option h-30px" v-if="type !== newIssueType">
            <div class="info truncate" style="max-width: 200px">
              <img v-if="type === 'task'" src="../../assets/media/svg/types/task.svg" alt="task" width="15">
              <img v-else-if="type === 'story'" src="../../assets/media/svg/types/story.svg" alt="story" width="15">
              <img v-else-if="type === 'bug'" src="../../assets/media/svg/types/bug.svg" alt="bug" width="15">
              <span class="option-text fs-6 mx-2">{{ type }}</span>
            </div>
          </div>
        </li>
      </ul>
    </Transition>
  </div>
</template>

<style scoped>
.issueType-menu {
  padding: 5px;
}

.issueType-menu li:empty {
  display: none;
}

.statusesMenu-enter-active,
.statusesMenu-leave-active {
  top: 100%;
  opacity: 1;
  transition: all 0.3s ease;
}

.statusesMenu-enter-from,
.statusesMenu-leave-to {
  top: 120%;
  opacity: 0;
}
</style>