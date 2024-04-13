import { useState } from "react";

function report() {
  const [reportExplaination, setReport] = useState();
  const [reasonReport, setReason] = useState();
  const [userName, setUsername] = useState();
  const [submitStatus, isSubmitted] = useState(false); // To show a message

  

  const inputHandle = event => {
    setReport(event.target.value);
  };

  const userNameHandle = event => {     // Dummy for now but get user from report / profile page
    setUsername(event.target.value);
  };

  const reasonHandle = event => {
    setReason(event.target.value);
  };

  const submit = (event) =>  {
    event.preventDefault();
    console.log("Reason:", reasonReport);
    console.log("Report explaination for user: ", reportExplaination);
    console.log("User: ", userName);

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
        <textarea className="resize-none w-80 h-80" placeholder="Type here..." onChange={inputHandle}></textarea>
        <button type="submit" onClick={submit} style={{backgroundColor: 'red'}} className="text-whitew-auto h-auto mt-12">Submit Report</button>
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