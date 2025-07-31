import { defineNuxtPlugin } from "#app";
import PrimeVue from "primevue/config";
import Button from "primevue/button";
import Dropdown from 'primevue/dropdown';
import Menu from 'primevue/menu';
import TieredMenu from 'primevue/tieredmenu';

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use(PrimeVue, {
        ripple: true,
        zIndex: {
            modal: 1100,        //dialog, sidebar
            overlay: 2000,      //dropdown, overlaypanel
            menu: 100000,         //overlay menus
            tooltip: 1100       //tooltip
        }
    });
    nuxtApp.vueApp.component("ButtonPrime", Button);
    nuxtApp.vueApp.component("Dropdown", Dropdown);
    nuxtApp.vueApp.component("Menu", Menu);
    nuxtApp.vueApp.component("TieredMenu", TieredMenu);
});