<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import { getStorageInfo, showToast } from "@tarojs/taro";
import { Button as NutButton, CircleProgress } from "@nutui/nutui-taro";
import { jumpTo } from "../scripts/route";

type DetectStateEnum = 'free' | 'block'
type StorageInfoType = {
    used: string
    total: string
    percent: number
}

const detectState = ref<DetectStateEnum>('free')
const storageInfo = ref<StorageInfoType>({
    used: '-',
    total: '-',
    percent: 0
})
const progressColor = computed(() => {
    const p = storageInfo.value.percent
    if(p < 70) return '#00800080'
    else if(p < 90) return '#ffa50080'
    else return '#ff000080'
})
const syncStorageInfo = (if_toast: boolean = false) => {
    if(detectState.value === 'block') {
        showToast({
            title: '正在同步',
            icon: 'loading',
            duration: 2000
        })
    }
    else {
        detectState.value = 'block'
        getStorageInfo()
            .then((infos) => {
                // ! .d.ts有问题, 这里只能这样了
                const { currentSize, limitSize } = infos as unknown as { currentSize: number, limitSize: number }
                storageInfo.value.used = currentSize < 1024 ? `${ currentSize.toFixed(2) }KB` : `${ (currentSize / 1024).toFixed(2) }MB`
                storageInfo.value.total = limitSize < 1024 ? `${ limitSize.toFixed(2) }KB` : `${ (limitSize / 1024).toFixed(2) }MB`
                storageInfo.value.percent = parseFloat((currentSize * 100 / limitSize).toFixed(2))
                detectState.value = 'free'

                if(if_toast) showToast({
                    title: '同步成功',
                    icon: 'success',
                    duration: 2000
                })
            })
            .catch(() => {
                detectState.value = 'free'

                if(if_toast) showToast({
                    title: '同步失败',
                    icon: 'error',
                    duration: 2000
                })
            })
    }
}

onMounted(() => {
    syncStorageInfo()
})
</script>

<template>
    <view class="storage-info">
        <view class="progress-of-usage">
            <CircleProgress
                :progress="storageInfo.percent"
                :color="progressColor"
                radius="32" stroke-width="10"/>
        </view>
        <view class="text-of-usage">
            <text>存储空间占用</text>
            <text>已使用: {{ storageInfo.used }}</text>
            <text>总可用: {{ storageInfo.total }}</text>
        </view>
        <view class="operate-buttons">
            <NutButton size="mini" @tap="syncStorageInfo(true)">
                {{ detectState === 'free' ? '重新检测' : '检测中 . .' }}
            </NutButton>
            <NutButton size="mini" @tap="jumpTo('overview')">记录查询</NutButton>
        </view>
    </view>
</template>

<style lang="scss">
.storage-info {
    position: relative;
    width: 100%;
    height: 5rem;
    border-radius: 0.5rem;
    color: #777;
    box-shadow: 5px 5px 5px #ddd;
    display: flex;
    align-items: center;
    justify-content: space-evenly;

    .progress-of-usage {
        position: relative;
        width: 4rem;
        height: 4rem;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .nut-circleprogress-text {
            font-size: 0.75rem;
        }
    }

    .text-of-usage {
        position: relative;
        width: calc(100% - 12rem);
        height: 4rem;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: space-evenly;
    }

    .operate-buttons {
        position: relative;
        width: 5rem;
        height: 4rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-evenly;
    }
}
</style>
