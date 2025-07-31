<script setup>
import {useRoute} from "#app";
import {useToast} from "vue-toastification";
import {usePostData} from "~/composables/usePostData";
import {useProjectStore} from "~/stores/useProjectStore";
import {useAuth} from "~/composables/useAuth";
import moment from "moment/moment";
import {storeToRefs} from "pinia";

const toast = useToast();
const {user} = useAuth();
const props = defineProps(["member", "index", "ownerId"]);
const projectStore = useProjectStore();
const {
  memberPermissions,
  selectedChangeMemberRole,
  changeMemberRoleInfo,
  roles,
  changeMemberRoleLoading
} = storeToRefs(projectStore);
const {deleteMember} = usePostData();
const route = useRoute();

const {submit, inProgress} = useSubmit(() => {
      return deleteMember(route?.params?.id, props?.member?.id);
    },
    {
      onSuccess: async (response) => {
        if (response.code === 200) {
          Swal.fire(
              'Removed!',
              `<strong>${props.member?.user?.name || props.member?.user?.email}</strong> member has been removed.`,
              'success'
          );
        }
      },
      onError: (error) => {
        if (error.data.code === 400) {
          toast.error("Something went wrong!", {});
        } else if (error.statusCode === 403) {
          toast.error("You can't remove this member. Permissions needed.", {});
        }
      }
    })
const handleDeleteMember = () => {
  Swal.fire({
    html: `Are you sure you want to remove <strong>${props.member?.user?.name || props.member?.user?.email}</strong>,
             from your team members?`,
    icon: "warning",
    buttonsStyling: false,
    showCancelButton: true,
    confirmButtonText: "Yes, remove!",
    cancelButtonText: 'No, cancel',
    showLoaderOnConfirm: true,
    customClass: {
      confirmButton: "btn fw-bold btn-danger",
      cancelButton: 'btn fw-bold btn-active-light-primary',
    },
    preConfirm: async () => {
      await submit();
    },
  });
};

const menu = ref();
const items = ref([]);

const editTeamItem = {
  label: 'Change Role',
  command: async () => {
    changeMemberRoleLoading.value = true;
    new bootstrap.Modal("#kt_modal_change_member_role").show();

    await projectStore.refreshAllRoles(route.params.id)

    changeMemberRoleInfo.value.rolesOptions = [];
    changeMemberRoleInfo.value.id = props.member?.id;
    changeMemberRoleInfo.value.name = props.member?.user?.name;

    roles.value?.roles?.forEach((role) => {
      if (role?.id !== props.member?.role_id && role?.key !== "owner") {
        changeMemberRoleInfo.value.rolesOptions.push({name: role?.key, id: role?.id});
      }
    });

    selectedChangeMemberRole.value = changeMemberRoleInfo.value.rolesOptions[0];
    changeMemberRoleLoading.value = false;
  },
}
const removeTeamItem = {
  label: 'Remove',
  command: () => handleDeleteMember(),
}

if (memberPermissions.value.includes('edit team')) {
  items.value.push(editTeamItem);
}

if (memberPermissions.value.includes('remove team')) {
  items.value.push(removeTeamItem);
}

const toggle = (event) => menu.value.toggle(event);
</script>

<template>
  <tr class="text-start cursor-pointer px-2 max-w-200px member-row">
    <td class="d-flex align-items-center gap-3 px-2 member-info">
      <Avatar :user="member?.user" :imgWidth="35"/>
      <NuxtLink :to="`/profile/${member?.user?.identify_number}`" class="text-muted" v-if="member?.user?.name">
        <div class="d-flex align-items-center gap-1" style="width: 200px">
          <div class="truncate" style="max-width: 120px">{{ member?.user?.name || "---" }}</div>
          <Icon name="ph:share-fat" size="15" class="redirect-icon"/>
        </div>
      </NuxtLink>
      <div v-else class="truncate" style="max-width: 120px">{{ member?.user?.name || "---" }}</div>
    </td>
    <td class="truncate" style="max-width: 100px">{{ member?.user?.email }}</td>
    <td><p class="badge badge-lg badge-light-dark">{{ member?.role?.key }}</p></td>
    <td>
      <div class="badge fw-bold text-uppercase"
           :class="{
          'badge-light-warning': member?.invite_status === 'wait',
          'badge-light-primary': member?.invite_status === 'accept',
          'badge-light-danger': member?.invite_status === 'reject',
        }"
      >
        {{ member?.invite_status }}
      </div>
    </td>
    <td class="text-end px-2">
      <div v-if="member?.user_id === ownerId" class="custom-button custom-color-owner cursor-default py-2 px-3">
        <div class="d-flex align-items-center gap-1">
          <i class="ki-duotone ki-crown-2">
            <i class="path1"></i>
            <i class="path2"></i>
            <i class="path3"></i>
          </i>
          <span>Project Owner</span>
        </div>
      </div>

      <div v-else style="width: fit-content;" class="d-inline-block">
        <div @click="toggle" aria-haspopup="true" aria-controls="overlay_menu"
             v-can="['edit team', 'remove team']"
             class="p-2 bg-light rounded-1 text-gray-600 text-hover-gray-800 cursor-pointer">
          <Icon name="mdi:dots-horizontal" size="20"/>
          <Menu ref="menu" id="overlay_menu" :model="items" :popup="true"
                :pt="{
                    root: { style: 'width: 110px' },
                }"
          />
        </div>

        <div class="custom-button custom-color-info cursor-default" v-can-not-all="['remove team', 'edit team']">
          <div class="d-flex align-items-center gap-1">
            <i class="ki-duotone ki-user">
              <i class="path1"></i>
              <i class="path2"></i>
            </i>
            <span>Member</span>
          </div>
        </div>
      </div>
    </td>
  </tr>
</template>

<style>
.custom-button {
  display: inline-block;
  border-radius: 7px;
  line-height: 15px;
  font-size: 12px;
  font-weight: 500;
}

.custom-color-owner {
  background-color: #eefbec;
  color: #50cd89;
}

.custom-color-owner > div > i {
  color: #50cd89;
}

.custom-color-info {
  background-color: var(--bs-info-light);
  color: var(--bs-info);
}

.custom-color-info > div > i {
  color: var(--bs-info);
}

.redirect-icon {
  display: none !important;
}

.member-info {
  border-bottom: 0 !important;
}

.member-info:hover .redirect-icon {
  display: inline-block !important;
}

.member-info a:hover {
  color: var(--bs-text-primary) !important;
}
</style>