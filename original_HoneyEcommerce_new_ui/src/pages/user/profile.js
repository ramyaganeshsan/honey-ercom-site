import React, { useEffect, useLayoutEffect, useState } from "react";
import BreadCrumb from "../../components/utils/breadcrumb";
import { t } from "i18next";
import ProfileSidebarMenu from "../../components/menu/profileSidebarMenu";
import PersonalInfo from "../../forms/personalInfo";
import AddressInfo from "../../forms/address";
import Divider from "../../components/utils/divider";
import { profileSchema } from "../../validation/user.validaton";
import { validateForm, extractErrors } from "../../validation";
import { useGetStatesAndCitiesMutation } from "../../rtk/networkcalls/common.query";
import { toast } from "react-toastify";
import { handleResponse, removeSessionID, toastConfig } from "../../utils";
import { Link, useNavigate } from "react-router-dom";
import TransparentSpinner from "../../components/utils/transparentSpinner";
import {
  useGetUserProfileDetailsMutation,
  useUpdateUserProfileDetailsMutation,
} from "../../rtk/networkcalls/user.query";
import SomethingWentWrong from "../../components/utils/somethingWentWrong";
import ChangePasswordModal from "./changePasswordModel";
import AccountBlocked from "../../components/utils/account_blocked";

const breadcrumbLinks = [
  {
    id: 0,
    path: "/",
    text: t("home"),
  },
  {
    id: 1,
    path: "/personal_info",
    text: t("personal_info"),
    isActive: true,
  },
];

const initialErrorState = {
  firstname: "",
  lastname: "",
  email: "",
  address1: "",
  city_id: "",
  state_id: "",
  country_id: "",
  phone_number: "",
  gender: "",
};

const UserProfile = () => {
  const navigate = useNavigate();
  const [getStatesAndCities, { isError: cityAndStatesError }] =
    useGetStatesAndCitiesMutation();

  const [getUserProfileDetails, { isError: fetchUserDetailsError }] =
    useGetUserProfileDetailsMutation();

  const [
    updateUserProfileDetails,
    { isLoading: updateingUserProfile, isError: failedToUpdateProfile },
  ] = useUpdateUserProfileDetailsMutation();
  const [isAccountBlocked, setIsAccountBlocked] = useState(false);

  let [loading, setLoading] = useState(false);

  useLayoutEffect(() => {
    let searchBar = document.getElementById("cyr-search-bar");
    if (searchBar) {
      searchBar.style.display = "none";
    }
  }, []);

  let [state, setState] = useState({
    firstname: "",
    lastname: "",
    email: "",
    address1: "",
    city_id: "",
    state_id: "",
    country_id: "",
    phone_number: "",
    gender: 1,
    response: {},
    cities: [],
    citiesArray: [],
    states: [],
    countries: [],
    isError: false,
  });

  let [errors, setErrors] = useState(initialErrorState);

  useEffect(() => {
    const fetchData = async () => {
      let countries = [];
      let states = [];
      let cities = [];
      let citiesArray = [];
      let userProfile = {};
      let isError = false;

      setLoading(true);

      let [statesAndCities, profileDetails] = await Promise.all([
        getStatesAndCities(),
        getUserProfileDetails(),
      ]);

      if (
        statesAndCities &&
        statesAndCities?.data &&
        Number(statesAndCities?.data?.status) === 1
      ) {
        for (let i = 0; i < statesAndCities?.data?.data?.length; i++) {
          const country = statesAndCities?.data?.data[i];
          countries.push({
            country_name: country["country_name"],
            country_id: country["country_id"],
          });
        }
      } else {
        let message = t("try_again_later");
        toast.error(message, toastConfig);
        isError = true;
      }

      if (profileDetails && profileDetails?.data) {
        if (Number(profileDetails?.data?.status) === 1) {
          userProfile = profileDetails?.data?.data;
        } else if (profileDetails?.data?.status === -10) {
          setIsAccountBlocked(true);
        } else {
          handleResponse(profileDetails?.data?.data, toast, navigate);
        }
      } else {
        let message = t("try_again_later");
        toast.error(message, toastConfig);
        isError = true;
      }

      if (userProfile?.country_id) {
        let response = statesAndCities?.data?.data;
        for (let i = 0; i < response.length; i++) {
          if (
            Number(response[i]["country_id"]) ===
            Number(userProfile?.country_id)
          ) {
            states = response[i]["states"];
            citiesArray = response[i]["cities"];
            break;
          }
        }
      }
      if (userProfile?.state_id) {
        if (citiesArray && citiesArray?.length > 0) {
          for (let i = 0; i < citiesArray.length; i++) {
            if (
              Number(citiesArray[i]["stateid"]) ===
              Number(userProfile?.state_id)
            ) {
              cities.push(citiesArray[i]);
            }
          }
        }
      }

      setState((prev) => ({
        ...prev,
        countries,
        response: statesAndCities?.data?.data,
        ...userProfile,
        isError,
        states,
        cities,
        citiesArray: cities,
      }));

      setLoading(false);
    };
    fetchData();
  }, []);

  const handleInputChange = (event) => {
    setState((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleFormSubmit = async () => {
    let data = {
      firstname: state.firstname,
      lastname: state.lastname,
      phone_number: state.phone_number,
      email: state.email,
      gender: state.gender?.toString() ?? "1",
      city_id: Number(state.city_id),
      state_id: Number(state.state_id),
      country_id: Number(state.country_id),
      address1: state?.address1,
    };

    let validation = validateForm(profileSchema, data);
    if (!validation.isValidForm) {
      let errorObject = extractErrors(validation.errors ?? []);
      setErrors(errorObject);
    } else {
      const response = await updateUserProfileDetails(data);
      setErrors(initialErrorState);
      if (response.data) {
        if (Number(response.data?.status) === -3) {
          let errorObject = extractErrors(response?.data?.errors ?? []);
          setErrors(errorObject);
        } else if (Number(response.data?.status) === 1) {
          let message = response?.data?.message;
          toast.success(message, toastConfig);
        } else {
          handleResponse(response?.data, toast, navigate);
        }
      } else {
        let message = t("something_went_wrong");
        toast.error(message, toastConfig);
      }
    }
  };

  const handleCountryChange = (countryId) => {
    let states = [];
    let cities = [];
    if (
      state?.response &&
      state?.response?.length > 0 &&
      countryId !== "" &&
      !isNaN(countryId)
    ) {
      let statesAndCities = state?.response;
      for (let i = 0; i < statesAndCities.length; i++) {
        if (Number(statesAndCities[i]["country_id"]) === Number(countryId)) {
          states = statesAndCities[i]["states"];
          cities = statesAndCities[i]["cities"];
          break;
        }
      }
      setState((prev) => ({
        ...prev,
        country_id: Number(countryId),
        states: states,
        citiesArray: cities,
      }));
    }
  };

  const handleStateChange = (stateId) => {
    let cities = [];
    if (state?.citiesArray && state?.citiesArray?.length > 0) {
      let citiesArray = state?.citiesArray;
      for (let i = 0; i < citiesArray.length; i++) {
        if (Number(citiesArray[i]["stateid"]) === Number(stateId)) {
          cities.push(citiesArray[i]);
        }
      }
    }
    setState((prev) => ({
      ...prev,
      state_id: Number(stateId),
      cities: cities,
    }));
  };

  const handleCityChanges = (cityId) => {
    if (!cityId) {
      return;
    }
    setState((prev) => ({
      ...prev,
      city_id: cityId,
    }));
  };

  const handleLogout = () => {
    navigate("/");
    removeSessionID();
    localStorage.clear("user_details");
    window.location.reload();
  };

  if (
    cityAndStatesError ||
    fetchUserDetailsError ||
    state.isError ||
    failedToUpdateProfile
  ) {
    return <SomethingWentWrong />;
  }

  if (isAccountBlocked) {
    return <AccountBlocked handleLogout={handleLogout} />;
  }

  return (
    <>
      {(loading || updateingUserProfile) && <TransparentSpinner />}
      <div className="page-options-ctnr">
        <div className="container">
          <div className="row">
            <div className="page-options-ctnr-inner">
              <BreadCrumb links={breadcrumbLinks} />
            </div>
          </div>
        </div>
      </div>
      <div className="product-listpage-ctnr">
        <div className="container">
          <div className="row">
            <div className="product-listpage-ctnr-inner">
              <div className="product-list-lft">
                <ProfileSidebarMenu activeLink="personal_info" />
              </div>
              <div className="wishlist-rgt">
                <h2 className="page-title profile-page-title">
                  <span>{t("personal_info")}</span>
                  <span className="change-password-button">
                    <Link
                      to="#"
                      className="btn theme_btn"
                      title={t("change_password")}
                      id="changePasswordButton"
                      data-bs-toggle="modal"
                      data-bs-target="#changePassword"
                    >
                      {t("change_password")}
                    </Link>
                    &nbsp;
                    <button
                      onClick={handleLogout}
                      className="btn theme_btn"
                      title={t("signout")}
                    >
                      {t("signout")}
                    </button>
                  </span>
                </h2>
                <PersonalInfo
                  errors={errors}
                  state={state}
                  handleInputChange={handleInputChange}
                />
                <Divider />
                <h2 className="page-title">{t("address")}</h2>
                <AddressInfo
                  errors={errors}
                  handleFormSubmit={handleFormSubmit}
                  currentState={state}
                  handleInputChange={handleInputChange}
                  handleCountryChange={handleCountryChange}
                  handleStateChange={handleStateChange}
                  handleCityChanges={handleCityChanges}
                  states={state.states}
                  countries={state.countries}
                  cities={state.cities}
                  stateId={state.state_id}
                  countryId={state.country_id}
                  cityId={state.city_id}
                  updatingProfile={updateingUserProfile}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <ChangePasswordModal />
    </>
  );
};

export default UserProfile;
