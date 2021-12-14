import farms from '../farms';

const DEV_ADDRESS = '0xe88030c28d23d2120C687f49FB5cC2830F0Edb39';


const paths = {
  HOME: `/`
};

const sortFilters = [
  {
    label: 'MC',
    key: 'mc'
  },
  {
    label: 'APY',
    key: 'apy'
  },
  {
    label: 'Next Rebase',
    key: 'rebase'
  },
  {
    label: 'TVL',
    key: 'tvl'
  },
  {
    label: 'LP Liquidity',
    key: 'liquidity'
  },
  {
    label: 'Farm A-Z',
    key: 'farm'
  },
  {
    label: 'Eco A-Z',
    key: 'eco'
  }
];

const sortMap = {
  'balance': 'balances.rawTotal',
  'mc': 'data.rawMC',
  'apy': 'data.rawApy',
  'tvl': 'data.rawTVL',
  'liquidity': 'data.rawLPLiquidity',
  'rebase': 'data.nextRebaseSeconds',
  'farm': 'constants.name',
  'eco': 'networkSymbol',
};
const fiatCurrencyMap = {
  usd: {
    label: 'USD',
    address: ''
  },
  aud: {
    label: 'AUD',
    address: '0x77F9710E7d0A19669A13c055F62cd80d313dF022'
  },
  cad: {
    label: 'CAD',
    address: '0xa34317db73e77d453b1b8d04550c44d10e981c8e'
  },
  eur: {
    label: 'EUR',
    address: '0xb49f677943bc038e9857d61e7d053caa2c1734c1'
  },
  gbp: {
    label: 'GBP',
    address: '0x5c0ab2d9b5a7ed9f470386e82bb36a3613cdd4b5'
  },
  sgd: {
    label: 'SGD',
    address: '0xe25277ff4bbf9081c75ab0eb13b4a13a721f3e13'
  },
  php: {
    label: 'PHP',
    address: '0x9481e7ad8be6bbb22a8b9f7b9fb7588d1df65df6'
  },
  brl: {
    label: 'BRL',
    address: '0x971e8f1b779a5f1c36e1cd7ef44ba1cc2f5eee0f'
  }
  // eth: {
  //   label: 'ETH',
  //   address: '0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419'
  // }
}
const networks = {
  FTM: {
    symbol: 'FTM',
    name: 'Fantom',
    rpcURL: 'https://rpc.ftm.tools',
    chartURL: 'https://dexscreener.com/fantom/',
    blockRateSeconds: .89
  },
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    rpcURL: 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    chartURL: 'https://dexscreener.com/ethereum/',
    blockRateSeconds: 13.14
  },
  MATIC: {
    symbol: 'MATIC',
    name: 'Polygon',
    rpcURL: 'https://polygon-rpc.com',
    chartURL: 'https://www.defined.fi/matic/',
    blockRateSeconds: 2.26
  },
  AVAX: {
    symbol: 'AVAX',
    name: 'Avalanche',
    rpcURL: 'https://api.avax.network/ext/bc/C/rpc',
    chartURL: 'https://dexscreener.com/avalanche/',
    blockRateSeconds: 2
  },
  ONE: {
    symbol: 'ONE',
    name: 'Harmony',
    rpcURL: 'https://api.harmony.one',
    chartURL: 'https://dexscreener.com/harmony/',
    blockRateSeconds: 2
  },
  ARB: {
    symbol: 'ARB',
    name: 'Arbitrum',
    rpcURL: 'https://arb1.arbitrum.io/rpc',
    chartURL: 'https://dexscreener.com/arbitrum/',
    blockRateSeconds: 3.02
  },
  BSC: {
    symbol: 'BSC',
    name: 'Binance',
    rpcURL: 'https://bsc-dataseed.binance.org/',
    chartURL: 'https://dexscreener.com/bsc/',
    blockRateSeconds: 3.00
  },
  MOVR: {
    symbol: 'MOVR',
    name: 'Moonriver',
    rpcURL: 'https://rpc.moonriver.moonbeam.network/',
    chartURL: 'https://dexscreener.com/moonriver/',
    blockRateSeconds: 14.1
  },
  CRO: {
    symbol: 'CRO',
    name: 'Cronos',
    rpcURL: 'https://rpc.nebkas.ro/',
    chartURL: 'https://dexscreener.com/cronos/',
    blockRateSeconds: 5.5
  },
  KLAY: {
    symbol: 'KLAY',
    name: 'Klaytn',
    rpcURL: 'https://en.kronosdao.finance/',
    chartURL: 'https://dexscreener.com/cronos/',
    blockRateSeconds: 5.5
  }
};

const allFarms = Object.keys(farms)
.reduce((acc, key)=>{
  acc = {
    ...acc,
    [key]: {
      ...farms[key],
      showBalances: false,
      showROI: false,
      loading: true,
    }
  }
  return acc
}, {});

export {
  networks,
  allFarms,
  paths,
  sortFilters,
  sortMap,
  fiatCurrencyMap,
  DEV_ADDRESS
};
