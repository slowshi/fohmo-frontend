import {createStore} from 'redux';
import { allFarms } from './constants';
const initialState = Object.freeze({
  address: '',
  addressParam: '',
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
if (searchParams.has('address')) {
  if (searchParams.has('filters')) {
    farmFilters = searchParams.get('filters').split(',');
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
  farmFilters,
  showFilters: false,
  hideTotals: false,
  farms: allFarms,
  totalRoiDynamic: 1
})

export {
  store
}