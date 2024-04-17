import { useState } from "react";
import { useParams } from 'react-router-dom';
import Popup from './popup.jsx';

function report() {
  const [reportExplaination, setReport] = useState();
  const [reasonReport, setReason] = useState();
  const [userName, setUsername] = useState();
  const [submitStatus, isSubmitted] = useState(false); // To show a message
  const params = useParams();
  const [count, changeCount] = useState(0);
  

  const inputHandle = event => {
    setReport(event.target.value);
    changeCount(event.target.value.length);
  };

  const userNameHandle = event => {     // Dummy for now but get user from report / profile page
    setUsername(event.target.value);
  };

  const reasonHandle = event => {
    setReason(event.target.value);
  };

  const loggedInUser = localStorage.getItem('user');
  const targetedUser = localStorage.getItem('user');

  const submit = (event) =>  {
    event.preventDefault();
    const subject = encodeURIComponent(`${reasonReport} - Report From User: ${loggedInUser} against user ${targetedUser}`);
    const body = encodeURIComponent(reportExplaination);
    const recipient = "contact.pixelvault@gmail.com";

    const mailto = `mailto:${recipient}?subject=${subject}&body=${body}`;
    console.log("Reason:", reasonReport);
    console.log("Report explaination for user: ", reportExplaination);
    console.log("User: ", userName);

    window.location.href = mailto;

    isSubmitted(true);
  };

  return (
  <div>
  {!submitStatus ? (
  <form className="reportform">
    <div className="flex flex-col items-center">
      <h1 className="text-black text-center font-roboto text-2xl">Report form for USER_NAME</h1>
      <select className="flex mt-10" name="reason" id="feedback" value={reasonReport} onChange={reasonHandle}>
      <option disabled>Report reason...</option>
      <option value="Inappropriate content">Inappropriate content</option>
      <option value="Copyright infringement">Copyright infringement</option>
      <option value="My reason is not listed">My reason is not listed</option>
      </select>
      <div className="flex flex-col">
        <h3 className="text-black text-center font-roboto mt-10 text-2xl">Additional Info</h3>
        <textarea className="resize-none w-80 h-80 border border-gray-800" style={{width: "25vh", maxWidth:"100%", resize: "none"}} maxLength={500} placeholder="Type here..." onChange={inputHandle}></textarea>
        {(count < 200 && count < 300) && (
        <p className="text-xl text-gray-500 bottom-2 right-2">{count} / 500</p>
        )}
        {(count >= 200 && count <= 400) && (
        <p className="text-xl text-amber-500 bottom-2 right-2">{count} / 500</p>
        )}
        {count > 400 && (
        <p className="text-xl text-red-500 bottom-2 right-2">{count} / 500</p>
        )}
        <button type="submit" onClick={submit} style={{position: "relative", bottom: "90%", backgroundColor: 'red'}} className="text-white w-auto h-auto mt-12">Submit Report</button>
      </div>
    </div>
  </form>
  ) : (
    <div className="flex flex-col items-center justify-center">
      <h4 className="text-3xl mb-20">Thank you for reporting. This will be investigated by pixelvault.</h4>
    </div>
  )}
  </div>
  )
}
export default report;