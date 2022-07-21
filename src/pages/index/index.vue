<script lang="ts" setup>
import { ref } from "vue";
import { Calendar } from "@nutui/nutui-taro";
import { DayRecord } from "../../scripts/store";
import StorageInfo from "../../components/StorageInfo.vue";

const calendarVisible = ref(false)
const showDate = ref(new Date().toLocaleDateString().replace(/\//g, '-'))
const setShowDate = (dateArray: string[]) => {
    showDate.value = dateArray[3]
    console.log(dateArray)
}

const records = ref<DayRecord>([])
</script>

<template>
    <view class="index-page">
        <StorageInfo/>

        <view class="date-picker" @tap="calendarVisible = true">
            <text class="label">当前</text>
            <text class="value">{{ showDate }}</text>
        </view>

        <view class="record-list">
            {{ records }}
        </view>

        <Calendar title="选择日期查看明细"
                  v-model:visible="calendarVisible"
                  :is-auto-back-fill="true"
                  :default-value="showDate"
                  start-date="2022-01-01"
                  :end-date="new Date().toLocaleDateString().replace(/\//g, '-')"
                  @close="calendarVisible = false"
                  @choose="setShowDate"/>
    </view>
</template>

<style lang="scss">
.index-page {
    position: relative;
    width: calc(100vw - 2rem);
    height: calc(100vh - 2rem);
    padding: 1rem;
    font-size: 0.75rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;

    .date-picker {
        position: relative;
        width: 100%;
        height: 3rem;
        box-shadow: 5px 5px 5px #ddd;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .record-list {

    }
}
</style>
