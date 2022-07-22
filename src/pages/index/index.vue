<script lang="ts" setup>
import { onMounted, ref } from "vue";
import {
    Button as NutButton,
    Cell as NutCell,
    NumberKeyboard,
    Input as NutInput,
    DatePicker
} from "@nutui/nutui-taro";
import { DayRecord, getDateIdx, getMonthRecord, insertOrCreate } from "../../scripts/store";
import StorageInfo from "../../components/StorageInfo.vue";
import { hideLoading, showLoading, showToast } from "@tarojs/taro";

// region 日期选择器 级联
const weekDays = [ '星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六' ]
const defaultDate = new Date()
// 可见性
const calendarVisible = ref(false)
// 日历绑定日期
const showDate = ref(new Date().toLocaleDateString().replace(/\//g, '-'))
// 展示星期几
const showDay = ref(weekDays[new Date().getDay()])
// 确认选择
const confirmPick = (pickObj) => {
    const { selectedOptions, selectedValue } = pickObj

    showDate.value = selectedOptions
        .map(option => option.value)
        .join('-')
    showDay.value = weekDays[new Date(showDate.value).getDay()]

    syncRecords(selectedValue[0] + (parseInt(selectedValue[1]).toString()), parseInt(selectedValue[2]).toString())
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
        insertOrCreate(newValue.value, newNote.value)
            .then(if_success => {
                if(if_success) resetRecordItem()
                showToast({
                    title: if_success ? '记录成功' : '记录失败',
                    icon: 'success'
                })
            })
    }
}
// endregion

// region 记录展示
const recordList = ref<DayRecord>([])
const recordState = ref<'free' | 'block'>('free')
const syncRecords = (ym: string, date: string) => {
    showLoading({
        title: '查询中',
        mask: true,
        complete: () => {
            getMonthRecord(ym)
                .then(records => {
                    recordList.value = records?.[date] ?? []
                    hideLoading()
                })
        }
    })
}
// endregion

onMounted(() => {
    // 进入页面自动同步一次
    syncRecords(getDateIdx('ym'), getDateIdx('date'))
})
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
            <view class="list-title">表头</view>
            <view class="list-items">
                列表 {{ recordList }}
            </view>
        </view>

        <NumberKeyboard
            type="rightColumn"
            confirm-text="确认"
            v-model:visible="keyboardVisible"
            v-model:value="newValue"
            :custom-key="['-', '.']"
            @close="keyboardVisible = false"/>

        <DatePicker
            v-model="defaultDate"
            v-model:visible="calendarVisible"
            :is-show-chinese="true"
            :min-date="new Date(new Date().getFullYear() - 1, 0, 1)"
            :max-date="new Date()"
            @confirm="confirmPick"/>
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
        width: calc(100% - 1.5rem);
        height: calc(100% - 27rem);
        padding: 0 0.75rem;
        border-radius: 0.5rem;
        box-shadow: 5px 5px 5px #ddd;
    }
}
</style>
