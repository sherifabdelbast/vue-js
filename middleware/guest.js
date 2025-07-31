export default defineNuxtRouteMiddleware(async () => {
    const user = useUser();
    if (user.value) {
        if (user.value?.project_identify) {
            return navigateTo(`/projects/${user.value?.project_identify}`, {replace: true});
        }

        return navigateTo(`/projects`, {replace: true});
    }
});