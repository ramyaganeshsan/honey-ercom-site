import { t } from "i18next";
import { getWordBasedOnLanguage } from "../../utils";

const CatwgoryWithProductCount = ({ categories, handleCategoryChange }) => {
  return (
    <div className="cyr-cate-filter">
      <h4>{t("categories")}</h4>
      <ul id="cate-filter">
        {categories?.map((category) => {
          return (
            <li
              onClick={() => handleCategoryChange(category?.category_id)}
              className="cyr-pointer-cursor"
              key={category?.category_name}
            >
              <span
                // title={category?.category_name}
                title={getWordBasedOnLanguage(
                  category?.category_name,
                  category?.category_name_french
                )}
              >
                {/* {category?.category_name} */}
                {getWordBasedOnLanguage(
                  category?.category_name,
                  category?.category_name_french
                )}
                <span>({category?.total_products})</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default CatwgoryWithProductCount;
