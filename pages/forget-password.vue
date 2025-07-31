<script setup>
definePageMeta({
  layout: "none",
  middleware: "guest"
});
useHead({
  title: "Forget Password",
});
</script>

<template>
  <div class="vh-100 d-flex flex-column flex-root" id="kt_app_root">
    <div class="d-flex flex-column flex-lg-row flex-column-fluid">
      <ForgetPasswordStepOne/>
      <div
          class="d-flex flex-lg-row-fluid w-lg-50 bgi-size-cover bgi-position-center order-1 order-lg-2 h-1"
          style="background-image: url(/auth-bg.png);"
      >
        <div
            class="d-flex flex-column flex-center py-7 py-lg-15 px-5 px-md-15 w-100"
        >
          <NuxtLink to="/" class="mb-0 mb-lg-12">
            <img
                alt="Logo"
                src="~/assets/media/logos/logo-light.png"
                class="h-60px h-lg-75px"
            />
          </NuxtLink>

          <img
              class="d-none d-lg-block mx-auto w-275px w-md-50 w-xl-500px mb-10 mb-lg-20"
              src="../assets/media/illustrations/misc/forget-password.svg"
              alt="join photo"
          />
          <h1
              class="d-none d-lg-block text-white fs-2qx fw-bolder text-center mb-7"
          >
            Fast, Efficient and Productive
          </h1>
          <div class="d-none d-lg-block text-white fs-base text-center w-75">
            Welcome back to Taskat! Your tasks and goals await. Log in now to access your personalized
            workspace, streamline your to-dos, and experience a new level of productivity. Let's continue this journey
            together.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>