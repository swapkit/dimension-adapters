/**
 * DeFiLlama dimension adapter for SwapKit Bridge Aggregators dashboard.
 * Copy to: DefiLlama/dimension-adapters/bridge-aggregators/swapkit/index.ts
 *
 * Test: npm test bridge-aggregators swapkit
 */
import { Adapter, FetchOptions, FetchResultV2, FetchV2 } from "../../adapters/types";
import { CHAIN } from "../../helpers/chains";
import { httpGet } from "../../utils/fetchURL";

const DEFILLAMA_DAILY_VOLUME_URL = "http://localhost:3000/defillama/dailyVolume";

const SwapKitChains: Partial<Record<string, string>> = {
  [CHAIN.ETHEREUM]: "ethereum",
  [CHAIN.ARBITRUM]: "arbitrum",
  [CHAIN.AVAX]: "avalanche",
  [CHAIN.BASE]: "base",
  [CHAIN.BSC]: "bsc",
  [CHAIN.OPTIMISM]: "optimism",
  [CHAIN.POLYGON]: "polygon",
  [CHAIN.BITCOIN]: "bitcoin",
  [CHAIN.THORCHAIN]: "thorchain",
  [CHAIN.SOLANA]: "solana",
  [CHAIN.XDAI]: "gnosis",
  [CHAIN.LINEA]: "linea",
  [CHAIN.SONIC]: "sonic",
  [CHAIN.TRON]: "tron",
  [CHAIN.TON]: "ton",
  [CHAIN.SUI]: "sui",
  [CHAIN.XRPL]: "ripple",
  [CHAIN.MAYA]: "mayachain",
  [CHAIN.COSMOS]: "cosmos",
};



const fetch: FetchV2 = async (options: FetchOptions) => {
  const prefetchedChainData = options.preFetchedResults[options.chain];
  if(!prefetchedChainData) {
    return { dailyBridgeVolume: null };
  }

  const dayData = prefetchedChainData.find((d) => {
    return options.dateString === d.date;
  });

 
  return { dailyBridgeVolume: dayData?.volume || 0 };
};

const prefetch = async (_: FetchOptions): Promise<FetchResultV2> => {
  const response = await httpGet(`${DEFILLAMA_DAILY_VOLUME_URL}?date=${_.dateString}`);
  const resultsByChain: Record<string, any> = {};

  for (const day of response) {
    const buckets = Object.keys(day.breakdownByChain);    
    for (const bucket of buckets) {
      if (!resultsByChain[bucket]) {
        resultsByChain[bucket] = [];
      }
      resultsByChain[bucket].push({date: new Date(day.timestamp * 1000).toISOString().split("T")[0], volume: day.breakdownByChain[bucket]});
    }
  }

  return resultsByChain;
};


const adapter: Adapter = {
  version: 2,
  adapter: Object.fromEntries(Object.keys(SwapKitChains).map((chain) => [chain, { fetch }])),
  prefetch,
};

export default adapter;
