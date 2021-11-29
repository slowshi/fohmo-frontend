
import {store} from './store';
import { stakingInfo } from './stakingInfo';
const formatURL = (state) => {
  let params = {
    address: state.address
  };
  if (state.farmFilters.length > 0) {
    params = {
      ...params,
      filters: state.farmFilters.toString() || null
    };
  }
  const searchParams = new URLSearchParams(params);
  const url = `/?${searchParams}`;
  return url;
};

const pageLoad = ()=> {
  const state = store.getState();
  const address = state.address;
  const url = formatURL(state);
  window.history.replaceState(null, null, url);
  store.dispatch({
    type: 'setAddressParam',
    payload: address
  });
  stakingInfo.init(address);
};

export default pageLoad;
