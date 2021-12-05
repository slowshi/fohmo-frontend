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
          showBalances: !state[action.payload].showBalances
        }
      }
    case "toggleFarmROI":
      return {
        ...state,
        [action.payload]: {
          ...state[action.payload],
          showROI: !state[action.payload].showROI
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