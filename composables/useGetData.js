export const useGetData = () => {
    const fetchMembersList = async (projectId) => await $larafetch(`/api/projects/${projectId}/team`);

    const fetchAllProjects = async () => await $larafetch("/api/projects");

    const fetchProjectsKeys = async () => await $larafetch("/api/projects/key-projects");

    const fetchProjectDetails = async (projectId) => await $larafetch(`/api/projects/${projectId}/details`);

    const closeProject = async (projectId) => await $larafetch(`/api/projects/${projectId}/archive`);

    const favProject = async (projectId) => await $larafetch(`/api/projects/${projectId}/favorite`);

    const showIssueDetails = async (projectId, issueId) => await $larafetch(`/api/projects/${projectId}/backlog/issues/${issueId}/show`);

    const fetchIssueHistory = async (projectId, issueId, query) => {
        if (query) {
            return await $larafetch(`/api/projects/${projectId}/backlog/issues/${issueId}/history/?page=${query}`);
        }

        return await $larafetch(`/api/projects/${projectId}/backlog/issues/${issueId}/history/?page=1`);
    }

    const fetchAllIssues = async (userId, queryParameters = []) => {
        if (userId) {
            return await $larafetch(`/api/issues/?assignToMe=${userId}`);
        }
        if (queryParameters.length > 0) {
            return await $larafetch(`/api/issues/?${queryParameters.join('&')}`);
        }
        return await $larafetch("/api/issues");
    };

    const fetchBacklog = async (projectId, queryParameters = []) => {
        if (queryParameters.length > 0) {
            return await $larafetch(`/api/projects/${projectId}/backlog/?${queryParameters.join('&')}`);
        }
        return await $larafetch(`/api/projects/${projectId}/backlog`);
    };

    const fetchProjectStatuses = async (projectId) => await $larafetch(`/api/projects/${projectId}/statuses`);

    const fetchProjectAcceptedTeamMembers = async (projectId) => await $larafetch(`/api/projects/${projectId}/accepted-team`);

    const fetchProfileDetails = async (userId) => await $larafetch(`/api/profile/${userId}`);

    const fetchAllProjectsStatuses = async () => await $larafetch(`/api/all-statuses`);

    const fetchBoard = async (projectId, queryParameters = []) => {
        if (queryParameters.length > 0) {
            return await $larafetch(`/api/projects/${projectId}/board/?${queryParameters.join('&')}`);
        }
        return await $larafetch(`/api/projects/${projectId}/board`);
    };

    const fetchAllAcceptedTeam = async (projectId) => await $larafetch(`/api/projects/${projectId}/accepted-team`);

    const fetchProjectHistory = async (projectId) => await $larafetch(`/api/projects/${projectId}/history`);

    const fetchAllYourWorkTeamMembers = async () => await $larafetch(`/api/your-work-teamMembers`);

    const fetchAllIssueTypes = async (projectId, issueId) => await $larafetch(`/api/projects/${projectId}/issues/${issueId}/type-issue`);

    const fetchAllComments = async (projectId, issueId) => await $larafetch(`/api/projects/${projectId}/backlog/issues/${issueId}/comments`);

    const fetchOpenedSprints = async (projectId) => await $larafetch(`/api/projects/${projectId}/sprints-open`);

    const fetchAllSprints = async (projectId) => await $larafetch(`/api/projects/${projectId}/backlog/sprints`);

    const fetchMemberRoleAndPermissions = async (projectId) => await $larafetch(`/api/projects/${projectId}/member-role-permissions`);

    const fetchAllProjectRoles = async (projectId) => await $larafetch(`/api/projects/${projectId}/role`);

    const fetchAllProjectPermissions = async (projectId) => await $larafetch(`/api/projects/${projectId}/all-permissions`);

    const fetchAllLabels = async (projectId) => await $larafetch(`/api/projects/${projectId}/labels`);

    const fetchUserNotifications = async (markAllRead) => {
        if (markAllRead) {
            return await $larafetch(`/api/notification`, {
                method: "post",
                body: {
                    read_all: 1
                }
            });
        }

        return await $larafetch(`/api/notification`, {
            method: "post",
        });
    }

    return {
        fetchMembersList,
        fetchAllProjects,
        fetchProjectsKeys,
        fetchProjectDetails,
        favProject,
        closeProject,
        showIssueDetails,
        fetchIssueHistory,
        fetchBacklog,
        fetchProjectStatuses,
        fetchProjectAcceptedTeamMembers,
        fetchAllIssues,
        fetchProfileDetails,
        fetchAllProjectsStatuses,
        fetchBoard,
        fetchAllAcceptedTeam,
        fetchProjectHistory,
        fetchAllYourWorkTeamMembers,
        fetchAllComments,
        fetchAllIssueTypes,
        fetchOpenedSprints,
        fetchAllSprints,
        fetchMemberRoleAndPermissions,
        fetchAllProjectRoles,
        fetchAllProjectPermissions,
        fetchAllLabels,
        fetchUserNotifications
    };
};
