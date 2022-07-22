export default defineAppConfig({
    lazyCodeLoading: "requiredComponents",
    pages: [
        'pages/index/index',
        'pages/overview/overview',
    ],
    window: {
        backgroundTextStyle: 'light',
        navigationBarBackgroundColor: '#fff',
        navigationBarTitleText: 'WeChat',
        navigationBarTextStyle: 'black'
    },
})
