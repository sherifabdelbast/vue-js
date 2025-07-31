import {useProjectStore} from "~/stores/useProjectStore";
import {storeToRefs} from "pinia";

export default defineNuxtPlugin(async (nuxtApp) => {
    const {createLabels, deleteLabel} = usePostData();
    const projectStore = useProjectStore();
    const {issueDetails, projectLabels} = storeToRefs(projectStore);

    nuxtApp.vueApp.directive('tagify', {
        mounted(el, binding) {
            const tagifyConfig = {
                whitelist: binding.value.filter((item) => !issueDetails.value.labelNames.includes(item)),
                maxTags: 5,
                dropdown: {
                    maxItems: 1000,
                    classname: '',
                    enabled: 0,
                    closeOnSelect: false,
                },
            };

            const tagify = new Tagify(el, tagifyConfig);

            const handleTagAdd = async (e) => {
                const addedTag = e.detail.data.value;
                const tagIndex = binding.value.indexOf(addedTag);
                if (tagIndex !== -1) {
                    binding.value.filter((item) => !issueDetails.value.labelNames.includes(item))
                    // binding.value.splice(tagIndex, 1);
                }
                if (addedTag && !issueDetails.value.labelNames.includes(addedTag)) {
                    const response = await createLabels(
                        issueDetails.value.project.project_identify,
                        issueDetails.value.id,
                        {label: addedTag}
                    );
                    if (response.code === 201) {
                        await projectStore.refreshIssueDetails(
                            issueDetails.value.project.project_identify,
                            issueDetails.value.id
                        );

                        const isTagInWhitelist = tagify.settings.whitelist.includes(addedTag);
                        if (isTagInWhitelist) {
                            const tagIndex = tagify.settings.whitelist.indexOf(addedTag);
                            if (tagIndex !== -1) {
                                tagify.settings.whitelist.splice(tagIndex, 1);
                            }
                        }
                    }
                }
            };

            const handleTagRemove = async (e) => {
                const removedTag = e.detail.data.value;
                if (removedTag) {
                    if (!tagify.settings.whitelist.includes(removedTag)) {
                        tagify.settings.whitelist.push(removedTag);
                    }
                    tagify.dropdown.show.call(tagify);

                    const response = await deleteLabel(
                        issueDetails.value.project.project_identify,
                        issueDetails.value.id,
                        {label: removedTag});
                    if (response.code === 200) {
                        await projectStore.refreshIssueDetails(
                            issueDetails.value.project.project_identify,
                            issueDetails.value.id
                        );
                        await projectStore.refreshAllLabels(
                            issueDetails.value.project.project_identify,
                        );
                    }
                }
            };

            tagify.on('add', handleTagAdd);
            tagify.on('remove', handleTagRemove);
        },
    });
});
