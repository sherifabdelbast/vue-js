<script setup>
import {useAppStore} from "~/stores/useAppStore";
import {useToast} from "vue-toastification";
import {useProjectStore} from "~/stores/useProjectStore";

const props = defineProps(["isAccountMenu"]);

const toast = useToast();
const {logout, user} = useAuth();
const projectStore = useProjectStore();

// === stores === //
const appStore = useAppStore();

const {submit, inProgress} = useSubmit(() => logout(), {
      onSuccess: () => {
        toast.success("You have been logged out successfully.");
      },
    }
);

const getColor = (index) => {
  return projectStore.getColor(index)
};
</script>

<template>
  <Transition name="accountMenu">
    <div v-if="isAccountMenu"
         class="menu-gray-800 menu-state-bg bg-light rounded-2 menu-state-color fw-semibold py-4 fs-6 w-275px position-absolute account-menu shadow"
         style="z-index: 10000 !important;">
      <div class="menu-item px-3">
        <div class="menu-content d-flex align-items-center px-3">
          <div class="symbol symbol-50px me-5">
            <img v-if="user?.url_photo" alt="Logo" :src="user?.url_photo"/>
            <span v-else
                  class="symbol-label border border-2 text-primary fw-semibold text-uppercase user-select-none text-inverse-warning"
                  :style="{ backgroundColor: getColor(user?.id), borderColor:getColor(user?.id) }">{{
                user?.name[0]
              }}</span>
          </div>
          <div class="d-flex flex-column">
            <div v-if="user?.name" class="fw-bold fs-5 truncate" style="max-width: 180px !important;">{{ user?.name }}</div>
            <div v-else class="fw-bold d-flex align-items-center fs-5">User Name...</div>
            <span v-if="user?.email" class="fw-semibold text-muted text-hover-primary fs-7 truncate"
                  style="max-width: 180px">{{ user?.email }}</span>
            <span v-else class="fw-semibold text-muted text-hover-primary fs-7">email@example.com</span>
          </div>
        </div>
      </div>
      <div class="separator my-2"></div>
      <div class="menu-item px-5">
        <NuxtLink :to="`/profile/${user?.identify_number}`" class="menu-link rounded-1 px-5">My Profile</NuxtLink>
      </div>
      <div class="separator my-2"></div>
      <div class="menu-item px-5 pe-none" data-kt-menu-trigger="{default: 'click', lg: 'hover'}"
           data-kt-menu-placement="left-start" data-kt-menu-offset="-15px, 0">
        <a href="#" class="menu-link px-5 rounded-1">
          <span class="menu-title position-relative text-gray-400">Mode | soon...
            <span class="ms-5 position-absolute translate-middle-y top-50 end-0">
              <i class="ki-outline ki-night-day theme-light-show fs-2"></i>
              <i class="ki-outline ki-moon theme-dark-show fs-2"></i>
            </span>
          </span>
        </a>
        <div
            class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-title-gray-700 menu-icon-gray-500 menu-active-bg menu-state-color fw-semibold py-4 fs-base w-150px"
            data-kt-menu="true"
            data-kt-element="theme-mode-menu"
        >
          <div class="menu-item px-3 my-0">
            <a
                href="#"
                class="menu-link px-3 py-2"
                data-kt-element="mode"
                data-kt-value="light"
            >
              <span class="menu-icon" data-kt-element="icon">
                <i class="ki-outline ki-night-day fs-2"></i>
              </span>
              <span class="menu-title">Light</span>
            </a>
          </div>
          <div class="menu-item px-3 my-0">
            <a
                href="#"
                class="menu-link px-3 py-2"
                data-kt-element="mode"
                data-kt-value="dark"
            >
              <span class="menu-icon" data-kt-element="icon">
                <i class="ki-outline ki-moon fs-2"></i>
              </span>
              <span class="menu-title">Dark</span>
            </a>
          </div>
          <div class="menu-item px-3 my-0">
            <a
                href="#"
                class="menu-link px-3 py-2"
                data-kt-element="mode"
                data-kt-value="system"
            >
              <span class="menu-icon" data-kt-element="icon">
                <i class="ki-outline ki-screen fs-2"></i>
              </span>
              <span class="menu-title">System</span>
            </a>
          </div>
        </div>
      </div>
      <div class="menu-item px-5" @click.prevent="submit">
        <button
            class="btn btn-light btn-active-light-danger btn-flex btn-center btn-sm cursor-pointer w-100 justify-content-between"
            :disabled="inProgress">
          <span>Logout</span>
          <img v-if="inProgress" src="~/assets/media/misc/spinner.gif" style="filter: invert(1)" width="16">
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.account-menu {
  top: 65px;
  right: 0;
}

.menu-item a {
  transition: all 0.3s ease;
}

.menu-item a:hover {
  background-color: #f5f5f5 !important;
}

.accountMenu-enter-active,
.accountMenu-leave-active {
  transition: all 0.3s ease;
}

.accountMenu-enter-from,
.accountMenu-leave-to {
  opacity: 0;
  pointer-events: none;
  top: 75px;
}
</style>