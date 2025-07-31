import {useProjectStore} from "~/stores/useProjectStore";

export const usePostData = () => {
    const projectStore = useProjectStore();

    const invite = async (credentials, projectId) => await $larafetch(`/api/projects/${projectId}/team/invite`, {
        method: "post",
        body: credentials,
    });

    const deleteMember = async (projectId, teamMemberId) => {
        const response = await $larafetch(`/api/projects/${projectId}/team/${teamMemberId}/delete`, {
            method: "post",
        });
        await projectStore.refreshProjectDetails(projectId);
        return response;
    }

    const updateMemberRole = async (projectId, teamMemberId, credential) => await $larafetch(`/api/projects/${projectId}/team/${teamMemberId}/edit-role`, {
        method: "post",
        body: credential
    });

    const invitation = async (credential) => await $larafetch(`/api/invitation`, {
        method: "post",
        body: credential
    });

    const acceptInvitation = async (credential) => await $larafetch(`/api/invitation/accept`, {
        method: "post",
        body: credential
    });

    const createProject = async (credentials) => await $larafetch("/api/projects/create", {
        method: "post",
        body: credentials
    });

    const editProject = async (credentials, projectId) => await $larafetch(`/api/projects/${projectId}/edit`, {
        method: "post",
        body: credentials
    });

    const createIssue = async (credentials, projectId) => await $larafetch(`/api/projects/${projectId}/issues/create`, {
        method: "post",
        body: credentials
    });

    const deleteIssue = async (projectId, issueId) => await $larafetch(`/api/projects/${projectId}/backlog/issues/${issueId}/delete`, {
        method: "post",
    });

    const copyIssue = async (projectId, issueId) => await $larafetch(`/api/projects/${projectId}/backlog/issues/${issueId}/copy`, {
        method: "post",
    });

    const deleteMultiIssues = async (projectId, credentials) => await $larafetch(`/api/projects/${projectId}/backlog/bulk-issues/delete`, {
        method: "post",
        body: credentials
    });

    const updateMultiIssues = async (projectId, credentials) => await $larafetch(`/api/projects/${projectId}/backlog/bulk-issues/edit`, {
        method: "post",
        body: credentials
    });

    const updateIssueInfo = async (projectId, issueId, credentials) => {
        const response = await $larafetch(`/api/projects/${projectId}/backlog/issues/${issueId}/edit`, {
            method: "post",
            body: credentials
        });

        await projectStore.refreshIssueDetails(projectId, issueId);
        return response;
    }

    const updateIssueInfoFromOutside = async (projectId, issueId, credentials) => await $larafetch(`/api/projects/${projectId}/backlog/issues/${issueId}/edit`, {
        method: "post",
        body: credentials
    });

    const updateIssuePriority = async (projectId, issueId, credentials) => await $larafetch(`/api/projects/${projectId}/backlog/issues/${issueId}/edit-priority`, {
        method: "post",
        body: credentials
    });

    const updateProfileInfo = async (userId, credentials) => await $larafetch(`/api/profile/${userId}/edit`, {
        method: "post",
        body: credentials
    });

    const updateSprintInfo = async (projectId, sprintId, credentials) => await $larafetch(`/api/projects/${projectId}/backlog/sprints/${sprintId}/edit`, {
        method: "post",
        body: credentials
    });

    const createSprint = async (projectId) => await $larafetch(`/api/projects/${projectId}/backlog/sprints/create`, {
        method: "post",
    });

    const createSprintWithIssues = async (projectId, credentials) => await $larafetch(`/api/projects/${projectId}/backlog/sprints/create-issues`, {
        method: "post",
        body: credentials
    });

    const deleteSprint = async (projectId, sprintId, credentials) => await $larafetch(`/api/projects/${projectId}/backlog/sprints/${sprintId}/delete`, {
        method: "post",
        body: credentials
    });

    const startSprint = async (projectId, sprintId, credentials) => await $larafetch(`/api/projects/${projectId}/backlog/sprints/${sprintId}/start`, {
        method: "post",
        body: credentials
    });

    const completeSprint = async (projectId, sprintId, credentials) => await $larafetch(`/api/projects/${projectId}/backlog/sprints/${sprintId}/complete`, {
        method: "post",
        body: credentials
    });

    const moveIssue = async (projectId, issueId, credentials) => await $larafetch(`/api/projects/${projectId}/backlog/issues/${issueId}/move`, {
        method: "post",
        body: credentials
    });

    const moveMultiIssues = async (projectId, credentials) => await $larafetch(`/api/projects/${projectId}/backlog/bulk-issues/move`, {
        method: "post",
        body: credentials
    });

    const moveBoardIssue = async (projectId, issueId, credentials) => await $larafetch(`/api/projects/${projectId}/board/issues/${issueId}/move`, {
        method: "post",
        body: credentials
    });

    const updateStatusInfo = async (projectId, statusId, credentials) => await $larafetch(`/api/projects/${projectId}/statuses/${statusId}/edit`, {
        method: "post",
        body: credentials
    });

    const createStatus = async (projectId, credentials) => await $larafetch(`/api/projects/${projectId}/statuses/create`, {
        method: "post",
        body: credentials
    });

    const deleteStatus = async (projectId, statusId, credentials) => await $larafetch(`/api/projects/${projectId}/statuses/${statusId}/delete`, {
        method: "post",
        body: credentials
    });

    const moveStatus = async (projectId, statusId, credentials) => await $larafetch(`/api/projects/${projectId}/statuses/${statusId}/move`, {
        method: "post",
        body: credentials
    });

    const createComment = async (projectId, issueId, credentials) => await $larafetch(`/api/projects/${projectId}/backlog/issues/${issueId}/comments/create`, {
        method: "post",
        body: credentials
    });

    const deleteComment = async (projectId, issueId, commentId) => await $larafetch(`/api/projects/${projectId}/backlog/issues/${issueId}/comments/${commentId}/delete`, {
        method: "post",
    });

    const editComment = async (projectId, issueId, commentId, credentials) => await $larafetch(`/api/projects/${projectId}/backlog/issues/${issueId}/comments/${commentId}/edit`, {
        method: "post",
        body: credentials
    });

    const attachFiles = async (projectId, issueId, credentials) => await $larafetch(`/api/projects/${projectId}/backlog/issues/${issueId}/upload`, {
        method: "post",
        'content-type': 'multipart/form-data',
        body: credentials
    });

    const deleteAttachFile = async (projectId, issueId, fileId) => await $larafetch(`/api/projects/${projectId}/backlog/issues/${issueId}/file/${fileId}/delete`, {
        method: "post"
    });

    const deleteRole = async (projectId, roleId, credentials) => await $larafetch(`/api/projects/${projectId}/role/${roleId}/delete`, {
        method: "post",
        body: credentials
    });

    const createRole = async (projectId, credentials) => await $larafetch(`/api/projects/${projectId}/role/create`, {
        method: "post",
        body: credentials
    });

    const editRole = async (projectId, roleId, credentials) => await $larafetch(`/api/projects/${projectId}/role/${roleId}/edit`, {
        method: "post",
        body: credentials
    });

    const createLabels = async (projectId, issueId, credentials) => await $larafetch(`/api/projects/${projectId}/issue/${issueId}/label/create`, {
        method: "post",
        body: credentials
    });

    const deleteLabel = async (projectId, issueId, credentials) => await $larafetch(`/api/projects/${projectId}/issue/${issueId}/label/delete`, {
        method: "post",
        body: credentials
    });

    const playerId = async (credentials) => await $larafetch(`/api/player-id`, {
        method: "post",
        body: credentials
    });

    const markNotificationAsRead = async (notificationId) => await $larafetch(`/api/notification/${notificationId}/read`, {
        method: "post",
    });

    return {
        invite,
        deleteMember,
        createProject,
        editProject,
        invitation,
        acceptInvitation,
        createIssue,
        deleteIssue,
        copyIssue,
        updateIssueInfo,
        updateProfileInfo,
        moveIssue,
        updateIssueInfoFromOutside,
        updateSprintInfo,
        moveBoardIssue,
        updateStatusInfo,
        createStatus,
        deleteStatus,
        deleteMultiIssues,
        updateMultiIssues,
        moveMultiIssues,
        createComment,
        createSprint,
        createSprintWithIssues,
        deleteSprint,
        startSprint,
        completeSprint,
        deleteComment,
        editComment,
        attachFiles,
        deleteAttachFile,
        deleteRole,
        createRole,
        editRole,
        updateIssuePriority,
        updateMemberRole,
        moveStatus,
        createLabels,
        deleteLabel,
        playerId,
        markNotificationAsRead
    };
};