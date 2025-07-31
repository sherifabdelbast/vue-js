<script setup lang="ts">

</script>

<template>
  <!--begin::Stepper-->
  <div class="stepper stepper-pills bg-white rounded mb-10 py-2" id="kt_stepper_example_basic">
    <div class="stepper-nav flex-center flex-wrap">
      <div class="stepper-item mx-8 my-4 current" data-kt-stepper-element="nav">
        <div class="stepper-wrapper d-flex align-items-center">
          <div class="stepper-icon w-40px h-40px">
            <i class="stepper-check fas fa-check"></i>
            <span class="stepper-number">1</span>
          </div>

          <div class="stepper-label">
            <h3 class="stepper-title">
              Step 1
            </h3>

            <div class="stepper-desc fw-bold">
              Join
            </div>
          </div>
        </div>

        <div class="stepper-line h-40px"></div>
      </div>

      <div class="stepper-item mx-8 my-4" data-kt-stepper-element="nav">
        <div class="stepper-wrapper d-flex align-items-center">
          <div class="stepper-icon w-40px h-40px">
            <i class="stepper-check fas fa-check"></i>
            <span class="stepper-number">2</span>
          </div>

          <div class="stepper-label">
            <h3 class="stepper-title">
              Step 2
            </h3>

            <div class="stepper-desc fw-bold">
              Complete Register
            </div>
          </div>
        </div>

        <div class="stepper-line h-40px"></div>
      </div>

      <div class="stepper-item mx-8 my-4" data-kt-stepper-element="nav">
        <div class="stepper-wrapper d-flex align-items-center">
          <div class="stepper-icon w-40px h-40px">
            <i class="stepper-check fas fa-check"></i>
            <span class="stepper-number">3</span>
          </div>

          <div class="stepper-label">
            <h3 class="stepper-title">
              Step 3
            </h3>

            <div class="stepper-desc fw-bold">
              Create Project
            </div>
          </div>
        </div>

        <div class="stepper-line h-40px"></div>
      </div>
    </div>
  </div>
  <!--end::Stepper-->
</template>

<style scoped>

</style>