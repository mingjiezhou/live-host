export class DateUtil {
    public static formatDate(date: Date, formatStr: string): string {
        var str = formatStr;
        str = str.replace(/yyyy|YYYY/,date.getFullYear().toString());
        str = str.replace(/MM/, (date.getMonth() + 1) > 9 ? (date.getMonth() + 1).toString() : '0' + (date.getMonth() + 1));
        str = str.replace(/dd|DD/, date.getDate() > 9 ? date.getDate().toString() : '0' + date.getDate());
        str = str.replace(/hh|HH/, date.getHours() > 9 ? date.getHours().toString() : '0' + date.getHours());
        str = str.replace(/mm/, date.getMinutes() > 9 ? date.getMinutes().toString() : '0' + date.getMinutes());
        str = str.replace(/ss/, date.getSeconds() > 9 ? date.getSeconds().toString() : '0' + date.getSeconds());
        return str;
    }
}