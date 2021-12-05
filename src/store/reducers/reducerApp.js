const initialState = Object.freeze({
  addresses: {},
  addressParams: '',
  addressFilters: [],
  sortBy: 'mc',
  sortDirection: 'desc',
  farmFilters: [],
  showFilters: false,
  hideTotals: false,
  totalRoiDynamic: 1
});

const appReducer = (state = initialState, action) => {
  switch (action.type) {
    case "setAddresses":
      return {
        ...state,
        addresses: action.payload
      }
    case "removeAddress":
      const newAddresses = state.addresses;
      delete newAddresses[action.payload];
      return {
        ...state,
        addresses: newAddresses
      }
    case "toggleAddress":
     return {
        ...state,
        addresses: {
          ...state.addresses,
          [action.payload]: !state.addresses[action.payload]
        }
      }
    case "setAddressParams":
      return {
        ...state,
        setAddressParams: action.payload
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
    default:
    return state
  }
}

export default appReducer;


