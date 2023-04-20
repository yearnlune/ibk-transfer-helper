import { createApp } from 'vue';

import pinia from '@/plugins/pinia';
import vuetify from '@/plugins/vuetify';
import { loadFonts } from '@/plugins/webfontloader';

import App from './App.vue';

loadFonts();

createApp(App).use(vuetify).use(pinia).mount('#app');
