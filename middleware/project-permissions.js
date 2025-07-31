import {useGetData} from "~/composables/useGetData";
import {useProjectStore} from "~/stores/useProjectStore";
import {storeToRefs} from "pinia";

const projectStore = useProjectStore();
const {memberRole, memberPermissions} = storeToRefs(projectStore);
const {fetchMemberRoleAndPermissions} = useGetData();

export default defineNuxtRouteMiddleware(async (to, from) => {
    const response = await fetchMemberRoleAndPermissions(to.params.id);

    if (response?.code === 200) {
        memberRole.value = response?.role?.name;
        memberPermissions.value = response?.role?.permissions;

        if (to.name === 'projects-id-settings-roles') {
            if (!memberPermissions.value.includes('show role')) {
                return showError({statusCode: 403, statusMessage: "You don't have permission to access this page."});
            }
        } else if (to.name === 'projects-id-settings-history') {
            if (!memberPermissions.value.includes('show project history')) {
                return showError({statusCode: 403, statusMessage: "You don't have permission to access this page."});
            }
        }
    }
});
