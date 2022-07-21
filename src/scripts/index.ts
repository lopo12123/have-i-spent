import { navigateTo } from "@tarojs/taro";

export type ValidPageName = 'index' | 'output'

const Mapper: { [k in ValidPageName]: string } = {
    index: '/pages/index/index',
    output: '/pages/output/output',
}

export const jumpTo = (pageName: ValidPageName) => {
    return navigateTo({
        url: Mapper[pageName]
    })
}