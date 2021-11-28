import allFarms from '../farms';

const DEV_ADDRESS = '0xe88030c28d23d2120C687f49FB5cC2830F0Edb39';


const paths = {
  HOME: `/`
};

const networks = {
  FTM: {
    symbol: 'FTM',
    name: 'Fantom',
    rpcURL: 'https://rpc.ftm.tools',
    chartURL: 'https://dexscreener.com/fantom/',
    blockRateSeconds: .88
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
    blockRateSeconds: 2.17
  },
  AVAX: {
    symbol: 'AVAX',
    name: 'Avalanche',
    rpcURL: 'https://api.avax.network/ext/bc/C/rpc',
    chartURL: 'https://dexscreener.com/avalanche/',
    blockRateSeconds: 0.7
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
    blockRateSeconds: 3.53
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
    rpcURL: 'https://en.kronosdao.finance',
    chartURL: 'https://dexscreener.com/cronos/',
    blockRateSeconds: 5.5
  }
};

export {
  networks,
  allFarms,
  paths,
  DEV_ADDRESS
};
