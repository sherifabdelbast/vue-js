<script setup>
import {useProjectStore} from "~/stores/useProjectStore";
import {storeToRefs} from "pinia";

const emits = defineEmits(["openEdit"]);

const props = defineProps(["role", "index"]);

const projectStore = useProjectStore();
const {deleteRoleInfo, selectedChangeRole, roles, editRoleInfo, oldEditRoleInfo, memberPermissions} = storeToRefs(projectStore);

onMounted(() => new Tagify(document.getElementById(`showPermissions${props.index}`)));

const editRoleItem = {
  label: 'Edit Role',
  icon: 'pi pi-fw pi-pencil',
  command: () => {
    editRoleInfo.value.id = props.role?.id;

    if (props.role?.key) {
      editRoleInfo.value.name = props.role?.key;
      oldEditRoleInfo.value.name = props.role?.key;
    } else {
      editRoleInfo.value.name = props.role?.name;
      oldEditRoleInfo.value.name = props.role?.name;
    }

    editRoleInfo.value.permissions = props.role?.permissions;

    oldEditRoleInfo.value.permissions = props.role?.permissions;

    emits('openEdit');
  },
}
const deleteRoleItem = {
  label: 'Delete Role',
  icon: 'pi pi-fw pi-trash',
  command: () => {
    deleteRoleInfo.value.changeRoleOptions = [];
    deleteRoleInfo.value.id = props.role?.id;
    deleteRoleInfo.value.name = props.role?.key;

    deleteRoleInfo.value.members = props.role?.members;
    deleteRoleInfo.value.isConfirmed = false;
    deleteRoleInfo.value.confirmText = "";

    roles.value?.roles?.forEach((role) => {
      if (role?.id !== props.role?.id && role?.key !== "owner") {
        deleteRoleInfo.value.changeRoleOptions.push({name: role?.key, id: role?.id});
      }
    });

    selectedChangeRole.value = deleteRoleInfo.value.changeRoleOptions[0];

    new bootstrap.Modal("#kt_modal_delete_role").show();
  },
}

const menu = ref();
const items = ref([]);

if (memberPermissions.value.includes('edit role')) {
  items.value.push(editRoleItem);
}

if (memberPermissions.value.includes('delete role')) {
  items.value.push(deleteRoleItem);
}

const toggle = (event) => menu.value.toggle(event);
</script>

<template>
  <tr>
    <td>
        <div v-if="role.key === 'owner'" class="w-100 h-100 d-flex justify-content-center">
          <TooltipMain content="Project owner" placement="top">
            <div class="p-2 bg-light-primary rounded-1 text-primary" style="width: fit-content">
              <i class="ki-duotone ki-crown-2 fs-2">
                <i class="path1"></i>
                <i class="path2"></i>
                <i class="path3"></i>
              </i>
            </div>
          </TooltipMain>
        </div>

      <div v-else class="w-100 h-100 d-flex justify-content-center" v-can="['edit role', 'delete role']">
        <div aria-haspopup="true" aria-controls="overlay_menu" @click="toggle"
             class="p-2 bg-gray-200 rounded-1 text-gray-600 text-hover-gray-800 cursor-pointer"
             style="width: fit-content">
          <Icon name="mdi:dots-horizontal" size="20"/>
          <Menu ref="menu" id="overlay_menu" :model="items" :popup="true"
                :pt="{
                root: { style: 'width: 150px' },
              }"
          />
        </div>
      </div>
    </td>
    <td>
      <span v-if="!role?.key" class="text-gray-700 mb-1">{{role?.name}}</span>
      <span v-else class="text-gray-700 mb-1">{{role?.key}}</span>
    </td>
    <td>
      <span class="text-gray-600 mb-1">{{role?.countOfMembers}}</span>
    </td>
    <td data-filter="mastercard">
      <input v-if="role?.permissions" class="form-control form-control-solid" :value="role?.permissions" readonly :id="`showPermissions${index}`"/>
      <span v-else class="badge badge-light-danger badge-lg">No permissions</span>
    </td>
  </tr>
</template>