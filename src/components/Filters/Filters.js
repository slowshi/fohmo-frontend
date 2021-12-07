
import {useSelector, useDispatch} from "react-redux";
import './Filters.css';
import {allFarms} from "../../utils/constants";
import pageLoad from '../../utils/pageLoad';
import {sortFilters} from '../../utils/constants'

function Filters() {
  const dispatch = useDispatch();
  const hideBalanceData = useSelector(state => Object.keys(state.app.addresses).length === 0);
  const formattedSortFilters = useSelector(state => {
    return (Object.keys(state.app.addresses).length === 0) ? sortFilters : [
      {
        label: 'Balance',
        key: 'balance'
      },
      ...sortFilters
    ]
  });
  const showFilters = useSelector((state)=>state.app.showFilters);
  const hideTotals = useSelector((state)=>state.app.hideTotals);
  const farmFilters = useSelector((state)=>state.app.farmFilters);
  const sortDirection = useSelector((state)=>state.app.sortDirection);
  const sortBy = useSelector((state)=>state.app.sortBy);
  const nonZeroFarmKeys = useSelector((state)=> {
    return Object.keys(state.farms)
    .reduce((acc, farmKey)=>{
      const farm = state.farms[farmKey];
      const farmBalance = farm.balances?.rawTotal || 0;
      if (farmBalance > 0) {
        acc.push(farmKey);
      }
      return acc;
    }, []);
  })
  const $farmFilters = useSelector((state)=>{
    const filters = Object.keys(allFarms)
    .map((farmKey, index)=>{
      return {
        farmKey,
        farmSymbol: allFarms[farmKey].farmSymbol,
        networkSymbol: allFarms[farmKey].networkSymbol,
        farmName: allFarms[farmKey].constants.name,
        active: state.app.farmFilters.length === 0 || state.app.farmFilters.indexOf(farmKey) > -1
      };
    });
    return filters;
  });
  const toggleFilters = () => {
    dispatch({
      type: 'setShowFilters',
      payload: !showFilters
    });
  }

  const toggleTotals = () => {
    dispatch({
      type: 'setHideTotals',
      payload: !hideTotals
    });
  }

  const clearFilters = () => {
    dispatch({
      type: 'setFarmFilters',
      payload: []
    });
    pageLoad();
  }

  const hideZeros = () => {
    dispatch({
      type: 'setFarmFilters',
      payload: nonZeroFarmKeys
    });
    pageLoad();
  }

  const selectFilter = (farmKey) => {
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

  const updateSortBy = (e) => {
    dispatch({
      type: 'setSortBy',
      payload: e.target.value
    });
    pageLoad();
  }

  const updateSortDirection = (e) => {
    dispatch({
      type: 'setSortDirection',
      payload: sortDirection === 'asc' ? 'desc': 'asc'
    });
    pageLoad();
  }

  return (
  <div className="container-fluid mt-2 flex1">
    <div className="row">
      <div className="col-12">
        <div className="d-flex h-auto justify-content-between align-items-center mb-2">
          <div className="d-flex h-auto align-items-center">
            <button type="button"
                  className={`btn btn-sm me-1 ${showFilters ? 'btn-dark' : 'btn-light'}`}
                  onClick={toggleFilters}>
              <i className="bi bi-menu-button-wide-fill"></i>
            </button>
            <select value={sortBy} className="form-select form-select-sm" aria-label="Sort"
            onChange={updateSortBy}>
              {formattedSortFilters.map((sortFilter, index)=>
              <option key={index} value={sortFilter.key}>{sortFilter.label}</option>
              )}
            </select>
            <button className="btn btn-sm btn-light ms-1" onClick={updateSortDirection}>
              <i className={`bi ${sortDirection === 'desc' ? 'bi-sort-down' : 'bi-sort-up'}`}></i>
            </button>
          </div>
          {!hideBalanceData ?
            <div>
              <button type="button" className="btn btn-sm btn-light me-1" onClick={hideZeros}>
                Ø
              </button>
              <button type="button"
                className={`btn btn-sm ${hideTotals ? 'btn-dark' : 'btn-light'}`}
                onClick={toggleTotals}>
                <i className="bi bi-eye-fill"></i>
              </button>
            </div>
            :''
          }
        </div>
      </div>
      {
        showFilters &&
        <div className="col-12 mb-2">
          <div className="card">
            <div className="card-body">
              <button type="button" className="btn btn-sm btn-outline-dark" onClick={clearFilters}>
                <i className="bi bi-trash2"></i>
              </button>
              {$farmFilters.map((farm)=>
                <button key={farm.farmKey}
                        type="button"
                        size="sm"
                        className={`btn btn-sm m-1 ${farm.networkSymbol} ${farm.active && 'active'}`}
                        onClick={()=>selectFilter(farm.farmKey)}>
                  {farm.farmName}
                </button>
              )}
            </div>
          </div>
        </div>
      }
    </div>
  </div>
  );
}

export default Filters;
