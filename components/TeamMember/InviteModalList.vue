<script setup>
import {useProjectStore} from "~/stores/useProjectStore";

const props = defineProps(["member", "index"]);

const roleOptions = ref(["Admin"]);

const projectStore = useProjectStore();

const rolesOptions = ref([
  {name: 'Admin', code: 'A'},
]);
const selectedRole = ref(rolesOptions.value[0].name);
</script>

<template>
  <div
      class="d-flex flex-stack border-bottom border-gray-300 border-bottom-dashed py-2"
  >
    <div class="d-flex align-items-center">
      <Avatar :user="member?.user" :imgWidth="35"/>
      <div class="ms-5">
        <div class="fs-5 fw-bold text-gray-900 text-hover-primary mb-2">{{ member?.user?.name || "---" }}</div>
        <div class="fw-semibold text-muted truncate" style="max-width:300px">{{ member?.user?.email }}</div>
      </div>
    </div>
    <div class="ms-2 w-100px text-end">
          <p class="badge badge-lg badge-light-dark">{{member?.role?.key}}</p>

<!--      <Dropdown disabled v-model="selectedRole" :options="rolesOptions" :placeholder="selectedRole" optionLabel="name"-->
<!--                placeholder="Select a Role" class="w-100"/>-->
    </div>
  </div>
</template>
