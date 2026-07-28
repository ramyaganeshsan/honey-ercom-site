import { t } from "i18next";

const FilterByRatings = ({ handleFilterCheckbox, ratingsFilter }) => {
  return (
    <div className="cyr-rating-filter">
      <h4>{t("filter_by_ratings")}</h4>
      <ul>
        <li>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              value={1}
              id="rating1"
              onChange={(e) => handleFilterCheckbox(e.target.value)}
              checked={ratingsFilter?.includes(1)}
            />
            <label className="form-check-label" htmlFor="rating1">
              <em className="rating-star"></em>
            </label>
          </div>
        </li>
        <li>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              value={2}
              id="rating2"
              onChange={(e) => handleFilterCheckbox(e.target.value)}
              checked={ratingsFilter?.includes(2)}
            />
            <label className="form-check-label" htmlFor="rating2">
              <em className="rating-star"></em>
              <em className="rating-star"></em>
            </label>
          </div>
        </li>
        <li>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              value={3}
              id="rating3"
              onChange={(e) => handleFilterCheckbox(e.target.value)}
              checked={ratingsFilter?.includes(3)}
            />
            <label className="form-check-label" htmlFor="rating3">
              <em className="rating-star"></em>
              <em className="rating-star"></em>
              <em className="rating-star"></em>
            </label>
          </div>
        </li>
        <li>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              value={4}
              id="rating4"
              onChange={(e) => handleFilterCheckbox(e.target.value)}
              checked={ratingsFilter?.includes(4)}
            />
            <label className="form-check-label" htmlFor="rating4">
              <em className="rating-star"></em>
              <em className="rating-star"></em>
              <em className="rating-star"></em>
              <em className="rating-star"></em>
            </label>
          </div>
        </li>
        <li>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              value={5}
              id="rating5"
              onChange={(e) => handleFilterCheckbox(e.target.value)}
              checked={ratingsFilter?.includes(5)}
            />
            <label className="form-check-label" htmlFor="rating5">
              <em className="rating-star"></em>
              <em className="rating-star"></em>
              <em className="rating-star"></em>
              <em className="rating-star"></em>
              <em className="rating-star"></em>
            </label>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default FilterByRatings;
