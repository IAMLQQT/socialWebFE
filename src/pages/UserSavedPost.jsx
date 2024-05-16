/* eslint-disable react/prop-types */
import "../scss/Post.scss";
import { Link, useNavigate } from "react-router-dom";
import moment from "moment";

function UserSavedPost({ savepost }) {
    console.log("đây là save post: " , savepost)
  const { post_id, title, tags, user, created_at} =
  savepost.post;
  const {likeCount, commentCount } = savepost;
  const navigate = useNavigate();
  let date = new Date(created_at * 1000);
  let date_string = moment(date).format("LLL");

  return (
    <div className="post flex">
      <div className="stats">
        <p>{likeCount} Likes</p>
        <p>{commentCount} Comments</p>
      </div>
      <div className="question">
        <Link to={`/home/post/${post_id}`}>
          <h3 className="title">{title}</h3>
        </Link>
        <div className="tags flex ">
          {tags
            ?.split(",")

            .map((tag) => (
              <p key={tag}>{tag}</p>
            ))}
        </div>
        <div className="post-info flex a-center">
          <img crossOrigin="anonymus" src={user?.profile_picture} alt="" />
          <p
            className="post-description"
            onClick={() => navigate(`/home/profile/${user?.user_id}`)}
          >
            {user?.first_name} {user?.last_name} | {date_string}
          </p>
        </div>
      </div>
    </div>
  );
}

export default UserSavedPost;
