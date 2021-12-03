const initialState = {
  balances: {}
};
/*
  {
    '0xper': {
      'ETH-OHM': {
        stuff,
        loading
      }
    }
  }

*/
const balancesReducer = (state = initialState, action) => {
  switch (action.type) {
    case "updateAddressBalance":
      if(typeof state[action.payload.farmKey] === 'undefined') {
        state = {
          ...state,
          [action.payload.farmKey]: {}
        }
      }
      if(typeof state[action.payload.farmKey][action.payload.address] === 'undefined') {
        state = {
          ...state,
          [action.payload.farmKey]: {
            [action.payload.address]: null
          }
        }
      }
      return {
        ...state,
        [action.payload.farmKey]: {
          ...state[action.payload.farmKey],
          [action.payload.address]: {
            ...state[action.payload.farmKey][action.payload.address],
            ...action.payload.balance
          }
        }
      }
    case "toggleAddress":
      return {
        ...state,
        [action.payload.address]: {
          ...state[action.payload.address],
          [state[action.payload.address][action.payload.farmKey]]: {
            ...state[action.payload.address][action.payload.farmKey],
            showAddress: !state[action.payload.address][action.payload.farmKey].showAddress
          }
        }
      }
    default:
    return state
  }
}

export default balancesReducer;