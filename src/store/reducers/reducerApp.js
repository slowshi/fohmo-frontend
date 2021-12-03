const initialState = Object.freeze({
  addresses: [],
  addressParams: '',
  sortBy: 'mc',
  sortDirection: 'desc',
  farmFilters: [],
  showFilters: false,
  hideTotals: false,
  totalRoiDynamic: 1
});

const appReducer = (state = initialState, action) => {
  switch (action.type) {
    case "addAddress":
      return {
        ...state,
        addresses: [
          ...new Set([...state.addresses, action.payload])
        ]
      }
    case "removeAddress":
      const addressIndex = state.addresses.indexOf(action.payload);
      let addresses = state.addresses;
      if (addressIndex > -1) {
        addresses = [
          ...state.addresses.slice(0, addressIndex),
          ...state.addresses.slice(addressIndex + 1)
        ]
      }
      return {
        ...state,
        addresses
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


