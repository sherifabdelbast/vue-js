<script setup>
import {useProjectStore} from "~/stores/useProjectStore";
import {storeToRefs} from "pinia";
import {useAuth} from "~/composables/useAuth";

definePageMeta({
  middleware: [
    "auth",
    "project-permissions"
  ],
});

const route = useRoute();

const {user} = useAuth();

// === Data === //
const projectStore = useProjectStore();
const {teamMembersPage, project} = storeToRefs(projectStore);

await projectStore.refreshTeamMembersPage(route.params.id);

const openInviteModal = async () => {
  await projectStore.refreshRolesOptions(route.params.id);
}
</script>

<template>
  <div class="app-container container-xxl">
    <div class="app-main flex-column flex-row-fluid">
      <div class="d-flex flex-column flex-column-fluid">
        <div class="app-content flex-column-fluid">
          <div class="card">
            <div class="card-header border-0 py-2 border-bottom border-1">
              <div class="card-title">
                <div class="d-flex align-items-center position-relative">
                  <h1>Team Members</h1>
                </div>
              </div>
              <div class="card-toolbar">
                <div class="d-flex justify-content-end" data-kt-user-table-toolbar="base">
                  <button v-can="'invite team'" @click="openInviteModal" type="button"
                          class="d-flex align-items-center justify-content-center gap-2 btn btn-primary btn-sm"
                          data-bs-toggle="modal" data-bs-target="#kt_modal_invite_friends">
                    <Icon name="mdi:account-multiple-plus-outline" size="20"/>
                    <span>Invite Member</span>
                  </button>
                </div>
              </div>
            </div>
            <div class="card-body py-2 custom-table-style">
              <table class="table align-middle table-row-bordered fs-6 gy-5">
                <thead>
                <tr class="text-start fw-bold fs-7 text-uppercase gs-0">
                  <th class="min-w-150px">Name</th>
                  <th class="min-w-200px">Email</th>
                  <th class="min-w-125px">Role</th>
                  <th class="min-w-40px">Status</th>
                  <th class="min-w-40px text-end px-6">Actions</th>
                </tr>
                </thead>
                <tbody class="text-gray-600 fw-semibold">
                <TeamMemberList v-for="(member, index) in teamMembersPage?.data?.team_members" :key="index" :member="member"
                                :ownerId="project?.user_id" :index="index"/>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <ModalsChangeMemberRole v-can="'edit team'"/>
</template>