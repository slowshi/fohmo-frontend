import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { stakingInfo } from "../utils/stakingInfo";
const useStakingInfo = (farmKey, addresses=[], cache=false) => {
  // const [stakingInfo, updateStakingInfo] = useState(null);
  // const [balances, updateAddressBalance] = useState(null);
  const stateFarm = useSelector((state)=> state.farms[farmKey])
  const [farm, updateStakingInfo] = useState({
    farmKey: farmKey,
    stakingInfo: {
      ...stateFarm,
      loading: true
    }
  })
  useEffect(() => {
    const params = farmKey.split('-');
    const networkSymbol = params[0];
    const farmSymbol = params[1];
    stakingInfo.getStakingInfo2(networkSymbol, farmSymbol, cache)
    .then((res)=>{
      updateStakingInfo({
        farmKey,
        stakingInfo: {
          data: res.data,
          loading: false
        }
      })
      // console.log(data);
    })
    const balancePromises = addresses
    .map((address)=>{
      return stakingInfo.getBalances(address, networkSymbol, farmSymbol)
    })
    Promise.all(balancePromises)
    .then((res)=>{
      res.forEach((balance)=>{
        // console.log(balance);
      })
    });
  }, [farmKey, cache, addresses]);

  return farm;
};

export default useStakingInfo;