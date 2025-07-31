<script setup>
import {useToast} from "vue-toastification";
import {usePostData} from "~/composables/usePostData";
import {helpers, maxLength, minLength, required} from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import {useGetData} from "~/composables/useGetData";
import {useProjectStore} from "~/stores/useProjectStore";

const route = useRoute();

const {createRole} = usePostData();
const {fetchAllProjectPermissions} = useGetData();
const toast = useToast();

const projectStore = useProjectStore();

const emits = defineEmits(["closeCreate"]);

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
    let input = document.querySelector("#createRolePermissions");

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

const createFormData = reactive({
  name: "",
  permissions: []
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

const v$ = useVuelidate(rules, createFormData);

// === methods === //
const handleSubmit = async () => {
  validationErrors.name = null;
  const result = await v$.value.$validate();

  createFormData.name = (createFormData.name).trim();

  createFormData.permissions = tagify.value.map(per => per.value);

  if (result) {
    await submit();
    return;
  }

  validationErrors.name = v$.value?.name?.$errors[0]?.$message;
}

const {submit, inProgress, validationErrors: errors,} = useSubmit(() => createRole(route.params.id, createFormData), {
  onSuccess: async (response) => {
    if (response?.code == 201) {
      toast.success(response.message);
      await projectStore.refreshAllRoles(route.params.id);
      emits("closeCreate");
    }
  }
});
</script>

<template>
  <SkeletonLoaderCreateRole v-if="perLoading"/>

  <div v-else class="card">
    <div class="card-header">
      <div class="card-title fs-3 fw-bold">Create new role
        <span class="bg-light-danger fs-6 fw-semibold ms-3 py-1 px-3 rounded-1">Be cautious when setting role permissions.</span>
      </div>
    </div>
    <div class="card-body px-9 py-5">
      <form @submit.prevent="handleSubmit" class="form" id="createRoleForm">
        <FormInput type="text" autocomplete="off" labelText="Role Name" name="name"
                   placeholder="Role Name"
                   v-model:input="createFormData.name" :formDataError="validationErrors?.name || errors?.name"
                   class="mb-10"
        />

        <label class="fw-semibold mb-2">Role permissions</label>
        <input class="form-control form-control-solid" value="" name="permissions" id="createRolePermissions"/>

        <div class="mt-10">
          <button :disabled="inProgress" type="submit" id="kt_sign_in_submit"
                  class="btn btn-primary btn-hover btn-sm me-4">
            <img v-if="inProgress" src="~/assets/media/misc/spinner.gif" width="16">
            <span v-else class="indicator-label">Create</span>
          </button>
          <button :disabled="inProgress" type="button" @click="emits('closeCreate')"
                  class="btn btn-light-danger btn-hover btn-sm">
            <span class="indicator-label">Cansel</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>