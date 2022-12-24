import Vue from 'vue'
import App from './App.vue'

import 'amfe-flexible';
import "@/assets/style/reset.css"

import store from './store/index.js'
import router from "@/router";


// Vant组件专区
import { Button, Tabbar, TabbarItem, Swipe, SwipeItem, Lazyload, Search, Tab, Tabs } from 'vant';
Vue.use(Tabbar);
Vue.use(TabbarItem);
Vue.use(Button);
Vue.use(Swipe);
Vue.use(SwipeItem);
Vue.use(Lazyload);
Vue.use(Search);
Vue.use(Tab);
Vue.use(Tabs);

Vue.config.productionTip = false

// 创建事件BUS
// Vue.prototype.$bus = new Vue() // event Bus 用于无关系组件间的通信。


new Vue({
    render: h => h(App),
    store,
    router
}).$mount('#app')
