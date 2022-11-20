import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import ErrorAlert from "../layout/ErrorAlert";
import formatPhoneNumber from "../utils/phoneNumberFormatter";
import { createReservation, updateReservation, readReservation } from "../utils/api";
import { validateDate, validateFields }from "./validateDate";



// Displays a Reservation Form used to create or edit a reservation
const ReservationForm = ({ edit, loadDashboard }) => {

  const history = useHistory();
  const { reservation_id } = useParams();

  // const [errors, setErrors] = useState([]);
  const [reservationError, setReservationError] = useState(null);
  const [errors, setErrors] = useState([]);
  const [apiError, setApiError] = useState(null);
  

  // Declare initial form variable
  const initialState = {
      first_name: "",
      last_name: "",
      mobile_number: "",
      reservation_date: "",
      reservation_time: "",
      people: "",
  };

  // Set formData default state to initialState variable
  const [formData, setFormData] = useState(initialState);


  useEffect(() => {
    if (edit) {
      // if (reservation.status === "booked") return <p> Only booked reservaitons can be edited.</p>
      loadReservation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function loadReservation() {
    const abortController = new AbortController();
    setReservationError(null);
    readReservation(reservation_id, abortController.signal)
      .then(setFormData)
      .catch(setReservationError);
    return () => abortController.abort();
  }


  function handleSubmit(sumbmittedFormData) {
    const abortController = new AbortController();
    const foundErrors = [];

    if (validateDate(sumbmittedFormData, foundErrors) && validateFields(sumbmittedFormData, foundErrors)) {
      if (edit) {
        updateReservation(reservation_id, formData, abortController.signal)
          .then(loadDashboard)
          .then(() =>
            history.push(`/dashboard?date=${formData.reservation_date}`)
          )
          .catch(setApiError);
      } else {
        createReservation(formData, abortController.signal)
          .then(loadDashboard)
          .then(() =>
            history.push(`/dashboard?date=${formData.reservation_date}`)
          )
          .catch(setApiError);
      }
    }
    setErrors(foundErrors);
    return () => abortController.abort();
  };


  const errorsJSX = () => {
    return errors.map((error, idx) => <ErrorAlert key={idx} error={error} />);
  };


  // Updates the state of the form whenever the user makes changes to it
  function handleChange({ target }) {
    setFormData({
      ...formData,
      [target.name]:
        target.name === "people" ? Number(target.value) : target.value,
    });
  }  


  let phoneNumberFormatter = ({ target }) => {
    const formattedInputValue = formatPhoneNumber(target.value);
    setFormData({
      ...formData,
      mobile_number: formattedInputValue,
    });
  };




  return (
    <div className='row justify-content-center'>
      <form
        className='col-lg-10'
        onSubmit={ (e) => {
          e.preventDefault();
          handleSubmit(formData);
        }}>
        <h1 className='text-center py-4'>{edit ? 'Edit' : 'New'} Reservation</h1>

        {errorsJSX()}
        <ErrorAlert error={apiError} />
        <ErrorAlert error={reservationError} />
        
        <div className='form-group'>
          <label>First Name</label>
          <input
            className='form-control'
            id="first_name"
            name="first_name"
            type="text"
            value={formData.first_name}
            placeholder="Enter your first name"
            required={true}
            onChange={handleChange}
          />
        </div>

        <div className='form-group'>
          <label>Last Name</label>
          <input
            className='form-control'
            id="last_name"
            name="last_name"
            type="text"
            value={formData.last_name}
            placeholder="Enter your last name"
            required={true}
            onChange={handleChange}
          />
        </div>

        <div className='form-group'>
          <label>Mobile Number</label>
          <input
            className='form-control'
            id="mobile_number"
            name="mobile_number"
            type="tel"
            value={formData.mobile_number}
            placeholder="xxx-xxx-xxxx"
            pattern="([0-9]{3}-)?[0-9]{3}-[0-9]{4}"
            required={true}
            onChange={phoneNumberFormatter}
          />
        </div>

        <div className='form-group'>
          <label>Reservation Date</label>
          <input
            className='form-control'
            id="reservation_date"
            name="reservation_date"
            type="date"
            pattern="\d{4}-\d{2}-\d{2}"
            value={formData.reservation_date}
            required={true}
            onChange={handleChange}
          />
        </div>

        <div className='form-group'>
          <label>Reservation Time</label>
          <input
            className='form-control'
            id="reservation_time"
            name="reservation_time"
            type="time"
            pattern="[0-9]{2}:[0-9]{2}"
            value={formData.reservation_time}
            required={true}
            onChange={handleChange}
          />
        </div>

        <div className='form-group'>
          <label>Party Size</label>
          <input
            className='form-control'
            id="people"
            name="people"
            type="text"
            value={formData.people}
            placeholder="Please enter your party's size"
            required={true}
            onChange={handleChange}
          />
        </div>

        <div className='form-group'>
          <button
            className="btn btn-xs btn-dark btn-outline-light w-10"
            type="submit"
          >
            Submit
          </button>

          <button
            className="btn btn-xs btn-cancel text-dark btn-outline-light mx-2 w-10"
            type="button"
            onClick={() => history.goBack()}
          >
            Cancel
          </button>
        </div>

      </form>
    </div>
  )

}


export default ReservationForm;