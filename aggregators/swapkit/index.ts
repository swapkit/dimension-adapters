/**
 * DeFiLlama dimension adapter for SwapKit Bridge Aggregators dashboard.
 * Copy to: DefiLlama/dimension-adapters/bridge-aggregators/swapkit/index.ts
 *
 * Test: npm test bridge-aggregators swapkit
 */
import { Adapter, FetchOptions, FetchResultV2, FetchV2 } from "../../adapters/types";
import { CHAIN } from "../../helpers/chains";
import { httpGet } from "../../utils/fetchURL";

const DEFILLAMA_DAILY_VOLUME_URL = "https://api.swapkit.dev/auth/defillama/dailyVolume";

// The api serves DeFiLlama chain slugs directly as breakdownByChain keys, so the
// adapter just needs the list of chains it reports. Keep in sync with api-v2's
// SWAPKIT_TO_DEFILLAMA_CHAIN_MAP values.
const chains = [
  // EVM
  CHAIN.ETHEREUM, CHAIN.ARBITRUM, CHAIN.AVAX, CHAIN.BASE, CHAIN.BSC,
  CHAIN.OPTIMISM, CHAIN.POLYGON, CHAIN.AURORA, CHAIN.BERACHAIN, CHAIN.XDAI,
  CHAIN.XLAYER, CHAIN.MONAD, CHAIN.CRONOS,
  // UTXO
  CHAIN.BITCOIN, CHAIN.BITCOIN_CASH, CHAIN.LITECOIN, CHAIN.DOGE, CHAIN.DASH, CHAIN.ZEC,
  // Cosmos
  CHAIN.THORCHAIN, CHAIN.MAYA, CHAIN.COSMOS, CHAIN.KUJIRA,
  // Other L1s
  CHAIN.SOLANA, CHAIN.CARDANO, CHAIN.POLKADOT, CHAIN.RIPPLE, CHAIN.TRON,
  CHAIN.NEAR, CHAIN.SUI, CHAIN.TON, CHAIN.RADIXDLT, CHAIN.STARKNET,
  // Chainflip
  CHAIN.CHAINFLIP,
];



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
  adapter: Object.fromEntries(chains.map((chain) => [chain, { fetch }])),
  prefetch,
};

export default adapter;
