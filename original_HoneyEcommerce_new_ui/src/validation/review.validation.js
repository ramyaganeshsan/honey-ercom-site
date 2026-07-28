import JOI from "joi";

export const addReviewSchema = {
  review_description: JOI.string().required().min(50).max(250).label("Review"),
  review_title: JOI.string().required().min(10).max(50).label("Review title"),
};
