import { useState } from "react";
import Footer from "./footer";
import { Link } from 'react-router-dom';
import { Navigate, useNavigate } from 'react-router-dom';


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
    const [isFollowing, setFollow] = useState(false);

    const followuser = (event) => {
        console.log("followed");
        setFollow(true)
    }

    const unfollowuser = (event) => {
        console.log("followed");
        setFollow(false)
    }
    return (
    <div>
    <h1 className="text-black mb-10 text-center text-4xl">JakeSmall</h1>
    <div className="bg-silver px-5 mx-auto">
        <div><h3 className="flex items-center justify-center text-2xl mb-10">Followers: 121</h3></div>
        <div className="flex items-center justify-center">
        <div>
            <picture>
                <img src="src/assets/Screenshot 2024-03-31 132315.jpg" alt="profilePicture" className="w-100 h-100"/>
            </picture>
            <label htmlFor="level">L42</label>
            <progress id="level" value="32" max="100"></progress>
            <label htmlFor="level" className="mr-70">L43</label>
        </div>
            <div><p className="max-w-sm text-xl">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.</p></div>
            {!isFollowing ? (
            <div className="flex"><button className="text-white bg-grey w-auto h-auto mb-40" onClick={followuser}>Follow</button></div>
            ) : (
            <div className="flex"><button className="text-white bg-grey w-auto h-auto mb-40" onClick={unfollowuser}>Unfollow...</button></div>
            )}
            <div className="flex"><button className="text-white w-auto h-auto mb-40" style={{backgroundColor: 'red'}} onClick = {() => navigate('/report')}>Report</button></div>
        </div>
    </div>

    <hr className="w-40 h-4 bg-grey mx-auto"></hr>

    <div className="w-40 bg-silver px-5 mx-auto">
        <div>
            <h4 className="text-xl"><u>User Listings</u></h4>
            <div className="seeAll"><button className="text-white bg-grey w-auto h-auto ml-80" onClick = {() => navigate('/search/...')}>See all...</button></div>
        </div>
        <div className="flex h-auto w-auto mt-20">
            <a href="google.com">
                <picture>
                    <img src="src/assets/Screenshot 2024-04-06 160835.jpg" alt="listing1" className="limg1"/>
                </picture>
            </a>
            <a href="google.com">
                <picture>
                    <img src="src/assets/Screenshot 2024-04-06 160835.jpg" alt="listing2" className="limg2"/>
                </picture>
            </a>
        </div>

    </div>

    <hr className="endlisting"></hr>

    
    <div className="w-40 bg-silver px-5 mx-auto">
        <h5 className="text-black top-85 text-center text-xl"><u>Popular Posts</u></h5>
        <div className="flex mt-20">
            <a href="google.com">
                <picture>
                    <img src="src/assets/Screenshot 2024-04-06 160835.jpg" alt="post1"/>
                </picture>
            </a>
            <a href="google.com">
                <picture>
                    <img src="src/assets/Screenshot 2024-04-06 160835.jpg" alt="post2"/>
                </picture>
            </a>
            </div>
            <div className="bottomimages">
                <a href="google.com">
                    <picture>
                        <img src="src/assets/Screenshot 2024-04-06 160835.jpg" alt="post3"/>
                    </picture>
                </a>
                <a href="google.com">
                    <picture>
                        <img src="src/assets/Screenshot 2024-04-06 160835.jpg" alt="post4"/>
                    </picture>
                </a>
                <a href="google.com">
                    <picture>
                        <img src="src/assets/Screenshot 2024-04-06 160835.jpg" alt="post5"/>
                    </picture>
                </a>
            </div>
        
    </div>

   
    </div>
    )
}
export default Profiles;


