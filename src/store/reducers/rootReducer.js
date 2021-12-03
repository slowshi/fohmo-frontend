import {combineReducers} from 'redux';
import reducerApp from './reducerApp';
import reducerFarms from './reducerFarms';
import reducerBalances from './reducerBalances';

const rootReducer = combineReducers({
  app: reducerApp,
  farms: reducerFarms,
  balances: reducerBalances
});

export default rootReducer;