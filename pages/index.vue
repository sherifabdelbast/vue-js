<script setup>
definePageMeta({
  layout: "none",
});

const {user} = useAuth();

const {isLoggedIn} = useAuth();
</script>

<template>
  <div>
    <div class="d-grid min-vh-100" style="grid-template-rows: auto auto 1fr auto;" id="kt_app_root">
      <div class="mb-0" id="home">
        <div class="bgi-no-repeat bgi-size-contain bgi-position-x-center bgi-position-y-bottom landing-hero-bg"
             style="background-image: url(~/assets/media/svg/illustrations/landing.svg);">
          <div class="landing-header" data-kt-sticky="true" data-kt-sticky-name="landing-header" data-kt-sticky-offset="{default: '200px', lg: '300px'}">
            <div class="container h-80px">
              <div class="d-flex align-items-center justify-content-between h-100">
                <div class="d-flex align-items-center flex-equal">
                  <button class="btn btn-icon btn-active-color-primary me-3 d-flex d-lg-none" id="kt_landing_menu_toggle">
                    <i class="ki-duotone ki-abstract-14 fs-2hx">
                      <span class="path1"></span>
                      <span class="path2"></span>
                    </i>
                  </button>
                  <NuxtLink to="/">
                    <img alt="Logo" src="~/assets/media/logos/logo-light.png" class="logo-sticky h-20px h-lg-40px h-sm-40px"/>
                  </NuxtLink>
                </div>
                <div class="d-lg-block" id="kt_header_nav_wrapper">
                  <div
                      class="d-lg-block p-5 p-lg-0"
                      data-kt-drawer="true"
                      data-kt-drawer-name="landing-menu"
                      data-kt-drawer-activate="{default: true, lg: false}"
                      data-kt-drawer-overlay="true"
                      data-kt-drawer-width="200px"
                      data-kt-drawer-direction="start"
                      data-kt-drawer-toggle="#kt_landing_menu_toggle"
                      data-kt-swapper="true"
                      data-kt-swapper-mode="prepend"
                      data-kt-swapper-parent="{default: '#kt_body', lg: '#kt_header_nav_wrapper'}"
                  >
                    <div class="menu menu-column flex-nowrap menu-rounded menu-lg-row menu-title-gray-600 menu-state-title-primary nav nav-flush fs-5 fw-semibold"
                        id="kt_landing_menu">
                      <div class="menu-item">
                        <a class="menu-link nav-link active py-3 px-4 px-xxl-6" href="#kt_body" data-kt-scroll-toggle="true" data-kt-drawer-dismiss="true">
                          Home
                        </a>
                      </div>
                      <div class="menu-item">
                        <a class="menu-link nav-link py-3 px-4 px-xxl-6" href="#how-it-works" data-kt-scroll-toggle="true" data-kt-drawer-dismiss="true">
                          How it Works
                        </a>
                      </div>
                      <div class="menu-item">
                        <a class="menu-link nav-link py-3 px-4 px-xxl-6" href="#team" data-kt-scroll-toggle="true" data-kt-drawer-dismiss="true">
                          Team
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-if="isLoggedIn" class="flex-equal text-end ms-1">
                  <NuxtLink to="/projects" class="btn btn-success">My Projects</NuxtLink>
                </div>
                <div v-else class="flex-equal text-end ms-1">
                  <NuxtLink to="/login" class="btn btn-success me-5">Login</NuxtLink>
                  <NuxtLink to="/join" class="btn btn-success"> Join</NuxtLink>
                </div>
              </div>
            </div>
          </div>
          <div class="d-flex flex-column flex-center w-100 min-h-350px px-9">
            <div class="text-center mb-5 mb-lg-10 py-10 py-lg-20">
              <h1 class="text-white lh-base fw-bold fs-2x fs-lg-3x mb-15">
                Build And Manage Your Projects With<br/>
                <span class="gradient-text">
                  <span id="kt_landing_hero_text">The Best Task Management System Ever</span>
                </span>
              </h1>
              <NuxtLink v-if="isLoggedIn" :to="`/projects/${user?.project_id}`" class="btn btn-primary text-capitalize">Go to your project</NuxtLink>
              <NuxtLink v-else to="/join" class="btn btn-primary">Try Taskat Software</NuxtLink>
            </div>
          </div>
        </div>
      </div>
      <div class="mb-n10 mb-lg-n20 z-index-2 py-20">
        <div class="container">
          <div class="text-center mb-17">
            <h3 class="fs-2hx text-dark mb-5" id="how-it-works" data-kt-scroll-offset="{default: 100, lg: 150}">How it Works?!</h3>
            <div class="fs-5 text-muted fw-bold">
              Taskat is a Task Management System and it's <br/>
              easy-to-use software for different type of projects.
            </div>
          </div>
          <div class="row w-100 gy-10 mb-md-20">
            <div class="col-md-4 px-5">
              <div class="text-center mb-10 mb-md-0">
                <img
                    src="~/assets/media/illustrations/sketchy-1/2.png"
                    class="mh-125px mb-9"
                    alt=""
                />
                <div class="d-flex flex-center mb-5">
                  <span class="badge badge-circle badge-primary fw-bold p-5 me-3 fs-3">1</span>
                  <div class="fs-5 fs-lg-3 fw-bold text-dark">Join Taskat</div>
                </div>
                <div class="fw-semibold fs-6 fs-lg-4 text-muted">
                  Join to taskat software by using <br/>
                  your email address.
                </div>
              </div>
            </div>
            <div class="col-md-4 px-5">
              <div class="text-center mb-10 mb-md-0">
                <img src="~/assets/media/illustrations/sketchy-1/8.png" class="mh-125px mb-9" alt=""/>
                <div class="d-flex flex-center mb-5">
                  <span class="badge badge-circle badge-primary fw-bold p-5 me-3 fs-3">2</span>
                  <div class="fs-5 fs-lg-3 fw-bold text-dark">
                    Setup Your Project
                  </div>
                </div>
                <div class="fw-semibold fs-6 fs-lg-4 text-muted">
                  Create your project so easy <br/>
                  just by 2 clicks and enjoy with the<br/>
                  amazing features.
                </div>
              </div>
            </div>
            <div class="col-md-4 px-5">
              <div class="text-center mb-10 mb-md-0">
                <img src="~/assets/media/illustrations/sketchy-1/12.png" class="mh-125px mb-9" alt=""/>
                <div class="d-flex flex-center mb-5">
                  <span class="badge badge-circle badge-primary fw-bold p-5 me-3 fs-3">3</span>
                  <div class="fs-5 fs-lg-3 fw-bold text-dark">Manage Your Project</div>
                </div>
                <div class="fw-semibold fs-6 fs-lg-4 text-muted">
                  Start your project development journey <br/>invite your team
                  members, create tasks, assign it<br/>
                  and a lot more with
                  <span class="gradient-text">Taskat Software.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="py-10 py-lg-20">
        <div class="container">
          <div class="text-center mb-12">
            <h3 class="fs-2hx text-dark mb-5" id="team" data-kt-scroll-offset="{default: 100, lg: 150}">
              Our Great Team
            </h3>
            <div class="fs-5 text-muted fw-bold">
              Taskat Development Team "Frontend, Backend"
            </div>
          </div>
          <div class="tns tns-default" style="direction: ltr">
            <div class="row">
              <div class="col text-center">
                <div class="mx-auto mb-5 w-200px h-200px">
                  <img src="~/assets/media/avatars/nasr.png" alt="Nasr Image" class="d-block w-100 h-200px octagon object-fit-cover no-select"/>
                </div>
                <div class="mb-0">
                  <a href="https://github.com/NasrALdaya" class="text-dark fw-bold text-hover-primary fs-3 text-capitalize">Nasr Aldaya</a>
                  <div class="text-muted fs-6 fw-semibold mt-1">Frontend Developer</div>
                </div>
              </div>
              <div class="col text-center">
                <div class="mx-auto mb-5 w-200px h-200px">
                  <img src="~/assets/media/avatars/hosam.jpg" alt="Nasr Image" class="d-block w-100 h-200px octagon object-fit-cover no-select"/>
                </div>
                <div class="mb-0">
                  <a href="https://github.com/HosamMousa" class="text-dark fw-bold text-hover-primary fs-3 text-capitalize">Hussam Mouse</a>
                  <div class="text-muted fs-6 fw-semibold mt-1">
                    Frontend Developer
                  </div>
                </div>
              </div>
              <div class="col text-center">
                <div class="mx-auto mb-5 w-200px h-200px">
                  <img src="~/assets/media/avatars/mohamed.jpg" alt="Mohamed Image" class="d-block w-100 h-200px octagon object-fit-cover no-select"/>
                </div>
                <div class="mb-0">
                  <a href="https://github.com/Abu3Maher" class="text-dark fw-bold text-hover-primary fs-3 text-capitalize">mohammed Al-Namla</a>
                  <div class="text-muted fs-6 fw-semibold mt-1">Backend Developer</div>
                </div>
              </div>
              <div class="col text-center">
                <div class="mx-auto mb-5 w-200px h-200px">
                  <img src="~/assets/media/avatars/mahmoud.jpg" alt="Mohamed Image" class="d-block w-100 h-200px octagon object-fit-cover no-select"/>
                </div>
                <div class="mb-0">
                  <a href="https://github.com/mahmoudayman2001" class="text-dark fw-bold text-hover-primary fs-3 text-capitalize">Mahmood Tayyem</a>
                  <div class="text-muted fs-6 fw-semibold mt-1">Backend Developer</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="mb-0">
        <div class="landing-hero-bg">
          <div class="container">
          </div>
          <div class="landing-dark-separator"></div>
          <div class="container">
            <div class="d-flex flex-stack py-7 justify-content-between">
              <div class="d-flex align-items-center">
                <NuxtLink to="/">
                  <img alt="Logo" src="~/assets/media/logos/logo-light.png" class="logo-sticky h-20px h-lg-40px h-sm-40px"/>
                </NuxtLink>
              </div>
              <div>
                <span class="mx-5 fs-6 fw-semibold text-gray-600 pt-1" href="#">&copy; 2023 Taskat Software.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="kt_scrolltop" class="scrolltop" data-kt-scrolltop="true">
        <i class="ki-duotone ki-arrow-up">
          <span class="path1"></span>
          <span class="path2"></span>
        </i>
      </div>
    </div>
    <div id="kt_scrolltop" class="scrolltop" data-kt-scrolltop="true">
      <i class="ki-duotone ki-arrow-up">
        <span class="path1"></span>
        <span class="path2"></span>
      </i>
    </div>
  </div>
</template>