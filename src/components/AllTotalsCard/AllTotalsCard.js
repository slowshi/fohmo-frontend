

import {useSelector, useDispatch} from "react-redux";
import {getFarm} from '../../utils/farmDecorator'
function AllTotalsCard() {
  const dispatch = useDispatch();
  const totalRoiDynamic = useSelector(state=> state.app.totalRoiDynamic)
  const hideTotals = useSelector(state => state.app.hideTotals);
  const aggregatedTotals = useSelector((state)=> {
    let farms = [...Object.keys(state.farms)];
    if (state.app.farmFilters.length > 0) {
      farms = [...state.app.farmFilters];
    }
    const filteredFarms = farms.map((farmKey)=>getFarm(state, farmKey));
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
      const otherBalance = Number(farm.balances?.fullBondTotal + farm.balances?.tokenBalance);
      const adjustedTotal = stakedBalance + wrappedStakedBalance;
      const price = Number(farm.data?.rawPrice) || 0;
      const stakingRebase = farm.data?.stakingRebase || 0;
      const distributeInterval = farm.data?.distributeInterval || 0;
      const percent = (Math.pow(1 + stakingRebase, distributeInterval * state.app.totalRoiDynamic) - 1) || 0;
      const profit = (percent * adjustedTotal * price) || 0;
      const weightedPercent = percent * (farm.balances?.rawTotal / totalValue) || 0;
      const newTotal = ((otherBalance + (adjustedTotal + (percent * adjustedTotal))) * price) || 0;
      totalWeightedPercent += weightedPercent;
      totalProfit += profit;
      totalExpectedValue += newTotal;
    }, 0);
    if(state.app.hideTotals || Object.keys(state.app.addresses).length === 0) {
      document.title = `Fohmo.io`
    } else {
      document.title = `Fohmo.io - $${totalValue.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`
    }
    return {
      totalValue: Number(totalValue).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }),
      totalWeightedPercent: Number((totalWeightedPercent * 100)).toLocaleString(undefined, {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4
      }),
      totalProfit: Number(totalProfit).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }),
      totalExpectedValue: Number(totalExpectedValue).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    };
  })

  return (
    <div className="card">
      <div className="card-body">
        <span className="card-text d-flex h-auto justify-content-between align-items-center">
          <span>Total Value</span>
          {hideTotals ?
          <strong>$-</strong>
          :
          <strong>{`$${aggregatedTotals.totalValue}`}</strong>
          }
        </span>
        <input type="range" className="form-range" min="1" max="365" id="dynamic-roi" value={totalRoiDynamic} step="1"
          onInput={(e)=>dispatch({
            type: 'setTotalRoiDynamic',
            payload: e.target.value
          })}/>
        <span className="card-text d-flex h-auto justify-content-between align-items-center mb-2">
          <strong>{`${totalRoiDynamic} Day ROI`}</strong>
          <div className="align-items-end d-flex h-auto flex-column overflow-anywhere">
            <span>{`${aggregatedTotals.totalWeightedPercent}%`}</span>
            {hideTotals ?
            <span className="align-items-end d-flex h-auto flex-column overflow-anywhere">
              <span>$-</span>
              <span>+$-</span>
            </span>
            :
            <span className="align-items-end d-flex h-auto flex-column overflow-anywhere">
              <span>{`$${aggregatedTotals.totalExpectedValue}`}</span>
              <span>{`+$${aggregatedTotals.totalProfit}`}</span>
            </span>
            }
          </div>
        </span>
      </div>
    </div>
  )
}

export default AllTotalsCard;