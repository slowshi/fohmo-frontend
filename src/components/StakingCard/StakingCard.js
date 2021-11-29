import {useSelector, useDispatch} from "react-redux";
import {networks} from '../../utils/constants'
import {stakingInfo, formatRebase} from '../../utils/stakingInfo'
import './StakingCard.css';

function StakingCard(params) {
  const dispatch = useDispatch();
  const {farmSymbol, networkSymbol} = params;
  const farmKey = `${networkSymbol}-${farmSymbol}`;
  const address = useSelector(state => state.address);
  const hideTotals = useSelector(state => state.hideTotals);
  const network = networks[networkSymbol];
  const loading = useSelector((state)=> {
    const currentFarm = state.farms[farmKey];
    return currentFarm.data === null;
  });
  const farm = useSelector((state)=> {
    const currentFarm = state.farms[farmKey];
    if (currentFarm.data === null) return currentFarm;
    const formatRebaseParams = [
      Number(currentFarm.data.balances?.stakingTokenBalance + currentFarm.data.balances?.wrappedBalances?.total),
      Number(currentFarm.data.balances?.fullBondTotal + currentFarm.data.balances.tokenBalance),
      Number(currentFarm.data.stakingInfo.price),
      currentFarm.data.stakingInfo.stakingRebase,
    ];

    return {
      ...currentFarm,
      data: {
        ...currentFarm.data,
        balances: {
          ...currentFarm.data.balances,
          total: Number(currentFarm.data.balances.total).toLocaleString(),
          rawTotal: currentFarm.data.balances.total,
          disabled: currentFarm.data.balances.tokenBalance === 0 && currentFarm.data.balances.stakingTokenBalance === 0
        },
        stakingInfo: {
          ...currentFarm.data.stakingInfo,
          price: Number(currentFarm.data.stakingInfo.price).toLocaleString(),
          apy: Number((
            (Math.pow(1 + currentFarm.data.stakingInfo.stakingRebase,
              currentFarm.data.stakingInfo.distributeInterval * 365) - 1) * 100)
            .toFixed(0))
            .toLocaleString(),
          $TVL: (Number(currentFarm.data.stakingInfo.lockedValue) *
          Number(currentFarm.data.stakingInfo.price)).toLocaleString(),
          $Circ: (Number(currentFarm.data.stakingInfo.circulatingSupply) *
          Number(currentFarm.data.stakingInfo.price)).toLocaleString(),
          $Total: (Number(currentFarm.data.stakingInfo.totalSupply) *
          Number(currentFarm.data.stakingInfo.price)).toLocaleString(),
          $RFV: Number(currentFarm.data.stakingInfo.totalReserves).toLocaleString(),
          $BackedPrice: (Number(currentFarm.data.stakingInfo.totalReserves) /
          Number(currentFarm.data.stakingInfo.totalSupply)).toLocaleString()
        },
        roiCalculations: {
          roiRebase: formatRebase(...formatRebaseParams, 1),
          roi5Day: formatRebase(
            ...formatRebaseParams,
            currentFarm.data.stakingInfo.distributeInterval * 5),
          roiDynamic: formatRebase(
            ...formatRebaseParams,
            currentFarm.data.stakingInfo.distributeInterval
            * currentFarm.roiDynamic)
        }
      }
    }
  });

  const refreshData = async () => {
    const resetFarm = {
      data: null,
      showBalances: false,
      showROI: false,
      roiDynamic: 1
    }
    dispatch({
      type: 'udpateFarm',
      payload: {
        farmKey,
        farm: resetFarm
      }
    });
    const response = await stakingInfo.getStakingInfo(address, networkSymbol, farmSymbol, true);
    dispatch({
      type: 'udpateFarm',
      payload: {
        farmKey,
        farm: response
      }
    });
  };

  return (
    <div className="card mb-2">
      <div className="card-body">
        <h5 className="card-title">
          <div className="d-flex justify-content-between align-items-center">
            <span>
              {`${farm.constants.name} (${farmSymbol})`}
            </span>
            <span>
              {hideTotals ? `$-` :`$${farm.data?.balances?.total ?? `0`}`}
            </span>
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
        {loading ?
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
            <span className="card-text d-flex justify-content-between align-items-center">
              <strong>Price</strong>
              <span>${farm.data.stakingInfo?.price}</span>
            </span>
            <span className="card-text d-flex justify-content-between align-items-center">
              <strong>Next Rebase</strong>
              <span>{farm.data.stakingInfo?.nextRebase}</span>
            </span>
            <span className="card-text d-flex justify-content-between align-items-center">
              <strong>Index</strong>
              <span>{farm.data.stakingInfo?.currentIndex}</span>
            </span>
            <span className="card-text d-flex justify-content-between align-items-center">
              <strong>APY</strong>
              <span className="overflow-anywhere">{`${farm.data.stakingInfo?.apy}%`}</span>
            </span>
            <span className="card-text d-flex justify-content-between align-items-center">
              <strong>Rebase ROI (5-day)</strong>
              <span>{`${farm.data.roiCalculations?.roiRebase.percent}% (${farm.data.roiCalculations?.roi5Day.percent}%)`}</span>
            </span>
            <span className="card-text d-flex justify-content-between align-items-center">
              <strong>TVL</strong>
              <span>{`$${farm.data.stakingInfo?.$TVL}`}</span>
            </span>
            <span className="card-text d-flex justify-content-between align-items-center">
              <strong>Estimated MC (TS x P)</strong>
              <span>{`$${farm.data.stakingInfo?.$Total}`}</span>
            </span>
            <span className="card-text d-flex justify-content-between align-items-center">
              <strong>Risk Free Value</strong>
              <span>{`$${farm.data.stakingInfo?.$RFV}`}</span>
            </span>
          </div>
        }
      </div>
      <div className="card-footer">
        <div className="d-flex justify-content-between">
          <div>
            <button type="button"
                    className={`btn btn-sm me-1 btn-outline-secondary ${farm.showBalances && 'active'}`}
                    onClick={()=>dispatch({type: 'toggleFarmBalance', payload: farmKey})}
                    disabled={loading || hideTotals}>
              <i className="bi bi-currency-dollar" ></i>
            </button>
            <button className={`btn btn-sm btn-outline-secondary ${farm.showROI && 'active'}`} onClick={()=>dispatch({type: 'toggleFarmROI', payload: farmKey})}
              disabled={loading}>
              <i className="bi bi-clock"></i>
            </button>
          </div>
          <div>
            <button
            onClick={refreshData}
            className="btn btn-sm btn-outline-secondary"
            disabled={loading}>
              <i className="bi bi-arrow-clockwise"></i>
            </button>
          </div>
        </div>
        {
          farm.showBalances && !hideTotals &&
          <div>
            <hr></hr>
            <span className="card-text d-flex justify-content-between align-items-center">
              <strong>{farmSymbol}</strong>
              <span>{farm.data?.balances?.tokenBalance}</span>
            </span>
            <span className="card-text d-flex justify-content-between align-items-center">
              <strong>{farm.constants.stakingSymbol}</strong>
              <span>{farm.data?.balances?.stakingTokenBalance}</span>
            </span>
            {farm.constants.wsOHMNetworks.length ? <hr></hr> : ''}
            {
              farm.data?.balances?.wrappedBalances.balances.map((wrappedBalance)=>
                <span key={wrappedBalance.symbol} className="card-text d-flex justify-content-between align-items-center mb-1">
                  <strong>{`${farm.constants.wsOHMSymbol} (${wrappedBalance.symbol})`}</strong>
                  <div className="align-items-end d-flex flex-column overflow-anywhere">
                    <span>{`${wrappedBalance.tokenBalance} ${farm.constants.wsOHMSymbol}`}</span>
                    <span>{`(${wrappedBalance.convertedBalance} ${farmSymbol})`}</span>
                  </div>
                </span>)
            }
            <hr></hr>
            {
              farm.data?.balances?.bonds.map((bondData)=>
              <span key={bondData.symbol} className="card-text d-flex justify-content-between align-items-center mb-1">
              <strong>{bondData.symbol}</strong>
              <div className="align-items-end d-flex flex-column">
                <div>{`${bondData.pendingPayout} ${farmSymbol}`} <strong>C</strong></div>
                <div>{`${bondData.payout} ${farmSymbol}`} <strong>P</strong></div>
              </div>
            </span>)
            }
          </div>
        }
        {
          farm.showROI &&
          <div>
            <hr></hr>
            <span className="card-text d-flex justify-content-between align-items-center mb-2">
              <strong>Next Rebase</strong>
              <div className="align-items-end d-flex flex-column">
                <span>{`${farm.data?.roiCalculations?.roiRebase.percent}%`}</span>
                {!hideTotals ?
                  <span className="align-items-end d-flex flex-column overflow-anywhere">
                    <span>{`${farm.data?.roiCalculations?.roiRebase.tokenCount} ${farmSymbol}`}</span>
                    <span>{`$${farm.data?.roiCalculations?.roiRebase.total}`}</span>
                    <span>{`+$${farm.data?.roiCalculations?.roiRebase.profit}`}</span>
                  </span>
                 :
                 <span className="align-items-end d-flex flex-column overflow-anywhere">
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
            <span className="card-text d-flex justify-content-between align-items-center mb-2">
              <strong>{`${farm.roiDynamic} Day ROI`}</strong>
              <div className="align-items-end d-flex flex-column overflow-anywhere">
                <span>${farm.data?.roiCalculations?.roiDynamic.percent}%</span>
                {!hideTotals ?
                <span className="align-items-end d-flex flex-column overflow-anywhere">
                  <span>{farm.data?.roiCalculations?.roiDynamic.tokenCount} ${farmSymbol}</span>
                  <span>${farm.data?.roiCalculations?.roiDynamic.total}</span>
                  <span>+${farm.data?.roiCalculations?.roiDynamic.profit}</span>
                </span>
                :
                <span className="align-items-end d-flex flex-column overflow-anywhere">
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