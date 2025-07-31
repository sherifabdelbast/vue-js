<script setup>
import {useAppStore} from "~/stores/useAppStore";
import moment from "moment/moment";

const props = defineProps(["notify"]);

const {markNotificationAsRead} = usePostData();

const appStore = useAppStore();

const isReadLoading = ref(false);

const markAsRead = async (notificationId) => {
  isReadLoading.value = true;
  const response = await markNotificationAsRead(notificationId);

  if (response?.code === 200) {
    await appStore.refreshUserNotifications(false);
  }

  isReadLoading.value = false;
}
</script>

<template>
  <div class="notify-item d-flex py-5 px-3 rounded cursor-pointer border mb-3 position-relative">
    <div class="me-3">
      <TooltipMain :content="notify?.notification?.user?.name" placement="top">
        <Avatar :user="notify?.notification?.user" imgWidth="35"/>
      </TooltipMain>
    </div>

    <div v-if="notify?.notification?.type === 'issue' || notify?.notification?.type === 'comment'" class="flex-grow-1">
      <p class="fs-6 fw-bold mb-1">{{notify?.notification?.user?.name}} {{ notify?.notification?.title }}</p>

      <div>
        <div class="text-gray-600 fs-7 d-flex mb-2">
              <span class="me-1">
                <img v-if="notify?.notification?.issue?.type === 'task'" src="../assets/media/svg/types/task.svg"
                     alt="task" width="11">
                <img v-if="notify?.notification?.issue?.type === 'story'" src="../assets/media/svg/types/story.svg"
                     alt="story" width="11">
                <img v-if="notify?.notification?.issue?.type === 'bug'" src="../assets/media/svg/types/bug.svg"
                     alt="bug" width="11">
              </span>
          <span class="text-gray-600 fs-7 me-2 text-uppercase text-nowrap">{{
              notify?.notification?.issue?.key
            }}</span>
          <p class="issue-title">{{ notify?.notification?.issue?.title }}</p>
        </div>

        <div class="d-flex align-items-center justify-content-between">
          <div class="d-flex align-items-center">
            <p class="fs-8 text-uppercase" :class="{'text-primary': notify?.notification?.issue?.status?.type === 'DONE'},
                    {'text-gray-800': notify?.notification?.issue?.status?.type === 'TO DO'},
                    {'text-success': notify?.notification?.issue?.status?.type === 'IN PROGRESS'}
                  ">
              {{ notify?.notification?.issue?.status?.name }}
            </p>

            <span class="bg-gray-400 w-5px h-5px rounded-circle mx-2"></span>

            <p class="text-muted fs-7">{{ notify?.notification?.project?.name }} ({{notify?.notification?.project?.key}})</p>
          </div>

          <p class="ms-2 fs-7 fw-semibold text-gray-500">{{ moment(notify?.notification?.created_at).startOf('minutes').fromNow() }}</p>
        </div>
      </div>
    </div>

    <div v-else-if="notify?.notification?.type === 'sprint'" class="flex-grow-1">
      <p class="fs-6 fw-bold mb-1">{{notify?.notification?.user?.name}} {{ notify?.notification?.title }}</p>

      <div>
        <div class="text-gray-600 fs-7 d-flex mb-2">
          <p class="issue-title">{{ notify?.notification?.sprint?.name }}</p>
        </div>

        <div class="d-flex align-items-center justify-content-between">
          <div class="d-flex align-items-center">
            <p v-if="notify?.notification?.sprint?.status === 'IN PROGRESS'" class="fs-8 text-uppercase text-success">
              Active
            </p>
            <p v-else class="fs-8 text-uppercase">
              {{ notify?.notification?.sprint?.status }}
            </p>

            <span class="bg-gray-400 w-5px h-5px rounded-circle mx-2"></span>

            <p class="text-muted fs-7">{{ notify?.notification?.project?.name }} ({{notify?.notification?.project?.key}})</p>
          </div>

          <p class="ms-2 fs-7 fw-semibold text-gray-500">{{ moment(notify?.notification?.created_at).startOf('minutes').fromNow() }}</p>
        </div>
      </div>
    </div>

    <div v-if="notify?.notification?.type === 'member'" class="flex-grow-1">
      <p class="fs-6 fw-bold mb-1">{{notify?.notification?.user?.name}} {{ notify?.notification?.title }}</p>

      <div>
        <div class="text-gray-600 fs-7 d-flex mb-2 d-flex align-items-center gap-2">
          <Avatar :user="notify?.notification?.member" imgWidth="25"/>

          <p class="issue-title">{{ notify?.notification?.member?.name }}</p>
        </div>

        <div class="d-flex align-items-center justify-content-between">
          <div class="d-flex align-items-center">
            <p class="fs-8 text-uppercase">
              {{ notify?.notification?.member?.role }}
            </p>

            <span class="bg-gray-400 w-5px h-5px rounded-circle mx-2"></span>

            <p class="text-muted fs-7">{{ notify?.notification?.project?.name }} ({{notify?.notification?.project?.key}})</p>
          </div>

          <p class="ms-2 fs-7 fw-semibold text-gray-500">{{ moment(notify?.notification?.created_at).startOf('minutes').fromNow() }}</p>
        </div>
      </div>
    </div>

    <div v-if="notify?.notification?.type === 'invite'" class="flex-grow-1">
      <p class="fs-6 fw-bold mb-1">{{notify?.notification?.user?.name}} {{ notify?.notification?.title }}</p>

      <div>
        <div class="text-gray-600 fs-7 d-flex mb-2 d-flex align-items-center gap-2">
          <Avatar :user="notify?.notification?.invitation?.member" imgWidth="25"/>

          <p v-if="notify?.notification?.invitation?.member?.name" class="issue-title">{{ notify?.notification?.invitation?.member?.name }}</p>

          <span v-if="notify?.notification?.invitation?.member?.name" class="bg-gray-400 w-5px h-5px rounded-circle"></span>

          <p class="issue-title">{{ notify?.notification?.invitation?.member?.email }}</p>
        </div>

        <div class="d-flex align-items-center justify-content-between">
          <div class="d-flex align-items-center">
            <p class="fs-8 text-uppercase" :class="{'text-warning': notify?.notification?.invitation?.invite_status === 'wait'}, {'text-primary': notify?.notification?.invitation?.invite_status === 'accept'}">
              {{ notify?.notification?.invitation?.invite_status }}
            </p>

            <span class="bg-gray-400 w-5px h-5px rounded-circle mx-2"></span>

            <p class="text-muted fs-7">{{ notify?.notification?.project?.name }} ({{notify?.notification?.project?.key}})</p>
          </div>

          <p class="ms-2 fs-7 fw-semibold text-gray-500">{{ moment(notify?.notification?.created_at).startOf('minutes').fromNow() }}</p>
        </div>
      </div>
    </div>

    <div v-if="notify?.notification?.type === 'role'" class="flex-grow-1">
      <p class="fs-6 fw-bold mb-1">{{notify?.notification?.user?.name}} {{ notify?.notification?.title }}</p>

      <div>
        <div class="text-gray-600 fs-7 d-flex mb-2">
          <p class="issue-title">{{ notify?.notification?.role?.key }}</p>
        </div>

        <div class="d-flex align-items-center justify-content-between">
          <div class="d-flex align-items-center">
            <p class="text-muted fs-7">{{ notify?.notification?.project?.name }} ({{notify?.notification?.project?.key}})</p>
          </div>

          <p class="ms-2 fs-7 fw-semibold text-gray-500">{{ moment(notify?.notification?.created_at).startOf('minutes').fromNow() }}</p>
        </div>
      </div>
    </div>

    <TooltipMain v-if="!notify?.read_at && !isReadLoading" content="Mark as read" placement="left"
                 class="position-absolute read-button d-flex align-items-center justify-content-center">
      <div @click="markAsRead(notify?.id)" class="w-10px h-10px bg-primary opacity-50 rounded-circle"></div>
    </TooltipMain>

    <TooltipMain v-if="isReadLoading" content="Loading" placement="left"
                 class="position-absolute read-button d-flex align-items-center justify-content-center">
        <Icon name="svg-spinners:180-ring-with-bg" class="text-primary" size="14"/>
    </TooltipMain>
  </div>
</template>

<style scoped>
.notify-item {
  transition: all 0.3s ease;
}

.notify-item:hover {
  background-color: #f5f5f5 !important;
}

.notify-item:hover .issue-title {
  text-decoration: underline;
}

.read-button {
  top: 10px;
  right: 10px;
}

.read-button div {
  transition: all 0.3s ease;
}

.read-button:hover div {
  opacity: 1 !important;
}
</style>