import { t } from "i18next";
import { handleResponse, toastConfig } from "../utils";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { extractErrors, validateForm } from "../validation";
import { addReviewSchema } from "../validation/review.validation";
import ErrorMessage from "../components/utils/error";
import { useAddReviewMutation } from "../rtk/networkcalls/review.query";

let initalErrorState = {
  review_title: "",
  review_description: "",
};

const ReviewForm = ({ productId }) => {
  const [state, setState] = useState(5);
  const [errors, setErrors] = useState(initalErrorState);
  const navigate = useNavigate();
  const [addReview, { isLoading: waitingForResponse }] = useAddReviewMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    let validation = validateForm(addReviewSchema, data);

    if (!validation.isValidForm) {
      let errorObject = extractErrors(validation.errors ?? []);
      setErrors(errorObject);
    } else {
      data["rating"] =
        state && state !== "" && !isNaN(state) && state <= 5 ? state : 5;
      data["type_id"] = productId;

      if (!data["type_id"] && isNaN(data["type_id"])) {
        let message = t("something_went_wrong");
        toast.error(message, toastConfig);
        navigate("/");
      } else {
        const response = await addReview(data);
        setErrors(initalErrorState);
        if (response.data) {
          if (Number(response.data?.status) === -3) {
            let errorObject = extractErrors(response?.data?.errors ?? []);
            setErrors(errorObject);
          } else if (Number(response.data?.status) === 1) {
            let message = response?.data?.message;
            toast.success(message, toastConfig);
            e.target.reset();
          } else {
            handleResponse(response?.data, toast, navigate);
          }
        } else {
          let message = t("something_went_wrong");
          toast.error(message, toastConfig);
          e.target.reset();
        }
      }
    }
  };

  const handleReviewChange = (review) => {
    setState(Number(review));
  };

  return (
    <div className="review-form-ctnr">
      <form method="post" onSubmit={handleSubmit}>
        <div className="review-form-blk">
          <h3 className="review-frm-title">{t("add_a_review")}</h3>
          <p className="review-info">{t("required_field_info")}</p>
          <div className="form-grp">
            <label htmlFor="rate-input" className="form-label">
              {t("your_rating")}
              <sup>*</sup>
            </label>
            <div className="rate-input">
              <div
                onClick={() => handleReviewChange(1)}
                className="rate-blk rate-1 pointer_cursor"
              >
                {state === 1 ? (
                  <span href="#" className="star-bordered active"></span>
                ) : (
                  <span href="#" className="star-bordered"></span>
                )}
              </div>
              <div
                onClick={() => handleReviewChange(2)}
                className="rate-blk rate-1 pointer_cursor"
              >
                {state === 2 ? (
                  <>
                    <span href="#" className="star-bordered active"></span>
                    <span href="#" className="star-bordered active"></span>
                  </>
                ) : (
                  <>
                    <span href="#" className="star-bordered"></span>
                    <span href="#" className="star-bordered"></span>
                  </>
                )}
              </div>
              <div
                onClick={() => handleReviewChange(3)}
                className="rate-blk rate-1 pointer_cursor"
              >
                {state === 3 ? (
                  <>
                    <span href="#" className="star-bordered active"></span>
                    <span href="#" className="star-bordered active"></span>
                    <span href="#" className="star-bordered active"></span>
                  </>
                ) : (
                  <>
                    <span href="#" className="star-bordered"></span>
                    <span href="#" className="star-bordered"></span>
                    <span href="#" className="star-bordered"></span>
                  </>
                )}
              </div>
              <div
                onClick={() => handleReviewChange(4)}
                className="rate-blk rate-1 pointer_cursor"
              >
                {state === 4 ? (
                  <>
                    <span href="#" className="star-bordered active"></span>
                    <span href="#" className="star-bordered active"></span>
                    <span href="#" className="star-bordered active"></span>
                    <span href="#" className="star-bordered active"></span>
                  </>
                ) : (
                  <>
                    <span href="#" className="star-bordered"></span>
                    <span href="#" className="star-bordered"></span>
                    <span href="#" className="star-bordered"></span>
                    <span href="#" className="star-bordered"></span>
                  </>
                )}
              </div>
              <div
                onClick={() => handleReviewChange(5)}
                className="rate-blk rate-1 pointer_cursor"
              >
                {state === 5 ? (
                  <>
                    <span href="#" className="star-bordered active"></span>
                    <span href="#" className="star-bordered active"></span>
                    <span href="#" className="star-bordered active"></span>
                    <span href="#" className="star-bordered active"></span>
                    <span href="#" className="star-bordered active"></span>
                  </>
                ) : (
                  <>
                    <span href="#" className="star-bordered"></span>
                    <span href="#" className="star-bordered"></span>
                    <span href="#" className="star-bordered"></span>
                    <span href="#" className="star-bordered"></span>
                    <span href="#" className="star-bordered"></span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="form-grp">
            <label htmlFor="name-input" className="form-label">
              {t("review_title")}
              <sup>*</sup>
            </label>
            <input
              type="text"
              name="review_title"
              className="form-control"
              id="name-input"
              placeholder={t("review_title")}
              max={50}
            />
            <ErrorMessage
              message={errors?.review_title}
              show={errors?.review_title && errors?.review_title !== ""}
            />
          </div>
          <div className="form-grp">
            <label htmlFor="subject-input" className="form-label">
              {t("your_review")}
              <sup>*</sup>
            </label>
            <textarea
              className="form-control"
              id="subject-input"
              rows="3"
              name="review_description"
              placeholder={t("your_review")}
              max={250}
            ></textarea>
            <ErrorMessage
              message={errors?.review_description}
              show={
                errors?.review_description && errors?.review_description !== ""
              }
            />
          </div>
          <div className="form-grp">
            <input
              className="btn theme_btn"
              type="submit"
              value={waitingForResponse ? t("please_wait") : t("submit")}
              disabled={waitingForResponse}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
