<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import { List as NutList } from "@nutui/nutui-taro";
import { getAllRecord, SingleRecord, YMDRecords } from "../../scripts/store";
import { get_hhMMss } from "../../scripts/day";

type OptionalItem = { [value: string]: boolean }

// region 筛选查看
// 全部数据
const allRecords = ref<YMDRecords[]>([])
// 可选年份
const optional_years = ref<OptionalItem>({})
// 可选月份
const optional_months = ref<OptionalItem>({})
// 可选日期
const optional_dates = ref<OptionalItem>({})
// 展示数据
const recordList = ref<SingleRecord[]>([])
// 统计
const in_out = computed(() => {
    const [ i, o ] = recordList.value
        .reduce(([ prev_i, prev_o ], curr) => {
            const v = parseFloat(curr.v + '')
            return v > 0 ? [ prev_i + v, prev_o ] : [ prev_i, prev_o - v ]
        }, [ 0, 0 ])

    return [ i, o ]
})
// 初始化可选项列表
const initOptionItems = () => {
    return new Promise(resolve => {
        getAllRecord()
            .then(ymd_records => {
                allRecords.value = ymd_records
                const [ years, months, dates ]: { [k: string]: boolean }[] = [ {}, {}, {} ]
                ymd_records.forEach(({ year, month, date }) => {
                    years[year] = true
                    months[month] = true
                    dates[date] = true
                })
                optional_years.value = years
                optional_months.value = months
                optional_dates.value = dates

                resolve(true)
            })
    })
}
// 全选 全不选 快捷操作
const doOperate = (selectAll: boolean) => {
    for (let year in optional_years.value) {
        optional_years.value[year] = selectAll
    }
    for (let month in optional_months.value) {
        optional_months.value[month] = selectAll
    }
    for (let date in optional_dates.value) {
        optional_dates.value[date] = selectAll
    }
    doFilter()
}
// 筛选
const doFilter = () => {
    const _all: YMDRecords[] = JSON.parse(JSON.stringify(allRecords.value))
    const filteredYears = Object.keys(optional_years.value).filter(y => optional_years.value[y])
    const filteredMonths = Object.keys(optional_months.value).filter(m => optional_months.value[m])
    const filteredDates = Object.keys(optional_dates.value).filter(d => optional_dates.value[d])

    recordList.value = _all
        .filter(ymd => {
            return filteredYears.includes(ymd.year + '') && filteredMonths.includes(ymd.month + '') && filteredDates.includes(ymd.date + '')
        })
        .map(ymd => ymd.records)
        .flat(1)
}
// endregion

onMounted(() => {
    initOptionItems()
        .then(() => {
            doFilter()
        })
})
</script>

<template>
    <view class="output-page">
        <view class="filter-box">
            <view class="filter-title">
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
            <view class="pick-box">
                <text class="label">选择年</text>
                <scroll-view class="item-box" :scroll-x="true">
                    <view :class="if_select ? 'active' : 'default'"
                          v-for="(if_select, year) in optional_years" :key="`year-${year}`"
                          @tap="optional_years[year] = !if_select">
                        {{ year }}年
                    </view>
                </scroll-view>
            </view>
            <view class="pick-box">
                <text class="label">选择月</text>
                <scroll-view class="item-box" :scroll-x="true">
                    <view :class="if_select ? 'active' : 'default'"
                          v-for="(if_select, month) in optional_months" :key="`month-${month}`"
                          @tap="optional_months[month] = !if_select">
                        {{ month }}月
                    </view>
                </scroll-view>
            </view>
            <view class="pick-box">
                <text class="label">选择日</text>
                <scroll-view class="item-box" :scroll-x="true">
                    <view :class="if_select ? 'active' : 'default'"
                          v-for="(if_select, date) in optional_dates" :key="`date-${date}`"
                          @tap="optional_dates[date] = !if_select">
                        {{ date }}日
                    </view>
                </scroll-view>
            </view>
            <view class="operate-box">
                <view class="operate-btn none" @tap="doOperate(false)">全不选</view>
                <view class="operate-btn all" @tap="doOperate(true)">全选</view>
                <view class="operate-btn confirm" @tap="doFilter">按条件筛选</view>
            </view>
        </view>

        <view class="list-or-note">
            <NutList v-if="recordList.length > 0"
                     class="infinite-list"
                     style="height: 100%"
                     :height="32"
                     :list-data="recordList">
                <template v-slot="{index, item}">
                    <view class="list-row">
                        <text class="index">{{ index + 1 }}</text>
                        <text class="value">{{ item.v }}</text>
                        <text class="note">{{ item.n }}</text>
                        <text class="timestamp">
                            {{ get_hhMMss(parseInt(item.t + '')) }}
                        </text>
                    </view>
                </template>
            </NutList>
            <view v-if="recordList.length === 0" class="empty-text">
                这段时间没花钱, 好好反思一下
            </view>
        </view>
    </view>
</template>

<style lang="scss">
.output-page {
    position: relative;
    width: calc(100vw - 2rem);
    height: calc(100vh - 2rem);
    padding: 1rem;
    font-size: 0.75rem;
    color: #333;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly;

    // 11rem
    .filter-box {
        position: relative;
        width: calc(100% - 1rem);
        height: 10rem;
        padding: 0.5rem;
        border-radius: 0.5rem;
        box-shadow: 5px 5px 5px #ddd;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;

        .filter-title {
            position: relative;
            width: 100%;
            height: 1rem;
            color: #777;
            line-height: 1rem;
        }

        .operate-box {
            position: relative;
            width: 100%;
            height: 2rem;
            display: flex;
            align-items: center;
            justify-content: flex-start;

            .operate-btn {
                position: relative;
                width: fit-content;
                height: 1.5rem;
                padding: 0 14px;
                border-radius: 0.75rem;
                box-sizing: border-box;
                display: flex;
                align-items: center;
                justify-content: center;

                &:not(:last-child) {
                    margin-right: 0.5rem;
                }
            }

            .none {
                border: solid 1px #777c;
                color: #777;
            }

            .all {
                border: solid 1px #ffa70dcc;
                color: #ffa70d;
            }

            .confirm {
                border: solid 1px #00cd65cc;
                color: #00cd65;
            }
        }

        .pick-box {
            position: relative;
            width: 100%;
            height: 2rem;
            display: flex;
            align-items: center;
            justify-content: space-between;

            .label {
                position: relative;
                width: 3rem;
            }

            .item-box {
                position: relative;
                width: calc(100% - 3rem);
                height: 1.5rem;
                white-space: nowrap;

                %pick-item {
                    position: relative;
                    width: fit-content;
                    height: 1.5rem;
                    padding: 0 14px;
                    border-radius: 0.75rem;
                    line-height: 1.5rem;
                    display: inline-block;

                    &:not(:last-child) {
                        margin-right: 8px;
                    }
                }

                .active {
                    @extend %pick-item;
                    background-color: #00cd65cc;
                    color: #fff;
                }

                .default {
                    @extend %pick-item;
                    background-color: #f0f0f0;
                    color: #212121;
                }
            }

            .range-box {
                position: relative;
                width: calc(100% - 3rem);
                height: 1.5rem;
                white-space: nowrap;
                display: flex;
                align-items: center;
                justify-content: flex-start;
            }
        }
    }

    .list-or-note {
        position: relative;
        width: calc(100% - 1rem);
        height: calc(100% - 14rem);
        padding: 0.5rem;
        border-radius: 0.5rem;
        box-shadow: 5px 5px 5px #ddd;

        .infinite-list {
            position: relative;
            width: 100%;
            height: 100%;

            .nut-list-item {
                margin: 0;
                border-bottom: solid 1px #eee;
            }

            .list-row {
                position: relative;
                width: 100%;
                height: 100%;
                color: #333;
                display: flex;
                align-items: center;
                justify-content: space-evenly;


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
                }
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
</style>
