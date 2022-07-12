/* 
 * Copyright 2022 Hewlett Packard Enterprise Development LP. 
 */

import Vue from 'vue'
import vuetify from '@/plugins/vuetify' // path to vuetify export
import Vuex from 'vuex'
import Buefy from 'buefy'
import VueCookies from 'vue-cookies'
import App from './App.vue'
import router from './router'
import 'buefy/dist/buefy.css'
import MenuIcon from 'vue-material-design-icons/Menu.vue';
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import '@mdi/font/css/materialdesignicons.css'
import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/vue-loading.css';

Vue.component('loading-overlay', Loading);
Vue.use(Buefy);
Vue.use(Vuex);
Vue.use(VueCookies);
Vue.component('menu-icon', MenuIcon);

/*const store = new Vuex.Store({
  state: {

  }
})*/

Vue.config.productionTip = false;

new Vue({
  vuetify,
  router,
  render: h => h(App),
}).$mount('#app')
