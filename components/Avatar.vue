<script setup>
import {useProjectStore} from "~/stores/useProjectStore";

const props = defineProps(["user", "imgWidth", "unsigned", "symbolMinWidth", "customStyle", "fontSize"]);

const projectStore = useProjectStore();
const getColor = (index) => {
  return projectStore.getColor(index);
};
</script>

<template>
  <div v-if="unsigned === null" class="symbol symbol-circle cursor-pointer"
       :class="imgWidth ? `symbol-${imgWidth}px` : 'symbol-35px'">
    <img src="/blank.png" alt="Unsigned"/>
  </div>
  <div v-else class="symbol symbol-circle cursor-pointer" :class="[
    imgWidth ? `symbol-${imgWidth}px` : 'symbol-35px'
  ]">
    <img v-if="user?.url_photo" alt="Pic" :src="user?.url_photo" class="object-fit-cover" :class="customStyle ? customStyle : ''"/>
    <span v-else class="symbol-label text-inverse-warning text-uppercase fw-bold"
          :class="[symbolMinWidth ? 'min-w-25px' : '', customStyle ? customStyle : '', fontSize ? fontSize : '']"
          :style="{ backgroundColor: getColor(user?.id) }">{{
        user?.name ? user?.name[0] : '-'
      }}</span>
  </div>
</template>

<style>
.symbol > span {
  line-height: initial;
}
</style>