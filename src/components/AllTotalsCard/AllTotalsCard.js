

import {useSelector, useDispatch} from "react-redux";
import {fiatCurrencyMap} from "../../utils/constants";

function AllTotalsCard() {
  const dispatch = useDispatch();
  const totalRoiDynamic = useSelector(state=> state.app.totalRoiDynamic)
  const hideTotals = useSelector(state => state.app.hideTotals);
  const currency = useSelector(state => fiatCurrencyMap[state.app.fiatCurrency].label);
  let fractionDigits = 2;
  if(currency === 'ETH' || currency === 'BTC') {
    fractionDigits = 8;
  }
  const aggregatedTotals = useSelector((state)=>{
    const farms = state.farms;
    const farmFilters = state.app.farmFilters;
    const totalRoiDynamic = state.app.totalRoiDynamic;
    const hideTotals = state.app.hideTotals;
    const addresses = state.app.addresses;
    let allFarms = [...Object.keys(farms)];
    if (farmFilters.length > 0) {
      allFarms = [...farmFilters];
    }
    const filteredFarms = allFarms.map((farmKey)=>farms[farmKey]);
    const totalValue = filteredFarms.reduce((acc, farm)=> {
      acc += farm.balances?.rawTotal || 0;
      return acc;
    }, 0);
    let totalWeightedPercent = 0;
    let totalProfit = 0;
    let totalExpectedValue = 0;
    filteredFarms.forEach((farm)=> {
      const stakedBalance = Number(farm.balances?.stakingTokenBalance) || 0;
      const wrappedStakedBalance = Number(farm.balances?.wrappedBalances?.total) || 0;
      const collateralBalance = Number(farm.balances?.collateralBalances?.total) || 0;
      const otherBalance = Number(farm.balances?.fullBondTotal + Number(farm.balances?.tokenBalance));
      const wsOHMPoolBalance = Number(farm.balances?.wsOHMPoolBalance?.convertedBalance) || 0;
      const adjustedTotal = stakedBalance + wrappedStakedBalance + collateralBalance + wsOHMPoolBalance;
      const price = Number(farm.data?.rawPrice) || 0;
      const stakingRebase = farm.data?.stakingRebase || 0;
      const distributeInterval = farm.data?.distributeInterval || 0;
      const percent = (Math.pow(1 + stakingRebase, distributeInterval * totalRoiDynamic) - 1) || 0;
      const profit = (percent * adjustedTotal * price) || 0;
      const weightedPercent = percent * (farm.balances?.rawTotal / totalValue) || 0;
      const newTotal = ((otherBalance + (adjustedTotal + (percent * adjustedTotal))) * price) || 0;
      totalWeightedPercent += weightedPercent;
      totalProfit += profit;
      totalExpectedValue += newTotal;
    }, 0);
    if(hideTotals || Object.keys(addresses).length === 0) {
      document.title = `Fohmo.io`
    } else {
      document.title = `Fohmo.io - ${totalValue.toLocaleString(undefined, {
        style: 'currency',
        currency,
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits
      })}`
    }
    return {
      totalValue: Number(totalValue).toLocaleString(undefined, {
        style: 'currency',
        currency,
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits
      }),
      totalWeightedPercent: Number((totalWeightedPercent * 100)).toLocaleString(undefined, {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4
      }),
      totalProfit: Number(totalProfit).toLocaleString(undefined, {
        style: 'currency',
        currency,
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits
      }),
      totalExpectedValue: Number(totalExpectedValue).toLocaleString(undefined, {
        style: 'currency',
        currency,
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits
      })
    };
  })

  return (
    <div className="card">
      <div className="card-body">
        <span className="card-text d-flex h-auto justify-content-between align-items-center">
          <span>Total Value</span>
          {hideTotals ?
          <strong>-</strong>
          :
          <strong>{aggregatedTotals.totalValue}</strong>
          }
        </span>
        <input type="range" className="form-range" min="1" max="365" id="dynamic-roi" value={totalRoiDynamic} step="1"
          onInput={(e)=>dispatch({
            type: 'setTotalRoiDynamic',
            payload: e.target.value
          })}/>
        <span className="card-text d-flex h-auto justify-content-between align-items-center mb-2">
          <strong>{`${totalRoiDynamic} Day ROI`}</strong>
          <div className="align-items-end d-flex h-auto flex-column overflow-hidden">
            <span>{`${aggregatedTotals.totalWeightedPercent}%`}</span>
            {hideTotals ?
            <span className="align-items-end d-flex h-auto flex-column overflow-hidden">
              <span>-</span>
              <span>-</span>
            </span>
            :
            <span className="align-items-end d-flex h-auto flex-column overflow-hidden">
              <span>{aggregatedTotals.totalExpectedValue}</span>
              <span className="txt-smol">(+{aggregatedTotals.totalProfit})</span>
            </span>
            }
          </div>
        </span>
      </div>
    </div>
  )
}

export default AllTotalsCard;