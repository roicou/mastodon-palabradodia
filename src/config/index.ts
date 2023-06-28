import dotenv from 'dotenv';
const envFound = dotenv.config();
if (envFound.error) {
    // This error should crash whole process
    throw new Error("Couldn't find .env file");
}
export default {
    /**
     * debug
     */
    debug: process.env.DEBUG == 'true',
    /**
     * cron hour
     */
    cronHour: process.env.CRON_HOUR || 18,
    /**
     * time zone
     */
    timezone: process.env.TIMEZONE || 'Europe/Madrid',
    
    /**
     * mastodon config
     */
    mastodon: {
        client_key: process.env.MASTODON_CLIENT_KEY,
        client_secret: process.env.MASTODON_CLIENT_SECRET,
        access_token: process.env.MASTODON_ACCESS_TOKEN,
        api_url: process.env.MASTODON_API_URL,
    },
    
    /**
     * logs config
     */
    logs: {
        log_path: process.env.LOG_PATH || "logs",
        compress_before_days: process.env.COMPRESS_BEFORE_DAYS || 3,
        cron_hour: process.env.CRON_HOUR || 3
    },
}