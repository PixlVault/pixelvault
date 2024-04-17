import { useState, useRef } from "react";
import { useLocation } from 'react-router-dom';

function report() {
  const [additionalInfo, setAdditionalInfo] = useState();
  const [submitted, setSubmitted] = useState(false);
  const reasonSelectRef = useRef(null);

  let { state } = useLocation();
  let { username, postTitle, comment } = state;
  const [count, changeCount] = useState(0);

  const loggedInUser = localStorage.getItem('user');

  const additionalInfoChanged = event => {
    setAdditionalInfo(event.target.value);
    changeCount(event.target.value.length);
  };

  const submit = (event) => {
    event.preventDefault();

    const reason = reasonSelectRef.current.value;

    let subject = "";
    if (username != null) {
      subject = encodeURIComponent(`User "${username}" reported by ${loggedInUser} - ${reason}`);
    } else if (postTitle != null) {
      subject = encodeURIComponent(`Post "${postTitle}" reported by ${loggedInUser} - ${reason}`);
    } else if (comment != null) {
      subject = encodeURIComponent(`Comment "${comment}" reported by ${loggedInUser} - ${reason}`);
    } else {
      console.error("Invalid report target.");
    }

    const body = encodeURIComponent(additionalInfo);
    const recipient = "contact.pixelvault@gmail.com";
    const mailto = `mailto:${recipient}?subject=${subject}&body=${body}`;

    window.location.href = mailto;

    setSubmitted(true);
  };

  return (
    <div>
      {!submitted ? (
        <form className="reportform">
          <div className="flex flex-col items-center">

            {
              username != null
                ? <h1 className="text-black text-center font-roboto text-2xl">Report user: <div className="font-bold italic">{username}</div></h1>
                : postTitle != null
                  ? <h1 className="text-black text-center font-roboto text-2xl">Report post: <div className="font-bold italic">{postTitle}</div></h1>
                  : comment != null
                    ? <h1 className="text-black text-center font-roboto text-2xl">Report comment: <div className="font-bold italic">{comment}</div></h1>
                    : "Report"
            }

            <select ref={reasonSelectRef} className="flex mt-10" name="reason" id="feedback">
              <option value="Inappropriate content">Inappropriate content</option>
              <option value="Copyright infringement">Copyright infringement</option>
              <option value="My reason is not listed">My reason is not listed</option>
            </select>

            <div className="flex flex-col">
              <h3 className="text-black text-center font-roboto mt-10 text-2xl">Additional Info</h3>
              <textarea className="resize-none w-80 h-80 border border-gray-800" style={{ width: "25vh", maxWidth: "100%", resize: "none" }} maxLength={500} placeholder="Type here..." onChange={additionalInfoChanged}></textarea>
              {(count < 200 && count < 300) && (
                <p className="text-xl text-gray-500 bottom-2 right-2">{count} / 500</p>
              )}
              {(count >= 200 && count <= 400) && (
                <p className="text-xl text-amber-500 bottom-2 right-2">{count} / 500</p>
              )}
              {count > 400 && (
                <p className="text-xl text-red-500 bottom-2 right-2">{count} / 500</p>
              )}
              <button type="submit" onClick={submit} style={{ position: "relative", bottom: "90%", backgroundColor: 'red' }} className="text-white w-auto h-auto mt-12">Submit Report</button>
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