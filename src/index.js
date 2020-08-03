import dayjs from 'dayjs'
import solar2lunar from './lunar'

const each = (n, cb) => {
    return Array.from({ length: n }, (_, index) => {
        cb && cb(index)
        return index
    })
}
// const weekCode = each(7)
const week = ['日', '一', '二', '三', '四', '五', '六']
const events = {
    change: []
}

class Calendar {
    constructor (opt) {
        this.opt = {
            firstDayOfWeek: 0,
            ...opt
        }
        if (typeof this.opt.firstDayOfWeek === 'number' && this.opt.firstDayOfWeek < 7 && this.opt.firstDayOfWeek >= 0) {
            //
        } else {
            this.opt.firstDayOfWeek = 0
        }
        // 当前选中的日期
        this.currentDay = dayjs()
    }

    // 生成一个月的所有日期
    genDaysTable () {
        // 设置当前选中日期的农历信息
        const { $y, $M, $D } = this.currentDay
        this.currentDay.lunarCalendar = solar2lunar($y, $M + 1, $D)

        // 本月天数
        const daysInMonth = this.currentDay.daysInMonth()
        const list = each(daysInMonth).map(i => this.currentDay.date(i + 1))

        // 补充上个月的天数
        let prevMonthDays = this.currentDay.date(1).day() - this.opt.firstDayOfWeek
        if (prevMonthDays < 0) prevMonthDays += 7
        each(prevMonthDays, i => {
            const day = this.currentDay.date(1).subtract(i + 1, 'day')
            list.unshift(day)
        })

        // 补充下个月的天数
        let nextMonthDays = this.opt.firstDayOfWeek - 1 - this.currentDay.date(daysInMonth).day()
        if (nextMonthDays < 0) nextMonthDays += 7
        each(nextMonthDays, i => {
            const day = this.currentDay.date(daysInMonth).add(i + 1, 'day')
            list.push(day)
        })

        // 农历
        list.forEach(item => {
            item.lunarCalendar = solar2lunar(item.$y, item.$M + 1, item.$D)
        })

        // 按周分组
        return each(list.length / 7).map(i => list.slice(i * 7, i * 7 + 7))
    }

    // 获取星期
    getWeeks () {
        return week.concat(week).splice(this.opt.firstDayOfWeek, 7)
    }

    // 设置日期
    setDate (day) {
        this.currentDay = dayjs(day)
        this.trigger('change')
    }

    // 设置年份
    setYear (year) {
        const fn = {
            [year]: date => date.year(year),
            '-1': date => date.subtract(1, 'year'),
            1: date => date.add(1, 'year')
        }[year]
        this.currentDay = fn(this.currentDay)
        this.trigger('change')
    }

    // 设置月份
    setMonth (month) {
        const fn = {
            [month]: date => date.month(month),
            '-1': date => date.subtract(1, 'month'),
            1: date => date.add(1, 'month')
        }[month]
        this.currentDay = fn(this.currentDay)
        this.trigger('change')
    }

    // 绑定事件
    on (eventName, cb) {
        if (typeof cb === 'function') events[eventName].push(cb)
    }

    // 触发事件
    trigger (eventName) {
        (events[eventName] || []).forEach(cb => cb())
    }
}

export default Calendar
