import {useSelector, useDispatch} from "react-redux";
import pageLoad from '../../utils/pageLoad';
import { useState } from "react";
function Nav() {
  const dispatch = useDispatch();
  const addressCount = useSelector((state)=>Object.keys(state.app.addresses).length);
  const addresses = useSelector((state)=>state.app.addresses);
  const [addressParams, setAddresses] = useState([
    ...Object.keys(addresses),
    ''
  ]);
  const [show, setShow] = useState(false);
  const toggleShow = () => {
    setShow(!show)
  };
  // const [showVisible, setShowVisible] = useState(false);
  // const toggleShowVisible = () => {
  //   setShowVisible(!show)
  // };
  const updateAddress = (e, index) => {
    let addresses = [...addressParams];
    let addressString = e.target.value;
    addresses = [
      ...addresses.slice(0, index),
      addressString,
      ...addresses.slice(index + 1)
    ];
    if(addressString === '' && index < addresses.length - 1) {
      addresses = [
        ...addresses.slice(0, index),
        ...addresses.slice(index + 1)
      ];
    }
    if(addresses[addresses.length - 1] !== '') {
      addresses = [
        ...addresses,
        ''
      ];
    };
    setAddresses(addresses);
  }

  const removeAddress = (index) => {
    let addresses = [...addressParams];
    addresses = [
      ...addresses.slice(0, index),
      ...addresses.slice(index + 1)
    ];
    setAddresses(addresses);
  }

  const onClickSearch = ()=> {
    const searchForm = document.getElementById('search');
    if(searchForm) {
      finishSumitForm(searchForm);
    } else {
      pageLoad(true);
    }
  };

  const submitForm = event => {
    event.preventDefault();
    event.stopPropagation();
    const searchForm = event.target;
    finishSumitForm(searchForm);
  };

  const finishSumitForm = (searchForm) => {
    searchForm.classList.add('was-validated');
    if (searchForm.checkValidity()) {
      const newAddresses = addressParams.reduce((acc, address)=>{
        if(address !== '') {
          acc[address] = true;
        }
        return acc
      }, {});
      dispatch({
        type: 'setAddresses',
        payload: newAddresses
      });
      pageLoad(true);
    }
  }

  return (
    <div>
      <nav className="navbar sticky-top navbar-dark bg-dark">
        <div className="container-fluid">
          <a className="navbar-brand mb-0 h1" href="/">
            Fohmo.io
          </a>
          <div>
            <button type="button" className={`btn btn-sm me-2 ${show ? 'btn-secondary' : 'btn-light'}`} onClick={toggleShow}>
              {addressCount === 0 ? `+ Add Address`: ''}
              {addressCount === 1 ? `${addressCount} Address`: ''}
              {addressCount > 1 ? `${addressCount} Addresses` : ''}
            </button>
            <button type="submit" form="search" className="btn btn-sm btn-light" onClick={onClickSearch}>
              <i className="bi bi-search"></i>
            </button>
              {/* <button type="button" className="btn btn-sm btn-light" onClick={toggleShowVisible}>
                <i className="bi bi-eye"></i>
              </button> */}
            </div>
        </div>
      </nav>
      {show ?
        <div className="card">
          <div className="card-body">
            <div className="container">
              <div className="row">
                <div className="col-12">
                  <form id="search" className="needs-validation flex1"
                  onSubmit={submitForm}>
                    {addressParams.map((address, index)=>
                      <div className="d-flex flex-1 h-auto align-items-center mb-2" key={index}>
                        <input  className="form-control me-2" name="address"
                                onInput={(e)=>updateAddress(e, index)}
                                onPasteCapture={(e)=>updateAddress(e, index)}
                                value={address}
                                placeholder="Wallet Address" aria-label="Search"
                                required={index !== addressParams.length -1}/>
                        {index !== addressParams.length -1 ?
                        <div className="d-flex flex-1 h-auto align-items-center">
                          <button className="btn btn-sm btn-link text-dark" type="button"
                          onClick={(e)=>removeAddress(index)}>
                            <i className="bi bi-x"></i>
                          </button>
                        </div>
                          :''
                        }
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      : ''}
    </div>
  );
}

export default Nav;
