import {useSelector, useDispatch} from "react-redux";
import {networks} from '../../utils/constants'
import './StakingCard.css';
import {getMemoizedFarm} from '../../utils/farmDecorator'
import { stakingInfo } from "../../utils/stakingInfo";
import pageLoad from '../../utils/pageLoad';

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
  const farmFilters = useSelector((state)=>state.app.farmFilters);
  const removeFilter = () => {
    if(farmFilters.length === 0) return;
    const index = farmFilters.indexOf(farmKey);
    let newFilters = [];
    if (index > -1) {
      newFilters = [
        ...farmFilters.slice(0, index),
        ...farmFilters.slice(index + 1)
      ];
    } else {
      newFilters = [
        ...farmFilters,
        farmKey
      ];
    }
    dispatch({
      type: 'setFarmFilters',
      payload: newFilters
    });
    pageLoad();
  }
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
              {hideTotals ? `-` :`${farm.balances?.total ?? 0}`}
            </span>
            : ''}
          </div>
          <div>
            <span className={`badge badge-${networkSymbol}`}>
              {network.name}
            </span>
            <a className="btn text-dark btn-sm"
            target="_blank" rel="noreferrer" href={farm.constants.link}>
                <i className="bi bi-box-arrow-up-right"></i>
            </a>
            <a className="btn text-dark btn-sm" target="_blank" rel="noreferrer" href={`${network.chartURL}${farm.constants.LPContract}`}>
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
            <div className="text-placeholder placeholder w-100"></div>
            <div className="text-placeholder placeholder w-100"></div>
          </div>
        :
          <div>
            <span className="card-text d-flex h-auto justify-content-between align-items-center">
              <strong>Price</strong>
              <span>{farm.data?.price}</span>
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
              <strong>Rebases per day</strong>
              <span>{(farm.data?.distributeInterval).toLocaleString(undefined, {
                      maximumFractionDigits: 2
                    })}</span>
            </span>
            <span className="card-text d-flex h-auto justify-content-between align-items-center">
              <strong>TVL</strong>
              <span>{farm.data?.$TVL}</span>
            </span>
            <span className="card-text d-flex h-auto justify-content-between align-items-center">
              <strong>Estimated MC</strong>
              <span>{farm.data?.$MC}</span>
            </span>
            <span className="card-text d-flex h-auto justify-content-between align-items-center">
              <strong>Risk Free Value</strong>
              <span>{farm.data?.$RFV}</span>
            </span>
            <span className="card-text d-flex h-auto justify-content-between align-items-center">
              <strong>LP Liquidity</strong>
              <span>{farm.data?.$LPLiquidity}</span>
            </span>
          </div>
        }
      </div>
      <div className="card-footer">
        <div className="d-flex h-auto justify-content-between">
            {!hideBalanceData ?
            <div>
              <button type="button"
                      title="Staking Info"
                      className={`btn btn-sm me-1 btn-outline-secondary ${farm.showBalances && 'active'}`}
                      onClick={()=>dispatch({type: 'toggleFarmBalance', payload: farmKey})}
                      disabled={farm.loading || hideTotals || hideBalanceData}>
                <i className="bi bi-currency-dollar" ></i>
              </button>
              <button title="ROI Info" className={`btn btn-sm btn-outline-secondary ${farm.showROI && 'active'}`} onClick={()=>dispatch({type: 'toggleFarmROI', payload: farmKey})}
                disabled={farm.loading}>
                <i className="bi bi-clock"></i>
              </button>
            </div>
            : <div></div>}
          <div>
            {farmFilters.length > 0 ?
            <button title="Remove" className="btn btn-sm btn-outline-secondary me-1"
            onClick={removeFilter}
            disabled={farmFilters.length === 1}>
              <i className="bi bi-x"></i>
            </button>
            : ''}
            <button
            title="Refresh"
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
            <span className="card-text d-flex h-auto justify-content-between align-items-top">
              <strong>{farmSymbol}</strong>
              <div className="align-items-end d-flex h-auto flex-column">
                <span>{farm.balances?.tokenBalance}</span>
                <span className="mb-1 txt-smol">({farm.balances?.tokenBalanceInUSD})</span>
              </div>
            </span>
            {farm.balances?.warmupBalance > 0 ?
              <div>
                <div className="txt-smol">Warmup</div>
                <span className="card-text d-flex h-auto justify-content-between align-items-top">
                  <strong>{farm.constants.stakingSymbol}</strong>
                  <div className="align-items-end d-flex h-auto flex-column">
                  <span>{farm.balances?.warmupBalance}</span>
                    <span className="mb-1 txt-smol">({farm.balances?.warmupBalanceInUSD})</span>
                  </div>
                </span>
              </div>: ''
            }
            <span className="card-text d-flex h-auto justify-content-between align-items-top">
              <strong>{farm.constants.stakingSymbol}</strong>
              <div className="align-items-end d-flex h-auto flex-column">
              <span>{farm.balances?.stakingTokenBalance}</span>
                <span className="mb-1 txt-smol">({farm.balances?.stakingTokenBalanceInUSD})</span>
              </div>
            </span>
            {farm.constants.wsOHMNetworks.length ?
            <div>
              <hr></hr>
              {
                farm.balances?.wrappedBalances.balances.map((wrappedBalance, index)=>
                  <span key={index} className="card-text d-flex h-auto justify-content-between align-items-top mb-1">
                    <strong>{`${farmSymbol === 'OHM' && index < 3 ? 'wsOHM' : farm.constants.wsOHMSymbol} (${wrappedBalance.symbol})`}</strong>
                    <div className="align-items-end d-flex h-auto flex-column overflow-anywhere">
                      <span>{`${wrappedBalance.tokenBalance} ${farmSymbol === 'OHM' && index < 3 ? 'wsOHM' : farm.constants.wsOHMSymbol}`}</span>
                      <span className="mb-1 txt-smol">{`(${wrappedBalance.convertedBalanceInUSD})`}</span>
                    </div>
                  </span>)
              }
            </div>
            : ''}
            {typeof farm.constants.cauldrons !== 'undefined' && farm.constants.cauldrons.length ?
              <div>
                <hr></hr>
                <div className="txt-smol">Collateral</div>
                {
                  farm.balances?.collateralBalances?.balances.map((wrappedBalance, index)=>
                    <span key={index} className="card-text d-flex h-auto justify-content-between align-items-top mb-1">
                      <strong>{`${farmSymbol === 'OHM' && index < 3 ? 'wsOHM' : farm.constants.wsOHMSymbol} (${wrappedBalance.symbol})`}</strong>
                      <div className="align-items-end d-flex h-auto flex-column overflow-anywhere">
                        <span>{`${wrappedBalance.tokenBalance} ${farmSymbol === 'OHM' && index < 3 ? 'wsOHM' : farm.constants.wsOHMSymbol}`}</span>
                        <span className="mb-1 txt-smol">{`(${wrappedBalance.convertedBalanceInUSD})`}</span>
                      </div>
                    </span>)
                }
              </div>
              : ''}
            <hr></hr>
            {
              farm.balances?.bonds.map((bondData, index)=>
              <span key={index} className="card-text d-flex h-auto justify-content-between align-items-center mb-1">
              <strong>{bondData.symbol}</strong>
              <div className="align-items-end d-flex h-auto flex-column">
                <div>{`${bondData.pendingPayout} ${farmSymbol}`} <strong>C</strong></div>
                <div className="mb-1 txt-smol">({bondData.pendingPayoutInUSD})</div>
                <div>{`${bondData.payout} ${farmSymbol}`} <strong>P</strong></div>
                <div className="mb-1 txt-smol">({bondData.payoutInUSD})</div>
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
                    <span>{farm.roiCalculations?.roiRebase.total}</span>
                    <span className="txt-smol align-items-end d-flex h-auto flex-column overflow-anywhere">
                      <div>+{farm.roiCalculations?.roiRebase.tokenProfit} {farmSymbol}</div>
                      <div>+{farm.roiCalculations?.roiRebase.profit}</div>
                    </span>
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
                  <span>{farm.roiCalculations?.roiDynamic.total}</span>
                  <span className="txt-smol align-items-end d-flex h-auto flex-column overflow-anywhere">
                    <div>+{farm.roiCalculations?.roiDynamic.tokenProfit} {farmSymbol}</div>
                    <div>+{farm.roiCalculations?.roiDynamic.profit}</div>
                  </span>
                </span>
                :
                <span className="align-items-end d-flex h-auto flex-column overflow-anywhere">
                  <span>-{farmSymbol}</span>
                  <span>-</span>
                  <span>-</span>
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