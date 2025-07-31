import {defineStore} from "pinia";
import {useGetData} from "~/composables/useGetData";

// app store: for the global actions in the hole system

export const useAppStore = defineStore("appStore", () => {
    const {fetchProfileDetails, fetchMemberRoleAndPermissions, fetchUserNotifications} = useGetData();

    const isMobile = ref(null);
    const isLoading = ref(false);
    const isProjectsLoading = ref(true);
    const isBoardLoading = ref(true);
    const isBacklogLoading = ref(true);
    const isRolesLoading = ref(false);
    const isHistoryLoading = ref(false);
    const isSettingsLoading = ref(false);
    const isTeamLoading = ref(false);
    const isNotificationsLoading = ref(false);
    const projectsMenuActive = ref(false);
    const userEmail = ref(''); // Add a new state to store the user's email
    const profile = ref(null);
    const identifyNumberForgetPassword = ref(null);
    const previewImage = ref(null);
    const projectCreated = ref({
        is: false,
        id: null
    });
    const permissionsOutsideProjects = ref([]);
    const permissionLocation = ref("in");
    const userNotifications = ref(null);

    // Add an action to set the user's email
    const setEmail = (email) => userEmail.value = email;

    const formData = ref(null);

    const refreshProfileDetails = async (userId) => {
        const response = await fetchProfileDetails(userId);
        if (response?.code === 200) {
            profile.value = response;
        }
    }

    const refreshOutsideProjectsPermissions = async (projectId) => {
        const response = await fetchMemberRoleAndPermissions(projectId);
        permissionsOutsideProjects.value = response?.role?.permissions;
    }

    const refreshUserNotifications = async (markAllAsRead) => {
        const response = await fetchUserNotifications(markAllAsRead);
        userNotifications.value = response?.notifications;
    }

    return {
        isMobile,
        projectsMenuActive,
        userEmail,
        setEmail,
        isLoading,
        isBoardLoading,
        isBacklogLoading,
        isTeamLoading,
        formData,
        profile,
        refreshProfileDetails,
        identifyNumberForgetPassword,
        previewImage,
        projectCreated,
        permissionsOutsideProjects,
        refreshOutsideProjectsPermissions,
        permissionLocation,
        isProjectsLoading,
        isSettingsLoading,
        isRolesLoading,
        isHistoryLoading,
        refreshUserNotifications,
        userNotifications,
        isNotificationsLoading,
    };
});
