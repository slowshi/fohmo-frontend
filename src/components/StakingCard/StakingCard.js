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
          <div className="d-flex h-auto justify-content-between align-items-top">
            <span className="d-flex flex-column align-items-end">
              <span>{`${farm.constants.name} (${farm.constants.symbol})`}</span>
              <span className="claimable-placeholder"></span>
            </span>
            {!hideBalanceData ?
            <span>
              {hideTotals ? `-` :
                <span className="d-flex flex-column align-items-end">
                  <span>{farm.balances?.total ?? 0}</span>
                  {farm.balances?.fullPendingBondTotal > 0 ? <span className="txt-smol">Claimable: ({farm.balances?.fullPendingBondTotalInUSD})</span> : <span className="claimable-placeholder"></span>}
                </span>
              }
            </span>
            : ''}
          </div>
          <div className="d-flex justify-content-between align-items-center">
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
            {farm.constants.rugged ?
            <span className={`badge btn-danger`}>
              RUGGED
            </span>
            :''}
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
              <span className="overflow-hidden text-wrap">{`${farm.data?.apy}%`}</span>
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
            {/* <span className="card-text d-flex h-auto justify-content-between align-items-center">
              <strong>Staked (Circ / Tot)</strong>
              <span>{farm.data?.$Staked}</span>
            </span> */}
            <span className="card-text d-flex h-auto justify-content-between align-items-center">
              <strong>LP Liquidity</strong>
              <span>{farm.data?.$LPLiquidity}</span>
            </span>
            <hr></hr>
            <span className="card-text d-flex h-auto justify-content-between align-items-center">
              <strong>Treasury</strong>
              <span>{farm.treasuryBalance?.total}</span>
            </span>
            <span className="card-text d-flex h-auto justify-content-between align-items-center">
              <strong>RFV</strong>
              <span>{farm.treasuryBalance?.rfvInUSD}</span>
            </span>
            <span className="card-text d-flex h-auto justify-content-between align-items-center">
              <strong>Runway (Days)</strong>
              <span>{farm.treasuryBalance?.runway}</span>
            </span>
            <span className="card-text d-flex h-auto justify-content-between align-items-center">
              <strong>Backing Price</strong>
              <span>{farm.treasuryBalance?.backingPrice}</span>
            </span>
            <span className="card-text d-flex h-auto justify-content-between align-items-center">
              <strong>Price / Backing</strong>
              <span>{farm.treasuryBalance?.priceBackingRatio}</span>
            </span>
          </div>
        }
      </div>
      <div className="card-footer">
        <div className="d-flex h-auto justify-content-between">
            {!hideBalanceData ?
            <div>
              <button title="Treasury Balances" className={`me-1 btn btn-sm btn-dark ${farm.showTreasury && 'active'}`} onClick={()=>dispatch({type: 'toggleTreasuryBalances', payload: farmKey})}
                disabled={farm.loading}>
                <i className="bi bi-bank"></i>
              </button>
              <button type="button"
                      title="Staking Info"
                      className={`btn btn-sm me-1 btn-dark ${farm.showBalances && 'active'}`}
                      onClick={()=>dispatch({type: 'toggleFarmBalance', payload: farmKey})}
                      disabled={farm.loading || hideTotals || hideBalanceData}>
                <i className="bi bi-currency-dollar" ></i>
              </button>
              <button title="ROI Info" className={`btn btn-sm btn-dark ${farm.showROI && 'active'}`} onClick={()=>dispatch({type: 'toggleFarmROI', payload: farmKey})}
                disabled={farm.loading}>
                <i className="bi bi-clock"></i>
              </button>
            </div>
            :
            <div>
              <button title="Treasury Balances" className={`btn btn-sm btn-dark ${farm.showTreasury && 'active'}`} onClick={()=>dispatch({type: 'toggleTreasuryBalances', payload: farmKey})}
                disabled={farm.loading}>
                <i className="bi bi-bank"></i>
              </button>
            </div>
            }
          <div>
            {farmFilters.length > 0 ?
            <button title="Remove" className="btn btn-sm btn-dark me-1"
            onClick={removeFilter}
            disabled={farmFilters.length === 1}>
              <i className="bi bi-x"></i>
            </button>
            : ''}
            <button
            title="Refresh"
            onClick={refreshData}
            className="btn btn-sm btn-dark"
            disabled={farm.loading}>
              <i className="bi bi-arrow-clockwise"></i>
            </button>
          </div>
        </div>
        {
          farm.showTreasury && !farm.loading &&
          <div>
            <hr></hr>
            <strong>Treasury</strong>
            <div>
              {
                farm.treasuryBalance?.allBalances.map((balance, index)=>
                  <span key={index} className="card-text d-flex h-auto justify-content-between align-items-center mb-1">
                    <strong>{balance.symbol}</strong>
                    <span>{balance.valueInUSD}</span>
                  </span>
                )
              }
              <span className="txt-smol text-muted">*Treasury balances may be missing or incorrect which will affect other calculations.</span>
            </div>
          </div>
        }
        {
          farm.showBalances && !hideTotals && !hideBalanceData &&
          <div>
            <hr></hr>
            <strong>Balances</strong>
            <span className="card-text d-flex h-auto justify-content-between align-items-top">
              <strong>{farm.constants.symbol}</strong>
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
            {farmKey === 'BSC-LOVE' ?
              <div>
                <span className="card-text d-flex h-auto justify-content-between align-items-top">
                  <strong>HUGS</strong>
                  <div className="align-items-end d-flex h-auto flex-column">
                  <span>{farm.balances?.hugsBalance}</span>
                    <span className="mb-1 txt-smol">({farm.balances?.hugsBalanceInUSD})</span>
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
                    <strong>{farm.constants.wsOHMSymbol} ({wrappedBalance.symbol})</strong>
                    <div className="align-items-end d-flex h-auto flex-column overflow-hidden text-wrap">
                      <span>{`${wrappedBalance.tokenBalance} ${farm.constants.wsOHMSymbol}`}</span>
                      <span className="mb-1 txt-smol">{`(${wrappedBalance.convertedBalanceInUSD})`}</span>
                    </div>
                  </span>)
              }
            </div>
            : ''}
            {farm.balances.wsOHMPoolBalance.tokenBalance > 0 ?
            <div>
              <hr></hr>
              <span className="card-text d-flex h-auto justify-content-between align-items-top">
                <strong>{farm.constants.wsOHMSymbol} (6,6)</strong>
                <div className="align-items-end d-flex h-auto flex-column">
                  <span>{farm.balances?.wsOHMPoolBalance?.tokenBalance}</span>
                  <span className="mb-1 txt-smol">({farm.balances?.wsOHMPoolBalance?.convertedBalanceInUSD})</span>
                </div>
              </span>
            </div>
            : ''}
          {farm.balances.vssBalance?.tokenBalance > 0 ?
            <div>
              <hr></hr>
              <span className="card-text d-flex h-auto justify-content-between align-items-center">
                <strong>VSS Balance</strong>
                <div className="align-items-end d-flex h-auto flex-column">
                  <span>{farm.balances?.vssBalance?.tokenBalance} VSS</span>
                  <span className="txt-smol">({farm.balances?.vssBalance?.convertedBalanceInUSD})</span>
                  <span className="mb-1 txt-smol">Claimable MIM: {farm.balances?.vssBalance?.claimableInUSD}</span>
                </div>
              </span>
            </div>
            : ''}
            {typeof farm.constants.cauldrons !== 'undefined' && farm.constants.cauldrons.length ?
              <div>
                <hr></hr>
                <div className="txt-smol">Collateral</div>
                {
                  farm.balances?.collateralBalances?.balances.map((wrappedBalance, index)=>
                    <span key={index} className="card-text d-flex h-auto justify-content-between align-items-top mb-1">
                      <strong>{`${farm.constants.wsOHMSymbol} (${wrappedBalance.symbol})`}</strong>
                      <div className="align-items-end d-flex h-auto flex-column overflow-hidden">
                        <span>{`${wrappedBalance.tokenBalance} ${farm.constants.wsOHMSymbol}`}</span>
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
                    <div className="mb-1 txt-smol">{bondData.lastTime}</div>
                    <div>{`${bondData.pendingPayout} ${farm.constants.symbol}`} <strong>C</strong></div>
                    <div className="mb-1 txt-smol">({bondData.pendingPayoutInUSD})</div>
                    <div>{`${bondData.payout} ${farm.constants.symbol}`} <strong>P</strong></div>
                    <div className="mb-1 txt-smol">({bondData.payoutInUSD})</div>
                  </div>
                </span>
              )
            }
          </div>
        }
        {
          farm.showROI &&
          <div>
            <hr></hr>
            <strong>Calculator</strong>
            <span className="card-text d-flex h-auto justify-content-between align-items-center mb-2">
              <strong>Next Rebase</strong>
              <div className="align-items-end d-flex h-auto flex-column">
                <span>{`${farm.roiCalculations?.roiRebase.percent}%`}</span>
                {!hideTotals ?
                  <span className="align-items-end d-flex h-auto flex-column overflow-hidden">
                    <span>{`${farm.roiCalculations?.roiRebase.tokenCount} ${farm.constants.symbol}`}</span>
                    <span>{farm.roiCalculations?.roiRebase.total}</span>
                    <span className="txt-smol align-items-end d-flex h-auto flex-column overflow-hidden">
                      <div>+{farm.roiCalculations?.roiRebase.tokenProfit} {farm.constants.symbol}</div>
                      <div>+{farm.roiCalculations?.roiRebase.profit}</div>
                    </span>
                  </span>
                 :
                 <span className="align-items-end d-flex h-auto flex-column overflow-hidden">
                   <span>{`- ${farm.constants.symbol}`}</span>
                   <span>$-</span>
                   <span>+$-</span>
                 </span>
                }
              </div>
            </span>
            <div>
              <input type="range"
              className="form-range"
               min="1" max={Number(farm.treasuryBalance.runway) > 0 ? Number(farm.treasuryBalance.runway).toFixed(0) : 365} id="dynamic-roi" step="1"
               value={farm.roiDynamic}
               onInput={(e)=>dispatch({
                  type: 'setRoiDynamic',
                  payload: {farmKey,roiDynamic: e.target.value}
                })}/>
            </div>
            <span className="card-text d-flex h-auto justify-content-between align-items-center mb-2">
              <strong>{`${farm.roiDynamic} Day ROI`}</strong>
              <div className="align-items-end d-flex h-auto flex-column overflow-hidden">
                <span>{farm.roiCalculations?.roiDynamic.percent}%</span>
                {!hideTotals ?
                <span className="align-items-end d-flex h-auto flex-column overflow-hidden">
                  <span>{farm.roiCalculations?.roiDynamic.tokenCount} ${farm.constants.symbol}</span>
                  <span>{farm.roiCalculations?.roiDynamic.total}</span>
                  <span className="txt-smol align-items-end d-flex h-auto flex-column overflow-hidden">
                    <div>+{farm.roiCalculations?.roiDynamic.tokenProfit} {farm.constants.symbol}</div>
                    <div>+{farm.roiCalculations?.roiDynamic.profit}</div>
                  </span>
                </span>
                :
                <span className="align-items-end d-flex h-auto flex-column overflow-hidden">
                  <span>-{farm.constants.symbol}</span>
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