import {useProjectStore} from "~/stores/useProjectStore";
import {useAppStore} from "~/stores/useAppStore";
import {storeToRefs} from "pinia";
import vClickOutside from "click-outside-vue3";

export default defineNuxtPlugin((nuxtApp) => {
    const projectStore = useProjectStore();
    const appStore = useAppStore();
    const {memberRole, memberPermissions} = storeToRefs(projectStore);
    const {permissionsOutsideProjects} = storeToRefs(appStore);

    nuxtApp.vueApp.use(vClickOutside);

    function createCommentNode(commentText) {
        const comment = document.createComment(commentText);
        Object.defineProperty(comment, 'setAttribute', {
            value: () => undefined,
        });
        return comment;
    }

    function checkPermissions(bindingValue) {
        if (Array.isArray(bindingValue)) {
            return bindingValue.some((perm) => memberPermissions.value.includes(perm));
        } else if (typeof bindingValue === 'object') {
            if (bindingValue.location === 'in') {
                return Array.isArray(bindingValue.perms)
                    ? bindingValue.perms.some((perm) => memberPermissions.value.includes(perm))
                    : memberPermissions.value.includes(bindingValue.perms);
            } else if (bindingValue.location === 'out') {
                return Array.isArray(bindingValue.perms)
                    ? bindingValue.perms.some((perm) => permissionsOutsideProjects.value.includes(perm))
                    : permissionsOutsideProjects.value.includes(bindingValue.perms);
            }
        } else {
            return memberPermissions.value.includes(bindingValue);
        }
    }

    nuxtApp.vueApp.directive('can', {
        mounted(el, binding, vnode) {
            if (binding.arg === "not") {
                const isCanNot = ref(checkPermissions(binding.value));

                if (isCanNot.value) {
                    const comment = createCommentNode('v-can:not');
                    vnode.elm = comment;
                    vnode.text = ' ';
                    vnode.isComment = true;
                    vnode.context = undefined;
                    vnode.tag = undefined;
                    vnode.directives = undefined;

                    if (vnode.componentInstance) {
                        vnode.componentInstance.$el = comment;
                    }

                    if (el.parentNode) {
                        el.parentNode.replaceChild(comment, el);
                    }
                }
            } else {
                const isCan = ref(checkPermissions(binding.value));

                if (!isCan.value) {
                    const comment = createCommentNode('v-can');
                    vnode.elm = comment;
                    vnode.text = ' ';
                    vnode.isComment = true;
                    vnode.context = undefined;
                    vnode.tag = undefined;
                    vnode.directives = undefined;

                    if (vnode.componentInstance) {
                        vnode.componentInstance.$el = comment;
                    }

                    if (el.parentNode) {
                        el.parentNode.replaceChild(comment, el);
                    }
                }
            }
        },
    });
    nuxtApp.vueApp.directive('can-not-all', {
        mounted(el, binding, vnode) {
            const isCanNotAll = ref(false);

            for (let i = 0; i < binding.value.length; i++) {
                if (memberPermissions.value.includes(binding.value[i])) {
                    isCanNotAll.value = true;
                    break;
                }
            }

            if (isCanNotAll.value) {
                // replace HTMLElement with comment node
                const comment = document.createComment('v-can-not-all');
                Object.defineProperty(comment, 'setAttribute', {
                    value: () => undefined,
                });
                vnode.elm = comment;
                vnode.text = ' ';
                vnode.isComment = true;
                vnode.context = undefined;
                vnode.tag = undefined;
                vnode.directives = undefined;

                if (vnode.componentInstance) {
                    vnode.componentInstance.$el = comment;
                }

                if (el.parentNode) {
                    el.parentNode.replaceChild(comment, el);
                }
            }
        },
    });

    nuxtApp.vueApp.directive('role', {
        mounted(el, binding, vnode) {
            if (binding?.arg === "not") {
                if (memberRole.value.includes(binding.value)) {
                    // replace HTMLElement with comment node
                    const comment = document.createComment('v-role-not');
                    Object.defineProperty(comment, 'setAttribute', {
                        value: () => undefined,
                    });
                    vnode.elm = comment;
                    vnode.text = ' ';
                    vnode.isComment = true;
                    vnode.context = undefined;
                    vnode.tag = undefined;
                    vnode.directives = undefined;

                    if (vnode.componentInstance) {
                        vnode.componentInstance.$el = comment;
                    }

                    if (el.parentNode) {
                        el.parentNode.replaceChild(comment, el);
                    }
                }
            } else {
                if (!memberRole.value.includes(binding.value)) {
                    // replace HTMLElement with comment node
                    const comment = document.createComment('v-role');
                    Object.defineProperty(comment, 'setAttribute', {
                        value: () => undefined,
                    });
                    vnode.elm = comment;
                    vnode.text = ' ';
                    vnode.isComment = true;
                    vnode.context = undefined;
                    vnode.tag = undefined;
                    vnode.directives = undefined;

                    if (vnode.componentInstance) {
                        vnode.componentInstance.$el = comment;
                    }

                    if (el.parentNode) {
                        el.parentNode.replaceChild(comment, el);
                    }
                }
            }
        },
    });
});