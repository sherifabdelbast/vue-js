<script setup>
const emits = defineEmits(["update:input", 'submit']);

const props = defineProps(["type", "name", "placeholder", "labelText", "autocomplete", "input", "formDataError", "disabled"]);

// convert props values to refs
const {type, name, placeholder, labelText, autocomplete, input, disabled} = toRefs(props)

// === computed === //
const inputComputed = computed({
  get: () => input.value,
  set: (val) => emits("update:input", val),
});

const showPass = ref(false);

const hideShowPass = () => showPass.value = !showPass.value;
</script>

<template>
  <input
      v-if="type === 'number'"
      :type="type"
      class="form-control input-number-custom"
      style="height: 36px !important;"
      :name="name"
      :autocomplete="autocomplete"
      :placeholder="placeholder"
      v-model="inputComputed"
      :class="{'input-error': formDataError }"
      @keydown.enter.prevent="emits('submit')"
  />
  <div v-else class="form-floating position-relative">
    <input
        v-if="type !== 'password'"
        :type="type"
        class="form-control pe-13"
        :name="name"
        :autocomplete="autocomplete"
        :placeholder="placeholder"
        v-model="inputComputed"
        :class="{'input-error': formDataError }"
        :disabled="disabled"
    />
    <input
        v-else
        :type="showPass ? 'text' : 'password'"
        class="form-control pe-13"
        :name="name"
        :autocomplete="autocomplete"
        :placeholder="placeholder"
        v-model="inputComputed"
        :class="{'input-error': formDataError }"
    />
    <div v-if="type == 'password'" id="show-hide-pass"
         class="position-absolute d-flex align-items-center justify-content-center cursor-pointer"
         @click="hideShowPass">

      <i class="ki-duotone ki-eye fs-2" v-if="!showPass">
        <i class="path1"></i>
        <i class="path2"></i>
        <i class="path3"></i>
      </i>
      <i class="ki-duotone ki-eye-slash fs-2" v-else>
        <i class="path1"></i>
        <i class="path2"></i>
        <i class="path3"></i>
        <i class="path4"></i>
      </i>
    </div>
    <label for="floatingInput" :class="{'text-danger': formDataError }">{{ labelText }}</label>
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

#show-hide-pass {
  width: 50px;
  height: 50px;
  top: 0;
  right: 0;
  color: #cecece;
}

#show-hide-pass i {
  transition: all 0.3s ease;
}

#show-hide-pass:hover i {
  color: var(--bs-primary);
}

input[type=number]::-webkit-outer-spin-button,
input[type=number]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  margin: 0;
}

input.input-number-custom {
  padding: 6px;
  height: 30px !important;
  border-radius: 5px !important;
}
</style>