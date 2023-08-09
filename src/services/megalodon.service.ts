import { MegalodonInterface } from "megalodon";
import logger from "@/libs/logger";
import portaldaspalabrasService from "./portaldaspalabras.service";
import { DateTime } from "luxon";
import fs from "fs";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';

class MegalodonService {
    private client: MegalodonInterface;
    /**
     * Start the client
     * @param client 
     */
    public async startClient(client: MegalodonInterface) {
        this.client = client;
    }
    private readonly book_emojis = ['📖', '📚', '📕', '📗', '📘', '📙', '📔', '📓', '📒',]
    public async publishWord() {
        let sended = false;
        let tryCount = 0;
        while (!sended && tryCount < 5) {
            try {
                const { message, link_preview, word } = await this.getWord();
                logger.info('word:', message);
                logger.info('link_preview:', link_preview)
                const media_name = uuidv4() + '.jpg';
                // download link_preview
                logger.info('Downloading media...')
                const media_stream = await axios({
                    method: 'get',
                    url: link_preview,
                    responseType: 'stream'
                }).then(function (response) {
                    response.data.pipe(fs.createWriteStream(`./media/${media_name}`));
                    return fs.createReadStream(`./media/${media_name}`);
                });
                logger.info('Downloaded')
                await new Promise(resolve => setTimeout(resolve, 5000));
                const options: any = { visibility: 'public' };
                let tryUploadCount = 0;
                let uploaded = false;
                while (!uploaded && tryUploadCount < 5) {
                    logger.info('Trying to upload media...');
                    try {
                        const media = await this.client.uploadMedia(media_stream /*`./media/${media_name}`*/, { description: 'Miniatura da web coa palabra ' + word });
                        logger.debug('media', media.data?.id)
                        if (media.data?.id) {
                            options.media_ids = [media.data.id];
                        }
                        uploaded = true;
                        logger.info('Media uploaded')
                    } catch (err) {
                        logger.error('error uploading media:', err);
                    }
                    tryUploadCount++;
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
                logger.debug('options', options)
                logger.info('Message:\n', message);
                await this.client.postStatus(message, options);
                sended = true;
                logger.info('Message sended')
                logger.info('Deleting media')
                try{
                    fs.rmSync(`./media/${media_name}`);
                    logger.info('Media deleted')
                } catch(error) {
                    logger.error('error deleting media', error);
                }
            } catch (error) {
                logger.error(error);
            }
            tryCount++;
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }

    private async getWord() {
        const { word, url, definition, link_preview } = await portaldaspalabrasService.getWord();
        const emoji = this.book_emojis[Math.floor(Math.random() * this.book_emojis.length)];
        //first to uppercase
        const wordUppercase = word.charAt(0).toUpperCase() + word.slice(1);
        const message = `${emoji} ${wordUppercase}\n\n${definition}\n#palabradodía #galego #portaldaspalabras\n${url}`;
        return { message, link_preview, word }
    }


    // await this.client.postStatus(message, {
    //     scheduled_at: DateTime.local().plus({ minutes: 1 }).toISO()
    // });


}
export default new MegalodonService();