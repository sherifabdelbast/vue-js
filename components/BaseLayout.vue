<template>
  <div class="page-background d-flex flex-column flex-root" id="kt_app_root">
    <div class="d-flex flex-column flex-center flex-column-fluid">
      <div class="d-flex flex-column flex-center text-center p-10">
        <div class="card card-flush w-lg-650px">
          <div class="card-body py-15 py-lg-10">

            <div class="mb-5">
              <NuxtLink to="/products">
                <img alt="Logo" src="/assets/media/logos/logo-dark.png" class="h-60px">
              </NuxtLink>
            </div>

            <h1 class="fw-bolder text-gray-900 mb-5">
              {{ message }}
            </h1>
            <div class="fw-semibold fs-6 text-gray-500 mb-8">
              This is your opportunity to get creative amazing opportunaties
              <br>
              that gives readers an idea
            </div>
            <NuxtLink to="/projects" class="btn btn-sm btn-primary">Go to Home Page</NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps(["message"]);
</script>

<style scoped>
body {
  background-image: url("../assets/media/auth/bg3.jpg");
}
</style>