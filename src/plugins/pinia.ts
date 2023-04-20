import { createPinia } from 'pinia';
import { PiniaLogger, PiniaLoggerOptions } from 'pinia-logger';

const pinia = createPinia();
pinia.use(
  PiniaLogger({
    expanded: true,
  } as PiniaLoggerOptions),
);

export default pinia;
