
import {useEffect} from 'react';
import {useSelector, useDispatch} from "react-redux";
import './App.css';
import {stakingInfo} from './utils/stakingInfo';

function App() {
  const dispatch = useDispatch();
  const addressParams = useSelector((state)=> {
    console.log(state);
    return state.addressParams;
  });
  useEffect(()=>{
    stakingInfo.init();
  });
  return (
    <div className="h-100 d-flex flex-column">

    </div>
  );
}

export default App;
