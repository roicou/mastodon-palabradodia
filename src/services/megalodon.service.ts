import { MegalodonInterface } from "megalodon";
import logger from "@/libs/logger";
import portaldaspalabrasService from "./portaldaspalabras.service";
import { DateTime } from "luxon";
import fs from "fs";
import axios from "axios";
import { debug } from "console";
import {uuid} from "uuidv4";
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
                const {message, link_preview, word} = await this.getWord();
                logger.info('Message:\n', message)
                logger.debug('link_preview', link_preview)
                const media_name = uuid() + '.jpg';
                // download link_preview
                const media_stream = await axios({
                    method: 'get',
                    url: link_preview,
                    responseType: 'stream'
                }).then(function (response) {
                    response.data.pipe(fs.createWriteStream(`./media/${media_name}`));
                    return fs.createReadStream(`./media/${media_name}`);
                });
                logger.debug('downloaded')
                const media = await this.client.uploadMedia(media_stream, { description: 'Miniatura da web coa palabra ' + word });
                logger.debug('media', media.data?.id)
                const options: any = { visibility: 'public' };
                if(media.data?.id) {
                    options.media_ids = [media.data.id];
                }
                logger.debug('options', options)
                await this.client.postStatus(message, options );
                sended = true;
                fs.rmSync(`./media/${media_name}`);
            } catch (error) {
                logger.error(error);
            }
            tryCount++;
            await new Promise(resolve => setTimeout(resolve, 10000));
        }
    }

    private async getWord() {
        const { word, url, definition, link_preview } = await portaldaspalabrasService.getWord();
        const emoji = this.book_emojis[Math.floor(Math.random() * this.book_emojis.length)];
        //first to uppercase
        const wordUppercase = word.charAt(0).toUpperCase() + word.slice(1);
        const message = `${emoji} ${wordUppercase}\n\n${definition}\n#palabradodía #galego #portaldaspalabras\n${url}`;
        return {message, link_preview, word}
    }


    // await this.client.postStatus(message, {
    //     scheduled_at: DateTime.local().plus({ minutes: 1 }).toISO()
    // });


}
export default new MegalodonService();