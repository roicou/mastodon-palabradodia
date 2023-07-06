import { DateTime, Settings } from "luxon";
import config from "@/config";
Settings.defaultZone = config.timezone;
import axios from "axios";
import { JSDOM } from "jsdom";
import { getLinkPreview } from "link-preview-js";
import logger from "@/libs/logger";
class PortaldaspalabrasService {
    private readonly BASE_URL = 'https://portaldaspalabras.gal/lexico/palabra-do-dia/';
    public async getWord() {
        const today = DateTime.local().toISODate();
        const response = await axios.postForm(this.BASE_URL, { 
            orde: 'data', 
            'data-do': today, 
            'data-ao': today
        });
        if (!response.data) {
            throw new Error('No data from portal das palabras');
        }
        const html = response.data.replace(/\n/g, '');
        const wordOfDayDom = new JSDOM(html);
        const word = wordOfDayDom.window.document.querySelector('.title').textContent;
        const wordNormalize = word.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
        const url = `${this.BASE_URL}${wordNormalize}/`;
        const dictionaryDom = new JSDOM(await axios.get(url).then(res => res.data));
        const definition = dictionaryDom.window.document.querySelector('.palabra-do-dia-definition').textContent.replace(/^\s+/g, '').replace(/\s+$/g, '');
        if(!definition.length){
            throw new Error('No definition from portal das palabras');
        }
        let link_preview = await getLinkPreview(url).catch((error) => {
            logger.error(error);
            return null;
        });
        if(link_preview.images?.length) {
            link_preview = link_preview.images[0];
        }
        return {
            word,
            url,
            definition,
            link_preview
        }
    }
}
export default new PortaldaspalabrasService();