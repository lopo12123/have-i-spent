<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
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
import { get_ddMMss } from "../../scripts/day";

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

    syncRecords(parseInt(selectedValue[2]).toString(), selectedValue[0] + (parseInt(selectedValue[1]).toString()))
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
const resetRecordItem = (if_toast: boolean = true) => {
    newValue.value = ''
    newNote.value = ''

    if(if_toast) showToast({
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
        const newVal = newValue.value
        if(/^-?[0-9]+(.[0-9]+)?$/.test(newVal) && !isNaN(Number(newVal))) {
            insertOrCreate(newValue.value, newNote.value)
                .then(if_success => {
                    showToast({
                        title: if_success ? '记录成功' : '记录失败',
                        icon: 'success'
                    })
                    if(if_success) {
                        // 记录成功后清空输入区域
                        resetRecordItem(false)
                        // 记录后 更新列表
                        syncRecords(undefined, undefined, false)
                    }
                })
        }
        else {
            showToast({
                title: '错误金额',
                icon: 'error'
            })
        }
    }
}
// endregion

// region 记录展示
const recordList = ref<DayRecord>([])
const in_out = computed(() => {
    const [ i, o ] = recordList.value
        .reduce(([ prev_i, prev_o ], curr) => {
            const v = parseFloat(curr.v + '')
            return v > 0 ? [ prev_i + v, prev_o ] : [ prev_i, prev_o - v ]
        }, [ 0, 0 ])

    return [ i, o ]
})
const recordState = ref<'free' | 'block'>('free')
const syncRecords = (date?: string, ym?: string, if_toast: boolean = true) => {
    if(if_toast) showLoading({
        title: '查询中',
        mask: true,
        complete: () => {
            getMonthRecord(ym ?? getDateIdx('ym'))
                .then(records => {
                    recordList.value = records?.[date ?? getDateIdx('date')] ?? []
                    hideLoading()
                })
        }
    })
    else getMonthRecord(ym ?? getDateIdx('ym'))
        .then(records => {
            recordList.value = records?.[date ?? getDateIdx('date')] ?? []
        })
}
// endregion

onMounted(() => {
    // 进入页面自动同步一次
    syncRecords()
})
</script>

<template>
    <view class="index-page">
        <StorageInfo/>

        <view class="new-record-box">
            <NutCell class="value-box" title="金额" :desc="newValue"
                     :round-radius="0"
                     @tap="keyboardVisible = true"/>
            <NutInput class="note-box" v-model="newNote"
                      placeholder="备注(可选)"
                      show-word-limit
                      max-length="10"/>
            <view class="operate-box">
                <NutButton class="op-btn" size="small"
                           @tap="resetRecordItem">
                    重置
                </NutButton>
                <NutButton class="op-btn" size="small"
                           @tap="addNewRecord">
                    记录
                </NutButton>
            </view>
        </view>

        <view class="date-picker" @tap="calendarVisible = true">
            <text class="value">{{ showDate }} / {{ showDay }}</text>
            <text class="label">点击切换日期</text>
        </view>

        <view class="record-list">
            <view class="list-banner">
                共
                {{ recordList.length }}
                条记录 (收
                {{ in_out[0].toFixed(2) }}
                , 支
                {{ in_out[1].toFixed(2) }}
                , 合计
                {{ (in_out[0] - in_out[1]).toFixed(2) }}
                )
            </view>
            <view class="list-container">
                <view class="list-item" :key="item.t"
                      v-for="(item, idx) in recordList">
                    <text class="index">{{ idx + 1 }}</text>
                    <text class="value">{{ item.v }}</text>
                    <text class="note">{{ item.n }}</text>
                    <text class="timestamp">
                        {{ get_ddMMss(parseInt(item.t + '')) }}
                    </text>
                </view>
                <view v-if="recordList.length === 0" class="empty-text">
                    今天没花钱, 好好反思一下
                </view>
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

            .nut-cell__value {
                color: #777;
            }
        }

        .note-box {
            height: 3rem;
            padding: 13px 16px;
            border-bottom: solid 1px #eee;
            color: #777;

            .nut-input-word-limit {
                position: absolute;
                width: fit-content;
                height: 3rem;
                margin: 0;
                top: 0;
                right: 0.5rem;
                display: flex;
                align-items: center;
                justify-content: center;
            }
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
        height: calc(100% - 20rem);
        border-radius: 0.5rem;
        box-shadow: 5px 5px 5px #ddd;

        .list-banner {
            position: relative;
            width: calc(100% - 1.5rem);
            height: 1rem;
            padding: 0 0.75rem;
            color: #777;
            line-height: 1rem;
            text-align: end;
        }

        .list-container {
            position: relative;
            width: calc(100% - 1.5rem);
            padding: 0 0.75rem;
            height: calc(100% - 1rem);
            overflow: hidden auto;

            .list-item {
                position: relative;
                width: 100%;
                height: 2rem;
                border-bottom: solid 1px #eee;
                color: #333;
                display: flex;
                align-items: center;
                justify-content: space-between;

                .index {
                    width: 1rem;
                }

                .value {
                    width: 3rem;
                }

                .note {
                    width: calc(100% - 10rem);
                }

                .timestamp {
                    width: 4rem;
                    color: #777;
                    font-style: italic;
                    text-align: end;
                }
            }

            .empty-text {
                position: relative;
                width: 100%;
                height: 3rem;
                color: #7778;
                line-height: 3rem;
                text-align: center;
            }
        }
    }
}
</style>
