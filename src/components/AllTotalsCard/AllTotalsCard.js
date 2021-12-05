

import {useSelector, useDispatch} from "react-redux";
import {memoizedAggregateTotals} from '../../utils/farmDecorator'
function AllTotalsCard() {
  const dispatch = useDispatch();
  const totalRoiDynamic = useSelector(state=> state.app.totalRoiDynamic)
  const hideTotals = useSelector(state => state.app.hideTotals);
  const aggregatedTotals = useSelector(memoizedAggregateTotals)

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