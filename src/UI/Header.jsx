/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import "../scss/Header.scss";

import PropTypes from "prop-types";
import ContentLoader from "react-content-loader";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../AuthProvider";
import axios from "axios";
import { useNavigate } from "react-router-dom";
Header.propTypes = {
  user: PropTypes.shape({
    first_name: PropTypes.string.isRequired,
    last_name: PropTypes.string.isRequired,
    profile_picture: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
  }),
};

function Header({ user }) {
  const [isDropdown, setIsDropdown] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { token } = useAuth();
  const SERVER_DOMAIN = import.meta.env.VITE_SERVER_DOMAIN;
  const { handleLogout } = useAuth();
  const modalRef = useRef();
  const searchRef = useRef();
  const resultRef = useRef();
  const handleButtonClick = (buttonType) => {
    switch (buttonType) {
      case "profile":
        setIsDropdown(false);
        navigate("/home/profile/" + user.user_id);

        break;
      case "logout":
        handleLogout();
        break;
      case "settings":
        setIsDropdown(false);
        navigate("/home/profiledetail");

        break;
      default:
        break;
    }
  };
  const handleDropdown = () => {
    setIsDropdown(!isDropdown);
  };

  const handleKeyPress = (e) => {
    if (search === "") setSearchResult([]);
    if (e.key === "Enter" && search) {
      setIsLoading(true);
      axios
        .get(SERVER_DOMAIN + "/search?keyword=" + search, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setSearchResult(res.data.data);
          setIsLoading(false);
          setIsResultModalOpen(true);
          console.log(res.data.data);
        })
        .catch((err) => {
          console.log(err);
          setIsLoading(false);
        });
    }
  };
  useEffect(() => {
    if (search.length < 3) return;
    const debounceTimer = setTimeout(() => {
      setIsResultModalOpen(true);
      setIsLoading(true);
      axios
        .get(SERVER_DOMAIN + "/search?keyword=" + search, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          if (res.data.data.length === 0) {
            setSearchResult(null);
          } else setSearchResult(res.data.data);

          setIsLoading(false);
          console.log(res.data.data);
        })
        .catch((err) => {
          console.log(err);
          setIsLoading(false);
        });
    }, 500);
    return () => clearTimeout(debounceTimer);
  }, [search]);
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        !searchRef.current.contains(event.target)
      ) {
        console.log(modalRef.current.contains(event.target), resultRef);

        setIsDropdown(false);
        setIsResultModalOpen(false);
      }
    };

    if (isDropdown || isResultModalOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isDropdown, isResultModalOpen]);
  return (
    <div className="header flex a-center j-between">
      <div className="nav-header flex a-center j-center">
        <p className="active">Explore</p>
        <p>Community post</p>
        <p>Pages</p>
      </div>

      <div className="info-ctn flex a-center">
        <div className="search-bar">
          <input
            id="searchbar"
            className="search-input"
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyPress}
            ref={searchRef}
            onFocus={() => setIsResultModalOpen(true)}
          />

          {isResultModalOpen && isLoading ? (
            <ul className="search-result" ref={resultRef}>
              <li>Searching...</li>
            </ul>
          ) : (
            <>
              {isResultModalOpen &&
              searchResult == null &&
              search.length !== "" ? (
                <ul className="search-result" ref={resultRef}>
                  <li className="">No result</li>
                </ul>
              ) : (
                isResultModalOpen &&
                search !== "" &&
                searchResult != null && (
                  <ul className="search-result" ref={resultRef}>
                    {searchResult.map((post) => (
                      <li className="search-item" key={post.post_id}>
                        {post.title}
                      </li>
                    ))}
                  </ul>
                )
              )}
            </>
          )}
        </div>

        <div className="user-info flex a-center" ref={modalRef}>
          {user ? (
            <>
              <div className="user-ava" onClick={() => handleDropdown()}>
                <img
                  crossOrigin="anonymous"
                  src={
                    user.profile_picture ? user.profile_picture : "/user.png"
                  }
                  alt="user-ava"
                  className="ava"
                />
                <img src="/up-arrow.png" alt="dropdown" className="icon" />
              </div>
              {isDropdown ? (
                <ul className="menu">
                  <li className="menu-item">
                    <button
                      className="flex a-center"
                      onClick={() => handleButtonClick("profile")}
                    >
                      <img
                        crossOrigin="anonymous"
                        src={
                          user?.profile_picture
                            ? user?.profile_picture
                            : "/public/user.png"
                        }
                        alt="user-ava"
                        className="ava"
                      />
                      <div className="flex">
                        <div className="user-name">
                          <p>{`${user?.first_name || ""} ${
                            user?.last_name || ""
                          }`}</p>
                          <p>{user?.email || ""}</p>
                        </div>
                      </div>
                    </button>
                  </li>
                  <li className="menu-item">
                    <button onClick={() => handleButtonClick("settings")}>
                      <img src="/settings.png" alt="setting-icon" />
                      <p>Edit my profile</p>
                    </button>
                  </li>
                  <li className="menu-item">
                    <button onClick={() => handleButtonClick("logout")}>
                      <img src="/logout.png" alt="activity-icon" />
                      <p>Log out</p>
                    </button>
                  </li>
                </ul>
              ) : null}
            </>
          ) : (
            <ContentLoader
              speed={5}
              width={50}
              height={50}
              viewBox="0 0 400 160"
              backgroundColor="#f3f3f3"
              foregroundColor="#ecebeb"
              className="user-info"
            >
              <rect x="0" y="56" rx="3" ry="3" width="410" height="6" />
              <rect x="0" y="72" rx="3" ry="3" width="380" height="6" />
              <rect x="0" y="88" rx="3" ry="3" width="178" height="6" />
            </ContentLoader>
          )}
        </div>
      </div>
    </div>
  );
}

export default Header;
