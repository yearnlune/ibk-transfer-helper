// Styles
import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';

// Vuetify
import { createVuetify } from 'vuetify';
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg';
import { VDataTable, VDataTableServer } from 'vuetify/labs/components';

export default createVuetify({
  components: {
    VDataTableServer,
    VDataTable,
  },
  theme: {
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#B3E5FC',
          error: '#FF4D4D',
          warning: '#FFC70E',
          info: '#4781CC',
          success: '#47B267',
        },
      },
    },
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
});
