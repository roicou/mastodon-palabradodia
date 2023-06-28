import { DateTime, Settings } from "luxon";
import config from "@/config";
Settings.defaultZone = config.timezone;
import axios from "axios";
import { JSDOM } from "jsdom";
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
        const url = `${this.BASE_URL}${word}/`;
        const dictionaryDom = new JSDOM(await axios.get(url).then(res => res.data));
        const definition = dictionaryDom.window.document.querySelector('.palabra-do-dia-definition').textContent.replace(/^\s+/g, '').replace(/\s+$/g, '');
        if(!definition.length){
            throw new Error('No definition from portal das palabras');
        }
        return {
            word,
            url,
            definition
        }
    }
}
export default new PortaldaspalabrasService();