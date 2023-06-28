import winston from 'winston';
import config from '@/config';
import { DateTime, Settings } from 'luxon';
Settings.defaultZone = 'Europe/Madrid';
import 'winston-daily-rotate-file';
import path from 'path';

const printf = winston.format.printf(info => {
    const symbols: any = Object.getOwnPropertySymbols(info);
    if (symbols.length == 2 && Array.isArray(info[symbols[1]])) {
        info.message += " " + info[symbols[1]].map((str: any) => (typeof str === 'object') ? JSON.stringify(str, null, 2) : str).join(" ");
    }
    if (info.level.indexOf("error") > -1) {
        return `${DateTime.local().toFormat('yyyy-MM-dd HH:mm:ss')} ${info.level}: ${info.message}${(info.stack ? `\n${info.stack}` : '')}`;
    }
    return `${DateTime.local().toFormat('yyyy-MM-dd HH:mm:ss')} ${info.level}: ${info.message}`;
});

const format_log = winston.format.combine(
    winston.format.errors({
        stack: true,
        metadata: true
    }),
    winston.format.timestamp({
        //format: 'YYYY-MM-DD HH:mm:ss',
        format: () => {
            return DateTime.local().toFormat('yyyy-MM-dd HH:mm:ss');
        }
    }),
    printf
);

const format_display = winston.format.combine(
    winston.format.errors({
        stack: true,
        metadata: true
    }),
    winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.colorize({
        all: true
    }),
    printf
)
const transport_all = new winston.transports.DailyRotateFile({
    filename: path.join(process.cwd(), config.logs.log_path, '%DATE%-error.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    // zippedArchive: true,
});

const transport_error = new winston.transports.DailyRotateFile({
    filename: path.join(process.cwd(), config.logs.log_path, '%DATE%-all.log'),
    // filename: '%DATE%-app.log',
    datePattern: 'YYYY-MM-DD',
    // zippedArchive: true
});


const transports = [];
transports.push(
    new winston.transports.Console({
        format: format_display
    })
);
if (!config.debug) {
    transports.push(transport_all, transport_error);
    // create transport for debug

    transport_all.on('rotate', () => {
        // do something fun
    });
    transport_error.on('rotate', () => {
        // do something fun
    });
}
// new winston.transports.File({
//     filename: `${config.logs.log_path}/${DateTime.local().toFormat('yyyy-MM-dd_HHmmss')}-error.log`,
//     level: 'error'
// }),
// new winston.transports.File({
//     filename: `${config.logs.log_path}/${DateTime.local().toFormat('yyyy-MM-dd_HHmmss')}-all.log`,
// }),


const logger = winston.createLogger({
    level: config.debug ? 'debug' : 'info',
    format: format_log,
    transports
});


export default logger;