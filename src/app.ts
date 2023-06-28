import logger from '@/libs/logger';
import loaders from '@/loaders';
void (async function () {
    logger.info(`Starting application`);
    logger.debug(`Debug mode enabled`);
    try {
        await loaders();
        logger.info(`Application started`);
    } catch (err) {
        logger.error(err);
    }
})();
