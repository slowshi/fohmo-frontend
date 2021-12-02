import {ethers} from 'ethers';
import {cacheServiceInstance} from './cacheService';
import {allFarms, networks} from './constants';
import {abi as IERC20Abi} from '../abis/IERC20.json';
import {abi as PairContractAbi} from '../abis/PairContract.json';
import {abi as StakingAbi} from '../abis/Staking.json';
import {abi as StakingTokenAbi} from '../abis/StakingToken.json';
import {abi as BondContractAbi} from '../abis/BondContract.json';
import {abi as TreasuryAbi} from '../abis/Treasury.json';
import {store} from './store';
/* eslint-disable */

/**
 *
 * Get raw data from contracts to put into store
 * @class StakingInfo
 */
class StakingInfo {
  timeTemplates = [
    'AVAX-TIME',
    'AVAX-LF',
    'AVAX-SB',
    'AVAX-MAXI',
    'AVAX-OTWO',
    'AVAX-SDOG',
    'AVAX-NADO',
    'AVAX-FORT',
    'AVAX-PB',
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
  init(userAddress) {
    const state = store.getState();
    Object.keys(allFarms).forEach((key)=>{
      const farm = allFarms[key];
      if (state.farmFilters.length === 0 || state.farmFilters.indexOf(key) > -1) {
        const stateFarm = state.farms[key];
          store.dispatch({
            type: 'updateFarm',
            payload: {
              farmKey: key,
              farm: {
                ...stateFarm,
                loading: true
              }
            }
          });
        this.getStakingInfo(userAddress, farm.networkSymbol, farm.farmSymbol)
          .then((response)=>{
            store.dispatch({
              type: 'udpateFarm',
              payload: {
                farmKey: `${farm.networkSymbol}-${farm.farmSymbol}`,
                farm: {
                  ...response,
                  loading: false
                }
              }
            });
          });
      }
    });
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
  async getStakingInfo(userAddress, networkSymbol, farmSymbol, clearCache=false) {
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
    // console.log(
    //   key,
    //   epoch._length.toNumber(),
    //   epoch.number.toNumber(),
    //   epoch.endBlock.toNumber(),
    //   epoch.distribute.toNumber(),
    // )

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
    if (key === 'AVAX-TIME' || key === 'ARB-Z20' || key === 'AVAX-RUG' || key === 'AVAX-MAXI'
    || key === 'ONE-ODAO' || key === 'AVAX-LF') {
      currentIndex = Number(ethers.utils.formatUnits(currentIndex, 'gwei') / 4.5).toFixed(2);
      rawCurrentIndex = Number(ethers.utils.formatUnits(rawCurrentIndex, 'gwei')).toFixed(2);
    } else if (key === 'CRO-FORT') {
      currentIndex = Number(ethers.utils.formatUnits(currentIndex, 'gwei') / 16.1).toFixed(2);
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
    // console.log(key, stakingReward.toNumber(), circulatingSupply.toNumber(), stakingRebase)
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
    if (key === 'ETH-SQUID' || key === 'ETH-LOBI' || key == 'AVAX-OTWO') {
      const ethContract = this.loadCacheContract(farmParams.LPContractETH, PairContractAbi, networkParams.rpcURL);
      const ethReserves = await this.loadCahceContractCall(
        ethContract,
        'getReserves',
        [],
        clearCache
      );
      if(key === 'ETH-LOBI') {
        ethPrice = ethers.utils.formatUnits(ethReserves.reserve1, 'ether') / ethers.utils.formatUnits(ethReserves.reserve0, 'gwei');
        price = ethers.utils.formatUnits(reserves.reserve0, 'gwei') / ethers.utils.formatUnits(reserves.reserve1, 'gwei');
      } else if (key === 'AVAX-OTWO') {
        ethPrice = ethers.utils.formatUnits(ethReserves.reserve0, 'ether') / ethers.utils.formatUnits(ethReserves.reserve1, 'ether');
        price = ethers.utils.formatUnits(reserves.reserve0, 'ether') / ethers.utils.formatUnits(reserves.reserve1, 'gwei');
      } else {
        ethPrice = ethers.utils.formatUnits(ethReserves.reserve0, 'mwei') / ethers.utils.formatUnits(ethReserves.reserve1, 'ether');
        price = ethers.utils.formatUnits(reserves.reserve1, 'ether') / ethers.utils.formatUnits(reserves.reserve0, 'gwei');
      }
      price = Number(price) * ethPrice;
    } else if (key === 'MATIC-KLIMA' || key === 'MOVR-FHM' ) {
      price = ethers.utils.formatUnits(reserves.reserve0, 'mwei') / ethers.utils.formatUnits(reserves.reserve1, 'gwei');
    } else if(key === 'ARB-Z20' || key === 'ARB-UMAMI' || key === 'BSC-GYRO' || key === 'MOVR-MD' || key === 'ONE-EIGHT' || key === 'BSC-PID') {
      price = ethers.utils.formatUnits(reserves.reserve1, 'ether') / ethers.utils.formatUnits(reserves.reserve0, 'gwei');
    }else {
      if (token0 === farmParams.token) {
        price = ethers.utils.formatUnits(reserves.reserve1, 'ether') / ethers.utils.formatUnits(reserves.reserve0, 'gwei');
      } else {
        price = ethers.utils.formatUnits(reserves.reserve0, 'ether') / ethers.utils.formatUnits(reserves.reserve1, 'gwei');
      }
    }

    let fullBondTotal = 0;
    const getBondContract = async (bondParams) =>{
      const bondsContract = this.loadCacheContract(bondParams.address, BondContractAbi, networkParams.rpcURL);
      const bondInfo = await this.loadCahceContractCall(
        bondsContract,
        'bondInfo',
        [userAddress],
        clearCache
      );
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
      return {
        payout,
        pendingPayout,
        symbol: bondParams.symbol
      }
    }
    const bondPromises = farmParams.bondingContracts.map(getBondContract);
    const bonds = await Promise.all(bondPromises);

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

    let total = (tokenBalance + stakingTokenBalance + Number(fullBondTotal)) * price;
    if (key === 'MATIC-CLAM' || key === 'MATIC-CLAM2' || key === 'ONE-EIGHT' || key === 'AVAX-RUG') {
      const warmupInfo = await this.loadCahceContractCall(
        stakingContract,
        'warmupInfo',
        [userAddress],
        clearCache
      );
      const warmupDeposit = Number(ethers.utils.formatUnits(warmupInfo.deposit, 'gwei'));
      tokenBalance = tokenBalance = warmupDeposit;
      total = total + (warmupDeposit * price);
    }

    const currentBlock = await this.loadCacheBlockNumber(networkParams.rpcURL, clearCache);
    let seconds = 0;
    let distributeInterval = 0;
    const msPerDay = 86400;
    if (this.timeTemplates.indexOf(key) > -1) {
      seconds = epoch.distribute.toNumber() - (Date.now() / 1000);
      distributeInterval = msPerDay / epoch.endBlock.toNumber();
    } else if (key === 'MATIC-CLAM' || key === 'MATIC-CLAM2' || key === 'ONE-EIGHT' || key === 'CRO-FORT') {
      seconds = epoch.endBlock.toNumber() - (Date.now() / 1000);
      distributeInterval = msPerDay / epoch._length.toNumber();
    } else {
      distributeInterval = msPerDay / (epoch._length.toNumber() * networkParams.blockRateSeconds)
      seconds = this.secondsUntilBlock(currentBlock, epoch.endBlock.toNumber(), networkParams.blockRateSeconds);
    }
    let wrappedBalances = {};
    if(farmParams.wsOHMNetworks !== null) {
      wrappedBalances = await this.getwsOHMBalances(userAddress, farmParams.wsOHMNetworks, rawCurrentIndex, clearCache);
      total += wrappedBalances.total * price;
    }
    // console.log(key, distributeInterval)
    let data = {
      balances: {
        total: Number(total.toFixed(2)),
        tokenBalance,
        stakingTokenBalance,
        wrappedBalances,
        fullBondTotal: Number(fullBondTotal),
        bonds
      },
      stakingInfo: {
        nextRebase: this.prettifySeconds(seconds),
        distributeInterval,
        stakingRebase,
        rawPrice: Number(price.toFixed(2)),
        price: Number(price).toFixed(2),
        totalReserves: Number(totalReserves).toFixed(2),
        currentIndex,
        rawCurrentIndex,
        totalSupply: Number(ethers.utils.formatUnits(totalSupply, 'gwei')).toFixed(),
        circulatingSupply: Number(ethers.utils.formatUnits(circulatingSupply, 'gwei')).toFixed(),
        lockedValue: Number(ethers.utils.formatUnits(lockedValue, 'gwei')).toFixed(),
      }
    };
    data = this.formatFarmData(data);
    // console.log(key, data.stakingInfo.totalSupply, data.stakingInfo.circulatingSupply)
    return {
      networkSymbol,
      farmSymbol,
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
      const convertedBalance = Number(tokenBalance  * index);
      total += convertedBalance;
      return {
        symbol: data.networkSymbol,
        tokenBalance: Number(tokenBalance.toFixed(4)).toString(),
        convertedBalance: Number(convertedBalance.toFixed(4)).toString(),
      };
    };
    const wsOHMPromises = wsOHMNetworks.map(getBalances);
    const balances = await Promise.all(wsOHMPromises);
    return {
      total,
      balances
    };
  }
  formatFarmData(data) {
    const formatRebaseParams = [
      Number(data.balances?.stakingTokenBalance + data.balances?.wrappedBalances?.total),
      Number(data.balances?.fullBondTotal + data.balances.tokenBalance),
      Number(data.stakingInfo.price),
      data.stakingInfo.stakingRebase,
    ];
    return {
      ...data,
      balances: {
        ...data.balances,
        total: Number(data.balances.total).toLocaleString(),
        rawTotal: data.balances.total,
        disabled: data.balances.tokenBalance === 0 && data.balances.stakingTokenBalance === 0
      },
      stakingInfo: {
        ...data.stakingInfo,
        price: Number(data.stakingInfo.price).toLocaleString(),
        apy: Number((
          (Math.pow(1 + data.stakingInfo.stakingRebase,
            data.stakingInfo.distributeInterval * 365) - 1) * 100)
          .toFixed(0))
          .toLocaleString(),
        rawApy: Number((
          (Math.pow(1 + data.stakingInfo.stakingRebase,
            data.stakingInfo.distributeInterval * 365) - 1) * 100)
          .toFixed(0)),
        $TVL: (Number(data.stakingInfo.lockedValue) *
        Number(data.stakingInfo.price)).toLocaleString(),
        $Circ: (Number(data.stakingInfo.circulatingSupply) *
        Number(data.stakingInfo.price)).toLocaleString(),
        $MC: (Number(data.stakingInfo.totalSupply) *
        Number(data.stakingInfo.price)).toLocaleString(),
        rawMC: (Number(data.stakingInfo.totalSupply) *
        Number(data.stakingInfo.price)),
        $RFV: Number(data.stakingInfo.totalReserves).toLocaleString(),
        $BackedPrice: (Number(data.stakingInfo.totalReserves) /
        Number(data.stakingInfo.totalSupply)).toLocaleString()
      }
    }

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
    const key = `Contract/${address}`;
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
    const contractCallKey = `Contract/${contract.address}/${method}/${JSON.stringify(params)}`;
    if (cacheServiceInstance.has(contractCallKey) && !clearCache) {
      return cacheServiceInstance.get(contractCallKey);
    }
    const response = await contract[method](...params);
    cacheServiceInstance.set(contractCallKey, response);

    return response;
  }

  formatRebase(stakedBalance, otherBalance, price, stakingRebase, count) {
    const percent = (Math.pow(1 + stakingRebase, count) - 1);
    return {
      total: Number(
        ((otherBalance + (stakedBalance + (percent * stakedBalance))) * price).toFixed(2)
      ).toLocaleString(),
      tokenCount: Number(
        (stakedBalance + (percent * stakedBalance)).toFixed(9)
      ),
      percent: Number(
        (percent * 100).toFixed(4)
      ).toLocaleString()
    };
  }

  getRebaseBlock(currentBlock, interval) {
    return currentBlock + interval - (currentBlock % interval);
  }

  secondsUntilBlock(startBlock, endBlock, blockRateSeconds) {
    const blocksAway = endBlock - startBlock;
    const secondsAway = blocksAway * blockRateSeconds;
    return secondsAway;
  }

  prettifySeconds(seconds, resolution) {
    if (seconds !== 0 && !seconds) {
      return '';
    }

    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);

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

    return result;
  }
}
const formatRebase = (stakedBalance, otherBalance, price, stakingRebase, count) => {
  const percent = (Math.pow(1 + stakingRebase, count) - 1);
  return {
    profit: Number(
      (percent * stakedBalance * price).toFixed(2)
    ).toLocaleString(),
    total: Number(
      ((otherBalance + (stakedBalance + (percent * stakedBalance))) * price).toFixed(2)
    ).toLocaleString(),
    tokenCount: Number(
      (stakedBalance + (percent * stakedBalance)).toFixed(9)
    ),
    percent: Number(
      (percent * 100).toFixed(4)
    ).toLocaleString()
  };
};
const stakingInfo = new StakingInfo();
export {
  stakingInfo,
  formatRebase
};
