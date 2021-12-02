import {createStore} from 'redux';
import { allFarms } from './constants';
const initialState = Object.freeze({
  address: '',
  addressParam: '',
  sortBy: '',
  sortDirection: true,
  accountInfo: [],
  farmFilters: [],
  farms: {},
  showFilters: false,
  hideTotals: false,
  totalRoiDynamic: 1
});

const appReducer = (state = initialState, action) => {
  switch (action.type) {
    case "setAddress":
      return {
        ...state,
        address: action.payload
      }
    case "setAddressParam":
      return {
        ...state,
        addressParam: action.payload
      }
    case "setTotalRoiDynamic":
      return {
        ...state,
        totalRoiDynamic: action.payload
      }
    case "setAccountInfo":
      return {
        ...state,
        address: action.payload
      }
    case "setFarmFilters":
      return {
        ...state,
        farmFilters: action.payload
      }
    case "setHideTotals":
      return {
        ...state,
        hideTotals: action.payload
      }
    case "setShowFilters":
      return {
        ...state,
        showFilters: action.payload
      }
    case "setSortBy":
      return {
        ...state,
        sortBy: action.payload
      }
    case "setSortDirection":
      return {
        ...state,
        sortDirection: action.payload
      }
    case "udpateFarm":
      return {
        ...state,
        farms: {
          ...state.farms,
          [action.payload.farmKey]: {
            ...state.farms[action.payload.farmKey],
            ...action.payload.farm
          }
        }
      }
    case "toggleFarmBalance":
      return {
        ...state,
        farms: {
          ...state.farms,
          [action.payload]: {
            ...state.farms[action.payload],
            showBalances: !state.farms[action.payload].showBalances
          }
        }
      }
    case "toggleFarmROI":
      return {
        ...state,
        farms: {
          ...state.farms,
          [action.payload]: {
            ...state.farms[action.payload],
            showROI: !state.farms[action.payload].showROI
          }
        }
      }
    case "setRoiDynamic":
      return {
        ...state,
        farms: {
          ...state.farms,
          [action.payload.farmKey]: {
            ...state.farms[action.payload.farmKey],
            roiDynamic: action.payload.roiDynamic
          }
        }
      }
    default:
    return state
  }
}

const searchParams = (new URL(document.location)).searchParams;
let addressParam = '';
let farmFilters = ['ETH-OHM'];
let sortDirection = 'desc';
let sortBy = 'balance';

if (searchParams.has('address')) {
  if (searchParams.has('filters')) {
    farmFilters = searchParams.get('filters').split(',');
  }
  if (searchParams.has('sort')) {
    sortBy = searchParams.get('sort');
  }
  if (searchParams.has('dir')) {
    sortDirection = searchParams.get('dir');
  }
  addressParam = searchParams.get('address');
  const validFarmFilters = Object.keys(allFarms);
  const diff = farmFilters.filter((i) => !validFarmFilters.includes(i));
  if (diff.length > 0) {
    addressParam = '';
    farmFilters = [];
    window.history.replaceState(null, null,'/');
  }
}

const store = createStore(appReducer, {
  address: addressParam,
  addressParam,
  validated: false,
  accountInfo: [],
  sortDirection,
  farmFilters,
  sortBy,
  showFilters: false,
  hideTotals: false,
  farms: allFarms,
  totalRoiDynamic: 1
})

export {
  store
}