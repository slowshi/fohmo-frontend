import {createStore} from 'redux';
import rootReducer from './reducers/rootReducer';
import { allFarms } from '../utils/constants';
import {sortFilters} from '../utils/constants';

const searchParams = (new URL(document.location)).searchParams;
let addressParams = '';
let addresses = {};
let farmFilters = ['ETH-OHM', 'AVAX-TIME', 'MATIC-KLIMA'];
let sortDirection = 'desc';
let sortBy = 'mc';
if (searchParams.has('address')) {
  addressParams = searchParams.get('address');
  addresses = searchParams.get('address').split(',').reduce((acc, address)=>{
    acc[address] = true;
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
    showFilters: false,
    hideTotals: false,
    totalRoiDynamic: 1
  },
  farms: allFarms,
  balances: {}
});


export default store;