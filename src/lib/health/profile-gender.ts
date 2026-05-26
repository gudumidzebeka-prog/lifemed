export const PROFILE_GENDER_VALUES = ["male", "female", "other"] as const;

export type ProfileGender = (typeof PROFILE_GENDER_VALUES)[number];

export function isProfileGender(value: string | null | undefined): value is ProfileGender {
  return PROFILE_GENDER_VALUES.includes(value as ProfileGender);
}

export function profileGenderLabel(
  gender: ProfileGender | undefined,
  t: (key: "profile.genderMale" | "profile.genderFemale" | "profile.genderOther") => string
) {
  switch (gender) {
    case "male":
      return t("profile.genderMale");
    case "female":
      return t("profile.genderFemale");
    case "other":
      return t("profile.genderOther");
    default:
      return "";
  }
}

export function profileGenderOptions(
  t: (key: "profile.genderMale" | "profile.genderFemale" | "profile.genderOther") => string
) {
  return PROFILE_GENDER_VALUES.map((value) => ({
    value,
    label: profileGenderLabel(value, t),
  }));
}
