import {createStore} from 'redux';
import rootReducer from './reducers/rootReducer';
import { allFarms } from '../utils/constants';

const searchParams = (new URL(document.location)).searchParams;
let addressParams = '';
let addresses = [];
let farmFilters = ['ETH-OHM'];
let sortDirection = 'desc';
let sortBy = 'desc';
if (searchParams.has('address')) {
  console.log(searchParams);
  addressParams = searchParams.get('address');
  addresses = searchParams.get('address').split(',');
}
if (searchParams.has('filters')) {
  farmFilters = searchParams.get('filters').split(',');
}
if (searchParams.has('sort')) {
  sortBy = searchParams.get('sort');
}
if (searchParams.has('dir')) {
  sortDirection = searchParams.get('dir');
}
const validFarmFilters = Object.keys(allFarms);
const diff = farmFilters.filter((i) => !validFarmFilters.includes(i));
if (diff.length > 0) {
  addressParams = '';
  addresses = [];
  farmFilters = [];
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