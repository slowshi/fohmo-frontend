import {useSelector, useDispatch} from "react-redux";
import {networks} from '../../utils/constants'
import './StakingCard.css';
import {getMemoizedFarm} from '../../utils/farmDecorator'
import { stakingInfo } from "../../utils/stakingInfo";
function StakingCard(params) {
  const dispatch = useDispatch();
  const {farmSymbol, networkSymbol} = params;
  const farmKey = `${networkSymbol}-${farmSymbol}`;
  const hideTotals = useSelector(state => state.app.hideTotals);
  const hideBalanceData = useSelector(state => Object.keys(state.app.addresses).length === 0);
  const network = networks[networkSymbol];
  const farm = useSelector((state)=>getMemoizedFarm(farmKey)(state));
  const refreshData = async () => {
    dispatch({
      type: 'updateStakingInfo',
      payload: {
        farmKey,
        stakingInfo: {
          showBalances: false,
          showROI: false,
          loading: true,
          roiDynamic: 1
        }
      }
    });
    const response = await stakingInfo.doGetStakingInfo(networkSymbol, farmSymbol, true);
    dispatch({
      type: 'updateStakingInfo',
      payload: {
        farmKey,
        stakingInfo: {
          ...response,
          loading: false
        }
      }
    });
  };

  return (
    <div className="card mb-2">
      <div className="card-body">
        <h5 className="card-title">
          <div className="d-flex h-auto justify-content-between align-items-center">
            <span>
              {`${farm.constants.name} (${farmSymbol})`}
            </span>
            {!hideBalanceData ?
            <span>
              {hideTotals ? `$-` :`$${farm.balances?.total ?? `0`}`}
            </span>
            : ''}
          </div>
          <div>
            <span className={`badge badge-${networkSymbol}`}>
              {network.name}
            </span>
            <a className="btn text-dark btn-sm"
            target="__blank" href={farm.constants.link}>
                <i className="bi bi-box-arrow-up-right"></i>
            </a>
            <a className="btn text-dark btn-sm" target="__blank" href={`${network.chartURL}${farm.constants.LPContract}`}>
              <i className="bi bi-graph-down-arrow"></i>
            </a>
          </div>
        </h5>
        {farm.loading ?
          <div>
            <div className="text-placeholder placeholder w-100"></div>
            <div className="text-placeholder placeholder w-100"></div>
            <div className="text-placeholder placeholder w-100"></div>
            <div className="text-placeholder placeholder w-100"></div>
            <div className="text-placeholder placeholder w-100"></div>
            <div className="text-placeholder placeholder w-100"></div>
            <div className="text-placeholder placeholder w-100"></div>
            <div className="text-placeholder placeholder w-100"></div>
          </div>
        :
          <div>
            <span className="card-text d-flex h-auto justify-content-between align-items-center">
              <strong>Price</strong>
              <span>${farm.data?.price}</span>
            </span>
            <span className="card-text d-flex h-auto justify-content-between align-items-center">
              <strong>Next Rebase</strong>
              <span>{farm.data?.nextRebase}</span>
            </span>
            <span className="card-text d-flex h-auto justify-content-between align-items-center">
              <strong>Index</strong>
              <span>{farm.data?.currentIndex}</span>
            </span>
            <span className="card-text d-flex h-auto justify-content-between align-items-center">
              <strong>APY</strong>
              <span className="overflow-anywhere">{`${farm.data?.apy}%`}</span>
            </span>
            <span className="card-text d-flex h-auto justify-content-between align-items-center">
              <strong>Rebase ROI (5-day)</strong>
              <span>{`${farm.roiCalculations?.roiRebase.percent}% (${farm.roiCalculations?.roi5Day.percent}%)`}</span>
            </span>
            <span className="card-text d-flex h-auto justify-content-between align-items-center">
              <strong>TVL</strong>
              <span>{`$${farm.data?.$TVL}`}</span>
            </span>
            <span className="card-text d-flex h-auto justify-content-between align-items-center">
              <strong>Estimated MC (TS x P)</strong>
              <span>{`$${farm.data?.$MC}`}</span>
            </span>
            <span className="card-text d-flex h-auto justify-content-between align-items-center">
              <strong>Risk Free Value</strong>
              <span>{`$${farm.data?.$RFV}`}</span>
            </span>
          </div>
        }
      </div>
      <div className="card-footer">
        <div className="d-flex h-auto justify-content-between">
          <div>
            {!hideBalanceData ?
            <button type="button"
                    className={`btn btn-sm me-1 btn-outline-secondary ${farm.showBalances && 'active'}`}
                    onClick={()=>dispatch({type: 'toggleFarmBalance', payload: farmKey})}
                    disabled={farm.loading || hideTotals || hideBalanceData}>
              <i className="bi bi-currency-dollar" ></i>
            </button> : ''}
            <button className={`btn btn-sm btn-outline-secondary ${farm.showROI && 'active'}`} onClick={()=>dispatch({type: 'toggleFarmROI', payload: farmKey})}
              disabled={farm.loading}>
              <i className="bi bi-clock"></i>
            </button>
          </div>
          <div>
            <button
            onClick={refreshData}
            className="btn btn-sm btn-outline-secondary"
            disabled={farm.loading}>
              <i className="bi bi-arrow-clockwise"></i>
            </button>
          </div>
        </div>
        {
          farm.showBalances && !hideTotals && !hideBalanceData &&
          <div>
            <hr></hr>
            <span className="card-text d-flex h-auto justify-content-between align-items-center">
              <strong>{farmSymbol}</strong>
              <span>{farm.balances?.tokenBalance}</span>
            </span>
            <span className="card-text d-flex h-auto justify-content-between align-items-center">
              <strong>{farm.constants.stakingSymbol}</strong>
              <span>{farm.balances?.stakingTokenBalance}</span>
            </span>
            {/* {farm.constants.wsOHMNetworks.length ? <hr></hr> : ''}
            {
              farm.balances?.wrappedBalances.balances.map((wrappedBalance, index)=>
                <span key={index} className="card-text d-flex h-auto justify-content-between align-items-center mb-1">
                  <strong>{`${farmSymbol === 'OHM' && index < 3 ? 'wsOHM' : farm.constants.wsOHMSymbol} (${wrappedBalance.symbol})`}</strong>
                  <div className="align-items-end d-flex h-auto flex-column overflow-anywhere">
                    <span>{`${wrappedBalance.tokenBalance} ${farmSymbol === 'OHM' && index < 3 ? 'wsOHM' : farm.constants.wsOHMSymbol}`}</span>
                    <span>{`(${wrappedBalance.convertedBalance} ${farmSymbol})`}</span>
                  </div>
                </span>)
            } */}
            <hr></hr>
            {
              farm.balances?.bonds.map((bondData, index)=>
              <span key={index} className="card-text d-flex h-auto justify-content-between align-items-center mb-1">
              <strong>{bondData.symbol}</strong>
              <div className="align-items-end d-flex h-auto flex-column">
                <div>{`${bondData.pendingPayout} ${farmSymbol}`} <strong>C</strong></div>
                <div className="mb-1 txt-smol">(${bondData.pendingPayoutInUSD})</div>
                <div>{`${bondData.payout} ${farmSymbol}`} <strong>P</strong></div>
                <div className="mb-1 txt-smol">(${bondData.payoutInUSD})</div>
              </div>
            </span>)
            }
          </div>
        }
        {
          farm.showROI &&
          <div>
            <hr></hr>
            <span className="card-text d-flex h-auto justify-content-between align-items-center mb-2">
              <strong>Next Rebase</strong>
              <div className="align-items-end d-flex h-auto flex-column">
                <span>{`${farm.roiCalculations?.roiRebase.percent}%`}</span>
                {!hideTotals ?
                  <span className="align-items-end d-flex h-auto flex-column overflow-anywhere">
                    <span>{`${farm.roiCalculations?.roiRebase.tokenCount} ${farmSymbol}`}</span>
                    <span>{`$${farm.roiCalculations?.roiRebase.total}`}</span>
                    <span>{`+$${farm.roiCalculations?.roiRebase.profit}`}</span>
                  </span>
                 :
                 <span className="align-items-end d-flex h-auto flex-column overflow-anywhere">
                   <span>{`- ${farmSymbol}`}</span>
                   <span>$-</span>
                   <span>+$-</span>
                 </span>
                }
              </div>
            </span>
            <div>
              <input type="range"
              className="form-range"
               min="1" max="365" id="dynamic-roi" step="1"
               value={farm.roiDynamic}
               onInput={(e)=>dispatch({
                  type: 'setRoiDynamic',
                  payload: {farmKey,roiDynamic: e.target.value}
                })}/>
            </div>
            <span className="card-text d-flex h-auto justify-content-between align-items-center mb-2">
              <strong>{`${farm.roiDynamic} Day ROI`}</strong>
              <div className="align-items-end d-flex h-auto flex-column overflow-anywhere">
                <span>{farm.roiCalculations?.roiDynamic.percent}%</span>
                {!hideTotals ?
                <span className="align-items-end d-flex h-auto flex-column overflow-anywhere">
                  <span>{farm.roiCalculations?.roiDynamic.tokenCount} ${farmSymbol}</span>
                  <span>${farm.roiCalculations?.roiDynamic.total}</span>
                  <span>+${farm.roiCalculations?.roiDynamic.profit}</span>
                </span>
                :
                <span className="align-items-end d-flex h-auto flex-column overflow-anywhere">
                  <span>-{farmSymbol}</span>
                  <span>$-</span>
                  <span>+$-</span>
                </span>
                }
              </div>
            </span>
          </div>
        }
      </div>
    </div>
  )
}

export default StakingCard;