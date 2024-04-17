import { useState, useRef } from "react";

import toast from 'react-hot-toast';

function FeedbackForm() {
  const [feedback, setFeedback] = useState();
  const [submitStatus, isSubmitted] = useState(false);
  const [count, changeCount] = useState(0);
  const reasonSelectRef = useRef(null);

  const loggedInUser = localStorage.getItem('user');

  const feedbackChanged = event => {
    setFeedback(event.target.value);
    changeCount(event.target.value.length);
  };

  const submit = (event) => {
    event.preventDefault();

    if (feedback == null || feedback.length == 0) {
      toast.error("No feedback provided");
      return;
    }

    if (loggedInUser == null) {
      toast.error("Must be logged in to submit feedback");
      return;
    }


    const recipient = "contact.pixelvault@gmail.com";
    const subject = encodeURIComponent(`Feedback sent by user "${loggedInUser}"`);

    const reason = reasonSelectRef.current.value;
    let bodyText = `Reason:\n${reason}\n\nFeedback:\n${feedback}`;
    const body = encodeURIComponent(bodyText);

    const mailto = `mailto:${recipient}?subject=${subject}&body=${body}`;

    window.location.href = mailto;

    isSubmitted(true);
  };

  return (
    <div>
      {!submitStatus ? (
        <form className="feedback-form">
          <div className="flex flex-col items-center">
            <h1 className="text-black text-center font-roboto text-2xl">Customer Service</h1>

            <select className="flex mt-10" name="reason" id="feedback" ref={reasonSelectRef}>
              <option disabled>Select your reason...</option>
              <option value="Report bug">Report bug</option>
              <option value="Z">My reason is not listed</option>
            </select>

            <div className="flex flex-col">
              <h3 className="text-black text-center font-roboto mt-10 text-2xl">How can we help?*</h3>
              <textarea className="resize-none w-80 h-80" placeholder="Type here..." maxLength={500} onChange={feedbackChanged}></textarea>
              {(count < 200 && count < 300) && (
                <p className="text-xl text-gray-500 bottom-2 right-2">{count} / 500</p>
              )}
              {(count >= 200 && count <= 400) && (
                <p className="text-xl text-amber-500 bottom-2 right-2">{count} / 500</p>
              )}
              {count > 400 && (
                <p className="text-xl text-red-500 bottom-2 right-2">{count} / 500</p>
              )}
              <button type="submit" onClick={submit} className="text-white bg-black w-45 h-15 mt-12">Submit Feedback</button>
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