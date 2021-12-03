// import { createSlice } from "@reduxjs/toolkit";

// const initialState = {
//   addresses: [],
//   addressParams: '',
//   sortBy: 'mc',
//   sortDirection: 'desc',
//   farmFilters: [],
//   showFilters: false,
//   hideTotals: false,
//   totalRoiDynamic: 1
// };

// const appSlice = createSlice({
//   name: 'app',
//   initialState,
//   reducers: {
//     addAddress(state, action) {
//       state.addresses = [
//         ...new Set([...state.addresses, action.payload])
//       ]
//     },
//     removeAddress(state, action) {
//       const addressIndex = state.addresses.indexOf(action.payload);
//       if (addressIndex > -1) {
//         state.addresses = [
//           ...state.addresses.slice(0, addressIndex),
//           ...state.addresses.slice(addressIndex + 1)
//         ]
//       }
//     },
//     setAddressParams(state, action) {
//       state.addressParams = action.payload;
//     },
//     setSortBy(state, action) {
//       state.sortBy = action.payload;
//     },
//     setSortDirection(state, action) {
//       state.sortDirection = action.payload;
//     },
//     addFarmFilter(state, action) {
//       state.farmFilters = [
//         ...new Set([...state.farmFilters, action.payload])
//       ]
//     },
//     removeFarmFilter(state, action) {
//       const farmFilterIndex = state.farmFilters.indexOf(action.payload);
//       if (farmFilterIndex > -1) {
//         state.farmFilters = [
//           ...state.farmFilters.slice(0, farmFilterIndex),
//           ...state.farmFilters.slice(farmFilterIndex + 1)
//         ]
//       }
//     },
//     setShowFilters(state, action) {
//       state.showFilters = action.payload;
//     },
//     setHideTotals(state, action) {
//       state.hideTotals = action.payload;
//     },
//     setTotalRoiDynamic(state, action) {
//       state.totalRoiDynamic = action.payload;
//     }
//   }
// });

// export const {
//   addAddress,
//   removeAddress,
//   setSortBy,
//   setSortDirection,
//   addFarmFilter,
//   removeFarmFilter,
//   setShowFilters,
//   setHideTotals,
//   setTotalRoiDynamic
// } = appSlice.actions;

// export default appSlice.reducer;