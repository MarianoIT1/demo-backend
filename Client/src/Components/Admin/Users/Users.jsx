import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  changeUserRole,
  disableUser,
  getUsers,
  setFilterUser,
  sortByAscendingUser,
  sortByDescendingUsers,
} from "../../../Slice/Admin/AdminSlice";
import { axiosModeEventsCreateForUser } from "../../../Slice/EventsCreateForUser/CreateForUserSlice";
import EventsInfo from "../Events/EventsInfo";
import SearchBar from "../SearchBar/SearchAdmin";
import Styles from "./User.module.css";
import UserInfo from "./UserInfo";
function Users() {
  const { users, errorUser } = useSelector((state) => state.admin);
  const dispatch = useDispatch();
  useEffect(() => {
    if(!users.length){
    dispatch(getUsers());}
  }, []);
  const handleBanned = (e) => {
    console.log(e);
    dispatch(disableUser(e.id));
    // dispatch(deleteUser(e));
  };
  const handleChangeRole = (e) => {
    console.log(e);
    dispatch(changeUserRole(e.id));
    // dispatch(deleteUser(e));
  };

  const handleSearch = (key) => {
    dispatch(setFilterUser(key));
  };
  const accent = (e) => {
    dispatch(sortByAscendingUser(e));
  };

  const deccent = (e) => {
    dispatch(sortByDescendingUsers(e));
  };

  return (
    <>
      <SearchBar onSearch={handleSearch} />
      {users.length > 0 ? (
        <>
          {errorUser ? <h2>{errorUser}</h2> : undefined}
          <UserInfo
            users={users}
            handleChangeRole={handleChangeRole}
            handleBanned={handleBanned}
            accent={accent}
            deccent={deccent}
          />
        </>
      ) : (
        <h2>Loading...</h2>
      )}
    </>
  );
}

export default Users;
