import {defineStore} from "pinia";
import {useGetData} from "~/composables/useGetData";

export const useProjectStore = defineStore("projectStore", () => {
    const {
        favProject,
        fetchAllProjects,
        fetchProjectDetails,
        fetchAllIssues,
        showIssueDetails,
        fetchBacklog,
        fetchProjectStatuses,
        fetchBoard,
        fetchIssueHistory,
        fetchAllAcceptedTeam,
        fetchProjectHistory,
        fetchAllYourWorkTeamMembers,
        fetchAllComments,
        fetchAllIssueTypes,
        fetchOpenedSprints,
        fetchAllSprints,
        fetchAllProjectRoles,
        fetchAllLabels,
        fetchMembersList
    } = useGetData();
    const {refresh, user} = useAuth();

    const project = ref(null);
    const members = ref(null);
    const allProjects = ref([]);
    const favioratesProjects = ref([]);
    const userProjects = ref([]);
    const invitedToProjects = ref([]);
    const closedProjects = ref([]);
    const inviteIdentify = ref(null);
    const invitationIdentifyNumber = ref(null);
    const userIdentifyNumber = ref(null);
    const allIssues = ref([]);
    const assignedToIssues = ref([]);
    const issueDetails = ref(null);
    const isDataLoaded = ref(true);
    const isMembersDataLoaded = ref(true);
    const backlog = ref(null);
    const statuses = ref(null);
    const board = ref(null);
    const showDetails = ref(true);
    const showDescription = ref(true);
    const closeEditing = ref(false);
    const isSearchLoading = ref(false);
    const issueHistory = ref(null);
    const acceptedTeam = ref(null);
    const isAllIssuesSelected = ref(false);
    const allSelectedIssuesList = ref([]);
    const teamOptions = ref([]);
    const projectHistory = ref(null);
    const editSprintFromData = ref({
        project_id: null, id: null, name: null, goal: null, start_date: null, duration: null, end_date: null,
    });
    const editSprintValidationErrors = ref({
        name: null, goal: null, start_date: null, duration: null, end_date: null, allValid: true,
    });
    const oldEditSprintFromData = ref({
        name: null, goal: null, start_date: null, duration: null, end_date: null,
    });
    const completeSprintInfo = ref({
        project_id: null,
        id: null,
        name: null,
        goal: null,
        canComplete: false,
        unCompletedIssuesLength: null,
        completedIssuesLength: null,
        moveIssuesOptions: null,
    });
    const deleteStatusInfo = ref({
        project_id: null, id: null, name: null, type: null, changeStatusOptions: [],
    });
    const selectedMoveStatus = ref(null);
    const teamMembersYourWork = ref(null);
    const isModalOpen = ref(false);
    const activeIssue = ref(-1);
    const allComments = ref(null);
    const issueTypes = ref([]);
    const openedSprints = ref(null);
    const allSprints = ref(null);
    const addCommentLoading = ref(false);
    const isDataChange = ref(true);
    const memberRole = ref("");
    const memberPermissions = ref([]);
    const selectedChangeRole = ref(null);
    const deleteRoleInfo = ref({
        id: null,
        name: null,
        members: null,
        changeRoleOptions: [],
        isConfirmed: false,
        confirmText: null
    });
    const roles = ref(null);
    const editRoleInfo = ref({
        id: null,
        name: null,
        permissions: null,
    });
    const oldEditRoleInfo = ref({
        name: null,
        permissions: null,
    });
    const editProjectInfo = ref({
        name: null,
        icon: null,
        description: null,
    });
    const oldEditProjectInfo = ref({
        name: null,
        icon: null,
        description: null,
    });
    const rolesOptions = ref([]);
    const selectedRole = ref(null);
    const roleLoading = ref(false);
    const changeMemberRoleInfo = ref({
        id: null,
        name: null,
        rolesOptions: []
    });
    const selectedChangeMemberRole = ref(null);
    const changeMemberRoleLoading = ref(false);
    const projectLabels = ref(null);
    const newIssueType = ref("story");
    const removedIssueInfo = ref({
        id: null,
        newOrder: null,
    });
    const mentionedUserIds = ref(null);
    const teamMembersPage = ref(null);
    const openIssueModal = ref(false);

    const toolbarOptions = [
        [{'header': [1, 2, 3, 4, 5, 6, false]}],
        ['bold', 'italic', 'underline', 'strike', {'color': []}, {'background': ["#dc3545", "#d63384", "#ffc107", "#20c997", "#007bff", "#6f42c1", "#17a2b8", "#6610f2", "#fd7e14", "#e83e8c", "#28a745", "#343a40", "#c678dd", "#5c6370", "#98c379", "#d19a66", "#61afef"]}],
        ['link'],
        [{'list': 'ordered'}, {'list': 'bullet'}],
        ['blockquote', 'code-block'],
        [{'align': []}, {'indent': '-1'}, {'indent': '+1'}],
    ];
    // ['image'],
    const refreshProjectDetails = async (id) => {
        const response = await fetchProjectDetails(id);
        project.value = response?.project;
        await refresh();
    }

    const makeProjectFav = async (projectId) => {
        return await favProject(projectId);
    }

    function concatProjectArrays(projectArrays, targetArrayIndex) {
        const projectMap = {}; // Object to store projects by project ID
        const concatenatedArray = [];

        // Iterate through arrays and add projects to the concatenated array
        projectArrays.forEach((projectArray, currentIndex) => {
            projectArray.forEach((project) => {
                if (!projectMap[project.id]) {
                    projectMap[project.id] = true;
                    concatenatedArray.push(project);

                    // Remove added projects from the target array
                    if (currentIndex === targetArrayIndex) {
                        if (!projectMap[project.id]) {
                            projectMap[project.id] = false;
                        }
                    }
                }
            });
        });

        return concatenatedArray;
    }

    const refreshProjects = async () => {
        const response = await fetchAllProjects();

        favioratesProjects.value = response?.FavoriteProjects;
        userProjects.value = response?.projects;
        invitedToProjects.value = response?.inviteProjects;
        closedProjects.value = response?.ArchiveProjects;
        allProjects.value = concatProjectArrays([favioratesProjects.value, userProjects.value, invitedToProjects.value], 0);
    }

    const refreshAllIssues = async (userId, query = []) => {
        try {
            const response = await fetchAllIssues(userId, query);

            if (userId) {
                assignedToIssues.value = response?.issues;
            } else {
                allIssues.value = response?.issues;
            }
        } catch (error) {
            console.error("Error refreshing issues:", error);
        }
    };

    const getColor = (index) => {
        const colorList = ["dc3545", "d63384", "fd7e14", "ffc107", "20c997", "17a2b8", "6610f2", "fd7e14", "ffc107"];
        const colorIndex = index % colorList.length;
        return `#${colorList[colorIndex]}`;
    };

    const refreshIssueDetails = async (projectId, issueId) => {
        const response = await showIssueDetails(projectId, issueId);
        if (!projectLabels.value) {
            projectLabels.value = await fetchAllLabels(projectId);
        }
        issueDetails.value = response;
    };

    const refreshProjectBacklog = async (projectId, query = []) => {
        const response = await fetchBacklog(projectId, query);
        backlog.value = response;
    }

    const refreshProjectStatuses = async (projectId) => {
        const response = await fetchProjectStatuses(projectId);
        statuses.value = response;
        return response;
    }

    const refreshProjectBoard = async (projectId, query = []) => {
        const response = await fetchBoard(projectId, query);
        board.value = response;
    }
    const refreshOpenedSprints = async (projectId) => {
        const response = await fetchOpenedSprints(projectId);
        openedSprints.value = response;
    }
    const refreshIssueHistory = async (projectId, issueId, query) => {
        try {
            issueHistory.value = await fetchIssueHistory(projectId, issueId, query);
        } catch (error) {
            console.error("Error refreshing issues history:", error);
        }
    }

    const refreshAllAcceptedTeam = async (projectId) => {
        try {
            const response = await fetchAllAcceptedTeam(projectId);
            acceptedTeam.value = response;

            teamOptions.value = [];

            teamOptions.value.push({
                id: null, photo: null, name: "Unassigned", isUnassigned: true
            });
            response?.teamMember.forEach(member => teamOptions.value.push({
                id: member?.id,
                name: member?.user?.name,
                photo: member?.user?.photo
            }));
        } catch (error) {
            console.error("Error refreshing accepted team:", error);
        }
    }

    const refreshProjectHistory = async (projectId) => {
        try {
            projectHistory.value = await fetchProjectHistory(projectId);
        } catch (error) {
            console.error("Error refreshing accepted team:", error);
        }
    }

    const refreshAllYourWorkTeamMembers = async () => {
        try {
            teamMembersYourWork.value = await fetchAllYourWorkTeamMembers();
        } catch (error) {
            console.error("Error refreshing accepted team:", error);
        }
    }

    const refreshComments = async (projectId, issueId) => {
        allComments.value = await fetchAllComments(projectId, issueId);
    }

    const refreshAllIssueTypes = async (projectId, issueId) => {
        issueTypes.value = await fetchAllIssueTypes(projectId, issueId);
    }

    const refreshAllSprints = async (projectId) => {
        const response = await fetchAllSprints(projectId);
        allSprints.value = response;
    }

    const refreshAllRoles = async (projectId) => roles.value = await fetchAllProjectRoles(projectId);

    const refreshRolesOptions = async (projectId) => {
        const response = await fetchAllProjectRoles(projectId);

        rolesOptions.value = [];

        response?.roles.forEach((role) => {
            if (role?.key !== "owner") {
                rolesOptions.value.push({id: role?.id, name: role?.key});
            }
        });

        selectedRole.value = rolesOptions.value[0];
    }

    const refreshAllLabels = async (projectId) => {
        projectLabels.value = await fetchAllLabels(projectId);
    }

    const refreshTeamMembersPage = async (projectId) => {
        teamMembersPage.value = await fetchMembersList(projectId)
    }

    return {
        project,
        members,
        allProjects,
        favioratesProjects,
        userProjects,
        invitedToProjects,
        closedProjects,
        inviteIdentify,
        invitationIdentifyNumber,
        userIdentifyNumber,
        makeProjectFav,
        refreshProjects,
        refreshProjectDetails,
        getColor,
        refreshAllIssues,
        allIssues,
        assignedToIssues,
        refreshIssueDetails,
        issueDetails,
        backlog,
        refreshProjectBacklog,
        refreshProjectStatuses,
        statuses,
        isDataLoaded,
        isMembersDataLoaded,
        showDetails,
        closeEditing,
        showDescription,
        isSearchLoading,
        refreshProjectBoard,
        board,
        refreshIssueHistory,
        issueHistory,
        refreshAllAcceptedTeam,
        acceptedTeam,
        allSelectedIssuesList,
        isAllIssuesSelected,
        teamOptions,
        refreshProjectHistory,
        projectHistory,
        oldEditSprintFromData,
        editSprintFromData,
        editSprintValidationErrors,
        completeSprintInfo,
        refreshAllYourWorkTeamMembers,
        teamMembersYourWork,
        isModalOpen,
        activeIssue,
        refreshComments,
        allComments,
        deleteStatusInfo,
        selectedMoveStatus,
        refreshAllIssueTypes,
        issueTypes,
        refreshOpenedSprints,
        openedSprints,
        refreshAllSprints,
        allSprints,
        addCommentLoading,
        isDataChange,
        memberRole,
        memberPermissions,
        selectedChangeRole,
        deleteRoleInfo,
        roles,
        refreshAllRoles,
        editRoleInfo,
        oldEditRoleInfo,
        editProjectInfo,
        oldEditProjectInfo,
        rolesOptions,
        refreshRolesOptions,
        roleLoading,
        selectedRole,
        changeMemberRoleInfo,
        selectedChangeMemberRole,
        changeMemberRoleLoading,
        refreshAllLabels,
        projectLabels,
        newIssueType,
        removedIssueInfo,
        mentionedUserIds,
        refreshTeamMembersPage,
        teamMembersPage,
        openIssueModal
    };
});