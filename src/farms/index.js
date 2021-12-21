// import ARB_Z20 from './ARB-Z20.json';
import ARB_FCS from './ARB-FCS.json';
import ARB_UMAMI from './ARB-UMAMI.json';
import ARB_OMIC from './ARB-OMIC.json';
import AVAX_CAKE from './AVAX-CAKE.json';
import AVAX_FORT from './AVAX-FORT.json';
import AVAX_CROWN from './AVAX-CROWN.json';
import AVAX_GG from './AVAX-GG.json';
import AVAX_ICE from './AVAX-ICE.json';
import AVAX_LF from './AVAX-LF.json';
import AVAX_MAXI from './AVAX-MAXI.json';
import AVAX_CLAVIS from './AVAX-CLAVIS.json';
import AVAX_NADO from './AVAX-NADO.json';
import AVAX_OTWO from './AVAX-OTWO.json';
import AVAX_PAPA from './AVAX-PAPA.json';
import AVAX_PARR from './AVAX-PARR.json';
import AVAX_RUG from './AVAX-RUG.json';
import AVAX_RGK from './AVAX-RGK.json';
import AVAX_GHOST from './AVAX-GHOST.json';
import AVAX_SPACE from './AVAX-SPACE.json';
// import AVAX_SPACEv1 from './AVAX-SPACEv1.json';
import AVAX_SBR from './AVAX-SBR.json';
import AVAX_SCAT from './AVAX-SCAT.json';
import AVAX_PB from './AVAX-PB.json';
import AVAX_SB from './AVAX-SB.json';
import AVAX_BLIGHT from './AVAX-BLIGHT.json';
import AVAX_BLANC from './AVAX-BLANC.json';
import AVAX_TEMPO from './AVAX-TEMPO.json';
import AVAX_VAL from './AVAX-VAL.json';
import AVAX_VALDAO from './AVAX-VALDAO.json';
import AVAX_TIME from './AVAX-TIME.json';
import BSC_GYRO from './BSC-GYRO.json';
import BSC_XEUS from './BSC-XEUS.json';
import BSC_PID from './BSC-PID.json';
import BSC_JADE from './BSC-JADE.json';
import BSC_LOVE from './BSC-LOVE.json';
// import BSC_RA from './BSC-RA.json';
import BSC_META from './BSC-META.json';
import BSC_NMS from './BSC-NMS.json';
import BSC_TAC from './BSC-TAC.json';
import BSC_TEM from './BSC-TEM.json';
import BSC_DIOS from './BSC-DIOS.json';
import BSC_UDO from './BSC-UDO.json';
import BSC_WHISKEY from './BSC-WHISKEY.json';
import CRO_FORT from './CRO-FORT.json';
import ETH_LOBI from './ETH-LOBI.json';
import ETH_MNFST from './ETH-MNFST.json';
import ETH_OHM from './ETH-OHM.json';
import ETH_OHM2 from './ETH-OHM2.json';
import ETH_SQUID from './ETH-SQUID.json';
import ETH_BTRFLY from './ETH-BTRFLY.json';
import FTM_GIZA from './FTM-GIZA.json';
import FTM_EXOD from './FTM-EXOD.json';
import FTM_FHM from './FTM-FHM.json';
import FTM_HEC from './FTM-HEC.json';
import FTM_LUX from './FTM-LUX.json';
import FTM_SPA from './FTM-SPA.json';
import FTM_SCR from './FTM-SCR.json';
import FTM_WEN from './FTM-WEN.json';
import FTM_VOLT from './FTM-VOLT.json';
import FTM_PUMP from './FTM-PUMP.json';
// import KLAY_KRNO from './KLAY-KRNO.json';
// import MATIC_CLAM from './MATIC-CLAM.json';
import MATIC_CLAM2 from './MATIC-CLAM2.json';
import MATIC_GURU from './MATIC-GURU.json';
import MATIC_KLIMA from './MATIC-KLIMA.json';
import MOVR_FHM from './MOVR-FHM.json';
import MOVR_ROME from './MOVR-ROME.json'
// import MOVR_MD from './MOVR-MD.json';
import ONE_CHEEZ from './ONE-CHEEZ.json';
// import ONE_EIGHT from './ONE-EIGHT.json';
import ONE_ODAO from './ONE-ODAO.json';
import ONE_WAGMI from './ONE-WAGMI.json';

const farms = {
  // ...ARB_Z20,
  ...ARB_FCS,
  ...ARB_OMIC,
  ...ARB_UMAMI,
  ...AVAX_CAKE,
  ...AVAX_FORT,
  ...AVAX_GG,
  ...AVAX_ICE,
  ...AVAX_LF,
  ...AVAX_MAXI,
  ...AVAX_CROWN,
  ...AVAX_CLAVIS,
  ...AVAX_NADO,
  ...AVAX_OTWO,
  ...AVAX_PAPA,
  ...AVAX_RUG,
  ...AVAX_RGK,
  ...AVAX_PARR,
  ...AVAX_BLANC,
  ...AVAX_SCAT,
  ...AVAX_PB,
  ...AVAX_SB,
  ...AVAX_SBR,
  ...AVAX_SPACE,
  ...AVAX_GHOST,
  // ...AVAX_SPACEv1,
  ...AVAX_BLIGHT,
  ...AVAX_TEMPO,
  ...AVAX_TIME,
  ...AVAX_VAL,
  ...AVAX_VALDAO,
  ...CRO_FORT,
  ...BSC_DIOS,
  ...BSC_GYRO,
  ...BSC_XEUS,
  ...BSC_JADE,
  ...BSC_META,
  ...BSC_LOVE,
  ...BSC_NMS,
  ...BSC_PID,
  // ...BSC_RA,
  ...BSC_TAC,
  ...BSC_TEM,
  ...BSC_UDO,
  ...BSC_WHISKEY,
  ...ETH_LOBI,
  ...ETH_MNFST,
  ...ETH_OHM,
  ...ETH_OHM2,
  ...ETH_BTRFLY,
  ...ETH_SQUID,
  ...FTM_EXOD,
  ...FTM_VOLT,
  ...FTM_SCR,
  ...FTM_FHM,
  ...FTM_GIZA,
  ...FTM_HEC,
  ...FTM_LUX,
  ...FTM_SPA,
  ...FTM_PUMP,
  ...FTM_WEN,
  // ...KLAY_KRNO,
  // ...MATIC_CLAM,
  ...MATIC_CLAM2,
  ...MATIC_GURU,
  ...MATIC_KLIMA,
  ...MOVR_FHM,
  // ...MOVR_MD,
  ...MOVR_ROME,
  ...ONE_CHEEZ,
  // ...ONE_EIGHT,
  ...ONE_ODAO,
  ...ONE_WAGMI,
};

export default farms;
