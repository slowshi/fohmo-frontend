import {useSelector, useDispatch} from "react-redux";
import pageLoad from '../../utils/pageLoad';

function Nav() {
  const dispatch = useDispatch();
  const address = useSelector((state)=>state.address);

  const updateSearch = event => {
    dispatch({
      type: 'setAddress',
      payload: event.target.value
    })
  }

  const submitForm = event => {
    event.preventDefault();
    event.stopPropagation();
    const searchForm = event.target;
    searchForm.classList.add('was-validated');
    if (searchForm.checkValidity()) {
      pageLoad();
    }
  };

  return (
    <nav className="navbar sticky-top navbar-dark bg-dark">
      <div className="container-fluid">
        <a className="navbar-brand mb-0 h1" href="/">
          Fohmo.io
        </a>
        <form id="search" className="d-flex h-auto needs-validation flex1"
        onSubmit={submitForm}>
          <input className="form-control me-2" name="address" onInput={updateSearch} value={address} type="search" placeholder="Wallet Address" aria-label="Search" required/>
          <button className="btn btn-outline-light" type="submit">
            <i className="bi bi-search"></i>
          </button>
        </form>
      </div>
    </nav>
  );
}

export default Nav;
