import {createSlice, createAsyncTunk} from '@reduxjs/toolkit';
import {stakingInfo} from './staking-info';

import {ethers} from 'ethers';
import {cacheServiceInstance} from './cache-service';
import {allFarms, networks} from './constants';

export const init = createAsyncTunk('stakingInfo/init', async ()=>{
  Object.keys(allFarms).forEach((key)=>{
    const farm = allFarms[key];
    if (store.farmFilters.length === 0 || store.farmFilters.indexOf(key) > -1) {
      this.getStakingInfo(userAddress, farm.networkSymbol, farm.farmSymbol)
        .then((response)=>{
          store.farms = {
            ...store.farms,
            [key]: {
              ...store.farms[key],
              ...response
            }
          };
        });
    }
  });
  return stakingInfo.init();
})
const stakingSlice = createSlice({
  name: 'init',
  initialState: {
    farms: [],
    loading: null,
  },
  extraReducers: builder => {
    builder
      .addCase(init.pending, state => {
        state.loading = true;
      })
      .addCase(init.fulfilled, (state, action) => {
        setAll(state, action.payload);
        state.loading = false;
      })
      .addCase(init.rejected, (state, { error }) => {
        state.loading = false;
        console.error(error.name, error.message, error.stack);
      })
  },
})