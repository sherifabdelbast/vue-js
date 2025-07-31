<script setup>
const props = defineProps(["issue", "toggleView", "isOpen", "toggleSearch"]);

const {issue} = toRefs(props);
</script>

<template>
  <div class="d-flex align-items-center mb-5 border-bottom items" @click="toggleView(); toggleSearch();">
    <div class="d-flex align-items-center justify-content-between p-2 item rounded-top-1 cursor-pointer">
      <div class="d-flex flex-column row-gap-1">
        <div class="fs-7 text-gray-800 text-hover-primary fw-semibold truncate" style="max-width: 300px">
          {{ issue?.title }}
        </div>
        <div class="d-flex align-items-center gap-2">
          <span class="fs-8 text-muted fw-semibold">{{ issue?.project?.name }}</span>
          <span class="fs-8 text-muted fw-semibold text-uppercase text-nowrap">
              <div class="py-1 px-2 rounded-1 fw-bold" :class="issue?.status?.type == 'TO DO' ? 'bg-light-active' : issue?.status?.type == 'DONE' ? 'bg-light-primary text-primary' : 'bg-light-success text-success'" style="line-height: normal;">
                {{ issue?.status?.name }}
              </div>
            </span>
        </div>
      </div>
      <div>
        <Avatar :user="issue?.team_member?.user" imgWidth="25" :unsigned="issue?.assign_to"
                :class="issue?.team_member?.user?.photo ? 'border border-3 border-primary' : '' "/>
      </div>
    </div>
  </div>
</template>

<style>
.items .item {
  width: 100% !important;
}

.items .item span,
.items .item div {
  height: fit-content;
}

.items .item:hover {
  background-color: var(--bs-gray-100);
}
</style>
