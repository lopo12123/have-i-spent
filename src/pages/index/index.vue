<script lang="ts" setup>
import { ref } from "vue";
import { Calendar } from "@nutui/nutui-taro";
import { DayRecord } from "../../scripts/store";
import StorageInfo from "../../components/StorageInfo.vue";

const calendarVisible = ref(false)
const showDate = ref(new Date().toLocaleDateString())

const records = ref<DayRecord>([])
</script>

<template>
    <view class="index-page">
        <StorageInfo/>

        <view class="date-picker">
            <Calendar v-model:visible="calendarVisible"
                      :default-value="showDate"
                      start-date="2022-01-01"
                      :end-date="new Date().toLocaleDateString()"/>
        </view>

        <view class="record-list">
            {{ records }}
        </view>
    </view>
</template>

<style lang="scss">
.index-page {
    position: relative;
    width: calc(100vw - 2rem);
    height: calc(100vh - 2rem);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;

    .date-picker {

    }

    .record-list {

    }
}
</style>
