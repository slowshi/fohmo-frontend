import {createStore} from 'redux';
import rootReducer from './reducers/rootReducer';
import { allFarms, sortFilters } from '../utils/constants';

const searchParams = (new URL(document.location)).searchParams;
let addressParams = '';
let visible = [];
let addresses = {};
let farmFilters = ['ETH-OHM', 'AVAX-TIME', 'MATIC-KLIMA'];
let sortDirection = 'desc';
let sortBy = 'mc';
let fiatCurrency = 'usd';
if (searchParams.has('address')) {
  addressParams = searchParams.get('address');
  const currentAddresses = searchParams.get('address').split(',');
  if(searchParams.has('visible')) {
    visible = searchParams.get('visible').split(',');
    if(visible.filter((vis)=>vis !=='1' && vis!=='0').length > 0) {
      visible = currentAddresses.map((add)=>'1');
    }
  } else {
    visible = currentAddresses.map((add)=>'1');
  }
  addresses = currentAddresses.reduce((acc, address, index)=> {
    acc[address] = visible[index] === '1' ? true : false;
    return acc;
  }, {});
}
if (searchParams.has('filters')) {
  farmFilters = searchParams.get('filters').split(',');
}
if (searchParams.has('sort')) {
  sortBy = searchParams.get('sort');
  if (sortFilters.map(sortFilter=>sortFilter.key).indexOf(sortBy) === -1 && sortBy !== 'balance') {
    sortBy = 'mc';
  }
}
if (searchParams.has('dir')) {
  sortDirection = searchParams.get('dir');
}
if (searchParams.has('currency')) {
  fiatCurrency = searchParams.get('currency');
}
const validFarmFilters = Object.keys(allFarms);
const diff = farmFilters.filter((i) => !validFarmFilters.includes(i));
if (diff.length > 0) {
  addressParams = '';
  addresses = [];
  farmFilters = ['ETH-OHM', 'AVAX-TIME', 'MATIC-KLIMA'];
  window.history.replaceState(null, null,'/');
}
const store = createStore(rootReducer,
{
  app: {
    addresses,
    addressParams,
    sortBy,
    sortDirection,
    farmFilters,
    fiatCurrency,
    showFilters: false,
    hideTotals: false,
    totalRoiDynamic: 1
  },
  farms: allFarms,
  balances: {}
});


export default store;