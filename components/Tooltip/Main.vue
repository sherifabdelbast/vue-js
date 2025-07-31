<script setup>
import {computePosition, offset, flip, shift} from "@floating-ui/dom";

const props = defineProps(["content", "placement"]);

const referenceRef = ref(null);
const floatingRef = ref(null);
const isHidden = ref(true);

// onMounted(async () => {
//   const {x, y, middlewareData, placement} =  await computePosition(referenceRef.value, floatingRef.value, {
//     placement: "top",
//     middleware: [offset(8), flip(), shift({padding: 5})],
//   });
//
//   Object.assign(floatingRef.value.style, {
//     left: `${x}px`,
//     top: `${y}px`,
//   });
// });

const calcPosition = async () => {
  const {x, y} = await computePosition(referenceRef.value, floatingRef.value, {
    placement: props.placement,
    middleware: [offset(5), flip(), shift({padding: 5})],
  });

  Object.assign(floatingRef.value.style, {
    left: `${x}px`,
    top: `${y}px`,
  });
}

const hide = () => isHidden.value = true
const show = () => {
  isHidden.value = false;
  calcPosition();
}
</script>

<template>
  <div class="d-inline-block custom-tooltip-style">
    <div ref="referenceRef" class="d-inline-block" @mouseenter="show" @mouseleave="hide" @focus="show" @blur="hide">
      <slot/>
    </div>
    <div ref="floatingRef"
         class="bg-gray-800 position-absolute text-white shadow-sm py-1 px-2 rounded-1 cursor-default user-select-none text-nowrap fs-8"
         :class="{'invisible': isHidden}"
         style="top: 0; left: 0; z-index: 50 !important; max-width: 350px !important;">
      {{ content }}
    </div>
  </div>
</template>