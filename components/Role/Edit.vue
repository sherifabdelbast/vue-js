<script setup>
import {useToast} from "vue-toastification";
import {usePostData} from "~/composables/usePostData";
import {helpers, maxLength, minLength, required} from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import {useGetData} from "~/composables/useGetData";
import {useProjectStore} from "~/stores/useProjectStore";
import {storeToRefs} from "pinia";

const route = useRoute();

const {editRole} = usePostData();
const {fetchAllProjectPermissions} = useGetData();
const toast = useToast();

const projectStore = useProjectStore();
const {editRoleInfo, oldEditRoleInfo} = storeToRefs(projectStore);

const emits = defineEmits(["closeEdit"]);

const perLoading = ref(false);

let tagify = null;

const permissions = ref(["sss"]);

onMounted(async () => {
  perLoading.value = true;
  const perRes = await fetchAllProjectPermissions(route.params.id);
  permissions.value = perRes.permissions;
  perLoading.value = false;

  // The DOM elements you wish to replace with Tagify
  setTimeout(() => {
    let input = document.querySelector("#editRolePermissions");

    // Initialize Tagify script on the above inputs
    tagify = new Tagify(input, {
      whitelist: permissions.value,
      dropdown: {
        maxItems: 1000,           // <- mixumum allowed rendered suggestions
        classname: "tagify__inline__suggestions", // <- custom classname for this dropdown, so it could be targeted
        enabled: 0,             // <- show suggestions on focus
        closeOnSelect: false    // <- do not hide the suggestions dropdown once an item has been selected
      }
    });
  }, 0);
});

const validationErrors = reactive({
  name: null,
});

// custom validation rules
const noNumbersAndSpecialChars = (value) => !/[\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/gi.test(value);

// form validation rules
const rules = {
  name: {
    required: helpers.withMessage('Role name is required', required),
    minLength: helpers.withMessage('Role name must be more than 3 characters', minLength(3)),
    noSpecialChars: helpers.withMessage("Role name can't contains numbers or special characters", noNumbersAndSpecialChars),
    maxLength: helpers.withMessage("Role name can't be more than 20 characters", maxLength(20)),
  }
}

const v$ = useVuelidate(rules, editRoleInfo.value);

// === methods === //
const handleSubmit = async () => {
  validationErrors.name = null;
  const result = await v$.value.$validate();

  editRoleInfo.value.name = (editRoleInfo.value.name).trim();

  editRoleInfo.value.permissions = tagify.value.map(per => per.value);

  const nameChanged = ref(false);
  const permissionsChanged = ref(false);

  if (editRoleInfo.value.name !== oldEditRoleInfo.value.name || !checkChangeInPermissions(editRoleInfo.value.permissions, oldEditRoleInfo.value.permissions)) {

    if (editRoleInfo.value.name !== oldEditRoleInfo.value.name) {
      nameChanged.value = true;
    }

    if (!checkChangeInPermissions(editRoleInfo.value.permissions, oldEditRoleInfo.value.permissions)) {
      permissionsChanged.value = true;
    }

    if (result) {
      if (nameChanged.value && !permissionsChanged.value) {
        submitEdit.value = {
          name: editRoleInfo.value.name,
        }
      } else if (!nameChanged.value && permissionsChanged.value) {
        submitEdit.value = {
          permissions: editRoleInfo.value.permissions,
        }
      } else {
        submitEdit.value = {
          name: editRoleInfo.value.name,
          permissions: editRoleInfo.value.permissions,
        }
      }

      await submit();
      return;
    }
  } else {
    emits("closeEdit");
  }

  validationErrors.name = v$.value?.name?.$errors[0]?.$message;
}

const submitEdit = ref(null);

const {submit, inProgress, validationErrors: errors,} = useSubmit(() => editRole(route.params.id, editRoleInfo.value.id, submitEdit.value), {
  onSuccess: async (response) => {
    if (response?.code == 200) {
      toast.success(response.message);
      await projectStore.refreshAllRoles(route.params.id);
      emits("closeEdit");
    }
  }
});

function checkChangeInPermissions(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false;
  }
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  return true;
}
</script>

<template>
  <SkeletonLoaderCreateRole v-if="perLoading"/>

  <div v-else class="card">
    <div class="card-header">
      <div class="card-title fs-3 fw-bold">Edit role
        <span class="bg-light-danger fs-6 fw-semibold ms-3 py-1 px-3 rounded-1">Be cautious when setting role permissions.</span>
      </div>
    </div>
    <div class="card-body px-9 py-5">
      <form @submit.prevent="handleSubmit" class="form" id="createRoleForm">
        <FormInput type="text" autocomplete="off" labelText="Role Name" name="name"
                   placeholder="Role Name"
                   v-model:input="editRoleInfo.name" :formDataError="validationErrors?.name || errors?.name"
                   class="mb-10"
        />

        <label class="fw-semibold mb-2">Role permissions</label>
        <input class="form-control form-control-solid" :value="editRoleInfo.permissions" name="permissions" id="editRolePermissions"/>

        <div class="mt-10">
          <button :disabled="inProgress" type="submit" id="kt_sign_in_submit"
                  class="btn btn-primary btn-hover btn-sm me-4">
            <img v-if="inProgress" src="~/assets/media/misc/spinner.gif" width="16">
            <span v-else class="indicator-label">Save</span>
          </button>
          <button :disabled="inProgress" type="button" @click="emits('closeEdit')"
                  class="btn btn-light-danger btn-hover btn-sm">
            <span class="indicator-label">Cansel</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>