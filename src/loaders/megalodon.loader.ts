import megalodonService from "@/services/megalodon.service";
import config from '@/config';
import generator, { MegalodonInterface } from 'megalodon'
import logger from "@/libs/logger";
// import node cron
// import { DateTime } from "luxon";
import { CronJob } from "cron";

export default async () => {
    // service to send posts
    const client: MegalodonInterface = generator('mastodon', config.mastodon.api_url, config.mastodon.access_token);
    logger.info(`
        ################################################
        #          Megalodon client loaded             #
        ################################################
    `);
    await megalodonService.startClient(client);
    // cron everyday at 18:00

    new CronJob(`0 ${config.cronHour} * * *`, async () => {
        try {
            await megalodonService.publishWord();
        } catch (error) {
            logger.error(error);
        }
    }, null, true, config.timezone);

}

