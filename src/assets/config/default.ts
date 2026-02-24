import packageJson from '../../../package.json';

interface DefaultConfig {
  mode: 'developing' | 'production';
  useLogRequest: boolean;
  version: string;
  logError: {
    message: boolean;
    data: boolean;
  };
  logCronsStats: boolean;
  clusterName?: string;
}

const production = process.env.PRODUCTION === 'true';

const defaultConfig: DefaultConfig = production
  ? {
      version: packageJson.version,
      useLogRequest: false,
      logError: { message: false, data: false },
      logCronsStats: false,
      mode: 'production',
    }
  : {
      version: packageJson.version,
      useLogRequest: true,
      logError: { message: true, data: true },
      logCronsStats: false,
      mode: 'developing',
    };

export default defaultConfig;