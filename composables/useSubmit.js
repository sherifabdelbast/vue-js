export function useSubmit(fetchable, options = {}) {
    const validationErrors = ref({});
    const error = ref(null);
    const inProgress = ref(false);
    const succeeded = ref(null);

    async function submit() {
        validationErrors.value = {};
        error.value = null;
        inProgress.value = true;
        succeeded.value = null;

        try {
            const data = await fetchable();
            succeeded.value = true;
            options?.onSuccess?.(data);
            return data;
        } catch (e) {
            error.value = e;
            succeeded.value = false;
            options?.onError?.(e);
            if(e.data?.errors) {
                validationErrors.value = e.data?.errors;
            } else {
                validationErrors.value = {}
            }
            if (e.response?.status !== 422) throw e;
        } finally {
            inProgress.value = false;
        }
    }

    return {
        submit,
        inProgress,
        succeeded,
        validationErrors,
        error,
    };
}
