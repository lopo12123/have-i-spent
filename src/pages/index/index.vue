<script lang="ts" setup>
import { ref } from "vue";
import { Button as NutButton, Calendar, Cell as NutCell, NumberKeyboard, Input as NutInput } from "@nutui/nutui-taro";
import { DayRecord, getMonthRecord } from "../../scripts/store";
import StorageInfo from "../../components/StorageInfo.vue";
import { hideLoading, showLoading, showToast } from "@tarojs/taro";

// region 日期选择器
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
// endregion

// region 金额 备注 重置 记录
// 键盘可见性
const keyboardVisible = ref(false)
// 金额
const newValue = ref('')
// 备注
const newNote = ref('')
// 重置
const resetRecordItem = () => {
    newValue.value = ''
    newNote.value = ''
    showToast({
        title: '重置成功',
        icon: 'success'
    })
}
// 记录
const addNewRecord = () => {
    if(newValue.value === '') {
        showToast({
            title: '金额为空',
            icon: 'error'
        })
    }
    else {
        console.log(`添加新纪录: ${ newValue.value }, ${ newNote.value }`)
    }
}
// endregion

const recordList = ref<DayRecord>([])
const recordState = ref<'free' | 'block'>('free')
const syncRecords = (ym: string, day: string) => {
    showLoading({
        title: `查询中`,
        mask: true,
        complete: () => {
            getMonthRecord(ym)
                .then(records => {
                    recordList.value = records?.[day] ?? []
                    hideLoading()
                })
            console.log('展示: ', ym, day)
        }
    })
}
</script>

<template>
    <view class="index-page">
        <StorageInfo/>

        <view class="new-record-box">
            <NutCell class="value-box" title="金额" :desc="newValue"
                     :round-radius="0"
                     @click="keyboardVisible = true"/>
            <NutInput class="note-box" v-model="newNote"
                      placeholder="备注(可选)"/>
            <view class="operate-box">
                <NutButton class="op-btn" size="small"
                           @click="resetRecordItem">
                    重置
                </NutButton>
                <NutButton class="op-btn" size="small"
                           @click="addNewRecord">
                    记录
                </NutButton>
            </view>
        </view>

        <view class="date-picker" @tap="calendarVisible = true">
            <text class="value">{{ showDate }} / {{ showDay }}</text>
            <text class="label">点击切换日期</text>
        </view>

        <view class="record-list">
            {{ recordList }}
        </view>

        <NumberKeyboard
            type="rightColumn"
            confirm-text="确认"
            v-model:visible="keyboardVisible"
            v-model:value="newValue"
            :custom-key="['-', '.']"
            @close="keyboardVisible = false"/>

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

    // 5rem
    // StorageInfo

    // 9rem
    .new-record-box {
        position: relative;
        width: 100%;
        height: 9rem;
        border-radius: 0.5rem;
        box-shadow: 5px 5px 5px #ddd;

        .value-box {
            height: 3rem;
            margin: 0;
            box-shadow: none;
            border-bottom: solid 1px #eee;
            color: #777;
        }

        .note-box {
            height: 3rem;
            padding: 13px 16px;
            border-bottom: solid 1px #eee;
            color: #777;
        }

        .operate-box {
            position: relative;
            width: 100%;
            height: 3rem;
            display: flex;
            align-items: center;
            justify-content: space-evenly;

            .op-btn {
                width: 30%;
            }
        }
    }

    // 3rem
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
        position: relative;
        width: 100%;
        height: calc(100% - 27rem);
        border-radius: 0.5rem;
        box-shadow: 5px 5px 5px #ddd;
    }
}
</style>
