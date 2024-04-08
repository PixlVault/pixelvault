import { useState } from "react";
import Footer from "./footer";
import { Link } from 'react-router-dom';
import { Navigate, useNavigate } from 'react-router-dom';

const followuser = (event) => {

}

const expandListings = (event) => {
    
}

const mailto = (event) => {
    
}

const tutorial = (event) => {
    
}

const terms = (event) => {
    
}

function Profiles() {
    const navigate = useNavigate();
    return (
    <div>
    <h1 className="text-black top-85 text-center">PixelVault</h1>
    <div className="bg-silver px-5 mx-auto">
        <h2>Jake Small</h2>
        <div><h3>Followers: 121</h3></div>
        <div className="flex items-center justify-center">
        <div>
            <picture>
                <img src="src/assets/Screenshot 2024-03-31 132315.jpg" alt="profilePicture" className="w-100 h-100"/>
            </picture>
            <label for="level">L42</label>
            <label for="level" className="ml-70">L43</label>
            <progress id="level" value="32" max="100"></progress>
        </div>
            <div><p className="ml-10">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.</p></div>
            <button type="text-white bg-grey w-auto h-auto mx-auto mb-10" onClick={followuser}>Follow</button>
        </div>
    </div>

    <hr className="w-40 h-4 bg-grey mx-auto"></hr>

    <div className="w-40 bg-silver px-5 mx-auto">
        <div>
            <h3><u>User Listings</u></h3>
            <div className="seeAll"><button className="text-white bg-grey w-auto h-auto ml-75 mt-auto" onClick = {() => navigate('/search/...')}>See all...</button></div>
        </div>
        <div className="flex">
            <picture>
                <img src="src/assets/Screenshot 2024-04-06 160835.jpg" alt="profilePicture" className="limg1"/>
            </picture>
            <picture>
                <img src="src/assets/Screenshot 2024-04-06 160835.jpg" alt="profilePicture" className="limg2"/>
            </picture>
        </div>

    </div>

    <hr className="endlisting"></hr>

    <div className="w-40 bg-silver px-5 mx-auto">
        <h4 className="text-black top-85 text-center"><u>Popular Posts</u></h4>
        <div className="flex">
        <picture className="img1">
            <img src="src/assets/Screenshot 2024-04-06 160835.jpg" alt="profilePicture" className="posts"/>
        </picture>
        <picture className="img2">
            <img src="src/assets/Screenshot 2024-04-06 160835.jpg" alt="profilePicture" className="posts"/>
        </picture>
        </div>
        <div className="bottomtwo">
        <picture className="img3">
            <img src="src/assets/Screenshot 2024-04-06 160835.jpg" alt="profilePicture" className="posts"/>
        </picture>
        <picture className="img4">
            <img src="src/assets/Screenshot 2024-04-06 160835.jpg" alt="profilePicture" className="posts"/>
        </picture>
        <picture className="img5">
            <img src="src/assets/Screenshot 2024-04-06 160835.jpg" alt="profilePicture" className="posts"/>
        </picture>
        </div>
        
    </div>

   
    </div>
    )
}
export default Profiles;


