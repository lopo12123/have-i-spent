type DateTreeNode = {
    text: string
    value: string
    children?: DateTreeNode[]
}

const DayOfMonth: number[] = [
    31, 28, 31, 30,
    31, 30, 31, 31,
    30, 31, 30, 31
]

const is_prime = (year: number) => {
    return year % 4 === 0 && !(year % 100 === 0 && year % 400 !== 0)
}

/**
 * @description 生成时间树结构
 */
const generateDateTree = () => {
    const o = new Date()
    const year = o.getFullYear()
    const month = o.getMonth() + 1
    const date = o.getDate()

    const lastYear: DateTreeNode = {
        text: `${ year - 1 }年`,
        value: (year - 1).toString(),
        children: new Array(12)
            .fill(0).map((_, month_idx) => {
                return {
                    text: `${ month_idx + 1 }月`,
                    value: (month_idx + 1).toString(),
                    children: new Array(month_idx === 1
                        ? (is_prime(year - 1) ? 29 : 28)
                        : DayOfMonth[month_idx])
                        .fill(0).map((_, day_idx) => ({
                            text: `${ day_idx + 1 }日`,
                            value: (day_idx + 1).toString()
                        }))
                }
            })
    }
    const thisYear: DateTreeNode = {
        text: `${ year }年`,
        value: (year).toString(),
        children: new Array(month)
            .fill(0).map((_, month_idx) => {
                return {
                    text: `${ month_idx + 1 }月`,
                    value: (month_idx + 1).toString(),
                    children: new Array(
                        month_idx === (month - 1)
                            ? date
                            : month_idx === 1
                                ? (is_prime(year) ? 29 : 28)
                                : DayOfMonth[month_idx])
                        .fill(0).map((_, day_idx) => ({
                            text: `${ day_idx + 1 }日`,
                            value: (day_idx + 1).toString()
                        }))
                }
            })
    }

    return [ lastYear, thisYear ]
}

const get_yyyyMMdd = (t: number) => {
    const d = new Date(t)
    return `${ d.getFullYear() }-${ (d.getMonth() + 1).toString().padStart(2, '0') }-${ d.getDate().toString().padStart(2, '0') }`
}

const get_hhMMss = (t: number) => {
    const d = new Date(t)
    return `${ d.getHours().toString().padStart(2, '0') }:${ d.getMinutes().toString().padStart(2, '0') }:${ d.getSeconds().toString().padStart(2, '0') }`
}

export {
    generateDateTree,
    get_yyyyMMdd,
    get_hhMMss
}
