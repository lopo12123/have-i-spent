import "@nutui/nutui-taro/dist/style.css";
import { createApp } from "vue";
import { Icon, Toast } from "@nutui/nutui-taro";

import "./app.scss";

const App = createApp({
    onShow() {
    },
    // 入口组件不需要实现 render 方法，即使实现了也会被 taro 所覆盖
})

App.use(Toast).use(Icon)

export default App
