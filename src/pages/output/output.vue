<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { getAllRecord, YMDRecords } from "../../scripts/store";

type OptionalItem = {
    value: string
    if_select: boolean
}

// region 筛选查看
// 总览面板状态: 初始化 计算中 空闲
const overviewStatus = ref<'init' | 'calc' | 'free'>('init')
// 可选年份
const optional_years = ref<OptionalItem[]>([])
// 可选月份
const optional_months = ref<OptionalItem[]>([])
// 可选日期
const optional_dates = ref<OptionalItem[]>([])
// 全部数据
const allRecords = ref<YMDRecords[]>([])
// 展示数据
const listRecords = ref<any[]>([])
// 初始化可选项列表
const initOptionItems = () => {
    getAllRecord()
        .then(ymd_records => {
            const [ years, months, dates ]: Set<string>[] = [ new Set(), new Set(), new Set() ]
            ymd_records.forEach(({ year, month, date }) => {
                years.add(year)
                months.add(month)
                dates.add(date)
            })
            optional_years.value = [ ...years ]
            optional_months.value = [ ...months ]
            optional_dates.value = [ ...dates ]
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
            years: {{ optional_years }} <br>
            months: {{ optional_months }} <br>
            dates: {{ optional_dates }} <br>
        </view>
    </view>
</template>

<style lang="scss" scoped>
.output-page {
    position: relative;
    width: 100%;
    height: 100%;
}
</style>