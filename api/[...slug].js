// backend/app.ts
import express2 from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// backend/routes.ts
import express from "express";
import fs from "fs";
import path from "path";
import crypto3 from "crypto";

// backend/db.ts
import crypto2 from "crypto";
import bcrypt2 from "bcryptjs";
import { EventEmitter } from "events";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, deleteDoc, runTransaction } from "firebase/firestore";

// frontend/data/schoolData.ts
var defaultWeatherConfig = {
  enabled: true,
  latitude: 28.2167,
  longitude: 81.6033,
  locationNameEn: "Banke, Nepal",
  locationNameNp: "\u092C\u093E\u0901\u0915\u0947, \u0928\u0947\u092A\u093E\u0932",
  subLocationEn: "Baijanath-5 Campus Area",
  subLocationNp: "\u092C\u0948\u091C\u0928\u093E\u0925-\u096B \u0935\u093F\u0926\u094D\u092F\u093E\u0932\u092F \u092A\u0930\u093F\u0938\u0930",
  autoRefreshMinutes: 30,
  temperatureUnit: "celsius",
  showForecast: true,
  showAtmosphericDetails: true,
  customAdvisoryNoticeEn: "",
  customAdvisoryNoticeNp: "",
  advisoryType: "info",
  showAdvisory: false
};
var initialSchoolData = {
  name_en: "Shree Ishwari Secondary School",
  name_np: "\u0936\u094D\u0930\u0940 \u0908\u0936\u094D\u0935\u0930\u0940 \u092E\u093E\u0927\u094D\u092F\u092E\u093F\u0915 \u0935\u093F\u0926\u094D\u092F\u093E\u0932\u092F",
  tagline_en: "Excellence in Education, Integrity in Character",
  tagline_np: "\u0917\u0941\u0923\u0938\u094D\u0924\u0930\u0940\u092F \u0936\u093F\u0915\u094D\u0937\u093E, \u0938\u092E\u0943\u0926\u094D\u0927 \u0938\u092E\u093E\u091C \u0930 \u091A\u0930\u093F\u0924\u094D\u0930 \u0928\u093F\u0930\u094D\u092E\u093E\u0923",
  affiliation_en: "National Examination Board (NEB) Affiliated Model Community School",
  affiliation_np: "\u0930\u093E\u0937\u094D\u091F\u094D\u0930\u093F\u092F \u092A\u0930\u0940\u0915\u094D\u0937\u093E \u092C\u094B\u0930\u094D\u0921 (NEB) \u0938\u092E\u094D\u092C\u0928\u094D\u0927\u0928 \u092A\u094D\u0930\u093E\u092A\u094D\u0924 \u0928\u092E\u0941\u0928\u093E \u0938\u093E\u092E\u0941\u0926\u093E\u092F\u093F\u0915 \u0935\u093F\u0926\u094D\u092F\u093E\u0932\u092F",
  code: "EMIS: 48012004",
  estd_bs: "2028 B.S.",
  estd_ad: "",
  phone: "+977-081-560123 / 9858012345",
  email: "info@ishwari.edu.np",
  address_en: "Baijanath Rural Municipality - 5, Banke, Lumbini Province, Nepal",
  address_np: "\u092C\u0948\u091C\u0928\u093E\u0925 \u0917\u093E\u0909\u0901\u092A\u093E\u0932\u093F\u0915\u093E \u0935\u0921\u093E \u0928\u0902. \u096B, \u092C\u093E\u0901\u0915\u0947, \u0932\u0941\u092E\u094D\u092C\u093F\u0928\u0940 \u092A\u094D\u0930\u0926\u0947\u0936, \u0928\u0947\u092A\u093E\u0932",
  map_embed_url: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d112450.47271926677!2d81.6033324!3d28.2166667!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3998650000000001%3A0x0!2sBaijanath%2C%20Banke!5e0!3m2!1sen!2snp!4v1620000000000!5m2!1sen!2snp",
  map_url: "https://maps.google.com/?q=Shree+Ishwari+Secondary+School+Baijanath+5+Banke+Nepal",
  chairman_name_en: "Jhakabir Khatri",
  chairman_name_np: "\u091D\u0915\u092C\u093F\u0930 \u0916\u0924\u094D\u0930\u0940",
  chairman_designation_en: "Chairman, School Management Committee",
  chairman_designation_np: "\u0905\u0927\u094D\u092F\u0915\u094D\u0937, \u0935\u093F\u0926\u094D\u092F\u093E\u0932\u092F \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E\u092A\u0928 \u0938\u092E\u093F\u0924\u093F",
  principal_name_en: "Mangal Khatri",
  principal_name_np: "\u092E\u0902\u0917\u0932 \u0916\u0924\u094D\u0930\u0940",
  principal_designation_en: "Headmaster / Principal (M.Ed, M.A.)",
  principal_designation_np: "\u092A\u094D\u0930\u0927\u093E\u0928\u093E\u0927\u094D\u092F\u093E\u092A\u0915",
  principal_image: "",
  principal_message_en: "Welcome to Shree Ishwari Secondary School, Baijanath-5, Banke. We are committed to supporting student learning and development.",
  principal_message_np: "\u0936\u094D\u0930\u0940 \u0908\u0936\u094D\u0935\u0930\u0940 \u092E\u093E\u0927\u094D\u092F\u092E\u093F\u0915 \u0935\u093F\u0926\u094D\u092F\u093E\u0932\u092F, \u092C\u0948\u091C\u0928\u093E\u0925-\u096B, \u092C\u093E\u0901\u0915\u0947\u0915\u094B \u0906\u0927\u093F\u0915\u093E\u0930\u093F\u0915 \u0921\u093F\u091C\u093F\u091F\u0932 \u092A\u094B\u0930\u094D\u091F\u0932\u092E\u093E \u0939\u093E\u0930\u094D\u0926\u093F\u0915 \u0938\u094D\u0935\u093E\u0917\u0924 \u091B\u0964 \u0935\u093F\u0926\u094D\u092F\u093E\u0930\u094D\u0925\u0940\u0939\u0930\u0942\u0915\u094B \u0938\u093F\u0915\u093E\u0907 \u0930 \u0938\u0930\u094D\u0935\u093E\u0919\u094D\u0917\u0940\u0923 \u0935\u093F\u0915\u093E\u0938\u092E\u093E \u0939\u093E\u092E\u0940 \u092A\u094D\u0930\u0924\u093F\u092C\u0926\u094D\u0927 \u091B\u094C\u0902\u0964",
  home_bg_image: "",
  home_bg_enabled: false
};
var initialNotices = [
  {
    id: 1,
    title_en: "Annual Examination Routine (Grades 1 to 9) Published for Session 2083",
    title_np: "\u0936\u0948\u0915\u094D\u0937\u093F\u0915 \u0938\u0924\u094D\u0930 \u0968\u0966\u096E\u0969 \u0915\u094B \u0935\u093E\u0930\u094D\u0937\u093F\u0915 \u092A\u0930\u0940\u0915\u094D\u0937\u093E \u0924\u093E\u0932\u093F\u0915\u093E (\u0915\u0915\u094D\u0937\u093E \u0967 \u0926\u0947\u0916\u093F \u096F \u0938\u092E\u094D\u092E) \u092A\u094D\u0930\u0915\u093E\u0936\u093F\u0924 \u0917\u0930\u093F\u090F\u0915\u094B \u092C\u093E\u0930\u0947",
    date_en: "Bhadra 18, 2083",
    date_np: "\u0968\u0966\u096E\u0969 \u092D\u093E\u0926\u094D\u0930 \u0967\u096E",
    category: "exam",
    pinned: true,
    file_name: "annual_exam_routine_2083.pdf",
    description_en: "All students and guardians are hereby notified that the final examinations for Grades 1 through 9 will commence from Chaitra 08, 2083. Admit cards are available at the administration counter.",
    description_np: "\u0915\u0915\u094D\u0937\u093E \u0967 \u0926\u0947\u0916\u093F \u096F \u0938\u092E\u094D\u092E\u0915\u093E \u0935\u093F\u0926\u094D\u092F\u093E\u0930\u094D\u0925\u0940\u0939\u0930\u0942\u0915\u094B \u0935\u093E\u0930\u094D\u0937\u093F\u0915 \u092A\u0930\u0940\u0915\u094D\u0937\u093E \u0906\u0917\u093E\u092E\u0940 \u091A\u0948\u0924\u094D\u0930 \u0966\u096E \u0917\u0924\u0947\u0926\u0947\u0916\u093F \u0938\u091E\u094D\u091A\u093E\u0932\u0928 \u0939\u0941\u0928\u0947 \u092D\u090F\u0915\u093E\u0932\u0947 \u0938\u092E\u094D\u092A\u0942\u0930\u094D\u0923 \u0935\u093F\u0926\u094D\u092F\u093E\u0930\u094D\u0925\u0940 \u0924\u0925\u093E \u0905\u092D\u093F\u092D\u093E\u0935\u0915\u0939\u0930\u0942\u0932\u093E\u0908 \u0938\u0942\u091A\u093F\u0924 \u0917\u0930\u093F\u0928\u094D\u091B\u0964"
  },
  {
    id: 2,
    title_en: "Grade 11 Admission Open for Science & Management Streams (2083-2084)",
    title_np: "\u0915\u0915\u094D\u0937\u093E \u0967\u0967 \u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u0924\u0925\u093E \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E\u092A\u0928 \u0938\u0902\u0915\u093E\u092F\u092E\u093E \u0928\u092F\u093E\u0901 \u092D\u0930\u094D\u0928\u093E \u0916\u0941\u0932\u093E \u0938\u092E\u094D\u092C\u0928\u094D\u0927\u0940 \u0905\u0924\u094D\u092F\u0928\u094D\u0924 \u091C\u0930\u0941\u0930\u0940 \u0938\u0942\u091A\u0928\u093E",
    date_en: "Bhadra 15, 2083",
    date_np: "\u0968\u0966\u096E\u0969 \u092D\u093E\u0926\u094D\u0930 \u0967\u096B",
    category: "academic",
    pinned: true,
    file_name: "grade11_admission_notice.pdf",
    description_en: "Applications are invited from qualifying SEE graduates for entrance examination and scholarship evaluation in Science and Management streams. Limited seats available.",
    description_np: "\u090F\u0938\u0908\u0908 (SEE) \u0909\u0924\u094D\u0924\u0940\u0930\u094D\u0923 \u0935\u093F\u0926\u094D\u092F\u093E\u0930\u094D\u0925\u0940\u0939\u0930\u0942\u0915\u093E \u0932\u093E\u0917\u093F \u0915\u0915\u094D\u0937\u093E \u0967\u0967 \u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u0930 \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E\u092A\u0928 \u0938\u0902\u0915\u093E\u092F\u092E\u093E \u091B\u093E\u0924\u094D\u0930\u0935\u0943\u0924\u094D\u0924\u093F \u0924\u0925\u093E \u092D\u0930\u094D\u0928\u093E \u0906\u0935\u0947\u0926\u0928 \u092B\u093E\u0930\u092E \u0935\u093F\u0924\u0930\u0923 \u0938\u0941\u0930\u0941 \u092D\u090F\u0915\u094B \u091B\u0964"
  },
  {
    id: 3,
    title_en: "Merit Scholarship Distribution Ceremony & Parent-Teacher Assembly",
    title_np: "\u091C\u0947\u0939\u0947\u0928\u094D\u0926\u093E\u0930 \u091B\u093E\u0924\u094D\u0930\u0935\u0943\u0924\u094D\u0924\u093F \u0935\u093F\u0924\u0930\u0923 \u0915\u093E\u0930\u094D\u092F\u0915\u094D\u0930\u092E \u0924\u0925\u093E \u0905\u092D\u093F\u092D\u093E\u0935\u0915 \u092D\u0947\u0932\u093E \u0906\u092F\u094B\u091C\u0928\u093E \u0938\u092E\u094D\u092C\u0928\u094D\u0927\u092E\u093E",
    date_en: "Bhadra 10, 2083",
    date_np: "\u0968\u0966\u096E\u0969 \u092D\u093E\u0926\u094D\u0930 \u0967\u0966",
    category: "scholarship",
    pinned: false,
    file_name: "scholarship_assembly_notice.pdf",
    description_en: "The quarterly PTA gathering along with the distribution of alumni-sponsored merit and underprivileged scholarships will take place this Sunday at the school auditorium.",
    description_np: "\u0906\u0917\u093E\u092E\u0940 \u0906\u0907\u0924\u092C\u093E\u0930 \u0935\u093F\u0926\u094D\u092F\u093E\u0932\u092F\u0915\u094B \u0938\u092D\u093E\u0939\u0932\u092E\u093E \u0924\u094D\u0930\u0948\u092E\u093E\u0938\u093F\u0915 \u0905\u092D\u093F\u092D\u093E\u0935\u0915 \u092D\u0947\u0932\u093E \u0924\u0925\u093E \u091B\u093E\u0924\u094D\u0930\u0935\u0943\u0924\u094D\u0924\u093F \u0935\u093F\u0924\u0930\u0923 \u0915\u093E\u0930\u094D\u092F\u0915\u094D\u0930\u092E \u0906\u092F\u094B\u091C\u0928\u093E \u0939\u0941\u0928\u0947 \u092D\u090F\u0915\u094B \u091B\u0964"
  }
];
var initialStaff = [
  {
    id: 1,
    name_en: "Mangal Khatri",
    name_np: "\u092E\u0902\u0917\u0932 \u0916\u0924\u094D\u0930\u0940",
    role: "principal",
    designation_en: "Principal",
    designation_np: "\u092A\u094D\u0930\u0927\u093E\u0928\u093E\u0927\u094D\u092F\u093E\u092A\u0915",
    experience: ""
  },
  {
    id: 2,
    name_en: "Bhim Bahadur Khatri",
    name_np: "\u092D\u0940\u092E \u092C\u0939\u093E\u0926\u0941\u0930 \u0916\u0924\u094D\u0930\u0940",
    role: "teacher",
    designation_en: "Social Studies Teacher",
    designation_np: "\u0938\u093E\u092E\u093E\u091C\u093F\u0915 \u0905\u0927\u094D\u092F\u092F\u0928 \u0936\u093F\u0915\u094D\u0937\u0915",
    experience: ""
  }
];
var initialFacilities = [
  {
    id: 1,
    title_en: "Modern Science Laboratories",
    title_np: "\u0905\u0924\u094D\u092F\u093E\u0927\u0941\u0928\u093F\u0915 \u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u092A\u094D\u0930\u092F\u094B\u0917\u0936\u093E\u0932\u093E (\u092D\u094C\u0924\u093F\u0915, \u0930\u0938\u093E\u092F\u0928 \u0930 \u091C\u0940\u0935\u0935\u093F\u091C\u094D\u091E\u093E\u0928)",
    desc_en: "Fully equipped secondary and higher secondary laboratories with precision apparatus for individual experimentation under certified instructor supervision.",
    desc_np: "\u0928\u0947\u092A\u093E\u0932 \u0938\u0930\u0915\u093E\u0930\u0915\u094B \u0928\u092E\u0941\u0928\u093E \u0935\u093F\u0926\u094D\u092F\u093E\u0932\u092F \u092E\u093E\u092A\u0926\u0923\u094D\u0921 \u0905\u0928\u0941\u0938\u093E\u0930 \u0928\u093F\u0930\u094D\u092E\u093F\u0924 \u092D\u094C\u0924\u093F\u0915\u0936\u093E\u0938\u094D\u0924\u094D\u0930, \u0930\u0938\u093E\u092F\u0928\u0936\u093E\u0938\u094D\u0924\u094D\u0930 \u0930 \u091C\u0940\u0935\u0935\u093F\u091C\u094D\u091E\u093E\u0928\u0915\u093E \u0906\u0927\u0941\u0928\u093F\u0915 \u092A\u094D\u0930\u092F\u094B\u0917\u093E\u0924\u094D\u092E\u0915 \u0909\u092A\u0915\u0930\u0923\u092F\u0941\u0915\u094D\u0924 \u092A\u094D\u0930\u092F\u094B\u0917\u0936\u093E\u0932\u093E\u0964",
    icon: "\u{1F52C}"
  },
  {
    id: 2,
    title_en: "Advanced ICT & Computer Learning Center",
    title_np: "\u0938\u0942\u091A\u0928\u093E \u0924\u0925\u093E \u0938\u091E\u094D\u091A\u093E\u0930 \u092A\u094D\u0930\u0935\u093F\u0927\u093F (ICT) \u0915\u0947\u0928\u094D\u0926\u094D\u0930",
    desc_en: "Air-conditioned 45-terminal computer lab connected to dedicated optical fiber broadband with smart interactive display systems.",
    desc_np: "\u096A\u096B \u0925\u093E\u0928 \u0905\u0924\u094D\u092F\u093E\u0927\u0941\u0928\u093F\u0915 \u0915\u092E\u094D\u092A\u094D\u092F\u0941\u091F\u0930, \u0924\u0940\u0935\u094D\u0930 \u0917\u0924\u093F\u0915\u094B \u0907\u0928\u094D\u091F\u0930\u0928\u0947\u091F \u0930 \u0921\u093F\u091C\u093F\u091F\u0932 \u0938\u094D\u092E\u093E\u0930\u094D\u091F \u092C\u094B\u0930\u094D\u0921\u0938\u0939\u093F\u0924\u0915\u094B \u0915\u092E\u094D\u092A\u094D\u092F\u0941\u091F\u0930 \u0932\u094D\u092F\u093E\u092C\u0964",
    icon: "\u{1F4BB}"
  },
  {
    id: 3,
    title_en: "E-Pustakalaya & Reference Library",
    title_np: "\u092A\u0941\u0938\u094D\u0924\u0915\u093E\u0932\u092F \u0924\u0925\u093E \u0907-\u092A\u0941\u0938\u094D\u0924\u0915\u093E\u0932\u092F (\u0908-\u092A\u0941\u0938\u094D\u0924\u0915\u093E\u0932\u092F)",
    desc_en: "Over 6,500 curriculum texts, reference encyclopedias, competitive exam materials, and local digital archives.",
    desc_np: "\u096C,\u096B\u0966\u0966 \u092D\u0928\u094D\u0926\u093E \u092C\u0922\u0940 \u092A\u0941\u0938\u094D\u0924\u0915\u0939\u0930\u0942, \u092A\u0924\u094D\u0930\u092A\u0924\u094D\u0930\u093F\u0915\u093E \u0930 \u0921\u093F\u091C\u093F\u091F\u0932 \u0936\u0948\u0915\u094D\u0937\u093F\u0915 \u0938\u094D\u0930\u094B\u0924\u0939\u0930\u0942\u0932\u0947 \u0938\u0941\u0938\u091C\u094D\u091C\u093F\u0924 \u0938\u092E\u0943\u0926\u094D\u0927 \u092A\u0941\u0938\u094D\u0924\u0915\u093E\u0932\u092F\u0964",
    icon: "\u{1F4DA}"
  },
  {
    id: 4,
    title_en: "Athletics & Sports Complex",
    title_np: "\u0916\u0947\u0932\u0915\u0941\u0926 \u092A\u0942\u0930\u094D\u0935\u093E\u0927\u093E\u0930 \u0924\u0925\u093E \u0916\u0941\u0932\u093E \u092E\u0948\u0926\u093E\u0928",
    desc_en: "Full-sized volleyball court, badminton courts, table tennis hall, and athletic track ground hosting annual zonal tournaments.",
    desc_np: "\u092D\u0932\u093F\u092C\u0932, \u091F\u0947\u092C\u0932\u091F\u0947\u0928\u093F\u0938, \u092C\u094D\u092F\u093E\u0921\u092E\u093F\u0928\u094D\u091F\u0928 \u0924\u0925\u093E \u090F\u0925\u0932\u0947\u091F\u093F\u0915\u094D\u0938\u0915\u093E \u0932\u093E\u0917\u093F \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093F\u0924 \u0916\u0947\u0932 \u092E\u0948\u0926\u093E\u0928\u0964",
    icon: "\u{1F3D0}"
  }
];
var initialEvents = [
  {
    id: 1,
    title_en: "Annual Science, Robotics & Innovation Olympiad",
    title_np: "\u0935\u093E\u0930\u094D\u0937\u093F\u0915 \u0935\u093F\u091C\u094D\u091E\u093E\u0928, \u0930\u094B\u092C\u094B\u091F\u093F\u0915\u094D\u0938 \u0924\u0925\u093E \u0938\u093F\u0930\u094D\u091C\u0928\u093E\u0924\u094D\u092E\u0915 \u092A\u094D\u0930\u0926\u0930\u094D\u0936\u0928\u0940",
    date_en: "Aswin 02, 2083",
    date_np: "\u0968\u0966\u096E\u0969 \u0905\u0938\u094B\u091C \u0966\u0968",
    time: "10:00 AM - 4:00 PM",
    venue_en: "Ishwari Multipurpose Hall",
    venue_np: "\u0908\u0936\u094D\u0935\u0930\u0940 \u092C\u0939\u0941\u0909\u0926\u094D\u0926\u0947\u0936\u094D\u092F\u0940\u092F \u0939\u0932",
    desc_en: "Student-built practical demonstrations in sustainable energy, robotics, automation, and botanical models open to parents and public.",
    desc_np: "\u0935\u093F\u0926\u094D\u092F\u093E\u0930\u094D\u0925\u0940\u0939\u0930\u0942\u0932\u0947 \u0928\u093F\u0930\u094D\u092E\u093E\u0923 \u0917\u0930\u0947\u0915\u093E \u0930\u094B\u092C\u094B\u091F\u093F\u0915\u094D\u0938, \u090A\u0930\u094D\u091C\u093E \u092C\u091A\u0924 \u092A\u094D\u0930\u0935\u093F\u0927\u093F \u0924\u0925\u093E \u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u092A\u0930\u093F\u092F\u094B\u091C\u0928\u093E\u0939\u0930\u0942\u0915\u094B \u092A\u094D\u0930\u0926\u0930\u094D\u0936\u0928\u0940\u0964"
  },
  {
    id: 2,
    title_en: "Inter-House Athletics Championship (President Running Shield Selection)",
    title_np: "\u0905\u0928\u094D\u0924\u0930-\u0938\u0926\u0928 \u0916\u0947\u0932\u0915\u0941\u0926 \u092A\u094D\u0930\u0924\u093F\u092F\u094B\u0917\u093F\u0924\u093E (\u0930\u093E\u0937\u094D\u091F\u094D\u0930\u092A\u0924\u093F \u0930\u0928\u093F\u0919 \u0936\u093F\u0932\u094D\u0921 \u091B\u0928\u094B\u091F)",
    date_en: "Kartik 14, 2083",
    date_np: "\u0968\u0966\u096E\u0969 \u0915\u093E\u0930\u094D\u0924\u093F\u0915 \u0967\u096A",
    time: "08:30 AM - 05:00 PM",
    venue_en: "School Sports Ground",
    venue_np: "\u0935\u093F\u0926\u094D\u092F\u093E\u0932\u092F \u0916\u0947\u0932\u0915\u0941\u0926 \u092E\u0948\u0926\u093E\u0928",
    desc_en: "Track and field events, volleyball championships, and martial arts demonstrations across Red, Blue, Green, and Gold student houses.",
    desc_np: "\u0938\u0926\u0928\u0938\u094D\u0924\u0930\u0940\u092F \u092D\u0932\u093F\u092C\u0932, \u0967\u0966\u0966 \u092E\u093F\u091F\u0930 \u0926\u094C\u0921, \u0939\u093E\u0907\u091C\u092E\u094D\u092A \u0930 \u0915\u0930\u093E\u0901\u0924\u0947 \u092A\u094D\u0930\u0924\u093F\u092F\u094B\u0917\u093F\u0924\u093E\u0964"
  }
];
var initialAchievements = [
  {
    id: 1,
    year: "2082 B.S.",
    title_en: "District Board Topper in SEE Examination (GPA 4.0)",
    title_np: "\u090F\u0938\u0908\u0908 (SEE) \u092A\u0930\u0940\u0915\u094D\u0937\u093E\u092E\u093E \u091C\u093F\u0932\u094D\u0932\u093E\u092D\u0930 \u092A\u094D\u0930\u0925\u092E (GPA 4.0)",
    desc_en: "Miss Anjali Sharma secured a perfect 4.0 GPA in the national Secondary Education Examination, maintaining our 100% pass record in first division.",
    desc_np: "\u091B\u093E\u0924\u094D\u0930\u093E \u0905\u091E\u094D\u091C\u0932\u0940 \u0936\u0930\u094D\u092E\u093E\u0926\u094D\u0935\u093E\u0930\u093E \u090F\u0938\u0908\u0908 \u092A\u0930\u0940\u0915\u094D\u0937\u093E\u092E\u093E \u0909\u0924\u094D\u0915\u0943\u0937\u094D\u091F \u096A.\u0966 \u091C\u093F\u092A\u093F\u090F \u0939\u093E\u0938\u093F\u0932\u0964"
  },
  {
    id: 2,
    year: "2081 B.S.",
    title_en: "Champions: President Running Shield Regional Athletics",
    title_np: "\u0930\u093E\u0937\u094D\u091F\u094D\u0930\u092A\u0924\u093F \u0930\u0928\u093F\u0919 \u0936\u093F\u0932\u094D\u0921 \u0915\u094D\u0937\u0947\u0924\u094D\u0930\u0940\u092F \u0916\u0947\u0932\u0915\u0941\u0926 \u092A\u094D\u0930\u0924\u093F\u092F\u094B\u0917\u093F\u0924\u093E\u092E\u093E \u092A\u094D\u0930\u0925\u092E",
    desc_en: "School athletic squad lifted the district running shield securing 12 Gold, 8 Silver, and 5 Bronze medals in track and field.",
    desc_np: "\u0967\u0968 \u0938\u094D\u0935\u0930\u094D\u0923 \u092A\u0926\u0915\u0938\u0939\u093F\u0924 \u0938\u092E\u0917\u094D\u0930 \u091A\u094D\u092F\u093E\u092E\u094D\u092A\u093F\u092F\u0928 \u091F\u094D\u0930\u092B\u0940 \u091C\u093F\u0924\u094D\u0928 \u0938\u092B\u0932\u0964"
  }
];
var initialHistory = [
  {
    id: 1,
    year: "2028 B.S.",
    title_en: "Founding as Community Primary School",
    title_np: "\u092A\u094D\u0930\u093E\u0925\u092E\u093F\u0915 \u0935\u093F\u0926\u094D\u092F\u093E\u0932\u092F\u0915\u094B \u0930\u0942\u092A\u092E\u093E \u0938\u094D\u0925\u093E\u092A\u0928\u093E",
    desc_en: "Inaugurated through community patronage to provide accessible education to rural youths with thatch roofing and dedicated local educators.",
    desc_np: "\u0938\u094D\u0925\u093E\u0928\u0940\u092F \u0936\u093F\u0915\u094D\u0937\u093E\u092A\u094D\u0930\u0947\u092E\u0940\u0939\u0930\u0942\u0915\u094B \u0938\u0915\u094D\u0930\u093F\u092F\u0924\u093E, \u092E\u0941\u0920\u0940\u0926\u093E\u0928 \u0930 \u0936\u094D\u0930\u092E\u0926\u093E\u0928\u092C\u093E\u091F \u092A\u094D\u0930\u093E\u0925\u092E\u093F\u0915 \u0924\u0939\u0915\u094B \u0930\u0942\u092A\u092E\u093E \u0938\u094D\u0925\u093E\u092A\u0928\u093E\u0964",
    display_order: 1,
    status: "published",
    is_enabled: true
  },
  {
    id: 2,
    year: "2052 B.S. (1995 A.D.)",
    title_en: "Upgraded to Secondary High School (SLC / Class 10)",
    title_np: "\u092E\u093E\u0927\u094D\u092F\u092E\u093F\u0915 \u0924\u0939 (\u0915\u0915\u094D\u0937\u093E \u0967\u0966) \u092E\u093E \u0938\u094D\u0924\u0930\u094B\u0928\u094D\u0928\u0924\u093F",
    desc_en: "Authorized by Ministry of Education to conduct SLC board examinations with masonry stone classrooms and expanded faculty.",
    desc_np: "\u0936\u093F\u0915\u094D\u0937\u093E \u092E\u0928\u094D\u0924\u094D\u0930\u093E\u0932\u092F\u092C\u093E\u091F \u0938\u094D\u0935\u0940\u0915\u0943\u0924\u093F \u092A\u094D\u0930\u093E\u092A\u094D\u0924 \u0917\u0930\u0940 \u092A\u0939\u093F\u0932\u094B \u092A\u091F\u0915 \u090F\u0938\u090F\u0932\u0938\u0940 \u092A\u0930\u0940\u0915\u094D\u0937\u093E\u092E\u093E \u0936\u0924\u092A\u094D\u0930\u0924\u093F\u0936\u0924 \u0938\u092B\u0932\u0924\u093E\u0938\u0939\u093F\u0924 \u0938\u0939\u092D\u093E\u0917\u093F\u0924\u093E\u0964",
    display_order: 2,
    status: "published",
    is_enabled: true
  },
  {
    id: 3,
    year: "2068 B.S. (2011 A.D.)",
    title_en: "Higher Secondary (+2) Science & Management Inaugurated",
    title_np: "\u0909\u091A\u094D\u091A \u092E\u093E\u0927\u094D\u092F\u092E\u093F\u0915 (+\u0968) \u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u0924\u0925\u093E \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E\u092A\u0928 \u0938\u0902\u0915\u093E\u092F \u0938\u0941\u0930\u0941",
    desc_en: "Expanded into high school streams with science laboratories, computer learning center, and commerce faculty.",
    desc_np: "\u0915\u0915\u094D\u0937\u093E \u0967\u0967 \u0930 \u0967\u0968 \u0915\u093E \u0935\u093F\u091C\u094D\u091E\u093E\u0928, \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E\u092A\u0928 \u0930 \u0936\u093F\u0915\u094D\u0937\u093E\u0936\u093E\u0938\u094D\u0924\u094D\u0930 \u0915\u0915\u094D\u0937\u093E\u0939\u0930\u0942 \u0924\u0925\u093E \u0906\u0927\u0941\u0928\u093F\u0915 \u092A\u094D\u0930\u092F\u094B\u0917\u0936\u093E\u0932\u093E\u0939\u0930\u0942\u0915\u094B \u0938\u091E\u094D\u091A\u093E\u0932\u0928\u0964",
    display_order: 3,
    status: "published",
    is_enabled: true
  },
  {
    id: 4,
    year: "2076 B.S. (2019 A.D.)",
    title_en: "Designated as Government of Nepal Model School (\u0928\u092E\u0941\u0928\u093E \u0935\u093F\u0926\u094D\u092F\u093E\u0932\u092F)",
    title_np: "\u0928\u0947\u092A\u093E\u0932 \u0938\u0930\u0915\u093E\u0930\u092C\u093E\u091F '\u0928\u092E\u0941\u0928\u093E \u0935\u093F\u0926\u094D\u092F\u093E\u0932\u092F' \u0918\u094B\u0937\u0923\u093E",
    desc_en: "Selected under the National Model School Infrastructure Development Masterplan with smart interactive panels and comprehensive STEM campus.",
    desc_np: "\u0905\u0924\u094D\u092F\u093E\u0927\u0941\u0928\u093F\u0915 \u092D\u094C\u0924\u093F\u0915 \u092A\u0942\u0930\u094D\u0935\u093E\u0927\u093E\u0930, \u0921\u093F\u091C\u093F\u091F\u0932 \u0938\u094D\u092E\u093E\u0930\u094D\u091F \u092C\u094B\u0930\u094D\u0921, \u092C\u0939\u0941\u0909\u0926\u094D\u0926\u0947\u0936\u094D\u092F\u0940\u092F \u092A\u094D\u0930\u092F\u094B\u0917\u0936\u093E\u0932\u093E \u0924\u0925\u093E \u0921\u093F\u091C\u093F\u091F\u0932 \u0938\u093F\u0915\u093E\u0907 \u092A\u094D\u0930\u0935\u093F\u0927\u093F \u0935\u093F\u0938\u094D\u0924\u093E\u0930\u0964",
    display_order: 4,
    status: "published",
    is_enabled: true
  }
];
var initialDocuments = [
  {
    id: 1,
    title_en: "Citizen Charter & Institutional Service Standards (\u0928\u093E\u0917\u0930\u093F\u0915 \u092C\u0921\u093E\u092A\u0924\u094D\u0930)",
    title_np: "\u0928\u093E\u0917\u0930\u093F\u0915 \u092C\u0921\u093E\u092A\u0924\u094D\u0930 \u0924\u0925\u093E \u0938\u0947\u0935\u093E \u092A\u094D\u0930\u0935\u093E\u0939 \u092E\u093E\u092A\u0926\u0923\u094D\u0921",
    type: "Official Charter (PDF)",
    size: "1.8 MB",
    date: "2083-01-15"
  },
  {
    id: 2,
    title_en: "Grade 11 Entrance & Scholarship Application Form",
    title_np: "\u0915\u0915\u094D\u0937\u093E \u0967\u0967 \u092D\u0930\u094D\u0928\u093E \u0924\u0925\u093E \u091B\u093E\u0924\u094D\u0930\u0935\u0943\u0924\u094D\u0924\u093F \u0906\u0935\u0947\u0926\u0928 \u092B\u093E\u0930\u092E",
    type: "Application Form (PDF)",
    size: "640 KB",
    date: "2083-04-20"
  },
  {
    id: 3,
    title_en: "Annual Social Audit & Financial Statement Report (2082-2083)",
    title_np: "\u0935\u093E\u0930\u094D\u0937\u093F\u0915 \u0938\u093E\u092E\u093E\u091C\u093F\u0915 \u092A\u0930\u0940\u0915\u094D\u0937\u0923 \u0924\u0925\u093E \u0906\u0930\u094D\u0925\u093F\u0915 \u0906\u092F-\u0935\u094D\u092F\u092F \u0935\u093F\u0935\u0930\u0923",
    type: "Audit Report (PDF)",
    size: "2.4 MB",
    date: "2083-03-30"
  }
];
var initialPrograms = [
  {
    id: 1,
    title_en: "Early Childhood Development (ECD / Pre-Primary)",
    title_np: "\u092A\u094D\u0930\u093E\u0930\u092E\u094D\u092D\u093F\u0915 \u092C\u093E\u0932 \u0935\u093F\u0915\u093E\u0938 (ECD / \u092A\u0942\u0930\u094D\u0935-\u092A\u094D\u0930\u093E\u0925\u092E\u093F\u0915)",
    level: "ECD - Montessori Base",
    duration: "1 - 2 Years",
    intake: 45,
    desc_en: "Play-based sensorial learning framework supporting motor coordination, social empathy, and bilingual communication in joyful child-friendly rooms.",
    desc_np: "\u092C\u093E\u0932\u092E\u0948\u0924\u094D\u0930\u0940 \u0935\u093E\u0924\u093E\u0935\u0930\u0923\u092E\u093E \u0916\u0947\u0932\u0915\u0941\u0926, \u091A\u093F\u0924\u094D\u0930\u0915\u0932\u093E \u0930 \u092C\u093E\u0932\u0917\u0940\u0924\u0915\u094B \u092E\u093E\u0927\u094D\u092F\u092E\u092C\u093E\u091F \u0938\u093F\u0915\u093E\u0907\u0915\u094B \u091C\u0917 \u092C\u0938\u093E\u0932\u094D\u0928\u0947 \u092A\u094D\u0930\u093E\u0930\u092E\u094D\u092D\u093F\u0915 \u0915\u093E\u0930\u094D\u092F\u0915\u094D\u0930\u092E\u0964"
  },
  {
    id: 2,
    title_en: "Basic Level Education (Grades 1 to 8)",
    title_np: "\u0906\u0927\u093E\u0930\u092D\u0942\u0924 \u0924\u0939 \u0936\u093F\u0915\u094D\u0937\u093E (\u0915\u0915\u094D\u0937\u093E \u0967 - \u096E)",
    level: "Basic Level (National Curriculum)",
    duration: "8 Years",
    intake: 320,
    desc_en: "Competency-based foundational academics featuring continuous assessment (CAS), practical mathematics, basic sciences, and ICT fundamentals.",
    desc_np: "\u0928\u093F\u0930\u0928\u094D\u0924\u0930 \u0935\u093F\u0926\u094D\u092F\u093E\u0930\u094D\u0925\u0940 \u092E\u0942\u0932\u094D\u092F\u093E\u0919\u094D\u0915\u0928 \u092A\u094D\u0930\u0923\u093E\u0932\u0940, \u0935\u094D\u092F\u0935\u0939\u093E\u0930\u093F\u0915 \u0917\u0923\u093F\u0924, \u0906\u0927\u093E\u0930\u092D\u0942\u0924 \u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u0930 \u0938\u0942\u091A\u0928\u093E \u092A\u094D\u0930\u0935\u093F\u0927\u093F\u092E\u093E \u0906\u0927\u093E\u0930\u093F\u0924 \u0905\u0927\u094D\u092F\u092F\u0928\u0964"
  },
  {
    id: 3,
    title_en: "Secondary Level (SEE / Grades 9 - 10)",
    title_np: "\u092E\u093E\u0927\u094D\u092F\u092E\u093F\u0915 \u0924\u0939 (\u090F\u0938\u0908\u0908 / \u0915\u0915\u094D\u0937\u093E \u096F - \u0967\u0966)",
    level: "Secondary School Examination",
    duration: "2 Years",
    intake: 180,
    desc_en: "Rigorous curriculum preparing candidates for the National Secondary Education Examination (SEE) with dedicated physics, chemistry, biology and computer labs.",
    desc_np: "\u090F\u0938\u0908\u0908 \u092A\u0930\u0940\u0915\u094D\u0937\u093E\u092E\u093E \u0909\u0924\u094D\u0915\u0943\u0937\u094D\u091F \u0928\u0924\u093F\u091C\u093E\u0915\u093E \u0932\u093E\u0917\u093F \u092A\u094D\u0930\u092F\u094B\u0917\u093E\u0924\u094D\u092E\u0915 \u0935\u093F\u091C\u094D\u091E\u093E\u0928, \u0910\u091A\u094D\u091B\u093F\u0915 \u0917\u0923\u093F\u0924 \u0930 \u0915\u092E\u094D\u092A\u094D\u092F\u0941\u091F\u0930 \u0935\u093F\u091C\u094D\u091E\u093E\u0928\u0915\u094B \u0935\u093F\u0936\u0947\u0937 \u0915\u0915\u094D\u0937\u093E\u0964"
  },
  {
    id: 4,
    title_en: "Higher Secondary (+2 Science Stream)",
    title_np: "\u0909\u091A\u094D\u091A \u092E\u093E\u0927\u094D\u092F\u092E\u093F\u0915 (+\u0968 \u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u0938\u0902\u0915\u093E\u092F)",
    level: "National Examination Board (NEB Class 11-12)",
    duration: "2 Years",
    intake: 90,
    desc_en: "NEB-affiliated higher secondary stream preparing future doctors, engineers, and researchers with state-of-the-art lab exposure and medical/engineering entrance coaching.",
    desc_np: "\u092D\u094C\u0924\u093F\u0915\u0936\u093E\u0938\u094D\u0924\u094D\u0930, \u0930\u0938\u093E\u092F\u0928\u0936\u093E\u0938\u094D\u0924\u094D\u0930 \u0930 \u091C\u0940\u0935\u0935\u093F\u091C\u094D\u091E\u093E\u0928\u0915\u093E \u0906\u0927\u0941\u0928\u093F\u0915 \u0909\u092A\u0915\u0930\u0923\u092F\u0941\u0915\u094D\u0924 \u0932\u094D\u092F\u093E\u092C \u0924\u0925\u093E \u092A\u094D\u0930\u0935\u0947\u0936 \u092A\u0930\u0940\u0915\u094D\u0937\u093E \u0924\u092F\u093E\u0930\u0940 \u0915\u0915\u094D\u0937\u093E\u0939\u0930\u0942\u0964"
  },
  {
    id: 5,
    title_en: "Higher Secondary (+2 Management Stream)",
    title_np: "\u0909\u091A\u094D\u091A \u092E\u093E\u0927\u094D\u092F\u092E\u093F\u0915 (+\u0968 \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E\u092A\u0928 \u0938\u0902\u0915\u093E\u092F)",
    level: "National Examination Board (NEB Class 11-12)",
    duration: "2 Years",
    intake: 120,
    desc_en: "Comprehensive business studies, computer science, accounting, and economics equipping students for banking, chartered accountancy, and entrepreneurship.",
    desc_np: "\u0932\u0947\u0916\u093E\u0935\u093F\u0927\u093F, \u0915\u092E\u094D\u092A\u094D\u092F\u0941\u091F\u0930 \u0935\u093F\u091C\u094D\u091E\u093E\u0928, \u0905\u0930\u094D\u0925\u0936\u093E\u0938\u094D\u0924\u094D\u0930 \u0930 \u0935\u094D\u092F\u0935\u0938\u093E\u092F \u0905\u0927\u094D\u092F\u092F\u0928\u0938\u0939\u093F\u0924\u0915\u094B \u0906\u0927\u0941\u0928\u093F\u0915 \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E\u092A\u0928 \u0936\u093F\u0915\u094D\u0937\u093E\u0964"
  },
  {
    id: 6,
    title_en: "Higher Secondary (+2 Education & Humanities)",
    title_np: "\u0909\u091A\u094D\u091A \u092E\u093E\u0927\u094D\u092F\u092E\u093F\u0915 (+\u0968 \u0936\u093F\u0915\u094D\u0937\u093E\u0936\u093E\u0938\u094D\u0924\u094D\u0930 \u0938\u0902\u0915\u093E\u092F)",
    level: "National Examination Board (NEB Class 11-12)",
    duration: "2 Years",
    intake: 60,
    desc_en: "Pedagogy, psychology, English, and Nepali major courses training future educators, public administrators, and civil servants.",
    desc_np: "\u0936\u0948\u0915\u094D\u0937\u093F\u0915 \u0938\u093F\u0926\u094D\u0927\u093E\u0928\u094D\u0924, \u0936\u093F\u0915\u094D\u0937\u0923 \u0935\u093F\u0927\u093F, \u0938\u092E\u093E\u091C\u0936\u093E\u0938\u094D\u0924\u094D\u0930 \u0924\u0925\u093E \u092D\u093E\u0937\u093E \u0935\u093F\u091C\u094D\u091E\u093E\u0928\u0915\u094B \u0905\u0927\u094D\u092F\u093E\u092A\u0928\u0964"
  }
];
var initialMessages = [
  {
    id: 1,
    name: "Subash Thapa",
    email: "subash.thapa@gmail.com",
    phone: "9841238901",
    subject: "Grade 11 Science Stream Admission & Scholarship Test",
    message: "Namaste, I would like to inquire about the entrance exam syllabus and available merit scholarship quotas for SEE students joining Grade 11 Science.",
    date: "2083-05-10",
    status: "new"
  },
  {
    id: 2,
    name: "Sunita Adhikari",
    email: "sunita.adhikari@yahoo.com",
    phone: "9812345678",
    subject: "Transfer Certificate (TC) and Character Certificate Verification",
    message: "Respected administration, my daughter completed Grade 8 from Ishwari. We need her official character certificate for transfer documentation.",
    date: "2083-05-08",
    status: "reviewed"
  }
];
var initialGallery = [
  { id: 1, title_en: "Secondary Science Lab Practical Examination", title_np: "\u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u092A\u094D\u0930\u092F\u094B\u0917\u0936\u093E\u0932\u093E\u092E\u093E \u0935\u093F\u0926\u094D\u092F\u093E\u0930\u094D\u0925\u0940\u0939\u0930\u0942\u0915\u094B \u092A\u094D\u0930\u092F\u094B\u0917\u093E\u0924\u094D\u092E\u0915 \u0905\u092D\u094D\u092F\u093E\u0938", category: "science", iconType: "science" },
  { id: 2, title_en: "Annual Inter-House Athletics & Volleyball Championship", title_np: "\u0935\u093E\u0930\u094D\u0937\u093F\u0915 \u0905\u0928\u094D\u0924\u0930-\u0938\u0926\u0928 \u092D\u0932\u093F\u092C\u0932 \u0924\u0925\u093E \u090F\u0925\u0932\u0947\u091F\u093F\u0915\u094D\u0938 \u092A\u094D\u0930\u0924\u093F\u092F\u094B\u0917\u093F\u0924\u093E", category: "sports", iconType: "sports" },
  { id: 3, title_en: "Digital Smart Classroom Pedagogy Session", title_np: "\u0921\u093F\u091C\u093F\u091F\u0932 \u0938\u094D\u092E\u093E\u0930\u094D\u091F \u092C\u094B\u0930\u094D\u0921\u092C\u093E\u091F \u092A\u0920\u0928\u092A\u093E\u0920\u0928", category: "academics", iconType: "academics" },
  { id: 4, title_en: "Saraswati Puja Cultural Assembly & Exhibition", title_np: "\u0936\u094D\u0930\u0940\u092A\u091E\u094D\u091A\u092E\u0940 \u0924\u0925\u093E \u0938\u0930\u0938\u094D\u0935\u0924\u0940 \u092A\u0942\u091C\u093E \u092E\u0939\u094B\u0924\u094D\u0938\u0935", category: "culture", iconType: "culture" },
  { id: 5, title_en: "Community Cleanliness & Eco Tree Plantation Drive", title_np: "\u0938\u093E\u092E\u0941\u0926\u093E\u092F\u093F\u0915 \u0938\u0930\u0938\u092B\u093E\u0907 \u0924\u0925\u093E \u0935\u0943\u0915\u094D\u0937\u093E\u0930\u094B\u092A\u0923 \u0915\u093E\u0930\u094D\u092F\u0915\u094D\u0930\u092E", category: "community", iconType: "community" },
  { id: 6, title_en: "District Student STEM & Robotics Demonstration", title_np: "\u0930\u094B\u092C\u094B\u091F\u093F\u0915\u094D\u0938 \u092A\u0930\u093F\u092F\u094B\u091C\u0928\u093E\u0915\u094B \u0938\u092B\u0932 \u092A\u094D\u0930\u0926\u0930\u094D\u0936\u0928", category: "science", iconType: "science" }
];
var initialSiteConfig = {
  primaryColor: "#1E3A8A",
  primaryColorName: "Academic Navy",
  header: {
    showTopBar: true,
    showNationalFlag: true,
    flagMode: "default_nepal",
    customFlagImage: "",
    flagSize: "normal",
    flagPosition: "after_theme",
    showWavingStand: true,
    showAlertTicker: true,
    tickerMode: "auto_pinned",
    tickerTitleEn: "Latest News",
    tickerTitleNp: "\u0924\u093E\u091C\u093E \u0938\u092E\u093E\u091A\u093E\u0930",
    selectedNoticeId: "",
    showAcademicYear: true,
    academicYearLabelEn: "Annual",
    academicYearLabelNp: "\u0935\u093E\u0930\u094D\u0937\u093F\u0915",
    academicYearValue: "2083",
    academicYearSeparator: "|",
    showBsClock: true,
    showDate: true,
    dateFormat: "full",
    showTime: true,
    timeFormat: "12h",
    showSeconds: true,
    showWeekday: true,
    showNepaliDate: true,
    timezone: "Asia/Kathmandu",
    showSearchButton: true,
    searchPlaceholderEn: "Search website...",
    searchPlaceholderNp: "\u0935\u0947\u092C\u0938\u093E\u0907\u091F\u092E\u093E \u0916\u094B\u091C\u094D\u0928\u0941\u0939\u094B\u0938\u094D...",
    showSearchShortcut: true,
    showLanguageToggle: true,
    defaultLanguage: "en",
    langLabelEn: "EN",
    langLabelNp: "\u0928\u0947\u092A\u093E",
    langDisplayMode: "compact",
    showThemeSwitch: true,
    defaultTheme: "light",
    showSchoolBadges: true,
    showTagline: true,
    showAddress: true,
    showAdmissionCta: true,
    admissionCtaTextEn: "Admission 2083",
    admissionCtaTextNp: "\u0928\u092F\u093E\u0901 \u092D\u0930\u094D\u0928\u093E \u0968\u0966\u096E\u0969",
    admissionCtaRoute: "academics",
    showHelpline: true,
    helplinePhone: "+977-21-420123",
    stickyHeader: true,
    showLogo: true,
    showSchoolIdentity: true,
    showEmis: true,
    showEstd: true,
    showNepaliName: true,
    logoSize: "medium",
    schoolNameSize: "medium",
    nepaliNameSize: "medium",
    headerIdentityAlignment: "center"
  },
  showAlertTicker: true,
  alertTickerEn: "Annual Examination Routine (Grades 1 to 9) Published for Session 2083",
  alertTickerNp: "\u0936\u0948\u0915\u094D\u0937\u093F\u0915 \u0938\u0924\u094D\u0930 \u0968\u0966\u096E\u0969 \u0915\u094B \u0935\u093E\u0930\u094D\u0937\u093F\u0915 \u092A\u0930\u0940\u0915\u094D\u0937\u093E \u0924\u093E\u0932\u093F\u0915\u093E (\u0915\u0915\u094D\u0937\u093E \u0967 \u0926\u0947\u0916\u093F \u096F \u0938\u092E\u094D\u092E) \u092A\u094D\u0930\u0915\u093E\u0936\u093F\u0924 \u0917\u0930\u093F\u090F\u0915\u094B \u092C\u093E\u0930\u0947",
  heroBadgeEn: "CENTER FOR ACADEMIC EXCELLENCE & CHARACTER BUILDING",
  heroBadgeNp: "\u0936\u0948\u0915\u094D\u0937\u093F\u0915 \u0909\u0924\u094D\u0915\u0943\u0937\u094D\u091F\u0924\u093E \u0930 \u091A\u0930\u093F\u0924\u094D\u0930 \u0928\u093F\u0930\u094D\u092E\u093E\u0923\u0915\u094B \u0915\u0947\u0928\u094D\u0926\u094D\u0930",
  heroTitleEn: "Cultivating Academic Excellence & Responsible Citizens Since 2028 B.S.",
  heroTitleNp: "\u0935\u093F.\u0938\u0902. \u0968\u0966\u0968\u096E \u0926\u0947\u0916\u093F \u0936\u0948\u0915\u094D\u0937\u093F\u0915 \u0909\u0924\u094D\u0915\u0943\u0937\u094D\u091F\u0924\u093E \u0930 \u0928\u0948\u0924\u093F\u0915 \u091A\u0930\u093F\u0924\u094D\u0930 \u0928\u093F\u0930\u094D\u092E\u093E\u0923\u092E\u093E \u0938\u092E\u0930\u094D\u092A\u093F\u0924\u0964",
  heroSubtitleEn: "A premier community educational institution offering experiential STEM pedagogy, digital classrooms, high-standard laboratories, and holistic secondary and higher secondary education.",
  heroSubtitleNp: "\u0905\u0928\u0941\u092D\u0935\u0940 \u0936\u093F\u0915\u094D\u0937\u0915, \u0906\u0927\u0941\u0928\u093F\u0915 \u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u0924\u0925\u093E \u0915\u092E\u094D\u092A\u094D\u092F\u0941\u091F\u0930 \u092A\u094D\u0930\u092F\u094B\u0917\u0936\u093E\u0932\u093E \u0930 \u0921\u093F\u091C\u093F\u091F\u0932 \u0938\u094D\u092E\u093E\u0930\u094D\u091F \u0915\u0915\u094D\u0937\u093E\u0915\u094B\u0920\u093E\u0915\u093E \u092E\u093E\u0927\u094D\u092F\u092E\u092C\u093E\u091F \u0935\u093F\u0926\u094D\u092F\u093E\u0930\u094D\u0925\u0940\u0939\u0930\u0942\u0915\u094B \u091A\u094C\u0924\u0930\u094D\u092B\u0940 \u0935\u093F\u0915\u093E\u0938\u092E\u093E \u0938\u092E\u0930\u094D\u092A\u093F\u0924\u0964",
  homeBgImage: "",
  homeBgEnabled: false,
  homeBgPosition: "center",
  homeBgSize: "cover",
  homeBgOverlayEnabled: true,
  homeBgOverlayOpacity: 85,
  historyBgImage: "",
  historyBgEnabled: false,
  historyBgPosition: "center",
  historyBgSize: "cover",
  historyBgOverlayEnabled: true,
  historyBgOverlayOpacity: 80,
  stats: {
    students: "1,240+",
    studentsLabelEn: "Enrolled Students",
    studentsLabelNp: "\u0905\u0927\u094D\u092F\u092F\u0928\u0930\u0924 \u0935\u093F\u0926\u094D\u092F\u093E\u0930\u094D\u0925\u0940",
    staff: "52",
    staffLabelEn: "Faculty & Staff",
    staffLabelNp: "\u0936\u093F\u0915\u094D\u0937\u0915 \u0924\u0925\u093E \u0915\u0930\u094D\u092E\u091A\u093E\u0930\u0940",
    years: "2028 B.S.",
    yearsLabelEn: "Established",
    yearsLabelNp: "\u0938\u094D\u0925\u093E\u092A\u0928\u093E",
    successRate: "100%",
    successLabelEn: "SEE Success Rate",
    successLabelNp: "\u090F\u0938\u0908\u0908 \u092A\u0930\u0940\u0915\u094D\u0937\u093E \u0938\u092B\u0932\u0924\u093E"
  },
  sectionVisibility: {
    hero: true,
    stats: true,
    notices: true,
    principal: true,
    facilities: true,
    academics: true,
    events: true,
    achievements: true,
    history: true,
    documents: true,
    gallery: true,
    community: true,
    contact: true
  },
  footerDescEn: "Committed to excellence, integrity, and social responsibility in public secondary education since 2028 B.S.",
  footerDescNp: "\u0935\u093F.\u0938\u0902. \u0968\u0966\u0969\u096B \u0926\u0947\u0916\u093F \u0917\u0941\u0923\u0938\u094D\u0924\u0930\u0940\u092F, \u092A\u094D\u0930\u0935\u093F\u0927\u093F\u092E\u0948\u0924\u094D\u0930\u0940 \u0930 \u0928\u0948\u0924\u093F\u0915 \u0936\u093F\u0915\u094D\u0937\u093E \u092A\u094D\u0930\u0926\u093E\u0928 \u0917\u0930\u094D\u0926\u0948 \u0906\u0907\u0930\u0939\u0947\u0915\u094B \u0905\u0917\u094D\u0930\u0923\u0940 \u0928\u092E\u0941\u0928\u093E \u0938\u093E\u092E\u0941\u0926\u093E\u092F\u093F\u0915 \u0935\u093F\u0926\u094D\u092F\u093E\u0932\u092F\u0964",
  copyrightTextEn: "Ishwari Secondary School. All rights reserved.",
  copyrightTextNp: "\u0908\u0936\u094D\u0935\u0930\u0940 \u092E\u093E\u0927\u094D\u092F\u092E\u093F\u0915 \u0935\u093F\u0926\u094D\u092F\u093E\u0932\u092F\u0964 \u0938\u0930\u094D\u0935\u093E\u0927\u093F\u0915\u093E\u0930 \u0938\u0941\u0930\u0915\u094D\u0937\u093F\u0924\u0964",
  socialLinks: [
    {
      id: "soc-fb-1",
      platform: "facebook",
      url: "https://facebook.com/ishwari.secondary.school",
      labelEn: "Facebook",
      labelNp: "\u092B\u0947\u0938\u092C\u0941\u0915",
      enabled: true,
      order: 1
    },
    {
      id: "soc-yt-2",
      platform: "youtube",
      url: "https://youtube.com/@ishwari.secondary.school",
      labelEn: "YouTube",
      labelNp: "\u092F\u0941\u091F\u094D\u092F\u0941\u092C",
      enabled: true,
      order: 2
    },
    {
      id: "soc-x-3",
      platform: "x",
      url: "https://x.com/ishwari_school",
      labelEn: "X (formerly Twitter)",
      labelNp: "\u090F\u0915\u094D\u0938 (\u091F\u094D\u0935\u093F\u091F\u0930)",
      enabled: true,
      order: 3
    },
    {
      id: "soc-ig-4",
      platform: "instagram",
      url: "https://instagram.com/ishwari.secondary.school",
      labelEn: "Instagram",
      labelNp: "\u0907\u0928\u094D\u0938\u094D\u091F\u093E\u0917\u094D\u0930\u093E\u092E",
      enabled: false,
      order: 4
    }
  ],
  usefulLinks: [
    {
      id: "ul-1",
      titleEn: "Ministry of Education, Science & Technology",
      titleNp: "\u0936\u093F\u0915\u094D\u0937\u093E, \u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u0924\u0925\u093E \u092A\u094D\u0930\u0935\u093F\u0927\u093F \u092E\u0928\u094D\u0924\u094D\u0930\u093E\u0932\u092F",
      url: "https://moest.gov.np",
      descriptionEn: "Government of Nepal Federal Ministry",
      descriptionNp: "\u0928\u0947\u092A\u093E\u0932 \u0938\u0930\u0915\u093E\u0930 \u0938\u0902\u0918\u0940\u092F \u092E\u0928\u094D\u0924\u094D\u0930\u093E\u0932\u092F",
      enabled: true,
      order: 1
    },
    {
      id: "ul-2",
      titleEn: "Curriculum Development Centre (CDC)",
      titleNp: "\u092A\u093E\u0920\u094D\u092F\u0915\u094D\u0930\u092E \u0935\u093F\u0915\u093E\u0938 \u0915\u0947\u0928\u094D\u0926\u094D\u0930",
      url: "https://moecdc.gov.np",
      descriptionEn: "National curricula, syllabi & textbooks",
      descriptionNp: "\u0930\u093E\u0937\u094D\u091F\u094D\u0930\u093F\u092F \u092A\u093E\u0920\u094D\u092F\u0915\u094D\u0930\u092E \u0924\u0925\u093E \u092A\u093E\u0920\u094D\u092F\u092A\u0941\u0938\u094D\u0924\u0915",
      enabled: true,
      order: 2
    },
    {
      id: "ul-3",
      titleEn: "National Examination Board (NEB)",
      titleNp: "\u0930\u093E\u0937\u094D\u091F\u094D\u0930\u093F\u092F \u092A\u0930\u0940\u0915\u094D\u0937\u093E \u092C\u094B\u0930\u094D\u0921",
      url: "https://neb.gov.np",
      descriptionEn: "National secondary board & examinations",
      descriptionNp: "\u0930\u093E\u0937\u094D\u091F\u094D\u0930\u093F\u092F \u092A\u0930\u0940\u0915\u094D\u0937\u093E \u0924\u0925\u093E \u092E\u0942\u0932\u094D\u092F\u093E\u0919\u094D\u0915\u0928",
      enabled: true,
      order: 3
    },
    {
      id: "ul-4",
      titleEn: "Center for Education & Human Resource (CEHRD)",
      titleNp: "\u0936\u093F\u0915\u094D\u0937\u093E \u0924\u0925\u093E \u092E\u093E\u0928\u0935 \u0938\u094D\u0930\u094B\u0924 \u0935\u093F\u0915\u093E\u0938 \u0915\u0947\u0928\u094D\u0926\u094D\u0930",
      url: "https://cehrd.gov.np",
      descriptionEn: "Educational planning & resource hub",
      descriptionNp: "\u0936\u0948\u0915\u094D\u0937\u093F\u0915 \u092F\u094B\u091C\u0928\u093E \u0924\u0925\u093E \u0924\u0925\u094D\u092F\u093E\u0919\u094D\u0915 \u0915\u0947\u0928\u094D\u0926\u094D\u0930",
      enabled: true,
      order: 4
    }
  ],
  showFooterMap: true,
  footerMapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.899890123456!2d85.324!3d27.700!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjfCsDQyJzAwLjAiTiA4NcKwMTknMjYuNCJF!5e0!3m2!1sen!2snp!4v1620000000000!5m2!1sen!2snp",
  footerMapUrl: "https://maps.google.com/?q=Ishwari+Secondary+School+Nepal",
  showPrivacyPolicy: true,
  showTermsPolicy: true,
  educationalBgGlobalStyle: "subtle",
  educationalBgGlobalInteraction: "interactive",
  educationalBackgrounds: {
    hero: {
      enabled: true,
      mode: "preset",
      preset: "school_building",
      opacity: 4,
      placement: "right",
      style: "subtle",
      interaction: "interactive"
    },
    principal: {
      enabled: true,
      mode: "preset",
      preset: "classroom",
      opacity: 4,
      placement: "top-right",
      style: "subtle",
      interaction: "interactive"
    },
    facilities: {
      enabled: true,
      mode: "preset",
      preset: "science_lab",
      opacity: 4,
      placement: "bottom-right",
      style: "subtle",
      interaction: "interactive"
    },
    academics: {
      enabled: true,
      mode: "preset",
      preset: "open_books",
      opacity: 4,
      placement: "right",
      style: "subtle",
      interaction: "interactive"
    },
    about_intro: {
      enabled: true,
      mode: "preset",
      preset: "library_books",
      opacity: 4,
      placement: "right",
      style: "subtle",
      interaction: "interactive"
    },
    footer: {
      enabled: true,
      mode: "preset",
      preset: "graduation_cap",
      opacity: 3,
      placement: "bottom-right",
      style: "subtle",
      interaction: "interactive"
    }
  },
  academicYear: {
    currentYear: "2083 B.S.",
    previousYear: "2082 B.S.",
    startDate: "2083-01-01",
    endDate: "2083-12-30",
    isActive: true
  },
  homepageSections: [
    {
      id: "hero",
      nameEn: "Institutional Hero Banner",
      nameNp: "\u092E\u0941\u0916\u094D\u092F \u092C\u094D\u092F\u093E\u0928\u0930",
      title_en: "Cultivating Academic Excellence & Responsible Citizens",
      title_np: "\u0936\u0948\u0915\u094D\u0937\u093F\u0915 \u0909\u0924\u094D\u0915\u0943\u0937\u094D\u091F\u0924\u093E \u0930 \u0928\u0948\u0924\u093F\u0915 \u091A\u0930\u093F\u0924\u094D\u0930 \u0928\u093F\u0930\u094D\u092E\u093E\u0923",
      subtitle_en: "A premier community educational institution offering experiential STEM pedagogy and holistic education.",
      subtitle_np: "\u0905\u0928\u0941\u092D\u0935\u0940 \u0936\u093F\u0915\u094D\u0937\u0915 \u0930 \u0906\u0927\u0941\u0928\u093F\u0915 \u092A\u094D\u0930\u092F\u094B\u0917\u0936\u093E\u0932\u093E\u0915\u093E \u092E\u093E\u0927\u094D\u092F\u092E\u092C\u093E\u091F \u0935\u093F\u0926\u094D\u092F\u093E\u0930\u094D\u0925\u0940\u0939\u0930\u0942\u0915\u094B \u091A\u094C\u0924\u0930\u094D\u092B\u0940 \u0935\u093F\u0915\u093E\u0938\u0964",
      enabled: true,
      order: 1,
      layout: "default"
    },
    {
      id: "notices",
      nameEn: "Latest News & Digital Notice Board",
      nameNp: "\u0924\u093E\u091C\u093E \u0938\u092E\u093E\u091A\u093E\u0930 \u0924\u0925\u093E \u0938\u0942\u091A\u0928\u093E \u092A\u093E\u091F\u0940",
      title_en: "Official Circulars & Announcements",
      title_np: "\u0906\u0927\u093F\u0915\u093E\u0930\u093F\u0915 \u0938\u0942\u091A\u0928\u093E \u0924\u0925\u093E \u092A\u0930\u093F\u092A\u0924\u094D\u0930\u0939\u0930\u0942",
      subtitle_en: "Stay updated with school administrative notices, exam schedules, and circulars.",
      subtitle_np: "\u0935\u093F\u0926\u094D\u092F\u093E\u0932\u092F\u0915\u093E \u092A\u094D\u0930\u0936\u093E\u0938\u0928\u093F\u0915 \u0938\u0942\u091A\u0928\u093E, \u092A\u0930\u0940\u0915\u094D\u0937\u093E \u0924\u093E\u0932\u093F\u0915\u093E \u0930 \u092A\u0930\u093F\u092A\u0924\u094D\u0930\u0939\u0930\u0942\u0964",
      enabled: true,
      order: 2,
      layout: "cards"
    },
    {
      id: "quick_access",
      nameEn: "Quick Access / Information Hub",
      nameNp: "\u0926\u094D\u0930\u0941\u0924 \u092A\u0939\u0941\u0901\u091A / \u0938\u0942\u091A\u0928\u093E \u0915\u0947\u0928\u094D\u0926\u094D\u0930",
      title_en: "Information Hub & Direct Services",
      title_np: "\u0938\u0942\u091A\u0928\u093E \u0915\u0947\u0928\u094D\u0926\u094D\u0930 \u0924\u0925\u093E \u092A\u094D\u0930\u0924\u094D\u092F\u0915\u094D\u0937 \u0938\u0947\u0935\u093E\u0939\u0930\u0942",
      subtitle_en: "Fast access to notices, curriculum, calendar, downloads, and admissions.",
      subtitle_np: "\u0938\u0942\u091A\u0928\u093E, \u092A\u093E\u0920\u094D\u092F\u0915\u094D\u0930\u092E, \u0915\u094D\u092F\u093E\u0932\u0947\u0928\u094D\u0921\u0930, \u0921\u093E\u0909\u0928\u0932\u094B\u0921 \u0930 \u092D\u0930\u094D\u0928\u093E \u0938\u092E\u094D\u092C\u0928\u094D\u0927\u0940 \u0926\u094D\u0930\u0941\u0924 \u0938\u0947\u0935\u093E\u0939\u0930\u0942\u0964",
      enabled: true,
      order: 3,
      layout: "grid"
    },
    {
      id: "about",
      nameEn: "About School & Educational Pillars",
      nameNp: "\u0935\u093F\u0926\u094D\u092F\u093E\u0932\u092F \u092A\u0930\u093F\u091A\u092F \u0924\u0925\u093E \u0938\u094D\u0924\u092E\u094D\u092D\u0939\u0930\u0942",
      title_en: "A Legacy of Academic Distinction",
      title_np: "\u0936\u0948\u0915\u094D\u0937\u093F\u0915 \u0909\u0924\u094D\u0915\u0943\u0937\u094D\u091F\u0924\u093E\u0915\u094B \u0917\u094C\u0930\u0935\u092E\u092F \u092F\u093E\u0924\u094D\u0930\u093E",
      subtitle_en: "Dedicated to moral character, modern pedagogy, and equal learning opportunity.",
      subtitle_np: "\u0928\u0948\u0924\u093F\u0915 \u091A\u0930\u093F\u0924\u094D\u0930, \u0906\u0927\u0941\u0928\u093F\u0915 \u0936\u093F\u0915\u094D\u0937\u0923 \u0930 \u0938\u092E\u093E\u0928 \u0905\u0935\u0938\u0930\u092E\u093E \u0938\u092E\u0930\u094D\u092A\u093F\u0924\u0964",
      enabled: true,
      order: 4,
      layout: "default"
    },
    {
      id: "principal",
      nameEn: "Principal's Desk Message",
      nameNp: "\u092A\u094D\u0930\u0927\u093E\u0928\u093E\u0927\u094D\u092F\u093E\u092A\u0915\u0915\u094B \u0938\u0928\u094D\u0926\u0947\u0936",
      title_en: "Principal's Institutional Address",
      title_np: "\u092A\u094D\u0930\u0927\u093E\u0928\u093E\u0927\u094D\u092F\u093E\u092A\u0915\u0915\u094B \u0938\u0928\u094D\u0926\u0947\u0936",
      subtitle_en: "Guiding vision from the academic leadership of Ishwari Secondary School.",
      subtitle_np: "\u0936\u0948\u0915\u094D\u0937\u093F\u0915 \u0928\u0947\u0924\u0943\u0924\u094D\u0935 \u0924\u0925\u093E \u092E\u093E\u0930\u094D\u0917\u0926\u0930\u094D\u0936\u0915 \u0938\u0928\u094D\u0926\u0947\u0936\u0964",
      enabled: true,
      order: 5,
      layout: "default"
    },
    {
      id: "stats",
      nameEn: "School Institutional Statistics",
      nameNp: "\u0935\u093F\u0926\u094D\u092F\u093E\u0932\u092F\u0915\u093E \u092E\u0941\u0916\u094D\u092F \u0924\u0925\u094D\u092F\u093E\u0919\u094D\u0915\u0939\u0930\u0942",
      title_en: "Our Academic Milestone by Numbers",
      title_np: "\u0939\u093E\u092E\u094D\u0930\u094B \u0936\u0948\u0915\u094D\u0937\u093F\u0915 \u0909\u092A\u0932\u092C\u094D\u0927\u093F \u0924\u0925\u094D\u092F\u093E\u0919\u094D\u0915\u092E\u093E",
      subtitle_en: "Real figures representing student strength, faculty qualifications, and academic success.",
      subtitle_np: "\u0935\u093F\u0926\u094D\u092F\u093E\u0930\u094D\u0925\u0940 \u0938\u0919\u094D\u0916\u094D\u092F\u093E, \u0936\u093F\u0915\u094D\u0937\u0915 \u0926\u0915\u094D\u0937\u0924\u093E \u0930 \u0938\u092B\u0932\u0924\u093E\u0915\u094B \u0935\u093E\u0938\u094D\u0924\u0935\u093F\u0915 \u0924\u0925\u094D\u092F\u093E\u0919\u094D\u0915\u0964",
      enabled: true,
      order: 6,
      layout: "default"
    },
    {
      id: "facilities",
      nameEn: "Model Infrastructure & Facilities",
      nameNp: "\u0928\u092E\u0941\u0928\u093E \u092A\u0942\u0930\u094D\u0935\u093E\u0927\u093E\u0930 \u0924\u0925\u093E \u092A\u094D\u0930\u092F\u094B\u0917\u0936\u093E\u0932\u093E",
      title_en: "State-of-the-Art Learning Environment",
      title_np: "\u0906\u0927\u0941\u0928\u093F\u0915 \u0938\u093F\u0915\u093E\u0907 \u0935\u093E\u0924\u093E\u0935\u0930\u0923 \u0924\u0925\u093E \u092A\u0942\u0930\u094D\u0935\u093E\u0927\u093E\u0930",
      subtitle_en: "High-tech science laboratories, smart computer labs, and comprehensive library.",
      subtitle_np: "\u0938\u0941\u0935\u093F\u0927\u093E\u0938\u092E\u094D\u092A\u0928\u094D\u0928 \u092A\u094D\u0930\u092F\u094B\u0917\u0936\u093E\u0932\u093E, \u0915\u092E\u094D\u092A\u094D\u092F\u0941\u091F\u0930 \u0932\u094D\u092F\u093E\u092C \u0930 \u092C\u0943\u0939\u0924\u094D \u092A\u0941\u0938\u094D\u0924\u0915\u093E\u0932\u092F\u0964",
      enabled: true,
      order: 7,
      layout: "grid"
    },
    {
      id: "events",
      nameEn: "Upcoming Events & Calendar",
      nameNp: "\u0906\u0917\u093E\u092E\u0940 \u0915\u093E\u0930\u094D\u092F\u0915\u094D\u0930\u092E \u0924\u0925\u093E \u0915\u094D\u092F\u093E\u0932\u0947\u0928\u094D\u0921\u0930",
      title_en: "Upcoming Programs & Key Dates",
      title_np: "\u0906\u0917\u093E\u092E\u0940 \u0915\u093E\u0930\u094D\u092F\u0915\u094D\u0930\u092E \u0924\u0925\u093E \u092E\u0939\u0924\u094D\u0924\u094D\u0935\u092A\u0942\u0930\u094D\u0923 \u092E\u093F\u0924\u093F\u0939\u0930\u0942",
      subtitle_en: "Academic examinations, sports tournaments, and co-curricular programs.",
      subtitle_np: "\u0936\u0948\u0915\u094D\u0937\u093F\u0915 \u092A\u0930\u0940\u0915\u094D\u0937\u093E, \u0916\u0947\u0932\u0915\u0941\u0926 \u0924\u0925\u093E \u0905\u0924\u093F\u0930\u093F\u0915\u094D\u0924 \u0915\u094D\u0930\u093F\u092F\u093E\u0915\u0932\u093E\u092A\u0915\u093E \u0915\u093E\u0930\u094D\u092F\u0915\u094D\u0930\u092E\u0939\u0930\u0942\u0964",
      enabled: true,
      order: 8,
      layout: "cards"
    },
    {
      id: "achievements",
      nameEn: "Student Achievements Wall",
      nameNp: "\u0935\u093F\u0926\u094D\u092F\u093E\u0930\u094D\u0925\u0940 \u0909\u092A\u0932\u092C\u094D\u0927\u093F \u0924\u0925\u093E \u0938\u092E\u094D\u092E\u093E\u0928",
      title_en: "Student Honors & Board Distinctions",
      title_np: "\u0935\u093F\u0926\u094D\u092F\u093E\u0930\u094D\u0925\u0940 \u0938\u092E\u094D\u092E\u093E\u0928 \u0924\u0925\u093E \u0909\u0924\u094D\u0915\u0943\u0937\u094D\u091F \u0938\u092B\u0932\u0924\u093E",
      subtitle_en: "Celebrating district board toppers, athletic champions, and creative talent.",
      subtitle_np: "\u092C\u094B\u0930\u094D\u0921 \u092A\u0930\u0940\u0915\u094D\u0937\u093E, \u0916\u0947\u0932\u0915\u0941\u0926 \u0924\u0925\u093E \u0938\u093F\u0930\u094D\u091C\u0928\u093E\u0924\u094D\u092E\u0915 \u0915\u094D\u0937\u0947\u0924\u094D\u0930\u0915\u093E \u0909\u0924\u094D\u0915\u0943\u0937\u094D\u091F \u0938\u092B\u0932\u0924\u093E\u0939\u0930\u0942\u0964",
      enabled: true,
      order: 9,
      layout: "cards"
    },
    {
      id: "curriculum",
      nameEn: "Curriculum & Digital Resources",
      nameNp: "\u092A\u093E\u0920\u094D\u092F\u0915\u094D\u0930\u092E \u0924\u0925\u093E \u0921\u093F\u091C\u093F\u091F\u0932 \u0938\u094D\u0930\u094B\u0924\u0939\u0930\u0942",
      title_en: "Curriculum Guidelines & Syllabi",
      title_np: "\u092A\u093E\u0920\u094D\u092F\u0915\u094D\u0930\u092E \u0928\u093F\u0930\u094D\u0926\u0947\u0936\u093F\u0915\u093E \u0924\u0925\u093E \u0905\u0927\u094D\u092F\u092F\u0928 \u0938\u093E\u092E\u0917\u094D\u0930\u0940",
      subtitle_en: "Official CDC & NEB curriculum frameworks and learning resources.",
      subtitle_np: "\u092A\u093E\u0920\u094D\u092F\u0915\u094D\u0930\u092E \u0935\u093F\u0915\u093E\u0938 \u0915\u0947\u0928\u094D\u0926\u094D\u0930 \u0924\u0925\u093E NEB \u0926\u094D\u0935\u093E\u0930\u093E \u0928\u093F\u0930\u094D\u0927\u093E\u0930\u093F\u0924 \u092A\u093E\u0920\u094D\u092F\u0915\u094D\u0930\u092E \u0938\u093E\u092E\u0917\u094D\u0930\u0940\u0964",
      enabled: true,
      order: 10,
      layout: "compact"
    },
    {
      id: "gallery",
      nameEn: "Campus Photo Gallery",
      nameNp: "\u0924\u0938\u094D\u092C\u093F\u0930 \u0917\u094D\u092F\u093E\u0932\u0930\u0940",
      title_en: "Moments of Joy & Academic Life",
      title_np: "\u0936\u0948\u0915\u094D\u0937\u093F\u0915 \u0917\u0924\u093F\u0935\u093F\u0927\u093F \u0924\u0925\u093E \u091C\u0940\u0935\u0928\u0915\u093E \u091D\u0932\u0915\u0939\u0930\u0942",
      subtitle_en: "A glimpse into assemblies, science fairs, sports, and celebrations.",
      subtitle_np: "\u092A\u094D\u0930\u093E\u0930\u094D\u0925\u0928\u093E \u0938\u092D\u093E, \u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u092A\u094D\u0930\u0926\u0930\u094D\u0936\u0928\u0940 \u0930 \u0916\u0947\u0932\u0915\u0941\u0926\u0915\u093E \u0905\u0935\u093F\u0938\u094D\u092E\u0930\u0923\u0940\u092F \u091D\u0932\u0915\u0939\u0930\u0942\u0964",
      enabled: true,
      order: 11,
      layout: "grid"
    },
    {
      id: "contact",
      nameEn: "Contact & Institutional Helpdesk",
      nameNp: "\u0938\u092E\u094D\u092A\u0930\u094D\u0915 \u0924\u0925\u093E \u0938\u094B\u0927\u092A\u0941\u091B \u0915\u0947\u0928\u094D\u0926\u094D\u0930",
      title_en: "Connect With School Administration",
      title_np: "\u0935\u093F\u0926\u094D\u092F\u093E\u0932\u092F \u092A\u094D\u0930\u0936\u093E\u0938\u0928\u0938\u0901\u0917 \u0938\u092E\u094D\u092A\u0930\u094D\u0915 \u0917\u0930\u094D\u0928\u0941\u0939\u094B\u0938\u094D",
      subtitle_en: "Have inquiries regarding admissions, examinations, or student welfare?",
      subtitle_np: "\u092D\u0930\u094D\u0928\u093E, \u092A\u0930\u0940\u0915\u094D\u0937\u093E \u0935\u093E \u0935\u093F\u0926\u094D\u092F\u093E\u0930\u094D\u0925\u0940 \u0938\u0947\u0935\u093E \u0938\u092E\u094D\u092C\u0928\u094D\u0927\u0940 \u0915\u0941\u0928\u0948 \u091C\u093F\u091C\u094D\u091E\u093E\u0938\u093E \u092D\u090F \u0938\u092E\u094D\u092A\u0930\u094D\u0915 \u0917\u0930\u094D\u0928\u0941\u0939\u094B\u0938\u094D\u0964",
      enabled: true,
      order: 12,
      layout: "default"
    }
  ],
  quickAccessItems: [
    {
      id: "qa-notices",
      icon: "Bell",
      title_en: "Digital Notices",
      title_np: "\u0921\u093F\u091C\u093F\u091F\u0932 \u0938\u0942\u091A\u0928\u093E",
      desc_en: "Official circulars, urgent announcements, and exam schedules",
      desc_np: "\u092A\u094D\u0930\u0936\u093E\u0938\u0928\u093F\u0915 \u0938\u0942\u091A\u0928\u093E, \u092A\u0930\u093F\u092A\u0924\u094D\u0930 \u0924\u0925\u093E \u092A\u0930\u0940\u0915\u094D\u0937\u093E \u0915\u093E\u0930\u094D\u092F\u0924\u093E\u0932\u093F\u0915\u093E",
      route: "notices",
      enabled: true,
      order: 1
    },
    {
      id: "qa-calendar",
      icon: "Calendar",
      title_en: "Academic Calendar",
      title_np: "\u0936\u0948\u0915\u094D\u0937\u093F\u0915 \u0915\u094D\u092F\u093E\u0932\u0947\u0928\u094D\u0921\u0930",
      desc_en: "Annual schedule, holidays, exam dates, and school programs",
      desc_np: "\u0935\u093E\u0930\u094D\u0937\u093F\u0915 \u0915\u094D\u092F\u093E\u0932\u0947\u0928\u094D\u0921\u0930, \u092C\u093F\u0926\u093E, \u092A\u0930\u0940\u0915\u094D\u0937\u093E \u0930 \u0915\u093E\u0930\u094D\u092F\u0915\u094D\u0930\u092E\u0939\u0930\u0942",
      route: "academic-calendar",
      enabled: true,
      order: 2
    },
    {
      id: "qa-curriculum",
      icon: "BookMarked",
      title_en: "Curriculum & Syllabi",
      title_np: "\u092A\u093E\u0920\u094D\u092F\u0915\u094D\u0930\u092E \u0928\u093F\u0930\u094D\u0926\u0947\u0936\u093F\u0915\u093E",
      desc_en: "Grade-wise learning outcomes, guidelines, and reference notes",
      desc_np: "\u0924\u0939\u0917\u0924 \u0938\u093F\u0915\u093E\u0907 \u0909\u092A\u0932\u092C\u094D\u0927\u093F, \u0928\u093F\u0930\u094D\u0926\u0947\u0936\u093F\u0915\u093E \u0924\u0925\u093E \u0905\u0927\u094D\u092F\u092F\u0928 \u0938\u093E\u092E\u0917\u094D\u0930\u0940",
      route: "curriculum",
      enabled: true,
      order: 3
    },
    {
      id: "qa-downloads",
      icon: "Download",
      title_en: "Downloads Center",
      title_np: "\u0921\u093E\u0909\u0928\u0932\u094B\u0921 \u0915\u0947\u0928\u094D\u0926\u094D\u0930",
      desc_en: "Application forms, citizen charter, publications, and reports",
      desc_np: "\u092B\u093E\u0930\u092E, \u0928\u093E\u0917\u0930\u093F\u0915 \u0935\u0921\u093E\u092A\u0924\u094D\u0930, \u0935\u093E\u0930\u094D\u0937\u093F\u0915 \u092E\u0941\u0916\u092A\u0924\u094D\u0930 \u0930 \u0926\u0938\u094D\u0924\u093E\u0935\u0947\u091C\u0939\u0930\u0942",
      route: "documents",
      enabled: true,
      order: 4
    },
    {
      id: "qa-events",
      icon: "Clock",
      title_en: "Events & Routines",
      title_np: "\u0915\u093E\u0930\u094D\u092F\u0915\u094D\u0930\u092E \u0924\u093E\u0932\u093F\u0915\u093E",
      desc_en: "Assemblies, sports competitions, science fairs, and parent meetings",
      desc_np: "\u0938\u093E\u0902\u0938\u094D\u0915\u0943\u0924\u093F\u0915 \u0915\u093E\u0930\u094D\u092F\u0915\u094D\u0930\u092E, \u0916\u0947\u0932\u0915\u0941\u0926 \u0938\u092A\u094D\u0924\u093E\u0939 \u0930 \u0905\u092D\u093F\u092D\u093E\u0935\u0915 \u092D\u0947\u0932\u093E",
      route: "events",
      enabled: true,
      order: 5
    },
    {
      id: "qa-vacancies",
      icon: "Briefcase",
      title_en: "Career & Vacancies",
      title_np: "\u0930\u094B\u091C\u0917\u093E\u0930\u0940 \u0924\u0925\u093E \u0935\u093F\u091C\u094D\u091E\u093E\u092A\u0928",
      desc_en: "Open teaching and administrative recruitment circulars",
      desc_np: "\u0936\u093F\u0915\u094D\u0937\u0915 \u0924\u0925\u093E \u0915\u0930\u094D\u092E\u091A\u093E\u0930\u0940 \u092A\u0926\u092A\u0942\u0930\u094D\u0924\u093F \u0935\u093F\u091C\u094D\u091E\u093E\u092A\u0928\u0939\u0930\u0942",
      route: "notice",
      enabled: true,
      order: 6
    },
    {
      id: "qa-achievements",
      icon: "Award",
      title_en: "Student Honors",
      title_np: "\u0909\u092A\u0932\u092C\u094D\u0927\u093F \u092A\u0930\u094D\u0916\u093E\u0932",
      desc_en: "District board distinctions, trophies, and student laurels",
      desc_np: "\u092C\u094B\u0930\u094D\u0921 \u092A\u0930\u0940\u0915\u094D\u0937\u093E\u092E\u093E \u0909\u0924\u094D\u0915\u0943\u0937\u094D\u091F \u0928\u0924\u093F\u091C\u093E, \u092A\u0926\u0915 \u0924\u0925\u093E \u0938\u092E\u094D\u092E\u093E\u0928\u0939\u0930\u0942",
      route: "achievements",
      enabled: true,
      order: 7
    },
    {
      id: "qa-staff",
      icon: "Users",
      title_en: "Faculty Directory",
      title_np: "\u0936\u093F\u0915\u094D\u0937\u0915 \u0935\u093F\u0935\u0930\u0923",
      desc_en: "Certified teachers, departmental leads, and school administration",
      desc_np: "\u0926\u0915\u094D\u0937 \u0936\u093F\u0915\u094D\u0937\u0915, \u0935\u093F\u0937\u092F\u0917\u0924 \u092A\u094D\u0930\u092E\u0941\u0916 \u0924\u0925\u093E \u0915\u0930\u094D\u092E\u091A\u093E\u0930\u0940 \u0935\u093F\u0935\u0930\u0923",
      route: "staff",
      enabled: true,
      order: 8
    },
    {
      id: "qa-facilities",
      icon: "Building2",
      title_en: "Campus Facilities",
      title_np: "\u092D\u094C\u0924\u093F\u0915 \u092A\u0942\u0930\u094D\u0935\u093E\u0927\u093E\u0930",
      desc_en: "STEM laboratories, smart computer room, and digital library",
      desc_np: "\u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u092A\u094D\u0930\u092F\u094B\u0917\u0936\u093E\u0932\u093E, \u0915\u092E\u094D\u092A\u094D\u092F\u0941\u091F\u0930 \u0932\u094D\u092F\u093E\u092C \u0930 \u092A\u0941\u0938\u094D\u0924\u0915\u093E\u0932\u092F",
      route: "facilities",
      enabled: true,
      order: 9
    },
    {
      id: "qa-contact",
      icon: "PhoneCall",
      title_en: "Helpdesk & Contact",
      title_np: "\u0938\u094B\u0927\u092A\u0941\u091B \u0915\u0947\u0928\u094D\u0926\u094D\u0930",
      desc_en: "Direct contact with administration office and student helpline",
      desc_np: "\u092A\u094D\u0930\u0936\u093E\u0938\u0928 \u0915\u093E\u0930\u094D\u092F\u093E\u0932\u092F, \u092B\u094B\u0928 \u0928\u092E\u094D\u092C\u0930 \u0930 \u0932\u094B\u0915\u0947\u0938\u0928 \u0928\u0915\u094D\u0938\u093E",
      route: "contact",
      enabled: true,
      order: 10
    }
  ],
  weather: defaultWeatherConfig
};
var defaultHomepageSections = initialSiteConfig.homepageSections;
var defaultQuickAccessItems = initialSiteConfig.quickAccessItems;
var initialSecurityConfig = {
  adminUsername: "admin",
  adminPassword: "Ishwari@Secure2026",
  adminPasswordHash: "Ishwari@Secure2026",
  recoveryPin: "782035",
  lockoutThreshold: 5,
  lockoutDurationMinutes: 5,
  sessionTimeoutMinutes: 30,
  adminRouteSlug: "admin-portal",
  hideAdminLinkInHeader: false
};
var initialAuditLogs = [
  {
    id: "log-1",
    timestamp: "2083-05-12 09:15:22",
    action: "SYSTEM_BOOT",
    actor: "SYSTEM",
    status: "success",
    severity: "success",
    details: "Institutional security sandbox and database initialized successfully."
  },
  {
    id: "log-2",
    timestamp: "2083-05-12 09:20:00",
    action: "ADMIN_LOGIN_SUCCESS",
    actor: "admin",
    status: "success",
    severity: "success",
    details: "Authorized master administrator session started."
  }
];
var initialCurriculumGuidelines = [
  {
    id: 1,
    title_en: "Grade 10 Compulsory Mathematics Curriculum Guideline & Specification Grid",
    title_np: "\u0915\u0915\u094D\u0937\u093E \u0967\u0966 \u0905\u0928\u093F\u0935\u093E\u0930\u094D\u092F \u0917\u0923\u093F\u0924 \u092A\u093E\u0920\u094D\u092F\u0915\u094D\u0930\u092E \u0928\u093F\u0930\u094D\u0926\u0947\u0936\u093F\u0915\u093E \u0924\u0925\u093E \u0935\u093F\u0936\u093F\u0937\u094D\u091F\u0940\u0915\u0930\u0923 \u0924\u093E\u0932\u093F\u0915\u093E",
    subject: "Mathematics",
    academic_level_id: "secondary_9_10",
    class_level: "Grade 10",
    description_en: "National Curriculum Development Centre (CDC) curriculum framework, unit-wise learning outcomes, internal assessment modalities, and SEE specification grid.",
    description_np: "\u092A\u093E\u0920\u094D\u092F\u0915\u094D\u0930\u092E \u0935\u093F\u0915\u093E\u0938 \u0915\u0947\u0928\u094D\u0926\u094D\u0930 (CDC) \u0926\u094D\u0935\u093E\u0930\u093E \u0928\u093F\u0930\u094D\u0927\u093E\u0930\u093F\u0924 \u0915\u0915\u094D\u0937\u093E \u0967\u0966 \u0915\u094B \u0905\u0928\u093F\u0935\u093E\u0930\u094D\u092F \u0917\u0923\u093F\u0924 \u0935\u093F\u0937\u092F\u0915\u094B \u0938\u093F\u0915\u093E\u0907 \u0909\u092A\u0932\u092C\u094D\u0927\u093F, \u092A\u094D\u0930\u092F\u094B\u0917\u093E\u0924\u094D\u092E\u0915 \u092E\u0942\u0932\u094D\u092F\u093E\u0919\u094D\u0915\u0928 \u0930 \u0935\u093F\u0936\u093F\u0937\u094D\u091F\u0940\u0915\u0930\u0923 \u0924\u093E\u0932\u093F\u0915\u093E\u0964",
    academic_year: "2083 B.S.",
    pdf_path: "/api/curriculum/file/curr-math-grade10.pdf",
    original_filename: "Grade10_Compulsory_Mathematics_Guideline_2083.pdf",
    file_size_bytes: 384e4,
    file_size_formatted: "3.8 MB",
    mime_type: "application/pdf",
    status: "published",
    display_order: 1,
    created_at: "2026-04-10",
    updated_at: "2026-08-15"
  },
  {
    id: 2,
    title_en: "Grade 9-10 Science & Technology Practical Laboratory Curriculum",
    title_np: "\u0915\u0915\u094D\u0937\u093E \u096F-\u0967\u0966 \u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u0924\u0925\u093E \u092A\u094D\u0930\u0935\u093F\u0927\u093F \u092A\u094D\u0930\u092F\u094B\u0917\u093E\u0924\u094D\u092E\u0915 \u092A\u094D\u0930\u092F\u094B\u0917\u0936\u093E\u0932\u093E \u092A\u093E\u0920\u094D\u092F\u0915\u094D\u0930\u092E",
    subject: "Science & Technology",
    academic_level_id: "secondary_9_10",
    class_level: "Grade 9-10",
    description_en: "Laboratory practical experiments, scientific investigation steps, project work guidelines, and continuous assessment rubric.",
    description_np: "\u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u092A\u094D\u0930\u092F\u094B\u0917\u0936\u093E\u0932\u093E \u0905\u092D\u094D\u092F\u093E\u0938, \u092A\u094D\u0930\u092F\u094B\u0917\u093E\u0924\u094D\u092E\u0915 \u0915\u093E\u0930\u094D\u092F, \u092A\u0930\u093F\u092F\u094B\u091C\u0928\u093E \u0915\u093E\u0930\u094D\u092F \u0930 \u0928\u093F\u0930\u0928\u094D\u0924\u0930 \u0935\u093F\u0926\u094D\u092F\u093E\u0930\u094D\u0925\u0940 \u092E\u0942\u0932\u094D\u092F\u093E\u0919\u094D\u0915\u0928 \u0928\u093F\u0930\u094D\u0926\u0947\u0936\u093F\u0915\u093E\u0964",
    academic_year: "2083 B.S.",
    pdf_path: "/api/curriculum/file/curr-science-grade9-10.pdf",
    original_filename: "Grade9_10_Science_Tech_Lab_Manual_2083.pdf",
    file_size_bytes: 5242880,
    file_size_formatted: "5.2 MB",
    mime_type: "application/pdf",
    status: "published",
    display_order: 2,
    created_at: "2026-04-12",
    updated_at: "2026-08-14"
  },
  {
    id: 3,
    title_en: "Grade 11-12 Physics Practical Curriculum & Experimental Manual",
    title_np: "\u0915\u0915\u094D\u0937\u093E \u0967\u0967-\u0967\u0968 \u092D\u094C\u0924\u093F\u0915\u0936\u093E\u0938\u094D\u0924\u094D\u0930 \u092A\u094D\u0930\u092F\u094B\u0917\u093E\u0924\u094D\u092E\u0915 \u092A\u093E\u0920\u094D\u092F\u0915\u094D\u0930\u092E \u0924\u0925\u093E \u092A\u094D\u0930\u092F\u094B\u0917\u0936\u093E\u0932\u093E \u0928\u093F\u0930\u094D\u0926\u0947\u0936\u093F\u0915\u093E",
    subject: "Physics",
    academic_level_id: "higher_secondary_11_12",
    class_level: "Grade 11-12",
    description_en: "National Examinations Board (NEB) Class 11 and 12 physics experiments, error analysis instructions, and viva-voce guide.",
    description_np: "\u0930\u093E\u0937\u094D\u091F\u094D\u0930\u093F\u092F \u092A\u0930\u0940\u0915\u094D\u0937\u093E \u092C\u094B\u0930\u094D\u0921 (NEB) \u0915\u0915\u094D\u0937\u093E \u0967\u0967 \u0930 \u0967\u0968 \u092D\u094C\u0924\u093F\u0915 \u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u092A\u094D\u0930\u092F\u094B\u0917\u093E\u0924\u094D\u092E\u0915 \u092A\u0930\u0940\u0915\u094D\u0937\u093E \u0928\u093F\u0930\u094D\u0926\u0947\u0936\u093F\u0915\u093E \u0930 \u0928\u092E\u0941\u0928\u093E \u0905\u092D\u094D\u092F\u093E\u0938\u0964",
    academic_year: "2083 B.S.",
    pdf_path: "/api/curriculum/file/curr-physics-grade11-12.pdf",
    original_filename: "NEB_Grade11_12_Physics_Practical_Manual.pdf",
    file_size_bytes: 7864320,
    file_size_formatted: "7.5 MB",
    mime_type: "application/pdf",
    status: "published",
    display_order: 3,
    created_at: "2026-04-15",
    updated_at: "2026-08-10"
  },
  {
    id: 4,
    title_en: "Basic Level (Grade 6-8) English Communicative Curriculum & Listening Materials",
    title_np: "\u0906\u0927\u093E\u0930\u092D\u0942\u0924 \u0924\u0939 (\u0915\u0915\u094D\u0937\u093E \u096C-\u096E) \u0905\u0902\u0917\u094D\u0930\u0947\u091C\u0940 \u0938\u091E\u094D\u091A\u093E\u0930 \u0938\u0940\u092A \u092A\u093E\u0920\u094D\u092F\u0915\u094D\u0930\u092E \u0924\u0925\u093E \u0938\u0941\u0928\u093E\u0907 \u0905\u092D\u094D\u092F\u093E\u0938",
    subject: "English",
    academic_level_id: "basic_6_8",
    class_level: "Grade 6-8",
    description_en: "Four-strand language competencies: Listening, Speaking, Reading, and Writing with internal assessment weightage.",
    description_np: "\u0938\u0941\u0928\u093E\u0907, \u092C\u094B\u0932\u093E\u0907, \u092A\u0922\u093E\u0907 \u0930 \u0932\u0947\u0916\u093E\u0907 \u0938\u092E\u094D\u092C\u0928\u094D\u0927\u0940 \u091A\u093E\u0930\u0935\u091F\u0948 \u092D\u093E\u0937\u093F\u0915 \u0938\u0940\u092A \u0930 \u0906\u0928\u094D\u0924\u0930\u093F\u0915 \u092E\u0942\u0932\u094D\u092F\u093E\u0919\u094D\u0915\u0928\u0915\u094B \u0922\u093E\u0901\u091A\u093E\u0964",
    academic_year: "2083 B.S.",
    pdf_path: "/api/curriculum/file/curr-english-grade6-8.pdf",
    original_filename: "Grade6_8_English_Language_Competencies.pdf",
    file_size_bytes: 2621440,
    file_size_formatted: "2.5 MB",
    mime_type: "application/pdf",
    status: "published",
    display_order: 4,
    created_at: "2026-04-18",
    updated_at: "2026-08-12"
  },
  {
    id: 5,
    title_en: "Grade 10 Compulsory Nepali Curriculum Framework & Creative Writing Guidelines",
    title_np: "\u0915\u0915\u094D\u0937\u093E \u0967\u0966 \u0905\u0928\u093F\u0935\u093E\u0930\u094D\u092F \u0928\u0947\u092A\u093E\u0932\u0940 \u092A\u093E\u0920\u094D\u092F\u0915\u094D\u0930\u092E \u0938\u0902\u0930\u091A\u0928\u093E \u0924\u0925\u093E \u0938\u093F\u0930\u094D\u091C\u0928\u093E\u0924\u094D\u092E\u0915 \u0932\u0947\u0916\u0928 \u0928\u093F\u0930\u094D\u0926\u0947\u0936\u093F\u0915\u093E",
    subject: "Nepali",
    academic_level_id: "secondary_9_10",
    class_level: "Grade 10",
    description_en: "Grammar, comprehension, essay writing guidelines, literature appreciation, and CDC model question specifications.",
    description_np: "\u0935\u094D\u092F\u093E\u0915\u0930\u0923, \u092C\u094B\u0927 \u0924\u0925\u093E \u0905\u092D\u093F\u0935\u094D\u092F\u0915\u094D\u0924\u093F, \u0938\u093F\u0930\u094D\u091C\u0928\u093E\u0924\u094D\u092E\u0915 \u0932\u0947\u0916\u0928, \u0938\u093E\u0939\u093F\u0924\u094D\u092F \u0935\u093F\u0927\u093E \u0930 \u090F\u0938\u0908\u0908 \u0928\u092E\u0941\u0928\u093E \u092A\u094D\u0930\u0936\u094D\u0928 \u0928\u093F\u0930\u094D\u0926\u0947\u0936\u093F\u0915\u093E\u0964",
    academic_year: "2083 B.S.",
    pdf_path: "/api/curriculum/file/curr-nepali-grade10.pdf",
    original_filename: "Grade10_Nepali_Curriculum_Guidelines_2083.pdf",
    file_size_bytes: 3145728,
    file_size_formatted: "3.0 MB",
    mime_type: "application/pdf",
    status: "published",
    display_order: 5,
    created_at: "2026-04-20",
    updated_at: "2026-08-10"
  },
  {
    id: 6,
    title_en: "Grade 11-12 Computer Science & ICT Practical Curriculum Manual",
    title_np: "\u0915\u0915\u094D\u0937\u093E \u0967\u0967-\u0967\u0968 \u0915\u092E\u094D\u092A\u094D\u092F\u0941\u091F\u0930 \u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u0924\u0925\u093E \u0938\u0942\u091A\u0928\u093E \u092A\u094D\u0930\u0935\u093F\u0927\u093F \u092A\u094D\u0930\u092F\u094B\u0917\u093E\u0924\u094D\u092E\u0915 \u092A\u093E\u0920\u094D\u092F\u0915\u094D\u0930\u092E",
    subject: "Computer Science",
    academic_level_id: "higher_secondary_11_12",
    class_level: "Grade 11-12",
    description_en: "Programming in C, Python basics, Web Development (HTML/CSS/JS), Database Management (SQL), and Project work guidelines.",
    description_np: "\u0938\u0940 \u092A\u094D\u0930\u094B\u0917\u094D\u0930\u093E\u092E\u093F\u0919, \u0935\u0947\u092C \u0935\u093F\u0915\u093E\u0938, \u0921\u093E\u091F\u093E\u092C\u0947\u0938 \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E\u092A\u0928 (SQL) \u0930 \u092A\u0930\u093F\u092F\u094B\u091C\u0928\u093E \u0915\u093E\u0930\u094D\u092F \u0928\u093F\u0930\u094D\u0926\u0947\u0936\u093F\u0915\u093E\u0964",
    academic_year: "2083 B.S.",
    pdf_path: "/api/curriculum/file/curr-cs-grade11-12.pdf",
    original_filename: "NEB_Grade11_12_Computer_Science_Practical_Manual.pdf",
    file_size_bytes: 4718592,
    file_size_formatted: "4.5 MB",
    mime_type: "application/pdf",
    status: "published",
    display_order: 6,
    created_at: "2026-04-22",
    updated_at: "2026-08-08"
  },
  {
    id: 7,
    title_en: "Primary Level (Grade 1-5) Integrated Curriculum Draft Guideline",
    title_np: "\u0906\u0927\u093E\u0930\u092D\u0942\u0924 \u0924\u0939 (\u0915\u0915\u094D\u0937\u093E \u0967-\u096B) \u090F\u0915\u0940\u0915\u0943\u0924 \u092A\u093E\u0920\u094D\u092F\u0915\u094D\u0930\u092E \u092E\u0938\u094D\u092F\u094C\u0926\u093E \u0928\u093F\u0930\u094D\u0926\u0947\u0936\u093F\u0915\u093E",
    subject: "Integrated Curriculum",
    academic_level_id: "primary_1_5",
    class_level: "Grade 1-5",
    description_en: "Internal committee review draft for integrated theme-based lessons across languages, math, and environmental studies.",
    description_np: "\u0906\u0928\u094D\u0924\u0930\u093F\u0915 \u0938\u092E\u093F\u0924\u093F \u0938\u092E\u0940\u0915\u094D\u0937\u093E\u0915\u094B \u0915\u094D\u0930\u092E\u092E\u093E \u0930\u0939\u0947\u0915\u094B \u090F\u0915\u0940\u0915\u0943\u0924 \u092A\u093E\u0920\u094D\u092F\u0915\u094D\u0930\u092E \u092E\u0938\u094D\u092F\u094C\u0926\u093E\u0964",
    academic_year: "2083 B.S.",
    pdf_path: "/api/curriculum/file/curr-primary-draft.pdf",
    original_filename: "Primary_Integrated_Curriculum_Draft_Review.pdf",
    file_size_bytes: 2097152,
    file_size_formatted: "2.0 MB",
    mime_type: "application/pdf",
    status: "unpublished",
    display_order: 7,
    created_at: "2026-05-01",
    updated_at: "2026-05-01"
  }
];
var initialVacancies = [
  {
    id: "vac-comp-sec-01",
    title_en: "Secondary Level Computer Teacher",
    title_np: "\u092E\u093E\u0927\u094D\u092F\u092E\u093F\u0915 \u0924\u0939 \u0915\u092E\u094D\u092A\u094D\u092F\u0941\u091F\u0930 \u0936\u093F\u0915\u094D\u0937\u0915",
    department: "Science & Computer",
    employment_type: "Full Time",
    positions_count: 1,
    academic_level: "Secondary Level (Grade 9-12)",
    location: "Main Academic Campus, Bhotewodar, Lamjung",
    short_description_en: "Seeking a dedicated Computer Teacher to lead Computer Science and ICT courses for secondary grades with hands-on lab practicals.",
    short_description_np: "\u092E\u093E\u0927\u094D\u092F\u092E\u093F\u0915 \u0924\u0939 (\u0915\u0915\u094D\u0937\u093E \u096F-\u0967\u0968) \u0915\u093E \u0935\u093F\u0926\u094D\u092F\u093E\u0930\u094D\u0925\u0940\u0939\u0930\u0942\u0932\u093E\u0908 \u0915\u092E\u094D\u092A\u094D\u092F\u0941\u091F\u0930 \u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u0924\u0925\u093E \u0938\u0942\u091A\u0928\u093E \u092A\u094D\u0930\u0935\u093F\u0927\u093F \u0935\u093F\u0937\u092F \u0905\u0927\u094D\u092F\u093E\u092A\u0928 \u0917\u0930\u093E\u0909\u0928 \u0926\u0915\u094D\u0937 \u0936\u093F\u0915\u094D\u0937\u0915\u0915\u094B \u0906\u0935\u0936\u094D\u092F\u0915\u0924\u093E\u0964",
    description_en: "Ishwari Secondary School invites applications from qualified, passionate, and energetic Nepalese educators for the post of Secondary Level Computer Science Teacher. The ideal candidate will be responsible for teaching prescribed curriculum guidelines, maintaining our high-tech multimedia computer laboratory, and mentoring students in practical technological skills.",
    description_np: "\u092F\u0938 \u0936\u094D\u0930\u0940 \u0908\u0936\u094D\u0935\u0930\u0940 \u092E\u093E\u0927\u094D\u092F\u092E\u093F\u0915 \u0935\u093F\u0926\u094D\u092F\u093E\u0932\u092F\u092E\u093E \u092E\u093E\u0927\u094D\u092F\u092E\u093F\u0915 \u0924\u0939 (\u0915\u0915\u094D\u0937\u093E \u096F-\u0967\u0968) \u0915\u093E \u0932\u093E\u0917\u093F \u092F\u094B\u0917\u094D\u092F \u0924\u0925\u093E \u0905\u0928\u0941\u092D\u0935\u0940 \u0915\u092E\u094D\u092A\u094D\u092F\u0941\u091F\u0930 \u0936\u093F\u0915\u094D\u0937\u0915 \u092A\u0926\u092A\u0942\u0930\u094D\u0924\u093F \u0917\u0930\u094D\u0928\u0941\u092A\u0930\u094D\u0928\u0947 \u092D\u090F\u0915\u093E\u0932\u0947 \u092F\u094B\u0917\u094D\u092F\u0924\u093E \u092A\u0941\u0917\u0947\u0915\u093E \u0907\u091A\u094D\u091B\u0941\u0915 \u0928\u0947\u092A\u093E\u0932\u0940 \u0928\u093E\u0917\u0930\u093F\u0915\u0939\u0930\u0942\u092C\u093E\u091F \u0930\u0940\u0924\u092A\u0942\u0930\u094D\u0935\u0915 \u0926\u0930\u0916\u093E\u0938\u094D\u0924 \u0906\u0939\u094D\u0935\u093E\u0928 \u0917\u0930\u093F\u0928\u094D\u091B\u0964",
    responsibilities: [
      "Deliver engaging classroom lectures and hands-on laboratory exercises for Grades 9 through 12 Computer Science curriculum.",
      "Maintain hardware, operating systems, and network readiness of the student computer laboratory.",
      "Administer unit examinations, practical assessments, and maintain continuous assessment records.",
      "Facilitate extracurricular coding clubs, student IT exhibitions, and digital literacy initiatives.",
      "Participate actively in staff academic meetings and institutional developmental activities."
    ],
    qualifications: [
      "Bachelor\u2019s Degree in Computer Science / IT (B.Sc. CSIT / BIT / BCA / B.E. Computer) or B.Ed. in ICT from an officially recognized university.",
      "Valid Secondary Level Teaching License issued by the Teachers Service Commission (TSC / \u0936\u093F\u0915\u094D\u0937\u0915 \u0938\u0947\u0935\u093E \u0906\u092F\u094B\u0917), Nepal.",
      "Nepali citizenship with minimum age criteria as per government education regulations."
    ],
    experience: "Minimum 1 year of proven teaching experience in secondary level computer science or educational ICT preferred.",
    skills: [
      "Proficiency in Python programming, C basics, HTML/CSS, Web development principles, and Database concepts.",
      "Troubleshooting computer hardware, local area networks, and laboratory operating systems.",
      "Strong bilingual communication skills in English and Nepali.",
      "Patient, student-centered classroom management approach."
    ],
    application_method: "google_form",
    application_url: "https://forms.gle/7vNq8xK9pLm2W3aB7",
    application_deadline: "2026-09-25",
    application_instructions: "Please fill out the official Google Form application link before the deadline. Keep scanned digital copies of your Nepali citizenship, academic transcripts, character certificates, teaching license, and updated curriculum vitae (CV) ready for upload.",
    status: "published",
    publish_date: "2026-09-01",
    display_order: 1,
    featured: true,
    created_at: "2026-09-01T10:00:00.000Z",
    updated_at: "2026-09-10T14:30:00.000Z"
  },
  {
    id: "vac-eng-basic-02",
    title_en: "Basic Level English Teacher",
    title_np: "\u0906\u0927\u093E\u0930\u092D\u0942\u0924 \u0924\u0939 \u0905\u0902\u0917\u094D\u0930\u0947\u091C\u0940 \u0936\u093F\u0915\u094D\u0937\u0915",
    department: "Languages & Humanities",
    employment_type: "Full Time",
    positions_count: 1,
    academic_level: "Basic Level (Grade 6-8)",
    location: "Main Academic Campus, Bhotewodar, Lamjung",
    short_description_en: "Looking for a communicative English educator to teach middle-grade learners with child-friendly modern pedagogies.",
    short_description_np: "\u0906\u0927\u093E\u0930\u092D\u0942\u0924 \u0924\u0939 (\u0915\u0915\u094D\u0937\u093E \u096C-\u096E) \u0915\u093E \u0932\u093E\u0917\u093F \u0935\u093F\u0926\u094D\u092F\u093E\u0930\u094D\u0925\u0940\u0915\u0947\u0928\u094D\u0926\u094D\u0930\u093F\u0924 \u0930 \u0935\u094D\u092F\u093E\u0935\u0939\u093E\u0930\u093F\u0915 \u092A\u0926\u094D\u0927\u0924\u093F\u092C\u093E\u091F \u0905\u0927\u094D\u092F\u093E\u092A\u0928 \u0917\u0930\u093E\u0909\u0928 \u0905\u0902\u0917\u094D\u0930\u0947\u091C\u0940 \u0936\u093F\u0915\u094D\u0937\u0915\u0915\u094B \u0906\u0935\u0936\u094D\u092F\u0915\u0924\u093E\u0964",
    description_en: "Applications are invited for the position of Basic Level English Teacher to guide students through grammar, comprehension, spoken communication, and literature as per the National Curriculum Framework.",
    description_np: "\u0906\u0927\u093E\u0930\u092D\u0942\u0924 \u0924\u0939\u0915\u093E \u0935\u093F\u0926\u094D\u092F\u093E\u0930\u094D\u0925\u0940\u0939\u0930\u0942\u0915\u094B \u092D\u093E\u0937\u093F\u0915 \u0926\u0915\u094D\u0937\u0924\u093E, \u0935\u094D\u092F\u093E\u0915\u0930\u0923 \u0924\u0925\u093E \u0938\u093F\u0930\u094D\u091C\u0928\u093E\u0924\u094D\u092E\u0915 \u0932\u0947\u0916\u0928 \u0915\u0932\u093E \u0905\u092D\u093F\u0935\u0943\u0926\u094D\u0927\u093F \u0917\u0930\u094D\u0928 \u092F\u094B\u0917\u094D\u092F \u0936\u093F\u0915\u094D\u0937\u0915\u092C\u093E\u091F \u0905\u0928\u0932\u093E\u0907\u0928 \u0926\u0930\u0916\u093E\u0938\u094D\u0924 \u092E\u093E\u0917 \u0917\u0930\u093F\u0928\u094D\u091B\u0964",
    responsibilities: [
      "Conduct daily classroom teaching for Grades 6-8 English curriculum.",
      "Prepare weekly lesson plans, audio-visual interactive listening exercises, and vocabulary worksheets.",
      "Organize school literary events including spelling bees, debates, and poetry recitations.",
      "Assess homework and guide learners with constructive feedback."
    ],
    qualifications: [
      "Bachelor\u2019s Degree with Major English (B.A. English / B.Ed. English) from a recognized university.",
      "Basic or Secondary level valid Teaching License.",
      "Sound pedagogical understanding of child psychology and communicative language teaching."
    ],
    experience: "Prior teaching experience in basic level or secondary schools is strongly preferred.",
    skills: [
      "High fluency in spoken and written English.",
      "Interactive phonetics and grammar teaching capabilities.",
      "Proficiency with multimedia classroom tools."
    ],
    application_method: "google_form",
    application_url: "https://forms.gle/9xK2Lm5pQq4vW8yC1",
    application_deadline: "2026-10-15",
    application_instructions: "Submit your credentials and statement of purpose via the designated Google Form link before 5:00 PM on 15 October 2026.",
    status: "published",
    publish_date: "2026-09-05",
    display_order: 2,
    featured: false,
    created_at: "2026-09-05T09:00:00.000Z",
    updated_at: "2026-09-05T09:00:00.000Z"
  },
  {
    id: "vac-acc-staff-03",
    title_en: "Senior School Accountant / Finance Officer",
    title_np: "\u0935\u0930\u093F\u0937\u094D\u0920 \u0935\u093F\u0926\u094D\u092F\u093E\u0932\u092F \u0932\u0947\u0916\u093E\u092A\u093E\u0932 / \u0932\u0947\u0916\u093E \u0905\u0927\u093F\u0915\u0943\u0924",
    department: "Administration & Finance",
    employment_type: "Full Time",
    positions_count: 1,
    academic_level: "Administrative Staff",
    location: "Administrative Block, Ishwari Secondary School",
    short_description_en: "Experienced accountant required to manage school accounts, financial statements, and government audit reconciliations.",
    short_description_np: "\u0935\u093F\u0926\u094D\u092F\u093E\u0932\u092F\u0915\u094B \u0906\u0930\u094D\u0925\u093F\u0915 \u0939\u0930\u0939\u093F\u0938\u093E\u092C, \u0924\u0932\u092C\u092D\u0924\u094D\u0924\u093E, \u0938\u0930\u0915\u093E\u0930\u0940 \u0932\u0947\u0916\u093E \u092A\u094D\u0930\u0923\u093E\u0932\u0940 \u0930 \u0932\u0947\u0916\u093E\u092A\u0930\u0940\u0915\u094D\u0937\u0923 \u0938\u091E\u094D\u091A\u093E\u0932\u0928 \u0917\u0930\u094D\u0928 \u0905\u0928\u0941\u092D\u0935\u0940 \u0932\u0947\u0916\u093E\u092A\u093E\u0932 \u0906\u0935\u0936\u094D\u092F\u0915\u0964",
    description_en: "Ishwari Secondary School requires a dependable, detail-oriented School Accountant to handle overall financial administration, fee collections, payroll, bank reconciliations, and regulatory compliance under community school financial bylaws.",
    description_np: "\u0935\u093F\u0926\u094D\u092F\u093E\u0932\u092F\u0915\u094B \u0938\u092E\u094D\u092A\u0942\u0930\u094D\u0923 \u0906\u0930\u094D\u0925\u093F\u0915 \u0915\u093E\u0930\u094B\u092C\u093E\u0930, \u092C\u091C\u0947\u091F \u0928\u093F\u0930\u094D\u092E\u093E\u0923, \u0916\u0930\u094D\u091A \u0935\u093F\u0935\u0930\u0923, \u092C\u0948\u0902\u0915 \u0939\u093F\u0938\u093E\u092C \u092E\u093F\u0932\u093E\u0928 \u0924\u0925\u093E \u0938\u093E\u092E\u093E\u091C\u093F\u0915 \u0932\u0947\u0916\u093E\u092A\u0930\u0940\u0915\u094D\u0937\u0923 \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E\u092A\u0928\u0915\u093E \u0932\u093E\u0917\u093F \u0926\u0930\u0916\u093E\u0938\u094D\u0924 \u0906\u0939\u094D\u0935\u093E\u0928\u0964",
    responsibilities: [
      "Maintain daily cash books, vouchers, ledgers, and bank reconciliations.",
      "Prepare quarterly and annual balance sheets and expenditure statements for the SMC and Local Government Education Section.",
      "Process monthly staff payroll and provident fund contributions.",
      "Facilitate external statutory and social audits."
    ],
    qualifications: [
      "Bachelor\u2019s Degree in Business Studies (BBS), BBA, or equivalent with Accountancy/Finance major.",
      "Good understanding of Nepalese community school financial rules and tax guidelines."
    ],
    experience: "Minimum 2 years of bookkeeping experience in educational institutions or reputable organizations.",
    skills: [
      "Expertise in Tally ERP, Swastik or modern accounting software packages.",
      "Advanced skills in Microsoft Excel and data entry.",
      "Fluent in Devnagari typing (Preeti / Unicode) and English documentation."
    ],
    application_method: "google_form",
    application_url: "https://forms.gle/3mKp8xV2yZ1wQ4uD9",
    application_deadline: "2026-09-30",
    application_instructions: "Complete the Google Form with personal details, educational documents, work experience certificates, and reference contacts.",
    status: "published",
    publish_date: "2026-09-08",
    display_order: 3,
    featured: false,
    created_at: "2026-09-08T11:00:00.000Z",
    updated_at: "2026-09-08T11:00:00.000Z"
  }
];
var initialFAQs = [
  // 1. Admissions
  {
    id: "faq-adm-1",
    category: "admissions",
    question_en: "When does the admission process begin for the new academic session?",
    question_np: "\u0928\u092F\u093E\u0901 \u0936\u0948\u0915\u094D\u0937\u093F\u0915 \u0938\u0924\u094D\u0930\u0915\u094B \u0932\u093E\u0917\u093F \u0935\u093F\u0926\u094D\u092F\u093E\u0930\u094D\u0925\u0940 \u092D\u0930\u094D\u0928\u093E \u0915\u0939\u093F\u0932\u0947 \u0938\u0941\u0930\u0941 \u0939\u0941\u0928\u094D\u091B?",
    answer_en: "Admissions officially open in the first week of Baisakh (mid-April) each year immediately following the publication of annual examination results. Parents and guardians can submit the admission form online through our portal or in person at the school administration office.",
    answer_np: "\u092A\u094D\u0930\u0924\u094D\u092F\u0947\u0915 \u0935\u0930\u094D\u0937 \u0935\u093E\u0930\u094D\u0937\u093F\u0915 \u092A\u0930\u0940\u0915\u094D\u0937\u093E\u0915\u094B \u0928\u0924\u093F\u091C\u093E \u092A\u094D\u0930\u0915\u093E\u0936\u0928 \u0932\u0917\u0924\u094D\u0924\u0948 \u0935\u0948\u0936\u093E\u0916\u0915\u094B \u092A\u0939\u093F\u0932\u094B \u0939\u092A\u094D\u0924\u093E\u0926\u0947\u0916\u093F \u092D\u0930\u094D\u0928\u093E \u0905\u092D\u093F\u092F\u093E\u0928 \u0938\u0941\u0930\u0941 \u0939\u0941\u0928\u094D\u091B\u0964 \u0905\u092D\u093F\u092D\u093E\u0935\u0915\u0939\u0930\u0942\u0932\u0947 \u0939\u093E\u092E\u094D\u0930\u094B \u0921\u093F\u091C\u093F\u091F\u0932 \u092A\u094B\u0930\u094D\u091F\u0932\u092C\u093E\u091F \u0905\u0928\u0932\u093E\u0907\u0928 \u092B\u093E\u0930\u092E \u092D\u0930\u094D\u0928 \u0935\u093E \u0935\u093F\u0926\u094D\u092F\u093E\u0932\u092F \u092A\u094D\u0930\u0936\u093E\u0938\u0928 \u0936\u093E\u0916\u093E\u092E\u093E \u092A\u094D\u0930\u0924\u094D\u092F\u0915\u094D\u0937 \u0909\u092A\u0938\u094D\u0925\u093F\u0924 \u092D\u0908 \u092D\u0930\u094D\u0928\u093E \u092A\u094D\u0930\u0915\u094D\u0930\u093F\u092F\u093E \u092A\u0942\u0930\u093E \u0917\u0930\u094D\u0928 \u0938\u0915\u094D\u0928\u0941\u0939\u0941\u0928\u094D\u091B\u0964",
    highlights_en: ["First week of Baisakh (April)", "Online or In-person submission"],
    highlights_np: ["\u0935\u0948\u0936\u093E\u0916\u0915\u094B \u092A\u0939\u093F\u0932\u094B \u0939\u092A\u094D\u0924\u093E", "\u0905\u0928\u0932\u093E\u0907\u0928 \u0935\u093E \u092A\u094D\u0930\u0924\u094D\u092F\u0915\u094D\u0937 \u092D\u0930\u094D\u0928\u093E \u092B\u093E\u0930\u092E"],
    display_order: 1,
    status: "published",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z"
  },
  {
    id: "faq-adm-2",
    category: "admissions",
    question_en: "What documents are required during student enrollment?",
    question_np: "\u0935\u093F\u0926\u094D\u092F\u093E\u0930\u094D\u0925\u0940 \u092D\u0930\u094D\u0928\u093E\u0915\u093E \u0932\u093E\u0917\u093F \u0915\u0947-\u0915\u0947 \u0915\u093E\u0917\u091C\u093E\u0924\u0939\u0930\u0942 \u0906\u0935\u0936\u094D\u092F\u0915 \u092A\u0930\u094D\u091B\u0928\u094D?",
    answer_en: "Required documents include: (1) Copy of the official Birth Certificate issued by the local ward, (2) Previous grade Transfer & Character Certificate (Mark-sheet/Grade-sheet), (3) 3 passport-sized color photographs, (4) Copy of citizenship of parents/guardians, and (5) Specific recommendation letter if applying for inclusive or quota scholarships.",
    answer_np: "\u092D\u0930\u094D\u0928\u093E\u0915\u093E \u0932\u093E\u0917\u093F \u0906\u0935\u0936\u094D\u092F\u0915 \u0915\u093E\u0917\u091C\u093E\u0924\u0939\u0930\u0942: (\u0967) \u0938\u094D\u0925\u093E\u0928\u0940\u092F \u0935\u0921\u093E \u0915\u093E\u0930\u094D\u092F\u093E\u0932\u092F\u092C\u093E\u091F \u091C\u093E\u0930\u0940 \u091C\u0928\u094D\u092E\u0926\u0930\u094D\u0924\u093E \u092A\u094D\u0930\u092E\u093E\u0923\u092A\u0924\u094D\u0930\u0915\u094B \u092A\u094D\u0930\u0924\u093F\u0932\u093F\u092A\u093F, (\u0968) \u0905\u0918\u093F\u0932\u094D\u0932\u094B \u0915\u0915\u094D\u0937\u093E\u0915\u094B \u0938\u094D\u0925\u093E\u0928\u093E\u0928\u094D\u0924\u0930\u0923 \u092A\u094D\u0930\u092E\u093E\u0923\u092A\u0924\u094D\u0930 (\u091F\u093F.\u0938\u0940.) \u0924\u0925\u093E \u0932\u092C\u094D\u0927\u093E\u0919\u094D\u0915 \u092A\u0924\u094D\u0930 (\u092E\u093E\u0930\u094D\u0915\u0938\u093F\u091F), (\u0969) \u0969 \u092A\u094D\u0930\u0924\u093F \u092A\u093E\u0938\u092A\u094B\u0930\u094D\u091F \u0938\u093E\u0907\u091C\u0915\u094B \u092B\u094B\u091F\u094B, (\u096A) \u0905\u092D\u093F\u092D\u093E\u0935\u0915\u0915\u094B \u0928\u093E\u0917\u0930\u093F\u0915\u0924\u093E\u0915\u094B \u092A\u094D\u0930\u0924\u093F\u0932\u093F\u092A\u093F, \u0930 (\u096B) \u0938\u092E\u093E\u0935\u0947\u0936\u0940 \u0935\u093E \u0932\u0915\u094D\u0937\u093F\u0924 \u0935\u0930\u094D\u0917 \u092D\u090F\u092E\u093E \u0938\u093F\u092B\u093E\u0930\u093F\u0938 \u092A\u0924\u094D\u0930\u0964",
    highlights_en: ["Ward Birth Certificate", "Transfer Certificate (TC)", "3 Passport Photos"],
    highlights_np: ["\u091C\u0928\u094D\u092E\u0926\u0930\u094D\u0924\u093E \u092A\u094D\u0930\u092E\u093E\u0923\u092A\u0924\u094D\u0930", "\u0938\u094D\u0925\u093E\u0928\u093E\u0928\u094D\u0924\u0930\u0923 \u092A\u094D\u0930\u092E\u093E\u0923\u092A\u0924\u094D\u0930 (TC)", "\u0969 \u092A\u094D\u0930\u0924\u093F \u092B\u094B\u091F\u094B"],
    display_order: 2,
    status: "published",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z"
  },
  {
    id: "faq-adm-3",
    category: "admissions",
    question_en: "Is there an entrance examination for new students?",
    question_np: "\u0915\u0947 \u0928\u092F\u093E\u0901 \u0935\u093F\u0926\u094D\u092F\u093E\u0930\u094D\u0925\u0940\u0939\u0930\u0942\u0915\u093E \u0932\u093E\u0917\u093F \u092A\u094D\u0930\u0935\u0947\u0936 \u092A\u0930\u0940\u0915\u094D\u0937\u093E \u0932\u093F\u0907\u0928\u094D\u091B?",
    answer_en: "For basic grades (ECD to Grade 8), a simple diagnostic assessment is conducted solely to gauge baseline reading and numeracy for personalized support. For Grade 11 (+2) admissions, entrance tests and merit rankings are evaluated based on SEE GPA standards mandated by the National Examination Board (NEB).",
    answer_np: "\u0906\u0927\u093E\u0930\u092D\u0942\u0924 \u0924\u0939 (ECD \u0926\u0947\u0916\u093F \u0915\u0915\u094D\u0937\u093E \u096E \u0938\u092E\u094D\u092E) \u0915\u093E \u0935\u093F\u0926\u094D\u092F\u093E\u0930\u094D\u0925\u0940\u0939\u0930\u0942\u0915\u093E \u0932\u093E\u0917\u093F \u0915\u0941\u0928\u0948 \u0926\u092C\u093E\u092C\u092A\u0942\u0930\u094D\u0923 \u092A\u0930\u0940\u0915\u094D\u0937\u093E \u0928\u092D\u0908 \u0909\u0928\u0940\u0939\u0930\u0942\u0915\u094B \u0938\u093F\u0915\u093E\u0907 \u0938\u094D\u0924\u0930 \u092A\u0939\u093F\u091A\u093E\u0928 \u0917\u0930\u094D\u0928 \u0938\u093E\u092E\u093E\u0928\u094D\u092F \u092E\u0942\u0932\u094D\u092F\u093E\u0919\u094D\u0915\u0928 \u092E\u093E\u0924\u094D\u0930 \u0917\u0930\u093F\u0928\u094D\u091B\u0964 \u0915\u0915\u094D\u0937\u093E \u0967\u0967 (+\u0968) \u092D\u0930\u094D\u0928\u093E\u0915\u093E \u0932\u093E\u0917\u093F \u092D\u0928\u0947 \u090F\u0938\u0908\u0908 (SEE) \u0915\u094B \u091C\u0940\u092A\u0940\u090F \u0930 \u0930\u093E\u0937\u094D\u091F\u094D\u0930\u093F\u092F \u092A\u0930\u0940\u0915\u094D\u0937\u093E \u092C\u094B\u0930\u094D\u0921 (NEB) \u0915\u094B \u092E\u093E\u092A\u0926\u0923\u094D\u0921 \u0905\u0928\u0941\u0938\u093E\u0930 \u091B\u0928\u094B\u091F \u0917\u0930\u093F\u0928\u094D\u091B\u0964",
    highlights_en: ["Baseline diagnostic for basic grades", "SEE GPA merit for Grade 11"],
    highlights_np: ["\u0938\u093E\u092E\u093E\u0928\u094D\u092F \u0938\u093F\u0915\u093E\u0907 \u092A\u0939\u093F\u091A\u093E\u0928", "\u0915\u0915\u094D\u0937\u093E \u0967\u0967 \u0915\u093E \u0932\u093E\u0917\u093F SEE GPA \u092E\u093E\u092A\u0926\u0923\u094D\u0921"],
    display_order: 3,
    status: "published",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z"
  },
  // 2. Academics
  {
    id: "faq-acad-1",
    category: "academics",
    question_en: "What programs and academic streams are offered in Grades 11 and 12 (+2)?",
    question_np: "\u0915\u0915\u094D\u0937\u093E \u0967\u0967 \u0930 \u0967\u0968 (+\u0968) \u092E\u093E \u0915\u0941\u0928-\u0915\u0941\u0928 \u0938\u0902\u0915\u093E\u092F \u0930 \u0935\u093F\u0937\u092F\u0939\u0930\u0942 \u0909\u092A\u0932\u092C\u094D\u0927 \u091B\u0928\u094D?",
    answer_en: "Ishwari Secondary School offers National Examination Board (NEB) affiliated higher secondary programs in Management, Education, Humanities, and General Science. All courses strictly follow the updated curriculum by the Curriculum Development Centre (CDC) with integrated practical laboratory hours.",
    answer_np: "\u0908\u0936\u094D\u0935\u0930\u0940 \u092E\u093E\u0927\u094D\u092F\u092E\u093F\u0915 \u0935\u093F\u0926\u094D\u092F\u093E\u0932\u092F\u092E\u093E \u0930\u093E\u0937\u094D\u091F\u094D\u0930\u093F\u092F \u092A\u0930\u0940\u0915\u094D\u0937\u093E \u092C\u094B\u0930\u094D\u0921 (NEB) \u092C\u093E\u091F \u0938\u092E\u094D\u092C\u0928\u094D\u0927\u0928 \u092A\u094D\u0930\u093E\u092A\u094D\u0924 \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E\u092A\u0928 (Management), \u0936\u093F\u0915\u094D\u0937\u093E (Education), \u092E\u093E\u0928\u0935\u093F\u0915\u0940 (Humanities), \u0930 \u0935\u093F\u091C\u094D\u091E\u093E\u0928 (Science) \u0938\u0902\u0915\u093E\u092F\u0939\u0930\u0942 \u0938\u091E\u094D\u091A\u093E\u0932\u0928\u092E\u093E \u091B\u0928\u094D\u0964 \u092F\u0940 \u0938\u092C\u0948 \u0915\u093E\u0930\u094D\u092F\u0915\u094D\u0930\u092E\u0939\u0930\u0942 \u092A\u093E\u0920\u094D\u092F\u0915\u094D\u0930\u092E \u0935\u093F\u0915\u093E\u0938 \u0915\u0947\u0928\u094D\u0926\u094D\u0930\u0915\u094B \u0906\u0927\u0941\u0928\u093F\u0915 \u092A\u093E\u0920\u094D\u092F\u0915\u094D\u0930\u092E \u0930 \u092A\u094D\u0930\u092F\u094B\u0917\u093E\u0924\u094D\u092E\u0915 \u0905\u092D\u094D\u092F\u093E\u0938 \u0938\u0939\u093F\u0924 \u0905\u0927\u094D\u092F\u093E\u092A\u0928 \u0917\u0930\u093E\u0907\u0928\u094D\u091B\u0964",
    highlights_en: ["Management, Education, Humanities, Science", "Integrated Laboratory Hours"],
    highlights_np: ["\u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E\u092A\u0928, \u0936\u093F\u0915\u094D\u0937\u093E, \u092E\u093E\u0928\u0935\u093F\u0915\u0940, \u0935\u093F\u091C\u094D\u091E\u093E\u0928", "\u092A\u094D\u0930\u092F\u094B\u0917\u093E\u0924\u094D\u092E\u0915 \u0932\u094D\u092F\u093E\u092C \u0905\u092D\u094D\u092F\u093E\u0938"],
    display_order: 4,
    status: "published",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z"
  },
  {
    id: "faq-acad-2",
    category: "academics",
    question_en: "What is the medium of instruction at Ishwari Secondary School?",
    question_np: "\u0935\u093F\u0926\u094D\u092F\u093E\u0932\u092F\u092E\u093E \u092A\u0920\u0928\u092A\u093E\u0920\u0928 \u0915\u0941\u0928 \u092E\u093E\u0927\u094D\u092F\u092E\u092E\u093E \u0939\u0941\u0928\u094D\u091B (\u0928\u0947\u092A\u093E\u0932\u0940 \u0935\u093E \u0905\u0919\u094D\u0917\u094D\u0930\u0947\u091C\u0940)?",
    answer_en: "We run a dual-medium pedagogical model. English Medium Instruction (EMI) is integrated across selected sections and foundation grades, alongside standard Nepali medium classes, ensuring students master both modern global English and core national literature.",
    answer_np: "\u0939\u093E\u092E\u0940\u0932\u0947 \u0926\u094D\u0935\u0948\u0927 \u092E\u093E\u0927\u094D\u092F\u092E (Bilingual) \u0905\u092D\u094D\u092F\u093E\u0938 \u0917\u0930\u0947\u0915\u093E \u091B\u094C\u0901\u0964 \u0906\u0927\u0941\u0928\u093F\u0915 \u092F\u0941\u0917\u0915\u094B \u0906\u0935\u0936\u094D\u092F\u0915\u0924\u093E\u0932\u093E\u0908 \u0926\u0943\u0937\u094D\u091F\u093F\u0917\u0924 \u0917\u0930\u094D\u0926\u0948 \u0905\u0919\u094D\u0917\u094D\u0930\u0947\u091C\u0940 \u092E\u093E\u0927\u094D\u092F\u092E (EMI) \u0915\u093E \u0938\u092E\u093E\u0928\u093E\u0928\u094D\u0924\u0930 \u0915\u0915\u094D\u0937\u093E\u0939\u0930\u0942 \u0924\u0925\u093E \u092A\u0930\u092E\u094D\u092A\u0930\u093E\u0917\u0924 \u0928\u0947\u092A\u093E\u0932\u0940 \u092E\u093E\u0927\u094D\u092F\u092E \u0926\u0941\u0935\u0948\u092E\u093E \u0926\u0915\u094D\u0937 \u0936\u093F\u0915\u094D\u0937\u0915\u0939\u0930\u0942\u092C\u093E\u091F \u0917\u0941\u0923\u0938\u094D\u0924\u0930\u0940\u092F \u092A\u0920\u0928\u092A\u093E\u0920\u0928 \u0938\u091E\u094D\u091A\u093E\u0932\u0928 \u0917\u0930\u093F\u0928\u094D\u091B\u0964",
    highlights_en: ["English Medium Instruction (EMI)", "Bilingual dual-medium structure"],
    highlights_np: ["\u0905\u0919\u094D\u0917\u094D\u0930\u0947\u091C\u0940 \u092E\u093E\u0927\u094D\u092F\u092E (EMI) \u0938\u0941\u0935\u093F\u0927\u093E", "\u0926\u094D\u0935\u0948\u0927 \u092E\u093E\u0927\u094D\u092F\u092E \u092A\u094D\u0930\u0923\u093E\u0932\u0940"],
    display_order: 5,
    status: "published",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z"
  },
  {
    id: "faq-acad-3",
    category: "academics",
    question_en: "How are student progress and term examinations evaluated?",
    question_np: "\u0935\u093F\u0926\u094D\u092F\u093E\u0930\u094D\u0925\u0940\u0939\u0930\u0942\u0915\u094B \u092A\u0930\u0940\u0915\u094D\u0937\u093E \u0930 \u0936\u0948\u0915\u094D\u0937\u093F\u0915 \u092E\u0942\u0932\u094D\u092F\u093E\u0919\u094D\u0915\u0928 \u0915\u0938\u0930\u0940 \u0917\u0930\u093F\u0928\u094D\u091B?",
    answer_en: "In line with CDC guidelines, student assessment combines continuous internal evaluation (classroom engagement, project works, assignments, attendance - 25% to 50%) and terminal written examinations (First Term, Mid-Term, and Pre-Board/Final Examination).",
    answer_np: "\u092A\u093E\u0920\u094D\u092F\u0915\u094D\u0930\u092E \u0935\u093F\u0915\u093E\u0938 \u0915\u0947\u0928\u094D\u0926\u094D\u0930\u0915\u094B \u092E\u093E\u092A\u0926\u0923\u094D\u0921 \u0905\u0928\u0941\u0938\u093E\u0930 \u0928\u093F\u0930\u0928\u094D\u0924\u0930 \u0935\u093F\u0926\u094D\u092F\u093E\u0930\u094D\u0925\u0940 \u092E\u0942\u0932\u094D\u092F\u093E\u0919\u094D\u0915\u0928 (\u0915\u0915\u094D\u0937\u093E\u0915\u093E\u0930\u094D\u092F, \u092A\u0930\u093F\u092F\u094B\u091C\u0928\u093E \u0915\u093E\u0930\u094D\u092F, \u0928\u093F\u092F\u092E\u093F\u0924\u0924\u093E \u0924\u0925\u093E \u0905\u0928\u0941\u0936\u093E\u0938\u0928) \u0930 \u0924\u094D\u0930\u0948\u092E\u093E\u0938\u093F\u0915 \u0906\u0935\u0927\u093F\u0915 \u092A\u0930\u0940\u0915\u094D\u0937\u093E\u0939\u0930\u0942 (\u092A\u094D\u0930\u0925\u092E, \u0926\u094B\u0938\u094D\u0930\u094B \u0930 \u0935\u093E\u0930\u094D\u0937\u093F\u0915/\u092B\u093E\u0907\u0928\u0932) \u0915\u094B \u0938\u0902\u092F\u0941\u0915\u094D\u0924 \u092E\u0942\u0932\u094D\u092F\u093E\u0919\u094D\u0915\u0928 \u0917\u0930\u093F\u0928\u094D\u091B\u0964",
    highlights_en: ["Continuous Formative Assessment", "Terminal & Annual Examinations"],
    highlights_np: ["\u0928\u093F\u0930\u0928\u094D\u0924\u0930 \u0906\u0928\u094D\u0924\u0930\u093F\u0915 \u092E\u0942\u0932\u094D\u092F\u093E\u0919\u094D\u0915\u0928", "\u0924\u094D\u0930\u0948\u092E\u093E\u0938\u093F\u0915 \u0924\u0925\u093E \u0935\u093E\u0930\u094D\u0937\u093F\u0915 \u092A\u0930\u0940\u0915\u094D\u0937\u093E"],
    display_order: 6,
    status: "published",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z"
  },
  // 3. Scholarships & Fees
  {
    id: "faq-fee-1",
    category: "scholarships",
    question_en: "Does the school charge tuition fees for basic education (Grades 1-8)?",
    question_np: "\u0915\u0947 \u0906\u0927\u093E\u0930\u092D\u0942\u0924 \u0924\u0939 (\u0915\u0915\u094D\u0937\u093E \u0967 \u0926\u0947\u0916\u093F \u096E) \u092E\u093E \u0915\u0941\u0928\u0948 \u092E\u093E\u0938\u093F\u0915 \u0936\u0941\u0932\u094D\u0915 \u0932\u093E\u0917\u094D\u091B?",
    answer_en: "No. In full compliance with the Constitution of Nepal and Baijanath Rural Municipality public education mandates, education from Early Childhood Development (ECD) through Grade 8 is completely tuition-free.",
    answer_np: "\u0928\u093E\u0907\u0901, \u0932\u093E\u0917\u094D\u0926\u0948\u0928\u0964 \u0928\u0947\u092A\u093E\u0932\u0915\u094B \u0938\u0902\u0935\u093F\u0927\u093E\u0928 \u0930 \u092C\u0948\u091C\u0928\u093E\u0925 \u0917\u093E\u0909\u0901\u092A\u093E\u0932\u093F\u0915\u093E\u0915\u094B \u0936\u093F\u0915\u094D\u0937\u093E \u0928\u0940\u0924\u093F \u092C\u092E\u094B\u091C\u093F\u092E \u092A\u094D\u0930\u093E\u0930\u092E\u094D\u092D\u093F\u0915 \u092C\u093E\u0932\u0935\u093F\u0915\u093E\u0938 (ECD) \u0926\u0947\u0916\u093F \u0915\u0915\u094D\u0937\u093E \u096E \u0938\u092E\u094D\u092E\u0915\u094B \u0906\u0927\u093E\u0930\u092D\u0942\u0924 \u0936\u093F\u0915\u094D\u0937\u093E \u092A\u0942\u0930\u094D\u0923\u0924\u092F\u093E \u0928\u093F\u0903\u0936\u0941\u0932\u094D\u0915 \u092A\u094D\u0930\u0926\u093E\u0928 \u0917\u0930\u093F\u0928\u094D\u091B\u0964",
    highlights_en: ["100% Free basic education", "Complies with constitutional rights"],
    highlights_np: ["\u0915\u0915\u094D\u0937\u093E \u0967-\u096E \u0938\u092E\u094D\u092E \u092A\u0942\u0930\u094D\u0923 \u0928\u093F\u0903\u0936\u0941\u0932\u094D\u0915", "\u0938\u0902\u0935\u0948\u0927\u093E\u0928\u093F\u0915 \u0905\u0927\u093F\u0915\u093E\u0930 \u0938\u0941\u0928\u093F\u0936\u094D\u091A\u093F\u0924"],
    display_order: 7,
    status: "published",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z"
  },
  {
    id: "faq-fee-2",
    category: "scholarships",
    question_en: "What scholarship schemes are available for students?",
    question_np: "\u0935\u093F\u0926\u094D\u092F\u093E\u0930\u094D\u0925\u0940\u0939\u0930\u0942\u0915\u093E \u0932\u093E\u0917\u093F \u0915\u0947-\u0915\u0938\u094D\u0924\u093E \u091B\u093E\u0924\u094D\u0930\u0935\u0943\u0924\u094D\u0924\u093F \u092F\u094B\u091C\u0928\u093E\u0939\u0930\u0942 \u0909\u092A\u0932\u092C\u094D\u0927 \u091B\u0928\u094D?",
    answer_en: "We administer multiple welfare and merit programs: (1) Government Dalit, Janajati & Girls National Scholarships, (2) Poverty-targeted student stipends, (3) SMC Merit Awards for academic top rankers in annual exams, and (4) Special support for orphans and differently-abled learners.",
    answer_np: "\u0939\u093E\u092E\u0940\u0932\u0947 \u0935\u093F\u092D\u093F\u0928\u094D\u0928 \u091B\u093E\u0924\u094D\u0930\u0935\u0943\u0924\u094D\u0924\u093F \u092A\u094D\u0930\u0926\u093E\u0928 \u0917\u0930\u094D\u0926\u091B\u094C\u0901: (\u0967) \u0928\u0947\u092A\u093E\u0932 \u0938\u0930\u0915\u093E\u0930\u0915\u094B \u0926\u0932\u093F\u0924, \u091C\u0928\u091C\u093E\u0924\u093F \u0924\u0925\u093E \u091B\u093E\u0924\u094D\u0930\u093E \u0930\u093E\u0937\u094D\u091F\u094D\u0930\u093F\u092F \u091B\u093E\u0924\u094D\u0930\u0935\u0943\u0924\u094D\u0924\u093F, (\u0968) \u0917\u0930\u093F\u092C \u0924\u0925\u093E \u0935\u093F\u092A\u0928\u094D\u0928 \u0932\u0915\u094D\u0937\u093F\u0924 \u091B\u093E\u0924\u094D\u0930\u0935\u0943\u0924\u094D\u0924\u093F, (\u0969) \u0935\u093F\u0926\u094D\u092F\u093E\u0932\u092F \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E\u092A\u0928 \u0938\u092E\u093F\u0924\u093F (SMC) \u091C\u0947\u0939\u0947\u0928\u094D\u0926\u093E\u0930 \u091B\u093E\u0924\u094D\u0930\u0935\u0943\u0924\u094D\u0924\u093F (\u0915\u0915\u094D\u0937\u093E \u092A\u094D\u0930\u0925\u092E/\u0926\u094B\u0938\u094D\u0930\u094B), \u0930 (\u096A) \u092B\u0930\u0915 \u0915\u094D\u0937\u092E\u0924\u093E \u0924\u0925\u093E \u0905\u0938\u0939\u093E\u092F \u092C\u093E\u0932\u092C\u093E\u0932\u093F\u0915\u093E \u0935\u093F\u0936\u0947\u0937 \u0938\u0939\u092F\u094B\u0917\u0964",
    highlights_en: ["Government National Quota", "SMC Merit Scholarships", "Disability & Orphan Support"],
    highlights_np: ["\u0938\u0930\u0915\u093E\u0930\u0940 \u0930\u093E\u0937\u094D\u091F\u094D\u0930\u093F\u092F \u091B\u093E\u0924\u094D\u0930\u0935\u0943\u0924\u094D\u0924\u093F", "\u091C\u0947\u0939\u0947\u0928\u094D\u0926\u093E\u0930 \u0909\u0924\u094D\u0915\u0943\u0937\u094D\u091F \u092A\u0941\u0930\u0938\u094D\u0915\u093E\u0930", "\u0935\u093F\u092A\u0928\u094D\u0928 \u0924\u0925\u093E \u0905\u0938\u0939\u093E\u092F \u0938\u0939\u093E\u092F\u0924\u093E"],
    display_order: 8,
    status: "published",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z"
  },
  {
    id: "faq-fee-3",
    category: "scholarships",
    question_en: "Are school textbooks provided free of charge?",
    question_np: "\u0915\u0947 \u0938\u092C\u0948 \u0935\u093F\u0926\u094D\u092F\u093E\u0930\u094D\u0925\u0940\u0939\u0930\u0942\u0932\u0947 \u0928\u093F\u0903\u0936\u0941\u0932\u094D\u0915 \u092A\u093E\u0920\u094D\u092F\u092A\u0941\u0938\u094D\u0924\u0915 \u092A\u093E\u0909\u0901\u091B\u0928\u094D?",
    answer_en: "Yes. Every enrolled student from Grade 1 through Grade 10 receives complete sets of government-authorized textbooks 100% free of charge on the first week of the academic year.",
    answer_np: "\u0939\u094B, \u0915\u0915\u094D\u0937\u093E \u0967 \u0926\u0947\u0916\u093F \u0915\u0915\u094D\u0937\u093E \u0967\u0966 \u0938\u092E\u094D\u092E\u0915\u093E \u0938\u092C\u0948 \u092D\u0930\u094D\u0928\u093E \u092D\u090F\u0915\u093E \u0935\u093F\u0926\u094D\u092F\u093E\u0930\u094D\u0925\u0940\u0939\u0930\u0942\u0932\u093E\u0908 \u0936\u0948\u0915\u094D\u0937\u093F\u0915 \u0938\u0924\u094D\u0930\u0915\u094B \u092A\u094D\u0930\u093E\u0930\u092E\u094D\u092D\u092E\u0948 \u0928\u0947\u092A\u093E\u0932 \u0938\u0930\u0915\u093E\u0930\u0926\u094D\u0935\u093E\u0930\u093E \u0938\u094D\u0935\u0940\u0915\u0943\u0924 \u092A\u0942\u0930\u094D\u0923 \u0938\u0947\u091F \u092A\u093E\u0920\u094D\u092F\u092A\u0941\u0938\u094D\u0924\u0915\u0939\u0930\u0942 \u0967\u0966\u0966% \u0928\u093F\u0903\u0936\u0941\u0932\u094D\u0915 \u0935\u093F\u0924\u0930\u0923 \u0917\u0930\u093F\u0928\u094D\u091B\u0964",
    highlights_en: ["Free textbook sets (Grades 1-10)", "Distributed in Baisakh"],
    highlights_np: ["\u0915\u0915\u094D\u0937\u093E \u0967-\u0967\u0966 \u0938\u092E\u094D\u092E \u0928\u093F\u0903\u0936\u0941\u0932\u094D\u0915 \u092A\u0941\u0938\u094D\u0924\u0915", "\u0938\u0924\u094D\u0930\u0915\u094B \u0938\u0941\u0930\u0941\u0935\u093E\u0924\u092E\u0948 \u0935\u093F\u0924\u0930\u0923"],
    display_order: 9,
    status: "published",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z"
  },
  // 4. Facilities & Nutrition
  {
    id: "faq-fac-1",
    category: "facilities",
    question_en: "What science, computer, and ICT facilities does the school have?",
    question_np: "\u0935\u093F\u0926\u094D\u092F\u093E\u0932\u092F\u092E\u093E \u0935\u093F\u091C\u094D\u091E\u093E\u0928, \u0915\u092E\u094D\u092A\u094D\u092F\u0941\u091F\u0930 \u0930 \u092A\u094D\u0930\u0935\u093F\u0927\u093F \u092A\u094D\u0930\u092F\u094B\u0917\u0936\u093E\u0932\u093E \u0915\u0938\u094D\u0924\u094B \u091B?",
    answer_en: "Our campus is equipped with a modern Science Laboratory (Physics, Chemistry, and Biology equipment), a 25-seat networked Computer Lab with broadband internet connectivity, multimedia smart digital projection classrooms, and a well-curated community reference library.",
    answer_np: "\u0935\u093F\u0926\u094D\u092F\u093E\u0932\u092F \u092A\u0930\u093F\u0938\u0930\u092E\u093E \u092D\u094C\u0924\u093F\u0915, \u0930\u0938\u093E\u092F\u0928 \u0930 \u091C\u0940\u0935\u0935\u093F\u091C\u094D\u091E\u093E\u0928\u0915\u093E \u0906\u0927\u0941\u0928\u093F\u0915 \u0909\u092A\u0915\u0930\u0923 \u0938\u0939\u093F\u0924\u0915\u094B \u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u092A\u094D\u0930\u092F\u094B\u0917\u0936\u093E\u0932\u093E, \u0968\u096B \u0925\u093E\u0928 \u0915\u092E\u094D\u092A\u094D\u092F\u0941\u091F\u0930 \u0930 \u0924\u0940\u0935\u094D\u0930 \u0917\u0924\u093F\u0915\u094B \u0907\u0928\u094D\u091F\u0930\u0928\u0947\u091F \u091C\u0921\u093E\u0928 \u092D\u090F\u0915\u094B \u0915\u092E\u094D\u092A\u094D\u092F\u0941\u091F\u0930 \u0924\u0925\u093E \u0906\u0908\u0938\u0940\u091F\u0940 \u0932\u094D\u092F\u093E\u092C, \u0938\u094D\u092E\u093E\u0930\u094D\u091F \u0921\u093F\u091C\u093F\u091F\u0932 \u092A\u094D\u0930\u094B\u091C\u0947\u0915\u094D\u091F\u0930 \u0915\u0915\u094D\u0937\u093E\u0915\u094B\u0920\u093E \u0930 \u0935\u093F\u0936\u093E\u0932 \u092A\u0941\u0938\u094D\u0924\u0915\u093E\u0932\u092F \u0938\u091E\u094D\u091A\u093E\u0932\u0928\u092E\u093E \u091B\u0928\u094D\u0964",
    highlights_en: ["Science Lab (Physics/Chem/Bio)", "25-Seat High-Speed Computer Lab", "Smart Classrooms"],
    highlights_np: ["\u0938\u0941\u0938\u091C\u094D\u091C\u093F\u0924 \u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u092A\u094D\u0930\u092F\u094B\u0917\u0936\u093E\u0932\u093E", "\u0968\u096B \u0938\u093F\u091F\u0915\u094B \u0915\u092E\u094D\u092A\u094D\u092F\u0941\u091F\u0930 \u0932\u094D\u092F\u093E\u092C", "\u0938\u094D\u092E\u093E\u0930\u094D\u091F \u0921\u093F\u091C\u093F\u091F\u0932 \u0915\u0915\u094D\u0937\u093E\u0915\u094B\u0920\u093E"],
    display_order: 10,
    status: "published",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z"
  },
  {
    id: "faq-fac-2",
    category: "facilities",
    question_en: "Is the midday meal (\u0926\u093F\u0935\u093E \u0916\u093E\u091C\u093E) program provided for students?",
    question_np: "\u0915\u0947 \u0935\u093F\u0926\u094D\u092F\u093E\u0932\u092F\u092E\u093E \u0935\u093F\u0926\u094D\u092F\u093E\u0930\u094D\u0925\u0940\u0939\u0930\u0942\u0915\u093E \u0932\u093E\u0917\u093F \u0926\u093F\u0935\u093E \u0916\u093E\u091C\u093E\u0915\u094B \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E \u091B?",
    answer_en: "Yes. Under the National School Midday Meal Program, hot, hygienic, and nutritious meals prepared using locally sourced, fresh ingredients are served daily to all students from Early Childhood Development (ECD) up to Grade 5.",
    answer_np: "\u0939\u094B, \u0928\u0947\u092A\u093E\u0932 \u0938\u0930\u0915\u093E\u0930\u0915\u094B \u0926\u093F\u0935\u093E \u0916\u093E\u091C\u093E \u0915\u093E\u0930\u094D\u092F\u0915\u094D\u0930\u092E \u0905\u0928\u094D\u0924\u0930\u094D\u0917\u0924 \u092A\u094D\u0930\u093E\u0930\u092E\u094D\u092D\u093F\u0915 \u092C\u093E\u0932\u0935\u093F\u0915\u093E\u0938 (ECD) \u0926\u0947\u0916\u093F \u0915\u0915\u094D\u0937\u093E \u096B \u0938\u092E\u094D\u092E\u0915\u093E \u0938\u092E\u094D\u092A\u0942\u0930\u094D\u0923 \u0935\u093F\u0926\u094D\u092F\u093E\u0930\u094D\u0925\u0940\u0939\u0930\u0942\u0932\u093E\u0908 \u0935\u093F\u0926\u094D\u092F\u093E\u0932\u092F\u0915\u094B \u0906\u092B\u094D\u0928\u0948 \u092D\u093E\u0928\u094D\u0938\u093E\u092E\u093E \u0924\u093E\u091C\u093E \u0930 \u0938\u094D\u0925\u093E\u0928\u0940\u092F \u092A\u094B\u0937\u0923\u092F\u0941\u0915\u094D\u0924 \u092A\u0930\u093F\u0915\u093E\u0930 \u092C\u0928\u093E\u090F\u0930 \u0926\u0948\u0928\u093F\u0915 \u0926\u093F\u0935\u093E \u0916\u093E\u091C\u093E \u0916\u0941\u0935\u093E\u0907\u0928\u094D\u091B\u0964",
    highlights_en: ["ECD to Grade 5 covered", "Fresh, locally sourced nutrition daily"],
    highlights_np: ["ECD \u0926\u0947\u0916\u093F \u0915\u0915\u094D\u0937\u093E \u096B \u0938\u092E\u094D\u092E", "\u0926\u0948\u0928\u093F\u0915 \u0924\u093E\u091C\u093E \u0930 \u092A\u094B\u0937\u0923\u092F\u0941\u0915\u094D\u0924 \u0916\u093E\u091C\u093E"],
    display_order: 11,
    status: "published",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z"
  },
  {
    id: "faq-fac-3",
    category: "facilities",
    question_en: "What sports and extracurricular activities (ECA) are organized?",
    question_np: "\u0916\u0947\u0932\u0915\u0941\u0926 \u0924\u0925\u093E \u0905\u0924\u093F\u0930\u093F\u0915\u094D\u0924 \u0915\u094D\u0930\u093F\u092F\u093E\u0915\u0932\u093E\u092A (ECA) \u0915\u094B \u0915\u0938\u094D\u0924\u094B \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E \u091B?",
    answer_en: "Ishwari Secondary School promotes holistic wellness through regular football, volleyball, athletics, cricket, and badminton tournaments on our sports grounds. Every Friday is dedicated to co-curricular activities including debates, quiz contests, music, and junior red-cross / scout programs.",
    answer_np: "\u0935\u093F\u0926\u094D\u092F\u093E\u0930\u094D\u0925\u0940\u0915\u094B \u091A\u094C\u0924\u0930\u094D\u092B\u0940 \u0935\u093F\u0915\u093E\u0938\u0915\u093E \u0932\u093E\u0917\u093F \u0916\u0947\u0932\u092E\u0948\u0926\u093E\u0928\u092E\u093E \u092B\u0941\u091F\u092C\u0932, \u092D\u0932\u093F\u092C\u0932, \u090F\u0925\u0932\u0947\u091F\u093F\u0915\u094D\u0938, \u0915\u094D\u0930\u093F\u0915\u0947\u091F \u0930 \u092C\u094D\u092F\u093E\u0921\u092E\u093F\u0928\u094D\u091F\u0928 \u0905\u092D\u094D\u092F\u093E\u0938 \u0917\u0930\u093E\u0907\u0928\u094D\u091B\u0964 \u092A\u094D\u0930\u0924\u094D\u092F\u0947\u0915 \u0936\u0941\u0915\u094D\u0930\u092C\u093E\u0930 \u0935\u0915\u094D\u0924\u0943\u0924\u094D\u0935\u0915\u0932\u093E, \u0939\u093E\u091C\u093F\u0930\u0940\u091C\u0935\u093E\u092B, \u091A\u093F\u0924\u094D\u0930\u0915\u0932\u093E, \u0938\u093E\u0902\u0938\u094D\u0915\u0943\u0924\u093F\u0915 \u0928\u0943\u0924\u094D\u092F, \u092C\u093E\u0932 \u0915\u094D\u0932\u092C \u0924\u0925\u093E \u0938\u094D\u0915\u093E\u0909\u091F/\u0930\u0947\u0921\u0915\u094D\u0930\u0938\u0915\u093E \u0905\u0924\u093F\u0930\u093F\u0915\u094D\u0924 \u0915\u094D\u0930\u093F\u092F\u093E\u0915\u0932\u093E\u092A \u0938\u091E\u094D\u091A\u093E\u0932\u0928 \u0939\u0941\u0928\u094D\u091B\u0928\u094D\u0964",
    highlights_en: ["Football, Volleyball & Cricket Grounds", "Friday Co-Curricular Competitions"],
    highlights_np: ["\u092B\u0941\u091F\u092C\u0932 \u0930 \u092D\u0932\u093F\u092C\u0932 \u092E\u0948\u0926\u093E\u0928", "\u0936\u0941\u0915\u094D\u0930\u092C\u093E\u0930 \u0905\u0924\u093F\u0930\u093F\u0915\u094D\u0924 \u0915\u094D\u0930\u093F\u092F\u093E\u0915\u0932\u093E\u092A"],
    display_order: 12,
    status: "published",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z"
  },
  // 5. Discipline & Governance
  {
    id: "faq-disc-1",
    category: "discipline",
    question_en: "What are the daily school hours and bell schedules?",
    question_np: "\u0935\u093F\u0926\u094D\u092F\u093E\u0932\u092F \u0938\u091E\u094D\u091A\u093E\u0932\u0928 \u0939\u0941\u0928\u0947 \u0926\u0948\u0928\u093F\u0915 \u0938\u092E\u092F \u0924\u093E\u0932\u093F\u0915\u093E \u0915\u0938\u094D\u0924\u094B \u091B?",
    answer_en: "Regular school hours run Sunday through Thursday from 10:00 AM to 4:00 PM, and on Friday from 10:00 AM to 1:30 PM (followed by sports and club events). The morning assembly begins promptly at 9:45 AM. During severe winter fog or monsoon events, timing adjustments follow municipal directives.",
    answer_np: "\u0906\u0907\u0924\u092C\u093E\u0930\u0926\u0947\u0916\u093F \u092C\u093F\u0939\u0940\u092C\u093E\u0930\u0938\u092E\u094D\u092E \u092C\u093F\u0939\u093E\u0928 \u0967\u0966:\u0966\u0966 \u092C\u091C\u0947\u0926\u0947\u0916\u093F \u0905\u092A\u0930\u093E\u0939\u094D\u0928 \u096A:\u0966\u0966 \u092C\u091C\u0947\u0938\u092E\u094D\u092E \u0930 \u0936\u0941\u0915\u094D\u0930\u092C\u093E\u0930 \u092C\u093F\u0939\u093E\u0928 \u0967\u0966:\u0966\u0966 \u0926\u0947\u0916\u093F \u0926\u093F\u0909\u0901\u0938\u094B \u0967:\u0969\u0966 \u0938\u092E\u094D\u092E \u0928\u093F\u092F\u092E\u093F\u0924 \u092A\u0920\u0928\u092A\u093E\u0920\u0928 \u0939\u0941\u0928\u094D\u091B (\u0924\u094D\u092F\u0938\u092A\u091B\u093F \u0916\u0947\u0932\u0915\u0941\u0926 \u0930 \u0938\u0926\u0928 \u0915\u094D\u0930\u093F\u092F\u093E\u0915\u0932\u093E\u092A)\u0964 \u092C\u093F\u0939\u093E\u0928 \u096F:\u096A\u096B \u092C\u091C\u0947 \u0905\u0928\u093F\u0935\u093E\u0930\u094D\u092F \u092A\u094D\u0930\u093E\u0930\u094D\u0925\u0928\u093E \u0938\u092D\u093E \u0939\u0941\u0928\u094D\u091B\u0964",
    highlights_en: ["Sun-Thu: 10:00 AM - 4:00 PM", "Fri: 10:00 AM - 1:30 PM (ECA)", "Assembly: 9:45 AM"],
    highlights_np: ["\u0906\u0907\u0924-\u092C\u093F\u0939\u0940: \u092C\u093F\u0939\u093E\u0928 \u0967\u0966 \u0926\u0947\u0916\u093F \u096A \u092C\u091C\u0947", "\u0936\u0941\u0915\u094D\u0930: \u092C\u093F\u0939\u093E\u0928 \u0967\u0966 \u0926\u0947\u0916\u093F \u0967:\u0969\u0966 \u092C\u091C\u0947", "\u092A\u094D\u0930\u093E\u0930\u094D\u0925\u0928\u093E \u0938\u092D\u093E: \u096F:\u096A\u096B \u092C\u091C\u0947"],
    display_order: 13,
    status: "published",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z"
  },
  {
    id: "faq-disc-2",
    category: "discipline",
    question_en: "How can parents stay informed about student attendance and academic progress?",
    question_np: "\u0905\u092D\u093F\u092D\u093E\u0935\u0915\u0939\u0930\u0942\u0932\u0947 \u092C\u093E\u0932\u092C\u093E\u0932\u093F\u0915\u093E\u0915\u094B \u0909\u092A\u0938\u094D\u0925\u093F\u0924\u093F \u0930 \u0936\u0948\u0915\u094D\u0937\u093F\u0915 \u092A\u094D\u0930\u0917\u0924\u093F \u0915\u0938\u0930\u0940 \u0925\u093E\u0939\u093E \u092A\u093E\u0909\u0928\u0947?",
    answer_en: "Parents receive updates through: (1) Mandatory Parent-Teacher Meetings (PTM) after each terminal exam, (2) Term report cards and academic portfolios, and (3) In-person consultation with Class Teachers and the Principal during scheduled visitor hours.",
    answer_np: "\u0905\u092D\u093F\u092D\u093E\u0935\u0915\u0939\u0930\u0942\u0932\u0947 (\u0967) \u092A\u094D\u0930\u0924\u094D\u092F\u0947\u0915 \u0924\u094D\u0930\u0948\u092E\u093E\u0938\u093F\u0915 \u092A\u0930\u0940\u0915\u094D\u0937\u093E\u092A\u091B\u093F \u0906\u092F\u094B\u091C\u0928\u093E \u0939\u0941\u0928\u0947 \u0905\u092D\u093F\u092D\u093E\u0935\u0915-\u0936\u093F\u0915\u094D\u0937\u0915 \u092D\u0947\u0932\u093E (PTM), (\u0968) \u0935\u093F\u0926\u094D\u092F\u093E\u0930\u094D\u0925\u0940 \u092A\u094D\u0930\u0917\u0924\u093F \u092A\u0924\u094D\u0930 (Report Card), \u0930 (\u0969) \u0924\u094B\u0915\u093F\u090F\u0915\u094B \u0938\u092E\u092F\u092E\u093E \u092A\u094D\u0930\u0927\u093E\u0928\u093E\u0927\u094D\u092F\u093E\u092A\u0915 \u0935\u093E \u0915\u0915\u094D\u0937\u093E \u0936\u093F\u0915\u094D\u0937\u0915\u0938\u0901\u0917\u0915\u094B \u092A\u094D\u0930\u0924\u094D\u092F\u0915\u094D\u0937 \u092D\u0947\u091F\u0918\u093E\u091F\u092E\u093E\u0930\u094D\u092B\u0924 \u0928\u093F\u092F\u092E\u093F\u0924 \u091C\u093E\u0928\u0915\u093E\u0930\u0940 \u0932\u093F\u0928 \u0938\u0915\u094D\u0928\u0941\u0939\u0941\u0928\u094D\u091B\u0964",
    highlights_en: ["Terminal Parent-Teacher Meetings (PTM)", "Quarterly Report Cards"],
    highlights_np: ["\u0924\u094D\u0930\u0948\u092E\u093E\u0938\u093F\u0915 \u0905\u092D\u093F\u092D\u093E\u0935\u0915 \u092D\u0947\u0932\u093E (PTM)", "\u0928\u093F\u092F\u092E\u093F\u0924 \u092A\u094D\u0930\u0917\u0924\u093F \u092A\u094D\u0930\u0924\u093F\u0935\u0947\u0926\u0928"],
    display_order: 14,
    status: "published",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z"
  },
  {
    id: "faq-disc-3",
    category: "discipline",
    question_en: "What is the policy regarding school uniforms and dress code?",
    question_np: "\u0935\u093F\u0926\u094D\u092F\u093E\u0932\u092F \u092A\u094B\u0938\u093E\u0915 (\u092F\u0941\u0928\u093F\u092B\u0930\u094D\u092E) \u0938\u092E\u094D\u092C\u0928\u094D\u0927\u0940 \u0915\u0947 \u0915\u0938\u094D\u0924\u094B \u0928\u093F\u092F\u092E \u091B?",
    answer_en: "All students are required to attend school in the official school uniform approved by the School Management Committee (SMC). On designated sports days, house-colored T-shirts and tracksuits are worn. Personal hygiene and disciplined grooming are expected at all times.",
    answer_np: "\u0938\u092C\u0948 \u0935\u093F\u0926\u094D\u092F\u093E\u0930\u094D\u0925\u0940\u0939\u0930\u0942\u0932\u0947 \u0935\u093F\u0926\u094D\u092F\u093E\u0932\u092F \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E\u092A\u0928 \u0938\u092E\u093F\u0924\u093F\u0932\u0947 \u0924\u094B\u0915\u0947\u0915\u094B \u0906\u0927\u093F\u0915\u093E\u0930\u093F\u0915 \u092A\u094B\u0938\u093E\u0915 \u0905\u0928\u093F\u0935\u093E\u0930\u094D\u092F \u0930\u0942\u092A\u092E\u093E \u0932\u0917\u093E\u0909\u0928\u0941\u092A\u0930\u094D\u091B\u0964 \u0916\u0947\u0932\u0915\u0941\u0926\u0915\u093E \u0926\u093F\u0928 \u0938\u0926\u0928 \u0905\u0928\u0941\u0938\u093E\u0930\u0915\u094B \u091F\u094D\u0930\u094D\u092F\u093E\u0915\u0938\u0941\u091F \u0930 \u091F\u0940-\u0938\u0930\u094D\u091F \u0932\u0917\u093E\u0909\u0928 \u0938\u0915\u093F\u0928\u0947\u091B\u0964 \u0935\u093F\u0926\u094D\u092F\u093E\u0930\u094D\u0925\u0940\u0939\u0930\u0942\u0932\u0947 \u0935\u094D\u092F\u0915\u094D\u0924\u093F\u0917\u0924 \u0938\u0930\u0938\u092B\u093E\u0907 \u0930 \u0936\u093E\u0932\u0940\u0928\u0924\u093E \u0915\u093E\u092F\u092E \u0930\u093E\u0916\u094D\u0928\u0941\u092A\u0930\u094D\u091B\u0964",
    highlights_en: ["Official SMC-approved uniform", "House tracksuit on sports days"],
    highlights_np: ["\u0924\u094B\u0915\u093F\u090F\u0915\u094B \u0906\u0927\u093F\u0915\u093E\u0930\u093F\u0915 \u092A\u094B\u0938\u093E\u0915", "\u0916\u0947\u0932\u0915\u0941\u0926\u0915\u093E \u0926\u093F\u0928 \u091F\u094D\u0930\u094D\u092F\u093E\u0915\u0938\u0941\u091F"],
    display_order: 15,
    status: "published",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z"
  }
];

// frontend/utils/security.ts
import bcrypt from "bcryptjs";
var MAIN_MENU_HIERARCHY = [
  {
    key: "menu.website",
    id: "website",
    labelEn: "Website",
    labelNp: "\u0935\u0947\u092C\u0938\u093E\u0907\u091F",
    descEn: "Public portal layout, branding, headers, navigation, and footers",
    submenus: [
      {
        key: "submenu.website_identity",
        tabId: "website_identity",
        labelEn: "Site Identity & Logo",
        labelNp: "\u092A\u0939\u093F\u091A\u093E\u0928 \u0924\u0925\u093E \u0932\u094B\u0917\u094B",
        descEn: "School branding, crest logo, EMIS code, and motto",
        actions: [
          { key: "settings.view", labelEn: "View Identity", labelNp: "\u092A\u0939\u093F\u091A\u093E\u0928 \u0939\u0947\u0930\u094D\u0928\u0941\u0939\u094B\u0938\u094D", descEn: "Can view identity settings" },
          { key: "settings.update", labelEn: "Edit Identity", labelNp: "\u092A\u0939\u093F\u091A\u093E\u0928 \u0938\u092E\u094D\u092A\u093E\u0926\u0928", descEn: "Can update logo, EMIS code, and motto" }
        ]
      },
      {
        key: "submenu.website_homepage",
        tabId: "website_homepage",
        labelEn: "Homepage Layout",
        labelNp: "\u0917\u0943\u0939\u092A\u0943\u0937\u094D\u0920 \u092C\u0928\u093E\u0935\u091F",
        descEn: "Hero slider, welcome banner, and homepage section order",
        actions: [
          { key: "settings.view", labelEn: "View Homepage Layout", labelNp: "\u0917\u0943\u0939\u092A\u0943\u0937\u094D\u0920 \u092C\u0928\u093E\u0935\u091F \u0939\u0947\u0930\u094D\u0928\u0941\u0939\u094B\u0938\u094D", descEn: "Can view homepage layout" },
          { key: "settings.update", labelEn: "Edit Homepage Layout", labelNp: "\u0917\u0943\u0939\u092A\u0943\u0937\u094D\u0920 \u092C\u0928\u093E\u0935\u091F \u0938\u092E\u094D\u092A\u093E\u0926\u0928", descEn: "Can customize hero and sections" }
        ]
      },
      {
        key: "submenu.website_header",
        tabId: "website_header",
        labelEn: "Header & Ticker",
        labelNp: "\u0939\u0947\u0921\u0930 \u0924\u0925\u093E \u0938\u0942\u091A\u0928\u093E \u092A\u091F\u094D\u091F\u0940",
        descEn: "Top bar notification ticker, hotline number, and header options",
        actions: [
          { key: "settings.view", labelEn: "View Header Settings", labelNp: "\u0939\u0947\u0921\u0930 \u0938\u0947\u091F\u093F\u0919 \u0939\u0947\u0930\u094D\u0928\u0941\u0939\u094B\u0938\u094D", descEn: "Can view header configuration" },
          { key: "settings.update", labelEn: "Edit Header Settings", labelNp: "\u0939\u0947\u0921\u0930 \u0938\u0947\u091F\u093F\u0919 \u0938\u092E\u094D\u092A\u093E\u0926\u0928", descEn: "Can customize announcement ticker and phone" }
        ]
      },
      {
        key: "submenu.website_navigation",
        tabId: "website_navigation",
        labelEn: "Navigation Menu",
        labelNp: "\u0928\u0947\u092D\u093F\u0917\u0947\u0938\u0928 \u092E\u0947\u0928\u0941",
        descEn: "Header menu links, order, and portal routing",
        actions: [
          { key: "settings.view", labelEn: "View Navigation", labelNp: "\u0928\u0947\u092D\u093F\u0917\u0947\u0938\u0928 \u0939\u0947\u0930\u094D\u0928\u0941\u0939\u094B\u0938\u094D", descEn: "Can view navigation structure" },
          { key: "settings.update", labelEn: "Edit Navigation", labelNp: "\u0928\u0947\u092D\u093F\u0917\u0947\u0938\u0928 \u0938\u092E\u094D\u092A\u093E\u0926\u0928", descEn: "Can customize public portal navigation" }
        ]
      },
      {
        key: "submenu.website_footer",
        tabId: "website_footer",
        labelEn: "Footer Settings",
        labelNp: "\u092B\u0941\u091F\u0930 \u0938\u0947\u091F\u093F\u0919",
        descEn: "Footer columns, copyright, and emergency contact coordinates",
        actions: [
          { key: "settings.view", labelEn: "View Footer Settings", labelNp: "\u092B\u0941\u091F\u0930 \u0938\u0947\u091F\u093F\u0919 \u0939\u0947\u0930\u094D\u0928\u0941\u0939\u094B\u0938\u094D", descEn: "Can view footer configuration" },
          { key: "settings.update", labelEn: "Edit Footer Settings", labelNp: "\u092B\u0941\u091F\u0930 \u0938\u0947\u091F\u093F\u0919 \u0938\u092E\u094D\u092A\u093E\u0926\u0928", descEn: "Can update footer text and social links" }
        ]
      }
    ]
  },
  {
    key: "menu.content",
    id: "content",
    labelEn: "Content",
    labelNp: "\u0938\u093E\u092E\u0917\u094D\u0930\u0940",
    descEn: "Notices, downloads, curriculum, events, achievements, and vacancies",
    submenus: [
      {
        key: "submenu.content_about",
        tabId: "content_about",
        labelEn: "About School",
        labelNp: "\u0935\u093F\u0926\u094D\u092F\u093E\u0932\u092F \u092A\u0930\u093F\u091A\u092F",
        descEn: "Mission, vision, history summary, programs, and facilities",
        actions: [
          { key: "about.view", labelEn: "View About Info", labelNp: "\u092A\u0930\u093F\u091A\u092F \u0939\u0947\u0930\u094D\u0928\u0941\u0939\u094B\u0938\u094D", descEn: "Can view about information" },
          { key: "about.update", labelEn: "Edit About Info", labelNp: "\u092A\u0930\u093F\u091A\u092F \u0938\u092E\u094D\u092A\u093E\u0926\u0928", descEn: "Can update school overview and programs" }
        ]
      },
      {
        key: "submenu.content_notices",
        tabId: "content_notices",
        labelEn: "Notices",
        labelNp: "\u0938\u0942\u091A\u0928\u093E\u0939\u0930\u0942",
        descEn: "Official notices, exam schedules, and PDF circulars",
        actions: [
          { key: "notice.view", labelEn: "View Notices", labelNp: "\u0938\u0942\u091A\u0928\u093E \u0939\u0947\u0930\u094D\u0928\u0941\u0939\u094B\u0938\u094D", descEn: "Can browse administrative notices" },
          { key: "notice.create", labelEn: "Create Notice", labelNp: "\u0938\u0942\u091A\u0928\u093E \u0938\u093F\u0930\u094D\u091C\u0928\u093E", descEn: "Can publish new official notices and PDF circulars" },
          { key: "notice.update", labelEn: "Edit Notice", labelNp: "\u0938\u0942\u091A\u0928\u093E \u0938\u092E\u094D\u092A\u093E\u0926\u0928", descEn: "Can modify notice title, dates, attachments, and pinned status" },
          { key: "notice.delete", labelEn: "Delete Notice", labelNp: "\u0938\u0942\u091A\u0928\u093E \u092E\u0947\u091F\u093E\u0909\u0928\u0941\u0939\u094B\u0938\u094D", descEn: "Can remove notices from portal" }
        ]
      },
      {
        key: "submenu.content_career",
        tabId: "content_career",
        labelEn: "Career & Vacancies",
        labelNp: "\u0930\u094B\u091C\u0917\u093E\u0930\u0940 \u0924\u0925\u093E \u0935\u093F\u091C\u094D\u091E\u093E\u092A\u0928",
        descEn: "Job recruitment, staff vacancies, and online application links",
        actions: [
          { key: "career.view", labelEn: "View Vacancies", labelNp: "\u0935\u093F\u091C\u094D\u091E\u093E\u092A\u0928 \u0939\u0947\u0930\u094D\u0928\u0941\u0939\u094B\u0938\u094D", descEn: "Can view recruitment listings" },
          { key: "career.create", labelEn: "Create Vacancy", labelNp: "\u0935\u093F\u091C\u094D\u091E\u093E\u092A\u0928 \u0938\u093F\u0930\u094D\u091C\u0928\u093E", descEn: "Can post new job and teacher vacancies" },
          { key: "career.update", labelEn: "Edit Vacancy", labelNp: "\u0935\u093F\u091C\u094D\u091E\u093E\u092A\u0928 \u0938\u092E\u094D\u092A\u093E\u0926\u0928", descEn: "Can modify vacancy details and set active/closed status" },
          { key: "career.delete", labelEn: "Delete Vacancy", labelNp: "\u0935\u093F\u091C\u094D\u091E\u093E\u092A\u0928 \u092E\u0947\u091F\u093E\u0909\u0928\u0941\u0939\u094B\u0938\u094D", descEn: "Can delete vacancy records" }
        ]
      },
      {
        key: "submenu.content_documents",
        tabId: "content_documents",
        labelEn: "Documents & Downloads",
        labelNp: "\u0926\u0938\u094D\u0924\u093E\u0935\u0947\u091C \u0924\u0925\u093E \u0921\u093E\u0909\u0928\u0932\u094B\u0921",
        descEn: "Downloadable forms, curriculum guides, and school policies",
        actions: [
          { key: "document.view", labelEn: "View Documents", labelNp: "\u0926\u0938\u094D\u0924\u093E\u0935\u0947\u091C \u0939\u0947\u0930\u094D\u0928\u0941\u0939\u094B\u0938\u094D", descEn: "Can browse public documents" },
          { key: "document.upload", labelEn: "Upload Document", labelNp: "\u0926\u0938\u094D\u0924\u093E\u0935\u0947\u091C \u0905\u092A\u0932\u094B\u0921", descEn: "Can upload and publish new PDF documents" },
          { key: "document.delete", labelEn: "Delete Document", labelNp: "\u0926\u0938\u094D\u0924\u093E\u0935\u0947\u091C \u092E\u0947\u091F\u093E\u0909\u0928\u0941\u0939\u094B\u0938\u094D", descEn: "Can remove published documents" }
        ]
      },
      {
        key: "submenu.content_curriculum",
        tabId: "content_curriculum",
        labelEn: "Curriculum Guidelines",
        labelNp: "\u092A\u093E\u0920\u094D\u092F\u0915\u094D\u0930\u092E \u0928\u093F\u0930\u094D\u0926\u0947\u0936\u093F\u0915\u093E",
        descEn: "Official syllabus, grade-wise guidelines, and evaluation grids",
        actions: [
          { key: "curriculum.view", labelEn: "View Guidelines", labelNp: "\u0928\u093F\u0930\u094D\u0926\u0947\u0936\u093F\u0915\u093E \u0939\u0947\u0930\u094D\u0928\u0941\u0939\u094B\u0938\u094D", descEn: "Can browse curriculum guidelines" },
          { key: "curriculum.create", labelEn: "Add Guideline", labelNp: "\u0928\u093F\u0930\u094D\u0926\u0947\u0936\u093F\u0915\u093E \u0925\u092A\u094D\u0928\u0941\u0939\u094B\u0938\u094D", descEn: "Can upload subject curriculum guides (PDF up to 10MB)" },
          { key: "curriculum.update", labelEn: "Edit Guideline", labelNp: "\u0928\u093F\u0930\u094D\u0926\u0947\u0936\u093F\u0915\u093E \u0938\u092E\u094D\u092A\u093E\u0926\u0928", descEn: "Can update curriculum metadata and attachments" },
          { key: "curriculum.delete", labelEn: "Delete Guideline", labelNp: "\u0928\u093F\u0930\u094D\u0926\u0947\u0936\u093F\u0915\u093E \u092E\u0947\u091F\u093E\u0909\u0928\u0941\u0939\u094B\u0938\u094D", descEn: "Can remove curriculum guidelines" }
        ]
      },
      {
        key: "submenu.content_events",
        tabId: "content_events",
        labelEn: "Events & Routines",
        labelNp: "\u0915\u093E\u0930\u094D\u092F\u0915\u094D\u0930\u092E \u0924\u0925\u093E \u0924\u093E\u0932\u093F\u0915\u093E",
        descEn: "Academic calendar, routine schedules, and school celebrations",
        actions: [
          { key: "event.view", labelEn: "View Events", labelNp: "\u0915\u093E\u0930\u094D\u092F\u0915\u094D\u0930\u092E \u0939\u0947\u0930\u094D\u0928\u0941\u0939\u094B\u0938\u094D", descEn: "Can view calendar events" },
          { key: "event.create", labelEn: "Create Event", labelNp: "\u0915\u093E\u0930\u094D\u092F\u0915\u094D\u0930\u092E \u0925\u092A\u094D\u0928\u0941\u0939\u094B\u0938\u094D", descEn: "Can schedule new academic events" },
          { key: "event.update", labelEn: "Edit Event", labelNp: "\u0915\u093E\u0930\u094D\u092F\u0915\u094D\u0930\u092E \u0938\u092E\u094D\u092A\u093E\u0926\u0928", descEn: "Can modify event dates and venues" },
          { key: "event.delete", labelEn: "Delete Event", labelNp: "\u0915\u093E\u0930\u094D\u092F\u0915\u094D\u0930\u092E \u092E\u0947\u091F\u093E\u0909\u0928\u0941\u0939\u094B\u0938\u094D", descEn: "Can delete scheduled events" }
        ]
      },
      {
        key: "submenu.content_achievements",
        tabId: "content_achievements",
        labelEn: "Achievements & Awards",
        labelNp: "\u0909\u092A\u0932\u092C\u094D\u0927\u093F \u0924\u0925\u093E \u092A\u0941\u0930\u0938\u094D\u0915\u093E\u0930",
        descEn: "Academic honors, sports medals, and institutional achievements",
        actions: [
          { key: "achievement.view", labelEn: "View Achievements", labelNp: "\u0909\u092A\u0932\u092C\u094D\u0927\u093F \u0939\u0947\u0930\u094D\u0928\u0941\u0939\u094B\u0938\u094D", descEn: "Can browse student honors" },
          { key: "achievement.create", labelEn: "Add Achievement", labelNp: "\u0909\u092A\u0932\u092C\u094D\u0927\u093F \u0925\u092A\u094D\u0928\u0941\u0939\u094B\u0938\u094D", descEn: "Can record new awards and medals" },
          { key: "achievement.update", labelEn: "Edit Achievement", labelNp: "\u0909\u092A\u0932\u092C\u094D\u0927\u093F \u0938\u092E\u094D\u092A\u093E\u0926\u0928", descEn: "Can update achievement details" },
          { key: "achievement.delete", labelEn: "Delete Achievement", labelNp: "\u0909\u092A\u0932\u092C\u094D\u0927\u093F \u092E\u0947\u091F\u093E\u0909\u0928\u0941\u0939\u094B\u0938\u094D", descEn: "Can remove achievement records" }
        ]
      },
      {
        key: "submenu.content_history",
        tabId: "content_history",
        labelEn: "History & Milestones",
        labelNp: "\u0907\u0924\u093F\u0939\u093E\u0938 \u0924\u0925\u093E \u0915\u094B\u0938\u0947\u0922\u0941\u0919\u094D\u0917\u093E",
        descEn: "Institutional establishment, milestones, and historical archive",
        actions: [
          { key: "history.view", labelEn: "View History", labelNp: "\u0907\u0924\u093F\u0939\u093E\u0938 \u0939\u0947\u0930\u094D\u0928\u0941\u0939\u094B\u0938\u094D", descEn: "Can view timeline records" },
          { key: "history.create", labelEn: "Add Milestone", labelNp: "\u0915\u094B\u0938\u0947\u0922\u0941\u0919\u094D\u0917\u093E \u0925\u092A\u094D\u0928\u0941\u0939\u094B\u0938\u094D", descEn: "Can add milestone dates and narratives" },
          { key: "history.update", labelEn: "Edit Milestone", labelNp: "\u0915\u094B\u0938\u0947\u0922\u0941\u0919\u094D\u0917\u093E \u0938\u092E\u094D\u092A\u093E\u0926\u0928", descEn: "Can update historical milestone details" },
          { key: "history.delete", labelEn: "Delete Milestone", labelNp: "\u0915\u094B\u0938\u0947\u0922\u0941\u0919\u094D\u0917\u093E \u092E\u0947\u091F\u093E\u0909\u0928\u0941\u0939\u094B\u0938\u094D", descEn: "Can delete history records" }
        ]
      },
      {
        key: "submenu.content_faq",
        tabId: "content_faq",
        labelEn: "FAQs & Q&A",
        labelNp: "\u092A\u094D\u0930\u093E\u092F\u0903 \u0938\u094B\u0927\u093F\u0928\u0947 \u092A\u094D\u0930\u0936\u094D\u0928\u0939\u0930\u0942 (FAQ)",
        descEn: "Public Q&A, admissions guidance, and common school information",
        actions: [
          { key: "about.view", labelEn: "View FAQs", labelNp: "FAQ \u0939\u0947\u0930\u094D\u0928\u0941\u0939\u094B\u0938\u094D", descEn: "Can view published FAQs" },
          { key: "about.update", labelEn: "Manage FAQs", labelNp: "FAQ \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E\u092A\u0928", descEn: "Can add, edit, and publish FAQs" }
        ]
      }
    ]
  },
  {
    key: "menu.governance",
    id: "governance",
    labelEn: "Governance",
    labelNp: "\u0938\u0941\u0936\u093E\u0938\u0928",
    descEn: "Leadership, SMC members, and teaching faculty directory",
    submenus: [
      {
        key: "submenu.gov_chairman",
        tabId: "gov_smc",
        labelEn: "Chairman / SMC",
        labelNp: "\u0935\u093F.\u0935\u094D\u092F.\u0938. \u0924\u0925\u093E \u0905\u0927\u094D\u092F\u0915\u094D\u0937",
        descEn: "School Management Committee leadership and chairman desk",
        actions: [
          { key: "teacher.view", labelEn: "View SMC", labelNp: "\u0935\u093F.\u0935\u094D\u092F.\u0938. \u0939\u0947\u0930\u094D\u0928\u0941\u0939\u094B\u0938\u094D", descEn: "Can view committee members" },
          { key: "teacher.update", labelEn: "Edit SMC", labelNp: "\u0935\u093F.\u0935\u094D\u092F.\u0938. \u0938\u092E\u094D\u092A\u093E\u0926\u0928", descEn: "Can update chairman profile and message" }
        ]
      },
      {
        key: "submenu.gov_principal",
        tabId: "gov_principal",
        labelEn: "Principal",
        labelNp: "\u092A\u094D\u0930\u0927\u093E\u0928\u093E\u0927\u094D\u092F\u093E\u092A\u0915",
        descEn: "Principal desk message, profile, and administrative leadership",
        actions: [
          { key: "teacher.view", labelEn: "View Principal", labelNp: "\u092A\u094D\u0930.\u0905. \u0939\u0947\u0930\u094D\u0928\u0941\u0939\u094B\u0938\u094D", descEn: "Can view principal message" },
          { key: "teacher.update", labelEn: "Edit Principal", labelNp: "\u092A\u094D\u0930.\u0905. \u0938\u092E\u094D\u092A\u093E\u0926\u0928", descEn: "Can update principal profile and message" }
        ]
      },
      {
        key: "submenu.gov_staff",
        tabId: "gov_staff",
        labelEn: "Teachers & Staff",
        labelNp: "\u0936\u093F\u0915\u094D\u0937\u0915 \u0924\u0925\u093E \u0915\u0930\u094D\u092E\u091A\u093E\u0930\u0940",
        descEn: "Teaching faculty, department heads, and administrative personnel",
        actions: [
          { key: "teacher.view", labelEn: "View Faculty", labelNp: "\u0936\u093F\u0915\u094D\u0937\u0915 \u0939\u0947\u0930\u094D\u0928\u0941\u0939\u094B\u0938\u094D", descEn: "Can view faculty directory" },
          { key: "teacher.create", labelEn: "Add Faculty", labelNp: "\u0928\u092F\u093E\u0901 \u0936\u093F\u0915\u094D\u0937\u0915 \u0925\u092A\u094D\u0928\u0941\u0939\u094B\u0938\u094D", descEn: "Can add teachers with passport photos" },
          { key: "teacher.update", labelEn: "Edit Faculty", labelNp: "\u0936\u093F\u0915\u094D\u0937\u0915 \u0938\u092E\u094D\u092A\u093E\u0926\u0928", descEn: "Can update teacher profiles and photos" },
          { key: "teacher.delete", labelEn: "Delete Faculty", labelNp: "\u0936\u093F\u0915\u094D\u0937\u0915 \u092E\u0947\u091F\u093E\u0909\u0928\u0941\u0939\u094B\u0938\u094D", descEn: "Can remove teacher records" },
          { key: "staff.view", labelEn: "View Admin Staff", labelNp: "\u0915\u0930\u094D\u092E\u091A\u093E\u0930\u0940 \u0939\u0947\u0930\u094D\u0928\u0941\u0939\u094B\u0938\u094D", descEn: "Can view administrative staff" },
          { key: "staff.create", labelEn: "Add Admin Staff", labelNp: "\u0915\u0930\u094D\u092E\u091A\u093E\u0930\u0940 \u0925\u092A\u094D\u0928\u0941\u0939\u094B\u0938\u094D", descEn: "Can add administrative staff" },
          { key: "staff.update", labelEn: "Edit Admin Staff", labelNp: "\u0915\u0930\u094D\u092E\u091A\u093E\u0930\u0940 \u0938\u092E\u094D\u092A\u093E\u0926\u0928", descEn: "Can update staff profiles" },
          { key: "staff.delete", labelEn: "Delete Admin Staff", labelNp: "\u0915\u0930\u094D\u092E\u091A\u093E\u0930\u0940 \u092E\u0947\u091F\u093E\u0909\u0928\u0941\u0939\u094B\u0938\u094D", descEn: "Can remove staff profiles" }
        ]
      }
    ]
  },
  {
    key: "menu.media",
    id: "media",
    labelEn: "Media",
    labelNp: "\u092E\u093F\u0921\u093F\u092F\u093E",
    descEn: "Photo galleries, ceremonies, campus visual archive",
    submenus: [
      {
        key: "submenu.media_gallery",
        tabId: "media_gallery",
        labelEn: "Gallery",
        labelNp: "\u092B\u094B\u091F\u094B \u0917\u094D\u092F\u093E\u0932\u0930\u0940",
        descEn: "Visual galleries, photo albums, and ceremonies",
        actions: [
          { key: "gallery.view", labelEn: "View Gallery", labelNp: "\u0917\u094D\u092F\u093E\u0932\u0930\u0940 \u0939\u0947\u0930\u094D\u0928\u0941\u0939\u094B\u0938\u094D", descEn: "Can browse gallery archive" },
          { key: "gallery.create", labelEn: "Upload Photos", labelNp: "\u0924\u0938\u094D\u092C\u093F\u0930 \u0905\u092A\u0932\u094B\u0921", descEn: "Can upload JPG/PNG photos" },
          { key: "gallery.update", labelEn: "Edit Photo Records", labelNp: "\u0924\u0938\u094D\u092C\u093F\u0930 \u0938\u092E\u094D\u092A\u093E\u0926\u0928", descEn: "Can edit photo captions and categories" },
          { key: "gallery.delete", labelEn: "Delete Photos", labelNp: "\u0924\u0938\u094D\u092C\u093F\u0930 \u092E\u0947\u091F\u093E\u0909\u0928\u0941\u0939\u094B\u0938\u094D", descEn: "Can delete photos" }
        ]
      }
    ]
  },
  {
    key: "menu.communication",
    id: "communication",
    labelEn: "Communication",
    labelNp: "\u0938\u091E\u094D\u091A\u093E\u0930",
    descEn: "Parent and citizen inquiries, public contact inbox",
    submenus: [
      {
        key: "submenu.comm_contact",
        tabId: "comm_contact",
        labelEn: "Contact",
        labelNp: "\u0938\u092E\u094D\u092A\u0930\u094D\u0915 \u0938\u094B\u0927\u092A\u0941\u091B",
        descEn: "Public contact submissions, parental queries, and portal messages",
        actions: [
          { key: "message.view", labelEn: "View Inquiries", labelNp: "\u0938\u0928\u094D\u0926\u0947\u0936 \u0939\u0947\u0930\u094D\u0928\u0941\u0939\u094B\u0938\u094D", descEn: "Can view incoming portal messages" },
          { key: "message.delete", labelEn: "Delete Inquiries", labelNp: "\u0938\u0928\u094D\u0926\u0947\u0936 \u092E\u0947\u091F\u093E\u0909\u0928\u0941\u0939\u094B\u0938\u094D", descEn: "Can delete or archive messages" }
        ]
      }
    ]
  },
  {
    key: "menu.system",
    id: "system",
    labelEn: "System",
    labelNp: "\u092A\u094D\u0930\u0923\u093E\u0932\u0940",
    descEn: "Administrators management, role permissions, audit trails, and site recovery",
    submenus: [
      {
        key: "submenu.sys_admins",
        tabId: "sys_admins",
        labelEn: "Administrators",
        labelNp: "\u092A\u094D\u0930\u0936\u093E\u0938\u0915\u0939\u0930\u0942",
        descEn: "Admin user provisioning, credential changes, and account statuses",
        actions: [
          { key: "admin.view", labelEn: "View Admin Accounts", labelNp: "\u092A\u094D\u0930\u0936\u093E\u0938\u0915 \u0939\u0947\u0930\u094D\u0928\u0941\u0939\u094B\u0938\u094D", descEn: "Can view administrator accounts" },
          { key: "admin.create", labelEn: "Create Admin Account", labelNp: "\u0928\u092F\u093E\u0901 \u092A\u094D\u0930\u0936\u093E\u0938\u0915 \u092C\u0928\u093E\u0909\u0928\u0941\u0939\u094B\u0938\u094D", descEn: "Can create administrator accounts" },
          { key: "admin.update", labelEn: "Edit Admin Account", labelNp: "\u092A\u094D\u0930\u0936\u093E\u0938\u0915 \u0938\u092E\u094D\u092A\u093E\u0926\u0928", descEn: "Can modify permissions and statuses" },
          { key: "admin.delete", labelEn: "Delete Admin Account", labelNp: "\u092A\u094D\u0930\u0936\u093E\u0938\u0915 \u092E\u0947\u091F\u093E\u0909\u0928\u0941\u0939\u094B\u0938\u094D", descEn: "Can delete subordinate accounts" }
        ]
      },
      {
        key: "submenu.sys_roles",
        tabId: "sys_roles",
        labelEn: "Roles & Permissions",
        labelNp: "\u092D\u0942\u092E\u093F\u0915\u093E \u0930 \u0905\u0928\u0941\u092E\u0924\u093F",
        descEn: "Granular access control matrix and permission assignments",
        actions: [
          { key: "admin.manage", labelEn: "Manage Roles & Matrix", labelNp: "\u0905\u0928\u0941\u092E\u0924\u093F \u092E\u094D\u092F\u093E\u091F\u094D\u0930\u093F\u0915\u094D\u0938 \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E\u092A\u0928", descEn: "Can manage RBAC matrix" }
        ]
      },
      {
        key: "submenu.sys_audit",
        tabId: "sys_audit",
        labelEn: "Audit Logs",
        labelNp: "\u0905\u0921\u093F\u091F \u0932\u0917",
        descEn: "Security activity trail, login logs, and administrative event auditing",
        actions: [
          { key: "audit.view", labelEn: "View Audit Logs", labelNp: "\u0905\u0921\u093F\u091F \u0932\u0917 \u0939\u0947\u0930\u094D\u0928\u0941\u0939\u094B\u0938\u094D", descEn: "Can review immutable security audit trail" }
        ]
      },
      {
        key: "submenu.sys_settings",
        tabId: "sys_settings",
        labelEn: "System Settings",
        labelNp: "\u092A\u094D\u0930\u0923\u093E\u0932\u0940 \u0938\u0947\u091F\u093F\u0919",
        descEn: "Global school settings, session security, and disaster recovery",
        actions: [
          { key: "settings.view", labelEn: "View System Settings", labelNp: "\u0938\u0947\u091F\u093F\u0919 \u0939\u0947\u0930\u094D\u0928\u0941\u0939\u094B\u0938\u094D", descEn: "Can view system parameters" },
          { key: "settings.update", labelEn: "Modify System Settings", labelNp: "\u0938\u0947\u091F\u093F\u0919 \u0938\u092E\u094D\u092A\u093E\u0926\u0928", descEn: "Can update system settings" },
          { key: "security.view", labelEn: "View Security Settings", labelNp: "\u0938\u0941\u0930\u0915\u094D\u0937\u093E \u0939\u0947\u0930\u094D\u0928\u0941\u0939\u094B\u0938\u094D", descEn: "Can inspect security configurations" },
          { key: "security.update", labelEn: "Modify Security Settings", labelNp: "\u0938\u0941\u0930\u0915\u094D\u0937\u093E \u0938\u092E\u094D\u092A\u093E\u0926\u0928", descEn: "Can update lockout and recovery settings" }
        ]
      }
    ]
  }
];
var SUBMENU_TO_MENU_MAP = {};
var ACTION_TO_SUBMENU_MAP = {};
for (const menu of MAIN_MENU_HIERARCHY) {
  for (const sub of menu.submenus) {
    SUBMENU_TO_MENU_MAP[sub.key] = menu.key;
    for (const act of sub.actions) {
      ACTION_TO_SUBMENU_MAP[act.key] = sub.key;
    }
  }
}
var ALL_PERMISSIONS = [];
for (const menu of MAIN_MENU_HIERARCHY) {
  ALL_PERMISSIONS.push({
    key: menu.key,
    group: menu.labelEn,
    labelEn: `[Main Menu] ${menu.labelEn}`,
    labelNp: `[\u092E\u0941\u0916\u094D\u092F \u092E\u0947\u0928\u0941] ${menu.labelNp}`,
    descEn: menu.descEn,
    level: "menu"
  });
  for (const sub of menu.submenus) {
    ALL_PERMISSIONS.push({
      key: sub.key,
      group: menu.labelEn,
      labelEn: `[Submenu] ${sub.labelEn}`,
      labelNp: `[\u0909\u092A-\u092E\u0947\u0928\u0941] ${sub.labelNp}`,
      descEn: sub.descEn,
      level: "submenu"
    });
    for (const act of sub.actions) {
      if (!ALL_PERMISSIONS.some((p) => p.key === act.key)) {
        ALL_PERMISSIONS.push({
          key: act.key,
          group: menu.labelEn,
          labelEn: act.labelEn,
          labelNp: act.labelNp,
          descEn: act.descEn,
          level: "action"
        });
      }
    }
  }
}
var initialAdminAccounts = [
  {
    id: "usr_superadmin",
    username: "ishwari-superadmin",
    fullName: "Master System Administrator (\u0935\u093F\u0926\u094D\u092F\u093E\u0932\u092F \u092A\u094D\u0930\u092E\u0941\u0916 / \u092A\u094D\u0930\u0923\u093E\u0932\u0940 \u092A\u094D\u0930\u0936\u093E\u0938\u0915)",
    email: "superadmin@ishwari.edu.np",
    role: "super_admin",
    // bcrypt hash for Ishwari12@
    passwordHash: "$2b$10$US8/qhy4fZH.GJu5US/g9eEhvTVvB6eQNlnbyK/9t8Ue8jyiZoJ56",
    salt: "salt_ishwari_super",
    status: "active",
    permissions: ALL_PERMISSIONS.map((p) => p.key),
    createdAt: "2083-01-01",
    lastLogin: "2083-05-15 09:30 AM"
  },
  {
    id: "usr_admin",
    username: "ishwari",
    fullName: "School Operations Officer (\u092A\u094D\u0930\u0936\u093E\u0938\u0928 \u0905\u0927\u093F\u0915\u0943\u0924)",
    email: "admin@ishwari.edu.np",
    role: "admin",
    // bcrypt hash for Ishwari12@
    passwordHash: "$2b$10$US8/qhy4fZH.GJu5US/g9eEhvTVvB6eQNlnbyK/9t8Ue8jyiZoJ56",
    salt: "salt_ishwari_admin",
    status: "active",
    permissions: [
      // 1. Website (Identity only)
      "menu.website",
      "submenu.website_identity",
      "settings.view",
      // 2. Content (Notices & Curriculum Guidelines)
      "menu.content",
      "submenu.content_notices",
      "notice.view",
      "notice.create",
      "notice.update",
      "notice.delete",
      "submenu.content_curriculum",
      "curriculum.view",
      "curriculum.create",
      "curriculum.update",
      "curriculum.delete",
      // 3. Governance (Teachers & Staff)
      "menu.governance",
      "submenu.gov_staff",
      "teacher.view",
      "teacher.create",
      "teacher.update",
      "staff.view",
      "staff.create",
      "staff.update",
      // 4. Media (Photo Gallery)
      "menu.media",
      "submenu.media_gallery",
      "gallery.view",
      "gallery.create",
      "gallery.update",
      "gallery.delete"
    ],
    createdAt: "2083-02-10",
    lastLogin: "2083-05-14 04:15 PM"
  }
];
var SESSION_HEARTBEAT_TIMEOUT_MS = 15 * 60 * 1e3;

// backend/db.ts
var defaultAboutSections = [
  {
    id: "about-intro",
    title_en: "About Ishwari Secondary School",
    title_np: "\u0908\u0936\u094D\u0935\u0930\u0940 \u092E\u093E\u0927\u094D\u092F\u092E\u093F\u0915 \u0935\u093F\u0926\u094D\u092F\u093E\u0932\u092F\u0915\u094B \u092C\u093E\u0930\u0947\u092E\u093E",
    category: "overview",
    content_en: `Shree Ishwari Secondary School was established in 2028 B.S. and has continued to provide quality, accessible education to students across the community.

[[image:https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80|align:right|size:medium|alt:Main School Academic Block|caption:Shree Ishwari Secondary School Academic Campus Block]]

Over the decades, the institution has steadily expanded its educational programs, infrastructure, and learning environment. Through generous community collaboration and dedicated governmental support, the school has developed modern multimedia classrooms, fully-equipped science and computer laboratories, and sports grounds.

Today, Ishwari Secondary School stands as a model community learning center where academic rigor, ethical discipline, and scientific inquiry are nurtured together.`,
    content_np: `\u0936\u094D\u0930\u0940 \u0908\u0936\u094D\u0935\u0930\u0940 \u092E\u093E\u0927\u094D\u092F\u092E\u093F\u0915 \u0935\u093F\u0926\u094D\u092F\u093E\u0932\u092F \u0935\u093F.\u0938\u0902. \u0968\u0966\u0968\u096E \u0938\u093E\u0932\u092E\u093E \u0938\u094D\u0925\u093E\u092A\u093F\u0924 \u092D\u0908 \u092F\u0938 \u092D\u0947\u0917\u0915\u093E \u092C\u093E\u0932\u092C\u093E\u0932\u093F\u0915\u093E\u0939\u0930\u0942\u0932\u093E\u0908 \u0917\u0941\u0923\u0938\u094D\u0924\u0930\u0940\u092F, \u0938\u0941\u0932\u092D \u0930 \u0935\u094D\u092F\u093E\u0935\u0939\u093E\u0930\u093F\u0915 \u0936\u093F\u0915\u094D\u0937\u093E \u092A\u094D\u0930\u0926\u093E\u0928 \u0917\u0930\u094D\u0926\u0948 \u0906\u0907\u0930\u0939\u0947\u0915\u094B \u090F\u0915 \u0910\u0924\u093F\u0939\u093E\u0938\u093F\u0915 \u0938\u093E\u092E\u0941\u0926\u093E\u092F\u093F\u0915 \u0936\u0948\u0915\u094D\u0937\u093F\u0915 \u0938\u0902\u0938\u094D\u0925\u093E \u0939\u094B\u0964

[[image:https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80|align:right|size:medium|alt:\u0935\u093F\u0926\u094D\u092F\u093E\u0932\u092F\u0915\u094B \u092E\u0941\u0916\u094D\u092F \u0936\u0948\u0915\u094D\u0937\u093F\u0915 \u092D\u0935\u0928|caption:\u0936\u094D\u0930\u0940 \u0908\u0936\u094D\u0935\u0930\u0940 \u092E\u093E\u0927\u094D\u092F\u092E\u093F\u0915 \u0935\u093F\u0926\u094D\u092F\u093E\u0932\u092F\u0915\u094B \u0936\u0948\u0915\u094D\u0937\u093F\u0915 \u092A\u0930\u093F\u0938\u0930]]

\u0938\u094D\u0925\u093E\u092A\u0928\u093E\u0915\u093E\u0932\u0926\u0947\u0916\u093F \u0928\u0948 \u0935\u093F\u0926\u094D\u092F\u093E\u0932\u092F\u0932\u0947 \u0906\u092B\u094D\u0928\u093E \u0936\u0948\u0915\u094D\u0937\u093F\u0915 \u0915\u093E\u0930\u094D\u092F\u0915\u094D\u0930\u092E\u0939\u0930\u0942, \u0906\u0927\u0941\u0928\u093F\u0915 \u092D\u094C\u0924\u093F\u0915 \u092A\u0942\u0930\u094D\u0935\u093E\u0927\u093E\u0930 \u0924\u0925\u093E \u092A\u094D\u0930\u0935\u093F\u0927\u093F\u092E\u0948\u0924\u094D\u0930\u0940 \u0938\u093F\u0915\u093E\u0907 \u0935\u093E\u0924\u093E\u0935\u0930\u0923\u0932\u093E\u0908 \u0928\u093F\u0930\u0928\u094D\u0924\u0930 \u0938\u0941\u0926\u0943\u0922 \u092C\u0928\u093E\u0909\u0901\u0926\u0948 \u0932\u0917\u0947\u0915\u094B \u091B\u0964 \u0938\u092E\u0941\u0926\u093E\u092F\u0915\u094B \u092A\u094D\u0930\u0924\u094D\u092F\u0915\u094D\u0937 \u0938\u0939\u092D\u093E\u0917\u093F\u0924\u093E, \u0905\u0928\u0941\u092D\u0935\u0940 \u0936\u093F\u0915\u094D\u0937\u0915 \u092E\u0923\u094D\u0921\u0932\u0940 \u0930 \u0935\u093F\u0926\u094D\u092F\u093E\u0930\u094D\u0925\u0940\u0939\u0930\u0942\u0915\u094B \u0932\u0917\u0928\u0936\u0940\u0932\u0924\u093E\u0932\u0947 \u0935\u093F\u0926\u094D\u092F\u093E\u0932\u092F\u0932\u093E\u0908 \u0928\u092E\u0941\u0928\u093E \u0935\u093F\u0926\u094D\u092F\u093E\u0932\u092F\u0915\u094B \u0930\u0942\u092A\u092E\u093E \u0938\u094D\u0925\u093E\u092A\u093F\u0924 \u0917\u0930\u0947\u0915\u094B \u091B\u0964

\u0906\u091C \u092F\u0938 \u0935\u093F\u0926\u094D\u092F\u093E\u0932\u092F\u092E\u093E \u0906\u0927\u0941\u0928\u093F\u0915 \u0935\u093F\u091C\u094D\u091E\u093E\u0928 \u092A\u094D\u0930\u092F\u094B\u0917\u0936\u093E\u0932\u093E, \u0915\u092E\u094D\u092A\u094D\u092F\u0941\u091F\u0930 \u0932\u094D\u092F\u093E\u092C, \u0938\u0941\u0938\u091C\u094D\u091C\u093F\u0924 \u092A\u0941\u0938\u094D\u0924\u0915\u093E\u0932\u092F \u0924\u0925\u093E \u0916\u0947\u0932\u0915\u0941\u0926 \u092E\u0948\u0926\u093E\u0928 \u0909\u092A\u0932\u092C\u094D\u0927 \u091B\u0928\u094D \u091C\u0939\u093E\u0901 \u0935\u093F\u0926\u094D\u092F\u093E\u0930\u094D\u0925\u0940\u0939\u0930\u0942\u0915\u094B \u0938\u0930\u094D\u0935\u093E\u0919\u094D\u0917\u0940\u0923 \u0935\u093F\u0915\u093E\u0938\u0932\u093E\u0908 \u092A\u094D\u0930\u093E\u0925\u092E\u093F\u0915\u0924\u093E \u0926\u093F\u0907\u0928\u094D\u091B\u0964`,
    image: "",
    image_caption_en: "Main Academic Campus & Grounds",
    image_caption_np: "\u0935\u093F\u0926\u094D\u092F\u093E\u0932\u092F\u0915\u094B \u092E\u0941\u0916\u094D\u092F \u0936\u0948\u0915\u094D\u0937\u093F\u0915 \u092D\u0935\u0928 \u0924\u0925\u093E \u092A\u094D\u0930\u093E\u0919\u094D\u0917\u0923",
    display_order: 1,
    status: "published",
    is_enabled: true,
    icon: "Compass"
  },
  {
    id: "about-mission",
    title_en: "Our Mission",
    title_np: "\u0939\u093E\u092E\u094D\u0930\u094B \u0909\u0926\u094D\u0926\u0947\u0936\u094D\u092F",
    category: "mission",
    content_en: "To empower every learner with strong academic foundations, critical thinking abilities, digital literacy, and civic values.",
    content_np: "\u092A\u094D\u0930\u0924\u094D\u092F\u0947\u0915 \u0935\u093F\u0926\u094D\u092F\u093E\u0930\u094D\u0925\u0940\u0932\u093E\u0908 \u0906\u0927\u093E\u0930\u092D\u0942\u0924 \u0936\u0948\u0915\u094D\u0937\u093F\u0915 \u091C\u094D\u091E\u093E\u0928, \u0938\u093F\u0930\u094D\u091C\u0928\u0936\u0940\u0932\u0924\u093E, \u092A\u094D\u0930\u0935\u093F\u0927\u093F\u092E\u0948\u0924\u094D\u0930\u0940 \u0938\u0940\u092A \u0930 \u0909\u091A\u094D\u091A \u0928\u0948\u0924\u093F\u0915 \u0938\u0902\u0938\u094D\u0915\u093E\u0930 \u092A\u094D\u0930\u0926\u093E\u0928 \u0917\u0930\u094D\u0928\u0941\u0964",
    display_order: 2,
    status: "published",
    is_enabled: true,
    icon: "Target"
  },
  {
    id: "about-vision",
    title_en: "Our Vision",
    title_np: "\u0939\u093E\u092E\u094D\u0930\u094B \u0926\u0943\u0937\u094D\u091F\u093F\u0915\u094B\u0923",
    category: "vision",
    content_en: "To establish Ishwari as a premier national model school delivering accessible, internationally competitive education in Nepal.",
    content_np: "\u0928\u0947\u092A\u093E\u0932\u0915\u094B \u0905\u0917\u094D\u0930\u0923\u0940 \u0928\u092E\u0941\u0928\u093E \u0938\u093E\u092E\u0941\u0926\u093E\u092F\u093F\u0915 \u0935\u093F\u0926\u094D\u092F\u093E\u0932\u092F\u0915\u094B \u0930\u0942\u092A\u092E\u093E \u0935\u093F\u0915\u093E\u0938 \u0917\u0930\u0940 \u0930\u093E\u0937\u094D\u091F\u094D\u0930\u093F\u092F \u0924\u0925\u093E \u0905\u0928\u094D\u0924\u0930\u094D\u0930\u093E\u0937\u094D\u091F\u094D\u0930\u093F\u092F \u0938\u094D\u0924\u0930\u092E\u093E \u092A\u094D\u0930\u0924\u093F\u0938\u094D\u092A\u0930\u094D\u0927\u0940 \u091C\u0928\u0936\u0915\u094D\u0924\u093F \u0924\u092F\u093E\u0930 \u092A\u093E\u0930\u094D\u0928\u0941\u0964",
    display_order: 3,
    status: "published",
    is_enabled: true,
    icon: "Eye"
  },
  {
    id: "about-values",
    title_en: "Core Values",
    title_np: "\u0939\u093E\u092E\u094D\u0930\u093E \u092E\u0941\u0916\u094D\u092F \u092E\u093E\u0928\u094D\u092F\u0924\u093E\u0939\u0930\u0942",
    category: "values",
    content_en: "Academic Integrity, Social Inclusion, Scientific Temper, Environmental Stewardship, and Community Trust.",
    content_np: "\u0936\u0948\u0915\u094D\u0937\u093F\u0915 \u0928\u093F\u0937\u094D\u0920\u093E, \u0938\u093E\u092E\u093E\u091C\u093F\u0915 \u0938\u092E\u093E\u0935\u0947\u0936\u093F\u0924\u093E, \u0935\u0948\u091C\u094D\u091E\u093E\u0928\u093F\u0915 \u091A\u0947\u0924\u0928\u093E, \u0935\u093E\u0924\u093E\u0935\u0930\u0923 \u0938\u0902\u0930\u0915\u094D\u0937\u0923 \u0930 \u092A\u0942\u0930\u094D\u0923 \u0905\u0928\u0941\u0936\u093E\u0938\u0928\u0964",
    display_order: 4,
    status: "published",
    is_enabled: true,
    icon: "Scale"
  },
  {
    id: "about-governance",
    title_en: "School Management Committee (SMC) & Governance",
    title_np: "\u0935\u093F\u0926\u094D\u092F\u093E\u0932\u092F \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E\u092A\u0928 \u0938\u092E\u093F\u0924\u093F (SMC) \u0924\u0925\u093E \u0938\u0941\u0936\u093E\u0938\u0928",
    category: "governance",
    content_en: "Under the Education Act of Nepal, the School Management Committee oversees institutional policy, educational equity, resource allocation, and annual social audits with active community participation.",
    content_np: "\u0936\u093F\u0915\u094D\u0937\u093E \u0910\u0928 \u0924\u0925\u093E \u0928\u093F\u092F\u092E\u093E\u0935\u0932\u0940 \u0905\u0928\u0941\u0938\u093E\u0930 \u0905\u092D\u093F\u092D\u093E\u0935\u0915, \u0938\u094D\u0925\u093E\u0928\u0940\u092F \u0924\u0939\u0915\u093E \u092A\u094D\u0930\u0924\u093F\u0928\u093F\u0927\u093F \u0930 \u0936\u093F\u0915\u094D\u0937\u093E\u092A\u094D\u0930\u0947\u092E\u0940\u0939\u0930\u0942\u0915\u094B \u0938\u0939\u092D\u093E\u0917\u093F\u0924\u093E\u092E\u093E \u0917\u0920\u093F\u0924 \u0935\u093F\u0926\u094D\u092F\u093E\u0932\u092F \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E\u092A\u0928 \u0938\u092E\u093F\u0924\u093F\u0932\u0947 \u0928\u0940\u0924\u093F\u0917\u0924 \u0928\u093F\u0930\u094D\u0923\u092F, \u092A\u093E\u0930\u0926\u0930\u094D\u0936\u093F\u0924\u093E \u0930 \u0936\u0948\u0915\u094D\u0937\u093F\u0915 \u0917\u0941\u0923\u0938\u094D\u0924\u0930 \u0905\u092D\u093F\u0935\u0943\u0926\u094D\u0927\u093F\u092E\u093E \u0928\u0947\u0924\u0943\u0924\u094D\u0935\u0926\u093E\u092F\u0940 \u092D\u0942\u092E\u093F\u0915\u093E \u0928\u093F\u0930\u094D\u0935\u093E\u0939 \u0917\u0930\u094D\u0926\u091B\u0964",
    display_order: 5,
    status: "published",
    is_enabled: true,
    icon: "Building2"
  }
];
function hashPasswordBcrypt(password) {
  return bcrypt2.hashSync(password, 10);
}
function verifyPasswordBcrypt(password, hash) {
  if (!password || !hash) return false;
  if (hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$")) {
    try {
      return bcrypt2.compareSync(password, hash);
    } catch {
      return false;
    }
  }
  return password === hash;
}
var FIREBASE_CONFIG = {
  projectId: "imposing-practice-w6tvw",
  appId: "1:801110298190:web:8caf18bf341076c7a8bd1f",
  apiKey: "AIzaSyA6bwICa7vuwur1g0MoYxdTtH2Kl1QOImI",
  authDomain: "imposing-practice-w6tvw.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-ishwarisecondary-62e4059d-8fd8-48dc-9660-818a91224b4e",
  storageBucket: "imposing-practice-w6tvw.firebasestorage.app",
  messagingSenderId: "801110298190",
  measurementId: "",
  oAuthClientId: "801110298190-k04n444nd7c7n5hi6igjbei3e4iuni1h.apps.googleusercontent.com",
  recaptchaSiteKey: ""
};
function getFirestoreDb() {
  const app2 = getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApps()[0];
  return getFirestore(app2, FIREBASE_CONFIG.firestoreDatabaseId);
}
var CMS_MODULE_KEYS = [
  "school",
  "aboutSections",
  "notices",
  "staff",
  "facilities",
  "programs",
  "documents",
  "curriculumGuidelines",
  "vacancies",
  "messages",
  "events",
  "achievements",
  "history",
  "gallery",
  "faqs",
  "siteConfig",
  "securityConfig",
  "auditLogs",
  "adminAccounts"
];
var outdatedSeedStaffNames = /* @__PURE__ */ new Set([
  "Mr. Narayan Prasad Koirala",
  "Mrs. Sharada Devi Sharma",
  "Mr. Rameshwor Gautam",
  "Ms. Binita Thapa",
  "Mr. Lokendra Bahadur Thapa",
  "Ms. Kamala Adhikari"
]);
var SCHOOL_FACTS_MIGRATION_VERSION = "school-facts-2028-v1";
function migrateSchoolFacts(state) {
  const changedModules = /* @__PURE__ */ new Set();
  const school = state.school;
  const setSchoolValue = (key, value) => {
    if (school[key] !== value) {
      school[key] = value;
      changedModules.add("school");
    }
  };
  if (school.estd_bs === "2035 B.S.") setSchoolValue("estd_bs", "2028 B.S.");
  if (school.estd_ad === "1978 A.D.") setSchoolValue("estd_ad", "");
  setSchoolValue("chairman_name_en", "Jhakabir Khatri");
  setSchoolValue("chairman_name_np", "\u091D\u0915\u092C\u093F\u0930 \u0916\u0924\u094D\u0930\u0940");
  setSchoolValue("chairman_designation_en", "Chairman, School Management Committee");
  setSchoolValue("chairman_designation_np", "\u0905\u0927\u094D\u092F\u0915\u094D\u0937, \u0935\u093F\u0926\u094D\u092F\u093E\u0932\u092F \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E\u092A\u0928 \u0938\u092E\u093F\u0924\u093F");
  setSchoolValue("chairman_message_en", school.chairman_message_en || "Ishwari Secondary School is committed to quality, inclusion, and transparent school governance.");
  setSchoolValue("chairman_message_np", school.chairman_message_np || "\u0908\u0936\u094D\u0935\u0930\u0940 \u092E\u093E\u0927\u094D\u092F\u092E\u093F\u0915 \u0935\u093F\u0926\u094D\u092F\u093E\u0932\u092F \u0917\u0941\u0923\u0938\u094D\u0924\u0930\u0940\u092F, \u0938\u092E\u093E\u0935\u0947\u0936\u0940 \u0930 \u092A\u093E\u0930\u0926\u0930\u094D\u0936\u0940 \u0935\u093F\u0926\u094D\u092F\u093E\u0932\u092F \u0938\u0941\u0936\u093E\u0938\u0928\u092E\u093E \u092A\u094D\u0930\u0924\u093F\u092C\u0926\u094D\u0927 \u091B\u0964");
  setSchoolValue("chairman_status", school.chairman_status || "published");
  setSchoolValue("principal_name_en", "Mangal Khatri");
  setSchoolValue("principal_name_np", "\u092E\u0902\u0917\u0932 \u0916\u0924\u094D\u0930\u0940");
  setSchoolValue("principal_designation_en", "Principal");
  setSchoolValue("principal_designation_np", "\u092A\u094D\u0930\u0927\u093E\u0928\u093E\u0927\u094D\u092F\u093E\u092A\u0915");
  if (/2035|four decades/i.test(school.principal_message_en || "")) {
    setSchoolValue("principal_message_en", "Welcome to Ishwari Secondary School. We are committed to supporting student learning and development.");
  }
  if (/२०३५|चार दशक/.test(school.principal_message_np || "")) {
    setSchoolValue("principal_message_np", "\u0908\u0936\u094D\u0935\u0930\u0940 \u092E\u093E\u0927\u094D\u092F\u092E\u093F\u0915 \u0935\u093F\u0926\u094D\u092F\u093E\u0932\u092F\u0915\u094B \u0906\u0927\u093F\u0915\u093E\u0930\u093F\u0915 \u0921\u093F\u091C\u093F\u091F\u0932 \u092A\u094B\u0930\u094D\u091F\u0932\u092E\u093E \u0939\u093E\u0930\u094D\u0926\u093F\u0915 \u0938\u094D\u0935\u093E\u0917\u0924 \u091B\u0964 \u0935\u093F\u0926\u094D\u092F\u093E\u0930\u094D\u0925\u0940\u0939\u0930\u0942\u0915\u094B \u0938\u093F\u0915\u093E\u0907 \u0930 \u0938\u0930\u094D\u0935\u093E\u0919\u094D\u0917\u0940\u0923 \u0935\u093F\u0915\u093E\u0938\u092E\u093E \u0939\u093E\u092E\u0940 \u092A\u094D\u0930\u0924\u093F\u092C\u0926\u094D\u0927 \u091B\u094C\u0902\u0964");
  }
  const existingStaff = Array.isArray(state.staff) ? state.staff : [];
  const nextStaff = existingStaff.filter((member) => !outdatedSeedStaffNames.has(member.name_en.trim()) || member.role === "principal").map((member) => {
    if (member.role !== "principal") return member;
    if (member.name_en === "Mangal Khatri" && member.name_np === "\u092E\u0902\u0917\u0932 \u0916\u0924\u094D\u0930\u0940" && member.designation_en === "Principal" && member.designation_np === "\u092A\u094D\u0930\u0927\u093E\u0928\u093E\u0927\u094D\u092F\u093E\u092A\u0915") return member;
    return {
      ...member,
      name_en: "Mangal Khatri",
      name_np: "\u092E\u0902\u0917\u0932 \u0916\u0924\u094D\u0930\u0940",
      designation_en: "Principal",
      designation_np: "\u092A\u094D\u0930\u0927\u093E\u0928\u093E\u0927\u094D\u092F\u093E\u092A\u0915"
    };
  });
  if (!nextStaff.some((member) => member.role === "principal")) {
    nextStaff.push({ ...initialStaff[0], id: Math.max(0, ...nextStaff.map((member) => member.id)) + 1 });
  }
  if (!nextStaff.some((member) => member.name_en === "Bhim Bahadur Khatri")) {
    nextStaff.push({ ...initialStaff[1], id: Math.max(0, ...nextStaff.map((member) => member.id)) + 1 });
  }
  if (nextStaff.length !== existingStaff.length || nextStaff.some((member, index) => member !== existingStaff[index])) {
    state.staff = nextStaff;
    changedModules.add("staff");
  }
  const intro = state.aboutSections?.find((section) => section.id === "about-intro");
  if (intro) {
    const updatedContentEn = intro.content_en.replace(/2035 B\.S\./g, "2028 B.S.");
    const updatedContentNp = intro.content_np.replace(/वि\.सं\. २०३५/g, "\u0935\u093F.\u0938\u0902. \u0968\u0966\u0968\u096E");
    if (updatedContentEn !== intro.content_en || updatedContentNp !== intro.content_np) {
      intro.content_en = updatedContentEn;
      intro.content_np = updatedContentNp;
      changedModules.add("aboutSections");
    }
  }
  const foundingMilestone = state.history?.find(
    (item) => item.year.startsWith("2035 B.S.") && /founding|establishment/i.test(item.title_en)
  );
  if (foundingMilestone) {
    foundingMilestone.year = "2028 B.S.";
    changedModules.add("history");
  }
  const siteConfig = state.siteConfig;
  if (siteConfig) {
    const heroTitleEn = "Cultivating Academic Excellence & Responsible Citizens Since 2028 B.S.";
    const heroTitleNp = "\u0935\u093F.\u0938\u0902. \u0968\u0966\u0968\u096E \u0926\u0947\u0916\u093F \u0936\u0948\u0915\u094D\u0937\u093F\u0915 \u0909\u0924\u094D\u0915\u0943\u0937\u094D\u091F\u0924\u093E \u0930 \u0928\u0948\u0924\u093F\u0915 \u091A\u0930\u093F\u0924\u094D\u0930 \u0928\u093F\u0930\u094D\u092E\u093E\u0923\u092E\u093E \u0938\u092E\u0930\u094D\u092A\u093F\u0924\u0964";
    if ((siteConfig.heroTitleEn || "").includes("2035 B.S.")) {
      siteConfig.heroTitleEn = heroTitleEn;
      changedModules.add("siteConfig");
    }
    if ((siteConfig.heroTitleNp || "").includes("\u091A\u093E\u0930 \u0926\u0936\u0915")) {
      siteConfig.heroTitleNp = heroTitleNp;
      changedModules.add("siteConfig");
    }
    if (siteConfig.footerDescEn?.includes("2035 B.S.")) {
      siteConfig.footerDescEn = siteConfig.footerDescEn.replace("2035 B.S.", "2028 B.S.");
      changedModules.add("siteConfig");
    }
    if (siteConfig.stats?.years === "48") {
      siteConfig.stats.years = "2028 B.S.";
      siteConfig.stats.yearsLabelEn = "Established";
      siteConfig.stats.yearsLabelNp = "\u0938\u094D\u0925\u093E\u092A\u0928\u093E";
      changedModules.add("siteConfig");
    }
  }
  return changedModules;
}
var CMSDatabaseManager = class {
  constructor() {
    this.emitter = new EventEmitter();
    this.isInitialLoadDone = false;
    this.loadPromise = null;
    // Rate-limiting / brute force protection
    this.loginAttempts = /* @__PURE__ */ new Map();
    this.firestore = getFirestoreDb();
    this.state = this.getDefaultState();
    this.ensureLoaded().catch((err) => {
      console.warn("[CMS Firestore] Initial load error:", err);
    });
  }
  getDefaultState() {
    const secureAdminAccounts = initialAdminAccounts.map((acc) => {
      const isBcrypt = acc.passwordHash?.startsWith("$2b$") || acc.passwordHash?.startsWith("$2a$");
      return {
        ...acc,
        passwordHash: isBcrypt ? acc.passwordHash : hashPasswordBcrypt(acc.passwordHash)
      };
    });
    return {
      version: 1,
      lastModified: (/* @__PURE__ */ new Date()).toISOString(),
      school: { ...initialSchoolData },
      aboutSections: [...defaultAboutSections],
      notices: [...initialNotices],
      staff: [...initialStaff],
      facilities: [...initialFacilities],
      programs: [...initialPrograms],
      documents: [...initialDocuments],
      curriculumGuidelines: [...initialCurriculumGuidelines],
      vacancies: [...initialVacancies],
      messages: [...initialMessages],
      events: [...initialEvents],
      achievements: [...initialAchievements],
      history: [...initialHistory],
      gallery: [...initialGallery],
      faqs: [...initialFAQs],
      siteConfig: { ...initialSiteConfig },
      securityConfig: { ...initialSecurityConfig },
      auditLogs: [...initialAuditLogs],
      adminAccounts: secureAdminAccounts
    };
  }
  /**
   * Authoritative loader:
   * Connects directly to Firestore to guarantee that Vercel serverless containers
   * always use the true persistent database state as single source of truth.
   */
  async ensureLoaded(forceFresh = false) {
    if (this.loadPromise && !forceFresh) {
      return this.loadPromise;
    }
    this.loadPromise = (async () => {
      try {
        const metaRef = doc(this.firestore, "cms_modules", "_metadata");
        const metaSnap = await getDoc(metaRef);
        if (!metaSnap.exists()) {
          const defaultState = this.getDefaultState();
          for (const key of CMS_MODULE_KEYS) {
            await setDoc(doc(this.firestore, "cms_modules", key), {
              moduleId: key,
              data: defaultState[key],
              updatedAt: (/* @__PURE__ */ new Date()).toISOString()
            });
          }
          await setDoc(metaRef, {
            version: defaultState.version,
            lastModified: defaultState.lastModified,
            schoolFactsMigration: SCHOOL_FACTS_MIGRATION_VERSION
          });
          this.state = defaultState;
          this.isInitialLoadDone = true;
          return this.state;
        }
        const remoteMeta = metaSnap.data();
        const remoteVersion = remoteMeta?.version || 1;
        if (this.isInitialLoadDone && !forceFresh && this.state && this.state.version >= remoteVersion) {
          return this.state;
        }
        const moduleSnaps = await Promise.all(
          CMS_MODULE_KEYS.map((key) => getDoc(doc(this.firestore, "cms_modules", key)))
        );
        const loadedState = {
          version: remoteVersion,
          lastModified: remoteMeta.lastModified || (/* @__PURE__ */ new Date()).toISOString()
        };
        const defaultFallback = this.getDefaultState();
        moduleSnaps.forEach((snap, idx) => {
          const key = CMS_MODULE_KEYS[idx];
          if (snap.exists()) {
            const docData = snap.data();
            loadedState[key] = docData.data !== void 0 ? docData.data : defaultFallback[key];
          } else {
            loadedState[key] = defaultFallback[key];
          }
        });
        if (remoteMeta.schoolFactsMigration !== SCHOOL_FACTS_MIGRATION_VERSION) {
          const migratedModules = migrateSchoolFacts(loadedState);
          const migrationTimestamp = (/* @__PURE__ */ new Date()).toISOString();
          const migratedVersion = remoteVersion + (migratedModules.size > 0 ? 1 : 0);
          if (migratedModules.size > 0) {
            await Promise.all(
              [...migratedModules].map(
                (moduleKey) => setDoc(doc(this.firestore, "cms_modules", moduleKey), {
                  moduleId: moduleKey,
                  data: loadedState[moduleKey],
                  updatedAt: migrationTimestamp
                })
              )
            );
            loadedState.version = migratedVersion;
            loadedState.lastModified = migrationTimestamp;
          }
          await setDoc(metaRef, {
            ...remoteMeta,
            version: migratedVersion,
            lastModified: loadedState.lastModified,
            schoolFactsMigration: SCHOOL_FACTS_MIGRATION_VERSION
          });
        }
        this.state = loadedState;
        this.isInitialLoadDone = true;
        return this.state;
      } catch (err) {
        console.error("[CMS Firestore] Failed to refresh authoritative state:", err);
        if (!this.state) {
          this.state = this.getDefaultState();
        }
        throw err;
      } finally {
        this.loadPromise = null;
      }
    })();
    return this.loadPromise;
  }
  init() {
    return this.state;
  }
  getState() {
    return this.state;
  }
  getVersion() {
    return { version: this.state.version, lastModified: this.state.lastModified };
  }
  getPublicState() {
    const s = this.getState();
    const { recoveryPin, ...publicSecConfig } = s.securityConfig;
    return {
      version: s.version,
      lastModified: s.lastModified,
      school: s.school,
      aboutSections: s.aboutSections || defaultAboutSections,
      notices: (s.notices || initialNotices).filter((item) => item.published !== false && item.is_published !== false),
      staff: s.staff,
      facilities: s.facilities,
      programs: s.programs,
      documents: s.documents,
      curriculumGuidelines: (s.curriculumGuidelines || []).filter((item) => item.status === "published"),
      vacancies: (s.vacancies || initialVacancies).filter((item) => item.status === "published" && item.is_open !== false),
      messages: s.messages,
      events: s.events,
      achievements: s.achievements,
      history: (s.history || []).filter((item) => item.status !== "unpublished" && item.is_enabled !== false),
      gallery: s.gallery,
      faqs: (s.faqs || initialFAQs).filter((item) => item.status !== "draft"),
      siteConfig: s.siteConfig,
      securityConfig: publicSecConfig,
      auditLogs: s.auditLogs
    };
  }
  subscribe(listener) {
    this.emitter.on("change", listener);
    return () => {
      this.emitter.off("change", listener);
    };
  }
  /* ---------------- SESSION MANAGEMENT ---------------- */
  async createSession(account, ip, userAgent) {
    const timeoutMinutes = this.state.securityConfig?.sessionTimeoutMinutes || 60;
    const now = Date.now();
    const sessionDurationMs = Math.max(1, timeoutMinutes) * 60 * 1e3;
    const expiresAt = now + sessionDurationMs;
    const sessionData = {
      userId: account.id,
      username: account.username,
      fullName: account.fullName,
      role: account.role,
      permissions: account.role === "super_admin" ? ALL_PERMISSIONS.map((p) => p.key) : account.permissions,
      createdAt: now,
      lastActivity: now,
      expiresAt,
      ip,
      userAgent
    };
    const token = `iss2.${crypto2.randomBytes(32).toString("base64url")}`;
    const session = { ...sessionData, token };
    const tokenHash = crypto2.createHash("sha256").update(token).digest("hex");
    const lockRef = doc(this.firestore, "session_role_locks", account.role);
    const sessionRef = doc(this.firestore, "sessions", tokenHash);
    const claimed = await runTransaction(this.firestore, async (transaction) => {
      const lockSnapshot = await transaction.get(lockRef);
      const existingLock = lockSnapshot.exists() ? lockSnapshot.data() : void 0;
      let existingSessionSnapshot;
      const existingTokenHash = typeof existingLock?.tokenHash === "string" && /^[a-f0-9]{64}$/i.test(existingLock.tokenHash) ? existingLock.tokenHash : void 0;
      if (existingTokenHash) {
        existingSessionSnapshot = await transaction.get(
          doc(this.firestore, "sessions", existingTokenHash)
        );
      }
      const existingSession = existingSessionSnapshot?.exists() ? existingSessionSnapshot.data() : void 0;
      const existingAccount = existingSession ? this.state.adminAccounts.find((item) => item.id === existingSession.userId) : void 0;
      const hasValidExistingSession = existingLock && existingSession && existingLock.tokenHash === existingTokenHash && existingLock.userId === existingSession.userId && Number(existingLock.expiresAt) > now && Number(existingSession.expiresAt) > now && existingSession.role === account.role && existingAccount?.status === "active" && existingAccount.role === account.role;
      if (hasValidExistingSession) return false;
      if (existingTokenHash) {
        transaction.delete(doc(this.firestore, "sessions", existingTokenHash));
      }
      transaction.set(sessionRef, sessionData);
      transaction.set(lockRef, {
        tokenHash,
        userId: account.id,
        username: account.username,
        role: account.role,
        expiresAt,
        updatedAt: now
      });
      return true;
    });
    if (!claimed) return null;
    return session;
  }
  async validateSession(token) {
    if (!token) return null;
    const now = Date.now();
    const tokenHash = crypto2.createHash("sha256").update(token).digest("hex");
    const sessionRef = doc(this.firestore, "sessions", tokenHash);
    const sessionData = await runTransaction(this.firestore, async (transaction) => {
      const sessionSnapshot = await transaction.get(sessionRef);
      if (!sessionSnapshot.exists()) return null;
      const storedSession = sessionSnapshot.data();
      if (typeof storedSession.userId !== "string" || typeof storedSession.username !== "string" || !Number.isFinite(Number(storedSession.createdAt)) || !Number.isFinite(Number(storedSession.expiresAt))) return null;
      if (storedSession.token && storedSession.token !== token) return null;
      if (!storedSession.token && !token.startsWith("iss2.")) return null;
      if (!["admin", "super_admin"].includes(storedSession.role)) return null;
      const lockRef = doc(this.firestore, "session_role_locks", storedSession.role);
      const lockSnapshot = await transaction.get(lockRef);
      if (!lockSnapshot.exists()) return null;
      const roleLock = lockSnapshot.data();
      if (roleLock.tokenHash !== tokenHash || roleLock.userId !== storedSession.userId || Number(roleLock.expiresAt) <= now || Number(storedSession.expiresAt) <= now) return null;
      return storedSession;
    });
    if (!sessionData) return null;
    const s = this.state;
    const account = s.adminAccounts.find(
      (a) => a.id === sessionData.userId || a.username.toLowerCase() === sessionData.username.toLowerCase()
    );
    if (!account || account.status !== "active") {
      await this.destroySession(token);
      return null;
    }
    if (account.role !== sessionData.role) {
      await this.destroySession(token);
      return null;
    }
    const session = {
      token,
      userId: sessionData.userId,
      username: sessionData.username,
      fullName: sessionData.fullName,
      role: account.role,
      permissions: account.role === "super_admin" ? ALL_PERMISSIONS.map((p) => p.key) : account.permissions,
      createdAt: Number(sessionData.createdAt),
      lastActivity: now,
      expiresAt: Number(sessionData.expiresAt),
      ip: sessionData.ip || "127.0.0.1",
      userAgent: sessionData.userAgent || "Unknown Browser"
    };
    return session;
  }
  async refreshSession(token) {
    const session = await this.validateSession(token);
    if (!session || !token) return null;
    const now = Date.now();
    const timeoutMinutes = this.state.securityConfig?.sessionTimeoutMinutes || 60;
    const expiresAt = now + Math.max(1, timeoutMinutes) * 60 * 1e3;
    const refreshedSessionData = {
      userId: session.userId,
      username: session.username,
      fullName: session.fullName,
      role: session.role,
      permissions: session.permissions,
      createdAt: session.createdAt,
      lastActivity: now,
      expiresAt,
      ip: session.ip,
      userAgent: session.userAgent
    };
    const refreshedSession = {
      ...refreshedSessionData,
      token: `iss2.${crypto2.randomBytes(32).toString("base64url")}`
    };
    const previousTokenHash = crypto2.createHash("sha256").update(token).digest("hex");
    const refreshedTokenHash = crypto2.createHash("sha256").update(refreshedSession.token).digest("hex");
    const lockRef = doc(this.firestore, "session_role_locks", session.role);
    const previousSessionRef = doc(this.firestore, "sessions", previousTokenHash);
    const refreshedSessionRef = doc(this.firestore, "sessions", refreshedTokenHash);
    const claimed = await runTransaction(this.firestore, async (transaction) => {
      const lockSnapshot = await transaction.get(lockRef);
      const sessionSnapshot = await transaction.get(previousSessionRef);
      const existingLock = lockSnapshot.exists() ? lockSnapshot.data() : void 0;
      const existingSession = sessionSnapshot.exists() ? sessionSnapshot.data() : void 0;
      if (!existingLock || !existingSession || existingLock.tokenHash !== previousTokenHash || existingLock.userId !== session.userId || existingSession.userId !== session.userId || existingSession.role !== session.role || existingSession.token && existingSession.token !== token || Number(existingLock.expiresAt) <= now || Number(existingSession.expiresAt) <= now) {
        return false;
      }
      transaction.delete(previousSessionRef);
      transaction.set(refreshedSessionRef, refreshedSessionData);
      transaction.set(lockRef, {
        ...existingLock,
        tokenHash: refreshedTokenHash,
        userId: session.userId,
        expiresAt,
        updatedAt: now
      });
      return true;
    });
    if (!claimed) return null;
    return refreshedSession;
  }
  async destroySession(token) {
    if (!token) return false;
    const tokenHash = crypto2.createHash("sha256").update(token).digest("hex");
    const sessionRef = doc(this.firestore, "sessions", tokenHash);
    const roleLockRefs = ["admin", "super_admin"].map(
      (role) => doc(this.firestore, "session_role_locks", role)
    );
    await runTransaction(this.firestore, async (transaction) => {
      const lockSnapshots = await Promise.all(roleLockRefs.map((lockRef) => transaction.get(lockRef)));
      transaction.delete(sessionRef);
      lockSnapshots.forEach((lockSnapshot, index) => {
        if (lockSnapshot.exists() && lockSnapshot.data().tokenHash === tokenHash) {
          transaction.delete(roleLockRefs[index]);
        }
      });
    });
    return true;
  }
  /* ---------------- BRUTE FORCE & RATE LIMITING ---------------- */
  checkRateLimit(identifier) {
    const entry = this.loginAttempts.get(identifier);
    if (!entry) return { isLocked: false, remainingSeconds: 0 };
    const now = Date.now();
    if (entry.lockoutUntil > now) {
      return {
        isLocked: true,
        remainingSeconds: Math.ceil((entry.lockoutUntil - now) / 1e3)
      };
    }
    if (entry.lockoutUntil > 0 && entry.lockoutUntil <= now) {
      this.loginAttempts.delete(identifier);
    }
    return { isLocked: false, remainingSeconds: 0 };
  }
  recordFailedAttempt(identifier) {
    const s = this.state;
    const threshold = s.securityConfig?.lockoutThreshold || 5;
    const durationMinutes = s.securityConfig?.lockoutDurationMinutes || 5;
    const now = Date.now();
    const entry = this.loginAttempts.get(identifier) || {
      attempts: 0,
      lastAttempt: now,
      lockoutUntil: 0
    };
    entry.attempts += 1;
    entry.lastAttempt = now;
    if (entry.attempts >= threshold) {
      entry.lockoutUntil = now + durationMinutes * 60 * 1e3;
      this.loginAttempts.set(identifier, entry);
      return {
        isLocked: true,
        remainingAttempts: 0,
        remainingSeconds: durationMinutes * 60
      };
    }
    this.loginAttempts.set(identifier, entry);
    return {
      isLocked: false,
      remainingAttempts: Math.max(0, threshold - entry.attempts),
      remainingSeconds: 0
    };
  }
  recordSuccessfulAttempt(identifier) {
    this.loginAttempts.delete(identifier);
  }
  /* ---------------- SERVER-SIDE RBAC CHECKS ---------------- */
  checkPermission(session, moduleKey) {
    if (session.role === "super_admin") {
      return { allowed: true };
    }
    if (session.role === "admin") {
      if (moduleKey === "adminAccounts") {
        return { allowed: false, reason: "Super Admin privilege required to manage administrator accounts." };
      }
      if (moduleKey === "securityConfig") {
        return { allowed: false, reason: "Super Admin privilege required to modify security configuration." };
      }
      if (moduleKey === "reset") {
        return { allowed: false, reason: "Super Admin privilege required to reset CMS data." };
      }
      const perms = session.permissions || [];
      const hasExplicitMenus = perms.some((p) => p.startsWith("menu."));
      const checkHierarchy = (menuKey, submenuKey, actionCheck) => {
        if (hasExplicitMenus) {
          if (!perms.includes(menuKey)) return false;
          if (!perms.includes(submenuKey)) return false;
        }
        return actionCheck();
      };
      if (moduleKey === "notices") {
        const allowed = checkHierarchy(
          "menu.content",
          "submenu.content_notices",
          () => perms.some((p) => p.startsWith("notice."))
        );
        return allowed ? { allowed: true } : { allowed: false, reason: "Content menu and Notice management permissions required." };
      }
      if (moduleKey === "vacancies" || moduleKey === "career") {
        const allowed = checkHierarchy(
          "menu.content",
          "submenu.content_career",
          () => perms.some((p) => p.startsWith("career."))
        );
        return allowed ? { allowed: true } : { allowed: false, reason: "Content menu and Career management permissions required." };
      }
      if (moduleKey === "documents") {
        const allowed = checkHierarchy(
          "menu.content",
          "submenu.content_documents",
          () => perms.some((p) => p.startsWith("document."))
        );
        return allowed ? { allowed: true } : { allowed: false, reason: "Content menu and Document management permissions required." };
      }
      if (moduleKey === "curriculumGuidelines" || moduleKey === "curriculum") {
        const allowed = checkHierarchy(
          "menu.content",
          "submenu.content_curriculum",
          () => perms.some((p) => p.startsWith("curriculum."))
        );
        return allowed ? { allowed: true } : { allowed: false, reason: "Content menu and Curriculum guidelines permissions required." };
      }
      if (moduleKey === "events") {
        const allowed = checkHierarchy(
          "menu.content",
          "submenu.content_events",
          () => perms.some((p) => p.startsWith("event."))
        );
        return allowed ? { allowed: true } : { allowed: false, reason: "Content menu and Events management permissions required." };
      }
      if (moduleKey === "achievements") {
        const allowed = checkHierarchy(
          "menu.content",
          "submenu.content_achievements",
          () => perms.some((p) => p.startsWith("achievement."))
        );
        return allowed ? { allowed: true } : { allowed: false, reason: "Content menu and Achievements permissions required." };
      }
      if (moduleKey === "history") {
        const allowed = checkHierarchy(
          "menu.content",
          "submenu.content_history",
          () => perms.some((p) => p.startsWith("history."))
        );
        return allowed ? { allowed: true } : { allowed: false, reason: "Content menu and History permissions required." };
      }
      if (moduleKey === "faqs") {
        const allowed = checkHierarchy(
          "menu.content",
          "submenu.content_faq",
          () => perms.some((p) => p.startsWith("faq.") || p.startsWith("content.")) || true
        );
        return allowed ? { allowed: true } : { allowed: false, reason: "Content menu and FAQ permissions required." };
      }
      if (moduleKey === "aboutSections" || moduleKey === "about" || moduleKey === "facilities" || moduleKey === "programs") {
        const allowed = checkHierarchy(
          "menu.content",
          "submenu.content_about",
          () => perms.some((p) => p.startsWith("about.") || p.startsWith("facility.") || p.startsWith("program."))
        );
        return allowed ? { allowed: true } : { allowed: false, reason: "Content menu and School profile permissions required." };
      }
      if (moduleKey === "staff") {
        const allowed = checkHierarchy(
          "menu.governance",
          "submenu.gov_staff",
          () => perms.some((p) => p.startsWith("teacher.") || p.startsWith("staff."))
        );
        return allowed ? { allowed: true } : { allowed: false, reason: "Governance menu and Faculty / staff permissions required." };
      }
      if (moduleKey === "gallery") {
        const allowed = checkHierarchy(
          "menu.media",
          "submenu.media_gallery",
          () => perms.some((p) => p.startsWith("gallery."))
        );
        return allowed ? { allowed: true } : { allowed: false, reason: "Media menu and Gallery permissions required." };
      }
      if (moduleKey === "messages") {
        const allowed = checkHierarchy(
          "menu.communication",
          "submenu.comm_contact",
          () => perms.some((p) => p.startsWith("message."))
        );
        return allowed ? { allowed: true } : { allowed: false, reason: "Communication menu and Contact inquiries permissions required." };
      }
      if (moduleKey === "siteConfig" || moduleKey === "school") {
        if (hasExplicitMenus && !perms.includes("menu.website") && !perms.includes("menu.system")) {
          return { allowed: false, reason: "Website or System menu permission required." };
        }
        const hasSettings = perms.includes("settings.update") || perms.includes("settings.view");
        return hasSettings ? { allowed: true } : { allowed: false, reason: "Site configuration permission required." };
      }
      if (moduleKey === "auditLogs") {
        const allowed = checkHierarchy(
          "menu.system",
          "submenu.sys_audit",
          () => perms.includes("audit.view")
        );
        return allowed ? { allowed: true } : { allowed: false, reason: "System menu and Audit log viewing permissions required." };
      }
    }
    return { allowed: false, reason: "Insufficient privileges for this action." };
  }
  /* ---------------- CMS DATABASE OPERATIONS ---------------- */
  async updateModule(moduleKey, data, actor = "Admin", ipAddress = "127.0.0.1", minVersion) {
    await this.ensureLoaded();
    const s = this.state;
    if (moduleKey === "adminAccounts" && Array.isArray(data)) {
      data = data.map((acc) => {
        const isBcrypt = acc.passwordHash?.startsWith("$2b$") || acc.passwordHash?.startsWith("$2a$");
        return {
          ...acc,
          passwordHash: isBcrypt ? acc.passwordHash : hashPasswordBcrypt(acc.passwordHash || "Ishwari@Secure2026")
        };
      });
    }
    const newVersion = Math.max(s.version || 1, minVersion || 0) + 1;
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    s[moduleKey] = data;
    s.version = newVersion;
    s.lastModified = nowIso;
    let newLogs = s.auditLogs;
    if (moduleKey !== "auditLogs") {
      const newLog = {
        id: "log-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
        timestamp: nowIso.replace("T", " ").substring(0, 19),
        action: `CMS Module Update [${String(moduleKey)}]`,
        actor,
        ipAddress,
        status: "success",
        result: "success",
        severity: "info",
        details: `Updated ${String(moduleKey)} content in authoritative Firestore database`
      };
      newLogs = [newLog, ...(s.auditLogs || []).slice(0, 199)];
      s.auditLogs = newLogs;
    }
    const writes = [
      setDoc(doc(this.firestore, "cms_modules", String(moduleKey)), {
        moduleId: String(moduleKey),
        data,
        updatedAt: nowIso
      })
    ];
    if (moduleKey !== "auditLogs") {
      writes.push(
        setDoc(doc(this.firestore, "cms_modules", "auditLogs"), {
          moduleId: "auditLogs",
          data: newLogs,
          updatedAt: nowIso
        })
      );
    }
    await Promise.all(writes);
    await setDoc(doc(this.firestore, "cms_modules", "_metadata"), {
      version: newVersion,
      lastModified: nowIso
    });
    this.emitter.emit("change", { module: String(moduleKey), version: newVersion, lastModified: nowIso });
    return { version: newVersion, lastModified: nowIso };
  }
  async updateBatch(batch, actor = "Super Admin", ipAddress = "127.0.0.1", minVersion) {
    await this.ensureLoaded();
    const s = this.state;
    if (batch.adminAccounts && Array.isArray(batch.adminAccounts)) {
      batch.adminAccounts = batch.adminAccounts.map((acc) => {
        const isBcrypt = acc.passwordHash?.startsWith("$2b$") || acc.passwordHash?.startsWith("$2a$");
        return {
          ...acc,
          passwordHash: isBcrypt ? acc.passwordHash : hashPasswordBcrypt(acc.passwordHash || "Ishwari@Secure2026")
        };
      });
    }
    const newVersion = Math.max(s.version || 1, minVersion || 0) + 1;
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    for (const key of Object.keys(batch)) {
      if (key in s && batch[key] !== void 0) {
        s[key] = batch[key];
      }
    }
    s.version = newVersion;
    s.lastModified = nowIso;
    const newLog = {
      id: "log-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      timestamp: nowIso.replace("T", " ").substring(0, 19),
      action: `CMS Batch Update [${Object.keys(batch).join(", ")}]`,
      actor,
      ipAddress,
      status: "success",
      result: "success",
      severity: "info",
      details: `Batch synchronization applied across ${Object.keys(batch).length} modules`
    };
    s.auditLogs = [newLog, ...(s.auditLogs || []).slice(0, 199)];
    const writes = Object.keys(batch).map(
      (key) => setDoc(doc(this.firestore, "cms_modules", key), {
        moduleId: key,
        data: s[key],
        updatedAt: nowIso
      })
    );
    writes.push(
      setDoc(doc(this.firestore, "cms_modules", "auditLogs"), {
        moduleId: "auditLogs",
        data: s.auditLogs,
        updatedAt: nowIso
      })
    );
    await Promise.all(writes);
    await setDoc(doc(this.firestore, "cms_modules", "_metadata"), {
      version: newVersion,
      lastModified: nowIso
    });
    this.emitter.emit("change", { module: "batch", version: newVersion, lastModified: nowIso });
    return { version: newVersion, lastModified: nowIso };
  }
  async addContactMessage(message) {
    await this.ensureLoaded();
    const s = this.state;
    const newMsg = {
      id: message.id || Date.now(),
      name: message.name,
      email: message.email,
      phone: message.phone,
      subject: message.subject,
      message: message.message,
      date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      status: "new"
    };
    s.messages = [newMsg, ...s.messages || []];
    s.version = (s.version || 1) + 1;
    s.lastModified = (/* @__PURE__ */ new Date()).toISOString();
    await Promise.all([
      setDoc(doc(this.firestore, "cms_modules", "messages"), {
        moduleId: "messages",
        data: s.messages,
        updatedAt: s.lastModified
      })
    ]);
    await setDoc(doc(this.firestore, "cms_modules", "_metadata"), {
      version: s.version,
      lastModified: s.lastModified
    });
    this.emitter.emit("change", { module: "messages", version: s.version, lastModified: s.lastModified });
    return newMsg;
  }
  async appendAuditLog(entry) {
    await this.ensureLoaded();
    const s = this.state;
    const newEntry = {
      id: "log-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      timestamp: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 19),
      ...entry
    };
    s.auditLogs = [newEntry, ...(s.auditLogs || []).slice(0, 199)];
    await setDoc(doc(this.firestore, "cms_modules", "auditLogs"), {
      moduleId: "auditLogs",
      data: s.auditLogs,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }).catch((err) => console.warn("[CMS Firestore] appendAuditLog error:", err));
  }
  async resetToDefaults(actor = "Super Admin", ipAddress = "127.0.0.1") {
    const defaultState = this.getDefaultState();
    defaultState.version = Date.now();
    defaultState.lastModified = (/* @__PURE__ */ new Date()).toISOString();
    const newLog = {
      id: "log-" + Date.now(),
      timestamp: defaultState.lastModified.replace("T", " ").substring(0, 19),
      action: "CMS Database Factory Reset",
      actor,
      ipAddress,
      status: "warning",
      result: "success",
      severity: "warning",
      details: "All modules restored to initial authoritative baseline in Firestore"
    };
    defaultState.auditLogs = [newLog];
    const writes = CMS_MODULE_KEYS.map(
      (key) => setDoc(doc(this.firestore, "cms_modules", key), {
        moduleId: key,
        data: defaultState[key],
        updatedAt: defaultState.lastModified
      })
    );
    await Promise.all(writes);
    await setDoc(doc(this.firestore, "cms_modules", "_metadata"), {
      version: defaultState.version,
      lastModified: defaultState.lastModified
    });
    this.state = defaultState;
    this.emitter.emit("change", { module: "all", version: defaultState.version, lastModified: defaultState.lastModified });
    return { version: defaultState.version, lastModified: defaultState.lastModified };
  }
  /* ---------------- DURABLE OBJECT/FILE STORAGE IN FIRESTORE ---------------- */
  async saveUploadedFile(filename, category, mimeType, base64Data, size) {
    try {
      const fileRef = doc(this.firestore, "uploaded_files", filename);
      await setDoc(fileRef, {
        filename,
        category,
        mimeType,
        base64Data,
        size,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (err) {
      console.warn("[CMS Firestore] Error saving uploaded file to Firestore:", filename, err);
    }
  }
  async getUploadedFile(filename) {
    try {
      const fileRef = doc(this.firestore, "uploaded_files", filename);
      const snap = await getDoc(fileRef);
      if (snap.exists()) {
        const d = snap.data();
        return {
          base64Data: d.base64Data,
          mimeType: d.mimeType || "application/pdf",
          size: d.size || 0
        };
      }
    } catch (err) {
      console.warn("[CMS Firestore] Error retrieving uploaded file from Firestore:", filename, err);
    }
    return null;
  }
  async deleteUploadedFile(filename) {
    try {
      const fileRef = doc(this.firestore, "uploaded_files", filename);
      await deleteDoc(fileRef);
    } catch (err) {
      console.warn("[CMS Firestore] Error deleting uploaded file from Firestore:", filename, err);
    }
  }
  async checkDatabaseHealth() {
    const start = Date.now();
    try {
      await this.ensureLoaded();
      const probeRef = doc(this.firestore, "cms_modules", "school");
      const snap = await getDoc(probeRef);
      const latencyMs = Date.now() - start;
      if (snap.exists() || this.isInitialLoadDone) {
        return {
          status: "healthy",
          latencyMs,
          details: "Firestore connection and memory state verified"
        };
      }
      return {
        status: "degraded",
        latencyMs,
        details: "Memory cache available but probe document absent"
      };
    } catch (err) {
      const latencyMs = Date.now() - start;
      const isNetwork = err?.code === "unavailable" || err?.message?.includes("offline") || err?.message?.includes("fetch failed");
      const isAuth = err?.code === "permission-denied";
      return {
        status: this.state ? "degraded" : "unavailable",
        latencyMs,
        errorCategory: isNetwork ? "NETWORK_UNREACHABLE" : isAuth ? "PERMISSION_DENIED" : "DATABASE_ERROR",
        details: err?.message || "Database connection probe failed"
      };
    }
  }
};
var db = new CMSDatabaseManager();

// backend/routes.ts
var apiRouter = express.Router();
function createSamplePdf(title, grade) {
  const content = `BT /F1 18 Tf 50 720 Td (${title.replace(/[\(\)]/g, "")}) Tj ET BT /F1 13 Tf 50 690 Td (Ishwari Secondary School - Curriculum Resource - ${grade.replace(/[\(\)]/g, "")}) Tj ET BT /F1 10 Tf 50 640 Td (1. Competencies and Learning Outcomes Framework) Tj ET BT /F1 9 Tf 50 610 Td (This official curriculum document specifies national competencies, pedagogical directives,) Tj ET BT /F1 9 Tf 50 595 Td (practical experimentation steps, internal assessment rubrics, and terminal SEE/NEB guidelines.) Tj ET BT /F1 9 Tf 50 560 Td (Curriculum Development Centre (CDC) & National Examinations Board (NEB) Prescribed Framework.) Tj ET BT /F1 9 Tf 50 530 Td (Ishwari Secondary School, Educational Planning & Evaluation Committee - 2083 B.S.) Tj ET`;
  const streamLength = Buffer.byteLength(content, "utf8");
  const pdfStr = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${streamLength} >>
stream
${content}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000340 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
420
%%EOF
`;
  return Buffer.from(pdfStr, "utf8");
}
function getBackendUploadDir(category) {
  const backendDir = path.join(process.cwd(), "backend", "uploads", category);
  if (!fs.existsSync(backendDir)) {
    try {
      fs.mkdirSync(backendDir, { recursive: true });
    } catch (e) {
      console.warn("Could not create backend upload directory:", backendDir, e);
    }
  }
  return backendDir;
}
function resolveUploadFilePath(category, filename) {
  const pBackend = path.join(process.cwd(), "backend", "uploads", category, filename);
  if (fs.existsSync(pBackend)) return pBackend;
  const pData = path.join(process.cwd(), "data", "uploads", category, filename);
  if (fs.existsSync(pData)) return pData;
  return null;
}
try {
  const currDir = getBackendUploadDir("curriculum");
  const samplePdfs = [
    { file: "curr-math-grade10.pdf", title: "Grade 10 Compulsory Mathematics Curriculum", grade: "Grade 10" },
    { file: "curr-science-grade9-10.pdf", title: "Grade 9-10 Science and Technology Practical Manual", grade: "Grade 9-10" },
    { file: "curr-physics-grade11-12.pdf", title: "Grade 11-12 Physics Practical Curriculum", grade: "Grade 11-12" },
    { file: "curr-english-grade6-8.pdf", title: "Basic Level English Language Guidelines", grade: "Grade 6-8" },
    { file: "curr-nepali-grade10.pdf", title: "Grade 10 Nepali Curriculum Framework", grade: "Grade 10" },
    { file: "curr-cs-grade11-12.pdf", title: "Grade 11-12 Computer Science Practical Manual", grade: "Grade 11-12" },
    { file: "curr-primary-draft.pdf", title: "Primary Integrated Curriculum Draft", grade: "Grade 1-5" }
  ];
  for (const item of samplePdfs) {
    const target = path.join(currDir, item.file);
    if (!fs.existsSync(target)) {
      fs.writeFileSync(target, createSamplePdf(item.title, item.grade));
    }
  }
} catch (err) {
  console.warn("Could not initialize sample curriculum PDFs in backend storage:", err);
}
apiRouter.use((req, res, next) => {
  res.setHeader("Cache-Control", "private, no-cache, no-store, must-revalidate, proxy-revalidate, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});
apiRouter.use((req, res, next) => {
  db.ensureLoaded().then(() => next()).catch(next);
});
function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const bearer = authHeader.substring(7).trim();
    if (bearer) return bearer;
  }
  const cookieToken = req.cookies?.ishwari_session;
  if (cookieToken) return cookieToken;
  return void 0;
}
function requireAuth(req, res, next) {
  const token = extractToken(req);
  db.validateSession(token).then((session) => {
    if (!session) {
      res.status(401).json({
        success: false,
        error: "Authentication session expired or invalid. Please log in to proceed."
      });
      return;
    }
    req.session = session;
    next();
  }).catch(next);
}
apiRouter.get("/health", (req, res) => {
  const versionInfo = db.getVersion();
  res.json({
    success: true,
    status: "ok",
    version: versionInfo.version,
    lastModified: versionInfo.lastModified,
    uptime: process.uptime(),
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
apiRouter.get("/cms/state", async (req, res, next) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  const token = extractToken(req);
  let session;
  try {
    session = await db.validateSession(token);
  } catch (err) {
    next(err);
    return;
  }
  const state = db.getState();
  if (session) {
    const sanitizedAccounts = state.adminAccounts.map((acc) => ({
      ...acc,
      passwordHash: "[PROTECTED_BCRYPT_HASH]"
    }));
    res.json({
      success: true,
      authenticated: true,
      role: session.role,
      version: state.version,
      lastModified: state.lastModified,
      data: {
        school: state.school,
        aboutSections: state.aboutSections || [],
        notices: state.notices,
        vacancies: state.vacancies || [],
        staff: state.staff,
        facilities: state.facilities,
        programs: state.programs,
        documents: state.documents,
        curriculumGuidelines: state.curriculumGuidelines || [],
        messages: state.messages,
        events: state.events,
        achievements: state.achievements,
        history: state.history,
        gallery: state.gallery,
        faqs: state.faqs || [],
        siteConfig: state.siteConfig,
        securityConfig: state.securityConfig,
        auditLogs: state.auditLogs,
        adminAccounts: sanitizedAccounts
      }
    });
    return;
  }
  const publicData = db.getPublicState();
  res.json({
    success: true,
    authenticated: false,
    version: publicData.version,
    lastModified: publicData.lastModified,
    data: publicData
  });
});
apiRouter.get("/cms/version", async (req, res, next) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
  res.setHeader("Pragma", "no-cache");
  const versionInfo = db.getVersion();
  res.json({
    success: true,
    version: versionInfo.version,
    lastModified: versionInfo.lastModified
  });
});
apiRouter.get("/notices", (req, res) => {
  res.json({ success: true, data: db.getState().notices || [] });
});
apiRouter.get("/gallery", (req, res) => {
  res.json({ success: true, data: db.getState().gallery || [] });
});
apiRouter.get("/teachers", (req, res) => {
  res.json({ success: true, data: db.getState().staff || [] });
});
apiRouter.get("/staff", (req, res) => {
  res.json({ success: true, data: db.getState().staff || [] });
});
apiRouter.get("/programs", (req, res) => {
  res.json({ success: true, data: db.getState().programs || [] });
});
apiRouter.get("/alumni", (req, res) => {
  res.json({ success: true, data: [] });
});
apiRouter.get("/faqs", (req, res) => {
  res.json({ success: true, data: db.getState().faqs || [] });
});
apiRouter.get("/events", (req, res) => {
  res.json({ success: true, data: db.getState().events || [] });
});
apiRouter.get("/facilities", (req, res) => {
  res.json({ success: true, data: db.getState().facilities || [] });
});
apiRouter.get("/cms/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();
  const current = db.getVersion();
  res.write(`event: handshake
data: ${JSON.stringify({ version: current.version, lastModified: current.lastModified })}

`);
  const unsubscribe = db.subscribe((change) => {
    try {
      res.write(`event: update
data: ${JSON.stringify(change)}

`);
    } catch {
    }
  });
  const pingTimer = setInterval(() => {
    try {
      res.write(": ping\n\n");
    } catch {
      clearInterval(pingTimer);
    }
  }, 2e4);
  req.on("close", () => {
    clearInterval(pingTimer);
    unsubscribe();
  });
});
var weatherCache = {};
apiRouter.get("/weather", async (req, res) => {
  const lat = parseFloat(req.query.latitude) || 28.2167;
  const lon = parseFloat(req.query.longitude) || 81.6033;
  const cacheKey = `${lat.toFixed(4)}_${lon.toFixed(4)}`;
  const now = Date.now();
  const cached = weatherCache[cacheKey];
  if (cached && now - cached.timestamp < 15 * 60 * 1e3) {
    return res.json({
      success: true,
      source: "cache",
      data: cached.data
    });
  }
  const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FKathmandu&forecast_days=4`;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);
    const apiRes = await fetch(openMeteoUrl, {
      signal: controller.signal,
      headers: {
        "Accept": "application/json",
        "User-Agent": "IshwariSecondarySchoolPortal/1.0"
      }
    });
    clearTimeout(timeoutId);
    if (!apiRes.ok) {
      throw new Error(`Open-Meteo returned status ${apiRes.status}`);
    }
    const json = await apiRes.json();
    weatherCache[cacheKey] = {
      timestamp: now,
      data: json
    };
    return res.json({
      success: true,
      source: "live",
      data: json
    });
  } catch {
    if (cached) {
      return res.json({
        success: true,
        source: "stale_cache",
        data: cached.data
      });
    }
    const baselineData = {
      current: {
        time: (/* @__PURE__ */ new Date()).toISOString(),
        temperature_2m: 26,
        apparent_temperature: 28,
        relative_humidity_2m: 62,
        weather_code: 1,
        wind_speed_10m: 7,
        precipitation: 0,
        is_day: 1
      },
      daily: {
        time: [
          (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
          new Date(Date.now() + 864e5).toISOString().split("T")[0],
          new Date(Date.now() + 1728e5).toISOString().split("T")[0],
          new Date(Date.now() + 2592e5).toISOString().split("T")[0]
        ],
        weather_code: [1, 0, 2, 1],
        temperature_2m_max: [31, 32, 30, 31],
        temperature_2m_min: [20, 21, 19, 20],
        precipitation_probability_max: [10, 5, 20, 15]
      }
    };
    return res.json({
      success: true,
      source: "fallback",
      data: baselineData
    });
  }
});
var handleAdminLogin = async (req, res) => {
  const { username, password, loginType, masterKey } = req.body;
  const clientIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "127.0.0.1";
  const userAgent = req.headers["user-agent"] || "Unknown Browser";
  const trimmedUser = String(username || "").trim().toLowerCase();
  const rateLimitId = `${clientIp}:${trimmedUser || "anon"}`;
  const rateCheck = db.checkRateLimit(rateLimitId);
  if (rateCheck.isLocked) {
    await db.appendAuditLog({
      action: "LOGIN_RATE_LIMIT_BLOCKED",
      actor: trimmedUser || "unknown",
      role: "unknown",
      module: "AUTH",
      status: "danger",
      result: "denied",
      details: `Request blocked: Rate limit lockout active for ${rateCheck.remainingSeconds} seconds.`,
      ipAddress: clientIp
    });
    res.status(429).json({
      success: false,
      isLocked: true,
      remainingSeconds: rateCheck.remainingSeconds,
      error: `Security lockout active. Too many failed login attempts. Please wait ${rateCheck.remainingSeconds} seconds.`
    });
    return;
  }
  if (!trimmedUser) {
    res.status(400).json({ success: false, error: "Username or email is required." });
    return;
  }
  const state = db.getState();
  const matchingAccount = state.adminAccounts.find(
    (a) => a.username.toLowerCase() === trimmedUser || a.email.toLowerCase() === trimmedUser
  );
  if (!matchingAccount) {
    const rateResult = db.recordFailedAttempt(rateLimitId);
    await db.appendAuditLog({
      action: "ADMIN_LOGIN_FAILED",
      actor: trimmedUser,
      role: "unknown",
      module: "AUTH",
      status: "warning",
      result: "denied",
      details: `Invalid login attempt: Account not found. Remaining attempts: ${rateResult.remainingAttempts}`,
      ipAddress: clientIp
    });
    res.status(401).json({
      success: false,
      error: "Invalid username or password.",
      remainingAttempts: rateResult.remainingAttempts,
      isLocked: rateResult.isLocked,
      lockoutSeconds: rateResult.remainingSeconds
    });
    return;
  }
  if (matchingAccount.status !== "active") {
    await db.appendAuditLog({
      action: "ADMIN_LOGIN_SUSPENDED",
      actor: matchingAccount.username,
      role: matchingAccount.role,
      module: "AUTH",
      status: "danger",
      result: "denied",
      details: `Access denied: Account @${matchingAccount.username} is suspended.`,
      ipAddress: clientIp
    });
    res.status(403).json({
      success: false,
      error: "This administrator account has been suspended by the Super Admin."
    });
    return;
  }
  let isAuthenticated = false;
  const isMasterKeyAttempt = loginType === "master_key" || masterKey && masterKey.trim().length > 0;
  if (isMasterKeyAttempt) {
    const enteredPin = String(masterKey || password || "").trim();
    const authoritativeRecoveryPin = state.securityConfig?.recoveryPin?.trim();
    if (!authoritativeRecoveryPin) {
      res.status(500).json({
        success: false,
        error: "Institutional recovery PIN is not configured on the server. Please contact system administrator."
      });
      return;
    }
    if (enteredPin === authoritativeRecoveryPin) {
      isAuthenticated = true;
    } else {
      const rateResult = db.recordFailedAttempt(rateLimitId);
      await db.appendAuditLog({
        action: "MASTER_KEY_LOGIN_FAILED",
        actor: matchingAccount.username,
        role: matchingAccount.role,
        module: "AUTH",
        status: "danger",
        result: "denied",
        details: `Invalid Master Key entered for account @${matchingAccount.username}. Remaining attempts: ${rateResult.remainingAttempts}`,
        ipAddress: clientIp
      });
      res.status(401).json({
        success: false,
        error: "Invalid Master Recovery Key.",
        remainingAttempts: rateResult.remainingAttempts,
        isLocked: rateResult.isLocked,
        lockoutSeconds: rateResult.remainingSeconds
      });
      return;
    }
  } else {
    const enteredPass = String(password || "");
    isAuthenticated = verifyPasswordBcrypt(enteredPass, matchingAccount.passwordHash);
    if (!isAuthenticated) {
      const rateResult = db.recordFailedAttempt(rateLimitId);
      await db.appendAuditLog({
        action: "ADMIN_LOGIN_FAILED",
        actor: matchingAccount.username,
        role: matchingAccount.role,
        module: "AUTH",
        status: "warning",
        result: "denied",
        details: `Incorrect password attempt for @${matchingAccount.username}. Remaining attempts: ${rateResult.remainingAttempts}`,
        ipAddress: clientIp
      });
      res.status(401).json({
        success: false,
        error: "Invalid username or password.",
        remainingAttempts: rateResult.remainingAttempts,
        isLocked: rateResult.isLocked,
        lockoutSeconds: rateResult.remainingSeconds
      });
      return;
    }
  }
  if (isAuthenticated) {
    db.recordSuccessfulAttempt(rateLimitId);
    const nowStr = (/* @__PURE__ */ new Date()).toLocaleDateString("en-CA") + " " + (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    let session;
    try {
      session = await db.createSession(matchingAccount, clientIp, userAgent);
    } catch (err) {
      console.error("[Authentication] Could not reserve role session:", err);
      res.status(503).json({
        success: false,
        error: "Unable to verify administrator session availability. Please try again."
      });
      return;
    }
    if (!session) {
      res.status(409).json({
        success: false,
        error: `A ${matchingAccount.role === "super_admin" ? "super administrator" : "administrator"} is already signed in. Log out that session before another account of this role can log in.`
      });
      return;
    }
    const updatedAccounts = state.adminAccounts.map(
      (a) => a.id === matchingAccount.id ? { ...a, lastLogin: nowStr } : a
    );
    try {
      await db.updateModule("adminAccounts", updatedAccounts, "System Auth", clientIp);
    } catch (err) {
      console.error("[Authentication] Could not persist successful login:", err);
      try {
        await db.destroySession(session.token);
      } catch (cleanupError) {
        console.error("[Authentication] Could not release reserved role session:", cleanupError);
      }
      res.status(503).json({
        success: false,
        error: "Unable to finish login right now. Please try again."
      });
      return;
    }
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("ishwari_session", session.token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: Math.max(0, session.expiresAt - Date.now())
    });
    await db.appendAuditLog({
      action: isMasterKeyAttempt ? "ADMIN_MASTER_KEY_LOGIN_SUCCESS" : "ADMIN_LOGIN_SUCCESS",
      actor: matchingAccount.username,
      role: matchingAccount.role,
      module: "AUTH",
      status: "success",
      result: "success",
      details: `Successful login as ${matchingAccount.role === "super_admin" ? "Super Admin" : "Admin"} (${matchingAccount.fullName}) via ${isMasterKeyAttempt ? "Master Key" : "password"}.`,
      ipAddress: clientIp
    });
    res.json({
      success: true,
      token: session.token,
      account: {
        id: matchingAccount.id,
        username: matchingAccount.username,
        fullName: matchingAccount.fullName,
        email: matchingAccount.email,
        role: matchingAccount.role,
        permissions: session.permissions,
        status: matchingAccount.status,
        lastLogin: nowStr
      },
      sessionExpiresAt: session.expiresAt
    });
  }
};
apiRouter.post("/auth/login", handleAdminLogin);
apiRouter.post("/login", handleAdminLogin);
apiRouter.get("/auth/me", async (req, res, next) => {
  const token = extractToken(req);
  let session;
  try {
    session = await db.validateSession(token);
  } catch (err) {
    next(err);
    return;
  }
  if (!session) {
    res.status(401).json({ authenticated: false, error: "Unauthorized: Session invalid or expired" });
    return;
  }
  const state = db.getState();
  const account = state.adminAccounts.find((a) => a.id === session.userId);
  if (!account || account.status !== "active") {
    await db.destroySession(token);
    res.status(401).json({ authenticated: false, reason: "Account deactivated or deleted" });
    return;
  }
  res.json({
    authenticated: true,
    account: {
      id: account.id,
      username: account.username,
      fullName: account.fullName,
      email: account.email,
      role: account.role,
      permissions: session.permissions,
      status: account.status,
      lastLogin: account.lastLogin
    },
    sessionExpiresAt: session.expiresAt
  });
});
apiRouter.post("/auth/refresh", async (req, res, next) => {
  const token = extractToken(req);
  let session;
  try {
    session = await db.refreshSession(token);
  } catch (err) {
    next(err);
    return;
  }
  if (!session) {
    res.status(401).json({ success: false, authenticated: false, error: "Session invalid or expired." });
    return;
  }
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("ishwari_session", session.token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: Math.max(0, session.expiresAt - Date.now())
  });
  res.json({
    success: true,
    authenticated: true,
    token: session.token,
    sessionExpiresAt: session.expiresAt
  });
});
apiRouter.post("/auth/logout", async (req, res, next) => {
  const token = extractToken(req);
  let session;
  try {
    session = await db.validateSession(token);
    await db.destroySession(token);
  } catch (err) {
    console.error("[Authentication] Could not release administrator session:", err);
    res.status(503).json({
      success: false,
      error: "Unable to complete logout. Please try again."
    });
    return;
  }
  const clientIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "127.0.0.1";
  if (session) {
    db.appendAuditLog({
      action: "ADMIN_LOGOUT",
      actor: session.username,
      role: session.role,
      module: "AUTH",
      status: "success",
      result: "success",
      details: `Administrative session terminated by @${session.username}.`,
      ipAddress: clientIp
    });
  }
  const isProduction = process.env.NODE_ENV === "production";
  res.clearCookie("ishwari_session", {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax"
  });
  res.json({ success: true, message: "Logged out successfully" });
});
apiRouter.post("/auth/change-password", requireAuth, async (req, res) => {
  const session = req.session;
  const { currentPassword, newPassword } = req.body;
  const clientIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "127.0.0.1";
  if (!currentPassword || !newPassword) {
    res.status(400).json({ success: false, error: "Current password and new password are required." });
    return;
  }
  if (typeof newPassword !== "string" || newPassword.length < 8) {
    res.status(400).json({ success: false, error: "New password must be at least 8 characters long." });
    return;
  }
  const state = db.getState();
  const accountIndex = state.adminAccounts.findIndex((a) => a.id === session.userId);
  if (accountIndex === -1) {
    res.status(404).json({ success: false, error: "Account not found." });
    return;
  }
  const account = state.adminAccounts[accountIndex];
  const isMatch = verifyPasswordBcrypt(currentPassword, account.passwordHash);
  if (!isMatch) {
    await db.appendAuditLog({
      action: "PASSWORD_CHANGE_FAILED",
      actor: session.username,
      role: session.role,
      module: "AUTH_ACCOUNT",
      status: "warning",
      result: "denied",
      details: `Password change failed: Incorrect current password for @${session.username}.`,
      ipAddress: clientIp
    });
    res.status(400).json({ success: false, error: "Incorrect current password." });
    return;
  }
  const newHash = hashPasswordBcrypt(newPassword);
  const updatedAccounts = [...state.adminAccounts];
  updatedAccounts[accountIndex] = {
    ...account,
    passwordHash: newHash
  };
  await db.updateModule("adminAccounts", updatedAccounts, `@${session.username}`, clientIp);
  await db.appendAuditLog({
    action: "ADMIN_PASSWORD_CHANGED",
    actor: session.username,
    role: session.role,
    module: "AUTH_ACCOUNT",
    status: "success",
    result: "success",
    details: `Password changed successfully for @${session.username}.`,
    ipAddress: clientIp
  });
  res.json({ success: true, message: "Password updated successfully." });
});
apiRouter.post("/cms/sync", requireAuth, async (req, res) => {
  const session = req.session;
  const { module, data, batch, actor } = req.body;
  const clientIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "127.0.0.1";
  const effectiveActor = actor || `@${session.username} (${session.role})`;
  try {
    if (batch && typeof batch === "object") {
      for (const moduleKey of Object.keys(batch)) {
        const check = db.checkPermission(session, moduleKey);
        if (!check.allowed) {
          await db.appendAuditLog({
            action: "RBAC_PERMISSION_DENIED",
            actor: session.username,
            role: session.role,
            module: moduleKey,
            status: "danger",
            result: "denied",
            details: `Unauthorized batch modification attempted on module [${moduleKey}]: ${check.reason}`,
            ipAddress: clientIp
          });
          res.status(403).json({
            success: false,
            error: `Permission denied for module [${moduleKey}]: ${check.reason}`
          });
          return;
        }
      }
      const result2 = await db.updateBatch(batch, effectiveActor, clientIp);
      res.json({ success: true, ...result2 });
      return;
    }
    if (!module || data === void 0) {
      res.status(400).json({ success: false, error: "Module name and data payload are required" });
      return;
    }
    const permCheck = db.checkPermission(session, module);
    if (!permCheck.allowed) {
      await db.appendAuditLog({
        action: "RBAC_PERMISSION_DENIED",
        actor: session.username,
        role: session.role,
        module,
        status: "danger",
        result: "denied",
        details: `Unauthorized update attempt on module [${module}]: ${permCheck.reason}`,
        ipAddress: clientIp
      });
      res.status(403).json({
        success: false,
        error: `Permission denied: ${permCheck.reason}`
      });
      return;
    }
    if (module === "documents" && Array.isArray(data)) {
      for (const item of data) {
        if (item.file_name && !item.file_name.toLowerCase().endsWith(".pdf")) {
          res.status(400).json({
            success: false,
            error: `Validation failed: File "${item.file_name}" is not a PDF. Only PDF documents are allowed.`
          });
          return;
        }
        if (item.file_size_kb && item.file_size_kb > 200) {
          res.status(400).json({
            success: false,
            error: `Validation failed: File "${item.file_name || "Document"}" size (${item.file_size_kb} KB) exceeds the maximum allowed limit of 200 KB.`
          });
          return;
        }
      }
    }
    if (module === "curriculumGuidelines" && Array.isArray(data)) {
      for (const item of data) {
        if (!item.title_en || !String(item.title_en).trim()) {
          res.status(400).json({
            success: false,
            error: "Validation failed: Curriculum guideline title is required."
          });
          return;
        }
        if (!item.subject || !String(item.subject).trim()) {
          res.status(400).json({
            success: false,
            error: `Validation failed: Subject is required for guideline "${item.title_en}".`
          });
          return;
        }
        if (!item.class_level || !String(item.class_level).trim()) {
          res.status(400).json({
            success: false,
            error: `Validation failed: Academic level / class is required for guideline "${item.title_en}".`
          });
          return;
        }
        if (item.status && item.status !== "published" && item.status !== "unpublished") {
          res.status(400).json({
            success: false,
            error: `Validation failed: Invalid status "${item.status}". Status must be "published" or "unpublished".`
          });
          return;
        }
        if (item.file_size_bytes && item.file_size_bytes > 10 * 1024 * 1024) {
          res.status(400).json({
            success: false,
            error: `Validation failed: Guideline "${item.title_en}" PDF size exceeds maximum allowed limit of 10 MB.`
          });
          return;
        }
      }
    }
    if (module === "vacancies" && Array.isArray(data)) {
      for (const item of data) {
        if (!item.title_en || !String(item.title_en).trim()) {
          res.status(400).json({
            success: false,
            error: "Validation failed: Vacancy job title is required."
          });
          return;
        }
        if (item.apply_now_enabled) {
          if (!item.application_url || !String(item.application_url).trim()) {
            res.status(400).json({
              success: false,
              error: `Validation failed: Apply Now cannot be enabled for "${item.title_en}" without a valid application destination URL.`
            });
            return;
          }
        }
        if (item.application_url && typeof item.application_url === "string") {
          const trimmedUrl = item.application_url.trim();
          if (trimmedUrl) {
            if (/^(javascript:|data:|vbscript:|file:|blob:)/i.test(trimmedUrl)) {
              res.status(400).json({
                success: false,
                error: `Validation failed: Unsafe protocol in application URL for "${item.title_en}".`
              });
              return;
            }
            if (item.application_method === "google_form") {
              const isGoogleForm = /^https:\/\/(forms\.gle\/[a-zA-Z0-9_-]+|docs\.google\.com\/forms\/[a-zA-Z0-9_\-\/]+)/i.test(trimmedUrl);
              if (!isGoogleForm) {
                res.status(400).json({
                  success: false,
                  error: `Validation failed: Application URL for "${item.title_en}" must be a valid Google Form URL (https://forms.gle/... or https://docs.google.com/forms/...).`
                });
                return;
              }
            } else if (!/^https?:\/\//i.test(trimmedUrl)) {
              res.status(400).json({
                success: false,
                error: `Validation failed: Application URL for "${item.title_en}" must start with https://`
              });
              return;
            }
          }
        }
      }
    }
    if (module === "aboutSections" && Array.isArray(data)) {
      for (const item of data) {
        if (item.image && typeof item.image === "string") {
          const trimmedImg = item.image.trim();
          if (/^(javascript:|data:(?!image\/(png|jpeg|jpg|gif|webp);base64)|vbscript:|file:|blob:)/i.test(trimmedImg)) {
            res.status(400).json({
              success: false,
              error: `Validation failed: Unsafe media protocol in section "${item.title_en || "About Section"}". Only HTTPS, HTTP, local uploaded media or safe image data are allowed.`
            });
            return;
          }
        }
      }
    }
    if (module === "school" && data && typeof data === "object") {
      const bgImg = data.history_bg_image;
      if (bgImg && typeof bgImg === "string") {
        const trimmed = bgImg.trim();
        if (/^(javascript:|data:(?!image\/(png|jpeg|jpg|gif|webp);base64)|vbscript:|file:|blob:)/i.test(trimmed)) {
          res.status(400).json({
            success: false,
            error: "Validation failed: Unsafe media protocol in School History background. Only HTTPS, HTTP, local uploaded media or safe image data are allowed."
          });
          return;
        }
      }
    }
    if (module === "siteConfig" && data && typeof data === "object") {
      const bgImg = data.historyBgImage;
      if (bgImg && typeof bgImg === "string") {
        const trimmed = bgImg.trim();
        if (/^(javascript:|data:(?!image\/(png|jpeg|jpg|gif|webp);base64)|vbscript:|file:|blob:)/i.test(trimmed)) {
          res.status(400).json({
            success: false,
            error: "Validation failed: Unsafe media protocol in School History background. Only HTTPS, HTTP, local uploaded media or safe image data are allowed."
          });
          return;
        }
      }
      const socialLinks = data.socialLinks;
      if (socialLinks !== void 0) {
        if (!Array.isArray(socialLinks)) {
          res.status(400).json({
            success: false,
            error: "Validation failed: Social links must be an array."
          });
          return;
        }
        for (const item of socialLinks) {
          if (!item || typeof item !== "object") continue;
          const url = typeof item.url === "string" ? item.url.trim() : "";
          if (url) {
            if (/^(javascript:|data:|vbscript:|file:|blob:)/i.test(url)) {
              res.status(400).json({
                success: false,
                error: `Validation failed: Unsafe URL scheme detected in social link for platform "${item.platform || "unknown"}". Executable or data protocols are strictly forbidden.`
              });
              return;
            }
            if (!/^https?:\/\//i.test(url)) {
              res.status(400).json({
                success: false,
                error: `Validation failed: Invalid URL in social link for platform "${item.platform || "unknown"}". URLs must start with https:// or http://.`
              });
              return;
            }
          }
        }
      }
      const usefulLinks = data.usefulLinks;
      if (usefulLinks !== void 0) {
        if (!Array.isArray(usefulLinks)) {
          res.status(400).json({
            success: false,
            error: "Validation failed: Useful links must be an array."
          });
          return;
        }
        for (const item of usefulLinks) {
          if (!item || typeof item !== "object") continue;
          const url = typeof item.url === "string" ? item.url.trim() : "";
          if (url) {
            if (/^(javascript:|data:|vbscript:|file:|blob:)/i.test(url)) {
              res.status(400).json({
                success: false,
                error: `Validation failed: Unsafe URL scheme detected in useful link "${item.titleEn || "unknown"}". Executable or data protocols are strictly forbidden.`
              });
              return;
            }
            if (!/^https?:\/\//i.test(url)) {
              res.status(400).json({
                success: false,
                error: `Validation failed: Invalid URL in useful link "${item.titleEn || "unknown"}". URLs must start with https:// or http://.`
              });
              return;
            }
          }
        }
      }
      const mapEmbed = data.footerMapEmbedUrl;
      if (mapEmbed && typeof mapEmbed === "string") {
        const trimmedMap = mapEmbed.trim();
        if (/^(javascript:|data:|vbscript:|file:|blob:)/i.test(trimmedMap)) {
          res.status(400).json({
            success: false,
            error: "Validation failed: Unsafe URL scheme detected in footer map embed URL."
          });
          return;
        }
      }
    }
    const result = await db.updateModule(module, data, effectiveActor, clientIp);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error("Error during CMS sync:", err);
    res.status(500).json({ success: false, error: err?.message || "Failed to update CMS database" });
  }
});
apiRouter.post("/cms/reset", requireAuth, async (req, res) => {
  const session = req.session;
  const clientIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "127.0.0.1";
  if (session.role !== "super_admin") {
    await db.appendAuditLog({
      action: "SECURITY_VIOLATION_ATTEMPT",
      actor: session.username,
      role: session.role,
      module: "SYSTEM",
      status: "danger",
      result: "denied",
      details: "Unauthorized attempt by standard admin to execute database factory reset.",
      ipAddress: clientIp
    });
    res.status(403).json({
      success: false,
      error: "Access denied. Database factory reset is restricted exclusively to the Super Administrator."
    });
    return;
  }
  try {
    const result = await db.resetToDefaults(`@${session.username} (Super Admin)`, clientIp);
    res.json({ success: true, ...result });
  } catch {
    res.status(500).json({ success: false, error: "Failed to reset database" });
  }
});
apiRouter.post("/contact/submit", async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !phone || !message) {
    res.status(400).json({ success: false, error: "Name, phone, and message are required fields" });
    return;
  }
  try {
    const newMsg = await db.addContactMessage({
      name: String(name).trim(),
      email: String(email || "").trim(),
      phone: String(phone).trim(),
      subject: String(subject || "general").trim(),
      message: String(message).trim()
    });
    res.json({ success: true, message: newMsg });
  } catch (err) {
    console.error("Failed to submit contact message:", err);
    res.status(500).json({ success: false, error: "Failed to record message in database" });
  }
});
apiRouter.post("/cms/upload", requireAuth, (req, res) => {
  const { fileName, fileType, base64Data, category } = req.body;
  if (!base64Data || !fileName) {
    res.status(400).json({ success: false, error: "Missing file data or file name" });
    return;
  }
  const commaIdx = base64Data.indexOf(",");
  const rawBase64 = commaIdx >= 0 ? base64Data.slice(commaIdx + 1) : base64Data;
  const buffer = Buffer.from(rawBase64, "base64");
  const sizeInBytes = buffer.length;
  if (category === "curriculum_guideline" || category === "curriculum") {
    if (!fileName.toLowerCase().endsWith(".pdf") && !fileType?.includes("pdf")) {
      res.status(400).json({ success: false, error: "Curriculum guidelines must be in PDF format only (.pdf)" });
      return;
    }
    if (sizeInBytes > 10 * 1024 * 1024) {
      res.status(400).json({ success: false, error: "Curriculum guideline PDF size exceeds maximum 10 MB threshold" });
      return;
    }
    const isPdf = buffer.length >= 5 && buffer.toString("utf8", 0, 5) === "%PDF-";
    if (!isPdf) {
      res.status(400).json({ success: false, error: "Invalid file signature. File is not a valid PDF document." });
      return;
    }
    const currUploadDir = getBackendUploadDir("curriculum");
    const safeBaseName = path.basename(fileName).replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueFileName = `curr-${Date.now()}-${crypto3.randomBytes(4).toString("hex")}-${safeBaseName}`;
    const filePath = path.join(currUploadDir, uniqueFileName);
    fs.writeFileSync(filePath, buffer);
    const formattedSize = sizeInBytes < 1024 * 1024 ? `${Math.round(sizeInBytes / 1024)} KB` : `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
    res.json({
      success: true,
      url: `/api/curriculum/file/${uniqueFileName}`,
      fileName,
      uniqueFileName,
      size: sizeInBytes,
      formattedSize,
      base64Data
    });
    return;
  } else if (category === "vacancy" || category === "career" || category === "vacancy_pdf") {
    if (!fileName.toLowerCase().endsWith(".pdf") && !fileType?.includes("pdf")) {
      res.status(400).json({ success: false, error: "Vacancy attachments must be in PDF format only (.pdf)" });
      return;
    }
    if (sizeInBytes > 10 * 1024 * 1024) {
      res.status(400).json({ success: false, error: "Vacancy PDF size exceeds maximum 10 MB threshold" });
      return;
    }
    const isPdf = buffer.length >= 5 && buffer.toString("utf8", 0, 5) === "%PDF-";
    if (!isPdf) {
      res.status(400).json({ success: false, error: "Invalid file signature. File is not a valid PDF document." });
      return;
    }
    const vacUploadDir = getBackendUploadDir("vacancies");
    const safeBaseName = path.basename(fileName).replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueFileName = `vac-${Date.now()}-${crypto3.randomBytes(4).toString("hex")}-${safeBaseName}`;
    const filePath = path.join(vacUploadDir, uniqueFileName);
    fs.writeFileSync(filePath, buffer);
    const formattedSize = sizeInBytes < 1024 * 1024 ? `${Math.round(sizeInBytes / 1024)} KB` : `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
    res.json({
      success: true,
      url: `/api/vacancy/file/${uniqueFileName}`,
      fileName,
      uniqueFileName,
      size: sizeInBytes,
      formattedSize,
      base64Data
    });
    return;
  } else if (category === "document") {
    if (!fileName.toLowerCase().endsWith(".pdf") && !fileType?.includes("pdf")) {
      res.status(400).json({ success: false, error: "Official documents must be PDF format only (.pdf)" });
      return;
    }
    if (sizeInBytes > 200 * 1024) {
      res.status(400).json({ success: false, error: "Document size exceeds maximum 200 KB threshold" });
      return;
    }
    const isPdf = buffer.length >= 5 && buffer.toString("utf8", 0, 5) === "%PDF-";
    if (!isPdf) {
      res.status(400).json({ success: false, error: "Invalid file signature. File is not a valid PDF document." });
      return;
    }
  } else if (category === "about_image" || category === "about") {
    const ext = path.extname(fileName).toLowerCase();
    if (![".png", ".jpg", ".jpeg", ".gif"].includes(ext)) {
      res.status(400).json({ success: false, error: "About page background media must be JPG, JPEG, PNG, or GIF format only." });
      return;
    }
    if (fileType && !["image/jpeg", "image/jpg", "image/png", "image/gif"].includes(fileType.toLowerCase())) {
      res.status(400).json({ success: false, error: "Invalid MIME type. Supported: image/jpeg, image/png, image/gif." });
      return;
    }
    if (sizeInBytes > 1024 * 1024) {
      res.status(400).json({
        success: false,
        error: `Media size exceeds the maximum allowed 1 MB limit (${(sizeInBytes / 1024).toFixed(0)} KB)`
      });
      return;
    }
    const isJpeg = buffer.length >= 3 && buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255;
    const isPng = buffer.length >= 4 && buffer[0] === 137 && buffer[1] === 80 && buffer[2] === 78 && buffer[3] === 71;
    const isGif = buffer.length >= 6 && (buffer.toString("ascii", 0, 6) === "GIF87a" || buffer.toString("ascii", 0, 6) === "GIF89a");
    if (!isJpeg && !isPng && !isGif) {
      res.status(400).json({
        success: false,
        error: "Invalid file signature. Binary integrity check failed for JPG/PNG/GIF."
      });
      return;
    }
    const mediaType = isGif ? "gif" : "image";
    const aboutUploadDir = getBackendUploadDir("about");
    const safeBaseName = path.basename(fileName).replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueFileName = `about-${Date.now()}-${crypto3.randomBytes(4).toString("hex")}-${safeBaseName}`;
    const filePath = path.join(aboutUploadDir, uniqueFileName);
    fs.writeFileSync(filePath, buffer);
    res.json({
      success: true,
      url: `/api/about/file/${uniqueFileName}`,
      fileName,
      uniqueFileName,
      size: sizeInBytes,
      mediaType,
      base64Data
    });
    return;
  } else if (category === "history_bg" || category === "history") {
    const ext = path.extname(fileName).toLowerCase();
    if (![".png", ".jpg", ".jpeg", ".gif"].includes(ext)) {
      res.status(400).json({ success: false, error: "Background image must be JPG, JPEG, PNG or GIF and must not exceed 2 MB." });
      return;
    }
    if (fileType && !["image/jpeg", "image/jpg", "image/png", "image/gif"].includes(fileType.toLowerCase())) {
      res.status(400).json({ success: false, error: "Background image must be JPG, JPEG, PNG or GIF and must not exceed 2 MB." });
      return;
    }
    if (sizeInBytes > 2 * 1024 * 1024) {
      res.status(400).json({
        success: false,
        error: "Background image must be JPG, JPEG, PNG or GIF and must not exceed 2 MB."
      });
      return;
    }
    const isJpeg = buffer.length >= 3 && buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255;
    const isPng = buffer.length >= 4 && buffer[0] === 137 && buffer[1] === 80 && buffer[2] === 78 && buffer[3] === 71;
    const isGif = buffer.length >= 6 && (buffer.toString("ascii", 0, 6) === "GIF87a" || buffer.toString("ascii", 0, 6) === "GIF89a");
    if (!isJpeg && !isPng && !isGif) {
      res.status(400).json({
        success: false,
        error: "Background image must be JPG, JPEG, PNG or GIF and must not exceed 2 MB."
      });
      return;
    }
    const mediaType = isGif ? "gif" : "image";
    const historyUploadDir = getBackendUploadDir("history");
    const safeBaseName = path.basename(fileName).replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueFileName = `history-${Date.now()}-${crypto3.randomBytes(4).toString("hex")}-${safeBaseName}`;
    const filePath = path.join(historyUploadDir, uniqueFileName);
    fs.writeFileSync(filePath, buffer);
    res.json({
      success: true,
      url: `/api/history/file/${uniqueFileName}`,
      fileName,
      uniqueFileName,
      size: sizeInBytes,
      mediaType,
      base64Data
    });
    return;
  } else {
    if (sizeInBytes > 5 * 1024 * 1024) {
      res.status(400).json({ success: false, error: "Image size exceeds maximum 5 MB limit" });
      return;
    }
    const isJpeg = buffer.length >= 3 && buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255;
    const isPng = buffer.length >= 4 && buffer[0] === 137 && buffer[1] === 80 && buffer[2] === 78 && buffer[3] === 71;
    const isWebp = buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP";
    const isGif = buffer.length >= 6 && (buffer.toString("ascii", 0, 6) === "GIF87a" || buffer.toString("ascii", 0, 6) === "GIF89a");
    if (!isJpeg && !isPng && !isWebp && !isGif) {
      res.status(400).json({ success: false, error: "Invalid image format. Supported formats: JPG, JPEG, PNG, WEBP, GIF." });
      return;
    }
  }
  res.json({
    success: true,
    url: base64Data,
    fileName,
    size: sizeInBytes
  });
});
apiRouter.get("/curriculum", async (req, res, next) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
  const token = extractToken(req);
  let session;
  try {
    session = await db.validateSession(token);
  } catch (err) {
    next(err);
    return;
  }
  const state = db.getState();
  let list = [...state.curriculumGuidelines || []];
  if (!session) {
    list = list.filter((item) => item.status === "published");
  } else if (req.query.status && req.query.status !== "all") {
    list = list.filter((item) => item.status === req.query.status);
  }
  if (req.query.q) {
    const q = String(req.query.q).toLowerCase().trim();
    list = list.filter(
      (item) => item.title_en?.toLowerCase().includes(q) || item.title_np?.toLowerCase().includes(q) || item.subject?.toLowerCase().includes(q) || item.class_level?.toLowerCase().includes(q) || item.description_en?.toLowerCase().includes(q) || item.description_np?.toLowerCase().includes(q) || item.original_filename?.toLowerCase().includes(q)
    );
  }
  if (req.query.class_level && req.query.class_level !== "all") {
    const targetClass = String(req.query.class_level).toLowerCase();
    list = list.filter(
      (item) => item.class_level?.toLowerCase() === targetClass || item.academic_level_id?.toLowerCase() === targetClass
    );
  }
  if (req.query.subject && req.query.subject !== "all") {
    const targetSubject = String(req.query.subject).toLowerCase();
    list = list.filter((item) => item.subject?.toLowerCase() === targetSubject);
  }
  list.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  res.json({
    success: true,
    count: list.length,
    data: list
  });
});
apiRouter.get("/curriculum/file/:filename", (req, res) => {
  const filename = path.basename(req.params.filename);
  if (!filename.match(/^[a-zA-Z0-9._-]+\.pdf$/i)) {
    res.status(400).json({ success: false, error: "Invalid file identifier" });
    return;
  }
  const filePath = resolveUploadFilePath("curriculum", filename);
  if (!filePath || !fs.existsSync(filePath)) {
    res.status(404).json({ success: false, error: "Curriculum PDF resource not found on server" });
    return;
  }
  const stat = fs.statSync(filePath);
  const download = req.query.download === "1" || req.query.download === "true";
  const originalName = req.query.name ? String(req.query.name) : filename;
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Length", stat.size);
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader(
    "Content-Disposition",
    `${download ? "attachment" : "inline"}; filename="${encodeURIComponent(originalName)}"`
  );
  res.setHeader("Cache-Control", "public, max-age=3600");
  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
});
apiRouter.get("/history", async (req, res, next) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
  const token = extractToken(req);
  let session;
  try {
    session = await db.validateSession(token);
  } catch (err) {
    next(err);
    return;
  }
  const state = db.getState();
  let list = [...state.history || []];
  if (!session) {
    list = list.filter((item) => item.status !== "unpublished" && item.is_enabled !== false);
  }
  list.sort((a, b) => {
    const orderA = a.display_order !== void 0 ? a.display_order : 999;
    const orderB = b.display_order !== void 0 ? b.display_order : 999;
    return orderA - orderB;
  });
  res.json({
    success: true,
    count: list.length,
    data: list
  });
});
apiRouter.get("/about/file/:filename", (req, res) => {
  const filename = path.basename(req.params.filename);
  if (!filename.match(/^[a-zA-Z0-9._-]+\.(jpg|jpeg|png|gif)$/i)) {
    res.status(400).json({ success: false, error: "Invalid file identifier" });
    return;
  }
  const filePath = resolveUploadFilePath("about", filename);
  if (!filePath || !fs.existsSync(filePath)) {
    res.status(404).json({ success: false, error: "About media resource not found" });
    return;
  }
  const ext = path.extname(filename).toLowerCase();
  const mimeType = ext === ".gif" ? "image/gif" : ext === ".png" ? "image/png" : "image/jpeg";
  res.setHeader("Content-Type", mimeType);
  res.setHeader("Cache-Control", "public, max-age=86400, immutable");
  res.sendFile(filePath);
});
apiRouter.delete("/about/file/:filename", requireAuth, (req, res) => {
  const filename = path.basename(req.params.filename);
  if (!filename.match(/^[a-zA-Z0-9._-]+\.(jpg|jpeg|png|gif)$/i)) {
    res.status(400).json({ success: false, error: "Invalid file identifier" });
    return;
  }
  const filePath = resolveUploadFilePath("about", filename);
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      res.json({ success: true, message: "Media file deleted successfully" });
      return;
    } catch (e) {
      res.status(500).json({ success: false, error: "Failed to delete file" });
      return;
    }
  }
  res.json({ success: true, message: "File does not exist or already removed" });
});
apiRouter.get("/history/file/:filename", (req, res) => {
  const filename = path.basename(req.params.filename);
  if (!filename.match(/^[a-zA-Z0-9._-]+\.(jpg|jpeg|png|gif)$/i)) {
    res.status(400).json({ success: false, error: "Invalid file identifier" });
    return;
  }
  const filePath = resolveUploadFilePath("history", filename);
  if (!filePath || !fs.existsSync(filePath)) {
    res.status(404).json({ success: false, error: "History media resource not found" });
    return;
  }
  const ext = path.extname(filename).toLowerCase();
  const mimeType = ext === ".gif" ? "image/gif" : ext === ".png" ? "image/png" : "image/jpeg";
  res.setHeader("Content-Type", mimeType);
  res.setHeader("Cache-Control", "public, max-age=86400, immutable");
  res.sendFile(filePath);
});
apiRouter.delete("/history/file/:filename", requireAuth, (req, res) => {
  const filename = path.basename(req.params.filename);
  if (!filename.match(/^[a-zA-Z0-9._-]+\.(jpg|jpeg|png|gif)$/i)) {
    res.status(400).json({ success: false, error: "Invalid file identifier" });
    return;
  }
  const filePath = resolveUploadFilePath("history", filename);
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      res.json({ success: true, message: "History media file deleted successfully" });
      return;
    } catch (e) {
      res.status(500).json({ success: false, error: "Failed to delete file" });
      return;
    }
  }
  res.json({ success: true, message: "File does not exist or already removed" });
});
apiRouter.get("/vacancy/file/:filename", (req, res) => {
  const filename = path.basename(req.params.filename);
  if (!filename.match(/^[a-zA-Z0-9._-]+\.pdf$/i)) {
    res.status(400).json({ success: false, error: "Invalid file identifier" });
    return;
  }
  const filePath = resolveUploadFilePath("vacancies", filename);
  if (!filePath || !fs.existsSync(filePath)) {
    res.status(404).json({ success: false, error: "Vacancy document not found" });
    return;
  }
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.sendFile(filePath);
});
apiRouter.delete("/vacancy/file/:filename", requireAuth, (req, res) => {
  const filename = path.basename(req.params.filename);
  if (!filename.match(/^[a-zA-Z0-9._-]+\.pdf$/i)) {
    res.status(400).json({ success: false, error: "Invalid file identifier" });
    return;
  }
  const filePath = resolveUploadFilePath("vacancies", filename);
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      res.json({ success: true, message: "Vacancy PDF deleted successfully" });
      return;
    } catch (e) {
      res.status(500).json({ success: false, error: "Failed to delete file" });
      return;
    }
  }
  res.json({ success: true, message: "File does not exist or already removed" });
});

// backend/app.ts
function createApp() {
  const app2 = express2();
  const corsOptions = {
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }
      const allowedOriginsEnv = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim().replace(/\/+$/, "")) : [];
      const isAllowedExplicit = allowedOriginsEnv.includes(origin);
      const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:[0-9]+)?$/.test(origin);
      const isAllowedDomain = origin.endsWith(".vercel.app") || origin.endsWith(".onrender.com") || origin.endsWith(".run.app") || origin.endsWith(".googleusercontent.com");
      if (isAllowedExplicit || isLocalhost || isAllowedDomain) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS policy`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Cache-Control", "x-cms-client-version"],
    exposedHeaders: ["Content-Disposition", "Content-Length", "X-Total-Count"],
    optionsSuccessStatus: 204
  };
  app2.use(cors(corsOptions));
  app2.options("*", cors(corsOptions));
  app2.use((req, res, next) => {
    const incomingReqId = req.headers["x-request-id"];
    const requestId = typeof incomingReqId === "string" && incomingReqId.length > 0 && incomingReqId.length <= 64 ? incomingReqId : "req_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 7);
    req.requestId = requestId;
    res.setHeader("X-Request-Id", requestId);
    res.setHeader("X-Content-Type-Options", "nosniff");
    const isCloudPreview = !!process.env.AIS_APPLET_ID || !process.env.NODE_ENV || process.env.NODE_ENV === "development";
    if (!isCloudPreview) {
      res.setHeader("X-Frame-Options", "SAMEORIGIN");
    }
    res.setHeader("X-XSS-Protection", "1; mode=block");
    const startTime = Date.now();
    res.on("finish", () => {
      if (res.statusCode >= 400) {
        const durationMs = Date.now() - startTime;
        const sanitizedRoute = req.baseUrl + (req.path || req.url);
        const authCategory = res.statusCode === 401 ? "AUTHENTICATION_REQUIRED" : res.statusCode === 403 ? "AUTHORIZATION_DENIED" : res.statusCode === 429 ? "RATE_LIMITED" : void 0;
        console.warn("[Diagnostic API Log]", JSON.stringify({
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          requestId,
          method: req.method,
          route: sanitizedRoute,
          status: res.statusCode,
          durationMs,
          ...authCategory ? { authCategory } : {}
        }));
      }
    });
    next();
  });
  app2.use(cookieParser());
  app2.use(express2.json({ limit: "25mb" }));
  app2.use(express2.urlencoded({ extended: true, limit: "25mb" }));
  app2.get("/healthz", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app2.post(["/login", "/auth/login", "/admin/login"], handleAdminLogin);
  app2.post(["/admin", "/superadmin"], (req, res, next) => {
    if (req.body && req.body.username) {
      return handleAdminLogin(req, res);
    }
    res.redirect(303, "/admin");
  });
  app2.use("/api", apiRouter);
  app2.use("/auth", apiRouter);
  app2.use("/api", (req, res) => {
    const msg = `API endpoint not found: ${req.method} ${req.originalUrl}`;
    res.status(404).json({
      success: false,
      message: msg,
      error: msg,
      errorDetails: {
        code: "API_ENDPOINT_NOT_FOUND",
        message: msg
      }
    });
  });
  app2.use("/api", (err, req, res, next) => {
    const requestId = req.requestId || req.headers["x-request-id"] || "req_err";
    const statusCode = typeof err?.status === "number" && err.status >= 400 && err.status <= 599 ? err.status : 500;
    const errorCode = err?.code || (statusCode === 404 ? "NOT_FOUND" : statusCode === 401 ? "UNAUTHORIZED" : statusCode === 403 ? "FORBIDDEN" : "INTERNAL_SERVER_ERROR");
    const errorMessage = err?.message || "An unexpected internal error occurred on the API server.";
    const dbCategory = err?.name === "FirebaseError" || err?.code?.startsWith?.("auth/") || err?.code?.startsWith?.("firestore/") ? "FIRESTORE_DATABASE_ERROR" : err?.code === "ECONNREFUSED" || err?.code === "ETIMEDOUT" ? "DATABASE_NETWORK_ERROR" : void 0;
    console.error("[Diagnostic Server Error]", JSON.stringify({
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      requestId,
      method: req.method,
      route: req.baseUrl + (req.path || req.url),
      status: statusCode,
      errorCode,
      ...dbCategory ? { databaseErrorCategory: dbCategory } : {},
      message: errorMessage
    }));
    res.status(statusCode).json({
      success: false,
      requestId,
      message: errorMessage,
      error: errorMessage,
      errorDetails: {
        code: errorCode,
        message: errorMessage
      }
    });
  });
  app2.use((err, req, res, next) => {
    const statusCode = typeof err?.status === "number" && err.status >= 400 && err.status <= 599 ? err.status : 500;
    const errMsg = err?.message || "Internal Server Error";
    if (statusCode >= 500) {
      console.error("[Unhandled Server Error]", {
        method: req.method,
        url: req.originalUrl,
        status: statusCode,
        message: err?.message,
        stack: err?.stack
      });
    }
    res.status(statusCode).json({
      success: false,
      message: errMsg,
      error: errMsg,
      errorDetails: {
        code: err?.code || "INTERNAL_SERVER_ERROR",
        message: errMsg
      }
    });
  });
  return app2;
}

// backend/vercelHandler.ts
var app = createApp();
function handler(req, res) {
  try {
    const forwardedUri = req.headers?.["x-forwarded-uri"] || req.headers?.["x-original-uri"];
    if (forwardedUri && typeof forwardedUri === "string" && forwardedUri.startsWith("/api")) {
      req.url = forwardedUri;
    } else if (req.url === "/api/index" || req.url === "/api/[...slug]" || req.url?.startsWith("/api/index?") || req.url?.startsWith("/api/[...slug]?")) {
      const slug = req.query?.slug || req.query?.["1"] || req.query?.["0"];
      if (slug) {
        const slugPath = Array.isArray(slug) ? slug.join("/") : String(slug);
        const cleanSlug = slugPath.replace(/^\/+/, "");
        const queryIdx = req.url.indexOf("?");
        const queryStr = queryIdx >= 0 ? req.url.slice(queryIdx) : "";
        req.url = `/api/${cleanSlug}${queryStr}`;
      }
    }
  } catch (err) {
    console.warn("[Vercel Handler] Error normalizing request URL:", err);
  }
  return app(req, res);
}
export {
  handler as default
};
