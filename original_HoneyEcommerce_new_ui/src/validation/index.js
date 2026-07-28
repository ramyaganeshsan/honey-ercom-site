import JOI from "joi";

export const validateForm = (schema, value) => {
  const result = JOI.compile(schema)
    .prefs({ errors: { label: "key" }, abortEarly: false })
    .validate(value);
  let error = result.error;
  if (error) {
    let errors = [];
    error.details.map((details) =>
      errors.push({ key: details?.context?.key, message: details?.message })
    );
    return { isValidForm: 0, errors: errors };
  }
  return { isValidForm: 1 };
};

export const extractErrors = (errors) => {
  let errorsObject = {};
  for (let i = 0; i < errors.length; i++) {
    Object.assign(errorsObject, { [errors[i]["key"]]: errors[i]["message"] });
  }
  return errorsObject;
};
