import {createSelector} from 'reselect';
import { fiatCurrencyMap } from './constants';
// import {sortMap} from './constants';
const getFarm = function(farm, balances, addresses, fiatCurrency) {
  const currency = fiatCurrencyMap[fiatCurrency].label;
  let fractionDigits = 2;
  if(currency === 'ETH' || currency === 'BTC') {
    fractionDigits = 8;
  }
  const currentFarm = {
    ...farm,
    data: formatStakingInfo(farm.data, currency)
  }
  const allBalances = combineBalances(balances, addresses, fiatCurrency);
  const rawPrice = currentFarm.data?.rawPrice || 0;
  const formattedBonds = allBalances.bonds.map((bond)=>{
    return {
      ...bond,
      payout: Number(bond.payout) === 0 ? 0 : bond.payout.toFixed(4),
      payoutInUSD: Number(bond.payout * rawPrice).toLocaleString(undefined, {
        style: 'currency',
        currency,
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits
      }),
      pendingPayout: Number(bond.pendingPayout) === 0 ? 0 : bond.pendingPayout.toFixed(4),
      pendingPayoutInUSD: Number(bond.pendingPayout * rawPrice).toLocaleString(undefined, {
        style: 'currency',
        currency,
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits
      }),
    };
  });
  const formattedWrappedBalances = allBalances.wrappedBalances.balances.map((bond)=>{
    return {
      ...bond,
      convertedBalance: Number(bond.convertedBalance) === 0 ? 0 : bond.convertedBalance.toFixed(4),
      convertedBalanceInUSD: Number(bond.convertedBalance * rawPrice).toLocaleString(undefined, {
        style: 'currency',
        currency,
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits
      }),
      tokenBalance: Number(bond.tokenBalance) === 0 ? 0 : bond.tokenBalance.toFixed(4)
    };
  })
  const formattedCollateralBalances = allBalances.collateralBalances.balances.map((bond)=>{
    return {
      ...bond,
      convertedBalance: Number(bond.convertedBalance) === 0 ? 0 : bond.convertedBalance.toFixed(4),
      convertedBalanceInUSD: Number(bond.convertedBalance * rawPrice).toLocaleString(undefined, {
        style: 'currency',
        currency,
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits
      }),
      tokenBalance: Number(bond.tokenBalance) === 0 ? 0 : bond.tokenBalance.toFixed(4)
    };
  })
  if (currentFarm.data === null) return currentFarm;

  const formatRebaseParams = [
    Number(allBalances.stakingTokenBalance + allBalances.wrappedBalances?.total + allBalances.collateralBalances?.total + allBalances.wsOHMPoolBalance.convertedBalance),
    Number(allBalances.fullBondTotal + allBalances.tokenBalance),
    Number(currentFarm.data.rawPrice),
    currentFarm.data.stakingRebase,
  ];
  let rawTotal = (
      allBalances.tokenBalance +
      allBalances.stakingTokenBalance +
      allBalances.fullBondTotal +
      // allBalances.warmupBalance +
      allBalances.wsOHMPoolBalance.convertedBalance +
      allBalances.wrappedBalances.total +
      allBalances.collateralBalances.total
    ) * currentFarm.data?.rawPrice;
  rawTotal = Number(rawTotal);

  const formattedAllBalances = currentFarm.treasuryBalance?.allBalances
  .map((balance) => {
    let value = balance.value;
    if(balance.symbol.indexOf('-') > -1 && !balance.converted) {
      value = balance.value * currentFarm.data?.rawPrice;
    }
    const valueInUSD = Number(value).toLocaleString(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits
    })
    return {
      ...balance,
      valueInUSD
    };
  });
  const rawTreasuryTotal = currentFarm.treasuryBalance?.usdTreasuryValues +
  (currentFarm.treasuryBalance?.ohmTreasuryValues * currentFarm.data?.rawPrice);
  const rawBackingPrice = Number(rawTreasuryTotal / currentFarm.data?.totalSupply);

  const treasuryRunway = rawTreasuryTotal / currentFarm.data?.circulatingSupply;
  const runway = (Math.log(treasuryRunway) / Math.log(1 + currentFarm.data?.stakingRebase) / currentFarm.data?.distributeInterval).toFixed(2);

  const treasuryBalance = {
    ...currentFarm.treasuryBalance,
    allBalances: formattedAllBalances,
    priceBackingRatio: (currentFarm.data?.rawPrice / rawBackingPrice).toFixed(2),
    rawBackingPrice,
    runway,
    backingPrice: Number(rawTreasuryTotal / currentFarm.data?.totalSupply)
    .toLocaleString(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits
    }),
    rawTreasuryTotal,
    rfvInUSD: Number(currentFarm.treasuryBalance?.rfv).toLocaleString(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }),
    total: Number(rawTreasuryTotal).toLocaleString(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })
  };
  return {
    ...currentFarm,
    treasuryBalance,
    balances: {
      ...allBalances,
      bonds: formattedBonds,
      wrappedBalances: {
        ...allBalances.wrappedBalances,
        balances: formattedWrappedBalances
      },
      collateralBalances: {
        ...allBalances.collateralBalances,
        balances: formattedCollateralBalances
      },
      wsOHMPoolBalance: {
        ...allBalances.wsOHMPoolBalance,
        tokenBalance: Number(allBalances.wsOHMPoolBalance.tokenBalance) === 0 ? 0 :allBalances.wsOHMPoolBalance.tokenBalance.toFixed(4),
        convertedBalanceInUSD: Number(allBalances.wsOHMPoolBalance.convertedBalance * rawPrice).toLocaleString(undefined, {
          style: 'currency',
          currency,
          minimumFractionDigits: fractionDigits,
          maximumFractionDigits: fractionDigits
        }),
      },
      rawTotal,
      warmupBalance: Number(allBalances.warmupBalance) === 0 ? 0 :allBalances.warmupBalance.toFixed(4),
      warmupBalanceInUSD: Number(allBalances.warmupBalance * rawPrice).toLocaleString(undefined, {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits
      }),
      fullPendingBondTotal: Number(allBalances.fullPendingBondTotal) === 0 ? 0 :allBalances.fullPendingBondTotal.toFixed(4),
      fullPendingBondTotalInUSD: Number(allBalances.fullPendingBondTotal * rawPrice).toLocaleString(undefined, {
        style: 'currency',
        currency,
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits
      }),
      stakingTokenBalance: Number(allBalances.stakingTokenBalance) === 0 ? 0 :allBalances.stakingTokenBalance.toFixed(4),
      stakingTokenBalanceInUSD: Number(allBalances.stakingTokenBalance * rawPrice).toLocaleString(undefined, {
        style: 'currency',
        currency,
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits
      }),
      tokenBalance: Number(allBalances.tokenBalance) === 0 ? 0 :allBalances.tokenBalance.toFixed(4),
      tokenBalanceInUSD: Number(allBalances.tokenBalance * rawPrice).toLocaleString(undefined, {
        style: 'currency',
        currency,
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits
      }),
      total: rawTotal.toLocaleString(undefined, {
        style: 'currency',
        currency,
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits
      })
    },
    roiCalculations: {
      roiRebase: formatRebase(...formatRebaseParams, 1, currency),
      roi5Day: formatRebase(
        ...formatRebaseParams,
        currentFarm.data.distributeInterval * 5,
        currency),
      roiDynamic: formatRebase(
        ...formatRebaseParams,
        currentFarm.data.distributeInterval * currentFarm.roiDynamic,
        currency)
    }
  }
}
const combineBalances = (balances, addresses) => {
  if (typeof balances === 'undefined') return {
    bonds: [],
    fullBondTotal: 0,
    fullPendingBondTotal: 0,
    stakingTokenBalance: 0,
    warmupBalance: 0,
    tokenBalance: 0,
    wsOHMPoolBalance: {
      tokenBalance: 0,
      convertedBalance: 0
    },
    wrappedBalances: {
      balances: [],
      total: 0
    },
    collateralBalances: {
      balances: [],
      total: 0
    }
  };
  return Object.keys(balances).reduce((acc, address) => {
    if(!addresses[address]) return acc;
    const balance = balances[address];
    let combinedBonds = [];
    let wrappedBalanceTotals = 0;
    let wrappedBalanceList = [];
    let collateralBalanceTotals = 0;
    let collateralBalanceList = [];
    if(typeof balance.bonds !== 'undefined' && typeof acc.bonds !== 'undefined') {
      combinedBonds = balance.bonds.reduce((bondAcc, bond, index)=> {
        bondAcc.push({
          payout: (acc.bonds[index]?.payout || 0) + bond.payout,
          pendingPayout: (acc.bonds[index]?.pendingPayout || 0) + bond.pendingPayout,
          symbol: bond.symbol,
          lastTime: bond.lastTime
        })
        return bondAcc;
      },[])
    }
    if(typeof balance.wrappedBalances !== 'undefined' && typeof acc.wrappedBalances !== 'undefined') {
      wrappedBalanceList = balance.wrappedBalances.balances.reduce((balanceAcc, balance, index)=> {
        balanceAcc.push({
          convertedBalance: (acc.wrappedBalances.balances[index]?.convertedBalance || 0) + balance.convertedBalance,
          tokenBalance: (acc.wrappedBalances.balances[index]?.tokenBalance || 0) + balance.tokenBalance,
          symbol: balance.symbol
        })
        return balanceAcc;
      },[])
      wrappedBalanceTotals = acc.wrappedBalances.total + balance.wrappedBalances.total
    }
    if(typeof balance.collateralBalances !== 'undefined' && typeof acc.collateralBalances !== 'undefined') {
      collateralBalanceList = balance.collateralBalances.balances.reduce((balanceAcc, balance, index)=> {
        balanceAcc.push({
          convertedBalance: (acc.collateralBalances.balances[index]?.convertedBalance || 0) + balance.convertedBalance,
          tokenBalance: (acc.collateralBalances.balances[index]?.tokenBalance || 0) + balance.tokenBalance,
          symbol: balance.symbol
        })
        return balanceAcc;
      },[])
      collateralBalanceTotals = acc.collateralBalances.total + balance.collateralBalances.total
    }
    return {
      bonds: combinedBonds,
      fullBondTotal: (acc.fullBondTotal || 0) + (balance.fullBondTotal || 0),
      fullPendingBondTotal: (acc.fullPendingBondTotal || 0) + (balance.fullPendingBondTotal || 0),
      stakingTokenBalance: (acc.stakingTokenBalance || 0) + (balance.stakingTokenBalance || 0),
      tokenBalance: (acc.tokenBalance || 0) + (balance.tokenBalance || 0),
      warmupBalance: (acc.warmupBalance || 0) + (balance.warmupBalance || 0),
      wsOHMPoolBalance: {
        tokenBalance: (acc.wsOHMPoolBalance.tokenBalance || 0) + (balance.wsOHMPoolBalance.tokenBalance || 0),
        convertedBalance: (acc.wsOHMPoolBalance.convertedBalance || 0) + (balance.wsOHMPoolBalance.convertedBalance || 0)
      },
      wrappedBalances: {
        total: wrappedBalanceTotals,
        balances: wrappedBalanceList
      },
      collateralBalances: {
        total: collateralBalanceTotals,
        balances: collateralBalanceList
      },
    };
  }, {
    bonds: [],
    fullBondTotal: 0,
    fullPendingBondTotal: 0,
    stakingTokenBalance: 0,
    tokenBalance: 0,
    warmupBalance: 0,
    wsOHMPoolBalance: {
      tokenBalance: 0,
      convertedBalance: 0
    },
    wrappedBalances: {
      balances: [],
      total: 0
    },
    collateralBalances: {
      balances: [],
      total: 0
    }
  });
}
const formatRebase = (stakedBalance, otherBalance, price, stakingRebase, count, currency) => {
  let fractionDigits = 2;
  if(currency === 'ETH' || currency === 'BTC') {
    fractionDigits = 8;
  }
  const percent = (Math.pow(1 + stakingRebase, count) - 1);
  return {
    tokenProfit: Number(
      (percent * stakedBalance)
    ).toLocaleString(undefined, {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4
    }),
    profit: Number(
      (percent * stakedBalance * price)
    ).toLocaleString(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits
    }),
    total: Number(
      ((otherBalance + (stakedBalance + (percent * stakedBalance))) * price)
    ).toLocaleString(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits
    }),
    tokenCount: Number(
      (stakedBalance + (percent * stakedBalance)).toFixed(4)
    ),
    percent: Number(
      (percent * 100)
    ).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  };
};
const formatStakingInfo = (stakingInfo, currency) => {
  let fractionDigits = 2;
  if(currency === 'ETH' || currency === 'BTC') {
    fractionDigits = 8;
  }
  if(stakingInfo === null) return stakingInfo;
  // console.log('stakingReward/circulatingSupply', stakingInfo.stakingRebase);
  // console.log('rebases per day', stakingInfo.distributeInterval);
  // console.log('1 Rebase',Number((
  //   (Math.pow(1 + stakingInfo.stakingRebase,
  //     1) - 1) * 100)
  //   .toFixed(4))
  //   .toLocaleString());
  return {
    ...stakingInfo,
    price: Number(stakingInfo.rawPrice).toLocaleString(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits
    }),
    apy: Number((
      (Math.pow(1 + stakingInfo.stakingRebase,
        stakingInfo.distributeInterval * 365) - 1) * 100)
      .toFixed(0))
      .toLocaleString(),
    rawApy: Number((
      (Math.pow(1 + stakingInfo.stakingRebase,
        stakingInfo.distributeInterval * 365) - 1) * 100)
      .toFixed(0)),
    rawTVL:(Number(stakingInfo.lockedValue) *
    Number(stakingInfo.rawPrice)),
    $LPLiquidity: Number(stakingInfo.rawLPLiquidity)
    .toLocaleString(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }),
    $TVL: (Number(stakingInfo.lockedValue) *
    Number(stakingInfo.rawPrice)).toLocaleString(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }),
    $Staked: (Number(stakingInfo.circulatingSupply) /
    Number(stakingInfo.totalSupply)).toLocaleString(undefined, {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }),
    $Circ: (Number(stakingInfo.circulatingSupply) *
    Number(stakingInfo.rawPrice)).toLocaleString(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }),
    $MC: (Number(stakingInfo.totalSupply) *
    Number(stakingInfo.rawPrice)).toLocaleString(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }),
    rawMC: (Number(stakingInfo.totalSupply) *
    Number(stakingInfo.rawPrice)),
    $RFV: Number(stakingInfo.totalReserves).toLocaleString(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }),
    $BackedPrice: (Number(stakingInfo.totalReserves) /
    Number(stakingInfo.totalSupply)).toLocaleString()
  }
};
const getMemoizedFarm = (farmKey) => createSelector(
  (state)=> state.farms[farmKey],
  (state) => state.balances[farmKey],
  (state) => state.app.addresses,
  (state) => state.app.fiatCurrency,
  (farm, balances, addresses, fiatCurrency) => {
    return getFarm(farm, balances, addresses, fiatCurrency);
  }
)

export {
  combineBalances,
  getFarm,
  formatRebase,
  getMemoizedFarm
}