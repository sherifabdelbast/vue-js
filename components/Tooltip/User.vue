<script setup>
import {arrow, computePosition, offset, flip, shift} from "@floating-ui/dom";

const props = defineProps(["user", "placement"]);

const referenceRef = ref(null);
const floatingRef = ref(null);
const arrowRef = ref(null);
const isHidden = ref(true);

const calcPosition = async () => {
  const {x, y, middlewareData, placement} = await computePosition(referenceRef.value, floatingRef.value, {
    placement: props.placement,
    middleware: [offset(5), flip(), shift({padding: 5}), arrow({element: arrowRef.value}),],
  });

  Object.assign(floatingRef.value.style, {
    left: `${x}px`,
    top: `${y}px`,
  });

  const {x: arrowX, y: arrowY} = middlewareData.arrow;

  const opposedSide = {
    left: "right",
    right: "left",
    bottom: "top",
    top: "bottom",
  }[placement.split("-")[0]];

  Object.assign(arrowRef.value.style, {
    left: arrowX - 5 ? `${arrowX - 5}px` : "",
    top: arrowY ? `${arrowY}px` : "",
    bottom: "",
    right: "",
    [opposedSide]: "-4px",
  });
}

const hide = () => isHidden.value = true
const show = () => {
  isHidden.value = false;
  calcPosition();
}
</script>

<template>
  <div class="d-inline-block">
    <div ref="referenceRef" class="d-inline-block" @mouseenter="show" @mouseleave="hide" @focus="show" @blur="hide">
      <slot/>
      <div ref="floatingRef" class="bg-light position-absolute text-dark py-3 px-6 rounded-2 cursor-default shadow"
           :class="{'invisible': isHidden}"
           style="top: 0; left: 0; z-index: 50">
        <div class="d-flex align-items-center">
          <Avatar :user="user" :imgWidth="70" customStyle="rounded" fontSize="fs-1"
                  style="transition: none !important; margin-right: 15px;"/>
          <div>
            <NuxtLink v-if="user?.name" :to="`/profile/${user?.identify_number}`" target="_blank"
                      class="m-0 fs-4 d-flex align-items-center gap-1 text-dark text-hover-primary">{{ user?.name }}
              <Icon name="majesticons:external-link-line" size="16"/>
            </NuxtLink>
            <p class="m-0 text-gray-600">{{ user?.email }}</p>
          </div>
        </div>
        <div
            ref="arrowRef"
            class="position-absolute bg-light" style="width: 8px; height: 8px; transform: rotate(45deg);"
        ></div>
      </div>
    </div>
  </div>
</template>