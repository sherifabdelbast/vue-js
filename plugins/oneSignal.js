import {usePostData} from "~/composables/usePostData";
import {useProjectStore} from "~/stores/useProjectStore";

export default defineNuxtPlugin(async () => {
    const {oneSignalAppId} = useRuntimeConfig().public;
    const user = useUser();
    const {playerId} = usePostData();
    window.OneSignalDeferred = window.OneSignalDeferred || [];

    OneSignalDeferred.push(async function (OneSignal) {
        OneSignal.init({
            appId: oneSignalAppId,
            safari_web_id: "web.onesignal.auto.2d34c372-40ef-4eb5-956b-2d525ea9497b",
            notifyButton: {
                enable: false,
            },
            promptOptions: {
                slidedown: {
                    prompt:
                        {
                            delay: 0,
                            enabled: true, /* Required to use the Custom Link */
                            style: "button", /* Has value of 'button' or 'link' */
                            size: "medium", /* One of 'small', 'medium', or 'large' */
                            color: {
                                button: '#E12D30', /* Color of the button background if style = "button" */
                                text: '#FFFFFF', /* Color of the prompt's text */
                            },
                            text: {
                                subscribe: "Subscribe to push notifications", /* Prompt's text when not subscribed */
                                unsubscribe: "Unsubscribe from push notifications", /* Prompt's text when subscribed */
                                explanation: "Get updates from all sorts of things that matter to you", /* Optional text appearing before the prompt button */
                            },
                            unsubscribeEnabled: true, /* Controls whether the prompt is visible after subscription */
                        }
                }
            },
            allowLocalhostAsSecureOrigin: true,
            debug: true,
        }).then(async () => {
            if (user.value) {
                const player_id = OneSignal.User.PushSubscription.id;
                OneSignal.Slidedown.promptPush({force: true});

                if (OneSignal.Notifications._permission) {
                    await playerId({'player_id': player_id});
                    return;
                }

                OneSignal.Notifications.addEventListener("permissionChange", async (permission) => {
                    if (permission) {
                        await playerId({'player_id': player_id});
                    }
                });
            }
        });
    });
});