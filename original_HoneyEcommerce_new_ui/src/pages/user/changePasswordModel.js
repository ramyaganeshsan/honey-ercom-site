import React, { useLayoutEffect, useState } from "react";
import { t } from "i18next";
import ChangePasswordForm from "../../forms/changePassword";
import { changePasswordSchema } from "../../validation/user.validaton";
import { extractErrors, validateForm } from "../../validation";
import { handleResponse, toastConfig } from "../../utils";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useUpdatePasswordMutation } from "../../rtk/networkcalls/user.query";

const initialErrorState = {
  old_password: "",
  new_password: "",
  confirm_password: "",
};

const ChangePasswordModal = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState(initialErrorState);
  const [updatePassword, { isLoading }] = useUpdatePasswordMutation();

  useLayoutEffect(() => {
    let searchBar = document.getElementById("cyr-search-bar");
    if (searchBar) {
      searchBar.style.display = "none";
    }
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    let validation = validateForm(changePasswordSchema, data);

    setErrors(initialErrorState);

    if (!validation.isValidForm) {
      let errorObject = extractErrors(validation.errors ?? []);
      setErrors(errorObject);
    } else if (data["confirm_password"] !== data["new_password"]) {
      setErrors((prev) => ({
        ...prev,
        confirm_password: t("password_mismatch"),
      }));
    } else {
      const response = await updatePassword(data);

      if (response.data) {
        if (Number(response.data?.status) === -3) {
          let errorObject = extractErrors(response?.data?.errors ?? []);
          setErrors(errorObject);
        } else if (Number(response.data?.status) === 1) {
          let message = response?.data?.message;
          toast.success(message, toastConfig);
          e.target.reset();
          let closeButton = document.getElementById(
            "confirm_password_close_button"
          );
          if (closeButton) {
            closeButton?.click();
          }
        } else {
          handleResponse(response?.data, toast, navigate);
        }
      } else {
        let message = t("something_went_wrong");
        toast.error(message, toastConfig);
        e.target.reset();
      }
    }
  };

  return (
    <>
      <div
        className="modal change-password-modal fade"
        id="changePassword"
        tabIndex="-1"
        aria-labelledby="changePasswordLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body">
              <button
                type="button"
                id="confirm_password_close_button"
                className="btn-close"
                disabled={isLoading}
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
              <h2 className="page-title">{t("change_password")}</h2>
              <ChangePasswordForm
                updatingPassword={isLoading}
                handleFormSubmit={handleFormSubmit}
                errors={errors}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChangePasswordModal;
