<script lang="ts" setup>
import { ref } from "vue";
import { Calendar } from "@nutui/nutui-taro";
import { DayRecord } from "../../scripts/store";
import StorageInfo from "../../components/StorageInfo.vue";
import { showLoading } from "@tarojs/taro";

const weekDays = [ '星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六' ]

// 日历可见性
const calendarVisible = ref(false)
// 日历绑定日期
const showDate = ref(new Date().toLocaleDateString().replace(/\//g, '-'))
// 展示星期几
const showDay = ref(weekDays[new Date().getDay()])
// 点击日历回调 dateArray: [year, month, date, yyyy-mm-dd, day]
const setShowDate = (dateArray: string[]) => {
    console.log(dateArray)

    showDate.value = dateArray[3]
    showDay.value = dateArray[4]
    syncRecords(dateArray[0].toString() + parseInt(dateArray[1]), parseInt(dateArray[2]) + '')
}

const records = ref<DayRecord>([])
const recordState = ref<'free' | 'block'>('free')
const syncRecords = (ym: string, day: string) => {
    showLoading({
        title: `查询中`,
        mask: true,
        complete: () => {

            console.log('展示: ', ym, day)
        }
    })
}
</script>

<template>
    <view class="index-page">
        <StorageInfo/>

        <view class="date-picker" @tap="calendarVisible = true">
            <text class="value">{{ showDate }} / {{ showDay }}</text>
            <text class="label">点击切换日期</text>
        </view>

        <view class="record-list">
            {{ records }}
        </view>

        <Calendar title="选择日期"
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
    justify-content: space-evenly;

    .date-picker {
        position: relative;
        width: calc(100% - 1.5rem);
        height: 3rem;
        padding: 0 0.75rem;
        border-radius: 0.5rem;
        box-shadow: 5px 5px 5px #ddd;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .label {
            color: #777;
        }

        .value {
            color: #aaa;
        }
    }

    .record-list {

    }
}
</style>
