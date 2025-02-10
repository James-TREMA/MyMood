import { User } from "./models/User";
import { Cohort } from "./models/Cohort";
import { CohortAssignment } from "./models/CohortAssignment";
import { MoodScore } from "./models/MoodScore";
import { Alert } from "./models/Alert";
import { MoodHistory } from "./models/MoodHistory";
import { BlacklistedStudent } from "./models/BlacklistedStudent";

export const entities = [
  User,
  Cohort,
  CohortAssignment,
  MoodScore,
  Alert,
  MoodHistory,
  BlacklistedStudent
];