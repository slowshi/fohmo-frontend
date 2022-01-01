import {ethers} from 'ethers';
import {cacheEthers} from './cacheEthersService';
import {allFarms, networks, fiatCurrencyMap} from './constants';
import {abi as IERC20Abi} from '../abis/IERC20.json';
import {abi as CauldronAbi} from '../abis/Cauldron.json';
import {abi as PairContractAbi} from '../abis/PairContract.json';
import {abi as StakingAbi} from '../abis/Staking.json';
import {abi as StakingTokenAbi} from '../abis/StakingToken.json';
import {abi as BondContractAbi} from '../abis/BondContract.json';
import {abi as CurrencyAbi} from '../abis/Currency.json';
import {abi as TreasuryAbi} from '../abis/Treasury.json';
import {abi as wsOHMPoolAbi} from '../abis/wsOHMPool.json';
import store from '../store/store';
import { getFarm } from './farmDecorator';

/* eslint-disable */

/**
 *
 * Get raw data from contracts to put into store
 * @class StakingInfo
 */
class StakingInfo {
  /**
   *
   *
   * @param {String} userAddress
   * @return {Array}
   */
  async init(clearCache=false) {
    const state = store.getState();
    const currencyConversion = await this.getCurrencyConversion(state.app.fiatCurrency, clearCache);
    store.dispatch({
      type: 'setCurrencyConversion',
      payload: currencyConversion
    });
    let balancePromises = [];
    Object.keys(allFarms).forEach((key)=> {
      const farm = allFarms[key];
      const stateFarm = state.farms[key];
      if (state.app.farmFilters.length === 0 || state.app.farmFilters.indexOf(key) > -1) {
        store.dispatch({
          type: 'updateStakingInfo',
          payload: {
            farmKey: key,
            stakingInfo: {
              loading: true
            }
          }
        });
        store.dispatch({
          type: 'clearBalances',
          payload: null
        });
        this.doGetStakingInfo(farm.networkSymbol, farm.farmSymbol, clearCache);
      }
    });
  }
  async doGetStakingInfo(networkSymbol, farmSymbol, clearCache) {
    const state = store.getState();
    const key = `${networkSymbol}-${farmSymbol}`;
    const stateFarm = state.farms[key];
    const currencyConversion = state.app.currencyConversion;
    const fiatCurrency = state.app.fiatCurrency;
    return this.getStakingInfo(networkSymbol, farmSymbol, currencyConversion, clearCache)
    .then(async (res)=>{
      const balancePromises = Object.keys(state.app.addresses)
      .map((address)=>{
        return this.getBalances(address, networkSymbol, farmSymbol, clearCache)
      })
      const balances = await Promise.all(balancePromises);
      const balanceMap = balances.reduce((acc, balance)=>{
        store.dispatch({
          type: 'updateAddressBalance',
          payload: {
            farmKey: key,
            address: balance.userAddress,
            balance: balance.data
          }
        });
        acc[balance.userAddress] = balance.data;
        return acc;
      },{});
      const treasuryBalance = await this.getTreasury(res.networkSymbol, res.farmSymbol, clearCache)
      store.dispatch(
        {
          type: 'updateStakingInfo',
          payload: {
            farmKey: `${res.networkSymbol}-${res.farmSymbol}`,
            stakingInfo: {
              ...getFarm({...stateFarm, data: res.data}, balanceMap, state.app.addresses, fiatCurrency),
              treasuryBalance,
              loading: false
            },
          }
        }
      );
    });
  }
  async getCurrentIndex(stakingContract, key, indexRatio=1, clearCache=false) {
    let rawCurrentIndex = await cacheEthers.contractCall(
      stakingContract,
      'index',
      [],
      clearCache
    );
    let currentIndex = await cacheEthers.contractCall(
      stakingContract,
      'index',
      [],
      clearCache
    );
    currentIndex = Number(ethers.utils.formatUnits(currentIndex, 'gwei') / indexRatio).toFixed(2);
    if (key === 'BSC-META' || key === 'BSC-GYRO') {
      rawCurrentIndex = Number(ethers.utils.formatUnits(rawCurrentIndex, 'gwei') / indexRatio).toFixed(2);
    } else {
      rawCurrentIndex = Number(ethers.utils.formatUnits(rawCurrentIndex, 'gwei')).toFixed(2);

    }

    return {
      currentIndex: Number(currentIndex),
      rawCurrentIndex: Number(rawCurrentIndex)
    }
  }
  /**
   *
   * Meat
   * @param {String} networkSymbol
   * @param {String} farmSymbol
   * @param {Boolean} [clearCache=false]
   * @return {Object}
   */
   async getStakingInfo(networkSymbol, farmSymbol, currencyConversion=1, clearCache=false) {
    const key = `${networkSymbol}-${farmSymbol}`;
    const networkParams = networks[networkSymbol];
    const farmParams = allFarms[key].constants;
    const stakingContract = cacheEthers.contract(farmParams.stakingContract, StakingAbi, networkParams.rpcURL);
    const tokenContract = cacheEthers.contract(farmParams.token, IERC20Abi, networkParams.rpcURL);
    const stakingTokenContract = cacheEthers.contract(farmParams.stakingToken, StakingTokenAbi, networkParams.rpcURL);

    let totalSupply = await cacheEthers.contractCall(
      tokenContract,
      'totalSupply',
      [],
      clearCache
    );
    // if(farmParams.lockedSupplyContract !== null) {
    //   if(typeof farmParams.lockedSupplyContract === 'string') {
    //     const lockedSupply = await cacheEthers.contractCall(
    //       tokenContract,
    //       'balanceOf',
    //       [farmParams.lockedSupplyContract],
    //       clearCache
    //     );
    //     totalSupply = totalSupply - lockedSupply;
    //   } else {
    //     const lockedSupplyPromises = farmParams.lockedSupplyContract.map(async (lockedSupplyContract)=>{
    //       const lockedSupply = await cacheEthers.contractCall(
    //         tokenContract,
    //         'balanceOf',
    //         [lockedSupplyContract],
    //         clearCache
    //       );
    //       // console.log(lockedSupply);
    //       totalSupply = totalSupply - lockedSupply;
    //     });
    //     await Promise.all(lockedSupplyPromises);
    //   }
    // }

    const epoch = await cacheEthers.contractCall(
      stakingContract,
      'epoch',
      [],
      clearCache
    );

    let {rawCurrentIndex, currentIndex} = await this.getCurrentIndex(stakingContract, key, farmParams.indexRatio, clearCache);
    let lockedValue = 0;
    if(key !== 'ETH-OHM2') {
      lockedValue = await cacheEthers.contractCall(
        stakingContract,
        'contractBalance',
        [],
        clearCache
      );
    }

    let stakingReward = epoch.distribute;
    if (typeof farmParams.timeTemplate !== 'undefined' && farmParams.timeTemplate) {
      stakingReward = epoch.number;
    } else if(key === 'FTM-PUMP') {
      stakingReward = epoch.number;
    }
    const circulatingSupply = await cacheEthers.contractCall(
      stakingTokenContract,
      'circulatingSupply',
      [],
      clearCache
    );
    const stakingRebase = Number(stakingReward / circulatingSupply);
    // console.log('stakingReward', Number(stakingReward));
    // console.log('circulatingSupply', Number(circulatingSupply));
    const pairingContract = cacheEthers.contract(farmParams.LPContract, PairContractAbi, networkParams.rpcURL);
    const reserves = await cacheEthers.contractCall(
      pairingContract,
      'getReserves',
      [],
      clearCache
    );
    const token0 = await cacheEthers.contractCall(
      pairingContract,
      'token0',
      []
    );

    let price = 0;
    let ethPrice = 0;
    let rawLPLiquidity = 0;
    let stable = 0;
    let token = 0;
    if (key === 'ETH-SQUID' || key === 'ETH-OHM2' || key === 'ETH-LOBI' ||
        key === 'ETH-MNFST' || key == 'AVAX-OTWO' || key === 'ETH-BTRFLY' || key === 'ETH-3DOG') {
      const ethContract = cacheEthers.contract(farmParams.LPContractETH, PairContractAbi, networkParams.rpcURL);
      const ethReserves = await cacheEthers.contractCall(
        ethContract,
        'getReserves',
        [],
        clearCache
      );
      if(key === 'ETH-LOBI' || key === 'ETH-BTRFLY') {
        ethPrice = ethers.utils.formatUnits(ethReserves.reserve1, 'ether') / ethers.utils.formatUnits(ethReserves.reserve0, 'gwei');
        stable = ethPrice * ethers.utils.formatUnits(reserves.reserve0, 'gwei');
        token =  ethers.utils.formatUnits(reserves.reserve1, 'gwei');
      } else if (key === 'ETH-MNFST') {
        ethPrice = ethers.utils.formatUnits(ethReserves.reserve1, 'ether') / ethers.utils.formatUnits(ethReserves.reserve0, 'gwei');
        stable = ethPrice * ethers.utils.formatUnits(reserves.reserve1, 'gwei');
        token =  ethers.utils.formatUnits(reserves.reserve0, 'gwei');
      } else if (key === 'AVAX-OTWO') {
        ethPrice = ethers.utils.formatUnits(ethReserves.reserve0, 'ether') / ethers.utils.formatUnits(ethReserves.reserve1, 'ether');
        stable = ethPrice * ethers.utils.formatUnits(reserves.reserve0, 'ether');
        token =  ethers.utils.formatUnits(reserves.reserve1, 'gwei');
      } else {
        ethPrice = ethers.utils.formatUnits(ethReserves.reserve0, 6) / ethers.utils.formatUnits(ethReserves.reserve1, 'ether');
        stable = ethPrice * ethers.utils.formatUnits(reserves.reserve1, 'ether');
        token =  ethers.utils.formatUnits(reserves.reserve0, 'gwei');
      }
      price = Number(price) * ethPrice;
    } else if (key === 'MATIC-KLIMA' || key === 'MOVR-FHM' || key === 'ARB-OMIC' ) {
      //usdc
      if (token0 === farmParams.token) {
        stable = ethers.utils.formatUnits(reserves.reserve1, 'mwei');
        token = ethers.utils.formatUnits(reserves.reserve0, 'gwei');
      } else {
        stable = ethers.utils.formatUnits(reserves.reserve0, 'mwei');
        token = ethers.utils.formatUnits(reserves.reserve1, 'gwei');
      }
    } else if(key === 'ARB-UMAMI' || key === 'BSC-GYRO' || key === 'BSC-PID' || key === 'BSC-WHISKEY' || key === 'BSC-POWER') {
      stable = ethers.utils.formatUnits(reserves.reserve1, 'ether');
      token = ethers.utils.formatUnits(reserves.reserve0, 'gwei');
    }else {
      if (token0 === farmParams.token) {
        stable = ethers.utils.formatUnits(reserves.reserve1, 'ether');
        token = ethers.utils.formatUnits(reserves.reserve0, 'gwei');
      } else {
        stable = ethers.utils.formatUnits(reserves.reserve0, 'ether');
        token = ethers.utils.formatUnits(reserves.reserve1, 'gwei');
      }
    }
    price = stable / token;
    rawLPLiquidity = token * price * 2;

    let totalReserves = 0;
    if(farmParams.treasuryContract !== null) {
      const treasuryContract = cacheEthers.contract(farmParams.treasuryContract, TreasuryAbi, networkParams.rpcURL );
      let totalReservesString = 'totalReserves';
      if(key === 'BSC-GYRO') {
        totalReservesString = 'totalAssets';
      }
      totalReserves = await cacheEthers.contractCall(
        treasuryContract,
        totalReservesString,
        [],
        clearCache
      );
      totalReserves = Number(ethers.utils.formatUnits(totalReserves, 'gwei'));
      if(key === 'ETH-SQUID') {
        totalReserves = totalReserves * ethPrice;
      }
    }
    // console.log(
    //   key,
    //   'len', epoch._length.toNumber(),
    //   'num', epoch.number.toNumber(),
    //   'end', epoch.endBlock.toNumber(),
    //   'dist', epoch.distribute.toNumber(),
    // )
    const currentBlock = await cacheEthers.blockNumber(networkParams.rpcURL, clearCache);
    let seconds = 0;
    let distributeInterval = 0;
    const msPerDay = 86400;
    if (typeof farmParams.timeTemplate !== 'undefined' && farmParams.timeTemplate) {
      seconds = epoch.distribute.toNumber() - (Date.now() / 1000);
      distributeInterval = msPerDay / epoch.endBlock.toNumber();
    } else if(key === 'ARB-FCS' || key === 'ARB-OMIC') {
      const ethParams = networks.ETH;
      const ethCurrentBlock = await cacheEthers.blockNumber(ethParams.rpcURL, clearCache);
      distributeInterval = msPerDay / (epoch._length.toNumber() * ethParams.blockRateSeconds);
      seconds = this.secondsUntilBlock(ethCurrentBlock, epoch.endBlock.toNumber(), ethParams.blockRateSeconds);
    } else if (key === 'MATIC-CLAM' || key === 'MATIC-CLAM2' || key === 'ONE-EIGHT' || key === 'CRO-FORT' || key === 'ETH-OHM2') {
      seconds = epoch.endBlock.toNumber() - (Date.now() / 1000);
      distributeInterval = msPerDay / epoch._length.toNumber();
    } else if (key === 'FTM-PUMP' || key === 'FTM-WEN'){
      seconds = epoch.distribute.toNumber() - (Date.now() / 1000);
      distributeInterval = msPerDay / epoch.endBlock.toNumber();
    } else {
      distributeInterval = msPerDay / (epoch._length.toNumber() * networkParams.blockRateSeconds);
      seconds = this.secondsUntilBlock(currentBlock, epoch.endBlock.toNumber(), networkParams.blockRateSeconds);
    }
    return {
      farmSymbol,
      networkSymbol,
      data: {
        date: new Date(farmParams.date).getTime(),
        nextRebase: this.prettifySeconds(seconds),
        nextRebaseSeconds: seconds,
        distributeInterval,
        stakingRebase,
        rawPrice: Number(price / currencyConversion),
        rawLPLiquidity,
        totalReserves: Number(totalReserves),
        currentIndex,
        rawCurrentIndex,
        totalSupply: Number(ethers.utils.formatUnits(totalSupply, 'gwei')),
        circulatingSupply: Number(ethers.utils.formatUnits(circulatingSupply, 'gwei')),
        lockedValue: Number(ethers.utils.formatUnits(lockedValue, 'gwei')),
      }
    };
  }

  /**
   *
   * Meat
   * @param {String} userAddress
   * @param {String} networkSymbol
   * @param {String} farmSymbol
   * @param {Boolean} [clearCache=false]
   * @return {Object}
   */
  async getBalances(userAddress, networkSymbol, farmSymbol, clearCache=false) {
    const key = `${networkSymbol}-${farmSymbol}`;
    const networkParams = networks[networkSymbol];
    const farmParams = allFarms[key].constants;
    const stakingContract = cacheEthers.contract(farmParams.stakingContract, StakingAbi, networkParams.rpcURL);
    const tokenContract = cacheEthers.contract(farmParams.token, IERC20Abi, networkParams.rpcURL);
    const stakingTokenContract = cacheEthers.contract(farmParams.stakingToken, StakingTokenAbi, networkParams.rpcURL);

    let tokenBalance = await cacheEthers.contractCall(
      tokenContract,
      'balanceOf',
      [userAddress],
      clearCache
    );
    tokenBalance = Number(ethers.utils.formatUnits(tokenBalance, 'gwei'));

    let stakingTokenBalance = await cacheEthers.contractCall(
      stakingTokenContract,
      'balanceOf',
      [userAddress],
      clearCache
    );
    stakingTokenBalance = Number(ethers.utils.formatUnits(stakingTokenBalance, 'gwei'));

    let fullBondTotal = 0;
    let fullPendingBondTotal = 0;
    const getBondContract = async (bondParams) => {
      const bondsContract = cacheEthers.contract(bondParams.address, BondContractAbi, networkParams.rpcURL);
      const bondInfo = await cacheEthers.contractCall(
        bondsContract,
        'bondInfo',
        [userAddress],
        clearCache
      );
      // console.log(
      //   key,
      //   'lastBlock', Number(bondInfo.lastBlock),
      //   'payout', Number(bondInfo.payout),
      //   'pricePaid', Number(bondInfo.pricePaid),
      //   'vesting', Number(bondInfo.vesting)
      // )
      if(Number(bondInfo.payout) === 0) {
        return {
          payout: 0,
          lastTime: '',
          pendingPayout: 0,
          symbol: bondParams.symbol
        }
      }
      const payout = Number(ethers.utils.formatUnits(bondInfo.payout, 'gwei'));
      let pendingPayout = await cacheEthers.contractCall(
        bondsContract,
        'pendingPayoutFor',
        [userAddress],
        clearCache
      );
      pendingPayout = Number(ethers.utils.formatUnits(pendingPayout, 'gwei'));
      if(bondParams.symbol.includes('(4,4)')) {
        stakingTokenBalance += payout;
      } else {
        fullBondTotal += payout;
        fullPendingBondTotal += pendingPayout;
      }
      let bondSeconds = 0;
      if (typeof farmParams.timeTemplate !== 'undefined' && farmParams.timeTemplate) {
        bondSeconds = Number(bondInfo.pricePaid) +  Number(bondInfo.lastBlock) - (Date.now() / 1000);
      } else{
        const currentBlock = await cacheEthers.blockNumber(networkParams.rpcURL, clearCache);
        bondSeconds = this.secondsUntilBlock(
          currentBlock,
          Number(bondInfo.vesting) +  Number(bondInfo.lastBlock),
          networkParams.blockRateSeconds
        )
      }
      return {
        payout: Number(payout),
        lastTime: this.prettifySeconds(bondSeconds),
        pendingPayout: Number(pendingPayout),
        symbol: bondParams.symbol
      }
    }
    const bondPromises = farmParams.bondingContracts.map(getBondContract);
    const bonds = await Promise.all(bondPromises);
    // console.log(bonds);
    let warmupBalance = 0;
    // let warmupPeriod = 0;
    if (key !== 'BSC-GYRO') {
      const warmupInfo = await cacheEthers.contractCall(
        stakingContract,
        'warmupInfo',
        [userAddress],
        clearCache
      );
      // warmupPeriod = await cacheEthers.contractCall(
      //   stakingContract,
      //   'warmupPeriod',
      //   [],
      //   clearCache
      // );
      const balanceForGons = await cacheEthers.contractCall(
        stakingTokenContract,
        'balanceForGons',
        [warmupInfo.gons],
        clearCache
      );
      // warmupPeriod = Number(warmupPeriod);
      warmupBalance = Number(ethers.utils.formatUnits(warmupInfo.deposit, 'gwei'));
      const gonsBalance = Number(ethers.utils.formatUnits(balanceForGons, 'gwei'));
      stakingTokenBalance = stakingTokenBalance + gonsBalance;
    }
    // console.log(warmupPeriod);
    let wrappedBalances = {
      total: 0,
      balances: []
    };
    if(farmParams.wsOHMNetworks !== null) {
      let {rawCurrentIndex, currentIndex} = await this.getCurrentIndex(stakingContract, key, farmParams.indexRatio, clearCache);
      let useIndex = rawCurrentIndex;
      if (key === 'FTM-SPA') {
        useIndex = currentIndex;
      }
      wrappedBalances = await this.getwsOHMBalances(userAddress, farmParams.wsOHMNetworks, useIndex, clearCache);
    }
    let collateralBalances = {
      total: 0,
      balances: []
    };
    if(typeof farmParams.cauldrons !== 'undefined') {
      let {rawCurrentIndex, currentIndex} = await this.getCurrentIndex(stakingContract, key, farmParams.indexRatio, clearCache);
      let useIndex = rawCurrentIndex;
      if (key === 'FTM-SPA') {
        useIndex = currentIndex;
      }
      collateralBalances = await this.getCauldronCollateral(userAddress, farmParams.cauldrons, useIndex, clearCache);
    }
    let wsOHMPoolBalance = 0;
    if(typeof farmParams.wsOHMPool !== 'undefined') {
      let {rawCurrentIndex, currentIndex} = await this.getCurrentIndex(stakingContract, key, farmParams.indexRatio, clearCache);
      let useIndex = rawCurrentIndex;
      if (key === 'FTM-SPA') {
        useIndex = currentIndex;
      }
      wsOHMPoolBalance = await this.getwsOHMPoolBalances(userAddress, farmParams.wsOHMPool, useIndex, networkParams.rpcURL, clearCache);
    }
    const data = {
      tokenBalance,
      stakingTokenBalance,
      warmupBalance,
      wrappedBalances,
      wsOHMPoolBalance,
      collateralBalances,
      fullBondTotal: Number(fullBondTotal),
      fullPendingBondTotal: Number(fullPendingBondTotal),
      bonds,
      disabled: tokenBalance === 0 && stakingTokenBalance === 0
    };
    return {
      userAddress,
      farmSymbol,
      networkSymbol,
      data
    };
  }

  async getwsOHMPoolBalances(userAddress, wsOHMPool, index, rpcURL, clearCache) {
    const wsOHMPoolContract = cacheEthers.contract(wsOHMPool, wsOHMPoolAbi, rpcURL);
    const userInfo = await cacheEthers.contractCall(
      wsOHMPoolContract,
      'userInfo',
      [userAddress],
      clearCache
    );
    const tokenBalance = Number(ethers.utils.formatUnits(userInfo.staked, 'ether'));
    const convertedBalance = Number((tokenBalance  * index).toFixed(4));

    return {
      tokenBalance,
      convertedBalance
    }
  }

  async getwsOHMBalances(userAddress, wsOHMNetworks, index, clearCache=false) {
    let total = 0;
    const getBalances = async (data) => {
      const networkParams = networks[data.networkSymbol];
      const tokenContract = cacheEthers.contract(data.address, IERC20Abi, networkParams.rpcURL);
      let tokenBalance = await cacheEthers.contractCall(
        tokenContract,
        'balanceOf',
        [userAddress],
        clearCache
      );
      tokenBalance = Number(ethers.utils.formatUnits(tokenBalance, 'ether'));
      const convertedBalance = Number((tokenBalance  * index).toFixed(4));
      total += convertedBalance;
      return {
        symbol: data.networkSymbol,
        tokenBalance: Number(tokenBalance.toFixed(4)),
        convertedBalance
      };
    };
    const wsOHMPromises = wsOHMNetworks.map(getBalances);
    const balances = await Promise.all(wsOHMPromises);

    return {
      total,
      balances
    };
  }

  async getCauldronCollateral(userAddress, cauldrons, index, clearCache=false) {
    let total = 0;
    const getBalances = async (data) => {
      const networkParams = networks[data.networkSymbol];
      const cauldronContract = cacheEthers.contract(data.address, CauldronAbi, networkParams.rpcURL);
      let tokenBalance = await cacheEthers.contractCall(
        cauldronContract,
        'userCollateralShare',
        [userAddress],
        clearCache
      );
      tokenBalance = Number(ethers.utils.formatUnits(tokenBalance, 'ether'));
      const convertedBalance = Number((tokenBalance  * index).toFixed(4));
      total += convertedBalance;
      return {
        symbol: data.networkSymbol,
        tokenBalance: Number(tokenBalance.toFixed(4)),
        convertedBalance
      };
    };
    const cauldronPromises = cauldrons.map(getBalances);
    const balances = await Promise.all(cauldronPromises);

    return {
      total,
      balances
    };
  }

  async getCurrencyConversion(currencyKey='usd', clearCache=false) {
    if(currencyKey === 'usd') return 1;
    const networkParams = networks.ETH;
    const currencyAddress = fiatCurrencyMap[currencyKey].address
    const currenyContract = cacheEthers.contract(currencyAddress, CurrencyAbi, networkParams.rpcURL);
    let latestAnswer = await cacheEthers.contractCall(
      currenyContract,
      'latestAnswer',
      [],
      clearCache
    );
    latestAnswer = Number(ethers.utils.formatUnits(latestAnswer, 8));
    return latestAnswer;
  }
  async getTreasury(networkSymbol, farmSymbol, clearCache=false) {
    const key = `${networkSymbol}-${farmSymbol}`;
    const networkParams = networks[networkSymbol];
    const farmParams = allFarms[key].constants;
    const promises = farmParams.treasuryAssets.map((asset)=>{
      return this.getAssetBalance(farmParams.token, farmParams.treasuryContract, asset, networkParams.rpcURL, clearCache);
    });
    const allBalances = await Promise.all(promises);
    const rfv = allBalances.reduce((acc, data)=>{
      if(data.singleStable) {
        acc += data.value;
      }
      return acc;
    }, 0);
    const usdTreasuryValues = allBalances.reduce((acc, data)=>{
      if(data.symbol.indexOf('-') === -1) {
        acc += data.value;
      }
      return acc;
    }, 0);
    const ohmTreasuryValues = allBalances.reduce((acc, data)=>{
      if(data.symbol.indexOf('-') > -1) {
        acc += data.value;
      }
      return acc;
    }, 0);
    return {
      rfv,
      usdTreasuryValues,
      ohmTreasuryValues,
      allBalances,
    };
  }

  async getAssetBalance(tokenAddress, treasuryAddress, assetInfo, rpcURL, clearCache=false) {
    if(assetInfo.stable && assetInfo.single) {
      //Stable
      const token0Contract = cacheEthers.contract(assetInfo.token0.address, IERC20Abi, rpcURL);
      const balanceOf = await cacheEthers.contractCall(
        token0Contract,
        'balanceOf',
        [treasuryAddress],
        clearCache
      );
      const balance = ethers.utils.formatUnits(balanceOf, assetInfo.token0.decimals);
      return {
        symbol: assetInfo.symbol,
        singleStable: true,
        value: +balance
      };
    } else if(!assetInfo.stable && assetInfo.single) {
      //NonStable
      const token0Contract = cacheEthers.contract(assetInfo.token0.address, IERC20Abi, rpcURL);
      const balanceOf = await cacheEthers.contractCall(
        token0Contract,
        'balanceOf',
        [treasuryAddress],
        clearCache
      );
      if(assetInfo.LPAddress === '0x0000000000000000000000000000000000000000') {
        return {
          symbol: assetInfo.symbol,
          singleStable: false,
          value: 0
        };
      }
      const LPContract = cacheEthers.contract(assetInfo.LPAddress, PairContractAbi, rpcURL);
      const reserves = await cacheEthers.contractCall(
        LPContract,
        'getReserves',
        [],
        clearCache
      );
      const token0 = await cacheEthers.contractCall(
        LPContract,
        'token0',
        [],
        clearCache
      );
      let stable = 0;
      let token = 0;
      if(token0.toLowerCase() === assetInfo.token0.address.toLowerCase()) {
        stable = ethers.utils.formatUnits(reserves.reserve1, assetInfo.token1.decimals);
        token = ethers.utils.formatUnits(reserves.reserve0, assetInfo.token0.decimals);
      } else {
        stable = ethers.utils.formatUnits(reserves.reserve0, assetInfo.token0.decimals);
        token = ethers.utils.formatUnits(reserves.reserve1, assetInfo.token1.decimals);
      }
      const balance = ethers.utils.formatUnits(balanceOf, assetInfo.token0.decimals);
      const price = stable / token;
      return {
        symbol: assetInfo.symbol,
        singleStable: false,
        value: +(balance * price)
      };
    } else {
      //Token-NonStable
      if(assetInfo.LPAddress === '0x0000000000000000000000000000000000000000') {
        return {
          symbol: assetInfo.symbol,
          singleStable: false,
          value: 0
        };
      }
      const LPContract = cacheEthers.contract(assetInfo.LPAddress, PairContractAbi, rpcURL);
      let balanceOf = await cacheEthers.contractCall(
        LPContract,
        'balanceOf',
        [treasuryAddress],
        clearCache
      );
      const tokenReserves = await cacheEthers.contractCall(
        LPContract,
        'getReserves',
        [],
        clearCache
      );
      let totalSupply = await cacheEthers.contractCall(
        LPContract,
        'totalSupply',
        [],
        clearCache
      );
      const reserves0 = await cacheEthers.contractCall(
        LPContract,
        'token0',
        [],
        clearCache
      );
      let reserve;
      if(reserves0.toLowerCase() === tokenAddress.toLowerCase()) {
        reserve = tokenReserves.reserve0;
      } else {
        reserve = tokenReserves.reserve1;
      }
      const LPReserves = (ethers.utils.formatUnits(reserve, 'gwei') * 2);
      totalSupply = ethers.utils.formatUnits(totalSupply, 'ether');
      balanceOf = ethers.utils.formatUnits(balanceOf, 'ether');
      const valueInOHM = balanceOf /totalSupply * LPReserves;
      return {
        symbol: assetInfo.symbol,
        singleStable: false,
        value: +(valueInOHM)
      };
    }
  }

  secondsUntilBlock(startBlock, endBlock, blockRateSeconds) {
    const blocksAway = endBlock - startBlock;
    const secondsAway = blocksAway * blockRateSeconds;
    return secondsAway;
  }

  prettifySeconds(seconds, resolution) {
    // console.log(seconds);
    if (seconds !== 0 && !seconds || seconds < 0) {
      return 'Past Due...';
    }
    const absSeconds = Math.abs(seconds);
    const d = Math.floor(absSeconds / (3600 * 24));
    const h = Math.floor((absSeconds % (3600 * 24)) / 3600);
    const m = Math.floor((absSeconds % 3600) / 60);

    if (resolution === 'day') {
      return d + (d == 1 ? ' day' : ' days');
    }

    const dDisplay = d > 0 ? d + (d === 1 ? ' day, ' : ' days, ') : '';
    const hDisplay = h > 0 ? h + (h === 1 ? ' hr, ' : ' hrs, ') : '';
    const mDisplay = m > 0 ? m + (m === 1 ? ' min' : ' mins') : '';

    let result = dDisplay + hDisplay + mDisplay;
    if (mDisplay === '') {
      result = result.slice(0, result.length - 2);
    }
    let neg = '';
    if(seconds < 0){
      neg = '-'
    }
    return `${neg} ${result}`;
  }
}

const stakingInfo = new StakingInfo();
export {
  stakingInfo
};
