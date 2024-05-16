/* eslint-disable react/prop-types */
import "../scss/Post.scss";
import { useAuth } from "../AuthProvider";
import { useEffect, useRef } from "react";
import axios from "axios";
import { useState } from "react";
import { Outlet, useMatch } from "react-router-dom";
import { Code } from "react-content-loader";
import InfiniteScroll from "react-infinite-scroll-component";
import { useUser } from "../UserProvider"
import UserSavedPost from "./UserSavedPost";

export default function Savedpost() {
    const [saveposts, setSavePosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const page = useRef(1);

    const { token } = useAuth();
    const { user, handleGetProfile } = useUser();


const SERVER_DOMAIN = import.meta.env.VITE_SERVER_DOMAIN;
useEffect(handleGetProfile, []);
  const fetchPosts = () => {
    page.current += 1;
    axios
      .get(SERVER_DOMAIN + `/savedpost?page=${page.current}&limit=5`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.data.data.length === 0) {
          setHasMore(false);
          return;
        }
        console.log("fetch", res.data.data);
        setSavePosts([...saveposts, ...res.data.data]);
      })
      .catch((err) => {
        console.log(err);
        setHasMore(false);
      });
  };

  useEffect(() => {
    axios
      .get(SERVER_DOMAIN + "/savedpost?page=1&limit=5", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        console.log("data", res.data.data);
        setIsLoading(false);
        setSavePosts(res.data.data);
      });
  },[]);
  return (
              <div className="newsfeed">
                {!isLoading ? (
                  <InfiniteScroll
                    dataLength={saveposts.length}
                    next={fetchPosts}
                    hasMore={hasMore}
                    loader={<Code className="post" />}
                    endMessage={
                      <p style={{ textAlign: "center", marginTop: "2rem" }}>
                        <b>Yay! You have seen it all</b>
                      </p>
                    }
                  >
                    {saveposts?.map((savepost) => (
                      <UserSavedPost savepost={savepost} key={savepost.post_id} />
                    ))}
                  </InfiniteScroll>
                ) : (
                  <>
                    <Code className="post" />
                    <Code className="post" />
                  </>
                )}
              </div>

  );
}

