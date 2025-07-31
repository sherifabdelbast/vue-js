<script setup>
const emits = defineEmits(["update:input"]);

const props = defineProps(["name", "placeholder", "labelText", "input", "formDataError", "addBg"]);

// convert props values to refs
const {name, placeholder, labelText, input, formDataError} = toRefs(props);

// === computed === //
const inputComputed = computed({
  get: () => input.value,
  set: (val) => emits("update:input", val),
})
</script>

<template>
  <div class="form-floating">
    <textarea
        :name="name"
        :placeholder="placeholder"
        class="form-control h-100px"
        :class="{'input-error': formDataError, 'bg-light': addBg }"
        v-model="inputComputed"
    ></textarea>
    <label for="floatingInput" :class="{'text-danger': formDataError }">{{ labelText }}</label>
    <div v-if="formDataError" class="w-100 text-start mt-1">
      <span class="form-data-error">{{ typeof formDataError == "string" ? formDataError : formDataError[0]}}</span>
    </div>
  </div>
</template>

<style scoped>
textarea {
  resize: none;
}
</style>