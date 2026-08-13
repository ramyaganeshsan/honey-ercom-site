const { findOne, updateOne, deleteOne } = require("../../mongo/repo");
const { ok, fail, listCollection } = require("../services/admin.helpers");

exports.listReviews = async (req, res) => {
  try {
    const filter = {};
    if (req.query.approve_status !== undefined && req.query.approve_status !== "") {
      const v = req.query.approve_status;
      if (v === "true" || v === "1") filter.approve_status = { $in: [true, 1] };
      else if (v === "false" || v === "0") filter.approve_status = { $in: [false, 0] };
      else filter.approve_status = v === "true";
    }
    if (req.query.module_id) {
      filter.module_id = Number(req.query.module_id);
    }
    if (req.query.user_id) {
      filter.user_id = Number(req.query.user_id);
    }

    const data = await listCollection("rate_review", filter, req.query, {
      order: [["created_date", "DESC"]],
    });
    return res.send(ok(data));
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to list reviews"));
  }
};

exports.getReview = async (req, res) => {
  try {
    const item = await findOne("rate_review", { id: Number(req.params.id) });
    if (!item) {
      return res.send(fail("Review not found"));
    }
    return res.send(ok(item));
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to load review"));
  }
};

exports.updateReviewStatus = async (req, res) => {
  try {
    const id = Number(req.params.id);
    let approve_status = req.body?.approve_status;
    if (approve_status === undefined) {
      return res.send(fail("approve_status is required"));
    }
    if (approve_status === 1 || approve_status === "1" || approve_status === true) {
      approve_status = true;
    } else {
      approve_status = false;
    }

    const updated = await updateOne(
      "rate_review",
      { id },
      {
        approve_status,
        approved_user_id: Number(req.adminDetails?.user_id) || 0,
      }
    );
    if (!updated) {
      return res.send(fail("Review not found"));
    }
    return res.send(ok(updated, "Review status updated"));
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to update review"));
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await deleteOne("rate_review", { id });
    if (!result?.deletedCount) {
      return res.send(fail("Review not found"));
    }
    return res.send(ok(null, "Review deleted"));
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to delete review"));
  }
};
