
import store from '../store/store';
import { stakingInfo } from './stakingInfo';
import {sortFilters} from '../utils/constants';
const formatURL = (state) => {
  let params = {};
  if(Object.keys(state.app.addresses).length > 0) {
    params = {
      address: Object.keys(state.app.addresses).toString(),
      visible: Object.values(state.app.addresses).map((visible)=>visible ? '1' : '0')
    }
  }
  let sortByKey = state.app.sortBy;
  if (sortFilters.map(sortFilter=>sortFilter.key).indexOf(sortByKey) === -1 && sortByKey !== 'balance') {
    sortByKey = 'mc'
  }
  if (state.app.farmFilters.length > 0) {
    params = {
      ...params,
      filters: state.app.farmFilters.toString()
    };
  }
  params = {
    ...params,
    sort: state.app.sortBy,
    dir: state.app.sortDirection,
  }
  if(Object.keys(params).length === 0) return '/';
  const searchParams = new URLSearchParams(params);
  const url = `/?${searchParams}`;
  return url;
};

const pageLoad = (clearCache = false)=> {
  const state = store.getState();
  const url = formatURL(state);
  window.history.replaceState(null, null, url);
  stakingInfo.init(clearCache);
};

export default pageLoad;
