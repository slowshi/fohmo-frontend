import { useEffect } from "react";
import { useSelector } from "react-redux";
import { stakingInfo } from "../utils/stakingInfo";
const useBalances = (farmKey, addresses=[], cache=false) => {
  // const [stakingInfo, updateStakingInfo] = useState(null);
  // const [balances, updateAddressBalance] = useState(null);
  const stateBalance = useSelector((state)=>{
    return state.balances[farmKey]
  });

  useEffect(() => {
    const params = farmKey.split('-');
    const networkSymbol = params[0];
    const farmSymbol = params[1];

    const balancePromises = addresses
    .map((address)=>{
      return stakingInfo.getBalances(address, networkSymbol, farmSymbol)
    })
    Promise.all(balancePromises)
    .then((res)=>{
      res.forEach((balance)=>{
        console.log(balance);
      })
    });
  }, [farmKey, cache, addresses]);

  return [];
};

export default useBalances;