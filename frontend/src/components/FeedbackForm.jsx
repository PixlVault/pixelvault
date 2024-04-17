import { useState } from "react";
import { useParams } from 'react-router-dom';
import Popup from './popup.jsx';

function FeedbackForm() {
  const [inputFeedback, setFeedback] = useState();
  const [reasonFeedback, setReason] = useState();
  const [submitStatus, isSubmitted] = useState(false); // To show a message

  const params = useParams();

  

  const inputHandle = event => {
    setFeedback(event.target.value);
  };

  const reasonHandle = event => {
    setReason(event.target.value);
  };

  const loggedInUser = localStorage.getItem('user');

  const submit = (event) =>  {
    event.preventDefault();
    const subject = encodeURIComponent(`${reasonFeedback} - Feedback From User: ${loggedInUser}`);
    const body = encodeURIComponent(inputFeedback);
    const recipient = "contact.pixelvault@gmail.com";

    const mailto = `mailto:${recipient}?subject=${subject}&body=${body}`;
    console.log("Feedback:", inputFeedback);
    console.log("Reason:", reasonFeedback);

    window.location.href = mailto;

    isSubmitted(true);
  };

  return (
  <div>
  {!submitStatus ? (
  <form className="feedback-form">
    <div className="flex flex-col items-center">
      <h1 className="text-black text-center font-roboto text-2xl">Customer Service</h1>
      <select className="flex mt-10" name="reason" id="feedback" value={reasonFeedback} onChange={reasonHandle}>
      <option disabled>Select your reason...</option>
      <option value="Report bug">Report bug</option>
      <option value="Refund">Refund</option>
      <option value="Z">My reason is not listed</option>
      </select>
      <div className="flex flex-col">
        <h3 className="text-black text-center font-roboto mt-10 text-2xl">How can we help?*</h3>
        <textarea className="resize-none w-80 h-80" placeholder="Type here..." onChange={inputHandle}></textarea>
        <button type="submit" onClick={submit} className="text-white bg-black w-auto h-auto mt-12">Submit Feedback</button>
      </div>
    </div>
  </form>
  ) : (
    <div className="flex flex-col items-center justify-center">
      <h4 className="text-3xl mb-20">Thank you for your feedback. This has now been submitted.</h4>
    </div>
  )}
  </div>
  )
}
export default FeedbackForm;  