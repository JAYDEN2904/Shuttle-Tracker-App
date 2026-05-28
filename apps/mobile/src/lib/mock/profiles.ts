import type { Profile } from "@/types/database.types";

const timestamp = "2026-01-15T08:00:00.000Z";

export const MOCK_STUDENT_PROFILE: Profile = {
  id: "mock-student-001",
  email: "ama.mensah@ug.edu.gh",
  name: "Ama Mensah",
  role: "student",
  employee_id: null,
  avatar_url: null,
  expo_push_token: null,
  created_at: timestamp,
  updated_at: timestamp,
};

export const MOCK_DRIVER_PROFILE: Profile = {
  id: "mock-driver-001",
  email: "kwame.boateng@shuttle.ug.edu.gh",
  name: "Kwame Boateng",
  role: "driver",
  employee_id: "DRV-00142",
  avatar_url: null,
  expo_push_token: null,
  created_at: timestamp,
  updated_at: timestamp,
};
