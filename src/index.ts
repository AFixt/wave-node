export { WaveClient } from './wave-client';
export * from './types';

import { WaveClient } from './wave-client';
import { WaveOptions } from './types';

export function createWaveClient(options: WaveOptions): WaveClient {
  return new WaveClient(options);
}

export default WaveClient;