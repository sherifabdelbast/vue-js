<script setup>
// props
const props = defineProps(["message", "errType", "statusCode"]);

// === computed === //
const errorImage = computed(() => {
  if (props.statusCode === 404) {
    return "/404-error.png";
  } else if (props.statusCode === 500) {
    return "/500-error.png";
  } else if (props.statusCode === 403) {
    return "/403-error.svg";
  }
  return "/404-error.png";
});

const isMobileError = computed(() =>
    props.errType == "mobile" ? true : false
);

// === methods === //
const handleClearError = () => clearError({redirect: "/projects"});
</script>

<template>
  <!--begin::Root-->
  <div class="d-flex flex-column flex-root" id="kt_app_root">
    <!--begin::Page bg image-->
    <!--end::Page bg image-->
    <!--begin::Authentication - Signup Welcome Message -->
    <div class="d-flex flex-column flex-center flex-column-fluid">
      <!--begin::Content-->
      <div class="d-flex flex-column flex-center text-center p-10">
        <!--begin::Wrapper-->
        <div class="card card-flush w-lg-650px py-5">
          <div class="card-body py-15 py-lg-20">
            <!--begin::Title-->
            <h1 class="fw-bolder fs-2hx text-gray-900 mb-4">Oops!</h1>
            <!--end::Title-->
            <!--begin::Text-->
            <p
                v-if="isMobileError"
                class="fw-bold text-gray-500 fs-1 text-capitalize text-center"
            >
              <span class="text-primary gradient-text">Taskat Softwatre</span>
              Does Not Allowed for mobile devices
            </p>
            <div v-else class="fw-semibold fs-6 text-gray-500 mb-7">
              {{ message }}
            </div>
            <!--end::Text-->
            <!--begin::Illustration-->
            <div class="mb-3">
              <img
                  v-if="isMobileError"
                  src="~/assets/media/auth/mobile-error.png"
                  alt=""
                  class="mw-100 mh-300px theme-light-show"
              />
              <img
                  v-else
                  :src="errorImage"
                  class="mw-100 mh-300px theme-light-show"
                  alt=""
              />
            </div>
            <!--end::Illustration-->
            <!--begin::Link-->
            <div class="mb-0 mt-8" v-if="!isMobileError">
              <button class="btn btn-sm btn-primary" @click="handleClearError">
                Return To Projects
              </button>
            </div>
            <!--end::Link-->
          </div>
        </div>
        <!--end::Wrapper-->
      </div>
      <!--end::Content-->
    </div>
  </div>
  <!--end::Root-->
</template>