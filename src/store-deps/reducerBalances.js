// // import { createSlice } from "@reduxjs/toolkit";

// const initialState = {
//   balances: {}
// };

// const appSlice = createSlice({
//   name: 'balances',
//   initialState,
//   reducers: {
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
//   updateAddressBalances,
//   toggleAddress
// } = appSlice.actions;

// // export default appSlice.reducer;