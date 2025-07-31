<script setup>
import Input from "~/components/form/Input.vue";

const emits = defineEmits(["update:input", 'submit']);

const props = defineProps(["type", "name", "placeholder", "autocomplete", "input", "formDataError", "disabled"]);

// convert props values to refs
const {type, name, placeholder, autocomplete, input, disabled} = toRefs(props);

// === computed === //
const inputComputed = computed({
  get: () => input.value,
  set: (val) => emits("update:input", val),
});
</script>

<template>
  <div class="">
    <input
        :type="type"
        class="form-control py-4"
        :name="name"
        :autocomplete="autocomplete"
        :placeholder="placeholder"
        v-model="inputComputed"
        :class="{'input-error': formDataError }"
        :disabled="disabled"
    />

    <div v-if="formDataError" class="w-100 text-start mt-1">
      <span class="form-data-error">{{ typeof formDataError == "string" ? formDataError : formDataError[0] }}</span>
    </div>
  </div>
</template>

<style>
.form-data-error {
  color: var(--bs-danger);
  margin-left: 10px;
}

.input-error {
  border-color: var(--bs-danger);
}
</style>