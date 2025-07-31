<script setup>
import {useAppStore} from "~/stores/useAppStore";
import {useProjectStore} from "~/stores/useProjectStore";
import {usePostData} from "~/composables/usePostData";
import {useToast} from "vue-toastification";
import {storeToRefs} from "pinia";
import {email, helpers, maxLength, required} from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";

// === Data === //
const route = useRoute();
const toast = useToast();
const appStore = useAppStore();
const user = useUser();
const {invite} = usePostData();
const projectStore = useProjectStore();
const {teamMembersPage, project, rolesOptions, roleLoading, selectedRole} = storeToRefs(projectStore);

const isAccountMenu = ref(false);
const isProjectMenu = ref(false);

// === Validation === //
const formData = reactive({
  user_id: user?.value?.id,
  email: "",
  message: "",
  role_id: '',
  project_id: route?.params?.id,
});
const validationErrors = reactive({
  email: null,
  message: null,
})
const rules = {
  email: {
    required: helpers.withMessage('Please make sure to provide an email address.', required),
    email: helpers.withMessage('The provided email is not valid. Please enter a valid email address.', email)
  },
  message: {
    required: helpers.withMessage('Please make sure to provide a message.', required),
    message: helpers.withMessage('Message too long. Keep it within 255 characters.', maxLength(255))
  }
}
const v$ = useVuelidate(rules, formData);

const handleSubmit = async () => {
  validationErrors.email = null;
  validationErrors.message = null;
  const result = await v$.value.$validate();

  if (result) {
    formData.role_id = selectedRole.value.id;

    submit();
    return;
  }

  validationErrors.email = v$.value?.email?.$errors[0]?.$message;
  validationErrors.message = v$.value?.message?.$errors[0]?.$message;
};

const {submit, inProgress, validationErrors: errors} = useSubmit(() => invite(formData, route?.params?.id), {
      onSuccess: async (response) => {
        if (response.code === 200) {
          document.getElementById("closeModal").click();
          toast.success("Success! Invitation sent." || response.message, {});
          if (route.name === "projects-id-project-history") {
            await projectStore.refreshProjectHistory(route.params.id);
          } else if (route.name === "projects-id-team") {
            await projectStore.refreshTeamMembersPage(route.params.id);
          }
          formData.email = "";
          formData.message = "";
        }
      },
      onError: (error) => {
        if (error.data.code === 400) {
          toast.info("Member already exist. No need to duplicate." || error.data.message, {});
        }
      },
    }
);
</script>

<template>
  <div class="modal fade" id="kt_modal_invite_friends" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog mw-650px">
      <div class="modal-content">
        <div class="modal-header pb-0 border-0 justify-content-end">
          <div class="btn btn-sm btn-icon btn-active-color-primary" data-bs-dismiss="modal" id="closeModal">
            <i class="ki-outline ki-cross fs-1"></i>
          </div>
        </div>

        <SkeletonLoaderRoleOptions v-if="roleLoading"/>

        <div v-else class="modal-body scroll-y mx-5 mx-xl-18 pt-0 pb-15">
          <div class="text-center mb-13">
            <h1 class="mb-3">Invite new Member</h1>
            <div class="text-muted fw-semibold fs-5">
              You can invite a new team member by
              <span class="fw-bold text-primary"> email address</span>.
            </div>
          </div>
          <form @submit.prevent="handleSubmit" class="mb-10">
            <FormInput type="text" autocomplete="off" labelText="User Email" name="user_email"
                       placeholder="User Email" class="mb-7"
                       v-model:input="formData.email" :formDataError="validationErrors.email || errors?.email"/>

            <FormTextArea name="invitation_message" placeholder="Invitation Message"
                          labelText="Invitation Message"
                          class="mb-7"
                          v-model:input="formData.message"
                          :formDataError="validationErrors.message || errors?.message"/>

            <div class="mb-3 w-100">
              <Dropdown v-model="selectedRole" :options="rolesOptions" :placeholder="selectedRole" optionLabel="name"
                        placeholder="Select a Role" class="w-100"/>
            </div>

            <button class="btn btn-primary w-100 mt-5" :disabled="inProgress">
              <img v-if="inProgress" src="~/assets/media/misc/spinner.gif" width="16">
              <span v-else class="indicator-label mr-3">Invite</span>
            </button>
          </form>
          <div class="separator d-flex flex-center mb-8">
            <span class="text-uppercase bg-body fs-7 fw-semibold text-muted px-3"><Icon name="bi:envelope-plus"
                                                                                        size="18"/></span>
          </div>
          <div class="mb-10">
            <div class="fs-6 fw-semibold mb-2">Team Members</div>
            <div class="mh-300px scroll-y me-n7 pe-7">
              <TeamMemberInviteModalList v-for="(member, index) in teamMembersPage?.data?.team_members" :key="index"
                                         :member="member"
                                         :index="index"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
