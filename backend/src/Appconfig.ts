import { AwsEnvs, MongooseConfig, SecretsProvider } from "aws-lambda-helper";
import { NetworkedConfig, ValidationUtils } from "ferrum-plumbing";

export const SUPPORTED_CHAINS_FOR_CONFIG = [
    'ETHEREUM', 'BSC', 'POLYGON', 
    // 'AVAX',
    'RINKEBY', 'BSC_TESTNET', 'MUMBAI_TESTNET', 'AVAX_TESTNET','MOON_MOONBASE','AVAX_MAINNET',
    'MOON_MOONRIVER','HARMONY_TESTNET_0',"FTM_TESTNET","FTM_MAINNET","SHIDEN_TESTNET",
    ];

require('dotenv').config()

export interface WithJwtRandomBaseConfig {
    jwtRandomBase: string;
}

export interface WithDatabaseConfig {
    database: MongooseConfig,
}

export interface WithKmsConfig {
    cmkKeyId: string,
}

/**
 * Configuratio for the app.
 * Examples:
 * const c = AppConfig.instance();
 * (await c.fromSecret('CHAIN_CLIENTS')).
 *   .orElse(() => return ({
 *     ETHEREUM: AppConfig.fromEnv('ETHEREUM_ENDPOINT'),
 *   }))
 *   .required<Web3EndpointConfig>(c => ({
 *      'Eth Endpoint required': c.ETHEREUM,
 *   }))
 *   .get<Web3EndpointConfig>();
 */
export class AppConfig {
    private static _instance: AppConfig;
    static instance() {
        if (!AppConfig._instance) {
            AppConfig._instance = new AppConfig();
        }
        return AppConfig._instance;
    }

    static env(e: string, def?: string): string|undefined {
        if (e) {
            return process.env[e] || def;
        }
    }

    static awsRegion(): string {
        return (
        process.env.AWS_REGION ||
        process.env[AwsEnvs.AWS_DEFAULT_REGION] ||
        "us-east-2"
        );
    }

    private conf: any = {};

    get<T>(field?: string): T {
        if (field) {
            return this.conf[field] as T;
        }
        return this.conf as T;
    }

    async fromSecret(
        field: string,
        secretSuffix: string,
    ) {
      const region = AppConfig.awsRegion();
      const confArn = process.env[AwsEnvs.AWS_SECRET_ARN_PREFIX + secretSuffix];
        if (confArn) {
            const conf = await new SecretsProvider(region, confArn).get();
            if (!!field) {
                this.conf[field] = {
                    ...(this.conf[field] || {}),
                    ...conf
                };
            } else {
                this.conf = {
                    ...this.conf,
                    ...conf,
                };
            }
        }
        return this;
    }

    async forChainProviders(field?: string, supportedChains?: string[]) {
        return (await this.fromSecret(field || 'providers', 'CHAIN_CONFIG'))
            .orElse(field || 'providers', () => {
                const v: any = {};
                (supportedChains ||SUPPORTED_CHAINS_FOR_CONFIG).forEach(c => {
                    v[c] = process.env['WEB3_PROVIDER_' + c];
                });
                return v;
            });
    }

    getChainProviders(field?: string): NetworkedConfig<string> {
        return this.get<NetworkedConfig<string>>(field || 'providers');
    }

    orElse(field: string, setter: () => any) {
        const res = setter();
        if (field) {
            this.conf[field] = {
                ...res,
                ...(this.conf[field] || {}),
            };
        } else {
            this.conf = {
                ...res,
                ...this.conf,
            };
        }
        return this;
    }

    set(field: string, setter: () => any) {
        const res = setter();
        if (field) {
            this.conf[field] = {
                ...(this.conf[field] || {}),
                ...res,
            };
        } else {
            this.conf = {
                ...this.conf,
                ...res,
            };
        }
        return this;
    }

    required<T>(field: string, selector: (c: T) => any) {
        const res = selector(field ? this.conf[field] : this.conf);
        Object.keys(res).forEach(k => {
            ValidationUtils.isTrue(res[k] !== undefined, k);
        });
        return this;
    }

    chainsRequired(field: string, chains: string[]) {
        return this.required<NetworkedConfig<string>>(field || 'providers', c => {
            const rv = {} as any;
            chains.forEach(c => {
                rv[c] = ((field ? this.conf[field] : this.conf['providers']) || {})[c];
            });
            return rv;
        })
    }
}