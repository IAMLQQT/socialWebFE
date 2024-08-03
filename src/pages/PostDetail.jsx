import { Code } from "react-content-loader";
import "../scss/PostDetail.scss";
import { toast } from "react-toastify";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../AuthProvider";
import CodeBlock from "../ui/CodeBlock.jsx";
import axios from "axios";
import moment from "moment";
import { useUser } from "../UserProvider.jsx";
import Comment from "../ui/Comment.jsx";
import EditPostModal from "../UI/EditPostModal.jsx";
export default function PostDetail() {
  const modalRef = useRef();
  const [refresher, setRefresher] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [postDetail, setPostDetail] = useState(null);
  const [userComment, setUserComment] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdown, setIsDropdown] = useState(false);
  const [modalIsOpen, setIsOpen] = useState(false);

  const SERVER_DOMAIN = import.meta.env.VITE_SERVER_DOMAIN;
  const { token } = useAuth();
  const { postId } = useParams();
  const { user } = useUser();
  const likeListRef = useRef();
  const navigate = useNavigate();
  const handelSavePostButton = () => {
    console.log(postDetail);
    if (!postDetail.isSaved) {
      setPostDetail({
        ...postDetail,
        isSaved: true,
        User_saved_posts: [
          ...(postDetail.User_saved_posts || []), // Kiểm tra nếu User_saved_posts là null hoặc undefined, thì sử dụng một mảng trống
          { user_id: user.user.user_id, post_id: postDetail.post_id },
        ],
      });
      axios
        .post(
          `${SERVER_DOMAIN}/savepost`,
          {
            post_id: postId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then(() => { })
        .catch((err) => {
          console.log(err);
          toast.error("Something went wrong! Please try again!", {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 5000,
          });
        });
    } else {
      setPostDetail({
        ...postDetail,
        isSaved: false,
        User_saved_posts: (postDetail.User_saved_posts || []).filter(
          (save) => save.user_id !== user.user.user_id
        ),
      });
      axios
        .delete(`${SERVER_DOMAIN}/unSavePost/`, {
          data: {
            post_id: postId,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then(() => { })
        .catch((err) => {
          console.log(err);
          toast.error("Something went wrong! Please try again!", {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 5000,
          });
        });
    }
  };

  const handleLikeButton = () => {
    console.log(postDetail);
    if (!postDetail.isLiked) {
      setPostDetail({
        ...postDetail,
        isLiked: true,
        likes: [
          ...postDetail.likes,
          { user_id: user.user_id, post_id: postDetail.post_id },
        ],
      });
      axios
        .post(
          `${SERVER_DOMAIN}/likePost`,
          {
            post_id: postId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ) 
        .then(() => {setRefresher(!refresher);})
        .catch((err) => {
          console.log(err);
          toast.error("Something went wrong! Please try again!", {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 5000,
          });
        });
    } else {
      axios
        .delete(`${SERVER_DOMAIN}/unlikePost/`, {
          data: {
            post_id: postId,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then(() => { 
          setPostDetail({
            ...postDetail,
            isLiked: false,
            likes: postDetail.likes.filter(
              (like) => like.user_id !== user.user.user_id
            ),
          });
        })
        .catch((err) => {
          console.log(err);
          toast.error("Something went wrong! Please try again!", {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 5000,
          });
        });
    }
  };
  const handleEditButton = () => {
    setIsDropdown(false);
    setIsOpen(true);
  };
  const handleUserComment = (e) => {
    setUserComment(e.target.value);
    autoResizeTextarea(e.target);
  };
  const autoResizeTextarea = (textarea) => {
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight + 25}px`;
  };
  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (userComment === "") {
      return;
    }

    axios
      .post(
        `${SERVER_DOMAIN}/addComment`,
        {
          post_id: postId,
          content: userComment,
          created_at: moment().unix(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then(() => {
        setUserComment("");
        setRefresher(!refresher);
      })
      .catch((err) => {
        console.log(err);
        toast.error("Something went wrong! Please try again!", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 5000,
        });
      });
  };

  useEffect(() => {
    axios
      .get(`${SERVER_DOMAIN}/postdetail/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setPostDetail(res.data.data);
        setIsLoading(false);
        console.log("postdetail", res.data.data);
      })
      .catch((err) => {
        toast.error("Something went wrong! Please try again!", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 5000,
        });
        console.log(err);
      });
  }, [postId, refresher]);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (likeListRef.current && e.target.contains(likeListRef.current)) {
        setIsModalOpen(false);
      }
    };
    if (isModalOpen) window.addEventListener("mousedown", handleClickOutside);

    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [isModalOpen]);
  if (isLoading) {
    return <Code />;
  }
  return (
    <div className="post-detail">
      <div className="post-detail-header flex a-center j-between">
        <h1>{postDetail?.title}</h1>
        <div className="post-detail-header-btn">
          <button className="post-save" onClick={handelSavePostButton}>
            <i
              className={`${postDetail?.isSaved ? "fa-solid" : "fa-regular"
                } fa-bookmark`}
            ></i>
          </button>
          <button className="post-like" onClick={handleLikeButton}>
            <i
              className={`${postDetail?.isLiked ? "fa-solid" : "fa-regular"
                } fa-heart`}
            ></i>
          </button>
          <button type="button" className="post-edit" onClick={() => setIsDropdown(true)}>
            <i className="fa-solid fa-ellipsis"></i>
          </button>
          {isDropdown && (
            <ul className="modify-dropdown" ref={modalRef}>
              {user.user.user_id === postDetail?.user?.user_id && (
                <>
                  <li>
                    <button type="button" onClick={handleEditButton}>
                      Edit
                    </button>
                    <EditPostModal
                    modalIsOpen={modalIsOpen}
                    setIsOpen={setIsOpen}
                    user={user?.user}
                    postdetail={postDetail}
                   />
                  </li>
                  <li>
                    <button type="button" >
                      Delete
                    </button>
                    
                  </li>
                </>
              )}
              {user.user.user_id !== postDetail?.user?.user_id && (
                <>
                  <li>
                    <button type="button">Report</button>
                  </li>
                </>
              )}
            </ul>
            )}
        </div>
      </div>
      <div className="post-detail-content">
        <p className="post-content">{postDetail?.content}</p>
      </div>
      {postDetail?.code && (
        <div className="post-detail-code">
          <CodeBlock codeString={postDetail?.code} />
        </div>
      )}

      <div className="post-detail-hashtag">
        {postDetail?.tags?.split(",").map((tag) => (
          <span className="hashtag" key={tag}>
            #{tag}
          </span>
        ))}
      </div>
      <div className="post-detail-description flex a-center j-between">
        <div className="post-detail-voting">
          <span
            className="number-of-likes"
            onClick={() => setIsModalOpen(true)}
          >
            <i className="fa-solid fa-heart"></i> {postDetail?.likes?.length}{" "}
            Likes
          </span>
          <span className="number-of-comment">
            <i className="fa-solid fa-comments"></i>{" "}
            {postDetail?.comments?.length} Comments
          </span>
        </div>
        <div className="post-info flex a-center">
          <img
            crossOrigin="anonymus"
            src={postDetail?.user?.profile_picture}
            alt=""
          />
          <p
            className="post-description"
            onClick={() =>
              navigate(`/home/profile/${postDetail?.user?.user_id}`)
            }
          >
            {postDetail?.user?.first_name} {postDetail?.user?.last_name} |{" "}
            {moment.unix(postDetail?.created_at).format("LLL")}
          </p>
        </div>
      </div>

      <div className="post-detail-create-comment flex a-center ">
        <img
          crossOrigin="anonymous"
          src={user?.user?.profile_picture || "/user.png"}
          alt="user-ava"
        />
        <textarea
          type="text"
          placeholder="Write something..."
          value={userComment}
          onChange={handleUserComment}
        ></textarea>

        <img
          src="/comment-icon.png"
          alt="comment icon"
          className="comment-icon"
          onClick={handleSubmitComment}
        />
      </div>

      <div className="post-detail-comment">
          {postDetail?.comments.map((comment) => (
            <Comment
              comment={comment}
              key={comment.comment_id}
              setRefresher={setRefresher}
              postDetail={postDetail}
              setPostDetail={setPostDetail}
              userId={user?.user?.user_id}
              token={token}
            />
          ))}
        </div>
        {isModalOpen && (
          <ul className="like-list" ref={likeListRef}>
            <h2>Who likes</h2>
            <img
              src="/close.png"
              alt="/close.png"
              className="btn-close"
              onClick={() => setIsModalOpen(false)}
            />
  
            {postDetail?.likes?.map((like) => (
              <li key={like?.user_id}>
                <button
                  type="button"
                  className="flex a-center"
                  onClick={() => navigate(`/home/profile/${like?.user_id}`)}
                >
                  <img
                    crossOrigin="anonymus"
                    src={like?.user?.profile_picture}
                    alt="Profile Picture"
                  />
                  <p>
                    {like.user?.first_name} {like?.user?.last_name}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
    </div>
  );


}
