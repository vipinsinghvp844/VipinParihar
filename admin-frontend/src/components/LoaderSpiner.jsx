import React from "react";
import './LoaderSpiner.css';
import Logo from '../assets/Images/docu-icon.svg'

function Spinner() {
  return <>
      <div id="preloader" className="" style={{ "display": "block" }}>
          <div className="ctn-preloader" id="ctn-preloader">
              <div className="round_spinner">
                  <div className="spinner"></div>
                  <div className="text">
                      <img src={Logo} />
                      <h4>
                          <span>Docusoft</span>
                      </h4>
                  </div>
              </div>

          </div>
      </div>
  </>
}


export default Spinner;