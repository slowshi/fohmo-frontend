
import {useEffect} from 'react';
import {useSelector, useDispatch} from "react-redux";
import './App.css';
import Nav from './components/Nav/Nav';
import Filters from './components/Filters/Filters';
import StakingCard from './components/StakingCard/StakingCard';
import Footer from './components/Footer/Footer';
import {stakingInfo} from './utils/staking-info';
function App() {
  const dispatch = useDispatch();
  const addressParam = useSelector((state)=> state.addressParam);
  const hideTotals = useSelector(state => state.hideTotals);
  const totalRoiDynamic = useSelector(state=> state.totalRoiDynamic)
  useEffect(()=>{
    if (addressParam) {
      stakingInfo.init(addressParam);
    }
  },[addressParam]);

  const loadedFarms = useSelector((state)=> {
    let farms = [...Object.keys(state.farms)];
    if (state.farmFilters.length > 0) {
      farms = [...state.farmFilters];
    }
    farms = farms
      .map((farmKey)=>state.farms[farmKey])
      .sort((a, b)=>{
        const aTotal = a.data?.balances?.total;
        const bTotal = b.data?.balances?.total;
        if ( aTotal > bTotal ) {
          return -1;
        }
        if ( aTotal < bTotal ) {
          return 1;
        }
        return 0;
      });
    return farms;
  });
  const aggregatedTotals = useSelector((state)=>{
    let farms = [...Object.keys(state.farms)];
    if (state.farmFilters.length > 0) {
      farms = [...state.farmFilters];
    }
    const filteredFarms = farms.map((farmKey)=>state.farms[farmKey]);
    const totalValue = filteredFarms.reduce((acc, farm)=> {
      acc += farm.data?.balances?.total || 0;
      return acc;
    }, 0);
    let totalWeightedPercent = 0;
    let totalProfit = 0;
    let totalExpectedValue = 0;
    filteredFarms.forEach((farm)=> {
      const stakedBalance = Number(farm.data?.balances?.stakingTokenBalance) || 0;
      const wrappedStakedBalance = Number(farm.data?.balances?.wrappedBalances?.total) || 0;
      const otherBalance = Number(farm.data?.balances?.fullBondTotal + farm.data?.balances.tokenBalance);
      const adjustedTotal = stakedBalance + wrappedStakedBalance;
      const price = Number(farm.data?.stakingInfo.price) || 0;
      const stakingRebase = farm.data?.stakingInfo.stakingRebase || 0;
      const distributeInterval = farm.data?.stakingInfo.distributeInterval || 0;
      const percent = (Math.pow(1 + stakingRebase, distributeInterval * state.totalRoiDynamic) - 1) || 0;
      const profit = (percent * adjustedTotal * price) || 0;
      const weightedPercent = percent * (farm.data?.balances?.total / totalValue) || 0;
      const newTotal = ((otherBalance + (adjustedTotal + (percent * adjustedTotal))) * price) || 0;
      totalWeightedPercent += weightedPercent;
      totalProfit += profit;
      totalExpectedValue += newTotal;
    }, 0);
    if(state.hideTotals || state.addressParam === '') {
      document.title = `Fohmo.io`
    } else {
      document.title = `Fohmo.io - $${totalValue.toLocaleString()}`
    }
    return {
      totalValue: totalValue.toLocaleString(),
      totalWeightedPercent: Number((totalWeightedPercent * 100).toFixed(4)).toLocaleString(),
      totalProfit: Number(totalProfit.toFixed(2)).toLocaleString(),
      totalExpectedValue: Number(totalExpectedValue.toFixed(2)).toLocaleString()
    };
  })

  return (
    <div className="h-100 d-flex flex-column">
      <Nav></Nav>
      <div className="flex1">
        <Filters></Filters>
          {addressParam !== '' ?
          <div className="container-fluid">
            <div className="row">
              <div className="col-sm-12">
                <div className="card mb-2">
                  <div className="card-body">
                    <span className="card-text d-flex justify-content-between align-items-center">
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
                    <span className="card-text d-flex justify-content-between align-items-center mb-2">
                      <strong>{`${totalRoiDynamic} Day ROI`}</strong>
                      <div className="align-items-end d-flex flex-column overflow-anywhere">
                        <span>{`${aggregatedTotals.totalWeightedPercent}%`}</span>
                        {hideTotals ?
                        <span className="align-items-end d-flex flex-column overflow-anywhere">
                          <span>$-</span>
                          <span>+$-</span>
                        </span>
                        :
                        <span className="align-items-end d-flex flex-column overflow-anywhere">
                          <span>{`$${aggregatedTotals.totalExpectedValue}`}</span>
                          <span>{`+$${aggregatedTotals.totalProfit}`}</span>
                        </span>
                        }
                      </div>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
            {
            addressParam !== '' && loadedFarms.map((farm)=>
              <div key={`${farm.networkSymbol}-${farm.farmSymbol}`} className="col-sm-12 col-md-6 col-xl-4 col-xxl-3">
                <StakingCard
                  farmSymbol={farm.farmSymbol}
                  networkSymbol={farm.networkSymbol}
                ></StakingCard>
              </div>
            )
            }
            </div>
          </div>
          :
          <div className="container-fluid">
            <div className="col-12">
              <h5 className="text-center text-light">Enter a wallet address to see OHM and OHM fork balances. The wallet address is used to access Read-Only methods on the staking contracts. It will not show other farms or balances.</h5>
            </div>
          </div>
          }
      </div>
      <Footer></Footer>
    </div>
  );
}

export default App;
