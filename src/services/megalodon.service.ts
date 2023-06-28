import { MegalodonInterface } from "megalodon";
import logger from "@/libs/logger";
import portaldaspalabrasService from "./portaldaspalabras.service";
import { DateTime } from "luxon";

class MegalodonService {
    private client: MegalodonInterface;
    /**
     * Start the client
     * @param client 
     */
    public async startClient(client: MegalodonInterface) {
        this.client = client;
    }

    public async publishWord() {
        let sended = false;
        let tryCount = 0;
        while (!sended && tryCount < 5) {
            try {
                const message = await this.getWord();
                logger.info('Message:\n', message)
                await this.client.postStatus(message, { scheduled_at: DateTime.local().plus({ seconds: 10 }).toISO() });
                sended = true;
            } catch (error) {
                logger.error(error);
            }
            tryCount++;
            await new Promise(resolve => setTimeout(resolve, 10000));
        }
    }

    private async getWord() {
        const { word, url, definition } = await portaldaspalabrasService.getWord();
        //first to uppercase
        const wordUppercase = word.charAt(0).toUpperCase() + word.slice(1);
        const message = `📖 ${wordUppercase}\n${definition}\n#palabradodía #galego #portaldaspalabras\n${url}`;
        return message
    }


    // await this.client.postStatus(message, {
    //     scheduled_at: DateTime.local().plus({ minutes: 1 }).toISO()
    // });


}
export default new MegalodonService();