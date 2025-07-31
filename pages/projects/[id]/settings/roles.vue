<script setup>
import {useProjectStore} from "~/stores/useProjectStore";
import {storeToRefs} from "pinia";
import {useAppStore} from "~/stores/useAppStore";

definePageMeta({
  middleware: [
    "auth",
    "project-permissions"
  ],
  layout: "project-settings"
});

const route = useRoute();

const appStore = useAppStore();
const projectStore = useProjectStore();
const {roles} = storeToRefs(projectStore);

onMounted(async () => {
  appStore.isRolesLoading = true;
  await projectStore.refreshAllRoles(route.params.id);
  appStore.isRolesLoading = false;
});

const isCreatingRole = ref(false);
const isEditingRole = ref(false);

const openCreateRole = () => isCreatingRole.value = true;
const closeCreateRole = () => isCreatingRole.value = false;

const openEditRole = () => isEditingRole.value = true;
const closeEditRole = () => isEditingRole.value = false;
</script>

<template>
  <SkeletonLoaderProjectRoles v-if="appStore.isRolesLoading"/>

  <div v-else class="app-container container-xxl">
    <div class="app-main flex-column flex-row-fluid" id="kt_app_main">
      <div class="d-flex flex-column flex-column-fluid">
        <div id="kt_app_content" class="app-content flex-column-fluid">
          <RoleCreate v-if="isCreatingRole" @closeCreate="closeCreateRole" v-can="'create role'"/>

          <RoleEdit v-else-if="isEditingRole" @closeEdit="closeEditRole" v-can="'edit role'"/>

          <div v-else class="card">
            <div class="card-header">
              <div class="card-title fs-3 fw-bold">Roles & Permissions</div>
              <div class="cursor-pointer d-flex align-items-center" v-can="'create role'">
                <div @click="openCreateRole" class="create-role-btn d-flex align-items-center bg-gray-200 py-2 px-4 rounded-1 text-gray-700 fw-semibold">
                  <i class="ki-outline ki-plus fs-3 text-gray-700 p-0 me-1"></i> <span>Create new role</span>
                </div>
              </div>
            </div>
            <div class="card-body px-9 py-5">
              <table class="table align-middle table-row-dashed table-striped fs-6 gy-5" id="kt_customers_table">
                <thead>
                <tr class="text-start text-gray-400 fw-bold fs-7 text-uppercase gs-0">
                  <th class="text-start">Actions</th>
                  <th class="min-w-125px">Role Name</th>
                  <th>Members</th>
                  <th class="min-w-300px">Permissions</th>
                </tr>
                </thead>
                <tbody class="fw-semibold text-gray-600">
                  <RoleRow v-for="(role, index) in roles?.roles" :key="index" :role="role" :index="index" @openEdit="openEditRole"/>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <ModalsDeleteRole v-can="'delete role'"/>
</template>

<style scoped>
.create-role-btn {
  transition: all 0.3s ease;
}

.create-role-btn:hover {
  background-color: var(--bs-gray-300)
}
</style>