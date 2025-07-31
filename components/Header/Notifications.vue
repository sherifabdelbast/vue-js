<script setup>
import {useAppStore} from "~/stores/useAppStore";
import {storeToRefs} from "pinia";

const props = defineProps(["isNotificationsOpen"]);

// === stores === //
const appStore = useAppStore();
const {isNotificationsLoading, userNotifications} = storeToRefs(appStore);

const isReadAllLoading = ref(false);

const fakeNotifications = ref([
  {
    "id": 2,
    "user_id": 7,
    "notify_id": 2,
    "read_at": "2023-09-29T17:42:42.883693Z",
    "deleted_at": null,
    "created_at": null,
    "updated_at": "2023-09-29T17:42:42.000000Z",
    "notification": {
      "id": 2,
      "title": "move issue from IN PROGRESS to DONE",
      "content": "test 2",
      "type": "issue",
      "action": "test 2",
      "user_id": 7,
      "issue_id": 5,
      "user_received_action": null,
      "created_at": "2023-09-29 15:57:27",
      "updated_at": null,
      "invitation_id": null,
      "project": {
        "id": 1,
        "name": "Taskat",
        "key": "TS",
        "project_identify": "c94d2327-405d-4bfc-8c0c-7ead064690af",
      },
      "issue": {
        "id": 5,
        "title": "Fixing bugs and testing the system.",
        "key": "Mi-4",
        "type": "story",
        "status": {
          "name": "DONE",
          "type": "DONE"
        }
      },
      "user": {
        "id": 7,
        "name": "Nasr Aldaya",
        "email": "wendell.yundt@yahoo.com",
        "url_photo": "https://i.postimg.cc/RCkBzs4M/avatar03.png"
      }
    }
  },
  {
    "id": 2,
    "user_id": 7,
    "notify_id": 2,
    "read_at": null,
    "deleted_at": null,
    "created_at": null,
    "updated_at": "2023-09-29T17:42:42.000000Z",
    "notification": {
      "id": 2,
      "title": "move issue from IN PROGRESS to DONE",
      "content": "test 2",
      "type": "issue",
      "action": "test 2",
      "user_id": 7,
      "issue_id": 5,
      "user_received_action": null,
      "created_at": "2023-09-29 15:57:27",
      "updated_at": null,
      "invitation_id": null,
      "project": {
        "id": 1,
        "name": "Taskat",
        "key": "TS",
        "project_identify": "c94d2327-405d-4bfc-8c0c-7ead064690af",
      },
      "issue": {
        "id": 5,
        "title": "When searching in backlog and then removing the search the issues disappear",
        "key": "Mi-10",
        "type": "bug",
        "project_id": 1,
        "project_identify": "c94d2327-405d-4bfc-8c0c-7ead064690af",
        "status": {
          "name": "IN PROGRESS",
          "type": "IN PROGRESS"
        }
      },
      "user": {
        "id": 7,
        "name": "Hosam Mousa",
        "email": "wendell.yundt@yahoo.com",
        "url_photo": null
      }
    }
  },
  {
    "id": 2,
    "user_id": 7,
    "notify_id": 2,
    "read_at": "2023-09-29T17:42:42.883693Z",
    "deleted_at": null,
    "created_at": null,
    "updated_at": "2023-09-29T17:42:42.000000Z",
    "notification": {
      "id": 2,
      "title": "edit sprint 1 info",
      "content": "test 2",
      "type": "sprint",
      "action": "test 2",
      "user_id": 7,
      "issue_id": 5,
      "user_received_action": null,
      "created_at": "2023-09-29 15:57:27",
      "updated_at": null,
      "invitation_id": null,
      "project": {
        "id": 1,
        "name": "Taskat",
        "key": "TS",
        "project_identify": "c94d2327-405d-4bfc-8c0c-7ead064690af",
      },
      "sprint": {
        "id": 5,
        "title": "Sprint 05",
        "status": "IN PROGRESS",
        "project_id": 1,
        "project_identify": "c94d2327-405d-4bfc-8c0c-7ead064690af",
      },
      "user": {
        "id": 7,
        "name": "Nasr Aldaya",
        "email": "wendell.yundt@yahoo.com",
        "url_photo": "https://i.postimg.cc/RCkBzs4M/avatar03.png"
      }
    }
  },
  {
    "id": 2,
    "user_id": 7,
    "notify_id": 2,
    "read_at": null,
    "deleted_at": null,
    "created_at": null,
    "updated_at": "2023-09-29T17:42:42.000000Z",
    "notification": {
      "id": 2,
      "title": "change mohamed role",
      "content": "test 2",
      "type": "member",
      "action": "test 2",
      "user_id": 7,
      "issue_id": 5,
      "user_received_action": null,
      "created_at": "2023-09-29 15:57:27",
      "updated_at": null,
      "invitation_id": null,
      "project": {
        "id": 1,
        "name": "Taskat",
        "key": "TS",
        "project_identify": "c94d2327-405d-4bfc-8c0c-7ead064690af",
      },
      "member": {
        "id": 5,
        "name": "Mohamed Namla",
        "email": "wendell.yundt@yahoo.com",
        "url_photo": null,
        "role": "member"
      },
      "user": {
        "id": 7,
        "name": "Nasr Aldaya",
        "email": "wendell.yundt@yahoo.com",
        "url_photo": "https://i.postimg.cc/RCkBzs4M/avatar03.png"
      }
    }
  },
  {
    "id": 2,
    "user_id": 7,
    "notify_id": 2,
    "read_at": "2023-09-29T17:42:42.883693Z",
    "deleted_at": null,
    "created_at": null,
    "updated_at": "2023-09-29T17:42:42.000000Z",
    "notification": {
      "id": 2,
      "title": "invite a new member to the team",
      "content": "test 2",
      "type": "invite",
      "action": "test 2",
      "user_id": 7,
      "issue_id": 5,
      "user_received_action": null,
      "created_at": "2023-09-29 15:57:27",
      "updated_at": null,
      "invitation_id": null,
      "project": {
        "id": 1,
        "name": "Taskat",
        "key": "TS",
        "project_identify": "c94d2327-405d-4bfc-8c0c-7ead064690af",
      },
      "invitation": {
        "id": 5,
        "message": "hello",
        "member": {
          "id": 12,
          "name": null,
          "email": "member@gmail.com",
          "url_photo": null
        },
        "invite_status": "wait"
      },
      "user": {
        "id": 7,
        "name": "Nasr Aldaya",
        "email": "wendell.yundt@yahoo.com",
        "url_photo": "https://i.postimg.cc/RCkBzs4M/avatar03.png"
      }
    }
  },
  {
    "id": 2,
    "user_id": 7,
    "notify_id": 2,
    "read_at": null,
    "deleted_at": null,
    "created_at": null,
    "updated_at": "2023-09-29T17:42:42.000000Z",
    "notification": {
      "id": 2,
      "title": "added a new role",
      "content": "test 2",
      "type": "role",
      "action": "test 2",
      "user_id": 7,
      "issue_id": 5,
      "user_received_action": null,
      "created_at": "2023-09-29 15:57:27",
      "updated_at": null,
      "invitation_id": null,
      "project": {
        "id": 1,
        "name": "Taskat",
        "key": "TS",
        "project_identify": "c94d2327-405d-4bfc-8c0c-7ead064690af",
      },
      "role": {
        "id": 5,
        "key": "developer",
        "name": "developer",
      },
      "user": {
        "id": 7,
        "name": "Nasr Aldaya",
        "email": "wendell.yundt@yahoo.com",
        "url_photo": "https://i.postimg.cc/RCkBzs4M/avatar03.png"
      }
    }
  },
]);

const markAllAsRead = async () => {
  isReadAllLoading.value = true;
  await appStore.refreshUserNotifications(true);
  isReadAllLoading.value = false;
}
</script>

<template>
  <Transition name="notificationsMenu">
    <div v-if="isNotificationsOpen"
         class="menu-gray-800 menu-state-bg bg-light rounded-2 menu-state-color fw-semibold py-5 px-5 fs-6 w-500px position-absolute account-menu shadow"
         style="z-index: 10000 !important;">
      <SkeletonLoaderNotifications v-if="isNotificationsLoading"/>

      <div v-else>
        <div class="menu-item d-flex align-items-center justify-content-between">
          <h3 class="d-flex align-items-center gap-2">Notifications</h3>

          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" role="switch" id="showUnreadSwitchButton">
            <label class="form-check-label" for="showUnreadSwitchButton">Show Unread</label>
          </div>
        </div>

        <div class="separator my-4"></div>

        <div class="fs-7 text-muted mb-2 d-flex align-items-center justify-content-between">
          <p class="text-uppercase">Latest</p>

          <p v-if="userNotifications.some((noti) => noti?.read_at === null) && !isReadAllLoading" @click="markAllAsRead" class="cursor-pointer hover-underline">Mark all as read</p>

          <TooltipMain v-if="isReadAllLoading" content="Loading" placement="left">
            <Icon name="svg-spinners:180-ring-with-bg" size="16"/>
          </TooltipMain>
        </div>

        <div class="notificationsWrraper">
          <Notify v-if="userNotifications?.length > 0" v-for="(notify, index) in userNotifications" :key="index" :notify="notify"/>

          <div v-else class="alert bg-light-primary d-flex flex-column align-items-center flex-sm-row p-5 mb-10 border">
            <i class="ki-duotone ki-notification-bing fs-2hx text-primary me-4 mb-5 mb-sm-0"><span
                class="path1"></span><span class="path2"></span><span class="path3"></span></i>

            <div class="d-flex flex-column">
              <h4 class="fw-semibold p-0 m-0">You don't have any notifications.</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.account-menu {
  top: 55px;
  right: 0;
}

.notificationsWrraper div:last-child {
  margin-bottom: 0 !important;
}

.notificationsWrraper {
  overflow-y: auto;
  max-height: 700px;
  overflow-x: hidden;
  height: 100%;
}

.notificationsMenu-enter-active,
.notificationsMenu-leave-active {
  transition: all 0.3s ease;
}

.notificationsMenu-enter-from,
.notificationsMenu-leave-to {
  opacity: 0;
  pointer-events: none;
  top: 70px;
}
</style>