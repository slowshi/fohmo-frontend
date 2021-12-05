const combineBalances = (balances) => {
  if (typeof balances === 'undefined') return {
    bonds: [],
    fullBondTotal: 0,
    stakingTokenBalance: 0,
    tokenBalance: 0,
    wrappedBalances: {
      balances: [],
      total: 0
    }
  };
  return Object.keys(balances).reduce((acc, address) => {
    const balance = balances[address];
    let combinedBonds = [];
    if(typeof balance.bonds !== 'undefined' && typeof acc.bonds !== 'undefined') {
      combinedBonds = balance.bonds.reduce((bondAcc, bond, index)=> {
        bondAcc.push({
          payout: (acc.bonds[index]?.payout || 0) + bond.payout,
          pendingPayout: (acc.bonds[index]?.pendingPayout || 0) + bond.pendingPayout,
          symbol: bond.symbol
        })
        return bondAcc;
      },[])
    }
    let wrappedBalances = {
      balances: [],
      total: 0
    };
    // if(typeof balance.wrappedBalances !== 'undefined' && typeof acc.wrappedBalances !== 'undefined') {
    //   console.log(balance.wrappedBalances);
    //   wrappedBalances = Object.keys(balance.wrappedBalances).reduce((wrappedAcc, wrappedKey, index)=> {
    //     return {
    //       total: acc.wrappedBalances[index].total + balance.total,
    //       balances: []
    //     };
    //   },{
    //     balances: [],
    //     total: 0
    //   })
    // }
    return {
      bonds: combinedBonds,
      fullBondTotal: (acc.fullBondTotal || 0) + (balance.fullBondTotal || 0),
      stakingTokenBalance: (acc.stakingTokenBalance || 0) + (balance.stakingTokenBalance || 0),
      tokenBalance: (acc.tokenBalance || 0) + (balance.tokenBalances || 0),
      wrappedBalances
    };
  }, {
    bonds: [],
    fullBondTotal: 0,
    stakingTokenBalance: 0,
    tokenBalance: 0,
    wrappedBalances: {
      balances: [],
      total: 0
    }
  });
}
const formatRebase = (stakedBalance, otherBalance, price, stakingRebase, count) => {
  const percent = (Math.pow(1 + stakingRebase, count) - 1);
  return {
    profit: Number(
      (percent * stakedBalance * price).toFixed(2)
    ).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }),
    total: Number(
      ((otherBalance + (stakedBalance + (percent * stakedBalance))) * price)
    ).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
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
const getFarm = function(state, farmKey) {
  const currentFarm = state.farms[farmKey];
  const balances = state.balances[farmKey];
  const allBalances = combineBalances(balances);
  const rawPrice = currentFarm.data?.rawPrice || 0;
  const formattedBonds = allBalances.bonds.map((bond)=>{
    return {
      ...bond,
      payout: Number(bond.payout) === 0 ? 0 : bond.payout.toFixed(4),
      payoutInUSD: Number(bond.payout * rawPrice).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }),
      pendingPayout: Number(bond.pendingPayout) === 0 ? 0 : bond.pendingPayout.toFixed(4),
      pendingPayoutInUSD: Number(bond.pendingPayout * rawPrice).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }),
    };
  })
  if (currentFarm.data === null) return currentFarm;

  const formatRebaseParams = [
    //+ allBalances.wrappedBalances?.total
    Number(allBalances.stakingTokenBalance),
    Number(allBalances.fullBondTotal + allBalances.tokenBalance),
    Number(currentFarm.data.rawPrice),
    currentFarm.data.stakingRebase,
  ];
  let rawTotal = (
      allBalances.tokenBalance +
      allBalances.stakingTokenBalance +
      allBalances.fullBondTotal
    ) * currentFarm.data?.rawPrice;
  rawTotal = Number(rawTotal.toFixed(2));
  return {
    ...currentFarm,
    balances: {
      ...allBalances,
      bonds: formattedBonds,
      rawTotal,
      total: rawTotal.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },
    roiCalculations: {
      roiRebase: formatRebase(...formatRebaseParams, 1),
      roi5Day: formatRebase(
        ...formatRebaseParams,
        currentFarm.data.distributeInterval * 5),
      roiDynamic: formatRebase(
        ...formatRebaseParams,
        currentFarm.data.distributeInterval
        * currentFarm.roiDynamic)
    }
  }
}
const getRawTotal = function() {

}

export {
  combineBalances,
  getRawTotal,
  getFarm
}