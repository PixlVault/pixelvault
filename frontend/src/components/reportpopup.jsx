import { useState } from "react";
import { useParams } from 'react-router-dom';
import Popup from './popup.jsx';
import Report from './report.jsx';

const reportpopup = () => {
<Popup>
    <Report />
</Popup>
}

export default reportpopup;