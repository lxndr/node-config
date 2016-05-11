import {Config} from './config';
import localStorage from './providers/localStorage';
export default Config;

Config.register('localStorage', localStorage);
