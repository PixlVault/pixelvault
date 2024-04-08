import { useState } from "react";

function FeedbackForm() {
  const [inputFeedback, setFeedback] = useState();
  const [reasonFeedback, setReason] = useState();
  const [submitStatus, isSubmitted] = useState(false); // To show a message

  

  const inputHandle = event => {
    setFeedback(event.target.value);
  };

  const reasonHandle = event => {
    setReason(event.target.value);
  };

  const submit = (event) =>  {
    event.preventDefault();
    console.log("Feedback:", inputFeedback);
    console.log("Reason:", reasonFeedback);
    isSubmitted(true);
  };

  const home = (event) =>  {
    setFade(false);
  };

  
  const props = useSpring({
    opacity: isSubmitted ? 1 : 0,
    from: {opacity: 0},
    delay: 400,
  });

  return (
  <div>
  {!submitStatus ? (
  <form className="feedback-form">
    <div className="flex flex-col items-center">
      <h1 className="text-black top-85 text-center font-roboto">PixelVault</h1>
      <h2 className="text-black text-center font-roboto">Customer Service</h2>
      <select name="reason" id="feedback" value={reasonFeedback} onChange={reasonHandle}>
      <option disabled>Select your reason...</option>
      <option value="X">X</option>
      <option value="Y">Y</option>
      <option value="Z">Z</option>
      </select>
      <h3 className="text-black text-center font-roboto">How can we help?*</h3>
      <textarea className="resize-none w-30 h-15vh px-5 mx-auto" placeholder="Type here..." onChange={inputHandle}></textarea>
      <button type="submit" onClick={submit} className="text-white bg-black w-10 h-2vh mt-20">Submit</button>
    </div>
  </form>
  ) : (
    <div className="flex flex-col items-center justify-center">

      <h1>PixelVault</h1>
      <h2>Customer Service</h2>
      <h3>Thank you for your feedback. This has now been submitted.</h3>
    <animated.button type="home" onClick={home} style={props} className="text-white bg-black w-10 h-2vh mt-20">Home</animated.button>
    </div>
  )}
  </div>
  )
}
export default FeedbackForm;