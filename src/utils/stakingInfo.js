import {ethers} from 'ethers';
import {cacheServiceInstance} from './cacheService';
import {allFarms, networks, fiatCurrencyMap} from './constants';
import {abi as IERC20Abi} from '../abis/IERC20.json';
import {abi as CauldronAbi} from '../abis/Cauldron.json';
import {abi as PairContractAbi} from '../abis/PairContract.json';
import {abi as StakingAbi} from '../abis/Staking.json';
import {abi as StakingTokenAbi} from '../abis/StakingToken.json';
import {abi as BondContractAbi} from '../abis/BondContract.json';
import {abi as CurrencyAbi} from '../abis/Currency.json';
import {abi as TreasuryAbi} from '../abis/Treasury.json';
import store from '../store/store';
import { getFarm } from './farmDecorator';
// import { updateStakingInfo } from "../store-deps/reducerFarms";
// import { updateAddressBalances } from "../store-deps/reducerBalances";

/* eslint-disable */

/**
 *
 * Get raw data from contracts to put into store
 * @class StakingInfo
 */
class StakingInfo {
  timeTemplates = [
    'AVAX-TIME',
    'AVAX-CAKE',
    'AVAX-LF',
    'AVAX-SB',
    'AVAX-MAXI',
    'AVAX-GG',
    'AVAX-PUMP',
    'AVAX-OTWO',
    'AVAX-SDOG',
    'AVAX-CROWN',
    'AVAX-NADO',
    'AVAX-FORT',
    'AVAX-PB',
    'AVAX-VAL',
    'FTM-LUX',
    'ONE-WAGMI',
    'ARB-Z20',
    'ARB-UMAMI',
    'AVAX-RUG',
    'BSC-RUG',
    'ONE-ODAO',
  ];
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
      store.dispatch(
        {
          type: 'updateStakingInfo',
          payload: {
            farmKey: `${res.networkSymbol}-${res.farmSymbol}`,
            stakingInfo: {
              ...getFarm({...stateFarm, data: res.data}, balanceMap, state.app.addresses, fiatCurrency),
              loading: false
            }
          }
        }
      );
    });
  }
  async getCurrentIndex(stakingContract, key, clearCache=false) {
    let rawCurrentIndex = await this.loadCahceContractCall(
      stakingContract,
      'index',
      [],
      clearCache
    );
    let currentIndex = await this.loadCahceContractCall(
      stakingContract,
      'index',
      [],
      clearCache
    );
    if (key === 'AVAX-TIME' || key === 'ARB-Z20' || key === 'AVAX-MAXI'
    || key === 'ONE-ODAO' || key === 'AVAX-LF' || key === 'FTM-LUX') {
      currentIndex = Number(ethers.utils.formatUnits(currentIndex, 'gwei') / 4.5).toFixed(2);
      rawCurrentIndex = Number(ethers.utils.formatUnits(rawCurrentIndex, 'gwei')).toFixed(2);
    } else if (key === 'CRO-FORT') {
      currentIndex = Number(ethers.utils.formatUnits(currentIndex, 'gwei') / 16.1).toFixed(2);
      rawCurrentIndex = Number(ethers.utils.formatUnits(rawCurrentIndex, 'gwei')).toFixed(2);
    } else if (key === 'AVAX-RUG') {
      currentIndex = Number(ethers.utils.formatUnits(currentIndex, 'gwei')/ 100).toFixed(2);
      rawCurrentIndex = Number(ethers.utils.formatUnits(rawCurrentIndex, 'gwei')).toFixed(2);
    } else if (key === 'AVAX-PB') {
      currentIndex = Number(ethers.utils.formatUnits(currentIndex, 'gwei') / 2000).toFixed(2);
      rawCurrentIndex = Number(ethers.utils.formatUnits(rawCurrentIndex, 'gwei')).toFixed(2);
    } else if (key === 'FTM-SPA') {
      currentIndex = Number(ethers.utils.formatUnits(currentIndex, 'gwei') / 7.673).toFixed(2);
      rawCurrentIndex = Number(ethers.utils.formatUnits(rawCurrentIndex, 'gwei')).toFixed(2);
    } else if (key === 'BSC-XEUS') {
      currentIndex = Number(ethers.utils.formatUnits(currentIndex, 4)).toFixed(2);
      rawCurrentIndex = Number(ethers.utils.formatUnits(rawCurrentIndex, 4)).toFixed(2);
    } else if (key === 'BSC-META') {
      currentIndex = Number(ethers.utils.formatUnits(currentIndex, 1)).toFixed(2);
      rawCurrentIndex = Number(ethers.utils.formatUnits(rawCurrentIndex, 1)).toFixed(2);
    }else {
      currentIndex = Number(ethers.utils.formatUnits(currentIndex, 'gwei')).toFixed(2);
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
    const stakingContract = this.loadCacheContract(farmParams.stakingContract, StakingAbi, networkParams.rpcURL);
    const tokenContract = this.loadCacheContract(farmParams.token, IERC20Abi, networkParams.rpcURL);
    const stakingTokenContract = this.loadCacheContract(farmParams.stakingToken, StakingTokenAbi, networkParams.rpcURL);

    let totalSupply = await this.loadCahceContractCall(
      tokenContract,
      'totalSupply',
      [],
      clearCache
    );
    if(farmParams.lockedSupplyContract !== null) {
      if(typeof farmParams.lockedSupplyContract === 'string') {
        const lockedSupply = await this.loadCahceContractCall(
          tokenContract,
          'balanceOf',
          [farmParams.lockedSupplyContract],
          clearCache
        );
        totalSupply = totalSupply - lockedSupply;
      } else {
        const lockedSupplyPromises = farmParams.lockedSupplyContract.map(async (lockedSupplyContract)=>{
          const lockedSupply = await this.loadCahceContractCall(
            tokenContract,
            'balanceOf',
            [lockedSupplyContract],
            clearCache
          );
          // console.log(lockedSupply);
          totalSupply = totalSupply - lockedSupply;
        });
        await Promise.all(lockedSupplyPromises);
      }
    }

    const epoch = await this.loadCahceContractCall(
      stakingContract,
      'epoch',
      [],
      clearCache
    );

    let {rawCurrentIndex, currentIndex} = await this.getCurrentIndex(stakingContract, key, clearCache);

    const lockedValue = await this.loadCahceContractCall(
      stakingContract,
      'contractBalance',
      [],
      clearCache
    );

    let stakingReward = epoch.distribute;
    if (this.timeTemplates.indexOf(key) > -1) {
      stakingReward = epoch.number;
    }
    const circulatingSupply = await this.loadCahceContractCall(
      stakingTokenContract,
      'circulatingSupply',
      [],
      clearCache
    );
    const stakingRebase = Number(stakingReward / circulatingSupply);
    const pairingContract = this.loadCacheContract(farmParams.LPContract, PairContractAbi, networkParams.rpcURL);
    const reserves = await this.loadCahceContractCall(
      pairingContract,
      'getReserves',
      [],
      clearCache
    );
    const token0 = await this.loadCahceContractCall(
      pairingContract,
      'token0',
      []
    );
    let price = 0;
    let ethPrice = 0;
    let rawLPLiquidity = 0;
    let stable = 0;
    let token = 0;
    if (key === 'ETH-SQUID' || key === 'ETH-LOBI' || key == 'AVAX-OTWO' || key == 'AVAX-RUG') {
      const ethContract = this.loadCacheContract(farmParams.LPContractETH, PairContractAbi, networkParams.rpcURL);
      const ethReserves = await this.loadCahceContractCall(
        ethContract,
        'getReserves',
        [],
        clearCache
      );
      if(key === 'ETH-LOBI') {
        ethPrice = ethers.utils.formatUnits(ethReserves.reserve1, 'ether') / ethers.utils.formatUnits(ethReserves.reserve0, 'gwei');
        stable = ethPrice * ethers.utils.formatUnits(reserves.reserve0, 'gwei');
        token =  ethers.utils.formatUnits(reserves.reserve1, 'gwei');
      } else if (key === 'AVAX-OTWO') {
        ethPrice = ethers.utils.formatUnits(ethReserves.reserve0, 'ether') / ethers.utils.formatUnits(ethReserves.reserve1, 'ether');
        stable = ethPrice * ethers.utils.formatUnits(reserves.reserve0, 'ether');
        token =  ethers.utils.formatUnits(reserves.reserve1, 'gwei');
      } else if (key === 'AVAX-RUG') {
        ethPrice = ethers.utils.formatUnits(ethReserves.reserve0, 'mwei') / ethers.utils.formatUnits(ethReserves.reserve1, 'ether');
        stable = ethPrice * ethers.utils.formatUnits(reserves.reserve0, 'ether');
        token =  ethers.utils.formatUnits(reserves.reserve1, 'gwei');
      } else {
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
    } else if(key === 'ARB-UMAMI' || key === 'BSC-GYRO' || key === 'MOVR-MD' || key === 'ONE-EIGHT' || key === 'BSC-PID' || key === 'BSC-WHISKEY') {
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
      const treasuryContract = this.loadCacheContract(farmParams.treasuryContract, TreasuryAbi, networkParams.rpcURL );
      let totalReservesString = 'totalReserves';
      if(key === 'BSC-GYRO') {
        totalReservesString = 'totalAssets';
      }
      totalReserves = await this.loadCahceContractCall(
        treasuryContract,
        totalReservesString,
        [],
        clearCache
      );
      totalReserves = Number(ethers.utils.formatUnits(totalReserves, 'gwei'));
      if(key === 'ETH-SQUID' || key === 'ETH-LOBI' || key === 'AVAX-OTWO') {
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
    const currentBlock = await this.loadCacheBlockNumber(networkParams.rpcURL, clearCache);
    let seconds = 0;
    let distributeInterval = 0;
    const msPerDay = 86400;
    if (this.timeTemplates.indexOf(key) > -1) {
      seconds = epoch.distribute.toNumber() - (Date.now() / 1000);
      distributeInterval = msPerDay / epoch.endBlock.toNumber();
    } else if(key === 'ARB-FCS' || key === 'ARB-OMIC') {
      const ethParams = networks.ETH;
      const ethCurrentBlock = await this.loadCacheBlockNumber(ethParams.rpcURL, clearCache);
      distributeInterval = msPerDay / (epoch._length.toNumber() * ethParams.blockRateSeconds);
      seconds = this.secondsUntilBlock(ethCurrentBlock, epoch.endBlock.toNumber(), ethParams.blockRateSeconds);
    } else if (key === 'MATIC-CLAM' || key === 'MATIC-CLAM2' || key === 'ONE-EIGHT' || key === 'CRO-FORT') {
      seconds = epoch.endBlock.toNumber() - (Date.now() / 1000);
      distributeInterval = msPerDay / epoch._length.toNumber();
    } else if (key === 'FTM-PUMP'){
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
    const stakingContract = this.loadCacheContract(farmParams.stakingContract, StakingAbi, networkParams.rpcURL);
    const tokenContract = this.loadCacheContract(farmParams.token, IERC20Abi, networkParams.rpcURL);
    const stakingTokenContract = this.loadCacheContract(farmParams.stakingToken, StakingTokenAbi, networkParams.rpcURL);

    let tokenBalance = await this.loadCahceContractCall(
      tokenContract,
      'balanceOf',
      [userAddress],
      clearCache
    );
    tokenBalance = Number(ethers.utils.formatUnits(tokenBalance, 'gwei'));

    let stakingTokenBalance = await this.loadCahceContractCall(
      stakingTokenContract,
      'balanceOf',
      [userAddress],
      clearCache
    );
    stakingTokenBalance = Number(ethers.utils.formatUnits(stakingTokenBalance, 'gwei'));

    let fullBondTotal = 0;
    const getBondContract = async (bondParams) =>{
      const bondsContract = this.loadCacheContract(bondParams.address, BondContractAbi, networkParams.rpcURL);
      const bondInfo = await this.loadCahceContractCall(
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
      let pendingPayout = await this.loadCahceContractCall(
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
      }
      let bondSeconds = 0;
      if (this.timeTemplates.indexOf(key) > -1) {
        bondSeconds = Number(bondInfo.pricePaid) +  Number(bondInfo.lastBlock) - (Date.now() / 1000);
      } else{
        const currentBlock = await this.loadCacheBlockNumber(networkParams.rpcURL, clearCache);
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
    if (key !== 'BSC-GYRO') {
      const warmupInfo = await this.loadCahceContractCall(
        stakingContract,
        'warmupInfo',
        [userAddress],
        clearCache
      );
      warmupBalance = Number(ethers.utils.formatUnits(warmupInfo.deposit, 'gwei'));
    }

    let wrappedBalances = {
      total: 0,
      balances: []
    };
    if(farmParams.wsOHMNetworks !== null) {
      let {rawCurrentIndex, currentIndex} = await this.getCurrentIndex(stakingContract, key, clearCache);
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
      let {rawCurrentIndex, currentIndex} = await this.getCurrentIndex(stakingContract, key, clearCache);
      let useIndex = rawCurrentIndex;
      if (key === 'FTM-SPA') {
        useIndex = currentIndex;
      }
      collateralBalances = await this.getCauldronCollateral(userAddress, farmParams.cauldrons, useIndex, clearCache);
    }

    const data = {
      tokenBalance,
      stakingTokenBalance,
      warmupBalance,
      wrappedBalances,
      collateralBalances,
      fullBondTotal: Number(fullBondTotal),
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

  async getwsOHMBalances(userAddress, wsOHMNetworks, index, clearCache=false) {
    let total = 0;
    const getBalances = async (data) => {
      const networkParams = networks[data.networkSymbol];
      const tokenContract = this.loadCacheContract(data.address, IERC20Abi, networkParams.rpcURL);
      let tokenBalance = await this.loadCahceContractCall(
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
      const cauldronContract = this.loadCacheContract(data.address, CauldronAbi, networkParams.rpcURL);
      let tokenBalance = await this.loadCahceContractCall(
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
    const currenyContract = this.loadCacheContract(currencyAddress, CurrencyAbi, networkParams.rpcURL);
    let latestAnswer = await this.loadCahceContractCall(
      currenyContract,
      'latestAnswer',
      [],
      clearCache
    );
    latestAnswer = Number(ethers.utils.formatUnits(latestAnswer, 8));
    return latestAnswer;
  }
  /**
   *
   *
   * @param {String} rpcURL
   * @return {JsonRpcProvider}
   */
  loadCacheProvider(rpcURL) {
    const key = `Provider/${rpcURL}`;
    if (cacheServiceInstance.has(key)) {
      return cacheServiceInstance.get(key);
    }
    const provider = new ethers.providers.JsonRpcProvider(rpcURL);
    cacheServiceInstance.set(key, provider);
    return provider;
  }

  /**
   *
   *
   * @param {String} rpcURL
   * @param {Boolean} [clearCache=false]
   * @return {Object}
   */
  async loadCacheBlockNumber(rpcURL, clearCache) {
    const key = `ProviderBlock/${rpcURL}`;
    if (cacheServiceInstance.has(key) && !clearCache) {
      return cacheServiceInstance.get(key);
    }
    const provider = this.loadCacheProvider(rpcURL);
    const response = await provider.getBlockNumber();
    cacheServiceInstance.set(key, response);
    return response;
  }

  /**
   *
   *
   * @param {String} address
   * @param {String} abi
   * @return {Contract}
   */
  loadCacheContract(address, abi, rpcURL) {
    const key = `Contract/${rpcURL}/${address}`;
    const provider = this.loadCacheProvider(rpcURL);
    if (cacheServiceInstance.has(key)) {
      return cacheServiceInstance.get(key);
    }
    const contract = new ethers.Contract(address, abi, provider);
    cacheServiceInstance.set(key, contract);
    return contract;
  }

  /**
   *
   *
   * @param {Contract} contract
   * @param {String} method
   * @param {Array} [params=[]]
   * @param {Boolean} [clearCache=false]
   * @return {mixed}
   */
  async loadCahceContractCall(contract, method, params=[], clearCache=false) {
    const rpcURL = contract.provider?.connection?.url || 'null';
    const contractCallKey = `Contract/${contract.address}/${rpcURL}/${method}/${JSON.stringify(params)}`;
    if (cacheServiceInstance.has(contractCallKey) && !clearCache) {
      return cacheServiceInstance.get(contractCallKey);
    }
    const response = await contract[method](...params);
    cacheServiceInstance.set(contractCallKey, response);

    return response;
  }

  secondsUntilBlock(startBlock, endBlock, blockRateSeconds) {
    const blocksAway = endBlock - startBlock;
    const secondsAway = blocksAway * blockRateSeconds;
    return secondsAway;
  }

  prettifySeconds(seconds, resolution) {
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
