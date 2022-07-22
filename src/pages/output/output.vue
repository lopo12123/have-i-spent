<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { getAllRecord, YMDRecords } from "../../scripts/store";

type OptionalItem = { [value: string]: boolean }

// region 筛选查看
// 总览面板状态: 初始化 计算中 空闲
const overviewStatus = ref<'init' | 'calc' | 'free'>('init')
// 可选年份
const optional_years = ref<OptionalItem>({})
// 可选月份
const optional_months = ref<OptionalItem>({})
// 可选日期
const optional_dates = ref<OptionalItem>({})
// 全部数据
const allRecords = ref<YMDRecords[]>([])
// 展示数据
const listRecords = ref<any[]>([])
// 初始化可选项列表
const initOptionItems = () => {
    getAllRecord()
        .then(ymd_records => {
            const [ years, months, dates ]: { [k: string]: boolean }[] = [ {}, {}, {} ]
            ymd_records.forEach(({ year, month, date }) => {
                years[year] = true
                months[month] = true
                dates[date] = true
            })
            optional_years.value = years
            optional_months.value = months
            optional_dates.value = dates
        })
}
// endregion

onMounted(() => {
    initOptionItems()
})
</script>

<template>
    <view class="output-page">
        <view class="filter-box">
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
        </view>

        <view class="overview-box">
            years: {{ optional_years }} <br>
            months: {{ optional_months }} <br>
            dates: {{ optional_dates }} <br>
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
    justify-content: flex-start;

    .filter-box {
        position: relative;
        width: 100%;
        height: 6rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;

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
                outline: solid 1px #ccc;
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
                    background-color: #00cd65;
                    color: #fff;
                }

                .default {
                    @extend %pick-item;
                    background-color: #f0f0f0;
                    color: #212121;
                }
            }
        }
    }
}
</style>