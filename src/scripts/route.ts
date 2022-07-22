import { navigateTo } from "@tarojs/taro";

export type ValidPageName = 'index' | 'overview'

const Mapper: { [k in ValidPageName]: string } = {
    index: '/pages/index/index',
    overview: '/pages/overview/overview',
}

export const jumpTo = (pageName: ValidPageName) => {
    return navigateTo({
        url: Mapper[pageName]
    })
}
