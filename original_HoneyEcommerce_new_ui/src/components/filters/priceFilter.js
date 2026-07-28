import { t } from "i18next";
const PriceFilter = ({ data, maximumPrice, handlePriceChange, siteInfo }) => {
  return (
    <div className="cyr-price-filter">
      <h4>{t("filter_by_price")}</h4>
      <input
        min={Math.ceil(data?.minimumPrice) ?? 0}
        max={Math.ceil(data?.maximunPrice) ?? 0}
        value={maximumPrice ? maximumPrice : data?.maximunPrice ?? 0}
        type="range"
        onChange={(e) => handlePriceChange(e.target.value)}
        id="customRange1"
      />
      <label>
        <span>{t("price")}: </span>
        {siteInfo?.siteSettings?.currency_symbol}{" "}
        {Math.ceil(data?.minimumPrice) ?? 0} -{" "}
        {siteInfo?.siteSettings?.currency_symbol}{" "}
        {maximumPrice ? maximumPrice : Math.ceil(data?.maximunPrice) ?? 0}{" "}
      </label>
    </div>
  );
};

export default PriceFilter;
