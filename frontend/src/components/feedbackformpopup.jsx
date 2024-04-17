import { useState } from "react";
import { useParams } from 'react-router-dom';
import Popup from './popup.jsx';
import Feedback from './FeedbackForm.jsx';

function feedbackformpopup() {
return(
<Popup>
    <Feedback />
</Popup>
)}

export default feedbackformpopup;