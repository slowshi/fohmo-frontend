const initialState = Object.freeze({
  farms: {},
});

const farmReducer = (state = initialState, action) => {
  switch (action.type) {
    case "updateStakingInfo":
      return {
        ...state,
        [action.payload.farmKey]: {
          ...state[action.payload.farmKey],
          ...action.payload.stakingInfo
        }
      }
    case "toggleFarmBalance":
      return {
        ...state,
        [action.payload]: {
          ...state[action.payload],
          showBalances: !state.farms[action.payload].showBalances
        }
      }
    case "toggleFarmROI":
      return {
        ...state,
        [action.payload]: {
          ...state[action.payload],
          showROI: !state.farms[action.payload].showROI
        }
      }
    case "setRoiDynamic":
      return {
        ...state,
        [action.payload.farmKey]: {
          ...state[action.payload.farmKey],
          roiDynamic: action.payload.roiDynamic
        }
      }
    default:
    return state
  }
}

export default farmReducer;