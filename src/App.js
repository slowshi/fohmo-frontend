
import {useEffect} from 'react';
import {useSelector} from "react-redux";
import './App.css';
import 'bootstrap-dark-5/dist/css/bootstrap-night.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import {stakingInfo} from './utils/stakingInfo';
import Nav from './components/Nav/Nav';
import Filters from './components/Filters/Filters';
import Footer from './components/Footer/Footer';
import StakingCard from './components/StakingCard/StakingCard';
import AllTotalsCard from './components/AllTotalsCard/AllTotalsCard';
import {sortMap} from './utils/constants';

const ref = (obj, str) => {
  return str
  .split(".")
  .reduce((acc, key) => {
    if(typeof acc[key] === 'undefined') {
      return null;
    }
    return acc[key];
  }, obj);
}


function App() {
    const hideBalanceData = useSelector(state => Object.keys(state.app.addresses).length === 0);
    const sortByKey = useSelector(state=> sortMap[state.app.sortBy] || 'mc');

    // I dunno...
    const hackyBool = true;
    useEffect(()=>{
      if(hackyBool) {
        stakingInfo.init();
      }
    },[hackyBool]);

    const loadedFarms = useSelector((state)=> {
      let farms = [...Object.keys(state.farms)];
      if (state.app.farmFilters.length > 0) {
        farms = [...state.app.farmFilters];
      }
      farms = farms
        .map((farmKey)=>state.farms[farmKey])
        .sort((a, b)=>{
          if(a.data === null || b.data === null) return 0;
          const aTotal = ref(a, sortByKey);
          const bTotal = ref(b, sortByKey);
          if (aTotal < bTotal) return state.app.sortDirection === 'asc' ? -1 : 1;
          if (aTotal > bTotal) return state.app.sortDirection === 'desc' ? -1 : 1;

          return 0;
        });
      return farms;
    });
  return (
    <div className="h-100 d-flex flex-column">
      <Nav></Nav>
      <div className="flex1">
        <Filters></Filters>
        <div className="container-fluid">
          <div className="row">
            {!hideBalanceData ?
            <div className="col-12 mb-2">
              <AllTotalsCard></AllTotalsCard>
            </div>
            : ''}
              {
              loadedFarms.map((farm)=>
                <div key={`${farm.networkSymbol}-${farm.farmSymbol}`} className="col-xxl-3 col-xl-4 col-md-6 col-sm-12">
                  <StakingCard
                    farmSymbol={farm.farmSymbol}
                    networkSymbol={farm.networkSymbol}
                  ></StakingCard>
                </div>
              )
              }
          </div>
        </div>
      </div>
      <Footer></Footer>
    </div>
  );
}

export default App;
