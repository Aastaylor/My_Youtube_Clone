import React, { useEffect, useState } from 'react'
import './PlayVideo.css'
import video1 from '../../assets/video.mp4'
import like from '../../assets/like.png'
import dislike from '../../assets/dislike.png'
import share from '../../assets/share.png'
import save from '../../assets/save.png'
import my from '../../assets/my.png'
import user_profile from '../../assets/user_profile.jpg'
import { API_KEY, value_converter } from '../../data'
import moment from 'moment'
import { useParams } from 'react-router-dom'

const PlayVideo = () => {

const {videoId} = useParams();
const [apiData,setApiData] = useState(null);
const [channelData,setChannelData] = useState(null);
const [commentData,setCommentData] = useState([]);

const fetchVideoData = async () => {
    try {
        const videoDetails_url = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&id=${videoId}&key=${API_KEY}`;
        const res = await fetch(videoDetails_url);
        const data = await res.json();
        if (data.items && data.items.length > 0) {
            setApiData(data.items[0]);
        } else {
            console.error("No video data found");
        }
    } catch (error) {
        console.error("Error fetching video data:", error);
    }
};

const fetchOtherData = async () => {
    try {
        if (!apiData || !apiData.snippet) return;
        const channelData_url = `https://youtube.googleapis.com/youtube/v3/channels?part=snippet%2CcontentDetails%2Cstatistics&id=${apiData.snippet.channelId}&key=${API_KEY}`;
        const res = await fetch(channelData_url);
        const data = await res.json();
        if (data.items && data.items.length > 0) {
            setChannelData(data.items[0]);
        } else {
            console.error("No channel data found");
        }
    } catch (error) {
        console.error("Error fetching channel data:", error);
    }
    //fetch comment data 
    const comment_url=`https://youtube.googleapis.com/youtube/v3/commentThreads?part=snippet%2Creplies&maxResults=50&videoId=${videoId}&key=${API_KEY}`
    await fetch(comment_url).then(res => res.json()).then(data=>setCommentData(data.items)).catch(error => console.error("Error fetching comments:", error));
};

useEffect(()=>{
fetchVideoData();
},[videoId])

useEffect(() => {
    if (apiData && apiData.snippet) {
        fetchOtherData();
    }
}, [apiData]);


  return (
    <div className='play-video'>
      {/* <video src={video1} controls autoPlay muted></video> */}
      <iframe src={`https://www.youtube.com/embed/${videoId}?autoplay=1`} frameBorder={0} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
      <h3>{apiData?apiData.snippet.title:"Title Here"}</h3>
      <div className="play-video-info">
        <p>{apiData?value_converter(apiData.statistics.viewCount):"16K"} Views &bull; {apiData?moment(apiData.snippet.publishedAt).fromNow():"Unknown Date"}</p>
      <div>
      <span><img src={like} alt=""/>{apiData?value_converter(apiData.statistics.likeCount):155}</span>
      <span><img src={dislike} alt="dislike"/></span>
      <span><img src={share} alt="share"/>Share</span>
      <span><img src={save} alt="save"/>Save</span>
    </div>
    </div>
    <hr />
    <div className='publisher'>
    <img 
    src={channelData?.snippet?.thumbnails?.default?.url || user_profile} 
    alt="Channel Thumbnail"
/>

<div>
    <p>{apiData?apiData.snippet.channelTitle:""}</p>
    <span>{channelData?value_converter(channelData.statistics.subscriberCount):"1M"} Subscribers</span>
</div>
<button>Subscribe</button>
    </div>
    <div className='vid-description'>
        <p>{apiData?apiData.snippet.description.slice(0,250):"Description Here"}</p>
        <hr/>
        <h4>{apiData?value_converter(apiData.statistics.commentCount):100} Comments</h4>

        {commentData.map((item,index)=>{
           return(
           <div key={index}className="comment">
            <img src={item.snippet.topLevelComment.snippet.authorProfileImageUrl} alt="User Profile"/>
            <div>
                <h3>{item.snippet.topLevelComment.snippet.authorDisplayName}<span>1 day ago</span></h3>
                <p>{item.snippet.topLevelComment.snippet.textDisplay}</p>
                <div className="comment-action">
                    <img src ={like} alt=""/>
                    <span>{value_converter(item.snippet.topLevelComment.snippet.likeCount)}</span>
                    <img src={dislike} alt=""/>
                </div>
            </div>
        </div>
           )   

        })}
        

    </div>
    </div>
  )
}

export default PlayVideo
