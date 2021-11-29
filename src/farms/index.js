import ARB_Z20 from './ARB-Z20.json';
import AVAX_FORT from './AVAX-FORT.json';
import AVAX_MAXI from './AVAX-MAXI.json';
import AVAX_RUG from './AVAX-RUG.json';
// import AVAX_SDOG from './AVAX-SDOG.json';
import AVAX_PB from './AVAX-PB.json';
import AVAX_SB from './AVAX-SB.json';
import AVAX_TIME from './AVAX-TIME.json';
import BSC_GYRO from './BSC-GYRO.json';
import BSC_XEUS from './BSC-XEUS.json';
import BSC_JADE from './BSC-JADE.json';
import BSC_META from './BSC-META.json';
import BSC_TAC from './BSC-TAC.json';
import CRO_FORT from './CRO-FORT.json';
import ETH_LOBI from './ETH-LOBI.json';
import ETH_OHM from './ETH-OHM.json';
import ETH_SQUID from './ETH-SQUID.json';
import FTM_EXOD from './FTM-EXOD.json';
import FTM_FHM from './FTM-FHM.json';
import FTM_HEC from './FTM-HEC.json';
import FTM_SPA from './FTM-SPA.json';
// import KLAY_KRNO from './KLAY-KRNO.json';
// import MATIC_CLAM from './MATIC-CLAM.json';
import MATIC_CLAM2 from './MATIC-CLAM2.json';
import MATIC_GURU from './MATIC-GURU.json';
import MATIC_KLIMA from './MATIC-KLIMA.json';
import MOVR_MD from './MOVR-MD.json';
import ONE_EIGHT from './ONE-EIGHT.json';
import ONE_ODAO from './ONE-ODAO.json';
import ONE_WAGMI from './ONE-WAGMI.json';

const farms = {
  ...ARB_Z20,
  ...AVAX_FORT,
  ...AVAX_MAXI,
  ...AVAX_RUG,
  // ...AVAX_SDOG,
  ...AVAX_PB,
  ...AVAX_SB,
  ...AVAX_TIME,
  ...CRO_FORT,
  ...BSC_GYRO,
  ...BSC_XEUS,
  ...BSC_JADE,
  ...BSC_META,
  ...BSC_TAC,
  ...ETH_LOBI,
  ...ETH_OHM,
  ...ETH_SQUID,
  ...FTM_EXOD,
  ...FTM_FHM,
  ...FTM_HEC,
  ...FTM_SPA,
  // ...KLAY_KRNO,
  // ...MATIC_CLAM,
  ...MATIC_CLAM2,
  ...MATIC_GURU,
  ...MATIC_KLIMA,
  ...MOVR_MD,
  ...ONE_EIGHT,
  ...ONE_ODAO,
  ...ONE_WAGMI,
};
const updatedFarms = Object.keys(farms)
.reduce((acc, key)=>{
  acc = {
    ...acc,
    [key]: {
      ...farms[key],
      showBalances: false,
      showROI: false
    }
  }
  return acc
}, {});

export default updatedFarms;
