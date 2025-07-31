<template>
  <div class="w-100">
    <div class="d-flex align-items-start gap-2">
      <AnimatedPlaceholder height="35px" width="35px" borderRadius="50%" style="min-width: 35px;"/>
      <div class="w-100">
        <div class="d-flex justify-content-between">
          <div class="d-flex align-items-center gap-2">
            <AnimatedPlaceholder height="15px" width="80px" borderRadius="4px"/>
            <span class="px-1 custom-round fs-9">
            <AnimatedPlaceholder height="15px" width="100px" borderRadius="4px"/>
          </span>
          </div>
          <div>
            <AnimatedPlaceholder height="32px" width="32px" borderRadius="4px"/>
          </div>
        </div>
        <div class="w-100 mt-2">
          <div class="d-flex justify-content-between">
            <div class="w-100 text-start mt-1">
              <span class="form-data-error m-0">
                  <AnimatedPlaceholder height="60px" width="100%" borderRadius="4px"/>
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import {QuillEditor} from "@vueup/vue-quill";
</script>