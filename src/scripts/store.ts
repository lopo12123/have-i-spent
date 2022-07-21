import { clearStorage, getStorage, removeStorage, setStorage } from "@tarojs/taro";

// region Types of Records
/**
 * @description single record
 */
export type SingleRecord = {
    /**
     * @description timestamp
     */
    t: number
    /**
     * @description value
     */
    v: number
    /**
     * @description note
     */
    n: string
}
/**
 * @description records of a day
 */
export type DayRecord = SingleRecord[]
/**
 * @description records of a month
 */
export type MonthRecord = { [day: number]: DayRecord } | null
/**
 * @description records of a year
 */
export type YearRecord = MonthRecord[]
// endregion

/**
 * @description return a number or string for idx usage
 * @param type use type
 */
const getDateIdx = (type: 'date' | 'month' | 'year' | 'ym'): string => {
    const d = new Date()

    switch(type) {
        case 'date':
            return d.getDate().toString()
        case 'month':
            return (d.getMonth() + 1).toString()
        case 'year':
            return d.getFullYear().toString()
        case 'ym':
            return d.getFullYear().toString() + (d.getMonth() + 1).toString()
    }
}

/**
 * @description Get specific month`s records
 * @param ym `YYYYM[M]` year and month(1-12): like `20227` or `202211`
 * @return MonthRecord It will always be `resolve`, then the target does not exist or some error occur. just simply return `null`
 */
const getMonthRecord = (ym?: string) => {
    return new Promise<MonthRecord>(resolve => {
        getStorage({
            key: ym ?? getDateIdx('ym')
        })
            .then(({ data }) => {
                resolve(data)
            })
            .catch(() => {
                resolve(null)
            })
    })
}

/**
 * @description Get specific year`s records
 * @param year `YYYY` year
 * @return YearRecord It will always return an array of length 12 representing 12 months of records
 */
const getYearRecord = (year?: string) => {
    const month_in_year: Promise<MonthRecord>[] = []

    for (let i = 1; i <= 12; i++) {
        month_in_year.push(getMonthRecord((year ?? getDateIdx('year')) + i))
    }

    return new Promise<YearRecord>((resolve, reject) => {
        Promise
            .all(month_in_year)
            .then(month_records => {
                resolve(month_records)
            })
            .catch(reject)
    })
}

/**
 * @description insert a new record into storage
 * @param v value
 * @param n note
 * @return boolean if success
 */
const insertOrCreate = (v: number, n: string = '') => {
    const new_record: SingleRecord = { t: Date.now(), v, n }

    return new Promise<boolean>(resolve => {
        getMonthRecord()
            .then(month_record => {
                return setStorage({
                    key: getDateIdx('ym'),
                    data: {
                        // null or other, both works well
                        ...month_record,
                        [getDateIdx('date')]: [
                            ...(month_record?.[getDateIdx('date')] ?? []),
                            new_record
                        ]
                    }
                })
            })
            .then(() => {
                resolve(true)
            })
            .catch(() => {
                resolve(false)
            })
    })
}

/**
 * @description remove records of some months
 * @param yms ym(year and month(1-12))s
 */
const clearMonthRecords = (yms: string[]) => {
    if(yms.length === 0) return Promise.resolve(true)
    else {
        const clear_calls = yms.map(ym => removeStorage({ key: ym }))
        return new Promise<boolean>(resolve => {
            Promise.all(clear_calls)
                .then(() => {
                    resolve(true)
                })
                .catch(() => {
                    resolve(false)
                })
        })
    }
}

/**
 * @description remove records of some years
 * @param years years
 */
const clearYearRecords = (years: string[]) => {
    if(years.length === 0) return Promise.resolve(true)
    else {
        const clear_calls = years.map(ym => removeStorage({ key: ym }))
        return new Promise<boolean>(resolve => {
            Promise.all(clear_calls)
                .then(() => {
                    resolve(true)
                })
                .catch(() => {
                    resolve(false)
                })
        })
    }
}

/**
 * @description remove all records stored locally
 */
const clearAllRecords = () => {
    return new Promise(resolve => {
        clearStorage()
            .then(() => {
                resolve(true)
            })
            .catch(() => {
                resolve(false)
            })
    })
}

export {
    getMonthRecord,
    getYearRecord,
    insertOrCreate,
    clearMonthRecords,
    clearYearRecords,
    clearAllRecords
}