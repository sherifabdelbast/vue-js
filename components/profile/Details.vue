<script setup>
import {useAppStore} from "~/stores/useAppStore";
import {storeToRefs} from "pinia";

const emits = defineEmits(["statusChanged"]);

const {user} = useAuth();

const appStore = useAppStore();
const {profile} = storeToRefs(appStore);

onMounted(() => {
  let input = document.getElementById('showSkills'),
      tagify = new Tagify(input);
});
</script>

<template>
  <div class="card mb-5 mb-xl-10" id="kt_profile_details_view">
    <div class="card-header">
      <div class="card-title m-0">
        <h3 class="fw-bold m-0">Profile Details</h3>
      </div>
      <button v-if="user.id == profile?.user?.id" @click="emits('statusChanged')" class="btn btn-sm btn-primary align-self-center">Edit Profile</button>
    </div>
    <div class="card-body p-9">
      <div class="row mb-7">
        <label class="col-lg-4 fw-semibold text-muted">Full Name</label>
        <div class="col-lg-8">
          <span class="fw-bold fs-6 text-gray-800">{{profile?.user?.name}}</span>
        </div>
      </div>
      <div class="row mb-7">
        <label class="col-lg-4 fw-semibold text-muted">Email</label>
        <div class="col-lg-8">
          <span class="fw-bold fs-6 text-gray-800">{{profile?.user?.email}}</span>
        </div>
      </div>
      <div class="row mb-7">
        <label class="col-lg-4 fw-semibold text-muted">Job Title</label>
        <div class="col-lg-8 fv-row">
          <span v-if="profile?.user?.job_title" class="fw-semibold text-gray-800 fs-6">{{profile?.user?.job_title}}</span>
          <span v-else class="fw-semibold text-gray-800 fs-6">---</span>
        </div>
      </div>
      <div class="row mb-7">
        <label class="col-lg-4 fw-semibold text-muted">Phone</label>
        <div class="col-lg-8 d-flex align-items-center">
          <span v-if="profile?.user?.phone" class="fw-bold fs-6 text-gray-800 me-2">{{profile?.user?.phone}}</span>
          <span v-else class="fw-semibold text-gray-800 fs-6">---</span>
        </div>
      </div>
      <div class="row">
        <label class="col-lg-4 fw-semibold text-muted">Location</label>
        <div class="col-lg-8">
          <span v-if="profile?.user?.location" class="fw-semibold fs-6 text-gray-800">{{profile?.user?.location}}</span>
          <span v-else class="fw-semibold text-gray-800 fs-6">---</span>
        </div>
      </div>
      <div class="row mt-15">
        <label class="col-lg-4 fw-semibold text-muted">Skills</label>
        <div class="col-lg-8">
          <span v-if="profile?.user?.skills" class="fw-semibold fs-6 text-gray-800"><input class="form-control form-control-solid" :value="profile?.user?.skills" readonly id="showSkills"/></span>
          <span v-else class="fw-semibold fs-6 text-gray-800">---</span>
        </div>
      </div>
    </div>
  </div>
</template>