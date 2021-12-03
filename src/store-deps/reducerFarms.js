// // import { createSlice } from "@reduxjs/toolkit";

// const initialState = Object.freeze({
//   farms: {},
// });

// const appSlice = createSlice({
//   name: 'farms',
//   initialState,
//   reducers: {
//     updateStakingInfo(state, action) {
//       console.log(state);
//       state.farms = {
//         ...state.farms,
//         [action.payload.farmKey]: {
//           ...state.farms[action.payload.farmKey],
//           stakingInfo: action.payload.stakingInfo
//         }
//       }
//     },
//     toggleBalances(state, action) {
//       state.farms = {
//         ...state.farms,
//         [action.payload]: {
//           ...state.farms[action.payload],
//           showBalances: !state.farms[action.payload].showBalances
//         }
//       }
//     },
//     toggleFarmRoi(state, action) {
//       state.farms = {
//         ...state.farms,
//         [action.payload]: {
//           ...state.farms[action.payload],
//           showROI: !state.farms[action.payload].showROI
//         }
//       }
//     },
//     setRoiDynamic(state, action) {
//       state.farms = {
//         ...state.farms,
//         [action.payload]: {
//           ...state.farms[action.payload],
//           roiDynamic: !state.farms[action.payload].roiDynamic
//         }
//       }
//     },
//     updateAddressBalances(state, action) {
//       state.balances = {
//         ...state.balances,
//         ...action.balances
//       }
//     },
//     toggleAddress(state, action) {
//       state.balances = {
//         ...state.balances,
//         [action.payload]: {
//           ...state.balances[action.payload],
//           showAddress: !state.balances[action.payload].showAddress
//         }
//       }
//     },
//   }
// });

// export const {
//   updateStakingInfo,
//   updateBalances,
//   toggleBalances,
//   toggleFarmRoi,
//   updateAddressBalances,
//   toggleAddress
// } = appSlice.actions;

// export default appSlice.reducer;