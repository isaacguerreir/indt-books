import Vue from 'vue';
import Router from 'vue-router';
import Authors from '@/components/Authors';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Authors',
      component: Authors,
    },
  ],
});
